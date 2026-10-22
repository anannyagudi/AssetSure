import React, { useEffect, useState } from 'react';
import { BorrowerLayout } from '../../layouts/DashboardLayout';
import { SectionHeader, Spinner, EmptyState, Modal } from '../../components/UI';
import { getMonitoringRequests, submitMonitoringResponse } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { MonitorCheck, Upload, MapPin, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const BorrowerMonitoring = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [files, setFiles] = useState({ machinePhotos: [], serialPhoto: null });
    const [gps, setGps] = useState(null);
    const [gpsLoading, setGpsLoading] = useState(false);
    const addToast = useToast();

    useEffect(() => {
        getMonitoringRequests().then(r => setRequests(r.data)).catch(console.error).finally(() => setLoading(false));
    }, []);

    const getLocation = () => {
        if (!navigator.geolocation) { addToast('Geolocation not supported', 'error'); return; }
        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
            pos => { setGps({ lat: pos.coords.latitude, lon: pos.coords.longitude, ts: new Date().toISOString() }); setGpsLoading(false); addToast('Location captured!', 'success'); },
            err => { addToast(err.code === 1 ? 'Location permission denied.' : 'Could not get location.', 'error'); setGpsLoading(false); }
        );
    };

    const handleSubmit = async () => {
        if (!gps) { addToast('GPS location is required', 'error'); return; }
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('submittedLatitude', gps.lat);
            fd.append('submittedLongitude', gps.lon);
            files.machinePhotos.forEach(f => fd.append('machinePhotos', f));
            if (files.serialPhoto) fd.append('serialPhoto', files.serialPhoto);
            await submitMonitoringResponse(selected._id, fd);
            addToast('Monitoring response submitted!', 'success');
            setSelected(null);
            setGps(null);
            setFiles({ machinePhotos: [], serialPhoto: null });
            getMonitoringRequests().then(r => setRequests(r.data));
        } catch (err) {
            addToast(err.response?.data?.error || 'Submission failed', 'error');
        } finally { setSubmitting(false); }
    };

    const statusIcon = (s) => s === 'Submitted' ? <CheckCircle size={14} className="text-emerald-500" /> : s === 'Overdue' ? <AlertTriangle size={14} className="text-red-500" /> : <Clock size={14} className="text-amber-500" />;

    return (
        <BorrowerLayout>
            <SectionHeader title="Monitoring Requests" subtitle="Respond to bank officer monitoring requests." />
            {loading ? <div className="flex justify-center py-20"><Spinner size={36} /></div>
            : requests.length === 0 ? <EmptyState icon={MonitorCheck} title="No Monitoring Requests" description="No active monitoring requests from your bank officer." />
            : (
                <div className="space-y-4">
                    {requests.map(req => (
                        <div key={req._id} className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    {statusIcon(req.status)}
                                    <span className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>{req.status}</span>
                                </div>
                                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{req.asset?.machineName || 'Machine'}</p>
                                <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{req.requestReason}</p>
                                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Due: {req.dueDate ? new Date(req.dueDate).toDateString() : 'N/A'}</p>
                                {req.requestedEvidence?.length > 0 && (
                                    <div className="flex gap-1 mt-2 flex-wrap">
                                        {req.requestedEvidence.map(e => <span key={e} className="badge-review">{e}</span>)}
                                    </div>
                                )}
                            </div>
                            {req.status === 'Pending' && (
                                <button onClick={() => setSelected(req)} className="btn-primary shrink-0">
                                    <Upload size={16} /> Submit Response
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Modal open={!!selected} onClose={() => setSelected(null)} title="Submit Monitoring Response">
                <div className="space-y-4">
                    <div>
                        <label className="label">Machine Photos</label>
                        <input type="file" accept="image/*" multiple onChange={e => setFiles(f => ({ ...f, machinePhotos: Array.from(e.target.files) }))} className="input text-sm" />
                        {files.machinePhotos.length > 0 && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{files.machinePhotos.length} file(s) selected</p>}
                    </div>
                    <div>
                        <label className="label">Serial Number Photo</label>
                        <input type="file" accept="image/*" onChange={e => setFiles(f => ({ ...f, serialPhoto: e.target.files[0] }))} className="input text-sm" />
                    </div>
                    <div>
                        <label className="label">Current GPS Location</label>
                        {gps ? (
                            <div className="rounded-lg p-3 text-sm" style={{ backgroundColor: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.3)' }}>
                                <p className="text-emerald-500 font-semibold flex items-center gap-1"><CheckCircle size={14} /> Location Captured</p>
                                <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Lat: {gps.lat.toFixed(4)}, Lon: {gps.lon.toFixed(4)}</p>
                            </div>
                        ) : (
                            <button onClick={getLocation} disabled={gpsLoading} className="btn-secondary w-full justify-center">
                                <MapPin size={16} /> {gpsLoading ? 'Getting location...' : 'Verify Current Location'}
                            </button>
                        )}
                    </div>
                    <button onClick={handleSubmit} disabled={submitting || !gps} className="btn-primary w-full justify-center">
                        {submitting ? 'Submitting...' : 'Submit Response'}
                    </button>
                </div>
            </Modal>
        </BorrowerLayout>
    );
};

export default BorrowerMonitoring;
