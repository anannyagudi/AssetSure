const express = require('express');
const router = express.Router();
const { getVerifications, getVerificationById, approveVerification, flagVerification, requestEvidence } = require('../controllers/verificationController');
const { protect, officerOnly } = require('../middleware/auth');

router.get('/', protect, getVerifications);
router.get('/:id', protect, getVerificationById);
router.put('/:id/approve', protect, officerOnly, approveVerification);
router.put('/:id/flag', protect, officerOnly, flagVerification);
router.put('/:id/request-evidence', protect, officerOnly, requestEvidence);

module.exports = router;
