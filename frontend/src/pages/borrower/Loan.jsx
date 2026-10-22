import React, { useEffect, useState } from 'react';
import { BorrowerLayout } from '../../layouts/DashboardLayout';
import { SectionHeader, StatusBadge, InfoRow, Spinner, EmptyState } from '../../components/UI';
import { getLoans } from '../../services/api';
import { CreditCard } from 'lucide-react';

const BorrowerLoan = () => {
    const [loan, setLoan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLoans().then(r => setLoan(r.data[0] || null)).catch(console.error).finally(() => setLoading(false));
    }, []);

    return (
        <BorrowerLayout>
            <SectionHeader title="My Loan" subtitle="View your active loan details and status." />
            {loading ? <div className="flex justify-center py-20"><Spinner size={36} /></div>
            : !loan ? <EmptyState icon={CreditCard} title="No Loan Found" description="No loan has been registered for your account yet. Contact your bank officer." />
            : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Loan Details</h2>
                            <StatusBadge status={loan.loanStatus} />
                        </div>
                        <div className="space-y-0">
                            <InfoRow label="Loan ID" value={loan.loanId} />
                            <InfoRow label="Loan Amount" value={`₹${loan.loanAmount?.toLocaleString()}`} />
                            <InfoRow label="Loan Type" value={loan.loanType} />
                            <InfoRow label="Purpose" value={loan.purpose} />
                            <InfoRow label="Tenure" value={`${loan.tenure} months`} />
                            <InfoRow label="Interest Rate" value={`${loan.interestRate}% per annum`} />
                            <InfoRow label="Application Date" value={loan.applicationDate ? new Date(loan.applicationDate).toDateString() : 'N/A'} />
                            <InfoRow label="Approval Date" value={loan.approvalDate ? new Date(loan.approvalDate).toDateString() : 'Pending'} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="card-sm" style={{ backgroundColor: 'rgba(37,99,235,0.1)', borderColor: 'rgba(37,99,235,0.3)' }}>
                            <p className="text-xs font-semibold text-primary-500 uppercase mb-1">Loan Amount</p>
                            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>₹{(loan.loanAmount / 100000).toFixed(1)}L</p>
                        </div>
                        <div className="card-sm">
                            <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>EMI Tenure</p>
                            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{loan.tenure} <span className="text-sm font-normal" style={{ color: 'var(--text-secondary)' }}>months</span></p>
                        </div>
                        <div className="card-sm">
                            <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>Interest Rate</p>
                            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{loan.interestRate}<span className="text-sm font-normal" style={{ color: 'var(--text-secondary)' }}>%</span></p>
                        </div>
                    </div>
                </div>
            )}
        </BorrowerLayout>
    );
};

export default BorrowerLoan;
