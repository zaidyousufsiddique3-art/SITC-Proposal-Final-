
import React from 'react';
import { Link } from 'react-router-dom';
import Antigravity from './Antigravity';
import './LandingPage.css';
import {
    ArrowRightIcon
} from './Icons';

const LandingPage: React.FC = () => {
    return (
        <div className="relative h-screen w-screen bg-[#05060a] text-white selection:bg-blue-500/30 overflow-hidden">

            {/* 1. Background Animation Layer */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
                <Antigravity
                    count={180}
                    magnetRadius={10}
                    ringRadius={12}
                    waveSpeed={0.2}
                    waveAmplitude={0.5}
                    particleSize={1.1}
                    lerpSpeed={0.03}
                    color="#60A5FA" // Light blue
                    autoAnimate
                    particleShape="capsule"
                    fieldStrength={5}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05060a]/90 to-[#05060a]" />
            </div>

            {/* 2. Premium Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-8 flex justify-center">
                <div className="w-full max-w-4xl flex items-center justify-between glass-nav-container rounded-[24px] px-8 py-3 border border-white/[0.08] shadow-2xl animate-fade-in-nav">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 transition-transform group-hover:scale-105">
                            <img src="/sitc_logo_final.png" alt="Logo" className="w-6 h-6 object-contain brightness-0 invert" />
                        </div>
                        <span className="text-sm font-bold tracking-tight text-white/90">
                            Travel Proposal <span className="text-blue-400">Portal</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <Link
                            to="/login"
                            className="text-xs font-semibold text-white/50 hover:text-white transition-all uppercase tracking-widest"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/login"
                            className="px-6 py-2.5 bg-white text-black text-xs font-bold rounded-xl shadow-lg border border-white hover:bg-transparent hover:text-white transition-all"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 h-full flex flex-col justify-center items-center px-6">

                {/* 3. Hero Section - Extreme Minimal, Premium SaaS */}
                <section className="max-w-5xl mx-auto text-center relative flex flex-col items-center">
                    <div className="hero-glow-soft" />

                    <h1 className="text-6xl md:text-8xl lg:text-[110px] font-black leading-[1.05] tracking-tight text-gradient-premium mb-8 animate-title">
                        Travel Proposal Portal
                    </h1>

                    <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-14 leading-relaxed font-normal animate-subtitle">
                        Create professional travel proposals in minutes. <br className="hidden md:block" />
                        Built for corporate travel teams to deliver premium experiences.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 animate-cta">
                        <Link
                            to="/login"
                            className="group relative px-10 py-4.5 bg-blue-600 hover:bg-blue-500 text-white text-base font-bold rounded-2xl transition-all hover:scale-[1.03] active:scale-[0.98] shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(37,99,235,0.5)]"
                        >
                            Get Started <ArrowRightIcon className="inline-block ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                        </Link>
                        <Link
                            to="/login"
                            className="px-10 py-4.5 bg-white/5 hover:bg-white/10 text-white text-base font-bold border border-white/10 rounded-2xl transition-all hover:-translate-y-0.5"
                        >
                            Sign In
                        </Link>
                    </div>
                </section>
            </main>

            {/* Decorative corner glows */}
            <div className="fixed -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-blue-900/10 blur-[150px] pointer-events-none" />
            <div className="fixed -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-600/5 blur-[150px] pointer-events-none" />
        </div>
    );
};

export default LandingPage;
