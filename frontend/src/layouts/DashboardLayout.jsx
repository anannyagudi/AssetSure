import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    LayoutDashboard, CreditCard, Cpu, FileCheck, MonitorCheck,
    History, FileText, User, LogOut, ChevronLeft, ChevronRight,
    // Users, ShieldAlert, AlertTriangle, Bell, Sun, Moon
    Users, AlertTriangle, Bell, Sun, Moon
} from 'lucide-react';
import AssetSureLogo from '../components/AssetSureLogo';

const borrowerNav = [
    { to: '/borrower/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/borrower/loan', icon: CreditCard, label: 'My Loan' },
    { to: '/borrower/machine', icon: Cpu, label: 'My Machine' },
    { to: '/borrower/verification', icon: FileCheck, label: 'Submit Verification' },
    { to: '/borrower/monitoring', icon: MonitorCheck, label: 'Monitoring Requests' },
    { to: '/borrower/history', icon: History, label: 'Verification History' },
    { to: '/borrower/reports', icon: FileText, label: 'Reports' },
    { to: '/borrower/profile', icon: User, label: 'Profile' },
];

const officerNav = [
    { to: '/officer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/officer/borrowers', icon: Users, label: 'Borrowers' },
    { to: '/officer/loans', icon: CreditCard, label: 'Loans' },
    { to: '/officer/assets', icon: Cpu, label: 'Assets' },
    { to: '/officer/verifications', icon: FileCheck, label: 'Verification Queue' },
    { to: '/officer/monitoring', icon: MonitorCheck, label: 'Monitoring' },
    { to: '/officer/high-risk', icon: AlertTriangle, label: 'High Risk Cases' },
    { to: '/officer/reports', icon: FileText, label: 'Reports' },
    { to: '/officer/history', icon: History, label: 'History' },
    { to: '/officer/profile', icon: User, label: 'Profile' },
];

const Sidebar = ({ variant }) => {
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const navItems = variant === 'officer' ? officerNav : borrowerNav;

    const handleLogout = () => { logout(); navigate('/login'); };

    return (
        <aside
            className={`flex-shrink-0 flex flex-col h-screen sticky top-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}
            style={{ backgroundColor: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}
        >
            {/* Logo */}
            <div
                className={`flex items-center gap-3 px-4 py-5 ${collapsed ? 'justify-center' : ''}`}
                style={{ borderBottom: '1px solid var(--border)' }}
            >
                {/* <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
                    <ShieldAlert size={16} className="text-white" />
                </div> */}
                <div className="flex items-center justify-center shrink-0">
                    <AssetSureLogo size={collapsed ? 32 : 40} />
                </div>
                {!collapsed && (
                    <div>
                        <p className="text-xs font-bold text-primary-500 uppercase tracking-wider leading-tight">AssetSure</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{variant === 'officer' ? 'Bank Officer' : 'Borrower Portal'}</p>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink key={to} to={to}
                        className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`}
                        title={collapsed ? label : ''}>
                        <Icon size={18} className="shrink-0" />
                        {!collapsed && <span>{label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* User + Controls */}
            <div className="p-2 space-y-0.5" style={{ borderTop: '1px solid var(--border)' }}>
                {!collapsed && user && (
                    <div className="px-3 py-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <p className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                        <p className="truncate">{user.email}</p>
                    </div>
                )}

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className={`sidebar-link w-full ${collapsed ? 'justify-center' : ''}`}
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {theme === 'dark'
                        ? <Sun size={18} className="shrink-0 text-amber-400" />
                        : <Moon size={18} className="shrink-0 text-primary-500" />
                    }
                    {!collapsed && (
                        <span style={{ color: 'var(--text-secondary)' }}>
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </span>
                    )}
                </button>

                <button onClick={handleLogout}
                    className={`sidebar-link w-full text-red-500 hover:text-red-400 ${collapsed ? 'justify-center' : ''}`}
                    style={{ '--tw-text-opacity': 1 }}>
                    <LogOut size={18} className="shrink-0" />
                    {!collapsed && <span>Logout</span>}
                </button>
                <button onClick={() => setCollapsed(c => !c)}
                    className={`sidebar-link w-full ${collapsed ? 'justify-center' : ''}`}>
                    {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
                </button>
            </div>
        </aside>
    );
};

export const BorrowerLayout = ({ children }) => (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
        <Sidebar variant="borrower" />
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--bg-page)' }}>
            <div className="max-w-6xl mx-auto p-6">{children}</div>
        </main>
    </div>
);

export const OfficerLayout = ({ children }) => (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-page)' }}>
        <Sidebar variant="officer" />
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--bg-page)' }}>
            <div className="max-w-7xl mx-auto p-6">{children}</div>
        </main>
    </div>
);
