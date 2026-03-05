
import React, { useState } from 'react';
import { User } from '../../types';
import { SITCLogo, ArrowLeftIcon, CheckIcon, LockIcon } from '../Icons';
import { FormInput, Button } from '../InputComponents';
import { RoleToggle } from './RoleToggle';
import LaserFlow from '../ui/LaserFlow';

interface SignInPageProps {
    onLogin: (user: User) => void;
    onForgotPassword: () => void;
    onForgotUsername: () => void;
    handleLoginProcess: (email: string, pass: string, type: 'admin' | 'user') => Promise<void>;
    error?: string;
    isLoading?: boolean;
}

export const SignInPage: React.FC<SignInPageProps> = ({
    onLogin,
    onForgotPassword,
    onForgotUsername,
    handleLoginProcess,
    error,
    isLoading
}) => {
    const [role, setRole] = useState<'user' | 'admin'>('user');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleLoginProcess(email, password, role);
    };

    return (
        <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#05060a] overflow-hidden selection:bg-blue-500/30">

            {/* LEFT PANEL: Hero + Visualization */}
            <div className="relative w-full md:w-[45%] h-[40vh] md:h-screen flex flex-col justify-start items-start border-b md:border-b-0 md:border-r border-white/5 bg-[#060010] z-20 overflow-hidden pl-10 pr-10 pt-16 md:pl-[120px] md:pr-[60px] md:pt-[120px]">
                {/* LaserFlow Layer (behind content) */}
                <div className="absolute inset-0 z-0 opacity-100 pointer-events-none">
                    <LaserFlow
                        horizontalBeamOffset={0.1}
                        verticalBeamOffset={-0.45}
                        color={role === 'user' ? "#3e91e0" : "#d97706"}
                        horizontalSizing={0.5}
                        verticalSizing={2}
                        wispDensity={1}
                        wispSpeed={15}
                        wispIntensity={5}
                        flowSpeed={0.35}
                        flowStrength={0.25}
                        fogIntensity={0.45}
                        fogScale={0.3}
                        fogFallSpeed={0.6}
                        decay={1.1}
                        falloffStart={1.2}
                    />
                </div>

                {/* Hero Text Block */}
                <div className="relative z-10 animate-[fadeIn_400ms_ease-out_both] max-h-[50vh]">
                    <h1 className="text-[32px] md:text-[46px] font-bold leading-[1.1] tracking-tight max-w-[480px] bg-gradient-to-r from-blue-300 via-blue-200 to-white bg-clip-text text-transparent">
                        Professional Travel Proposal System
                    </h1>

                    <p className="text-[15px] md:text-[16px] leading-[1.6] text-white/70 max-w-[420px] mt-5">
                        A modern platform for building and managing travel proposals with secure access for your team.
                    </p>
                </div>
            </div>

            {/* RIGHT PANEL: Login (White Background) */}
            <div className="relative w-full md:w-[55%] h-screen flex items-center justify-center p-6 md:p-12 z-10 bg-white">

                {/* Login Card Container */}
                <div className="relative z-10 w-full max-w-[380px] animate-fade-up">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="mb-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-gray-700 transition-all duration-300 group"
                    >
                        <ArrowLeftIcon size={12} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Portal
                    </button>

                    <div className="relative bg-white rounded-[18px] p-6 overflow-hidden">

                        <div className="flex flex-col items-center mb-6">
                            <h2 className="text-[22px] font-bold text-gray-900 tracking-tight mb-0.5">
                                {role === 'admin' ? 'Admin Portal' : 'Staff Portal'}
                            </h2>
                            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-gray-400">Sign in to continue</p>
                        </div>

                        <RoleToggle role={role} onChange={setRole} />

                        <form onSubmit={handleSignIn} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500 ml-1">Email Address</label>
                                <FormInput
                                    label=""
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="name@sitc.sa"
                                    className="!bg-gray-50 !border-gray-200 !rounded-xl !h-11 !py-0 !text-sm !mb-0 !text-gray-900 !placeholder-gray-400 focus:!border-blue-500 focus:!ring-[3px] focus:!ring-blue-500/20"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500">Password</label>
                                </div>
                                <FormInput
                                    label=""
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="!bg-gray-50 !border-gray-200 !rounded-xl !h-11 !py-0 !text-sm !mb-0 !text-gray-900 !placeholder-gray-400 focus:!border-blue-500 focus:!ring-[3px] focus:!ring-blue-500/20"
                                    required
                                />
                                <div className="flex justify-between items-center px-1 mt-1.5">
                                    <button type="button" onClick={onForgotPassword} className="text-[12px] font-medium text-blue-500 hover:text-blue-600 hover:underline transition-all">
                                        Forgot Password?
                                    </button>
                                    <button type="button" onClick={onForgotUsername} className="text-[12px] font-medium text-gray-400 hover:text-gray-600 hover:underline transition-all">
                                        Forgot Username?
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-[11px] font-bold text-center animate-shake">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className={`relative w-full h-[46px] text-[13px] font-bold uppercase tracking-[0.14em] rounded-xl transition-all duration-300 overflow-hidden group/btn hover:-translate-y-0.5 active:translate-y-0 shadow-lg !text-white
                  ${role === 'user'
                                        ? 'bg-gradient-to-br from-blue-600 to-blue-500 hover:shadow-blue-500/25'
                                        : 'bg-gradient-to-br from-amber-600 to-amber-500 hover:shadow-amber-500/25'}`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Securing access...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <LockIcon size={14} className="opacity-70 group-hover:opacity-100 transition-opacity" />
                                        <span>Secure Login</span>
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none" />
                                    </div>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
