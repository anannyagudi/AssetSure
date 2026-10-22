const Report = require('../models/Report');
const VerificationResult = require('../models/VerificationResult');
const Submission = require('../models/Submission');
const OCRResult = require('../models/OCRResult');
const Asset = require('../models/Asset');
const Loan = require('../models/Loan');
const User = require('../models/User');
const { generateVerificationReport, generateMonitoringReport } = require('../services/reportService');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const { v4: uuidv4 } = require('uuid');

// @desc Generate and download a PDF report
const generateReport = async (req, res) => {
    try {
        const { verificationId, reportType } = req.body;
        if (!verificationId) return res.status(400).json({ error: 'verificationId required' });

        const verification = await VerificationResult.findById(verificationId).populate('verifiedBy', 'name');
        if (!verification) return res.status(404).json({ error: 'Verification not found' });

        const submission = await Submission.findById(verification.submission);
        const loan = await Loan.findById(submission.loan);
        const borrower = await User.findById(submission.borrower).select('-passwordHash');
        const asset = await Asset.findOne({ loan: submission.loan });
        const ocr = await OCRResult.findOne({ submission: submission._id });

        const reportId = 'RPT-' + uuidv4().split('-')[0].toUpperCase();

        let pdfBuffer;
        const type = reportType || (submission.submissionType === 'Monitoring' ? 'Monitoring Report' : 'Initial Verification Report');

        if (type === 'Monitoring Report') {
            // Get previous verification for comparison
            const prevSubmissions = await Submission.find({ loan: loan._id, _id: { $ne: submission._id } }).sort({ createdAt: -1 }).limit(1);
            let prevVerification = null;
            if (prevSubmissions.length > 0) {
                prevVerification = await VerificationResult.findOne({ submission: prevSubmissions[0]._id });
            }
            pdfBuffer = await generateMonitoringReport({
                borrower, loan, asset,
                previousVerification: prevVerification,
                currentVerification: { ...verification.toObject(), submission },
                monitoringRequest: null,
                report: { reportId }
            });
        } else {
            pdfBuffer = await generateVerificationReport({
                borrower, loan, asset, ocr,
                verification: { ...verification.toObject(), submission },
                report: { reportId }
            });
        }

        // Upload PDF to Cloudinary
        let pdfUrl = null;
        try {
            const cloudResult = await uploadToCloudinary(pdfBuffer, 'loan-verification/reports', 'raw');
            pdfUrl = cloudResult.url;
        } catch (uploadErr) {
            console.warn('Could not upload PDF to Cloudinary:', uploadErr.message);
        }

        // Save report metadata
        const report = await Report.create({
            reportId,
            loan: loan._id,
            borrower: borrower._id,
            asset: asset._id,
            reportType: type,
            verificationResult: verification._id,
            pdfUrl,
            generatedBy: req.user._id,
            generatedAt: new Date()
        });

        // Stream PDF to client
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${reportId}.pdf"`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Report generation error:', error);
        res.status(500).json({ error: 'Failed to generate report: ' + error.message });
    }
};

// @desc Get all reports
const getReports = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'borrower') query.borrower = req.user._id;
        const reports = await Report.find(query)
            .populate('loan', 'loanId')
            .populate('borrower', 'name email')
            .populate('asset', 'machineName')
            .populate('generatedBy', 'name')
            .sort({ generatedAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
};

module.exports = { generateReport, getReports };
