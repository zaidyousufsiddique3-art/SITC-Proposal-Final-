
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

            {/* LEFT PANEL: Brand / Hero */}
            <div className="relative w-full md:w-[45%] h-[40vh] md:h-screen flex flex-col p-8 md:p-12 justify-between border-b md:border-b-0 md:border-r border-white/5 bg-gradient-to-br from-[#0a0b14] to-[#05060a] z-20 overflow-hidden">
                {/* Subtle Noise / Radial Gradient */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
                <div className="absolute inset-x-0 top-0 h-[60%] bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

                <div className="relative z-10 flex items-center gap-4">
                    <SITCLogo className="w-16 h-auto" />
                    <div className="h-8 w-px bg-white/10 hidden md:block" />
                    <span className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-black hidden md:block">Portal v2.0</span>
                </div>

                <div className="relative z-10 max-w-sm mt-12 md:mt-0">
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-tight font-display mb-4">
                        Travel Proposal Portal
                    </h1>
                    <p className="text-gray-400 text-sm md:text-base leading-relaxed font-medium">
                        The next generation of travel itinerary design. Secure access for staff and administrators.
                    </p>

                    <div className="mt-10 space-y-4">
                        {[
                            "Create proposals fast",
                            "Company workspaces",
                            "Secure role-based access"
                        ].map((text, i) => (
                            <div key={i} className="flex items-center gap-3 group">
                                <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform duration-300">
                                    <CheckIcon size={12} strokeWidth={3} />
                                </div>
                                <span className="text-gray-300 text-sm font-semibold tracking-tight">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                    &copy; 2024 Saudi International Travel Company
                </div>
            </div>

            {/* RIGHT PANEL: Login + LaserFlow */}
            <div className="relative w-full md:w-[55%] h-screen flex items-center justify-center p-6 md:p-12 z-10">

                {/* LaserFlow Layer */}
                <div className="absolute inset-0 z-0 opacity-80 pointer-events-none overflow-hidden">
                    <LaserFlow
                        color={role === 'user' ? "#3e91e0" : "#d97706"}
                        horizontalBeamOffset={0.1}
                        wispDensity={1.2}
                        flowSpeed={0.4}
                        fogIntensity={0.5}
                    />
                </div>

                {/* Global Dark Overlay */}
                <div className="absolute inset-0 z-1 bg-black/40 backdrop-blur-[2px] pointer-events-none" />

                {/* Login Card */}
                <div className="relative z-10 w-full max-w-md animate-fade-up">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="md:absolute md:-top-16 left-0 mb-8 md:mb-0 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeftIcon size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </button>

                    <div className="glass-elevated p-8 md:p-10 rounded-[28px] border-white/10 shadow-2xl relative overflow-hidden">
                        {/* Glossy inner glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none" />

                        <div className="flex flex-col items-center mb-8">
                            <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
                                {role === 'admin' ? 'Admin Portal' : 'Staff Portal'}
                            </h2>
                            <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Sign in to continue</p>
                        </div>

                        <RoleToggle role={role} onChange={setRole} />

                        <form onSubmit={handleSignIn} className="space-y-5">
                            <FormInput
                                label="Email address"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@sitc.sa"
                                className="bg-black/20 border-white/5 py-3"
                            />

                            <div className="space-y-2">
                                <FormInput
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="bg-black/20 border-white/5 py-3"
                                />
                                <div className="flex justify-between items-center px-1">
                                    <button type="button" onClick={onForgotPassword} className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors">
                                        Forgot Password?
                                    </button>
                                    <button type="button" onClick={onForgotUsername} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">
                                        Forgot Username?
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold text-center animate-shake">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-4 text-sm font-black uppercase tracking-[0.15em] transition-all duration-300 shadow-2xl
                  ${role === 'user'
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-blue-500/40'
                                        : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:shadow-amber-500/40'}`}
                            >
                                {isLoading ? 'Verifying...' : 'Sign In Now'}
                            </Button>
                        </form>
                    </div>

                    <div className="mt-8 text-center text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        Protected by enterprise-grade security
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignInPage;
