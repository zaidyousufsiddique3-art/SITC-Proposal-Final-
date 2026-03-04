
import React, { useState } from 'react';
import { User } from '../../types';
import { SITCLogo, ArrowLeftIcon, CheckIcon } from '../Icons';
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

            {/* LEFT PANEL: Pure Visualization */}
            <div className="relative w-full md:w-[45%] h-[40vh] md:h-screen flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-white/5 bg-[#060010] z-20 overflow-hidden">
                {/* LaserFlow Layer */}
                <div className="absolute inset-0 z-0 opacity-100 pointer-events-none">
                    <LaserFlow
                        horizontalBeamOffset={0.1}
                        verticalBeamOffset={-0.45}
                        color="#3e91e0"
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
            </div>

            {/* RIGHT PANEL: Login + LaserFlow */}
            <div className="relative w-full md:w-[55%] h-screen flex items-center justify-center p-6 md:p-12 z-10 bg-[#060010]">

                {/* LaserFlow Layer */}
                <div className="absolute inset-0 z-0 opacity-80 pointer-events-none overflow-hidden">
                    <LaserFlow
                        color={role === 'user' ? "#3e91e0" : "#d97706"}
                        horizontalBeamOffset={0.1}
                        verticalBeamOffset={-0.45}
                        horizontalSizing={0.5}
                        verticalSizing={2}
                        wispDensity={1.2}
                        wispSpeed={15}
                        wispIntensity={5}
                        flowSpeed={0.4}
                        flowStrength={0.25}
                        fogIntensity={0.5}
                        fogScale={0.3}
                        fogFallSpeed={0.6}
                        decay={1.1}
                        falloffStart={1.2}
                    />
                </div>

                {/* Global Dark Overlay */}
                <div className="absolute inset-0 z-1 bg-black/40 backdrop-blur-[2px] pointer-events-none" />

                {/* Login Card Container */}
                <div className="relative z-10 w-full max-w-[380px] animate-fade-up">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="mb-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-all duration-300 group"
                    >
                        <ArrowLeftIcon size={12} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Portal
                    </button>

                    <div className="relative bg-[#0a0c12]/72 backdrop-blur-md border border-white/10 rounded-[18px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden">
                        {/* Subtle inner top highlight */}
                        <div className="absolute inset-x-0 top-0 h-px bg-white/5 pointer-events-none" />

                        <div className="flex flex-col items-center mb-6">
                            <h2 className="text-[22px] font-bold text-white tracking-tight mb-0.5">
                                {role === 'admin' ? 'Admin Portal' : 'Staff Portal'}
                            </h2>
                            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/65">Sign in to continue</p>
                        </div>

                        <RoleToggle role={role} onChange={setRole} />

                        <form onSubmit={handleSignIn} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/70 ml-1">Email Address</label>
                                <FormInput
                                    label=""
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="name@sitc.sa"
                                    className="!bg-white/[0.06] !border-white/10 !rounded-xl !h-11 !py-0 !text-sm !mb-0 !placeholder-white/45 focus:!border-blue-500/90 focus:!ring-[3px] focus:!ring-blue-500/20"
                                    required
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/70">Password</label>
                                </div>
                                <FormInput
                                    label=""
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="!bg-white/[0.06] !border-white/10 !rounded-xl !h-11 !py-0 !text-sm !mb-0 !placeholder-white/45 focus:!border-blue-500/90 focus:!ring-[3px] focus:!ring-blue-500/20"
                                    required
                                />
                                <div className="flex justify-between items-center px-1 mt-1.5">
                                    <button type="button" onClick={onForgotPassword} className="text-[12px] font-medium text-blue-400/75 hover:text-blue-400 hover:underline transition-all">
                                        Forgot Password?
                                    </button>
                                    <button type="button" onClick={onForgotUsername} className="text-[12px] font-medium text-white/40 hover:text-white/70 hover:underline transition-all">
                                        Forgot Username?
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[11px] font-bold text-center animate-shake">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className={`relative w-full h-[46px] text-[13px] font-black uppercase tracking-[0.14em] rounded-xl transition-all duration-300 overflow-hidden group/btn hover:-translate-y-0.5 active:translate-y-0 shadow-lg
                  ${role === 'user'
                                        ? 'bg-gradient-to-br from-blue-600 to-blue-500 hover:shadow-blue-500/25'
                                        : 'bg-gradient-to-br from-amber-600 to-amber-500 hover:shadow-amber-500/25'}`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Signing In...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>Sign In Now</span>
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>

                    <div className="mt-8 text-center text-[10px] text-gray-500/45 font-bold uppercase tracking-[0.18em]">
                        Protected by enterprise-grade security
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
