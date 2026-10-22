import React, { useEffect, useState } from 'react';
import { OfficerLayout } from '../../layouts/DashboardLayout';
import { SectionHeader, Spinner, EmptyState, RiskBadge, StatusBadge, Modal } from '../../components/UI';
import { getMonitoringRequests, getAssets, getAllBorrowers, createMonitoringRequest } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { MonitorCheck, Plus, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const OfficerMonitoring = () => {
    const [requests, setRequests] = useState([]);
    const [assets, setAssets] = useState([]);
    const [borrowers, setBorrowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ loanId: '', borrowerId: '', assetId: '', requestReason: '', dueDate: '', requestedEvidence: [] });
    const addToast = useToast();

    const load = () => {
        setLoading(true);
        Promise.all([getMonitoringRequests(), getAssets(), getAllBorrowers()])
            .then(([r, a, b]) => { setRequests(r.data); setAssets(a.data); setBorrowers(b.data); })
            .catch(console.error).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    const toggleEvidence = (ev) => setForm(f => ({
        ...f,
        requestedEvidence: f.requestedEvidence.includes(ev) ? f.requestedEvidence.filter(e => e !== ev) : [...f.requestedEvidence, ev]
    }));

    const handleAssetChange = (e) => {
        const assetId = e.target.value;
        const asset = assets.find(a => a._id === assetId);
        setForm(f => ({ ...f, assetId, loanId: asset?.loan?._id || asset?.loan || '', borrowerId: asset?.borrower?._id || asset?.borrower || '' }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createMonitoringRequest(form);
            addToast('Monitoring request created!', 'success');
            setShowModal(false);
            load();
        } catch (err) {
            addToast(err.response?.data?.error || 'Failed', 'error');
        } finally { setSubmitting(false); }
    };

    const statusIcon = (s) => s === 'Submitted' ? <CheckCircle size={14} className="text-emerald-500" /> : s === 'Overdue' ? <AlertTriangle size={14} className="text-red-500" /> : <Clock size={14} className="text-amber-500" />;

    return (
        <OfficerLayout>
            <SectionHeader title="Monitoring Requests" subtitle={`${requests.length} request(s)`}
                action={<button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={16} /> New Request</button>} />

            {loading ? <div className="flex justify-center py-20"><Spinner size={36} /></div>
            : requests.length === 0 ? <EmptyState icon={MonitorCheck} title="No Monitoring Requests" />
            : (
                <div className="card overflow-hidden p-0">
                    <table className="w-full">
                        <thead style={{ backgroundColor: 'var(--bg-input)', borderBottom: '1px solid var(--border)' }}>
                            <tr>{['Borrower', 'Machine', 'Reason', 'Due Date', 'Status', 'Created'].map(h => <th key={h} className="th">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {requests.map(r => (
                                <tr key={r._id} className="table-row">
                                    <td className="td font-medium" style={{ color: 'var(--text-primary)' }}>{r.borrower?.name}</td>
                                    <td className="td">{r.asset?.machineName}</td>
                                    <td className="td max-w-xs truncate">{r.requestReason}</td>
                                    <td className="td text-xs">{r.dueDate ? new Date(r.dueDate).toDateString() : '—'}</td>
                                    <td className="td"><span className="flex items-center gap-1">{statusIcon(r.status)}<span className="text-xs">{r.status}</span></span></td>
                                    <td className="td text-xs">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Monitoring Request">
                <form onSubmit={handleCreate} className="space-y-3">
                    <div><label className="label">Asset / Machine</label>
                        <select name="assetId" value={form.assetId} onChange={handleAssetChange} required className="input">
                            <option value="">Select asset...</option>
                            {assets.map(a => <option key={a._id} value={a._id}>{a.machineName} ({a.borrower?.name || 'Borrower'})</option>)}
                        </select>
                    </div>
                    <div><label className="label">Reason for Monitoring</label>
                        <textarea name="requestReason" value={form.requestReason} onChange={onChange} required rows={2} className="input resize-none" />
                    </div>
                    <div><label className="label">Due Date</label>
                        <input name="dueDate" type="date" value={form.dueDate} onChange={onChange} required className="input" />
                    </div>
                    <div>
                        <label className="label">Requested Evidence</label>
                        <div className="flex flex-wrap gap-2">
                            {['Machine Photo', 'GPS', 'Serial Photo', 'Invoice'].map(ev => {
                                const active = form.requestedEvidence.includes(ev);
                                return (
                                    <button type="button" key={ev} onClick={() => toggleEvidence(ev)}
                                        className="px-3 py-1 rounded-lg text-xs font-medium border transition-colors"
                                        style={{
                                            backgroundColor: active ? '#1D4ED8' : 'var(--bg-input)',
                                            borderColor: active ? '#3B82F6' : 'var(--border)',
                                            color: active ? '#fff' : 'var(--text-secondary)',
                                        }}>{ev}</button>
                                );
                            })}
                        </div>
                    </div>
                    <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
                        {submitting ? 'Creating...' : 'Create Request'}
                    </button>
                </form>
            </Modal>
        </OfficerLayout>
    );
};

export default OfficerMonitoring;
