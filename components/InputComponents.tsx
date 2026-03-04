
import React, { useRef } from 'react';
import { UploadIcon } from './Icons';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormInput: React.FC<InputProps> = ({ label, error, className, ...props }) => (
  <div className="flex flex-col gap-1.5 mb-4 w-full">
    <label className="text-[11px] uppercase tracking-widest font-semibold text-ai-secondary/80">{label}</label>
    <input
      className={`bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:ring-2 focus:ring-ai-accent/40 focus:border-ai-accent focus:outline-none transition-all duration-200 text-sm ${error ? 'border-red-500/60' : ''} ${className}`}
      {...props}
    />
    {error && <span className="text-xs text-red-400 mt-0.5">{error}</span>}
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

export const FormSelect: React.FC<SelectProps> = ({ label, options, className, ...props }) => (
  <div className="flex flex-col gap-1.5 mb-4 w-full">
    <label className="text-[11px] uppercase tracking-widest font-semibold text-ai-secondary/80">{label}</label>
    <select
      className={`bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-ai-accent/40 focus:border-ai-accent focus:outline-none transition-all duration-200 text-sm ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-ai-card text-white">
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export const FormCheckbox: React.FC<{ label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl cursor-pointer hover:bg-white/[0.06] transition-all duration-200 mb-4 select-none">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 text-ai-accent rounded focus:ring-ai-accent/40 bg-white/5 border-white/20"
    />
    <span className="text-sm font-medium text-white/80">{label}</span>
  </label>
);

interface DateRangePickerProps {
  label: string;
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  minDate?: string;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ label, startDate, endDate, onChange, minDate, className }) => {
  return (
    <div className={`flex flex-col gap-1.5 mb-4 w-full ${className}`}>
      <label className="text-[11px] uppercase tracking-widest font-semibold text-ai-secondary/80">{label}</label>
      <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-ai-accent/40 focus-within:border-ai-accent transition-all duration-200">
        <input
          type="date"
          value={startDate}
          min={minDate}
          onChange={(e) => onChange(e.target.value, endDate)}
          className="bg-transparent text-white text-sm w-full focus:outline-none"
          placeholder="From"
        />
        <span className="text-white/30 font-medium text-xs">→</span>
        <input
          type="date"
          value={endDate}
          min={startDate}
          onChange={(e) => onChange(startDate, e.target.value)}
          className="bg-transparent text-white text-sm w-full focus:outline-none"
          placeholder="To"
        />
      </div>
    </div>
  );
};

interface FileUploaderProps {
  label: string;
  onFileSelect: (base64: string) => void;
  currentImage?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ label, onFileSelect, currentImage }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onFileSelect(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 mb-4 w-full">
      <label className="text-[11px] uppercase tracking-widest font-semibold text-ai-secondary/80">{label}</label>
      <div
        className="border border-dashed border-white/[0.12] rounded-xl p-4 hover:bg-white/[0.03] hover:border-ai-accent/30 transition-all duration-200 cursor-pointer flex items-center justify-center gap-3"
        onClick={() => inputRef.current?.click()}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFile}
        />
        {currentImage ? (
          <div className="relative w-full h-20 group">
            <img src={currentImage} alt="Uploaded" className="w-full h-full object-contain rounded" />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 rounded text-xs text-white/80">
              Change Image
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-white/30">
            <UploadIcon />
            <span className="text-xs mt-1.5 font-medium">Click to upload</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const SectionHeader: React.FC<{ title: string; icon?: React.ReactNode }> = ({ title, icon }) => (
  <div className="flex items-center gap-3 mb-6 pb-3 border-b border-white/[0.06]">
    {icon && <div className="text-ai-accent">{icon}</div>}
    <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }> = ({ children, variant = 'primary', className, ...props }) => {
  const baseStyle = "px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm";
  const variants = {
    primary: "gradient-accent text-white shadow-lg shadow-ai-accent/15 hover:shadow-ai-accent/25 hover:scale-[1.03] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:shadow-none",
    secondary: "bg-white/[0.05] border border-white/[0.08] text-white/70 hover:bg-white/[0.08] hover:text-white hover:border-white/[0.12]",
    danger: "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/40"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
