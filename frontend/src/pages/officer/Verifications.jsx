import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OfficerLayout } from '../../layouts/DashboardLayout';
import { SectionHeader, Spinner, EmptyState, RiskBadge, StatusBadge } from '../../components/UI';
import { getVerifications } from '../../services/api';
import { FileCheck, ExternalLink, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';

const OfficerVerifications = () => {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        getVerifications().then(r => setVerifications(r.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    const filtered = filter === 'all' ? verifications : verifications.filter(v =>
        filter === 'high' ? v.riskLevel === 'HIGH' :
        filter === 'medium' ? v.riskLevel === 'MEDIUM' :
        filter === 'low' ? v.riskLevel === 'LOW' :
        v.verificationStatus === filter
    );

    return (
        <OfficerLayout>
            <SectionHeader title="Verification Queue" subtitle={`${filtered.length} submission(s) matching filter`} />
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                {[['all','All'],['Pending','Pending'],['Verified','Verified'],['Flagged','Flagged'],['high','High Risk'],['medium','Medium Risk'],['low','Low Risk']].map(([val, label]) => (
                    <button key={val} onClick={() => setFilter(val)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border"
                        style={{
                            backgroundColor: filter === val ? '#2563EB' : 'var(--bg-input)',
                            borderColor: filter === val ? '#3B82F6' : 'var(--border)',
                            color: filter === val ? '#fff' : 'var(--text-secondary)',
                        }}>{label}</button>
                ))}
            </div>

            {loading ? <div className="flex justify-center py-20"><Spinner size={36} /></div>
            : filtered.length === 0 ? <EmptyState icon={FileCheck} title="No Verifications" description="No submissions match the selected filter." />
            : (
                <div className="card overflow-hidden p-0">
                    <table className="w-full">
                        <thead style={{ backgroundColor: 'var(--bg-input)', borderBottom: '1px solid var(--border)' }}>
                            <tr>{['Borrower', 'Loan ID', 'Type', 'Serial', 'GPS', 'Risk Score', 'Risk Level', 'Status', 'Date', 'Action'].map(h => <th key={h} className="th">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {filtered.map(v => (
                                <tr key={v._id} className="table-row">
                                    <td className="td font-medium" style={{ color: 'var(--text-primary)' }}>{v.submission?.borrower?.name || '—'}</td>
                                    <td className="td font-mono text-xs text-primary-500">{v.submission?.loan?.loanId || '—'}</td>
                                    <td className="td text-xs">{v.submission?.submissionType}</td>
                                    <td className="td">{v.serialMatch ? <CheckCircle size={14} className="text-emerald-500" /> : <AlertTriangle size={14} className="text-red-500" />}</td>
                                    <td className="td">{v.gpsVerified ? <MapPin size={14} className="text-emerald-500" /> : <MapPin size={14} className="text-red-500" />}</td>
                                    <td className="td font-bold" style={{ color: 'var(--text-primary)' }}>{v.riskScore}/100</td>
                                    <td className="td"><RiskBadge level={v.riskLevel} /></td>
                                    <td className="td"><StatusBadge status={v.verificationStatus} /></td>
                                    <td className="td text-xs">{v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '—'}</td>
                                    <td className="td">
                                        <Link to={`/officer/verifications/${v._id}`} className="btn-secondary text-xs !py-1 !px-2">
                                            <ExternalLink size={12} /> Review
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </OfficerLayout>
    );
};

export default OfficerVerifications;
