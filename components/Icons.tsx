
import React from 'react';
import {
  Home,
  FileText,
  Building2,
  Plane,
  Car,
  Compass,
  Layers,
  Wallet,
  Plus,
  Trash2,
  Pencil,
  Save,
  ArrowLeft,
  ArrowRight,
  Upload,
  User,
  LogOut,
  Sun,
  Moon,
  Copy,
  Users,
  Lock,
  Bus,
  Bed,
  UtensilsCrossed,
  LayoutDashboard,
  Calendar,
  Check,
  ChevronDown,
  Presentation,
  ShieldCheck,
  Search,
  Settings
} from 'lucide-react';

/* SITC Branded Logos (SVG) */
export const SITCLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 500 280" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M250 100 C250 80 265 50 250 20 C235 50 250 80 250 100 Z" fill="#d4af37" className="opacity-90" />
    <g stroke="#d4af37" strokeWidth="4" strokeLinecap="round" fill="none">
      <path d="M250 20 Q220 10 200 40" />
      <path d="M250 20 Q280 10 300 40" />
      <path d="M250 20 Q210 -5 180 20" />
      <path d="M250 20 Q290 -5 320 20" />
      <path d="M250 20 Q230 -10 200 0" />
      <path d="M250 20 Q270 -10 300 0" />
    </g>
    <text x="250" y="180" textAnchor="middle" fill="#d4af37" fontSize="110" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="-2" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
      الدولية
    </text>
    <path d="M100 200 Q250 260 400 140" stroke="#0c4a6e" strokeWidth="6" strokeLinecap="round" />
    <text x="250" y="250" textAnchor="middle" fill="#f8fafc" fontSize="26" fontFamily="Montserrat, sans-serif" fontWeight="500" letterSpacing="1">
      Saudi International Travel Company
    </text>
  </svg>
);

export const PalmLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    <path d="M50 95 C50 80, 60 60, 50 40 C40 60, 50 80, 50 95 Z" fill="currentColor" className="opacity-90" />
    <path d="M50 40 Q30 30 20 50" stroke="currentColor" strokeWidth="3" fill="none" className="opacity-80" />
    <path d="M50 40 Q70 30 80 50" stroke="currentColor" strokeWidth="3" fill="none" className="opacity-80" />
    <path d="M50 40 Q35 10 10 30" stroke="currentColor" strokeWidth="3" fill="none" className="opacity-80" />
    <path d="M50 40 Q65 10 90 30" stroke="currentColor" strokeWidth="3" fill="none" className="opacity-80" />
    <path d="M50 40 Q50 10 50 5" stroke="currentColor" strokeWidth="3" fill="none" className="opacity-80" />
  </svg>
);

/* Enterprise-Grade Icons (Mapped to Lucide) */
export const DashboardIcon = (props: any) => <LayoutDashboard {...props} strokeWidth={2} size={props.size || 20} />;
export const ProposalIcon = (props: any) => <FileText {...props} strokeWidth={2} size={props.size || 20} />;
export const BuildingIcon = (props: any) => <Building2 {...props} strokeWidth={2} size={props.size || 20} />;
export const PlaneIcon = (props: any) => <Plane {...props} strokeWidth={2} size={props.size || 20} />;
export const CarIcon = (props: any) => <Car {...props} strokeWidth={2} size={props.size || 20} />;
export const CompassIcon = (props: any) => <Compass {...props} strokeWidth={2} size={props.size || 20} />;
export const LayersIcon = (props: any) => <Layers {...props} strokeWidth={2} size={props.size || 20} />;
export const WalletIcon = (props: any) => <Wallet {...props} strokeWidth={2} size={props.size || 20} />;
export const PlusIcon = (props: any) => <Plus {...props} strokeWidth={2} size={props.size || 20} />;
export const TrashIcon = (props: any) => <Trash2 {...props} strokeWidth={2} size={props.size || 20} />;
export const EditIcon = (props: any) => <Pencil {...props} strokeWidth={2} size={props.size || 20} />;
export const SaveIcon = (props: any) => <Save {...props} strokeWidth={2} size={props.size || 20} />;
export const ArrowLeftIcon = (props: any) => <ArrowLeft {...props} strokeWidth={2} size={props.size || 20} />;
export const ArrowRightIcon = (props: any) => <ArrowRight {...props} strokeWidth={2} size={props.size || 20} />;
export const UploadIcon = (props: any) => <Upload {...props} strokeWidth={2} size={props.size || 20} />;
export const UserIcon = (props: any) => <User {...props} strokeWidth={2} size={props.size || 20} />;
export const LogOutIcon = (props: any) => <LogOut {...props} strokeWidth={2} size={props.size || 20} />;
export const SunIcon = (props: any) => <Sun {...props} strokeWidth={2} size={props.size || 20} />;
export const MoonIcon = (props: any) => <Moon {...props} strokeWidth={2} size={props.size || 20} />;
export const CopyIcon = (props: any) => <Copy {...props} strokeWidth={2} size={props.size || 20} />;
export const UsersIcon = (props: any) => <Users {...props} strokeWidth={2} size={props.size || 20} />;
export const LockIcon = (props: any) => <Lock {...props} strokeWidth={2} size={props.size || 20} />;
export const BusIcon = (props: any) => <Bus {...props} strokeWidth={2} size={props.size || 20} />;
export const BedIcon = (props: any) => <Bed {...props} strokeWidth={2} size={props.size || 20} />;
export const UtensilsIcon = (props: any) => <UtensilsCrossed {...props} strokeWidth={2} size={props.size || 20} />;
export const HomeIcon = (props: any) => <Home {...props} strokeWidth={2} size={props.size || 20} />;
export const CalendarIcon = (props: any) => <Calendar {...props} strokeWidth={2} size={props.size || 20} />;
export const CheckIcon = (props: any) => <Check {...props} strokeWidth={2} size={props.size || 20} />;
export const ChevronDownIcon = (props: any) => <ChevronDown {...props} strokeWidth={2} size={props.size || 20} />;
export const PresentationIcon = (props: any) => <Presentation {...props} strokeWidth={2} size={props.size || 20} />;
export const ShieldCheckIcon = (props: any) => <ShieldCheck {...props} strokeWidth={2} size={props.size || 20} />;
export const SearchIcon = (props: any) => <Search {...props} strokeWidth={2} size={props.size || 20} />;
export const SettingsIcon = (props: any) => <Settings {...props} strokeWidth={2} size={props.size || 20} />;
export const MeetingIcon = (props: any) => <Presentation {...props} strokeWidth={2} size={props.size || 20} />;
export const ActivityIcon = (props: any) => <Compass {...props} strokeWidth={2} size={props.size || 20} />;
export const CustomIcon = (props: any) => <Layers {...props} strokeWidth={2} size={props.size || 20} />;
