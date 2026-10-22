const mongoose = require('mongoose');

const assetSchema = mongoose.Schema({
    assetId: { type: String, required: true, unique: true },
    loan: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    machineName: { type: String, required: true },
    machineType: { type: String, required: true },
    manufacturer: { type: String, required: true },
    model: { type: String, required: true },
    serialNumber: { type: String, required: true },
    purchasePrice: { type: Number, required: true },
    dealerName: { type: String, required: true },
    registeredLatitude: { type: Number, required: true },
    registeredLongitude: { type: Number, required: true },
    registeredAddress: { type: String, required: true },
    expectedLocationRadius: { type: Number, required: true, default: 2 }, // in km
    purchaseDate: { type: Date, required: true },
    assetStatus: { type: String, enum: ['Registered', 'Verified', 'Flagged'], default: 'Registered' }
}, {
    timestamps: true
});

const Asset = mongoose.model('Asset', assetSchema);
module.exports = Asset;
