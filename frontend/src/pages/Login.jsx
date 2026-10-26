// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useToast } from '../context/ToastContext';
// import { ShieldAlert, Mail, Lock, Eye, EyeOff } from 'lucide-react';
// import AuthBackground from '../components/AuthBackground';

// const Login = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [showPass, setShowPass] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const { login } = useAuth();
//     const addToast = useToast();
//     const navigate = useNavigate();

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         try {
//             const user = await login(email, password);
//             addToast('Login successful! Welcome back.', 'success');
//             navigate(user.role === 'bank_officer' ? '/officer/dashboard' : '/borrower/dashboard', { replace: true });
//         } catch (err) {
//             addToast(err.response?.data?.error || 'Login failed. Check your credentials.', 'error');
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center relative overflow-hidden auth-page">
//             {/* Decorative background */}
//             <AuthBackground />

//             <div className="relative w-full max-w-md mx-4" style={{ zIndex: 1 }}>
//                 {/* Header */}
//                 <div className="text-center mb-8">
//                     <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600/20 border border-primary-600/30 rounded-2xl mb-4">
//                         <ShieldAlert size={32} className="text-primary-500" />
//                     </div>
//                     <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>AssetSure</h1>
//                     <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>AI Loan Utilization Verification System</p>
//                 </div>

//                 <div className="card">
//                     <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Sign In</h2>
//                     <form onSubmit={handleLogin} className="space-y-4">
//                         <div>
//                             <label className="label">Email Address</label>
//                             <div className="relative">
//                                 <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
//                                 <input type="email" value={email} onChange={e => setEmail(e.target.value)}
//                                     placeholder="you@example.com" required
//                                     className="input pl-10" />
//                             </div>
//                         </div>
//                         <div>
//                             <label className="label">Password</label>
//                             <div className="relative">
//                                 <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
//                                 <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
//                                     placeholder="••••••••" required
//                                     className="input pl-10 pr-10" />
//                                 <button type="button" onClick={() => setShowPass(s => !s)}
//                                     className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-75 transition-opacity"
//                                     style={{ color: 'var(--text-muted)' }}>
//                                     {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
//                                 </button>
//                             </div>
//                         </div>
//                         <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
//                             {loading ? <><span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" />Signing in...</> : 'Sign In'}
//                         </button>
//                     </form>
//                     <p className="text-center text-sm mt-5" style={{ color: 'var(--text-secondary)' }}>
//                         Don't have an account?{' '}
//                         <Link to="/register" className="text-primary-500 hover:text-primary-400 font-medium">Register as Borrower</Link>
//                     </p>
//                 </div>

//                 {/* <div className="mt-4 p-4 rounded-xl text-xs border"
//                     style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
//                     <p className="font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Demo Credentials</p>
//                     <p>🏦 Officer: officer@bank.com / officer123</p>
//                     <p>👤 Borrower: amit@borrower.com / borrower123</p>
//                 </div> */}
//             </div>
//         </div>
//     );
// };

// export default Login;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
// import { ShieldAlert, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import AssetSureLogo from '../components/AssetSureLogo';
import AuthBackground from '../components/AuthBackground';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const addToast = useToast();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(email, password);
            addToast('Login successful! Welcome back.', 'success');
            navigate(user.role === 'bank_officer' ? '/officer/dashboard' : '/borrower/dashboard', { replace: true });
        } catch (err) {
            addToast(err.response?.data?.error || 'Login failed. Check your credentials.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden auth-page">
            {/* Decorative background */}
            <AuthBackground />

            <div className="relative w-full max-w-md mx-4" style={{ zIndex: 1 }}>
                {/* Header */}
                <div className="text-center mb-8">
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
                    <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Sign In</h2>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="label">Email Address</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com" required
                                    className="input pl-10" />
                            </div>
                        </div>
                        <div>
                            <label className="label">Password</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••" required
                                    className="input pl-10 pr-10" />
                                <button type="button" onClick={() => setShowPass(s => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-75 transition-opacity"
                                    style={{ color: 'var(--text-muted)' }}>
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
                            {loading ? <><span className="animate-spin border-2 border-white/30 border-t-white rounded-full w-4 h-4" />Signing in...</> : 'Sign In'}
                        </button>
                    </form>
                    <p className="text-center text-sm mt-5" style={{ color: 'var(--text-secondary)' }}>
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-500 hover:text-primary-400 font-medium">Register as Borrower</Link>
                    </p>
                </div>

                {/* <div className="mt-4 p-4 rounded-xl text-xs border"
                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    <p className="font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Demo Credentials</p>
                    <p>🏦 Officer: officer@bank.com / officer123</p>
                    <p>👤 Borrower: amit@borrower.com / borrower123</p>
                </div> */}
            </div>
        </div>
    );
};

export default Login;
