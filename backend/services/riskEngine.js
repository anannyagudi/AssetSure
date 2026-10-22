/**
 * Risk Scoring Engine
 *
 * Deterministic, explainable risk scoring system.
 * Each factor has a configurable weight.
 * Final score is clamped between 0 and 100.
 */

// --- Risk Factor Weights (configurable) ---
const RISK_WEIGHTS = {
    SERIAL_MISMATCH: 30,
    GPS_OUTSIDE_RADIUS: 25,
    GPS_MAJOR_DISCREPANCY: 15,  // Additional if distance > 50km
    INVOICE_INCONSISTENCY: 20,
    MACHINE_IMAGE_REVIEW_REQUIRED: 15,
    OCR_LOW_CONFIDENCE: 10,
    MISSING_REQUIRED_EVIDENCE: 15,
    REPEATED_MONITORING_DISCREPANCY: 10,
};

// Risk level thresholds
const RISK_LEVELS = {
    LOW: { min: 0, max: 29, label: 'LOW' },
    MEDIUM: { min: 30, max: 59, label: 'MEDIUM' },
    HIGH: { min: 60, max: 100, label: 'HIGH' }
};

/**
 * Calculate risk score from verification factors
 * @param {object} params
 * @returns {{ riskScore: number, riskLevel: string, riskFactors: string[], positiveChecks: string[] }}
 */
const calculateRiskScore = ({
    serialMatch,
    gpsVerified,
    gpsDistance,
    allowedRadius,
    invoiceMatch,
    machineImageMatchResult,   // { match: bool, confidence: number }
    ocrConfidence,             // 0-100
    hasInvoice,
    hasMachinePhotos,
    hasSerialPhoto,
    hasLatLon,
    previousDiscrepancyCount = 0
}) => {
    let score = 0;
    const riskFactors = [];
    const positiveChecks = [];

    // Serial number mismatch
    if (!serialMatch) {
        score += RISK_WEIGHTS.SERIAL_MISMATCH;
        riskFactors.push('Serial number mismatch (+' + RISK_WEIGHTS.SERIAL_MISMATCH + ')');
    } else {
        positiveChecks.push('Serial number matched');
    }

    // GPS outside radius
    if (!gpsVerified && hasLatLon) {
        score += RISK_WEIGHTS.GPS_OUTSIDE_RADIUS;
        riskFactors.push('GPS outside allowed radius (+' + RISK_WEIGHTS.GPS_OUTSIDE_RADIUS + ')');
        // Additional penalty for major discrepancy
        if (gpsDistance > 50) {
            score += RISK_WEIGHTS.GPS_MAJOR_DISCREPANCY;
            riskFactors.push('Major GPS discrepancy (>' + gpsDistance.toFixed(0) + 'km) (+' + RISK_WEIGHTS.GPS_MAJOR_DISCREPANCY + ')');
        }
    } else if (gpsVerified) {
        positiveChecks.push('GPS location verified within allowed radius');
    }

    // Invoice inconsistency
    if (!invoiceMatch && hasInvoice) {
        score += RISK_WEIGHTS.INVOICE_INCONSISTENCY;
        riskFactors.push('Invoice details inconsistency (+' + RISK_WEIGHTS.INVOICE_INCONSISTENCY + ')');
    } else if (invoiceMatch) {
        positiveChecks.push('Invoice information consistent');
    }

    // Machine image review required
    if (machineImageMatchResult && !machineImageMatchResult.match) {
        if (machineImageMatchResult.confidence < 70) {
            score += RISK_WEIGHTS.MACHINE_IMAGE_REVIEW_REQUIRED;
            riskFactors.push('Machine image requires review (+' + RISK_WEIGHTS.MACHINE_IMAGE_REVIEW_REQUIRED + ')');
        }
    } else if (machineImageMatchResult && machineImageMatchResult.match) {
        positiveChecks.push('Machine image verification passed');
    }

    // Low OCR confidence
    if (ocrConfidence !== undefined && ocrConfidence < 50) {
        score += RISK_WEIGHTS.OCR_LOW_CONFIDENCE;
        riskFactors.push('Low OCR confidence (+' + RISK_WEIGHTS.OCR_LOW_CONFIDENCE + ')');
    }

    // Missing required evidence
    if (!hasInvoice || !hasMachinePhotos || !hasSerialPhoto || !hasLatLon) {
        score += RISK_WEIGHTS.MISSING_REQUIRED_EVIDENCE;
        const missing = [];
        if (!hasInvoice) missing.push('invoice');
        if (!hasMachinePhotos) missing.push('machine photos');
        if (!hasSerialPhoto) missing.push('serial photo');
        if (!hasLatLon) missing.push('GPS');
        riskFactors.push('Missing evidence: ' + missing.join(', ') + ' (+' + RISK_WEIGHTS.MISSING_REQUIRED_EVIDENCE + ')');
    } else {
        positiveChecks.push('All required evidence submitted');
    }

    // Repeated monitoring discrepancies
    if (previousDiscrepancyCount > 0) {
        const penaltyMultiplier = Math.min(previousDiscrepancyCount, 2);
        const penalty = RISK_WEIGHTS.REPEATED_MONITORING_DISCREPANCY * penaltyMultiplier;
        score += penalty;
        riskFactors.push('Repeated monitoring discrepancies (+' + penalty + ')');
    }

    // Clamp score
    score = Math.min(100, Math.max(0, score));

    // Determine risk level
    let riskLevel;
    if (score <= RISK_LEVELS.LOW.max) riskLevel = 'LOW';
    else if (score <= RISK_LEVELS.MEDIUM.max) riskLevel = 'MEDIUM';
    else riskLevel = 'HIGH';

    return { riskScore: score, riskLevel, riskFactors, positiveChecks };
};

module.exports = { calculateRiskScore, RISK_WEIGHTS, RISK_LEVELS };
