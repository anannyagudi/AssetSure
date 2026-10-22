import React, { useEffect, useState } from 'react';
import { BorrowerLayout } from '../../layouts/DashboardLayout';
import { SectionHeader, Spinner, EmptyState } from '../../components/UI';
import { getVerifications, generateReport } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FileText, FileDown, Calendar } from 'lucide-react';

const BorrowerReports = () => {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(null);
    const addToast = useToast();

    useEffect(() => {
        getVerifications().then(r => setVerifications(r.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleDownload = async (v) => {
        setDownloading(v._id);
        try {
            const res = await generateReport({ verificationId: v._id });
            const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            const a = document.createElement('a'); a.href = url; a.download = `report-${v._id}.pdf`; a.click();
            URL.revokeObjectURL(url);
            addToast('Report downloaded!', 'success');
        } catch { addToast('Failed to generate report', 'error'); }
        finally { setDownloading(null); }
    };

    return (
        <BorrowerLayout>
            <SectionHeader title="Reports" subtitle="Download PDF reports for your verified submissions." />
            {loading ? <div className="flex justify-center py-20"><Spinner size={36} /></div>
                : verifications.length === 0 ? <EmptyState icon={FileText} title="No Reports Available" description="Reports will be available after your verification is processed." />
                    : (
                        <div className="space-y-4">
                            {verifications.map(v => (
                                <div key={v._id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-3">
                                        <FileText size={24} className="text-primary-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{v.submission?.submissionType || 'Verification'} Report</p>
                                            <p className="text-xs flex items-center gap-1 mt-1" style={{ color: 'var(--text-muted)' }}>
                                                <Calendar size={11} /> {v.createdAt ? new Date(v.createdAt).toDateString() : 'N/A'}
                                            </p>
                                            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                                Risk: <span className={v.riskLevel === 'LOW' ? 'text-emerald-500' : v.riskLevel === 'MEDIUM' ? 'text-amber-500' : 'text-red-500'}>{v.riskLevel}</span>
                                                {' · '}Score: <span style={{ color: 'var(--text-primary)' }}>{v.riskScore}/100</span>
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleDownload(v)} disabled={downloading === v._id} className="btn-secondary shrink-0">
                                        <FileDown size={16} />
                                        {downloading === v._id ? 'Generating…' : 'Download PDF'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
        </BorrowerLayout>
    );
};

export default BorrowerReports;
