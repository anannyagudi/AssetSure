const PDFDocument = require('pdfkit');

/**
 * Generate Initial Verification PDF Report
 * @param {object} data - All verification data
 * @returns {Buffer} PDF buffer
 */
const generateVerificationReport = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            const { borrower, loan, asset, ocr, verification, report } = data;

            // Header
            doc.fontSize(20).font('Helvetica-Bold')
                .text('AI Loan Utilization Verification System', { align: 'center' });
            doc.fontSize(14).font('Helvetica')
                .text('Initial Verification Report', { align: 'center' });
            doc.moveDown();
            addLine(doc);

            // Report Metadata
            doc.fontSize(10).font('Helvetica-Bold').text('Report ID: ', { continued: true })
                .font('Helvetica').text(report.reportId || 'N/A');
            doc.font('Helvetica-Bold').text('Generated At: ', { continued: true })
                .font('Helvetica').text(new Date().toLocaleString());
            doc.moveDown();

            // Borrower Info
            section(doc, 'Borrower Information');
            row(doc, 'Name', borrower.name);
            row(doc, 'Email', borrower.email);
            row(doc, 'Phone', borrower.phone);
            doc.moveDown();

            // Loan Info
            section(doc, 'Loan Details');
            row(doc, 'Loan ID', loan.loanId);
            row(doc, 'Amount', `₹${loan.loanAmount?.toLocaleString()}`);
            row(doc, 'Purpose', loan.purpose);
            row(doc, 'Status', loan.loanStatus);
            row(doc, 'Tenure', `${loan.tenure} months`);
            row(doc, 'Interest Rate', `${loan.interestRate}%`);
            doc.moveDown();

            // Machine Info
            section(doc, 'Machine / Asset Details');
            row(doc, 'Machine Name', asset.machineName);
            row(doc, 'Manufacturer', asset.manufacturer);
            row(doc, 'Model', asset.model);
            row(doc, 'Serial Number', asset.serialNumber);
            row(doc, 'Purchase Price', `₹${asset.purchasePrice?.toLocaleString()}`);
            row(doc, 'Dealer', asset.dealerName);
            row(doc, 'Purchase Date', asset.purchaseDate ? new Date(asset.purchaseDate).toDateString() : 'N/A');
            row(doc, 'Registered Address', asset.registeredAddress);
            row(doc, 'Registered Lat/Lon', `${asset.registeredLatitude}, ${asset.registeredLongitude}`);
            doc.moveDown();

            // OCR Results
            section(doc, 'OCR Extracted Information (AI-Assisted)');
            row(doc, 'Extracted Machine Name', ocr?.extractedMachineName || 'N/A');
            row(doc, 'Extracted Manufacturer', ocr?.extractedManufacturer || 'N/A');
            row(doc, 'Extracted Model', ocr?.extractedModel || 'N/A');
            row(doc, 'Extracted Serial No.', ocr?.extractedSerialNumber || 'N/A');
            row(doc, 'Extracted Price', ocr?.extractedPurchasePrice || 'N/A');
            row(doc, 'Extracted Dealer', ocr?.extractedDealerName || 'N/A');
            row(doc, 'OCR Confidence', `${ocr?.confidence || 0}%`);
            doc.moveDown();

            // GPS Verification
            section(doc, 'GPS Location Verification');
            row(doc, 'Submitted Lat/Lon', `${verification.submission?.submittedLatitude}, ${verification.submission?.submittedLongitude}`);
            row(doc, 'Distance from Registered', `${verification.distanceFromRegisteredLocation?.toFixed(2)} km`);
            row(doc, 'Allowed Radius', `${asset.expectedLocationRadius} km`);
            row(doc, 'GPS Result', verification.gpsVerified ? '✓ LOCATION VERIFIED' : '⚠ SUSPICIOUS LOCATION');
            doc.moveDown();

            // Serial Verification
            section(doc, 'Serial Number Verification');
            row(doc, 'Registered Serial', asset.serialNumber);
            row(doc, 'OCR Extracted Serial', ocr?.extractedSerialNumber || 'N/A');
            row(doc, 'Result', verification.serialMatch ? '✓ MATCH' : '⚠ MISMATCH');
            doc.moveDown();

            // Risk Analysis
            section(doc, 'AI Risk Analysis');
            row(doc, 'Risk Score', `${verification.riskScore}/100`);
            row(doc, 'Risk Level', verification.riskLevel);
            if (verification.riskFactors?.length > 0) {
                doc.fontSize(10).font('Helvetica-Bold').text('Risk Factors:');
                verification.riskFactors.forEach(f => {
                    doc.fontSize(10).font('Helvetica').text(`  • ${f}`);
                });
            }
            doc.moveDown();

            // Officer Decision
            section(doc, 'Officer Decision');
            row(doc, 'Verification Status', verification.verificationStatus);
            row(doc, 'Officer Decision', verification.officerDecision || 'Pending');
            row(doc, 'Officer Remarks', verification.officerRemarks || 'N/A');
            doc.moveDown();

            // Footer
            addLine(doc);
            doc.fontSize(8).font('Helvetica').fillColor('grey')
                .text('This report was generated automatically by the AI Loan Utilization Verification System.', { align: 'center' })
                .text('AI-assisted analysis is advisory and subject to human review.', { align: 'center' });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

/**
 * Generate Monitoring PDF Report
 */
const generateMonitoringReport = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            const { borrower, loan, asset, previousVerification, currentVerification, monitoringRequest, report } = data;

            // Header
            doc.fontSize(20).font('Helvetica-Bold')
                .text('AI Loan Utilization Verification System', { align: 'center' });
            doc.fontSize(14).font('Helvetica')
                .text('Periodic Monitoring Report', { align: 'center' });
            doc.moveDown();
            addLine(doc);

            doc.fontSize(10).font('Helvetica-Bold').text('Report ID: ', { continued: true })
                .font('Helvetica').text(report.reportId || 'N/A');
            doc.font('Helvetica-Bold').text('Generated At: ', { continued: true })
                .font('Helvetica').text(new Date().toLocaleString());
            doc.moveDown();

            section(doc, 'Borrower & Loan Summary');
            row(doc, 'Borrower', borrower.name);
            row(doc, 'Loan ID', loan.loanId);
            row(doc, 'Machine', `${asset.machineName} (${asset.manufacturer} ${asset.model})`);
            row(doc, 'Monitoring Reason', monitoringRequest?.requestReason || 'Periodic check');
            doc.moveDown();

            section(doc, 'Comparison: Previous vs Current');
            row(doc, 'Previous Risk Score', `${previousVerification?.riskScore || 'N/A'}/100 (${previousVerification?.riskLevel || 'N/A'})`);
            row(doc, 'Current Risk Score', `${currentVerification?.riskScore || 'N/A'}/100 (${currentVerification?.riskLevel || 'N/A'})`);
            row(doc, 'Previous GPS Verified', previousVerification?.gpsVerified ? 'Yes' : 'No');
            row(doc, 'Current GPS Verified', currentVerification?.gpsVerified ? 'Yes' : 'No');
            row(doc, 'Current Distance', `${currentVerification?.distanceFromRegisteredLocation?.toFixed(2) || 'N/A'} km`);
            row(doc, 'Serial Match (Now)', currentVerification?.serialMatch ? '✓ MATCH' : '⚠ MISMATCH');
            doc.moveDown();

            section(doc, 'Current Risk Factors');
            (currentVerification?.riskFactors || []).forEach(f => {
                doc.fontSize(10).font('Helvetica').text(`  • ${f}`);
            });
            doc.moveDown();

            section(doc, 'Officer Decision');
            row(doc, 'Status', currentVerification?.verificationStatus || 'Pending');
            row(doc, 'Decision', currentVerification?.officerDecision || 'Pending');
            row(doc, 'Remarks', currentVerification?.officerRemarks || 'N/A');
            doc.moveDown();

            addLine(doc);
            doc.fontSize(8).font('Helvetica').fillColor('grey')
                .text('Monitoring Report — AI Loan Utilization Verification System', { align: 'center' })
                .text('AI-assisted analysis is advisory and subject to human review.', { align: 'center' });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

// Helper functions
const addLine = (doc) => {
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke().moveDown(0.5);
};

const section = (doc, title) => {
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#1a1a2e').text(title);
    doc.moveDown(0.3);
};

const row = (doc, label, value) => {
    doc.fontSize(10).font('Helvetica-Bold').fillColor('black').text(`${label}: `, { continued: true })
        .font('Helvetica').text(value || 'N/A');
};

module.exports = { generateVerificationReport, generateMonitoringReport };
