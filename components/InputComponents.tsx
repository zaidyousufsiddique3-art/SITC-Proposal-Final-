import React, { useRef } from 'react';
import { UploadIcon, CheckIcon, ArrowRightIcon } from './Icons';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormInput: React.FC<InputProps> = ({ label, error, className, ...props }) => (
  <div className="flex flex-col gap-1.5 mb-4 w-full">
    <label className="text-[11px] uppercase tracking-widest font-semibold theme-text-secondary">{label}</label>
    <input
      className={`bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--placeholder)] focus:ring-2 focus:ring-[var(--input-focus)] focus:border-ai-accent focus:outline-none transition-all duration-200 text-sm hover:border-[var(--input-border-hover)] ${error ? 'border-red-500/60' : ''} ${className}`}
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
    <label className="text-[11px] uppercase tracking-widest font-semibold theme-text-secondary">{label}</label>
    <select
      className={`bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--input-focus)] focus:border-ai-accent focus:outline-none transition-all duration-200 text-sm hover:border-[var(--input-border-hover)] ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export const FormCheckbox: React.FC<{ label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl cursor-pointer hover:bg-[var(--row-hover)] transition-all duration-200 mb-4 select-none hover:border-[var(--input-border-hover)]">
    <div className={`relative flex items-center justify-center w-5 h-5 rounded border transition-all duration-200 ${checked ? 'bg-ai-accent border-ai-accent' : 'bg-[var(--input-bg)] border-[var(--input-border)] group-hover:border-[var(--input-border-hover)]'}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
      />
      {checked && <CheckIcon size={14} className="text-white" strokeWidth={3} />}
    </div>
    <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
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
      <label className="text-[11px] uppercase tracking-widest font-semibold theme-text-secondary">{label}</label>
      <div className="flex items-center gap-2 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-[var(--input-focus)] focus-within:border-ai-accent transition-all duration-200 hover:border-[var(--input-border-hover)]">
        <input
          type="date"
          value={startDate}
          min={minDate}
          onChange={(e) => onChange(e.target.value, endDate)}
          className="bg-transparent text-[var(--text-primary)] text-sm w-full focus:outline-none"
          placeholder="From"
        />
        <ArrowRightIcon size={14} className="text-[var(--text-disabled)]" />
        <input
          type="date"
          value={endDate}
          min={startDate}
          onChange={(e) => onChange(startDate, e.target.value)}
          className="bg-transparent text-[var(--text-primary)] text-sm w-full focus:outline-none"
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
      <label className="text-[11px] uppercase tracking-widest font-semibold theme-text-secondary">{label}</label>
      <div
        className="bg-[var(--bg-secondary)] border border-dashed border-[var(--panel-border)] rounded-xl p-4 hover:bg-[var(--row-hover)] hover:border-ai-accent/30 transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 shadow-sm"
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
          <div className="flex flex-col items-center text-[var(--text-disabled)]">
            <UploadIcon />
            <span className="text-xs mt-1.5 font-medium">Click to upload</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Multi-file uploader with limit
interface MultiFileUploaderProps {
  label: string;
  onFilesSelect: (base64Files: string[]) => void;
  currentCount: number;
  maxFiles: number;
}

export const MultiFileUploader: React.FC<MultiFileUploaderProps> = ({ label, onFilesSelect, currentCount, maxFiles }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = maxFiles - currentCount;

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Only take up to remaining slots
    const toProcess = Array.from(files).slice(0, remaining);
    if (toProcess.length === 0) return;

    const results: string[] = [];
    let loaded = 0;

    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        results.push(reader.result as string);
        loaded++;
        if (loaded === toProcess.length) {
          onFilesSelect(results);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same files can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  };

  if (remaining <= 0) {
    return (
      <div className="flex flex-col items-center justify-center text-[var(--text-disabled)] p-4 text-xs">
        <span>Max {maxFiles} images reached</span>
      </div>
    );
  }

  return (
    <div
      className="bg-[var(--bg-secondary)] border border-dashed border-[var(--panel-border)] rounded-xl p-4 hover:bg-[var(--row-hover)] hover:border-ai-accent/30 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center gap-1 shadow-sm"
      onClick={() => inputRef.current?.click()}
    >
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept="image/*"
        multiple
        onChange={handleFiles}
      />
      <UploadIcon className="text-[var(--text-disabled)]" />
      <span className="text-xs text-[var(--text-muted)] font-medium">Click to upload</span>
      <span className="text-[10px] text-[var(--text-disabled)]">{remaining} of {maxFiles} remaining</span>
    </div>
  );
};

export const SectionHeader: React.FC<{ title: string; icon?: React.ReactNode }> = ({ title, icon }) => (
  <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[var(--divider)]">
    {icon && <div className="text-ai-accent">{icon}</div>}
    <h3 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">{title}</h3>
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }> = ({ children, variant = 'primary', className, ...props }) => {
  const baseStyle = "px-6 py-2.5 rounded-[10px] font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm";
  const variants = {
    primary: "gradient-accent text-white shadow-lg shadow-ai-accent/15 hover:shadow-ai-accent/25 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 disabled:shadow-none",
    secondary: "bg-[var(--panel-bg)] border border-[var(--panel-border)] text-[var(--text-primary)] hover:bg-[var(--row-hover)] shadow-sm",
    danger: "bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 hover:border-red-500/40"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className} hover:scale-[1.02] transition-transform`} {...props}>
      {children}
    </button>
  );
};

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ComponentType<any>;
  size?: number;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const IconButton: React.FC<IconButtonProps> = ({ icon: Icon, size = 20, variant = 'secondary', className, ...props }) => {
  const variants = {
    primary: "gradient-accent text-white",
    secondary: "icon-button",
    ghost: "bg-transparent hover:bg-[var(--row-hover)] text-[var(--icon-color)] hover:text-ai-accent"
  };

  return (
    <button
      className={`icon-button ${variants[variant]} ${className}`}
      {...props}
    >
      <Icon size={size} strokeWidth={2} />
    </button>
  );
};
