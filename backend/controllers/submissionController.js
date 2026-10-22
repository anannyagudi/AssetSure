const Submission = require('../models/Submission');
const OCRResult = require('../models/OCRResult');
const VerificationResult = require('../models/VerificationResult');
const Asset = require('../models/Asset');
const Loan = require('../models/Loan');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const { extractTextFromImage, parseInvoiceFields, compareSerialNumbers } = require('../services/ocrService');
const { verifyLocation } = require('../services/locationService');
const { analyzeImage } = require('../services/machineVerificationService');
const { calculateRiskScore } = require('../services/riskEngine');
const { v4: uuidv4 } = require('uuid');

// @desc Create a new submission (borrower)
const createSubmission = async (req, res) => {
    try {
        const { loanId, submittedLatitude, submittedLongitude, submissionType } = req.body;
        if (!loanId || submittedLatitude === undefined || submittedLongitude === undefined) {
            return res.status(400).json({ error: 'Loan ID and GPS coordinates are required' });
        }

        const loan = await Loan.findById(loanId);
        if (!loan) return res.status(404).json({ error: 'Loan not found' });
        if (loan.borrower.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const asset = await Asset.findOne({ loan: loanId });
        if (!asset) return res.status(404).json({ error: 'No asset registered for this loan' });

        // Upload files
        let invoiceUrl = null, invoicePublicId = null;
        let machinePhotoUrls = [];
        let serialPhotoUrl = null;

        if (req.files?.invoice?.[0]) {
            const result = await uploadToCloudinary(req.files.invoice[0].buffer, 'loan-verification/invoices');
            invoiceUrl = result.url;
            invoicePublicId = result.public_id;
        }
        if (req.files?.machinePhotos) {
            for (const file of req.files.machinePhotos) {
                const result = await uploadToCloudinary(file.buffer, 'loan-verification/machines');
                machinePhotoUrls.push(result.url);
            }
        }
        if (req.files?.serialPhoto?.[0]) {
            const result = await uploadToCloudinary(req.files.serialPhoto[0].buffer, 'loan-verification/serials');
            serialPhotoUrl = result.url;
        }

        const submission = await Submission.create({
            submissionId: 'SUB-' + uuidv4().split('-')[0].toUpperCase(),
            loan: loanId,
            borrower: req.user._id,
            submissionType: submissionType || 'Initial Verification',
            invoiceUrl, invoicePublicId,
            machinePhotoUrls,
            serialPhotoUrl,
            submittedLatitude: parseFloat(submittedLatitude),
            submittedLongitude: parseFloat(submittedLongitude),
            submittedTimestamp: new Date(),
            status: 'Pending'
        });

        // Run OCR on invoice
        let ocrResult = null;
        if (invoiceUrl) {
            const { text, confidence } = await extractTextFromImage(invoiceUrl);
            const parsed = parseInvoiceFields(text);
            ocrResult = await OCRResult.create({
                submission: submission._id,
                invoiceExtractedText: text,
                ...parsed,
                confidence
            });
        }

        // Run Serial OCR
        let serialOcrResult = null;
        let serialMatch = false;
        if (serialPhotoUrl) {
            const { text: serialText, confidence: serialConf } = await extractTextFromImage(serialPhotoUrl);
            const serialComparison = compareSerialNumbers(asset.serialNumber, serialText);
            serialMatch = serialComparison.match;
            if (!ocrResult) {
                ocrResult = await OCRResult.create({
                    submission: submission._id,
                    invoiceExtractedText: '',
                    extractedSerialNumber: serialText,
                    confidence: serialConf
                });
            } else {
                await OCRResult.findByIdAndUpdate(ocrResult._id, {
                    extractedSerialNumber: serialText
                });
                if (!ocrResult.extractedSerialNumber) {
                    ocrResult.extractedSerialNumber = serialText;
                }
            }
        }

        // GPS verification
        const locationResult = verifyLocation(
            parseFloat(submittedLatitude), parseFloat(submittedLongitude),
            asset.registeredLatitude, asset.registeredLongitude,
            asset.expectedLocationRadius
        );

        // Machine image analysis
        let machineImageMatchResult = { match: false, confidence: 0, reasons: [] };
        if (machinePhotoUrls.length > 0) {
            machineImageMatchResult = await analyzeImage({
                imageUrl: machinePhotoUrls[0],
                expectedMachineType: asset.machineType,
                expectedManufacturer: asset.manufacturer
            });
        }

        // Invoice consistency check
        let invoiceMatch = false;
        if (ocrResult) {
            const normSerial = (s) => (s || '').toLowerCase().replace(/[\s\-_\.]/g, '');
            invoiceMatch = (
                normSerial(ocrResult.extractedSerialNumber) === normSerial(asset.serialNumber) ||
                (ocrResult.extractedManufacturer || '').toLowerCase().includes((asset.manufacturer || '').toLowerCase()) ||
                (ocrResult.extractedModel || '').toLowerCase().includes((asset.model || '').toLowerCase())
            );
        }

        // Calculate risk
        const { riskScore, riskLevel, riskFactors, positiveChecks } = calculateRiskScore({
            serialMatch,
            gpsVerified: locationResult.verified,
            gpsDistance: locationResult.distance,
            allowedRadius: asset.expectedLocationRadius,
            invoiceMatch,
            machineImageMatchResult,
            ocrConfidence: ocrResult?.confidence,
            hasInvoice: !!invoiceUrl,
            hasMachinePhotos: machinePhotoUrls.length > 0,
            hasSerialPhoto: !!serialPhotoUrl,
            hasLatLon: true
        });

        // Create verification result
        const verResult = await VerificationResult.create({
            submission: submission._id,
            invoiceMatch,
            serialMatch,
            machineImageMatch: {
                match: machineImageMatchResult.match,
                confidence: machineImageMatchResult.confidence
            },
            gpsVerified: locationResult.verified,
            distanceFromRegisteredLocation: locationResult.distance,
            riskScore, riskLevel,
            riskFactors: [...riskFactors, ...(machineImageMatchResult.reasons || [])],
            verificationStatus: 'Pending'
        });

        // Update loan status
        await Loan.findByIdAndUpdate(loanId, { loanStatus: 'Under Verification' });

        res.status(201).json({
            submission,
            ocrResult,
            locationResult,
            machineImageMatchResult,
            verificationResult: verResult,
            riskScore,
            riskLevel,
            riskFactors
        });
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ error: 'Submission failed: ' + error.message });
    }
};

// @desc Get all submissions (officer) or own submissions (borrower)
const getSubmissions = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'borrower') query.borrower = req.user._id;
        const submissions = await Submission.find(query)
            .populate('loan', 'loanId loanAmount')
            .populate('borrower', 'name email')
            .sort({ createdAt: -1 });
        res.json(submissions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
};

// @desc Get single submission with all related data
const getSubmissionById = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate('loan')
            .populate('borrower', 'name email phone');
        if (!submission) return res.status(404).json({ error: 'Submission not found' });
        if (req.user.role === 'borrower' && submission.borrower._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const ocr = await OCRResult.findOne({ submission: submission._id });
        const verification = await VerificationResult.findOne({ submission: submission._id }).populate('verifiedBy', 'name');
        const asset = await Asset.findOne({ loan: submission.loan._id });

        res.json({ submission, ocr, verification, asset });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch submission' });
    }
};

module.exports = { createSubmission, getSubmissions, getSubmissionById };
