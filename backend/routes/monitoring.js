const express = require('express');
const router = express.Router();
const { createMonitoringRequest, getMonitoringRequests, submitMonitoringResponse } = require('../controllers/monitoringController');
const { protect, officerOnly, borrowerOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

const monitoringUpload = upload.fields([
    { name: 'machinePhotos', maxCount: 10 },
    { name: 'serialPhoto', maxCount: 1 }
]);

router.post('/request', protect, officerOnly, createMonitoringRequest);
router.get('/requests', protect, getMonitoringRequests);
router.post('/:id/submit', protect, borrowerOnly, monitoringUpload, submitMonitoringResponse);

module.exports = router;
