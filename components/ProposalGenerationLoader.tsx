import React, { useState, useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

const STATUS_MESSAGES = [
    'Preparing proposal layout...',
    'Assembling travel sections...',
    'Formatting hotel and flight details...',
    'Applying branding...',
    'Generating document preview...',
    'Finalizing proposal...',
];

const PROGRESS_STAGES = [
    { target: 20, label: 'Preparing layout' },
    { target: 40, label: 'Assembling proposal data' },
    { target: 60, label: 'Rendering travel sections' },
    { target: 80, label: 'Generating proposal document' },
    { target: 95, label: 'Finalizing content' },
];

interface Props {
    isVisible: boolean;
    isComplete: boolean;
    onFadeComplete?: () => void;
}

export const ProposalGenerationLoader: React.FC<Props> = ({ isVisible, isComplete, onFadeComplete }) => {
    const [progress, setProgress] = useState(0);
    const [statusIdx, setStatusIdx] = useState(0);
    const [fadingOut, setFadingOut] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const statusRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Simulated progress
    useEffect(() => {
        if (!isVisible) {
            setProgress(0);
            setStatusIdx(0);
            setFadingOut(false);
            return;
        }

        let currentProgress = 0;
        intervalRef.current = setInterval(() => {
            currentProgress += Math.random() * 3 + 1;
            if (currentProgress > 95) currentProgress = 95;
            setProgress(currentProgress);
        }, 150);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isVisible]);

    // Rotate status messages
    useEffect(() => {
        if (!isVisible) return;

        statusRef.current = setInterval(() => {
            setStatusIdx(prev => (prev + 1) % STATUS_MESSAGES.length);
        }, 800);

        return () => {
            if (statusRef.current) clearInterval(statusRef.current);
        };
    }, [isVisible]);

    // Handle completion
    useEffect(() => {
        if (isComplete && isVisible) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (statusRef.current) clearInterval(statusRef.current);
            setProgress(100);

            const fadeTimer = setTimeout(() => {
                setFadingOut(true);
                const removeTimer = setTimeout(() => {
                    onFadeComplete?.();
                }, 350);
                return () => clearTimeout(removeTimer);
            }, 600);

            return () => clearTimeout(fadeTimer);
        }
    }, [isComplete, isVisible, onFadeComplete]);

    if (!isVisible) return null;

    const pct = Math.min(Math.round(progress), 100);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(5,6,10,0.85)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                opacity: fadingOut ? 0 : 1,
                transition: 'opacity 0.35s ease',
            }}
        >
            <div
                style={{
                    maxWidth: 520,
                    width: '90%',
                    padding: 28,
                    borderRadius: 16,
                    background: 'rgba(8,10,14,0.92)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                }}
            >
                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <h2
                        style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: '#fff',
                            margin: 0,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        {isComplete ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                <Check size={24} strokeWidth={3} color="#5fa9ff" /> Proposal Ready
                            </div>
                        ) : (
                            'Generating Proposal'
                        )}
                    </h2>
                    <p
                        style={{
                            fontSize: 14,
                            color: 'rgba(255,255,255,0.45)',
                            margin: '8px 0 0',
                        }}
                    >
                        {isComplete
                            ? 'Your proposal has been generated successfully'
                            : 'Please wait while we prepare your document'}
                    </p>
                </div>

                {/* Progress bar */}
                <div
                    style={{
                        height: 8,
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.08)',
                        overflow: 'hidden',
                        position: 'relative',
                    }}
                >
                    <div
                        style={{
                            height: '100%',
                            width: `${pct}%`,
                            borderRadius: 6,
                            background: 'linear-gradient(135deg,#0a62f0,#5fa9ff)',
                            transition: 'width 0.3s ease',
                            position: 'relative',
                        }}
                    >
                        {/* Pulse glow */}
                        <div
                            style={{
                                position: 'absolute',
                                right: 0,
                                top: -2,
                                bottom: -2,
                                width: 40,
                                background: 'linear-gradient(90deg, transparent, rgba(95,169,255,0.6))',
                                borderRadius: 6,
                                animation: !isComplete ? 'loaderPulse 1.5s ease-in-out infinite' : 'none',
                            }}
                        />
                    </div>
                </div>

                {/* Percentage */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 12,
                    }}
                >
                    <span
                        style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: isComplete ? '#5fa9ff' : 'rgba(255,255,255,0.8)',
                            fontVariantNumeric: 'tabular-nums',
                        }}
                    >
                        {pct}% Complete
                    </span>
                    {!isComplete && (
                        <span
                            style={{
                                fontSize: 12,
                                color: 'rgba(255,255,255,0.35)',
                            }}
                        >
                            {PROGRESS_STAGES.find(s => pct <= s.target)?.label || 'Finalizing'}
                        </span>
                    )}
                </div>

                {/* Status message */}
                <div
                    style={{
                        marginTop: 20,
                        padding: '12px 16px',
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        textAlign: 'center',
                    }}
                >
                    <span
                        style={{
                            fontSize: 14,
                            color: isComplete ? '#5fa9ff' : 'rgba(255,255,255,0.65)',
                            transition: 'opacity 0.2s ease',
                        }}
                    >
                        {isComplete ? 'Redirecting to preview...' : STATUS_MESSAGES[statusIdx]}
                    </span>
                </div>
            </div>

            {/* Keyframe animation */}
            <style>{`
                @keyframes loaderPulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    );
};
