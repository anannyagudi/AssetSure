import axios from 'axios';
import API_BASE_URL from './config';

const api = axios.create({ baseURL: API_BASE_URL });

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 globally
api.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Loans
export const getLoans = () => api.get('/loans');
export const getLoanById = (id) => api.get(`/loans/${id}`);
export const createLoan = (data) => api.post('/loans', data);
export const updateLoanStatus = (id, status) => api.put(`/loans/${id}/status`, { loanStatus: status });

// Assets
export const getAssets = () => api.get('/assets');
export const getAssetById = (id) => api.get(`/assets/${id}`);
export const createAsset = (data) => api.post('/assets', data);
export const updateAssetLocation = (id, data) => api.put(`/assets/${id}/location`, data);

// Submissions
export const createSubmission = (formData) => api.post('/submissions', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const getSubmissions = () => api.get('/submissions');
export const getSubmissionById = (id) => api.get(`/submissions/${id}`);

// Verifications
export const getVerifications = () => api.get('/verification');
export const getVerificationById = (id) => api.get(`/verification/${id}`);
export const approveVerification = (id, remarks) => api.put(`/verification/${id}/approve`, { remarks });
export const flagVerification = (id, remarks) => api.put(`/verification/${id}/flag`, { remarks });
export const requestEvidence = (id, remarks) => api.put(`/verification/${id}/request-evidence`, { remarks });

// Monitoring
export const createMonitoringRequest = (data) => api.post('/monitoring/request', data);
export const getMonitoringRequests = () => api.get('/monitoring/requests');
export const submitMonitoringResponse = (id, formData) => api.post(`/monitoring/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// Dashboard
export const getOfficerDashboard = () => api.get('/dashboard/officer');
export const getBorrowerDashboard = () => api.get('/dashboard/borrower');
export const getHighRiskCases = () => api.get('/dashboard/high-risk');
export const getAllBorrowers = () => api.get('/dashboard/borrowers');

// Reports
export const generateReport = (data) => api.post('/reports/generate', data, { responseType: 'blob' });
export const getReports = () => api.get('/reports');

export default api;
