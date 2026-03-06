
import React from 'react';
import { Link } from 'react-router-dom';
import Antigravity from './Antigravity';
import './LandingPage.css';
import {
    BuildingIcon,
    PlaneIcon,
    BusIcon,
    CompassIcon,
    LayersIcon,
    WalletIcon,
    ArrowRightIcon,
    CheckIcon,
    PresentationIcon,
    ShieldCheckIcon,
    SearchIcon,
    PlusIcon,
    LogOutIcon
} from './Icons';

const LandingPage: React.FC = () => {
    return (
        <div className="relative min-h-screen bg-[#05060a] text-white selection:bg-indigo-500/30 overflow-x-hidden">

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
            <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 transition-all duration-300">
                <div className="max-w-7xl mx-auto flex items-center justify-between glass-nav rounded-2xl px-6 py-3 border border-white/5 shadow-2xl">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                            <img src="/sitc_logo_final.png" alt="Logo" className="w-7 h-7 object-contain brightness-0 invert" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white hidden md:block">
                            Travel Proposal <span className="text-indigo-400">Portal</span>
                        </span>
                    </div>

                    <div className="hidden lg:flex items-center gap-10">
                        {['Features', 'Platform', 'Pricing', 'Contact'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-sm font-medium text-white/50 hover:text-white transition-colors tracking-wide"
                            >
                                {item}
                            </a>
                        ))}
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

            <main className="relative z-10 pt-32">

                {/* 3. Hero Section */}
                <section className="max-w-7xl mx-auto px-6 text-center section-padding relative">
                    <div className="hero-glow" />

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 text-xs font-bold leading-none mb-8 animate-fade-in">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        ✦ PREMIUM CORPORATE TRAVEL SYSTEM
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[1] tracking-tight text-gradient-premium">
                        Travel Proposal Portal
                    </h1>

                    <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                        Create professional travel proposals in minutes. Designed for corporate travel teams to build, manage, and deliver premium experiences.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
                        <Link
                            to="/login"
                            className="group w-full sm:w-auto px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white text-base font-black rounded-2xl shadow-2xl shadow-indigo-600/30 transition-all hover:-translate-y-1"
                        >
                            Get Started <ArrowRightIcon className="inline-block ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                        </Link>
                        <button className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 text-white text-base font-black border border-white/10 rounded-2xl transition-all">
                            Book Demo
                        </button>
                    </div>

                    {/* Hero Visual Mockup */}
                    <div className="relative max-w-5xl mx-auto mt-12 animate-float">
                        <div className="absolute -inset-10 bg-indigo-600/20 blur-[100px] rounded-full opacity-30 pointer-events-none" />
                        <div className="relative rounded-[32px] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                            <img
                                src="/landing/hero-mockup.png"
                                alt="Proposal Builder Interface"
                                className="w-full h-auto object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#05060a] via-transparent to-transparent opacity-40" />
                        </div>
                    </div>
                </section>

                {/* 4. Trusted By Section */}
                <section className="max-w-7xl mx-auto px-6 pb-24 text-center">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/30 mb-12">
                        Trusted by modern travel agencies and corporate teams
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                        {['VOLO', 'NEXUS', 'SITC', 'ZENITH', 'AXIS', 'VELOCITY'].map((logo) => (
                            <span key={logo} className="text-2xl font-black tracking-tighter text-white hover:text-indigo-400 transition-colors pointer-events-none">
                                {logo}
                            </span>
                        ))}
                    </div>
                </section>

                {/* 5. Product Features */}
                <section id="features" className="max-w-7xl mx-auto px-6 section-padding relative">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />

                    <div className="text-center mb-20 relative">
                        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Built for modern travel teams</h2>
                        <div className="h-1.5 w-24 bg-indigo-600 rounded-full mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<PlusIcon size={28} />}
                            title="Create Proposals Instantly"
                            desc="Build stunning travel proposals in minutes with our intelligent automation."
                        />
                        <FeatureCard
                            icon={<CompassIcon size={28} />}
                            title="Custom Itineraries"
                            desc="Design personalized travel experiences with rich media and detailed agendas."
                        />
                        <FeatureCard
                            icon={<WalletIcon size={28} />}
                            title="Smart Pricing Engine"
                            desc="Automate markup, VAT, and currency calculations with professional accuracy."
                        />
                        <FeatureCard
                            icon={<LayersIcon size={28} />}
                            title="Professional Design"
                            desc="Deliver beautiful proposals that impress high-end corporate clients every time."
                        />
                        <FeatureCard
                            icon={<BuildingIcon size={28} />}
                            title="Centralized Management"
                            desc="Manage hotels, flights, and transportation from a single, unified dashboard."
                        />
                        <FeatureCard
                            icon={<ShieldCheckIcon size={28} />}
                            title="Enterprise Ready"
                            desc="Secure access control, versioning, and team collaboration features built-in."
                        />
                    </div>
                </section>

                {/* 6. Platform Workflow */}
                <section id="platform" className="max-w-7xl mx-auto px-6 section-padding">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">How It Works</h2>
                        <p className="text-white/50 max-w-xl mx-auto">From concept to delivery, the workflow is designed to be seamless.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <WorkflowStep num="01" title="Create Proposal" icon={<PresentationIcon size={24} />} />
                        <WorkflowStep num="02" title="Add Travel Details" icon={<PlaneIcon size={24} />} />
                        <WorkflowStep num="03" title="Customize Pricing" icon={<WalletIcon size={24} />} />
                        <WorkflowStep num="04" title="Generate & Send" icon={<LogOutIcon size={24} />} />
                    </div>
                </section>

                {/* 7. Product Showcase */}
                <section className="max-w-[1440px] mx-auto px-6 section-padding overflow-hidden">
                    <div className="relative rounded-[48px] bg-[#0a0b12] border border-white/5 p-12 lg:p-24 shadow-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 via-transparent to-transparent pointer-events-none" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div>
                                <h2 className="text-5xl lg:text-7xl font-black mb-8 leading-[1.1] tracking-tighter">The future of travel operations</h2>
                                <p className="text-xl text-white/50 mb-10 leading-relaxed max-w-md">Our dashboard gives you total control over every aspect of the travel planning process, from inventory to client hand-off.</p>

                                <ul className="space-y-6">
                                    <CheckItem text="Real-time document generation" />
                                    <CheckItem text="Multi-currency support" />
                                    <CheckItem text="Automated VAT calculation" />
                                    <CheckItem text="Cloud-based asset storage" />
                                </ul>
                            </div>

                            <div className="relative group">
                                <div className="absolute -inset-4 bg-indigo-600/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative animate-float">
                                    <img
                                        src="/landing/showcase-mockup.png"
                                        alt="Product Showcase"
                                        className="w-full h-auto rounded-3xl border border-white/10 shadow-2xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 8. Benefits Section */}
                <section className="max-w-7xl mx-auto px-6 section-padding">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
                        <div className="order-2 lg:order-1 relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl aspect-video lg:aspect-square">
                            <img src="https://images.unsplash.com/photo-1436491865332-7a61a109c0f3?auto=format&fit=crop&q=80&w=800" alt="Travel benefits" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#05060a] to-transparent opacity-60" />
                            <div className="absolute bottom-10 left-10">
                                <div className="px-4 py-2 bg-indigo-600 rounded-lg font-bold text-xs uppercase tracking-widest">Growth Engine</div>
                            </div>
                        </div>

                        <div className="order-1 lg:order-2">
                            <h2 className="text-4xl md:text-5xl font-black mb-10 tracking-tight leading-tight">Deliver excellence at scale</h2>
                            <div className="space-y-10">
                                <BenefitItem
                                    title="Save hours of manual work"
                                    desc="Eliminate repetitive tasks and administrative bloat with our smart templates and automated engines."
                                />
                                <BenefitItem
                                    title="Create consistent professional proposals"
                                    desc="Ensure every client document reflects your premium brand identity with pixel-perfect layouts."
                                />
                                <BenefitItem
                                    title="Impress corporate clients"
                                    desc="Win more deals by providing clear, detailed, and visually stunning travel overviews."
                                />
                                <BenefitItem
                                    title="Scale your travel business"
                                    desc="Focus on strategy and client relationships while we handle the technical heavy lifting of document creation."
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* 9. Call To Action */}
                <section id="pricing" className="max-w-7xl mx-auto px-6 section-padding">
                    <div className="relative rounded-[40px] bg-gradient-to-br from-indigo-900/40 to-indigo-600/10 border border-white/10 p-20 text-center overflow-hidden">
                        <div className="absolute inset-0 glow-bg blur-[140px] opacity-20" />

                        <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter relative z-10 text-gradient-premium">
                            Start Creating Travel Proposals Today
                        </h2>
                        <p className="text-xl text-white/60 max-w-xl mx-auto mb-12 relative z-10 leading-relaxed font-medium">
                            Build professional proposals faster and close more travel deals with the most advanced portal on the market.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                            <Link
                                to="/login"
                                className="w-full sm:w-auto px-12 py-5 bg-white text-black text-lg font-black rounded-2xl shadow-xl hover:scale-105 transition-all"
                            >
                                Get Started
                            </Link>
                            <button className="w-full sm:w-auto px-12 py-5 bg-white/5 hover:bg-white/10 text-white text-lg font-black border border-white/10 rounded-2xl transition-all">
                                Book Demo
                            </button>
                        </div>
                    </div>
                </section>

                {/* 10. Enterprise Footer */}
                <footer className="max-w-7xl mx-auto px-6 pt-24 pb-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
                        <div className="col-span-2 lg:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                                    <img src="/sitc_logo_final.png" alt="Logo" className="w-5 h-5 object-contain brightness-0 invert" />
                                </div>
                                <span className="text-lg font-bold tracking-tight">Travel Proposal Portal</span>
                            </div>
                            <p className="text-white/40 max-w-xs text-sm leading-relaxed font-medium">
                                Designing the future of corporate travel documentation. Join thousands of teams delivering premium experiences globally.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Product</h4>
                            <ul className="space-y-4 text-sm text-white/40 font-medium">
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Integrations</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Enterprise</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Platform</h4>
                            <ul className="space-y-4 text-sm text-white/40 font-medium">
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">API Docs</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Changelog</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Security</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Support</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Company</h4>
                            <ul className="space-y-4 text-sm text-white/40 font-medium">
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Privay</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Terms</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-40 text-xs font-bold uppercase tracking-widest">
                        <span>&copy; 2026 Travel Proposal Portal. All rights reserved.</span>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        </div>
                    </div>
                </footer>

            </main>
        </div>
    );
};

/* Components used within section */

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
    <div className="feature-card-premium group">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-8 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-4 text-white">{title}</h3>
        <p className="text-white/40 leading-relaxed text-sm font-medium">{desc}</p>
    </div>
);

const WorkflowStep: React.FC<{ num: string; title: string; icon: React.ReactNode }> = ({ num, title, icon }) => (
    <div className="workflow-step-premium group hover:border-indigo-500/30 transition-colors">
        <div className="workflow-dot mb-6 group-hover:scale-110 transition-transform">{num}</div>
        <div className="mb-4 text-indigo-400 opacity-60 group-hover:opacity-100 transition-opacity">{icon}</div>
        <h4 className="text-lg font-bold text-white tracking-tight">{title}</h4>
    </div>
);

const CheckItem: React.FC<{ text: string }> = ({ text }) => (
    <li className="flex items-center gap-4 text-white/70 font-medium">
        <div className="w-6 h-6 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <CheckIcon size={14} />
        </div>
        <span>{text}</span>
    </li>
);

const BenefitItem: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
    <div>
        <h4 className="text-xl font-bold text-white mb-2 tracking-tight">{title}</h4>
        <p className="text-white/40 leading-relaxed font-medium">{desc}</p>
    </div>
);

export default LandingPage;
