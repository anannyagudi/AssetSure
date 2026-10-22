import React from 'react';
import { BorrowerLayout } from '../../layouts/DashboardLayout';
import { SectionHeader, InfoRow } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';

const BorrowerProfile = () => {
    const { user } = useAuth();
    return (
        <BorrowerLayout>
            <SectionHeader title="My Profile" subtitle="Your account information." />
            <div className="card max-w-xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-primary-500"
                        style={{ backgroundColor: 'rgba(37,99,235,0.1)', border: '2px solid rgba(37,99,235,0.3)' }}>
                        {user?.name?.[0] || '?'}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{user?.name}</h2>
                        <span className="badge-review mt-1">Borrower</span>
                    </div>
                </div>
                <InfoRow label="Full Name" value={user?.name} />
                <InfoRow label="Email Address" value={user?.email} />
                <InfoRow label="Phone Number" value={user?.phone} />
                <InfoRow label="Account Role" value="Borrower" />
            </div>
        </BorrowerLayout>
    );
};

export default BorrowerProfile;
