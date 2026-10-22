const express = require('express');
const router = express.Router();
const { createLoan, getLoans, getLoanById, updateLoanStatus } = require('../controllers/loanController');
const { protect, officerOnly } = require('../middleware/auth');

router.get('/', protect, getLoans);
router.get('/:id', protect, getLoanById);
router.post('/', protect, officerOnly, createLoan);
router.put('/:id/status', protect, officerOnly, updateLoanStatus);

module.exports = router;
