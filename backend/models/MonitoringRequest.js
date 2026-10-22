const mongoose = require('mongoose');

const monitoringRequestSchema = mongoose.Schema({
    requestId: { type: String, required: true, unique: true },
    loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    asset: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestReason: { type: String, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['Pending', 'Submitted', 'Reviewed', 'Overdue'], default: 'Pending' },
    requestedEvidence: [{ type: String }], // e.g. ['Machine Photo', 'GPS', 'Serial Photo']
    completedAt: { type: Date }
}, {
    timestamps: true
});

const MonitoringRequest = mongoose.model('MonitoringRequest', monitoringRequestSchema);
module.exports = MonitoringRequest;
