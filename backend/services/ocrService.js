const Tesseract = require('tesseract.js');

/**
 * Extract text from an image URL using Tesseract OCR
 * @param {string} imageUrl - URL of the image to process
 * @returns {Promise<{text: string, confidence: number}>}
 */
const extractTextFromImage = async (imageUrl) => {
    try {
        const { data: { text, confidence } } = await Tesseract.recognize(imageUrl, 'eng', {
            logger: () => {} // suppress progress logs
        });
        return { text: text.trim(), confidence: Math.round(confidence) };
    } catch (error) {
        console.error('OCR Error:', error);
        return { text: '', confidence: 0 };
    }
};

/**
 * Parse invoice OCR text and extract key fields
 * @param {string} text - Raw OCR text
 * @returns {object} Extracted invoice fields
 */
const parseInvoiceFields = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const fullText = text.toLowerCase();

    const extract = (patterns) => {
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) return match[1]?.trim() || '';
        }
        return '';
    };

    return {
        extractedMachineName: extract([
            /machine\s*(?:name|model|type)?\s*[:\-]?\s*([A-Za-z0-9 \-\/]+)/i,
            /item\s*(?:description|name)?\s*[:\-]?\s*([A-Za-z0-9 \-\/]+)/i
        ]),
        extractedManufacturer: extract([
            /manufacturer\s*[:\-]?\s*([A-Za-z0-9 \-]+)/i,
            /make\s*[:\-]?\s*([A-Za-z0-9 \-]+)/i,
            /brand\s*[:\-]?\s*([A-Za-z0-9 \-]+)/i
        ]),
        extractedModel: extract([
            /model\s*(?:no|number|#)?\s*[:\-]?\s*([A-Za-z0-9 \-\/]+)/i
        ]),
        extractedSerialNumber: extract([
            /serial\s*(?:no|number|#)?\s*[:\-]?\s*([A-Za-z0-9\-\.]+)/i,
            /s\/n\s*[:\-]?\s*([A-Za-z0-9\-\.]+)/i,
            /sr\.?\s*no\.?\s*[:\-]?\s*([A-Za-z0-9\-\.]+)/i
        ]),
        extractedPurchasePrice: extract([
            /(?:total|amount|price)\s*[:\-\₹\$]?\s*([\d,\.]+)/i,
            /(?:rs\.?|inr|₹)\s*([\d,\.]+)/i
        ]),
        extractedDealerName: extract([
            /(?:dealer|sold\s*by|vendor|supplier|from)\s*[:\-]?\s*([A-Za-z0-9 &\.,]+)/i
        ])
    };
};

/**
 * Normalize serial number string for comparison
 * @param {string} serial
 * @returns {string}
 */
const normalizeSerial = (serial) => {
    if (!serial) return '';
    return serial.toLowerCase().replace(/[\s\-_\.]/g, '').trim();
};

/**
 * Compare registered serial number with OCR-extracted serial number
 * @param {string} registered
 * @param {string} extracted
 * @returns {{ match: boolean, registered: string, extracted: string, normalizedRegistered: string, normalizedExtracted: string }}
 */
const compareSerialNumbers = (registered, extracted) => {
    const normReg = normalizeSerial(registered);
    const normExt = normalizeSerial(extracted);
    return {
        match: normReg === normExt && normReg !== '',
        registered,
        extracted,
        normalizedRegistered: normReg,
        normalizedExtracted: normExt
    };
};

module.exports = { extractTextFromImage, parseInvoiceFields, compareSerialNumbers, normalizeSerial };
