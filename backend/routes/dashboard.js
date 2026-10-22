const express = require('express');
const router = express.Router();
const { getOfficerDashboard, getBorrowerDashboard, getHighRiskCases, getAllBorrowers } = require('../controllers/dashboardController');
const { protect, officerOnly } = require('../middleware/auth');

router.get('/officer', protect, officerOnly, getOfficerDashboard);
router.get('/borrower', protect, getBorrowerDashboard);
router.get('/high-risk', protect, officerOnly, getHighRiskCases);
router.get('/borrowers', protect, officerOnly, getAllBorrowers);

module.exports = router;
