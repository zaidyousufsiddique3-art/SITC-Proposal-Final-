
import React from 'react';

interface RoleToggleProps {
    role: 'user' | 'admin';
    onChange: (role: 'user' | 'admin') => void;
}

export const RoleToggle: React.FC<RoleToggleProps> = ({ role, onChange }) => {
    return (
        <div className="relative flex p-1.5 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl w-full mb-8 group">
            {/* Animated Slider */}
            <div
                className={`absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] rounded-xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-lg 
        ${role === 'user'
                        ? 'translate-x-0 bg-gradient-to-br from-blue-600 to-blue-500 shadow-blue-500/20'
                        : 'translate-x-full bg-gradient-to-br from-amber-600 to-amber-500 shadow-amber-500/20'}`}
            >
                <div className="absolute inset-0 rounded-xl opacity-50 blur-[8px] bg-inherit" />
            </div>

            {/* User Button */}
            <button
                onClick={() => onChange('user')}
                className={`relative z-10 flex-1 py-2.5 text-[13px] font-bold tracking-tight transition-all duration-300 rounded-xl
          ${role === 'user' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
                User Login
            </button>

            {/* Admin Button */}
            <button
                onClick={() => onChange('admin')}
                className={`relative z-10 flex-1 py-2.5 text-[13px] font-bold tracking-tight transition-all duration-300 rounded-xl
          ${role === 'admin' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
                Admin Login
            </button>
        </div>
    );
};

export default RoleToggle;
