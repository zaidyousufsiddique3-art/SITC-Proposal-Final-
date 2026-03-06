
import React from 'react';
import { Link } from 'react-router-dom';
import Antigravity from './Antigravity';
import TrueFocus from './TrueFocus';
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
                    count={150}
                    magnetRadius={10}
                    ringRadius={12}
                    waveSpeed={0.15}
                    waveAmplitude={0.4}
                    particleSize={1.2}
                    lerpSpeed={0.03}
                    color="#3B82F6"
                    autoAnimate
                    particleShape="capsule"
                    fieldStrength={4}
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
                            Travel <span className="text-blue-400">Proposal</span> System
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
                <section className="max-w-7xl mx-auto text-center relative flex flex-col items-center">
                    <div className="hero-glow-soft" />

                    <div className="mb-12 animate-title select-none text-shadow-premium">
                        <TrueFocus
                            sentence="Travel Proposal System"
                            manualMode={false}
                            blurAmount={8}
                            borderColor="#3B82F6"
                            glowColor="rgba(59, 130, 246, 0.5)"
                            animationDuration={0.4}
                            pauseBetweenAnimations={0.8}
                        />
                    </div>

                    <p className="text-lg md:text-2xl text-white/40 max-w-2xl mx-auto mb-16 leading-relaxed font-normal animate-subtitle">
                        Create professional travel proposals in minutes. <br className="hidden md:block" />
                        Built for corporate travel teams to deliver premium experiences.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-cta">
                        <Link
                            to="/login"
                            className="group relative px-12 py-5 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white text-lg font-bold rounded-2xl transition-all hover:scale-[1.05] active:scale-[0.98] shadow-btn-glow"
                        >
                            Get Started <ArrowRightIcon className="inline-block ml-1 group-hover:translate-x-1.5 transition-transform" size={20} />
                        </Link>
                        <Link
                            to="/login"
                            className="px-12 py-5 bg-transparent hover:bg-white/5 text-white/80 hover:text-white text-lg font-bold border border-white/10 rounded-2xl transition-all hover:-translate-y-1"
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
