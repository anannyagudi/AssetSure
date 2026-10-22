import React, { useState, useEffect } from 'react';
import { BorrowerLayout } from '../../layouts/DashboardLayout';
import { SectionHeader, Spinner, EmptyState, RiskBadge, StatusBadge } from '../../components/UI';
import { useToast } from '../../context/ToastContext';
import { getLoans, getAssets, createSubmission } from '../../services/api';
import { CheckCircle, Upload, MapPin, AlertTriangle, ChevronRight, ChevronLeft, FileText, Camera, Hash } from 'lucide-react';

const STEPS = ['Invoice', 'Machine Photos', 'Serial Number', 'GPS Location', 'Review & Submit'];

const BorrowerVerification = () => {
    const [step, setStep] = useState(0);
    const [loan, setLoan] = useState(null);
    const [asset, setAsset] = useState(null);
    const [invoice, setInvoice] = useState(null);
    const [machinePhotos, setMachinePhotos] = useState([]);
    const [serialPhoto, setSerialPhoto] = useState(null);
    const [gps, setGps] = useState(null);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const addToast = useToast();

    useEffect(() => {
        Promise.all([getLoans(), getAssets()])
            .then(([l, a]) => { setLoan(l.data[0] || null); setAsset(a.data[0] || null); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const getLocation = () => {
        if (!navigator.geolocation) { addToast('Geolocation not supported by your browser', 'error'); return; }
        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
            pos => { setGps({ lat: pos.coords.latitude, lon: pos.coords.longitude, ts: new Date().toISOString() }); setGpsLoading(false); addToast('Location captured!', 'success'); },
            err => { addToast(err.code === 1 ? 'Location permission denied. Please allow location access.' : 'Unable to get location. Try again.', 'error'); setGpsLoading(false); },
            { timeout: 15000 }
        );
    };

    const handleSubmit = async () => {
        if (!loan || !gps) { addToast('Loan/GPS missing', 'error'); return; }
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('loanId', loan._id);
            fd.append('submittedLatitude', gps.lat);
            fd.append('submittedLongitude', gps.lon);
            fd.append('submissionType', 'Initial Verification');
            if (invoice) fd.append('invoice', invoice);
            machinePhotos.forEach(f => fd.append('machinePhotos', f));
            if (serialPhoto) fd.append('serialPhoto', serialPhoto);
            const res = await createSubmission(fd);
            setResult(res.data);
            addToast('Verification submitted successfully!', 'success');
        } catch (err) {
            addToast(err.response?.data?.error || 'Submission failed', 'error');
        } finally { setSubmitting(false); }
    };

    if (loading) return <BorrowerLayout><div className="flex justify-center py-20"><Spinner size={36} /></div></BorrowerLayout>;
    if (!loan || !asset) return <BorrowerLayout><SectionHeader title="Submit Verification" /><EmptyState icon={FileText} title="No Loan/Machine Found" description="Your bank officer must register your loan and machine before you can submit verification." /></BorrowerLayout>;

    if (result) return (
        <BorrowerLayout>
            <div className="card text-center max-w-2xl mx-auto mt-8">
                <CheckCircle size={56} className="text-emerald-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Verification Submitted!</h2>
                <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Your evidence has been received and analyzed. The bank officer will review it shortly.</p>
                <div className="grid grid-cols-3 gap-4 text-left mb-6">
                    <div className="card-sm text-center">
                        <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Risk Score</p>
                        <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{result.riskScore}<span className="text-sm" style={{ color: 'var(--text-muted)' }}>/100</span></p>
                    </div>
                    <div className="card-sm text-center">
                        <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Risk Level</p>
                        <RiskBadge level={result.riskLevel} />
                    </div>
                    <div className="card-sm text-center">
                        <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>GPS</p>
                        <p className={`text-sm font-semibold ${result.locationResult?.verified ? 'text-emerald-500' : 'text-red-500'}`}>{result.locationResult?.verified ? '✓ Verified' : '⚠ Flagged'}</p>
                    </div>
                </div>
                {result.riskFactors?.length > 0 && (
                    <div className="text-left mb-4">
                        <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Risk Factors Detected:</p>
                        {result.riskFactors.map((f, i) => <p key={i} className="text-sm text-red-500">• {f}</p>)}
                    </div>
                )}
                <button onClick={() => { setResult(null); setStep(0); setInvoice(null); setMachinePhotos([]); setSerialPhoto(null); setGps(null); }} className="btn-secondary justify-center">Submit Another</button>
            </div>
        </BorrowerLayout>
    );

    const uploadZoneStyle = (active) => ({
        border: `2px dashed ${active ? '#3B82F6' : 'var(--border)'}`,
        backgroundColor: active ? 'rgba(59,130,246,0.08)' : 'transparent',
    });

    return (
        <BorrowerLayout>
            <SectionHeader title="Submit Verification" subtitle="Submit evidence to verify your financed machine." />

            {/* Step indicator */}
            <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
                {STEPS.map((s, i) => (
                    <React.Fragment key={i}>
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg shrink-0`}
                            style={i === step ? { backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' } : {}}>
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step > i ? 'bg-primary-600 text-white' : ''}`}
                                style={step > i ? {} : i === step
                                    ? { backgroundColor: 'rgba(59,130,246,0.2)', border: '2px solid #3B82F6', color: '#3B82F6' }
                                    : { backgroundColor: 'var(--bg-input)', color: 'var(--text-muted)' }}>
                                {step > i ? '✓' : i + 1}
                            </div>
                            <span className={`text-xs font-medium ${step > i ? 'text-primary-500' : ''}`}
                                style={step <= i ? { color: i === step ? '#3B82F6' : 'var(--text-muted)' } : {}}>
                                {s}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && <div className="h-px w-6 shrink-0" style={{ backgroundColor: 'var(--border)' }} />}
                    </React.Fragment>
                ))}
            </div>

            <div className="card max-w-2xl mx-auto">
                {/* Step 0: Invoice */}
                {step === 0 && (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <FileText size={20} className="text-primary-500" />
                            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Upload Invoice</h2>
                        </div>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Upload the original purchase invoice for the financed machine. OCR will extract key information automatically.</p>
                        <label className="flex flex-col items-center justify-center rounded-xl p-8 cursor-pointer transition-colors"
                            style={uploadZoneStyle(!!invoice)}>
                            <Upload size={32} style={{ color: invoice ? '#3B82F6' : 'var(--text-muted)' }} />
                            <span className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{invoice ? invoice.name : 'Click or drag to upload invoice (PDF/JPG/PNG)'}</span>
                            <input type="file" accept="image/*,application/pdf" className="hidden" onChange={e => setInvoice(e.target.files[0])} />
                        </label>
                        {invoice && <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1"><CheckCircle size={12} /> {invoice.name} selected</p>}
                    </div>
                )}

                {/* Step 1: Machine Photos */}
                {step === 1 && (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Camera size={20} className="text-primary-500" />
                            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Upload Machine Photos</h2>
                        </div>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Upload clear photographs from multiple angles. Required for AI image verification.</p>
                        <label className="flex flex-col items-center justify-center rounded-xl p-8 cursor-pointer transition-colors"
                            style={uploadZoneStyle(machinePhotos.length > 0)}>
                            <Camera size={32} style={{ color: machinePhotos.length > 0 ? '#3B82F6' : 'var(--text-muted)' }} />
                            <span className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{machinePhotos.length > 0 ? `${machinePhotos.length} photo(s) selected` : 'Click to upload machine photos (multiple allowed)'}</span>
                            <input type="file" accept="image/*" multiple className="hidden" onChange={e => setMachinePhotos(Array.from(e.target.files))} />
                        </label>
                        {machinePhotos.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                                {machinePhotos.map((f, i) => (
                                    <span key={i} className="text-xs px-2 py-1 rounded"
                                        style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-secondary)' }}>{f.name}</span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Serial Photo */}
                {step === 2 && (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Hash size={20} className="text-primary-500" />
                            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Upload Serial Number Photo</h2>
                        </div>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Upload a clear close-up photo of the machine's serial number plate. OCR will extract and match against: <span className="font-mono text-amber-500">{asset.serialNumber}</span></p>
                        <label className="flex flex-col items-center justify-center rounded-xl p-8 cursor-pointer transition-colors"
                            style={uploadZoneStyle(!!serialPhoto)}>
                            <Hash size={32} style={{ color: serialPhoto ? '#3B82F6' : 'var(--text-muted)' }} />
                            <span className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{serialPhoto ? serialPhoto.name : 'Click to upload serial number photo'}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={e => setSerialPhoto(e.target.files[0])} />
                        </label>
                        {serialPhoto && <p className="text-xs text-emerald-500 mt-2 flex items-center gap-1"><CheckCircle size={12} /> {serialPhoto.name}</p>}
                    </div>
                )}

                {/* Step 3: GPS */}
                {step === 3 && (
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <MapPin size={20} className="text-primary-500" />
                            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Verify Current Location</h2>
                        </div>
                        <div className="rounded-lg p-4 mb-4 text-sm" style={{ backgroundColor: 'var(--bg-input)' }}>
                            <p style={{ color: 'var(--text-secondary)' }} className="mb-1">Registered Location</p>
                            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{asset.registeredAddress}</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Allowed radius: {asset.expectedLocationRadius} km</p>
                        </div>
                        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Click below to capture your current GPS location. The backend will calculate the distance from the registered location using the Haversine formula.</p>
                        {gps ? (
                            <div className="rounded-xl p-4" style={{ backgroundColor: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.3)' }}>
                                <p className="text-emerald-500 font-semibold flex items-center gap-2"><CheckCircle size={18} /> Location Captured</p>
                                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                                    <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Latitude</p><p className="font-mono" style={{ color: 'var(--text-primary)' }}>{gps.lat.toFixed(6)}</p></div>
                                    <div><p className="text-xs" style={{ color: 'var(--text-muted)' }}>Longitude</p><p className="font-mono" style={{ color: 'var(--text-primary)' }}>{gps.lon.toFixed(6)}</p></div>
                                </div>
                                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>Captured at: {new Date(gps.ts).toLocaleString()}</p>
                                <button onClick={getLocation} className="btn-secondary mt-3 text-xs">Recapture Location</button>
                            </div>
                        ) : (
                            <button onClick={getLocation} disabled={gpsLoading} className="btn-primary w-full justify-center">
                                <MapPin size={16} />
                                {gpsLoading ? 'Getting location...' : 'Verify Current Location'}
                            </button>
                        )}
                        {!navigator.geolocation && (
                            <p className="text-red-500 text-sm mt-3 flex items-center gap-2"><AlertTriangle size={14} /> Your browser does not support geolocation.</p>
                        )}
                    </div>
                )}

                {/* Step 4: Review */}
                {step === 4 && (
                    <div>
                        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Review & Submit</h2>
                        <div className="space-y-2 text-sm mb-6">
                            {[
                                { label: 'Invoice', value: invoice?.name || 'Not uploaded', ok: !!invoice },
                                { label: 'Machine Photos', value: machinePhotos.length > 0 ? `${machinePhotos.length} photo(s)` : 'Not uploaded', ok: machinePhotos.length > 0 },
                                { label: 'Serial Photo', value: serialPhoto?.name || 'Not uploaded', ok: !!serialPhoto },
                                { label: 'GPS Location', value: gps ? `${gps.lat.toFixed(4)}, ${gps.lon.toFixed(4)}` : 'Not captured', ok: !!gps },
                            ].map(({ label, value, ok }) => (
                                <div key={label} className="flex items-center gap-3 p-3 rounded-lg"
                                    style={{ backgroundColor: 'var(--bg-input)' }}>
                                    {ok ? <CheckCircle size={16} className="text-emerald-500 shrink-0" /> : <AlertTriangle size={16} className="text-amber-500 shrink-0" />}
                                    <span className="font-medium min-w-[140px]" style={{ color: 'var(--text-secondary)' }}>{label}:</span>
                                    <span style={{ color: ok ? 'var(--text-primary)' : '#F59E0B' }}>{value}</span>
                                </div>
                            ))}
                        </div>
                        {!gps && <p className="text-red-500 text-sm mb-4 flex items-center gap-2"><AlertTriangle size={14} /> GPS location is required to submit.</p>}
                        <button onClick={handleSubmit} disabled={submitting || !gps} className="btn-primary w-full justify-center">
                            {submitting ? 'Submitting...' : 'Submit Verification'}
                        </button>
                    </div>
                )}

                {/* Nav */}
                <div className="flex gap-3 mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                    {step > 0 && <button onClick={() => setStep(s => s - 1)} className="btn-secondary"><ChevronLeft size={16} /> Back</button>}
                    {step < STEPS.length - 1 && (
                        <button onClick={() => setStep(s => s + 1)} className="btn-primary ml-auto">
                            Next <ChevronRight size={16} />
                        </button>
                    )}
                </div>
            </div>
        </BorrowerLayout>
    );
};

export default BorrowerVerification;
