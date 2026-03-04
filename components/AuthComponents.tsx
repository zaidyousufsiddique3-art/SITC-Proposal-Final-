
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { loginUser, changePassword, sendResetEmail, logoutUser } from '../services/authService';
import { FormInput, Button } from './InputComponents';
import { ArrowLeftIcon, CheckIcon } from './Icons';
import { getGlobalSettings } from '../services/authService';

interface AuthProps {
    onLogin: (user: User) => void;
}

import { SignInPage } from './auth/SignInPage';

interface AuthProps {
    onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthProps> = ({ onLogin }) => {
    const [mode, setMode] = useState<'login' | 'forgot_password' | 'forgot_username' | 'force_change'>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Shared credentials (used by the new SignInPage)
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

    const handleLoginProcess = async (email: string, pass: string, type: 'admin' | 'user') => {
        setError('');
        setIsLoading(true);
        try {
            const user = await loginUser(email, pass);

            // Access Control Logic
            if (type === 'admin') {
                if (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'owner') {
                    throw new Error('You are not authorised to access the Admin Panel.');
                }
            } else {
                if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'owner') {
                    throw new Error('Administrators must use the Admin Login.');
                }
            }

            // Check for Temporary Password
            if (user.mustChangePassword) {
                setTempUser(user);
                setLoginPass(pass); // store current pass to use in changePassword
                setMode('force_change');
                return;
            }

            onLogin(user);
        } catch (e: any) {
            setError(e.message || 'Invalid credentials');
            await logoutUser();
        } finally {
            setIsLoading(false);
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

    // Keep legacy renderers for specific recovery/force modes
    const renderForceChange = () => (
        <div className="min-h-screen flex items-center justify-center bg-[#05060a] p-4">
            <div className="w-full max-w-md glass-elevated p-10 rounded-3xl animate-fade-up">
                <h3 className="text-xl font-bold text-white mb-2">Password Expired</h3>
                <p className="text-sm text-gray-400 mb-6">Your temporary password has expired. Please set a new one to continue.</p>
                <form onSubmit={(e) => { e.preventDefault(); handleForceChange(); }}>
                    <FormInput label="New Password" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} className="bg-white/5 border-white/10" />
                    <Button type="submit" className="w-full mt-4 py-4">Update Password</Button>
                </form>
            </div>
        </div>
    );

    const renderForgotPassword = () => (
        <div className="min-h-screen flex items-center justify-center bg-[#05060a] p-4">
            <div className="w-full max-w-md glass-elevated p-10 rounded-3xl animate-fade-up">
                <h3 className="text-xl font-bold text-white mb-2">Reset Password</h3>
                {step === 0 ? (
                    <>
                        <p className="text-sm text-gray-400 mb-6 font-medium leading-relaxed">Enter your registered email to receive a password reset link.</p>
                        <FormInput label="Email Address" value={recoveryEmail} onChange={e => setRecoveryEmail(e.target.value)} className="bg-white/5 border-white/10" />
                        <Button onClick={handleRecoverPassword} className="w-full mt-3 py-4">Send Link</Button>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 mx-auto mb-4">
                            <CheckIcon size={24} />
                        </div>
                        <p className="text-gray-300 text-sm">{success}</p>
                    </div>
                )}
                <button onClick={() => { setMode('login'); setStep(0); }} className="w-full text-center text-[11px] font-black uppercase tracking-widest text-gray-500 mt-8 hover:text-white transition-colors flex items-center justify-center gap-2">
                    <ArrowLeftIcon size={12} /> Back to Sign In
                </button>
            </div>
        </div>
    );

    const renderForgotUsername = () => (
        <div className="min-h-screen flex items-center justify-center bg-[#05060a] p-4">
            <div className="w-full max-w-md glass-elevated p-10 rounded-3xl animate-fade-up">
                <h3 className="text-xl font-bold text-white mb-2">Recover Username</h3>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">Enter your registered phone number to identify your account.</p>
                <FormInput label="Phone Number" value={recoveryPhone} onChange={e => setRecoveryPhone(e.target.value)} className="bg-white/5 border-white/10" />
                <Button onClick={handleRecoverUsername} className="w-full mt-3 py-4">Find Username</Button>
                <button onClick={() => setMode('login')} className="w-full text-center text-[11px] font-black uppercase tracking-widest text-gray-500 mt-8 hover:text-white transition-colors flex items-center justify-center gap-2">
                    <ArrowLeftIcon size={12} /> Back to Sign In
                </button>
            </div>
        </div>
    );

    if (mode === 'login') {
        return (
            <SignInPage
                onLogin={onLogin}
                onForgotPassword={() => setMode('forgot_password')}
                onForgotUsername={() => setMode('forgot_username')}
                handleLoginProcess={handleLoginProcess}
                error={error}
                isLoading={isLoading}
            />
        );
    }

    return (
        <>
            {error && !isLoading && <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] p-4 bg-red-500 text-white rounded-xl shadow-2xl font-bold text-sm animate-fade-down">{error}</div>}
            {mode === 'force_change' && renderForceChange()}
            {mode === 'forgot_password' && renderForgotPassword()}
            {mode === 'forgot_username' && renderForgotUsername()}
        </>
    );
};
