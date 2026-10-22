import React, { useEffect, useState } from 'react';
import { OfficerLayout } from '../../layouts/DashboardLayout';
import { SectionHeader, Spinner, EmptyState, StatusBadge } from '../../components/UI';
import { getAllBorrowers } from '../../services/api';
import { Users, Phone, Mail } from 'lucide-react';

const OfficerBorrowers = () => {
    const [borrowers, setBorrowers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllBorrowers().then(r => setBorrowers(r.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    return (
        <OfficerLayout>
            <SectionHeader title="Borrowers" subtitle={`${borrowers.length} registered borrower(s)`} />
            {loading ? <div className="flex justify-center py-20"><Spinner size={36} /></div>
            : borrowers.length === 0 ? <EmptyState icon={Users} title="No Borrowers" description="No borrowers have registered yet." />
            : (
                <div className="card overflow-hidden p-0">
                    <table className="w-full">
                        <thead style={{ backgroundColor: 'var(--bg-input)', borderBottom: '1px solid var(--border)' }}>
                            <tr>
                                {['Name', 'Email', 'Phone', 'Loan ID', 'Loan Status', 'Joined'].map(h => <th key={h} className="th">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {borrowers.map(b => (
                                <tr key={b._id} className="table-row">
                                    <td className="td font-medium" style={{ color: 'var(--text-primary)' }}>{b.name}</td>
                                    <td className="td"><span className="flex items-center gap-1"><Mail size={12} style={{ color: 'var(--text-muted)' }} />{b.email}</span></td>
                                    <td className="td"><span className="flex items-center gap-1"><Phone size={12} style={{ color: 'var(--text-muted)' }} />{b.phone}</span></td>
                                    <td className="td font-mono text-xs text-primary-500">{b.loan?.loanId || '—'}</td>
                                    <td className="td">{b.loan ? <StatusBadge status={b.loan.loanStatus} /> : '—'}</td>
                                    <td className="td text-xs">{new Date(b.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </OfficerLayout>
    );
};

export default OfficerBorrowers;
