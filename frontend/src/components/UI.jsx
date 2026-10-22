import React from 'react';

export const RiskBadge = ({ level }) => {
    const cls = level === 'LOW' ? 'badge-low' : level === 'MEDIUM' ? 'badge-medium' : 'badge-high';
    return <span className={cls}>{level}</span>;
};

export const StatusBadge = ({ status }) => {
    const map = {
        'Verified': 'badge-verified',
        'Pending': 'badge-pending',
        'Flagged': 'badge-flagged',
        'Under Review': 'badge-review',
        'Additional Evidence Required': 'badge-review',
        'Active': 'badge-verified',
        'Under Verification': 'badge-pending',
        'Closed': 'badge-review',
    };
    const cls = map[status] || 'badge-pending';
    return <span className={cls}>{status}</span>;
};

export const Spinner = ({ size = 20 }) => (
    <div className="animate-spin rounded-full border-b-2 border-primary-500"
         style={{ width: size, height: size }} />
);

export const EmptyState = ({ icon: Icon, title, description }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
        {Icon && <Icon size={48} className="mb-4" style={{ color: 'var(--text-muted)' }} />}
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        {description && <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>{description}</p>}
    </div>
);

export const StatCard = ({ title, value, icon: Icon, color = 'primary', subtitle }) => {
    const darkColorMap = {
        primary: { text: '#60A5FA', bg: 'rgba(30,58,138,0.3)' },
        green:   { text: '#34D399', bg: 'rgba(6,78,59,0.3)' },
        red:     { text: '#F87171', bg: 'rgba(127,29,29,0.3)' },
        amber:   { text: '#FBBF24', bg: 'rgba(120,53,15,0.3)' },
        blue:    { text: '#60A5FA', bg: 'rgba(30,58,138,0.3)' },
    };
    const lightColorMap = {
        primary: { text: '#2563EB', bg: 'rgba(219,234,254,0.8)' },
        green:   { text: '#059669', bg: 'rgba(209,250,229,0.8)' },
        red:     { text: '#DC2626', bg: 'rgba(254,226,226,0.8)' },
        amber:   { text: '#D97706', bg: 'rgba(254,243,199,0.8)' },
        blue:    { text: '#2563EB', bg: 'rgba(219,234,254,0.8)' },
    };

    // We use a CSS-variable trick: read the current theme
    // by checking if :root has the 'dark' class. We use data-attrs for toggling icon style.
    const isDark = document.documentElement.classList.contains('dark');
    const colorSet = isDark ? (darkColorMap[color] || darkColorMap.primary) : (lightColorMap[color] || lightColorMap.primary);

    return (
        <div className="stat-card">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{title}</p>
                    <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{value ?? '—'}</p>
                    {subtitle && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
                </div>
                {Icon && (
                    <div className="p-3 rounded-xl" style={{ backgroundColor: colorSet.bg }}>
                        <Icon size={22} style={{ color: colorSet.text }} />
                    </div>
                )}
            </div>
        </div>
    );
};

export const SectionHeader = ({ title, subtitle, action }) => (
    <div className="flex items-start justify-between mb-6">
        <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h1>
            {subtitle && <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>}
        </div>
        {action}
    </div>
);

export const Modal = ({ open, onClose, title, children }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="rounded-2xl p-6 w-full max-w-md shadow-2xl border"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{title}</h2>
                    <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}
                        className="hover:opacity-75 transition-opacity">✕</button>
                </div>
                {children}
            </div>
        </div>
    );
};

export const InfoRow = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 last:border-0"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs font-medium sm:min-w-[180px] uppercase tracking-wide"
            style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{value ?? '—'}</span>
    </div>
);
