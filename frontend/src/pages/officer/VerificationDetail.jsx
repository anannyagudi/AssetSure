import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { OfficerLayout } from '../../layouts/DashboardLayout';
import { Spinner, RiskBadge, StatusBadge, InfoRow, Modal } from '../../components/UI';
import { getVerificationById, approveVerification, flagVerification, requestEvidence, generateReport } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CheckCircle, AlertTriangle, MapPin, FileDown, Eye } from 'lucide-react';

const OfficerVerificationDetail = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionModal, setActionModal] = useState(null);
    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(false);
    const addToast = useToast();

    const load = () => {
        setLoading(true);
        getVerificationById(id).then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
    };
    useEffect(load, [id]);

    const handleAction = async () => {
        setSubmitting(true);
        try {
            if (actionModal === 'approve') await approveVerification(id, remarks);
            else if (actionModal === 'flag') await flagVerification(id, remarks);
            else await requestEvidence(id, remarks);
            addToast(`Verification ${actionModal === 'approve' ? 'approved' : actionModal === 'flag' ? 'flagged' : 'evidence requested'}!`, 'success');
            setActionModal(null);
            setRemarks('');
            load();
        } catch (err) {
            addToast(err.response?.data?.error || 'Action failed', 'error');
        } finally { setSubmitting(false); }
    };

    const handleDownloadPDF = async () => {
        setPdfLoading(true);
        try {
            const res = await generateReport({ verificationId: id });
            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const a = document.createElement('a'); a.href = url; a.download = `verification-${id}.pdf`; a.click();
            URL.revokeObjectURL(url);
            addToast('PDF downloaded!', 'success');
        } catch { addToast('PDF generation failed', 'error'); } finally { setPdfLoading(false); }
    };

    if (loading) return <OfficerLayout><div className="flex justify-center py-20"><Spinner size={36} /></div></OfficerLayout>;
    if (!data) return <OfficerLayout><p style={{ color: 'var(--text-secondary)' }}>Not found</p></OfficerLayout>;

    const { verification, asset, ocr } = data;
    const borrower = verification?.submission?.borrower;
    const loan = verification?.submission?.loan;

    return (
        <OfficerLayout>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Verification Detail</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <RiskBadge level={verification.riskLevel} />
                        <StatusBadge status={verification.verificationStatus} />
                    </div>
                </div>
                <button onClick={handleDownloadPDF} disabled={pdfLoading} className="btn-secondary">
                    <FileDown size={16} /> {pdfLoading ? 'Generating...' : 'Download PDF'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Borrower & Loan */}
                    <div className="card">
                        <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Borrower & Loan</h2>
                        <InfoRow label="Borrower Name" value={borrower?.name} />
                        <InfoRow label="Email" value={borrower?.email} />
                        <InfoRow label="Phone" value={borrower?.phone} />
                        <InfoRow label="Loan ID" value={loan?.loanId} />
                        <InfoRow label="Loan Amount" value={loan ? `₹${loan.loanAmount?.toLocaleString()}` : '—'} />
                        <InfoRow label="Purpose" value={loan?.purpose} />
                    </div>

                    {/* Machine */}
                    {asset && <div className="card">
                        <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Machine Details</h2>
                        <InfoRow label="Machine" value={`${asset.manufacturer} ${asset.model} (${asset.machineName})`} />
                        <InfoRow label="Serial Number" value={asset.serialNumber} />
                        <InfoRow label="Purchase Price" value={`₹${asset.purchasePrice?.toLocaleString()}`} />
                        <InfoRow label="Dealer" value={asset.dealerName} />
                        <InfoRow label="Registered Address" value={asset.registeredAddress} />
                        <InfoRow label="Allowed Radius" value={`${asset.expectedLocationRadius} km`} />
                    </div>}

                    {/* Evidence */}
                    <div className="card">
                        <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Uploaded Evidence</h2>
                        {verification.submission?.invoiceUrl && (
                            <div className="mb-3">
                                <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>Invoice</p>
                                <a href={verification.submission.invoiceUrl} target="_blank" rel="noopener noreferrer"
                                    className="text-primary-500 text-sm flex items-center gap-1 hover:underline">
                                    <Eye size={14} /> View Invoice
                                </a>
                            </div>
                        )}
                        {verification.submission?.machinePhotoUrls?.length > 0 && (
                            <div className="mb-3">
                                <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>Machine Photos</p>
                                <div className="flex flex-wrap gap-2">
                                    {verification.submission.machinePhotoUrls.map((url, i) => (
                                        <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                            <img src={url} alt={`Machine ${i + 1}`}
                                                className="w-24 h-24 object-cover rounded-lg transition-colors hover:border-primary-500"
                                                style={{ border: '1px solid var(--border)' }} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                        {verification.submission?.serialPhotoUrl && (
                            <div>
                                <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>Serial Number Photo</p>
                                <a href={verification.submission.serialPhotoUrl} target="_blank" rel="noopener noreferrer">
                                    <img src={verification.submission.serialPhotoUrl} alt="Serial"
                                        className="h-28 object-contain rounded-lg"
                                        style={{ border: '1px solid var(--border)' }} />
                                </a>
                            </div>
                        )}
                    </div>

                    {/* OCR */}
                    {ocr && <div className="card">
                        <h2 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                            OCR Results <span className="text-xs font-normal" style={{ color: 'var(--text-secondary)' }}>(AI-Extracted)</span>
                        </h2>
                        <InfoRow label="Machine Name" value={ocr.extractedMachineName || 'Not extracted'} />
                        <InfoRow label="Manufacturer" value={ocr.extractedManufacturer || 'Not extracted'} />
                        <InfoRow label="Model" value={ocr.extractedModel || 'Not extracted'} />
                        <InfoRow label="Serial Number" value={ocr.extractedSerialNumber || 'Not extracted'} />
                        <InfoRow label="Price" value={ocr.extractedPurchasePrice || 'Not extracted'} />
                        <InfoRow label="Dealer" value={ocr.extractedDealerName || 'Not extracted'} />
                        <InfoRow label="OCR Confidence" value={`${ocr.confidence}%`} />
                    </div>}
                </div>

                {/* Right sidebar */}
                <div className="space-y-4">
                    {/* Serial Verification */}
                    <div className="card">
                        <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Serial Number Verification</h3>
                        <div className={`p-3 rounded-lg border text-sm ${verification.serialMatch
                            ? 'text-emerald-600 dark:text-emerald-300'
                            : 'text-red-600 dark:text-red-300'}`}
                            style={{
                                backgroundColor: verification.serialMatch ? 'rgba(5,150,105,0.1)' : 'rgba(220,38,38,0.1)',
                                borderColor: verification.serialMatch ? 'rgba(5,150,105,0.3)' : 'rgba(220,38,38,0.3)',
                                color: verification.serialMatch ? '#059669' : '#DC2626',
                            }}>
                            {verification.serialMatch
                                ? <><CheckCircle size={14} className="inline mr-1" />MATCH</>
                                : <><AlertTriangle size={14} className="inline mr-1" />MISMATCH</>}
                        </div>
                        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Registered: <span className="text-amber-500 font-mono">{asset?.serialNumber}</span></p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Extracted: <span className="font-mono" style={{ color: 'var(--text-secondary)' }}>{ocr?.extractedSerialNumber || 'N/A'}</span></p>
                    </div>

                    {/* GPS */}
                    <div className="card">
                        <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>GPS Verification</h3>
                        <div className="p-3 rounded-lg border text-sm"
                            style={{
                                backgroundColor: verification.gpsVerified ? 'rgba(5,150,105,0.1)' : 'rgba(220,38,38,0.1)',
                                borderColor: verification.gpsVerified ? 'rgba(5,150,105,0.3)' : 'rgba(220,38,38,0.3)',
                                color: verification.gpsVerified ? '#059669' : '#DC2626',
                            }}>
                            <MapPin size={14} className="inline mr-1" />
                            {verification.gpsVerified ? 'LOCATION VERIFIED' : 'SUSPICIOUS LOCATION'}
                        </div>
                        <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Distance: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{verification.distanceFromRegisteredLocation?.toFixed(2)} km</span></p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Allowed: <span style={{ color: 'var(--text-secondary)' }}>{asset?.expectedLocationRadius} km</span></p>
                    </div>

                    {/* Risk */}
                    <div className="card">
                        <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Risk Analysis</h3>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{verification.riskScore}<span className="text-sm" style={{ color: 'var(--text-secondary)' }}>/100</span></span>
                            <RiskBadge level={verification.riskLevel} />
                        </div>
                        {verification.riskFactors?.length > 0 && (
                            <div className="space-y-1 mt-3">
                                {verification.riskFactors.map((f, i) => (
                                    <p key={i} className="text-xs text-red-500 flex items-start gap-1">
                                        <AlertTriangle size={10} className="mt-0.5 shrink-0" />{f}
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Officer Actions */}
                    {verification.verificationStatus === 'Pending' || verification.verificationStatus === 'Under Review' ? (
                        <div className="card space-y-2">
                            <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Officer Actions</h3>
                            <button onClick={() => setActionModal('approve')} className="btn-success w-full justify-center">
                                <CheckCircle size={16} /> Approve / Verify
                            </button>
                            <button onClick={() => setActionModal('flag')} className="btn-danger w-full justify-center">
                                <AlertTriangle size={16} /> Flag Submission
                            </button>
                            <button onClick={() => setActionModal('evidence')} className="btn-warning w-full justify-center">
                                Request Evidence
                            </button>
                        </div>
                    ) : (
                        <div className="card">
                            <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Decision Recorded</h3>
                            <StatusBadge status={verification.verificationStatus} />
                            {verification.officerRemarks && (
                                <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>"{verification.officerRemarks}"</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Modal open={!!actionModal} onClose={() => setActionModal(null)}
                title={actionModal === 'approve' ? 'Approve Verification' : actionModal === 'flag' ? 'Flag Submission' : 'Request Additional Evidence'}>
                <div className="space-y-4">
                    <div>
                        <label className="label">Officer Remarks</label>
                        <textarea value={remarks} onChange={e => setRemarks(e.target.value)}
                            rows={4} placeholder="Add your remarks..."
                            className="input resize-none" />
                    </div>
                    <button onClick={handleAction} disabled={submitting}
                        className={`w-full justify-center ${actionModal === 'approve' ? 'btn-success' : actionModal === 'flag' ? 'btn-danger' : 'btn-warning'}`}>
                        {submitting ? 'Processing...' : 'Confirm'}
                    </button>
                </div>
            </Modal>
        </OfficerLayout>
    );
};

export default OfficerVerificationDetail;
