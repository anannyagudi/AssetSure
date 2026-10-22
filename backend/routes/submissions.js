const express = require('express');
const router = express.Router();
const { createSubmission, getSubmissions, getSubmissionById } = require('../controllers/submissionController');
const { protect, borrowerOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

const submissionUpload = upload.fields([
    { name: 'invoice', maxCount: 1 },
    { name: 'machinePhotos', maxCount: 10 },
    { name: 'serialPhoto', maxCount: 1 }
]);

router.post('/', protect, borrowerOnly, submissionUpload, createSubmission);
router.get('/', protect, getSubmissions);
router.get('/:id', protect, getSubmissionById);

module.exports = router;
