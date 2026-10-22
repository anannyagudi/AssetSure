const Asset = require('../models/Asset');
const Loan = require('../models/Loan');
const { v4: uuidv4 } = require('uuid');

// @desc Create asset (officer only)
const createAsset = async (req, res) => {
    try {
        const {
            loanId, borrowerId, machineName, machineType, manufacturer, model,
            serialNumber, purchasePrice, dealerName, registeredLatitude, registeredLongitude,
            registeredAddress, expectedLocationRadius, purchaseDate
        } = req.body;

        if (!loanId || !borrowerId || !machineName || !serialNumber) {
            return res.status(400).json({ error: 'Missing required asset fields' });
        }
        const loan = await Loan.findById(loanId);
        if (!loan) return res.status(404).json({ error: 'Loan not found' });

        const asset = await Asset.create({
            assetId: 'AST-' + uuidv4().split('-')[0].toUpperCase(),
            loan: loanId,
            borrower: borrowerId,
            machineName, machineType, manufacturer, model, serialNumber,
            purchasePrice, dealerName,
            registeredLatitude: parseFloat(registeredLatitude),
            registeredLongitude: parseFloat(registeredLongitude),
            registeredAddress,
            expectedLocationRadius: parseFloat(expectedLocationRadius) || 2,
            purchaseDate: new Date(purchaseDate),
            assetStatus: 'Registered'
        });
        res.status(201).json(asset);
    } catch (error) {
        console.error('Create asset error:', error);
        res.status(500).json({ error: 'Failed to create asset' });
    }
};

// @desc Get all assets (officer) or own assets (borrower)
const getAssets = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'borrower') query.borrower = req.user._id;
        const assets = await Asset.find(query).populate('loan', 'loanId loanAmount loanStatus').populate('borrower', 'name email').sort({ createdAt: -1 });
        res.json(assets);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch assets' });
    }
};

// @desc Get single asset
const getAssetById = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id).populate('loan', 'loanId loanAmount loanStatus purpose').populate('borrower', 'name email phone');
        if (!asset) return res.status(404).json({ error: 'Asset not found' });
        if (req.user.role === 'borrower' && asset.borrower._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Access denied' });
        }
        res.json(asset);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch asset' });
    }
};

// @desc Update asset registered location (officer only)
const updateAssetLocation = async (req, res) => {
    try {
        const { registeredLatitude, registeredLongitude, registeredAddress, expectedLocationRadius } = req.body;
        const asset = await Asset.findByIdAndUpdate(req.params.id, {
            registeredLatitude: parseFloat(registeredLatitude),
            registeredLongitude: parseFloat(registeredLongitude),
            registeredAddress,
            expectedLocationRadius: parseFloat(expectedLocationRadius) || 2
        }, { new: true });
        if (!asset) return res.status(404).json({ error: 'Asset not found' });
        res.json(asset);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update asset location' });
    }
};

module.exports = { createAsset, getAssets, getAssetById, updateAssetLocation };
