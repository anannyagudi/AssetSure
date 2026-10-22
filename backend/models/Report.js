const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
    reportId: { type: String, required: true, unique: true },
    loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    reportType: { type: String, enum: ['Initial Verification Report', 'Monitoring Report'], required: true },
    verificationResult: { type: mongoose.Schema.Types.ObjectId, ref: 'VerificationResult' },
    pdfUrl: { type: String },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    generatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
