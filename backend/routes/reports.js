const express = require('express');
const router = express.Router();
const { generateReport, getReports } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, generateReport);
router.get('/', protect, getReports);

module.exports = router;
