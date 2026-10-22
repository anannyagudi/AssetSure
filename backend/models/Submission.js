const mongoose = require('mongoose');

const submissionSchema = mongoose.Schema({
    submissionId: { type: String, required: true, unique: true },
    loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submissionType: { type: String, enum: ['Initial Verification', 'Monitoring'], required: true },
    invoiceUrl: { type: String },
    invoicePublicId: { type: String },
    machinePhotoUrls: [{ type: String }],
    serialPhotoUrl: { type: String },
    submittedLatitude: { type: Number, required: true },
    submittedLongitude: { type: Number, required: true },
    submittedTimestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['Pending', 'Under Review', 'Verified', 'Flagged', 'Additional Evidence Required'], default: 'Pending' }
}, {
    timestamps: true
});

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;
