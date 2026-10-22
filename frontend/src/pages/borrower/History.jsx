import React, { useEffect, useState } from 'react';
import { BorrowerLayout } from '../../layouts/DashboardLayout';
import { SectionHeader, Spinner, EmptyState, RiskBadge, StatusBadge } from '../../components/UI';
import { getVerifications } from '../../services/api';
import { History, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const BorrowerHistory = () => {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getVerifications().then(r => setVerifications(r.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    return (
        <BorrowerLayout>
            <SectionHeader title="Verification History" subtitle="Timeline of all verification and monitoring submissions." />
            {loading ? <div className="flex justify-center py-20"><Spinner size={36} /></div>
                : verifications.length === 0 ? <EmptyState icon={History} title="No History Yet" description="Your verification history will appear here once you submit evidence." />
                    : (
                        <div className="relative pl-6 space-y-6" style={{ borderLeft: '1px solid var(--border)' }}>
                            {verifications.map((v) => {
                                const isVerified = v.verificationStatus === 'Verified';
                                const isFlagged  = v.verificationStatus === 'Flagged';
                                return (
                                    <div key={v._id} className="relative">
                                        <div className={`absolute -left-[34px] w-6 h-6 rounded-full border-2 flex items-center justify-center
                                            ${isVerified ? 'bg-emerald-900/60 border-emerald-500' : isFlagged ? 'bg-red-900/60 border-red-500' : ''}`}
                                            style={!isVerified && !isFlagged ? { backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' } : {}}>
                                            {isVerified ? <CheckCircle size={12} className="text-emerald-400" />
                                                : isFlagged ? <AlertTriangle size={12} className="text-red-400" />
                                                : <Clock size={12} style={{ color: 'var(--text-secondary)' }} />}
                                        </div>
                                        <div className="card ml-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{v.submission?.submissionType || 'Verification'}</span>
                                                    <StatusBadge status={v.verificationStatus} />
                                                </div>
                                                <RiskBadge level={v.riskLevel} />
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-3">
                                                <div>
                                                    <p style={{ color: 'var(--text-muted)' }}>Risk Score</p>
                                                    <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{v.riskScore}/100</p>
                                                </div>
                                                <div>
                                                    <p style={{ color: 'var(--text-muted)' }}>GPS</p>
                                                    <p className={v.gpsVerified ? 'text-emerald-500' : 'text-red-500'}>{v.gpsVerified ? '✓ Verified' : '⚠ Flagged'}</p>
                                                </div>
                                                <div>
                                                    <p style={{ color: 'var(--text-muted)' }}>Serial</p>
                                                    <p className={v.serialMatch ? 'text-emerald-500' : 'text-red-500'}>{v.serialMatch ? '✓ Match' : '⚠ Mismatch'}</p>
                                                </div>
                                                <div>
                                                    <p style={{ color: 'var(--text-muted)' }}>Distance</p>
                                                    <p style={{ color: 'var(--text-primary)' }}>{v.distanceFromRegisteredLocation?.toFixed(2)} km</p>
                                                </div>
                                            </div>
                                            {v.officerRemarks && (
                                                <p className="text-xs mt-2 pt-2" style={{ color: 'var(--text-secondary)', borderTop: '1px solid var(--border)' }}>
                                                    Officer: "{v.officerRemarks}"
                                                </p>
                                            )}
                                            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{v.createdAt ? new Date(v.createdAt).toLocaleString() : ''}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
        </BorrowerLayout>
    );
};

export default BorrowerHistory;
