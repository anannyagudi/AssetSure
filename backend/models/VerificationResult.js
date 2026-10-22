const mongoose = require('mongoose');

const verificationResultSchema = mongoose.Schema({
    submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
    invoiceMatch: { type: Boolean, default: false },
    serialMatch: { type: Boolean, default: false },
    machineImageMatch: { 
        match: { type: Boolean, default: false },
        confidence: { type: Number, default: 0 }
    },
    gpsVerified: { type: Boolean, default: false },
    distanceFromRegisteredLocation: { type: Number, default: 0 }, // in km
    riskScore: { type: Number, default: 0, min: 0, max: 100 },
    riskLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], required: true },
    riskFactors: [{ type: String }],
    verificationStatus: { type: String, enum: ['Pending', 'Under Review', 'Verified', 'Flagged', 'Additional Evidence Required'], default: 'Pending' },
    officerDecision: { type: String },
    officerRemarks: { type: String },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date }
}, {
    timestamps: true
});

const VerificationResult = mongoose.model('VerificationResult', verificationResultSchema);
module.exports = VerificationResult;
