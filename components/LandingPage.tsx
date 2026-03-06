
import React from 'react';
import { Link } from 'react-router-dom';
import Antigravity from './Antigravity';
import './LandingPage.css';
import {
    ArrowRightIcon
} from './Icons';

const LandingPage: React.FC = () => {
    return (
        <div className="relative h-screen w-screen bg-[#05060a] text-white selection:bg-indigo-500/30 overflow-hidden">

            {/* 1. Background Animation Layer */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
                <Antigravity
                    count={250}
                    magnetRadius={8}
                    ringRadius={10}
                    waveSpeed={0.3}
                    waveAmplitude={0.8}
                    particleSize={1.2}
                    lerpSpeed={0.04}
                    color="#6366f1"
                    autoAnimate
                    particleShape="capsule"
                    fieldStrength={8}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05060a]/80 to-[#05060a]" />
            </div>

            {/* 2. Premium Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between glass-nav rounded-2xl px-6 py-3 border border-white/5 shadow-2xl">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                            <img src="/sitc_logo_final.png" alt="Logo" className="w-7 h-7 object-contain brightness-0 invert" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white hidden md:block">
                            Travel Proposal <span className="text-indigo-400">Portal</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="px-5 py-2 text-sm font-semibold text-white/70 hover:text-white transition-all"
                        >
                            Sign In
                        </Link>
                        <Link
                            to="/login"
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 h-full flex flex-col justify-center items-center">
                {/* 3. Hero Section - Extreme minimal */}
                <section className="max-w-7xl mx-auto px-6 text-center relative flex flex-col items-center">
                    <div className="hero-glow" />

                    <h1 className="text-6xl md:text-8xl lg:text-[120px] font-black leading-[1.1] tracking-tighter text-gradient-premium animate-fade-in">
                        Travel Proposal Portal
                    </h1>
                </section>
            </main>
        </div>
    );
};

export default LandingPage;
