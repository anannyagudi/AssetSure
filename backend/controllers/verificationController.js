const VerificationResult = require('../models/VerificationResult');
const Submission = require('../models/Submission');
const Loan = require('../models/Loan');
const Asset = require('../models/Asset');

// @desc Get all verification results (officer) or own (borrower)
const getVerifications = async (req, res) => {
    try {
        let submissions;
        if (req.user.role === 'bank_officer') {
            submissions = await Submission.find({}).select('_id').lean();
        } else {
            submissions = await Submission.find({ borrower: req.user._id }).select('_id').lean();
        }
        const submissionIds = submissions.map(s => s._id);
        const verifications = await VerificationResult.find({ submission: { $in: submissionIds } })
            .populate({
                path: 'submission',
                populate: [
                    { path: 'borrower', select: 'name email phone' },
                    { path: 'loan', select: 'loanId loanAmount loanStatus' }
                ]
            })
            .populate('verifiedBy', 'name')
            .sort({ createdAt: -1 });
        res.json(verifications);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch verifications' });
    }
};

// @desc Get single verification
const getVerificationById = async (req, res) => {
    try {
        const verification = await VerificationResult.findById(req.params.id)
            .populate({
                path: 'submission',
                populate: [
                    { path: 'borrower', select: 'name email phone' },
                    { path: 'loan', select: 'loanId loanAmount loanStatus purpose tenure interestRate' }
                ]
            })
            .populate('verifiedBy', 'name');
        if (!verification) return res.status(404).json({ error: 'Verification not found' });

        const asset = await Asset.findOne({ loan: verification.submission.loan._id });
        const OCRResult = require('../models/OCRResult');
        const ocr = await OCRResult.findOne({ submission: verification.submission._id });

        res.json({ verification, asset, ocr });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch verification' });
    }
};

// @desc Officer approves a verification
const approveVerification = async (req, res) => {
    try {
        const { remarks } = req.body;
        const verification = await VerificationResult.findByIdAndUpdate(req.params.id, {
            verificationStatus: 'Verified',
            officerDecision: 'Approved',
            officerRemarks: remarks || '',
            verifiedBy: req.user._id,
            verifiedAt: new Date()
        }, { new: true });
        if (!verification) return res.status(404).json({ error: 'Verification not found' });

        // Update submission status and loan status
        await Submission.findByIdAndUpdate(verification.submission, { status: 'Verified' });
        const submission = await Submission.findById(verification.submission);
        if (submission) await Loan.findByIdAndUpdate(submission.loan, { loanStatus: 'Verified' });
        await Asset.findOneAndUpdate({ loan: submission?.loan }, { assetStatus: 'Verified' });

        res.json({ message: 'Verification approved', verification });
    } catch (error) {
        res.status(500).json({ error: 'Failed to approve verification' });
    }
};

// @desc Officer flags a verification
const flagVerification = async (req, res) => {
    try {
        const { remarks } = req.body;
        const verification = await VerificationResult.findByIdAndUpdate(req.params.id, {
            verificationStatus: 'Flagged',
            officerDecision: 'Flagged',
            officerRemarks: remarks || '',
            verifiedBy: req.user._id,
            verifiedAt: new Date()
        }, { new: true });
        if (!verification) return res.status(404).json({ error: 'Verification not found' });

        await Submission.findByIdAndUpdate(verification.submission, { status: 'Flagged' });
        const submission = await Submission.findById(verification.submission);
        if (submission) await Loan.findByIdAndUpdate(submission.loan, { loanStatus: 'Flagged' });

        res.json({ message: 'Verification flagged', verification });
    } catch (error) {
        res.status(500).json({ error: 'Failed to flag verification' });
    }
};

// @desc Officer requests additional evidence
const requestEvidence = async (req, res) => {
    try {
        const { remarks } = req.body;
        const verification = await VerificationResult.findByIdAndUpdate(req.params.id, {
            verificationStatus: 'Additional Evidence Required',
            officerDecision: 'Additional Evidence Required',
            officerRemarks: remarks || '',
            verifiedBy: req.user._id,
            verifiedAt: new Date()
        }, { new: true });
        if (!verification) return res.status(404).json({ error: 'Verification not found' });
        await Submission.findByIdAndUpdate(verification.submission, { status: 'Additional Evidence Required' });
        res.json({ message: 'Evidence requested', verification });
    } catch (error) {
        res.status(500).json({ error: 'Failed to request evidence' });
    }
};

module.exports = { getVerifications, getVerificationById, approveVerification, flagVerification, requestEvidence };
