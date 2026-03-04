
import React from 'react';

interface RoleToggleProps {
    role: 'user' | 'admin';
    onChange: (role: 'user' | 'admin') => void;
}

export const RoleToggle: React.FC<RoleToggleProps> = ({ role, onChange }) => {
    return (
        <div className="relative flex p-1 bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-xl w-full h-10 mb-6 group select-none">
            {/* Animated Slider (Active Pill) */}
            <div
                className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-[9px] transition-all duration-[220ms] ease-[cubic-bezier(0.23,1,0.32,1)] shadow-sm overflow-hidden
        ${role === 'user'
                        ? 'translate-x-0 bg-gradient-to-br from-blue-600 to-blue-500'
                        : 'translate-x-full bg-gradient-to-br from-amber-600 to-amber-500'}`}
            >
                {/* 1px Inner Top Highlight */}
                <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
            </div>

            {/* User Button */}
            <button
                onClick={() => onChange('user')}
                className={`relative z-10 flex-1 flex items-center justify-center text-[12px] font-bold tracking-tight transition-all duration-200
          ${role === 'user' ? 'text-white' : 'text-gray-400/80 hover:text-gray-200'}`}
            >
                User Login
            </button>

            {/* Admin Button */}
            <button
                onClick={() => onChange('admin')}
                className={`relative z-10 flex-1 flex items-center justify-center text-[12px] font-bold tracking-tight transition-all duration-200
          ${role === 'admin' ? 'text-white' : 'text-gray-400/80 hover:text-gray-200'}`}
            >
                Admin Login
            </button>
        </div>
    );
};

export default RoleToggle;
