import React, { useEffect, useState } from 'react';
import { OfficerLayout } from '../../layouts/DashboardLayout';
import { SectionHeader, Spinner, EmptyState, RiskBadge, StatusBadge } from '../../components/UI';
import { getHighRiskCases } from '../../services/api';
import { AlertTriangle, MapPin, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const OfficerHighRisk = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getHighRiskCases().then(r => setCases(r.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    return (
        <OfficerLayout>
            <SectionHeader title="High Risk Cases" subtitle={`${cases.length} high risk submission(s) — sorted by risk score`} />
            {loading ? <div className="flex justify-center py-20"><Spinner size={36} /></div>
            : cases.length === 0 ? <EmptyState icon={AlertTriangle} title="No High Risk Cases" description="No submissions currently flagged as HIGH risk." />
            : (
                <div className="space-y-4">
                    {cases.map(v => (
                        <div key={v._id} className="card"
                            style={{ borderColor: 'rgba(220,38,38,0.3)', backgroundColor: 'rgba(220,38,38,0.04)' }}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <RiskBadge level="HIGH" />
                                        <span className="text-2xl font-bold text-red-500">
                                            {v.riskScore}<span className="text-sm" style={{ color: 'var(--text-secondary)' }}>/100</span>
                                        </span>
                                        <StatusBadge status={v.verificationStatus} />
                                    </div>
                                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{v.submission?.borrower?.name}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{v.submission?.loan?.loanId} • {v.submission?.submissionType}</p>
                                    <div className="flex gap-4 mt-2 text-xs">
                                        <span className={`flex items-center gap-1 ${v.gpsVerified ? 'text-emerald-500' : 'text-red-500'}`}>
                                            <MapPin size={11} />{v.gpsVerified ? 'GPS OK' : 'GPS FAIL'} ({v.distanceFromRegisteredLocation?.toFixed(1)}km)
                                        </span>
                                        <span className={`flex items-center gap-1 ${v.serialMatch ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {v.serialMatch ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
                                            Serial {v.serialMatch ? 'Match' : 'Mismatch'}
                                        </span>
                                    </div>
                                </div>
                                <Link to={`/officer/verifications/${v._id}`} className="btn-danger shrink-0">Review Case</Link>
                            </div>
                            {v.riskFactors?.length > 0 && (
                                <div className="mt-3 pt-3 flex flex-wrap gap-2" style={{ borderTop: '1px solid rgba(220,38,38,0.2)' }}>
                                    {v.riskFactors.slice(0, 3).map((f, i) => (
                                        <span key={i} className="text-xs px-2 py-0.5 rounded text-red-500"
                                            style={{ backgroundColor: 'rgba(220,38,38,0.1)' }}>{f}</span>
                                    ))}
                                    {v.riskFactors.length > 3 && (
                                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>+{v.riskFactors.length - 3} more</span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </OfficerLayout>
    );
};

export default OfficerHighRisk;
