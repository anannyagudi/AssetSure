const Loan = require('../models/Loan');
const Asset = require('../models/Asset');
const User = require('../models/User');
const Submission = require('../models/Submission');
const VerificationResult = require('../models/VerificationResult');
const { v4: uuidv4 } = require('uuid');

// @desc Create loan (officer only)
const createLoan = async (req, res) => {
    try {
        const { borrowerId, loanAmount, loanType, tenure, interestRate, purpose, approvalDate } = req.body;
        if (!borrowerId || !loanAmount || !loanType || !tenure || !interestRate || !purpose) {
            return res.status(400).json({ error: 'Please provide all required loan fields' });
        }
        const borrower = await User.findById(borrowerId);
        if (!borrower || borrower.role !== 'borrower') {
            return res.status(400).json({ error: 'Invalid borrower ID' });
        }
        const loan = await Loan.create({
            loanId: 'LN-' + uuidv4().split('-')[0].toUpperCase(),
            borrower: borrowerId,
            loanAmount,
            loanType,
            tenure,
            interestRate,
            purpose,
            applicationDate: new Date(),
            approvalDate: approvalDate || new Date(),
            loanStatus: 'Active'
        });
        res.status(201).json(loan);
    } catch (error) {
        console.error('Create loan error:', error);
        res.status(500).json({ error: 'Failed to create loan' });
    }
};

// @desc Get all loans (officer) or own loan (borrower)
const getLoans = async (req, res) => {
    try {
        let loans;
        if (req.user.role === 'bank_officer') {
            loans = await Loan.find({}).populate('borrower', 'name email phone').sort({ createdAt: -1 });
        } else {
            loans = await Loan.find({ borrower: req.user._id }).populate('borrower', 'name email phone').sort({ createdAt: -1 });
        }
        res.json(loans);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch loans' });
    }
};

// @desc Get single loan
const getLoanById = async (req, res) => {
    try {
        const loan = await Loan.findById(req.params.id).populate('borrower', 'name email phone');
        if (!loan) return res.status(404).json({ error: 'Loan not found' });
        // Borrowers can only see their own loans
        if (req.user.role === 'borrower' && loan.borrower._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json(loan);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch loan' });
    }
};

// @desc Update loan status
const updateLoanStatus = async (req, res) => {
    try {
        const loan = await Loan.findByIdAndUpdate(req.params.id, { loanStatus: req.body.loanStatus }, { new: true });
        if (!loan) return res.status(404).json({ error: 'Loan not found' });
        res.json(loan);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update loan' });
    }
};

module.exports = { createLoan, getLoans, getLoanById, updateLoanStatus };
