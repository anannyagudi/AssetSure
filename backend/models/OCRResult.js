const mongoose = require('mongoose');

const ocrResultSchema = mongoose.Schema({
    submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true },
    invoiceExtractedText: { type: String },
    extractedMachineName: { type: String },
    extractedManufacturer: { type: String },
    extractedModel: { type: String },
    extractedSerialNumber: { type: String },
    extractedPurchasePrice: { type: String },
    extractedDealerName: { type: String },
    confidence: { type: Number, default: 0 }
}, {
    timestamps: true
});

const OCRResult = mongoose.model('OCRResult', ocrResultSchema);
module.exports = OCRResult;
