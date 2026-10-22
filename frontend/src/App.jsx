import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

// Borrower pages
import BorrowerDashboard from './pages/borrower/Dashboard';
import BorrowerLoan from './pages/borrower/Loan';
import BorrowerMachine from './pages/borrower/Machine';
import BorrowerVerification from './pages/borrower/Verification';
import BorrowerMonitoring from './pages/borrower/Monitoring';
import BorrowerHistory from './pages/borrower/History';
import BorrowerReports from './pages/borrower/Reports';
import BorrowerProfile from './pages/borrower/Profile';

// Officer pages
import OfficerDashboard from './pages/officer/Dashboard';
import OfficerBorrowers from './pages/officer/Borrowers';
import OfficerLoans from './pages/officer/Loans';
import OfficerAssets from './pages/officer/Assets';
import OfficerVerifications from './pages/officer/Verifications';
import OfficerVerificationDetail from './pages/officer/VerificationDetail';
import OfficerMonitoring from './pages/officer/Monitoring';
import OfficerHighRisk from './pages/officer/HighRisk';
import OfficerReports from './pages/officer/Reports';
import OfficerHistory from './pages/officer/History';
import OfficerProfile from './pages/officer/Profile';

function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <AuthProvider>
                    <ToastProvider>
                        <Routes>
                        {/* Public */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={<Navigate to="/login" replace />} />

                        {/* Borrower routes */}
                        <Route path="/borrower/dashboard"    element={<ProtectedRoute role="borrower"><BorrowerDashboard /></ProtectedRoute>} />
                        <Route path="/borrower/loan"         element={<ProtectedRoute role="borrower"><BorrowerLoan /></ProtectedRoute>} />
                        <Route path="/borrower/machine"      element={<ProtectedRoute role="borrower"><BorrowerMachine /></ProtectedRoute>} />
                        <Route path="/borrower/verification" element={<ProtectedRoute role="borrower"><BorrowerVerification /></ProtectedRoute>} />
                        <Route path="/borrower/monitoring"   element={<ProtectedRoute role="borrower"><BorrowerMonitoring /></ProtectedRoute>} />
                        <Route path="/borrower/history"      element={<ProtectedRoute role="borrower"><BorrowerHistory /></ProtectedRoute>} />
                        <Route path="/borrower/reports"      element={<ProtectedRoute role="borrower"><BorrowerReports /></ProtectedRoute>} />
                        <Route path="/borrower/profile"      element={<ProtectedRoute role="borrower"><BorrowerProfile /></ProtectedRoute>} />

                        {/* Officer routes */}
                        <Route path="/officer/dashboard"       element={<ProtectedRoute role="bank_officer"><OfficerDashboard /></ProtectedRoute>} />
                        <Route path="/officer/borrowers"       element={<ProtectedRoute role="bank_officer"><OfficerBorrowers /></ProtectedRoute>} />
                        <Route path="/officer/loans"           element={<ProtectedRoute role="bank_officer"><OfficerLoans /></ProtectedRoute>} />
                        <Route path="/officer/assets"          element={<ProtectedRoute role="bank_officer"><OfficerAssets /></ProtectedRoute>} />
                        <Route path="/officer/verifications"   element={<ProtectedRoute role="bank_officer"><OfficerVerifications /></ProtectedRoute>} />
                        <Route path="/officer/verifications/:id" element={<ProtectedRoute role="bank_officer"><OfficerVerificationDetail /></ProtectedRoute>} />
                        <Route path="/officer/monitoring"      element={<ProtectedRoute role="bank_officer"><OfficerMonitoring /></ProtectedRoute>} />
                        <Route path="/officer/high-risk"       element={<ProtectedRoute role="bank_officer"><OfficerHighRisk /></ProtectedRoute>} />
                        <Route path="/officer/reports"         element={<ProtectedRoute role="bank_officer"><OfficerReports /></ProtectedRoute>} />
                        <Route path="/officer/history"         element={<ProtectedRoute role="bank_officer"><OfficerHistory /></ProtectedRoute>} />
                        <Route path="/officer/profile"         element={<ProtectedRoute role="bank_officer"><OfficerProfile /></ProtectedRoute>} />

                        {/* Catch-all */}
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </ToastProvider>
            </AuthProvider>
        </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
