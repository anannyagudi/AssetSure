const MonitoringRequest = require('../models/MonitoringRequest');
const Submission = require('../models/Submission');
const VerificationResult = require('../models/VerificationResult');
const OCRResult = require('../models/OCRResult');
const Asset = require('../models/Asset');
const Loan = require('../models/Loan');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const { extractTextFromImage, compareSerialNumbers } = require('../services/ocrService');
const { verifyLocation } = require('../services/locationService');
const { analyzeImage } = require('../services/machineVerificationService');
const { calculateRiskScore } = require('../services/riskEngine');
const { v4: uuidv4 } = require('uuid');

// @desc Officer creates a monitoring request
const createMonitoringRequest = async (req, res) => {
    try {
        const { loanId, borrowerId, assetId, requestReason, dueDate, requestedEvidence } = req.body;
        if (!loanId || !borrowerId || !assetId || !requestReason || !dueDate) {
            return res.status(400).json({ error: 'All fields required' });
        }
        const monReq = await MonitoringRequest.create({
            requestId: 'MON-' + uuidv4().split('-')[0].toUpperCase(),
            loan: loanId,
            borrower: borrowerId,
            asset: assetId,
            requestedBy: req.user._id,
            requestReason,
            dueDate: new Date(dueDate),
            requestedEvidence: requestedEvidence || [],
            status: 'Pending'
        });
        res.status(201).json(monReq);
    } catch (error) {
        console.error('Monitoring request error:', error);
        res.status(500).json({ error: 'Failed to create monitoring request' });
    }
};

// @desc Get monitoring requests (officer all, borrower own)
const getMonitoringRequests = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'borrower') query.borrower = req.user._id;
        const requests = await MonitoringRequest.find(query)
            .populate('loan', 'loanId')
            .populate('borrower', 'name email')
            .populate('asset', 'machineName manufacturer model')
            .populate('requestedBy', 'name')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch monitoring requests' });
    }
};

// @desc Borrower submits a monitoring response
const submitMonitoringResponse = async (req, res) => {
    try {
        const monReq = await MonitoringRequest.findById(req.params.id);
        if (!monReq) return res.status(404).json({ error: 'Monitoring request not found' });
        if (monReq.borrower.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const { submittedLatitude, submittedLongitude } = req.body;
        if (submittedLatitude === undefined || submittedLongitude === undefined) {
            return res.status(400).json({ error: 'GPS coordinates required' });
        }

        const asset = await Asset.findById(monReq.asset);
        if (!asset) return res.status(404).json({ error: 'Asset not found' });

        // Upload files
        let machinePhotoUrls = [];
        let serialPhotoUrl = null;
        if (req.files?.machinePhotos) {
            for (const file of req.files.machinePhotos) {
                const result = await uploadToCloudinary(file.buffer, 'loan-verification/monitoring');
                machinePhotoUrls.push(result.url);
            }
        }
        if (req.files?.serialPhoto?.[0]) {
            const result = await uploadToCloudinary(req.files.serialPhoto[0].buffer, 'loan-verification/serials');
            serialPhotoUrl = result.url;
        }

        // Create submission
        const submission = await Submission.create({
            submissionId: 'SUB-' + uuidv4().split('-')[0].toUpperCase(),
            loan: monReq.loan,
            borrower: req.user._id,
            submissionType: 'Monitoring',
            machinePhotoUrls,
            serialPhotoUrl,
            submittedLatitude: parseFloat(submittedLatitude),
            submittedLongitude: parseFloat(submittedLongitude),
            submittedTimestamp: new Date(),
            status: 'Pending'
        });

        // OCR on serial photo
        let serialMatch = false;
        let ocrResult = null;
        if (serialPhotoUrl) {
            const { text, confidence } = await extractTextFromImage(serialPhotoUrl);
            const comparison = compareSerialNumbers(asset.serialNumber, text);
            serialMatch = comparison.match;
            ocrResult = await OCRResult.create({
                submission: submission._id,
                invoiceExtractedText: '',
                extractedSerialNumber: text,
                confidence
            });
        }

        // GPS
        const locationResult = verifyLocation(
            parseFloat(submittedLatitude), parseFloat(submittedLongitude),
            asset.registeredLatitude, asset.registeredLongitude,
            asset.expectedLocationRadius
        );

        // Machine image
        let machineImageMatchResult = { match: true, confidence: 75, reasons: [] };
        if (machinePhotoUrls.length > 0) {
            machineImageMatchResult = await analyzeImage({
                imageUrl: machinePhotoUrls[0],
                expectedMachineType: asset.machineType,
                expectedManufacturer: asset.manufacturer
            });
        }

        // Get previous discrepancy count (from past verifications)
        const prevVerifications = await VerificationResult.find({
            submission: { $in: await Submission.find({ loan: monReq.loan }).select('_id') }
        });
        const previousDiscrepancyCount = prevVerifications.filter(v => !v.gpsVerified || !v.serialMatch).length;

        const { riskScore, riskLevel, riskFactors } = calculateRiskScore({
            serialMatch,
            gpsVerified: locationResult.verified,
            gpsDistance: locationResult.distance,
            allowedRadius: asset.expectedLocationRadius,
            invoiceMatch: true, // no invoice for monitoring
            machineImageMatchResult,
            hasInvoice: true,
            hasMachinePhotos: machinePhotoUrls.length > 0,
            hasSerialPhoto: !!serialPhotoUrl,
            hasLatLon: true,
            previousDiscrepancyCount
        });

        const verResult = await VerificationResult.create({
            submission: submission._id,
            invoiceMatch: true,
            serialMatch,
            machineImageMatch: { match: machineImageMatchResult.match, confidence: machineImageMatchResult.confidence },
            gpsVerified: locationResult.verified,
            distanceFromRegisteredLocation: locationResult.distance,
            riskScore, riskLevel,
            riskFactors: [...riskFactors, ...(machineImageMatchResult.reasons || [])],
            verificationStatus: 'Pending'
        });

        await MonitoringRequest.findByIdAndUpdate(req.params.id, {
            status: 'Submitted',
            completedAt: new Date()
        });

        res.json({ submission, ocrResult, locationResult, machineImageMatchResult, verificationResult: verResult });
    } catch (error) {
        console.error('Monitoring submit error:', error);
        res.status(500).json({ error: 'Failed to submit monitoring response: ' + error.message });
    }
};

module.exports = { createMonitoringRequest, getMonitoringRequests, submitMonitoringResponse };
