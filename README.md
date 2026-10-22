AssetSure – AI-Powered Loan Utilization Verification & Asset Monitoring

AssetSure is a web-based application designed to help financial institutions verify whether machinery purchased through a loan is being used for its intended purpose. It enables borrowers to submit machine-related evidence and allows bank officers to review verification results, assess potential risks, and monitor financed assets.

🎯 Project Objectives

- Verify the utilization of machinery loans.
- Validate machine details against submitted invoices and loan records.
- Support invoice data extraction using Optical Character Recognition (OCR).
- Verify machine location using GPS coordinates.
- Identify discrepancies and generate risk assessments.
- Enable periodic monitoring of financed machinery.
- Improve transparency and efficiency in the loan verification process.

#✨ Key Features

# Borrower Dashboard
- View loan and financed machinery details.
- Upload purchase invoices and machine photographs.
- Submit machine serial-number photographs.
- Capture and submit GPS location for verification.
- Track verification status and risk-related updates.
- Respond to monitoring requests with updated evidence.
- View verification and monitoring reports.

# Bank Officer Dashboard
- View borrowers and their loan details.
- Review uploaded invoices and machine photographs.
- View OCR-extracted invoice information.
- Review machine and serial-number verification results.
- Compare registered and submitted GPS locations.
- Review risk scores and suspicious submissions.
- Approve, flag, or request additional evidence.
- Monitor financed machinery and review reports.

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Image Storage | Cloudinary |
| Authentication | JSON Web Tokens (JWT) |
| Location Verification | HTML5 Geolocation API |
| Invoice Processing | OCR |
| Version Control | Git and GitHub |

## ⚙️ System Workflow

1. **Loan Details:** The system maintains borrower and financed machinery information.
2. **Evidence Submission:** The borrower uploads an invoice, machine photographs, and serial-number evidence.
3. **OCR Processing:** Invoice text is extracted for comparison with available loan and machine details.
4. **Location Verification:** The borrower submits GPS coordinates, which are compared with the registered location using a configurable distance threshold.
5. **Risk Assessment:** Available verification results and discrepancies contribute to a risk assessment.
6. **Officer Review:** The bank officer reviews the evidence and decides whether to approve, flag, or request further information.
7. **Periodic Monitoring:** Updated photographs and location details can be submitted when monitoring is requested.

## 🎓 Future Enhancements

- Advanced machine image recognition and serial-number matching.
- Improved invoice verification and fraud detection.
- Automated periodic monitoring reminders.
- Interactive maps for registered and submitted locations.
- Downloadable verification and monitoring reports.
- Notifications for high-risk cases and missing evidence.
- Enhanced audit logs and analytics.

## 🎓 Project Purpose

AssetSure is developed as an academic project demonstrating how web technologies, OCR, location verification, cloud-based image storage, and risk assessment can support machinery loan utilization verification and asset monitoring.



