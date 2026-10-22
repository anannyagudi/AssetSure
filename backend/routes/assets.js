const express = require('express');
const router = express.Router();
const { createAsset, getAssets, getAssetById, updateAssetLocation } = require('../controllers/assetController');
const { protect, officerOnly } = require('../middleware/auth');

router.get('/', protect, getAssets);
router.get('/:id', protect, getAssetById);
router.post('/', protect, officerOnly, createAsset);
router.put('/:id/location', protect, officerOnly, updateAssetLocation);

module.exports = router;
