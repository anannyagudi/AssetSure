const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');

dotenv.config();

const User = require('./models/User');
const Loan = require('./models/Loan');
const Asset = require('./models/Asset');
const VerificationResult = require('./models/VerificationResult');
const Submission = require('./models/Submission');

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Loan.deleteMany({}),
            Asset.deleteMany({}),
            VerificationResult.deleteMany({}),
            Submission.deleteMany({})
        ]);
        console.log('Cleared existing data');

        // Create Bank Officer
        const officerPassword = await bcrypt.hash('officer123', 10);
        const officer = await User.create({
            name: 'Rajesh Kumar',
            email: 'officer@bank.com',
            passwordHash: officerPassword,
            role: 'bank_officer',
            phone: '9876543210'
        });
        console.log('Bank officer created: officer@bank.com / officer123');

        // Create Borrowers
        const borrower1Password = await bcrypt.hash('borrower123', 10);
        const borrower1 = await User.create({
            name: 'Amit Sharma',
            email: 'amit@borrower.com',
            passwordHash: borrower1Password,
            role: 'borrower',
            phone: '9123456789'
        });

        const borrower2Password = await bcrypt.hash('borrower123', 10);
        const borrower2 = await User.create({
            name: 'Priya Singh',
            email: 'priya@borrower.com',
            passwordHash: borrower2Password,
            role: 'borrower',
            phone: '9234567890'
        });
        console.log('Borrowers created');

        // Create Loans
        const loan1 = await Loan.create({
            loanId: 'LN-AMIT001',
            borrower: borrower1._id,
            loanAmount: 1500000,
            loanType: 'Machinery Loan',
            applicationDate: new Date('2026-01-01'),
            approvalDate: new Date('2026-01-15'),
            loanStatus: 'Under Verification',
            tenure: 60,
            interestRate: 8.5,
            purpose: 'Purchase of CNC Milling Machine for manufacturing unit'
        });

        const loan2 = await Loan.create({
            loanId: 'LN-PRIYA001',
            borrower: borrower2._id,
            loanAmount: 800000,
            loanType: 'Agricultural Equipment Loan',
            applicationDate: new Date('2026-02-01'),
            approvalDate: new Date('2026-02-10'),
            loanStatus: 'Flagged',
            tenure: 48,
            interestRate: 7.5,
            purpose: 'Purchase of Tractor for agricultural operations'
        });
        console.log('Loans created');

        // Create Assets
        const asset1 = await Asset.create({
            assetId: 'AST-CNC001',
            loan: loan1._id,
            borrower: borrower1._id,
            machineName: 'CNC Milling Machine XR-2000',
            machineType: 'CNC Machine',
            manufacturer: 'Bharat Machine Tools',
            model: 'XR-2000',
            serialNumber: 'BMT-CNC-2025-001',
            purchasePrice: 1400000,
            dealerName: 'Industrial Machinery Pvt Ltd',
            registeredLatitude: 19.0760,
            registeredLongitude: 72.8777,
            registeredAddress: 'Plot 12, MIDC Industrial Area, Andheri East, Mumbai - 400093',
            expectedLocationRadius: 2,
            purchaseDate: new Date('2026-01-20'),
            assetStatus: 'Registered'
        });

        const asset2 = await Asset.create({
            assetId: 'AST-TRC001',
            loan: loan2._id,
            borrower: borrower2._id,
            machineName: 'Mahindra Arjun 605 DI Tractor',
            machineType: 'Tractor',
            manufacturer: 'Mahindra',
            model: 'Arjun 605 DI',
            serialNumber: 'MHN-TRC-2025-789',
            purchasePrice: 780000,
            dealerName: 'Mahindra Authorized Dealer, Pune',
            registeredLatitude: 18.5204,
            registeredLongitude: 73.8567,
            registeredAddress: 'Survey No. 45, Hadapsar, Pune - 411028',
            expectedLocationRadius: 5,
            purchaseDate: new Date('2026-02-15'),
            assetStatus: 'Registered'
        });
        console.log('Assets created');

        // Create dummy submissions and verifications
        const sub1 = await Submission.create({
            submissionId: 'SUB-SEED001',
            loan: loan1._id,
            borrower: borrower1._id,
            submissionType: 'Initial Verification',
            invoiceUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            machinePhotoUrls: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
            serialPhotoUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            submittedLatitude: 19.0765,
            submittedLongitude: 72.8780,
            submittedTimestamp: new Date('2026-02-01'),
            status: 'Pending'
        });

        await VerificationResult.create({
            submission: sub1._id,
            invoiceMatch: true,
            serialMatch: true,
            machineImageMatch: { match: true, confidence: 82 },
            gpsVerified: true,
            distanceFromRegisteredLocation: 0.08,
            riskScore: 0,
            riskLevel: 'LOW',
            riskFactors: [],
            verificationStatus: 'Pending'
        });

        // High-risk case
        const sub2 = await Submission.create({
            submissionId: 'SUB-SEED002',
            loan: loan2._id,
            borrower: borrower2._id,
            submissionType: 'Initial Verification',
            machinePhotoUrls: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'],
            serialPhotoUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
            submittedLatitude: 28.6139, // Delhi - very far from Pune
            submittedLongitude: 77.2090,
            submittedTimestamp: new Date('2026-03-01'),
            status: 'Flagged'
        });

        await VerificationResult.create({
            submission: sub2._id,
            invoiceMatch: false,
            serialMatch: false,
            machineImageMatch: { match: false, confidence: 42 },
            gpsVerified: false,
            distanceFromRegisteredLocation: 1192.5,
            riskScore: 85,
            riskLevel: 'HIGH',
            riskFactors: [
                'Serial number mismatch (+30)',
                'GPS outside allowed radius (+25)',
                'Major GPS discrepancy (>1192km) (+15)',
                'Invoice details inconsistency (+20)'
            ],
            verificationStatus: 'Flagged',
            officerDecision: 'Flagged',
            officerRemarks: 'Machine GPS location is 1192km from registered location. Suspected asset diversion.',
            verifiedBy: officer._id,
            verifiedAt: new Date('2026-03-05')
        });

        console.log('Seed data created successfully!');
        console.log('\n=== Demo Credentials ===');
        console.log('Bank Officer: officer@bank.com / officer123');
        console.log('Borrower 1:   amit@borrower.com / borrower123');
        console.log('Borrower 2:   priya@borrower.com / borrower123');
        console.log('========================\n');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
};

seed();
