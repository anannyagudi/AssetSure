import React, { useEffect, useState } from 'react';
import { BorrowerLayout } from '../../layouts/DashboardLayout';
import { SectionHeader, StatusBadge, InfoRow, Spinner, EmptyState } from '../../components/UI';
import { getAssets } from '../../services/api';
import { Cpu, MapPin } from 'lucide-react';

const BorrowerMachine = () => {
    const [asset, setAsset] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAssets().then(r => setAsset(r.data[0] || null)).catch(console.error).finally(() => setLoading(false));
    }, []);

    return (
        <BorrowerLayout>
            <SectionHeader title="My Machine" subtitle="Details of the machinery financed through your loan." />
            {loading ? <div className="flex justify-center py-20"><Spinner size={36} /></div>
                : !asset ? <EmptyState icon={Cpu} title="No Machine Found" description="Your bank officer needs to register the financed machine first." />
                    : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="card">
                                    <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Machine Details</h2>
                                    <InfoRow label="Machine Name" value={asset.machineName} />
                                    <InfoRow label="Machine Type" value={asset.machineType} />
                                    <InfoRow label="Manufacturer" value={asset.manufacturer} />
                                    <InfoRow label="Model" value={asset.model} />
                                    <InfoRow label="Serial Number" value={asset.serialNumber} />
                                    <InfoRow label="Purchase Price" value={`₹${asset.purchasePrice?.toLocaleString()}`} />
                                    <InfoRow label="Dealer" value={asset.dealerName} />
                                    <InfoRow label="Purchase Date" value={asset.purchaseDate ? new Date(asset.purchaseDate).toDateString() : 'N/A'} />
                                </div>
                                <div className="card">
                                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                                        <MapPin size={18} className="text-primary-500" /> Registered Location
                                    </h2>
                                    <InfoRow label="Address" value={asset.registeredAddress} />
                                    <InfoRow label="Latitude" value={asset.registeredLatitude} />
                                    <InfoRow label="Longitude" value={asset.registeredLongitude} />
                                    <InfoRow label="Allowed Radius" value={`${asset.expectedLocationRadius} km`} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="card-sm">
                                    <p className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-secondary)' }}>Asset Status</p>
                                    <StatusBadge status={asset.assetStatus} />
                                </div>
                                <div className="card-sm">
                                    <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>Asset ID</p>
                                    <p className="text-sm font-mono text-primary-500">{asset.assetId}</p>
                                </div>
                                <div className="card-sm">
                                    <p className="text-xs font-semibold uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>Serial Number</p>
                                    <p className="text-sm font-mono text-amber-500 break-all">{asset.serialNumber}</p>
                                </div>
                            </div>
                        </div>
                    )}
        </BorrowerLayout>
    );
};

export default BorrowerMachine;
