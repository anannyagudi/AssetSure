import React, { useEffect, useState } from 'react';
import { OfficerLayout } from '../../layouts/DashboardLayout';
import { StatCard, SectionHeader, Spinner } from '../../components/UI';
import { getOfficerDashboard } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { Users, CreditCard, MonitorCheck, FileCheck, ShieldAlert, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const RISK_COLORS = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444' };

const OfficerDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useTheme();

    useEffect(() => {
        getOfficerDashboard().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    if (loading) return <OfficerLayout><div className="flex justify-center py-20"><Spinner size={36} /></div></OfficerLayout>;

    const { stats = {}, riskDistribution = [], monthlyActivity = [] } = data || {};
    const riskPieData = riskDistribution.map(r => ({ name: r._id, value: r.count, fill: RISK_COLORS[r._id] || '#64748b' }));
    const monthlyChartData = monthlyActivity.map(m => ({
        name: `${m._id.month}/${String(m._id.year).slice(-2)}`, count: m.count
    }));

    // Theme-aware chart styles
    const tooltipStyle = theme === 'dark'
        ? { background: '#1e293b', border: '1px solid #475569', color: '#e2e8f0' }
        : { background: '#ffffff', border: '1px solid #E2E8F0', color: '#0F172A' };
    const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b';

    return (
        <OfficerLayout>
            <SectionHeader title="Officer Dashboard" subtitle="System-wide analytics and verification overview." />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="Total Borrowers" value={stats.totalBorrowers} icon={Users} color="blue" />
                <StatCard title="Active Loans" value={stats.activeLoans} icon={CreditCard} color="primary" />
                <StatCard title="Pending Verifications" value={stats.pendingVerifications} icon={Clock} color="amber" />
                <StatCard title="Verified Cases" value={stats.verifiedCases} icon={CheckCircle} color="green" />
                <StatCard title="Flagged Cases" value={stats.flaggedCases} icon={AlertTriangle} color="red" />
                <StatCard title="High Risk" value={stats.highRiskCases} icon={ShieldAlert} color="red" />
                <StatCard title="Pending Monitoring" value={stats.pendingMonitoring} icon={MonitorCheck} color="amber" />
                <StatCard title="Under Monitoring" value={stats.machinesUnderMonitoring} icon={FileCheck} color="blue" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Distribution */}
                <div className="card">
                    <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Risk Distribution</h3>
                    {riskPieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={riskPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}
                                    label={({ name, value }) => `${name}: ${value}`}>
                                    {riskPieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p className="text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>No data yet</p>}
                </div>

                {/* Monthly Activity */}
                <div className="card">
                    <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Monthly Verification Activity</h3>
                    {monthlyChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={monthlyChartData}>
                                <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 11 }} />
                                <YAxis tick={{ fill: tickColor, fontSize: 11 }} />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : <p className="text-sm text-center py-12" style={{ color: 'var(--text-muted)' }}>No monthly data yet</p>}
                </div>
            </div>
        </OfficerLayout>
    );
};

export default OfficerDashboard;
