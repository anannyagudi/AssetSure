import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { OfficerLayout } from '../../layouts/DashboardLayout';
import { SectionHeader, Spinner, EmptyState, RiskBadge, StatusBadge } from '../../components/UI';
import { getVerifications } from '../../services/api';
import { History, ExternalLink } from 'lucide-react';

const OfficerHistory = () => {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getVerifications().then(r => setVerifications(r.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    return (
        <OfficerLayout>
            <SectionHeader title="Verification History" subtitle={`All ${verifications.length} submissions`} />
            {loading ? <div className="flex justify-center py-20"><Spinner size={36} /></div>
            : verifications.length === 0 ? <EmptyState icon={History} title="No History" />
            : (
                <div className="card overflow-hidden p-0">
                    <table className="w-full">
                        <thead style={{ backgroundColor: 'var(--bg-input)', borderBottom: '1px solid var(--border)' }}>
                            <tr>{['Borrower', 'Loan', 'Type', 'Risk', 'Score', 'GPS', 'Serial', 'Status', 'Date', ''].map(h => <th key={h} className="th">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {verifications.map(v => (
                                <tr key={v._id} className="table-row">
                                    <td className="td font-medium" style={{ color: 'var(--text-primary)' }}>{v.submission?.borrower?.name}</td>
                                    <td className="td font-mono text-xs text-primary-500">{v.submission?.loan?.loanId}</td>
                                    <td className="td text-xs">{v.submission?.submissionType}</td>
                                    <td className="td"><RiskBadge level={v.riskLevel} /></td>
                                    <td className="td font-bold" style={{ color: 'var(--text-primary)' }}>{v.riskScore}</td>
                                    <td className="td text-xs">{v.gpsVerified ? '✓' : '⚠'} {v.distanceFromRegisteredLocation?.toFixed(1)}km</td>
                                    <td className="td text-xs">{v.serialMatch ? '✓' : '⚠'}</td>
                                    <td className="td"><StatusBadge status={v.verificationStatus} /></td>
                                    <td className="td text-xs">{v.createdAt ? new Date(v.createdAt).toLocaleDateString() : '—'}</td>
                                    <td className="td">
                                        <Link to={`/officer/verifications/${v._id}`} className="text-primary-500 hover:text-primary-400">
                                            <ExternalLink size={14} />
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

export default OfficerHistory;
