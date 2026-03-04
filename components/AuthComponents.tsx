
import React, { useState } from 'react';
import { User } from '../types';
import { loginUser, changePassword, sendResetEmail, logoutUser } from '../services/authService';
import { FormInput, Button } from './InputComponents';
import { getGlobalSettings } from '../services/authService';

interface AuthProps {
    onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthProps> = ({ onLogin }) => {
    const [mode, setMode] = useState<'login' | 'forgot_password' | 'forgot_username' | 'force_change'>('login');
    const [loginType, setLoginType] = useState<'admin' | 'user'>('user');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const settings = getGlobalSettings();

    // Login State
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPass, setLoginPass] = useState('');

    // Force Change State
    const [tempUser, setTempUser] = useState<User | null>(null);
    const [newPass, setNewPass] = useState('');

    // Recovery State
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [recoveryPhone, setRecoveryPhone] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [step, setStep] = useState(0); // 0: Input, 1: Verify

    const handleLogin = async () => {
        setError('');
        try {
            const user = await loginUser(loginEmail, loginPass);

            // 20.4 Login Flow Logic & Visibility
            if (loginType === 'admin') {
                if (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'owner') {
                    setError('You are not authorised to access the Admin Panel.');
                    await logoutUser();
                    return;
                }
            } else {
                if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'owner') {
                    setError('Administrators must use the Admin Login.');
                    await logoutUser();
                    return;
                }
            }

            // Check for Temporary Password
            if (user.mustChangePassword) {
                setTempUser(user);
                setMode('force_change');
                return;
            }

            onLogin(user);
        } catch (e: any) {
            setError(e.message || 'Invalid credentials');
        }
    };

    const handleForceChange = async () => {
        if (!tempUser) return;
        try {
            await changePassword(tempUser.email, loginPass, newPass, true);
            const updated = await loginUser(tempUser.email, newPass);
            onLogin(updated);
        } catch (e: any) {
            setError(e.message);
        }
    };

    const handleRecoverPassword = async () => {
        if (step === 0) {
            try {
                await sendResetEmail(recoveryEmail);
                setStep(1);
                setSuccess(`Password reset link sent to ${recoveryEmail}`);
                setError('');
                setTimeout(() => { setMode('login'); setStep(0); setSuccess(''); }, 5000);
            } catch (e: any) {
                setError(e.message || 'Error sending reset email.');
            }
        }
    };

    const handleRecoverUsername = async () => {
        setError('Please contact your administrator to recover your username.');
    };

    const renderLogin = () => (
        <>
            {/* Login Type Toggle */}
            <div className="flex bg-white/[0.04] p-1 rounded-xl mb-8 border border-white/[0.06]">
                <button
                    onClick={() => { setLoginType('user'); setError(''); }}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${loginType === 'user' ? 'gradient-accent text-white shadow-lg shadow-ai-accent/20' : 'text-white/50 hover:text-white/70'}`}
                >
                    User Login
                </button>
                <button
                    onClick={() => { setLoginType('admin'); setError(''); }}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${loginType === 'admin' ? 'gradient-accent text-white shadow-lg shadow-ai-accent/20' : 'text-white/50 hover:text-white/70'}`}
                >
                    Admin Login
                </button>
            </div>

            <h3 className="text-center text-white/70 font-medium mb-6 text-sm">
                {loginType === 'admin' ? 'Admin & Management Portal' : 'Staff Portal'}
            </h3>

            <FormInput label="Email" type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Enter your email" />
            <FormInput label="Password" type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Enter your password" />

            <div className="flex justify-between text-xs mb-6 px-1">
                <button onClick={() => { setMode('forgot_password'); setError(''); setSuccess(''); }} className="text-ai-secondary hover:text-white transition-colors duration-200">Forgot Password?</button>
                <button onClick={() => { setMode('forgot_username'); setError(''); setSuccess(''); }} className="text-white/40 hover:text-white/70 transition-colors duration-200">Forgot Username?</button>
            </div>

            <Button onClick={handleLogin} className="w-full mt-2 py-3 text-base">
                Sign In
            </Button>
        </>
    );

    const renderForceChange = () => (
        <div className="animate-fade-up">
            <h3 className="text-xl font-bold text-white mb-2">Password Expired</h3>
            <p className="text-sm text-white/45 mb-6">Your temporary password has expired. Please set a new one.</p>
            <FormInput label="New Password" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} />
            <Button onClick={handleForceChange} className="w-full py-3">Update Password</Button>
        </div>
    );

    const renderForgotPassword = () => (
        <div className="animate-fade-up">
            <h3 className="text-xl font-bold text-white mb-2">Reset Password</h3>
            {step === 0 ? (
                <>
                    <p className="text-sm text-white/45 mb-6">Enter your registered email to receive a verification code.</p>
                    <FormInput label="Email Address" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} />
                    <Button onClick={handleRecoverPassword} className="w-full mb-3 py-3">Send Code</Button>
                </>
            ) : (
                <>
                    <p className="text-sm text-white/45 mb-6">Enter the verification code sent to your email.</p>
                    <FormInput label="Verification Code" value={verificationCode} onChange={e => setVerificationCode(e.target.value)} />
                    <Button onClick={handleRecoverPassword} className="w-full mb-3 py-3">Verify & Reset</Button>
                </>
            )}
            <button onClick={() => { setMode('login'); setStep(0); }} className="w-full text-center text-xs text-white/40 mt-3 hover:text-white/60 transition-colors">← Back to Login</button>
        </div>
    );

    const renderForgotUsername = () => (
        <div className="animate-fade-up">
            <h3 className="text-xl font-bold text-white mb-2">Recover Username</h3>
            <p className="text-sm text-white/45 mb-6">Enter your registered phone number.</p>
            <FormInput label="Phone Number" value={recoveryPhone} onChange={e => setRecoveryPhone(e.target.value)} />
            <Button onClick={handleRecoverUsername} className="w-full mb-3 py-3">Find Username</Button>
            <button onClick={() => setMode('login')} className="w-full text-center text-xs text-white/40 mt-3 hover:text-white/60 transition-colors">← Back to Login</button>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-premium p-4">
            <div className="w-full max-w-md glass p-10 rounded-2xl shadow-card animate-fade-up">
                <div className="flex flex-col items-center mb-8">
                    <img src="/sitc_logo_final.png" className="h-20 mb-6 object-contain" alt="SITC Logo" />
                    <h1 className="text-2xl font-bold text-white tracking-tight text-center font-display">
                        Travel Proposal Portal
                    </h1>
                    <p className="text-white/40 text-xs mt-2 tracking-wide">Secure Access</p>
                </div>

                {error && <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm text-center">{error}</div>}
                {success && <div className="mb-5 p-3.5 bg-green-500/10 border border-green-500/20 rounded-xl text-green-300 text-sm text-center">{success}</div>}

                {mode === 'login' && renderLogin()}
                {mode === 'force_change' && renderForceChange()}
                {mode === 'forgot_password' && renderForgotPassword()}
                {mode === 'forgot_username' && renderForgotUsername()}
            </div>
        </div>
    );
}
