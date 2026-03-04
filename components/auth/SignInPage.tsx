
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
