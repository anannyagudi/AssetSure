import React, { useEffect, useState } from 'react';
import { OfficerLayout } from '../../layouts/DashboardLayout';
import { SectionHeader, Spinner, EmptyState, StatusBadge, Modal } from '../../components/UI';
import { getLoans, getAllBorrowers, createLoan } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CreditCard, Plus } from 'lucide-react';

const OfficerLoans = () => {
    const [loans, setLoans] = useState([]);
    const [borrowers, setBorrowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ borrowerId: '', loanAmount: '', loanType: 'Machinery Loan', tenure: '', interestRate: '', purpose: '' });
    const addToast = useToast();

    const load = () => {
        setLoading(true);
        Promise.all([getLoans(), getAllBorrowers()])
            .then(([l, b]) => { setLoans(l.data); setBorrowers(b.data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createLoan(form);
            addToast('Loan created successfully!', 'success');
            setShowModal(false);
            setForm({ borrowerId: '', loanAmount: '', loanType: 'Machinery Loan', tenure: '', interestRate: '', purpose: '' });
            load();
        } catch (err) {
            addToast(err.response?.data?.error || 'Failed to create loan', 'error');
        } finally { setSubmitting(false); }
    };

    return (
        <OfficerLayout>
            <SectionHeader title="Loans" subtitle={`${loans.length} total loan(s)`}
                action={<button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={16} /> Create Loan</button>} />
            {loading ? <div className="flex justify-center py-20"><Spinner size={36} /></div>
            : loans.length === 0 ? <EmptyState icon={CreditCard} title="No Loans" />
            : (
                <div className="card overflow-hidden p-0">
                    <table className="w-full">
                        <thead style={{ backgroundColor: 'var(--bg-input)', borderBottom: '1px solid var(--border)' }}>
                            <tr>{['Loan ID', 'Borrower', 'Amount', 'Purpose', 'Tenure', 'Rate', 'Status'].map(h => <th key={h} className="th">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {loans.map(l => (
                                <tr key={l._id} className="table-row">
                                    <td className="td font-mono text-xs text-primary-500">{l.loanId}</td>
                                    <td className="td font-medium" style={{ color: 'var(--text-primary)' }}>{l.borrower?.name}</td>
                                    <td className="td">₹{l.loanAmount?.toLocaleString()}</td>
                                    <td className="td max-w-xs truncate">{l.purpose}</td>
                                    <td className="td">{l.tenure}m</td>
                                    <td className="td">{l.interestRate}%</td>
                                    <td className="td"><StatusBadge status={l.loanStatus} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal open={showModal} onClose={() => setShowModal(false)} title="Create New Loan">
                <form onSubmit={handleCreate} className="space-y-3">
                    <div>
                        <label className="label">Borrower</label>
                        <select name="borrowerId" value={form.borrowerId} onChange={onChange} required className="input">
                            <option value="">Select borrower...</option>
                            {borrowers.map(b => <option key={b._id} value={b._id}>{b.name} ({b.email})</option>)}
                        </select>
                    </div>
                    {[
                        { name: 'loanAmount', label: 'Loan Amount (₹)', type: 'number' },
                        { name: 'tenure', label: 'Tenure (months)', type: 'number' },
                        { name: 'interestRate', label: 'Interest Rate (%)', type: 'number' },
                        { name: 'purpose', label: 'Purpose', type: 'text' },
                    ].map(({ name, label, type }) => (
                        <div key={name}>
                            <label className="label">{label}</label>
                            <input name={name} type={type} value={form[name]} onChange={onChange} required className="input" />
                        </div>
                    ))}
                    <button type="submit" disabled={submitting} className="btn-primary w-full justify-center mt-2">
                        {submitting ? 'Creating...' : 'Create Loan'}
                    </button>
                </form>
            </Modal>
        </OfficerLayout>
    );
};

export default OfficerLoans;
