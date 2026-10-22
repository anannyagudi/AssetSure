const mongoose = require('mongoose');

const loanSchema = mongoose.Schema({
    loanId: { type: String, required: true, unique: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    loanAmount: { type: Number, required: true },
    loanType: { type: String, required: true },
    applicationDate: { type: Date, default: Date.now },
    approvalDate: { type: Date },
    loanStatus: { type: String, enum: ['Pending', 'Active', 'Under Verification', 'Verified', 'Flagged', 'Closed'], default: 'Pending' },
    tenure: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    purpose: { type: String, required: true }
}, {
    timestamps: true
});

const Loan = mongoose.model('Loan', loanSchema);
module.exports = Loan;
