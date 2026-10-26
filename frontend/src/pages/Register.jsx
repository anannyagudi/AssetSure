// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useToast } from '../context/ToastContext';
// import { ShieldAlert, Mail, Lock, User, Phone, Building2, UserCheck } from 'lucide-react';
// import AuthBackground from '../components/AuthBackground';

// const Register = () => {
//     const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'borrower' });
//     const [loading, setLoading] = useState(false);
//     const { register } = useAuth();
//     const addToast = useToast();
//     const navigate = useNavigate();

//     const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

//     const handleRegister = async (e) => {
//         e.preventDefault();
//         if (form.password.length < 6) { addToast('Password must be at least 6 characters', 'error'); return; }
//         setLoading(true);
//         try {
//             const user = await register(form.name, form.email, form.password, form.phone, form.role);
//             addToast(`Account created successfully as ${user.role === 'bank_officer' ? 'Bank Officer' : 'Borrower'}!`, 'success');
//             navigate(user.role === 'bank_officer' ? '/officer/dashboard' : '/borrower/dashboard', { replace: true });
//         } catch (err) {
//             addToast(err.response?.data?.error || 'Registration failed.', 'error');
//         } finally { setLoading(false); }
//     };


//     return (
//         <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-10 auth-page">
//             {/* Decorative background */}
//             <AuthBackground />
//             <div className="relative w-full max-w-md mx-4" style={{ zIndex: 1 }}>
//                 <div className="text-center mb-6">
//                     <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600/20 border border-primary-600/30 rounded-2xl mb-4">
//                         <ShieldAlert size={32} className="text-primary-500" />
//                     </div>
//                     <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>AssetSure</h1>
//                     <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>AI Loan Utilization Verification System</p>
//                 </div>
//                 <div className="card">
//                     <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Create Account</h2>

//                     {/* Role Selector */}
//                     <div className="mb-5">
//                         <label className="label">I am registering as:</label>
//                         <div className="grid grid-cols-2 gap-3">
//                             {[
//                                 { role: 'borrower', icon: UserCheck, label: 'Borrower' },
//                                 { role: 'bank_officer', icon: Building2, label: 'Bank Officer' },
//                             ].map(({ role, icon: Icon, label }) => {
//                                 const active = form.role === role;
//                                 return (
//                                     <button key={role} type="button" onClick={() => setForm(f => ({ ...f, role }))}
//                                         className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-semibold transition-all"
//                                         style={{
//                                             backgroundColor: active ? (isDark ? 'rgba(30,58,138,0.5)' : '#EFF6FF') : 'var(--bg-card)',
//                                             borderColor: active ? '#3B82F6' : 'var(--border)',
//                                             color: active ? '#2563EB' : 'var(--text-secondary)',
//                                         }}>
//                                         <Icon size={16} /> {label}
//                                     </button>
//                                 );
//                             })}
//                         </div>
//                     </div>

//                     <form onSubmit={handleRegister} className="space-y-4">
//                         {[
//                             { name: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: form.role === 'bank_officer' ? 'Officer Rajesh Kumar' : 'Amit Sharma', required: true },
//                             { name: 'email', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'you@example.com', required: true },
//                             { name: 'phone', label: 'Phone Number', icon: Phone, type: 'tel', placeholder: '9876543210', required: false },
//                             { name: 'password', label: 'Password', icon: Lock, type: 'password', placeholder: 'Min 6 characters', required: true },
//                         ].map(({ name, label, icon: Icon, type, placeholder, required }) => (
//                             <div key={name}>
//                                 <label className="label">{label} {!required && <span style={{ color: 'var(--text-muted)' }}>(Optional)</span>}</label>
//                                 <div className="relative">
//                                     <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
//                                     <input name={name} type={type} value={form[name]} onChange={onChange}
//                                         placeholder={placeholder} required={required} className="input pl-10" />
//                                 </div>
//                             </div>
//                         ))}
//                         <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
//                             {loading ? 'Creating Account...' : `Register as ${form.role === 'bank_officer' ? 'Bank Officer' : 'Borrower'}`}
//                         </button>
//                     </form>
//                     <p className="text-center text-sm mt-5" style={{ color: 'var(--text-secondary)' }}>
//                         Already have an account?{' '}
//                         <Link to="/login" className="text-primary-500 hover:text-primary-400 font-medium">Sign In</Link>
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Register;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
// import { ShieldAlert, Mail, Lock, User, Phone, Building2, UserCheck } from 'lucide-react';
import { Mail, Lock, User, Phone, Building2, UserCheck } from 'lucide-react';
import AssetSureLogo from '../components/AssetSureLogo';
import AuthBackground from '../components/AuthBackground';
import { useTheme } from '../context/ThemeContext';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'borrower' });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const addToast = useToast();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleRegister = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) { addToast('Password must be at least 6 characters', 'error'); return; }
        setLoading(true);
        try {
            const user = await register(form.name, form.email, form.password, form.phone, form.role);
            addToast(`Account created successfully as ${user.role === 'bank_officer' ? 'Bank Officer' : 'Borrower'}!`, 'success');
            navigate(user.role === 'bank_officer' ? '/officer/dashboard' : '/borrower/dashboard', { replace: true });
        } catch (err) {
            addToast(err.response?.data?.error || 'Registration failed.', 'error');
        } finally { setLoading(false); }
    };


    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-10 auth-page">
            {/* Decorative background */}
            <AuthBackground />
            <div className="relative w-full max-w-md mx-4" style={{ zIndex: 1 }}>
                <div className="text-center mb-6">
                    {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600/20 border border-primary-600/30 rounded-2xl mb-4">
                        <ShieldAlert size={32} className="text-primary-500" />
                    </div> */}
                    <div className="flex items-center justify-center mb-4">
                        <AssetSureLogo size={88} />
                    </div>
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>AssetSure</h1>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>AI Loan Utilization Verification System</p>
                </div>
                <div className="card">
                    <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Create Account</h2>

                    {/* Role Selector */}
                    <div className="mb-5">
                        <label className="label">I am registering as:</label>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { role: 'borrower', icon: UserCheck, label: 'Borrower' },
                                { role: 'bank_officer', icon: Building2, label: 'Bank Officer' },
                            ].map(({ role, icon: Icon, label }) => {
                                const active = form.role === role;
                                return (
                                    <button key={role} type="button" onClick={() => setForm(f => ({ ...f, role }))}
                                        className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl border text-xs font-semibold transition-all"
                                        style={{
                                            backgroundColor: active ? (isDark ? 'rgba(30,58,138,0.5)' : '#EFF6FF') : 'var(--bg-card)',
                                            borderColor: active ? '#3B82F6' : 'var(--border)',
                                            color: active ? '#2563EB' : 'var(--text-secondary)',
                                        }}>
                                        <Icon size={16} /> {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        {[
                            { name: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: form.role === 'bank_officer' ? 'Officer Rajesh Kumar' : 'Amit Sharma', required: true },
                            { name: 'email', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'you@example.com', required: true },
                            { name: 'phone', label: 'Phone Number', icon: Phone, type: 'tel', placeholder: '9876543210', required: false },
                            { name: 'password', label: 'Password', icon: Lock, type: 'password', placeholder: 'Min 6 characters', required: true },
                        ].map(({ name, label, icon: Icon, type, placeholder, required }) => (
                            <div key={name}>
                                <label className="label">{label} {!required && <span style={{ color: 'var(--text-muted)' }}>(Optional)</span>}</label>
                                <div className="relative">
                                    <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                    <input name={name} type={type} value={form[name]} onChange={onChange}
                                        placeholder={placeholder} required={required} className="input pl-10" />
                                </div>
                            </div>
                        ))}
                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
                            {loading ? 'Creating Account...' : `Register as ${form.role === 'bank_officer' ? 'Bank Officer' : 'Borrower'}`}
                        </button>
                    </form>
                    <p className="text-center text-sm mt-5" style={{ color: 'var(--text-secondary)' }}>
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-500 hover:text-primary-400 font-medium">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
