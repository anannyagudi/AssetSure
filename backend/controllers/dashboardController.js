const User = require('../models/User');
const Loan = require('../models/Loan');
const Asset = require('../models/Asset');
const Submission = require('../models/Submission');
const VerificationResult = require('../models/VerificationResult');
const MonitoringRequest = require('../models/MonitoringRequest');

// @desc Get bank officer dashboard stats
const getOfficerDashboard = async (req, res) => {
    try {
        const [
            totalBorrowers,
            totalLoans,
            activeLoans,
            pendingVerifications,
            verifiedCases,
            flaggedCases,
            highRiskCases,
            pendingMonitoring,
            machinesUnderMonitoring
        ] = await Promise.all([
            User.countDocuments({ role: 'borrower' }),
            Loan.countDocuments(),
            Loan.countDocuments({ loanStatus: 'Active' }),
            VerificationResult.countDocuments({ verificationStatus: 'Pending' }),
            VerificationResult.countDocuments({ verificationStatus: 'Verified' }),
            VerificationResult.countDocuments({ verificationStatus: 'Flagged' }),
            VerificationResult.countDocuments({ riskLevel: 'HIGH' }),
            MonitoringRequest.countDocuments({ status: 'Pending' }),
            MonitoringRequest.countDocuments({ status: { $in: ['Pending', 'Submitted'] } })
        ]);

        // Risk distribution
        const riskDistribution = await VerificationResult.aggregate([
            { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
        ]);

        // Verification status distribution
        const statusDistribution = await VerificationResult.aggregate([
            { $group: { _id: '$verificationStatus', count: { $sum: 1 } } }
        ]);

        // Monthly verification activity (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const monthlyActivity = await VerificationResult.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            { $group: {
                _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
                count: { $sum: 1 }
            }},
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({
            stats: {
                totalBorrowers,
                totalLoans,
                activeLoans,
                pendingVerifications,
                verifiedCases,
                flaggedCases,
                highRiskCases,
                pendingMonitoring,
                machinesUnderMonitoring
            },
            riskDistribution,
            statusDistribution,
            monthlyActivity
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard data' });
    }
};

// @desc Get borrower dashboard summary
const getBorrowerDashboard = async (req, res) => {
    try {
        const loan = await Loan.findOne({ borrower: req.user._id }).sort({ createdAt: -1 });
        const asset = loan ? await Asset.findOne({ loan: loan._id }) : null;
        const submissions = loan ? await Submission.find({ borrower: req.user._id }).sort({ createdAt: -1 }) : [];
        const submissionIds = submissions.map(s => s._id);
        const latestVerification = submissionIds.length > 0
            ? await VerificationResult.findOne({ submission: { $in: submissionIds } }).sort({ createdAt: -1 })
            : null;
        const pendingMonitoring = await MonitoringRequest.countDocuments({ borrower: req.user._id, status: 'Pending' });

        res.json({
            loan,
            asset,
            latestVerification,
            submissionCount: submissions.length,
            pendingMonitoring
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load dashboard data' });
    }
};

// @desc Get all high-risk cases (officer)
const getHighRiskCases = async (req, res) => {
    try {
        const highRisk = await VerificationResult.find({ riskLevel: 'HIGH' })
            .populate({
                path: 'submission',
                populate: [
                    { path: 'borrower', select: 'name email phone' },
                    { path: 'loan', select: 'loanId loanAmount loanStatus' }
                ]
            })
            .sort({ riskScore: -1 });
        res.json(highRisk);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch high risk cases' });
    }
};

// @desc Get all borrowers (officer)
const getAllBorrowers = async (req, res) => {
    try {
        const borrowers = await User.find({ role: 'borrower' }).select('-passwordHash').sort({ createdAt: -1 });
        const borrowersWithLoans = await Promise.all(
            borrowers.map(async (b) => {
                const loan = await Loan.findOne({ borrower: b._id });
                return { ...b.toObject(), loan };
            })
        );
        res.json(borrowersWithLoans);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch borrowers' });
    }
};

module.exports = { getOfficerDashboard, getBorrowerDashboard, getHighRiskCases, getAllBorrowers };
