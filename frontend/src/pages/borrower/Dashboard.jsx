import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BorrowerLayout } from '../../layouts/DashboardLayout';
import { StatCard, RiskBadge, StatusBadge, Spinner, EmptyState } from '../../components/UI';
import { getBorrowerDashboard } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, Cpu, FileCheck, MonitorCheck, ArrowRight, Clock } from 'lucide-react';

const BorrowerDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getBorrowerDashboard().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    const steps = [
        { label: 'Loan Approved', done: !!data?.loan },
        { label: 'Machine Registered', done: !!data?.asset },
        { label: 'Evidence Submitted', done: data?.submissionCount > 0 },
        { label: 'Verification', done: !!data?.latestVerification },
        { label: 'Monitoring', done: false },
    ];

    return (
        <BorrowerLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
                <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Here's an overview of your loan verification status.</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Spinner size={36} /></div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                        <StatCard title="Loan Status" value={data?.loan?.loanStatus || 'N/A'} icon={CreditCard} color="primary" />
                        <StatCard title="Asset Status" value={data?.asset?.assetStatus || 'N/A'} icon={Cpu} color="blue" />
                        <StatCard title="Risk Level" value={data?.latestVerification?.riskLevel || 'N/A'} icon={FileCheck}
                            color={data?.latestVerification?.riskLevel === 'HIGH' ? 'red' : data?.latestVerification?.riskLevel === 'MEDIUM' ? 'amber' : 'green'} />
                        <StatCard title="Pending Monitoring" value={data?.pendingMonitoring || 0} icon={MonitorCheck} color="amber" />
                    </div>

                    {/* Verification Timeline */}
                    <div className="card mb-6">
                        <h2 className="text-lg font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Verification Journey</h2>
                        <div className="flex flex-wrap gap-0">
                            {steps.map((step, i) => (
                                <div key={i} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step.done ? 'bg-primary-600 border-primary-600 text-white' : ''}`}
                                            style={step.done ? {} : { borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                                            {step.done ? '✓' : i + 1}
                                        </div>
                                        <p className={`text-xs mt-1 font-medium text-center max-w-[80px] ${step.done ? 'text-primary-500' : ''}`}
                                            style={step.done ? {} : { color: 'var(--text-muted)' }}>{step.label}</p>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div className={`h-0.5 w-12 mx-1 mb-4 ${step.done ? 'bg-primary-600' : ''}`}
                                            style={step.done ? {} : { backgroundColor: 'var(--border)' }} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { to: '/borrower/verification', label: 'Submit Verification Evidence', icon: FileCheck },
                            { to: '/borrower/monitoring', label: 'View Monitoring Requests', icon: MonitorCheck },
                            { to: '/borrower/history', label: 'Verification History', icon: Clock },
                            { to: '/borrower/reports', label: 'Download Reports', icon: CreditCard },
                        ].map(({ to, label, icon: Icon }) => (
                            <Link key={to} to={to} className="card-sm flex items-center justify-between transition-colors group"
                                style={{ '--hover-border': '#3B82F6' }}>
                                <div className="flex items-center gap-3">
                                    <Icon size={20} className="text-primary-500" />
                                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                                </div>
                                <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </BorrowerLayout>
    );
};

export default BorrowerDashboard;
