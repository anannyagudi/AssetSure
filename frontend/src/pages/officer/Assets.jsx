import React, { useEffect, useState } from 'react';
import { OfficerLayout } from '../../layouts/DashboardLayout';
import { SectionHeader, Spinner, EmptyState, Modal } from '../../components/UI';
import { getAssets, getLoans, getAllBorrowers, createAsset } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Cpu, Plus } from 'lucide-react';

const OfficerAssets = () => {
    const [assets, setAssets] = useState([]);
    const [loans, setLoans] = useState([]);
    const [borrowers, setBorrowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        loanId: '', borrowerId: '', machineName: '', machineType: '', manufacturer: '',
        model: '', serialNumber: '', purchasePrice: '', dealerName: '',
        registeredLatitude: '', registeredLongitude: '', registeredAddress: '',
        expectedLocationRadius: '2', purchaseDate: ''
    });
    const addToast = useToast();

    const load = () => {
        setLoading(true);
        Promise.all([getAssets(), getLoans(), getAllBorrowers()])
            .then(([a, l, b]) => { setAssets(a.data); setLoans(l.data); setBorrowers(b.data); })
            .catch(console.error).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createAsset(form);
            addToast('Asset registered!', 'success');
            setShowModal(false);
            load();
        } catch (err) {
            addToast(err.response?.data?.error || 'Failed to register asset', 'error');
        } finally { setSubmitting(false); }
    };

    return (
        <OfficerLayout>
            <SectionHeader title="Assets / Machines" subtitle={`${assets.length} registered asset(s)`}
                action={<button onClick={() => setShowModal(true)} className="btn-primary"><Plus size={16} /> Register Asset</button>} />
            {loading ? <div className="flex justify-center py-20"><Spinner size={36} /></div>
            : assets.length === 0 ? <EmptyState icon={Cpu} title="No Assets" />
            : (
                <div className="card overflow-hidden p-0">
                    <table className="w-full">
                        <thead style={{ backgroundColor: 'var(--bg-input)', borderBottom: '1px solid var(--border)' }}>
                            <tr>{['Asset ID', 'Machine', 'Serial No.', 'Borrower', 'Purchase Price', 'Radius', 'Status'].map(h => <th key={h} className="th">{h}</th>)}</tr>
                        </thead>
                        <tbody>
                            {assets.map(a => (
                                <tr key={a._id} className="table-row">
                                    <td className="td font-mono text-xs text-primary-500">{a.assetId}</td>
                                    <td className="td">
                                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{a.machineName}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{a.manufacturer} {a.model}</p>
                                    </td>
                                    <td className="td font-mono text-xs text-amber-500">{a.serialNumber}</td>
                                    <td className="td">{a.borrower?.name}</td>
                                    <td className="td">₹{a.purchasePrice?.toLocaleString()}</td>
                                    <td className="td">{a.expectedLocationRadius} km</td>
                                    <td className="td"><span className={`badge-${a.assetStatus === 'Verified' ? 'verified' : a.assetStatus === 'Flagged' ? 'flagged' : 'pending'}`}>{a.assetStatus}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal open={showModal} onClose={() => setShowModal(false)} title="Register Machine Asset">
                <form onSubmit={handleCreate} className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                    <div><label className="label">Loan</label>
                        <select name="loanId" value={form.loanId} onChange={onChange} required className="input">
                            <option value="">Select loan...</option>
                            {loans.map(l => <option key={l._id} value={l._id}>{l.loanId} — {l.borrower?.name}</option>)}
                        </select>
                    </div>
                    <div><label className="label">Borrower</label>
                        <select name="borrowerId" value={form.borrowerId} onChange={onChange} required className="input">
                            <option value="">Select borrower...</option>
                            {borrowers.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                    </div>
                    {[
                        ['machineName','Machine Name','text'], ['machineType','Machine Type','text'],
                        ['manufacturer','Manufacturer','text'], ['model','Model','text'],
                        ['serialNumber','Serial Number','text'], ['purchasePrice','Purchase Price (₹)','number'],
                        ['dealerName','Dealer Name','text'], ['purchaseDate','Purchase Date','date'],
                        ['registeredLatitude','Registered Latitude','number'], ['registeredLongitude','Registered Longitude','number'],
                        ['registeredAddress','Registered Address','text'], ['expectedLocationRadius','Allowed Radius (km)','number'],
                    ].map(([name, label, type]) => (
                        <div key={name}><label className="label">{label}</label>
                            <input name={name} type={type} value={form[name]} onChange={onChange} required className="input" />
                        </div>
                    ))}
                    <button type="submit" disabled={submitting} className="btn-primary w-full justify-center mt-2">
                        {submitting ? 'Registering...' : 'Register Asset'}
                    </button>
                </form>
            </Modal>
        </OfficerLayout>
    );
};

export default OfficerAssets;
