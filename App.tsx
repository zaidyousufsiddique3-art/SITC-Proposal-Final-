
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProposalPDF } from './components/ProposalPDF';
import { AuthScreen } from './components/AuthComponents';
import { ProposalGenerationLoader } from './components/ProposalGenerationLoader';
import { FormInput, FormSelect, FormCheckbox, FileUploader, MultiFileUploader, SectionHeader, Button, DateRangePicker, IconButton } from './components/InputComponents';
import { ProposalData, HotelDetails, FlightDetails, FlightClass, TransportationDetails, VehicleType, CustomItem, ActivityDetails, Inclusions, CategoryMarkups, MarkupType, FlightLeg, User, UserRole, ProposalHistory, MarkupConfig, RoomType, HotelImage, ImageTag, MeetingDetails, DiningDetails, FlightQuote, Company, ProposalSectionsConfig } from './types';
import { BedIcon, PlaneIcon, BusIcon, ActivityIcon, CustomIcon, PalmLogo, SaveIcon, EditIcon, TrashIcon, CopyIcon, HomeIcon, UserIcon, UsersIcon, LockIcon, UtensilsIcon, MeetingIcon, SITCLogo, SunIcon, MoonIcon, CheckIcon, PlusIcon, ChevronDownIcon, CalendarIcon, LogOutIcon, ProposalIcon, BuildingIcon, SettingsIcon, SearchIcon, ShieldCheckIcon, PresentationIcon, ArrowLeftIcon, ArrowRightIcon, WalletIcon } from './components/Icons';
import { getGlobalSettings, saveGlobalSettings, getUsers, createSubUserWithAuth, createCompanyAdminWithAuth, deleteUserProfile, validatePassword, changePassword, updateUserProfile, getCompanies, saveCompany, updateCompany, deleteCompany, adminResetUserPassword, validatePhone, logoutUser, resolveProposalSections } from './services/authService';
import { getProposals, saveProposal, deleteProposal, stripDisabledSections } from './services/proposalService';

// --- Defaults & Init ---

const MEETING_ROOM_OPTIONS = [
    { label: 'Select Room', value: '' },
    { label: 'Ballroom A', value: 'Ballroom A' },
    { label: 'Ballroom B', value: 'Ballroom B' },
    { label: 'Conference Hall 1', value: 'Conference Hall 1' },
    { label: 'Conference Hall 2', value: 'Conference Hall 2' },
    { label: 'Boardroom', value: 'Boardroom' },
    { label: 'Grand Hall', value: 'Grand Hall' },
    { label: 'Meeting Room 101', value: 'Meeting Room 101' },
    { label: 'Meeting Room 102', value: 'Meeting Room 102' },
    { label: 'Other (Custom)', value: 'Other' }
];

const DINING_OPTIONS = [
    { label: 'Select Type', value: '' },
    { label: 'Lunch', value: 'Lunch' },
    { label: 'Dinner', value: 'Dinner' },
    { label: 'Breakfast', value: 'Breakfast' },
    { label: 'Coffee Break', value: 'Coffee Break' },
    { label: 'Snack', value: 'Snack' },
    { label: 'Buffet', value: 'Buffet' },
    { label: 'Set Menu', value: 'Set Menu' },
    { label: 'Other (Custom)', value: 'Other' }
];

const initialMarkup = { type: MarkupType.Percent, value: 10 };

const defaultMarkups: CategoryMarkups = {
    hotels: { ...initialMarkup },
    meetings: { ...initialMarkup },
    flights: { ...initialMarkup },
    transportation: { ...initialMarkup },
    activities: { ...initialMarkup },
    customItems: { ...initialMarkup }
};

const initialRoomType: RoomType = {
    id: 'rt_1',
    name: 'Standard Room',
    description: '',
    netPrice: 0,
    quantity: 1,
    checkIn: '',
    checkOut: '',
    numNights: 1,
    includeInSummary: true
};

const initialHotel: HotelDetails = {
    id: '',
    name: '',
    currency: 'SAR',
    location: '',
    website: '',
    vatRule: 'domestic',
    included: true,
    images: [],
    roomTypes: [{ ...initialRoomType }],
    meetingRooms: [],
    dining: []
};

const initialFlightLeg: FlightLeg = {
    from: '',
    to: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    duration: '',
    airline: '',
    flightNumber: '',
    flightClass: FlightClass.Economy,
    luggage: '23kg'
};

const initialFlight: FlightDetails = {
    id: '',
    routeDescription: '',
    outbound: [{ ...initialFlightLeg }],
    return: [{ ...initialFlightLeg }],
    quotes: [
        { class: FlightClass.Economy, price: 0, quantity: 1 },
        { class: FlightClass.Business, price: 0, quantity: 1 }
    ],
    vatRule: 'international',
    included: true,
    includeInSummary: true
};

const defaultProposalData: ProposalData = {
    id: '',
    lastModified: 0,
    proposalName: '',
    customerName: '',
    branding: {
        companyLogo: ''
    },
    pricing: {
        currency: 'SAR',
        enableVat: true,
        vatPercent: 15,
        markups: defaultMarkups,
        showPrices: true
    },
    hotelOptions: [],
    flightOptions: [],
    transportation: [],
    customItems: [],
    activities: [],
    inclusions: {
        hotels: true,
        flights: true,
        transportation: true,
        customItems: true,
        activities: false,
    },
    createdBy: '',
    sharedWith: [],
    history: [],
    versions: []
};

const App: React.FC = () => {
    // --- App State ---
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [viewMode, setViewMode] = useState<'dashboard' | 'form' | 'preview'>('dashboard');
    const [subMode, setSubMode] = useState<'all_proposals' | 'my_proposals' | 'company_users' | 'companies' | 'global_settings' | 'account_settings'>('my_proposals');
    const [step, setStep] = useState(0);
    const [savedProposals, setSavedProposals] = useState<ProposalData[]>([]);
    const [formData, setFormData] = useState<ProposalData>(defaultProposalData);
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        const saved = localStorage.getItem('sitc_theme');
        return (saved as 'dark' | 'light') || 'dark';
    });

    useEffect(() => {
        document.documentElement.className = `theme-${theme}`;
        localStorage.setItem('sitc_theme', theme);
    }, [theme]);

    // Super Admin / Company State
    const [companies, setCompanies] = useState<Company[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]); // Added state for users
    const [newCompany, setNewCompany] = useState<Partial<Company>>({ name: '', domain: '', logo: '' });
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);

    // User Management State
    const [newUser, setNewUser] = useState<Partial<User>>({ firstName: '', lastName: '', email: '', password: '', dob: '', phone: '' });
    const [userMsg, setUserMsg] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editUserPass, setEditUserPass] = useState('');

    // Generation loader state
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationComplete, setGenerationComplete] = useState(false);

    // Sharing state
    const [shareEmail, setShareEmail] = useState('');
    const [sharingId, setSharingId] = useState<string | null>(null);

    // Password Change State
    const [passData, setPassData] = useState({ current: '', new: '' });
    const [passMsg, setPassMsg] = useState({ type: '', text: '' });

    // UI Expansion State
    const [expandedHotels, setExpandedHotels] = useState<Record<string, boolean>>({});
    const [expandedFlights, setExpandedFlights] = useState<Record<string, boolean>>({});

    // --- Init ---
    useEffect(() => {
        const initData = async () => {
            if (user) {
                const fetchedProposals = await getProposals(user);
                setSavedProposals(fetchedProposals.filter(p => !p.isDeleted));

                const fetchedCompanies = await getCompanies();
                setCompanies(fetchedCompanies);

                const fetchedUsers = await getUsers();
                setAllUsers(fetchedUsers);
            }
        };
        initData();
    }, [user]);

    const refreshData = async () => {
        if (!user) return;
        const fetchedProposals = await getProposals(user);
        setSavedProposals(fetchedProposals.filter(p => !p.isDeleted));

        const fetchedCompanies = await getCompanies();
        setCompanies(fetchedCompanies);

        const fetchedUsers = await getUsers();
        setAllUsers(fetchedUsers);
    };

    // --- Handlers ---
    const handleLogout = async () => {
        await logoutUser();
        setUser(null);
        setViewMode('dashboard');
        setSubMode('my_proposals');
        navigate('/');
    };

    const saveToStorage = async (proposal: ProposalData) => {
        try {
            await saveProposal(proposal, sectionsConfig);
            await refreshData();
        } catch (e) {
            alert("Error saving proposal: " + e.message);
        }
    };

    const handleCreateNew = async () => {
        if (!user) return;

        const userCompany = companies.find(c => c.id === user.companyId);
        const settings = await getGlobalSettings();

        // Create deep copy of initial hotel to avoid reference issues on fresh start
        const startHotel: HotelDetails = {
            ...initialHotel,
            id: Date.now().toString(),
            roomTypes: [{ ...initialRoomType, id: `rt_${Date.now()}` }],
            meetingRooms: [],
            dining: [],
            images: []
        };

        setFormData({
            ...defaultProposalData,
            id: Date.now().toString(),
            companyId: user.companyId,
            lastModified: Date.now(),
            branding: {
                ...defaultProposalData.branding,
                companyName: userCompany?.name || 'SITC',
                companyLogo: userCompany?.logo || settings.defaultCompanyLogo,
                contactName: `${user.firstName} ${user.lastName}`,
                contactEmail: user.email,
                contactPhone: user.phone
            },
            hotelOptions: [startHotel],
            flightOptions: [{ ...initialFlight, id: (Date.now() + 1).toString() }],
            createdBy: user.email,
            history: [{
                timestamp: Date.now(),
                action: 'created',
                userEmail: user.email,
                userRole: user.role,
                details: 'Initial creation'
            }],
            versions: []
        });
        setStep(0);
        setViewMode('form');
    };

    const handleEdit = (proposal: ProposalData) => {
        setFormData(proposal);
        setStep(0);
        setViewMode('form');
    };

    const handleDuplicate = async (proposal: ProposalData) => {
        const newProposal = {
            ...proposal,
            id: Date.now().toString(),
            lastModified: Date.now(),
            proposalName: `${proposal.proposalName} (Copy)`,
            createdBy: user?.email || '',
            history: [{
                timestamp: Date.now(),
                action: 'created',
                userEmail: user?.email || '',
                userRole: user?.role,
                details: `Duplicated from ${proposal.id}`
            }],
            versions: []
        };
        try {
            await saveProposal(newProposal);
            await refreshData();
        } catch (e: any) {
            alert("Error duplicating: " + e.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this proposal?")) {
            try {
                await deleteProposal(id);
                await refreshData();
            } catch (e: any) {
                alert("Error deleting: " + e.message);
            }
        }
    };

    const handleSaveProposal = async (isDraft: boolean) => {
        if (!user) return;
        if (isGenerating) return; // prevent double-click

        if (!formData.proposalName) {
            alert("Please enter a Proposal Name in the Branding section (Step 1).");
            setStep(0);
            return;
        }

        // Show loader for Generate (not drafts)
        if (!isDraft) {
            setIsGenerating(true);
            setGenerationComplete(false);
        }

        let currentVersions = [...formData.versions];
        const existing = savedProposals.find(p => p.id === formData.id);

        if (existing) {
            currentVersions.push({
                timestamp: Date.now(),
                savedBy: user.email,
            });
            if (currentVersions.length > 5) currentVersions.shift();
        }

        const historyEntry: ProposalHistory = {
            timestamp: Date.now(),
            action: isDraft ? 'saved_draft' : 'generated',
            userEmail: user.email,
            userRole: user.role,
            details: isDraft ? 'Draft saved' : 'Proposal generated'
        };

        const updatedProposal = {
            ...formData,
            lastModified: Date.now(),
            history: [...formData.history, historyEntry],
            versions: currentVersions
        };

        try {
            await saveProposal(updatedProposal, sectionsConfig);
            setFormData(updatedProposal);
            await refreshData();

            if (isDraft) {
                alert("Draft saved successfully.");
            } else {
                // Show completion, then navigate after fade
                setGenerationComplete(true);
            }
        } catch (e: any) {
            setIsGenerating(false);
            setGenerationComplete(false);
            alert("Error saving: " + e.message);
        }
    };

    // --- Admin / Company Functions ---

    const handleCreateCompany = async () => {
        if (!newCompany.name || !newCompany.domain) {
            setUserMsg("Company Name and Domain are required.");
            return;
        }
        try {
            const company: Company = {
                id: `comp_${Date.now()}`,
                name: newCompany.name!,
                domain: newCompany.domain!,
                logo: newCompany.logo || '',
                created: Date.now()
            };
            await saveCompany(company);
            setNewCompany({ name: '', domain: '', logo: '' });
            await refreshData();
            setUserMsg("Company created successfully.");
        } catch (e: any) {
            setUserMsg(e.message);
        }
    };

    const handleUpdateCompany = async () => {
        if (!editingCompany) return;
        try {
            await updateCompany(editingCompany.id, editingCompany);
            setEditingCompany(null);
            await refreshData();
            alert("Company updated.");
        } catch (e: any) {
            alert(e.message);
        }
    };

    const handleDeleteCompany = async (id: string) => {
        if (confirm("Delete company? This will affect all associated users and proposals.")) {
            try {
                await deleteCompany(id);
                await refreshData();
            } catch (e: any) {
                alert(e.message);
            }
        }
    };

    const handleCreateUser = async (role: 'admin' | 'user') => {
        if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName) {
            setUserMsg("Please fill all required fields.");
            return;
        }

        const passErr = validatePassword(newUser.password);
        if (passErr) {
            setUserMsg(passErr);
            return;
        }

        try {
            if (role === 'admin') {
                if (!newUser.companyId) {
                    setUserMsg("Please select a company for this Admin.");
                    return;
                }
                await createCompanyAdminWithAuth(user!.email, newUser.companyId, newUser as User);
            } else {
                await createSubUserWithAuth(user!.email, newUser as User);
            }
            setUserMsg("User created successfully.");
            setNewUser({ firstName: '', lastName: '', email: '', password: '', dob: '', phone: '', companyId: '' });
            await refreshData();
        } catch (e: any) {
            setUserMsg(e.message);
        }
    };

    const handleDeleteUser = async (email: string) => {
        if (confirm(`Delete user ${email}?`)) {
            try {
                await deleteUserProfile(email);
                setEditingUser(null);
                await refreshData();
            } catch (e: any) {
                alert(e.message);
            }
        }
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        try {
            const updates: Partial<User> = { email: editingUser.email, firstName: editingUser.firstName, lastName: editingUser.lastName };

            if (editingUser.phone) {
                updates.phone = editingUser.phone;
            }

            if (editUserPass) {
                const passErr = validatePassword(editUserPass);
                if (passErr) throw new Error(passErr);

                if (user?.role === 'super_admin') {
                    await adminResetUserPassword(editingUser.email, editUserPass);
                } else {
                    updates.password = editUserPass;
                    await updateUserProfile(editingUser.email, updates);
                }
            } else {
                await updateUserProfile(editingUser.email, updates);
            }

            alert("User updated.");
            setEditingUser(null);
            setEditUserPass('');
            await refreshData();
        } catch (e: any) {
            alert(e.message);
        }
    };

    // --- Render Helpers ---
    const renderEditCompanyModal = () => {
        if (!editingCompany) return null;
        return (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-md">
                <div className="glass w-full max-w-lg max-h-[90vh] rounded-2xl shadow-card flex flex-col animate-fade-up">
                    <div className="p-6 border-b border-[var(--panel-border)] flex justify-between items-center flex-shrink-0">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Edit Company</h3>
                        <button onClick={() => setEditingCompany(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Close</button>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto flex-1">
                        <FormInput label="Company Name" value={editingCompany.name} onChange={e => setEditingCompany({ ...editingCompany, name: e.target.value })} />
                        <FormInput label="Domain" value={editingCompany.domain} onChange={e => setEditingCompany({ ...editingCompany, domain: e.target.value })} />
                        <FileUploader label="Company Logo" currentImage={editingCompany.logo} onFileSelect={b64 => setEditingCompany({ ...editingCompany, logo: b64 })} />

                        {/* Proposal Builder Sections (Requirement 13.x) */}
                        <div className="pt-4 border-t border-[var(--panel-border)]">
                            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
                                <SettingsIcon size={14} className="text-ai-secondary" /> Proposal Builder Sections
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'pricingMarkup', label: 'Pricing & Markup' },
                                    { id: 'accommodation', label: 'Accommodation' },
                                    { id: 'flights', label: 'Flights' },
                                    { id: 'transportation', label: 'Transportation' },
                                    { id: 'customServices', label: 'Custom Services' },
                                    { id: 'activities', label: 'Activities' }
                                ].map((sec) => (
                                    <label key={sec.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-[var(--panel-border)] hover:border-ai-accent/30 transition-all cursor-pointer">
                                        <div>
                                            <div className="text-[11px] font-bold text-[var(--text-primary)]">{sec.label}</div>
                                            <div className="text-[9px] text-[var(--text-muted)]">Enabled in wizard</div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={resolveProposalSections(editingCompany)[sec.id as keyof ProposalSectionsConfig]}
                                            onChange={(e) => {
                                                const current = resolveProposalSections(editingCompany);
                                                setEditingCompany({
                                                    ...editingCompany,
                                                    proposalSections: {
                                                        ...current,
                                                        [sec.id]: e.target.checked
                                                    }
                                                });
                                            }}
                                            className="w-4 h-4 rounded border-[var(--input-border)] text-ai-accent focus:ring-0 cursor-pointer"
                                        />
                                    </label>
                                ))}
                            </div>
                            <div className="mt-4 p-3 rounded-xl bg-ai-accent/5 border border-ai-accent/10">
                                <p className="text-[10px] text-ai-secondary/80 leading-relaxed font-medium">
                                    <strong>Note:</strong> Proposal Details and Inclusions Check are always mandatory and cannot be disabled.
                                </p>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-[var(--panel-border)] flex justify-end items-center gap-4">
                            <Button variant="secondary" onClick={() => setEditingCompany(null)}>Cancel</Button>
                            <Button onClick={handleUpdateCompany}>Save Changes</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderCompanyManagement = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {renderEditCompanyModal()}
            <div className="glass p-6 rounded-2xl">
                <SectionHeader title="Create Company" />
                {userMsg && <div className="mb-4 p-3 bg-ai-accent/10 text-ai-secondary text-sm rounded-xl border border-ai-accent/20">{userMsg}</div>}
                <FormInput label="Company Name" value={newCompany.name} onChange={e => setNewCompany({ ...newCompany, name: e.target.value })} placeholder="e.g. Agency A" />
                <FormInput label="Domain (e.g. sitc.sa)" value={newCompany.domain} onChange={e => setNewCompany({ ...newCompany, domain: e.target.value })} placeholder="Do not include @" />
                <FileUploader label="Company Logo" currentImage={newCompany.logo} onFileSelect={b64 => setNewCompany({ ...newCompany, logo: b64 })} />
                <Button onClick={handleCreateCompany} className="mt-4">Create Company</Button>
            </div>
            <div className="glass p-6 rounded-2xl">
                <SectionHeader title="Existing Companies" />
                <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                    {companies.map(c => (
                        <div key={c.id} className="p-4 inner-row flex justify-between items-center card-hover">
                            <div className="flex items-center gap-3">
                                {c.logo ? <img src={c.logo} className="w-8 h-8 object-contain bg-white rounded-lg p-0.5" /> : <div className="w-8 h-8 bg-white/10 rounded-lg"></div>}
                                <div>
                                    <div className="font-semibold text-[var(--text-primary)] text-sm">{c.name}</div>
                                    <div className="text-xs text-[var(--text-muted)]">@{c.domain}</div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setEditingCompany(c)} className="text-ai-secondary hover:text-[var(--text-primary)] text-xs font-semibold transition-colors">Edit</button>
                                <button onClick={() => handleDeleteCompany(c.id)} className="text-red-400/70 hover:text-red-300 text-xs font-semibold transition-colors">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderUserManagement = () => {
        const isSuper = user?.role === 'super_admin';
        const myCompanyId = user?.companyId;

        const visibleUsers = isSuper
            ? allUsers
            : allUsers.filter(u => u.companyId === myCompanyId && u.role === 'user');

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass p-6 rounded-2xl">
                    <SectionHeader title={isSuper ? "Create Company Admin" : "Create Sub User"} />
                    {userMsg && <div className="mb-4 p-3 bg-ai-accent/10 text-ai-secondary text-sm rounded-xl border border-ai-accent/20">{userMsg}</div>}

                    {isSuper && (
                        <FormSelect
                            label="Assign to Company"
                            options={[{ label: 'Select Company', value: '' }, ...companies.map(c => ({ label: c.name, value: c.id }))]}
                            value={newUser.companyId || ''}
                            onChange={e => setNewUser({ ...newUser, companyId: e.target.value })}
                        />
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <FormInput label="First Name" value={newUser.firstName} onChange={e => setNewUser({ ...newUser, firstName: e.target.value })} />
                        <FormInput label="Last Name" value={newUser.lastName} onChange={e => setNewUser({ ...newUser, lastName: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput label="DOB" type="date" value={newUser.dob || ''} onChange={e => setNewUser({ ...newUser, dob: e.target.value })} />
                        <FormInput label="Phone (e.g. +966...)" value={newUser.phone || ''} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} />
                    </div>
                    <FormInput label="Email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                    <FormInput label="Password" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />

                    <Button onClick={() => handleCreateUser(isSuper ? 'admin' : 'user')} className="mt-4">
                        {isSuper ? 'Create Admin' : 'Create User'}
                    </Button>
                </div>

                <div className="glass p-6 rounded-2xl">
                    <SectionHeader title="Users Directory" />
                    <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                        {visibleUsers.map((u, i) => {
                            if (u.role === 'super_admin' && user?.email !== u.email) return null;
                            return (
                                <div key={i} className="p-4 inner-row flex justify-between items-center border-l-2 border-ai-accent/30 card-hover">
                                    <div>
                                        <div className="font-semibold text-[var(--text-primary)] text-sm">{u.firstName} {u.lastName}</div>
                                        <div className="text-xs text-[var(--text-muted)]">{u.email} <span className="text-ai-secondary ml-2 capitalize">({u.role})</span></div>
                                        {isSuper && u.companyId && <div className="text-[10px] text-[var(--text-muted)] mt-0.5">{companies.find(c => c.id === u.companyId)?.name}</div>}
                                    </div>
                                    {u.email !== user?.email && (
                                        <button onClick={() => { setEditingUser(u); setEditUserPass(''); }} className="px-4 py-1.5 gradient-accent text-white text-xs rounded-lg font-semibold hover:shadow-glow transition-all">Manage</button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const renderEditUserModal = () => {
        if (!editingUser) return null;
        return (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-md">
                <div className="glass w-full max-w-lg rounded-2xl shadow-card flex flex-col animate-fade-up">
                    <div className="p-6 border-b border-[var(--panel-border)] flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Manage User</h3>
                        <button onClick={() => setEditingUser(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Close</button>
                    </div>
                    <div className="p-6 space-y-4">
                        <FormInput label="Email Address" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} />
                        <div className="grid grid-cols-2 gap-4">
                            <FormInput label="First Name" value={editingUser.firstName} onChange={e => setEditingUser({ ...editingUser, firstName: e.target.value })} />
                            <FormInput label="Last Name" value={editingUser.lastName} onChange={e => setEditingUser({ ...editingUser, lastName: e.target.value })} />
                        </div>
                        <FormInput label="Phone" value={editingUser.phone} onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })} />
                        <div className="p-4 bg-white/[0.03] rounded-xl border border-[var(--panel-border)]">
                            <label className="text-[11px] uppercase tracking-widest font-semibold text-ai-secondary/80 mb-2 block">
                                {user?.role === 'super_admin' ? 'Set Temporary Password (Force Reset)' : 'Set New Password'}
                            </label>
                            <input type="password" placeholder="Leave blank to keep current" className="bg-[var(--divider)] border border-[var(--panel-border)] rounded-xl px-4 py-3 w-full text-[var(--text-primary)] text-sm focus:ring-2 focus:ring-ai-accent/40 focus:border-ai-accent focus:outline-none transition-all" value={editUserPass} onChange={e => setEditUserPass(e.target.value)} />
                        </div>
                        <div className="pt-4 border-t border-[var(--panel-border)] flex justify-between items-center">
                            <button onClick={() => handleDeleteUser(editingUser.email)} className="text-red-400/70 hover:text-red-300 text-sm font-semibold flex items-center gap-2 transition-colors"><TrashIcon /> Delete User</button>
                            <Button onClick={handleUpdateUser}>Save Changes</Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Step Renders
    // Step Renders
    const renderBrandingStep = () => (
        <div className="space-y-6">
            <div className="form-panel">
                <SectionHeader title="Proposal Details" icon={<PalmLogo className="w-6 h-6" />} />
                <div className="form-grid mt-6">
                    <FormInput
                        label="Proposal Name (Required)"
                        value={formData.proposalName}
                        onChange={(e) => setFormData({ ...formData, proposalName: e.target.value })}
                        placeholder="e.g. London Group Nov 2025"
                    />
                    <FormInput
                        label="Customer / Client Name"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="e.g. Acme Corp"
                    />
                </div>
            </div>

            <div className="form-panel">
                <SectionHeader title="Branding" icon={<EditIcon />} />
                <div className="form-grid mt-6">
                    <div className="col-span-1">
                        <FileUploader
                            label="Client Logo"
                            currentImage={formData.branding.clientLogo}
                            onFileSelect={(b64) => setFormData({ ...formData, branding: { ...formData.branding, clientLogo: b64 } })}
                        />
                    </div>
                    <div className="col-span-1">
                        <div className="opacity-75 pointer-events-none filter">
                            <label className="text-[11px] uppercase tracking-wider font-bold text-ai-accent mb-2 block">Company Logo (Auto-filled)</label>
                            <div className="p-4 rounded-xl section-surface text-center h-[110px] flex items-center justify-center border border-[var(--divider)]">
                                {formData.branding.companyLogo ? (
                                    <img src={formData.branding.companyLogo} className="h-20 object-contain" alt="Company Logo" />
                                ) : (
                                    <span className="text-xs text-[var(--text-muted)] uppercase font-black">SITC Standard</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-panel">
                <SectionHeader title="Contact Details (Auto-filled)" icon={<UserIcon />} />
                <div className="form-grid mt-6">
                    <FormInput label="Company Name" value={formData.branding.companyName || ''} onChange={(e) => setFormData({ ...formData, branding: { ...formData.branding, companyName: e.target.value } })} />
                    <FormInput label="Prepared By" value={formData.branding.contactName || ''} onChange={(e) => setFormData({ ...formData, branding: { ...formData.branding, contactName: e.target.value } })} />
                    <FormInput label="Email" value={formData.branding.contactEmail || ''} onChange={(e) => setFormData({ ...formData, branding: { ...formData.branding, contactEmail: e.target.value } })} />
                    <FormInput label="Phone" value={formData.branding.contactPhone || ''} onChange={(e) => setFormData({ ...formData, branding: { ...formData.branding, contactPhone: e.target.value } })} />
                </div>
            </div>
        </div>
    );
    const renderPricingConfigStep = () => (
        <div className="space-y-6">
            <div className="form-panel">
                <SectionHeader title="Currency & Display" icon={<WalletIcon />} />
                <div className="form-grid mt-6">
                    <FormSelect
                        label="Currency"
                        options={['SAR', 'USD', 'EUR', 'GBP', 'AED'].map(c => ({ label: c, value: c }))}
                        value={formData.pricing.currency}
                        onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, currency: e.target.value } })}
                    />
                    <div className="flex items-center h-full pt-4 md:pt-6">
                        <FormCheckbox
                            label="Show Prices in Proposal"
                            checked={formData.pricing.showPrices}
                            onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, showPrices: e.target.checked } })}
                        />
                    </div>
                </div>
            </div>

            <div className="form-panel">
                <SectionHeader title="Service Markups" icon={<EditIcon />} />
                <div className="mt-6 space-y-3">
                    {(Object.entries(formData.pricing.markups) as [string, MarkupConfig][]).map(([cat, config]) => (
                        <div key={cat} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-3 section-surface rounded-xl border border-[var(--panel-border)]">
                            <div className="col-span-12 md:col-span-4 font-bold text-white capitalize text-sm">{cat}</div>
                            <div className="col-span-12 md:col-span-4">
                                <FormSelect
                                    label="Type"
                                    options={[{ label: 'Percentage %', value: MarkupType.Percent }, { label: 'Fixed Amount', value: MarkupType.Fixed }]}
                                    value={config.type}
                                    onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, markups: { ...formData.pricing.markups, [cat]: { ...config, type: e.target.value } } } })}
                                    className="mb-0 text-xs"
                                />
                            </div>
                            <div className="col-span-12 md:col-span-4">
                                <FormInput
                                    label="Value"
                                    type="number"
                                    value={config.value}
                                    onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, markups: { ...formData.pricing.markups, [cat]: { ...config, value: parseFloat(e.target.value) } } } })}
                                    className="mb-0 text-xs"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="form-panel">
                <SectionHeader title="VAT Settings" icon={<ShieldCheckIcon />} />
                <div className="form-grid mt-6 items-center">
                    <FormCheckbox
                        label="Enable VAT"
                        checked={formData.pricing.enableVat}
                        onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, enableVat: e.target.checked } })}
                    />
                    {formData.pricing.enableVat && (
                        <div className="w-full">
                            <FormInput
                                label="VAT %"
                                type="number"
                                value={formData.pricing.vatPercent}
                                onChange={(e) => setFormData({ ...formData, pricing: { ...formData.pricing, vatPercent: parseFloat(e.target.value) } })}
                                className="mb-0"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Hotel Logic
    const addHotel = () => {
        // FIX: Deep copy arrays to prevent reference sharing between hotel options
        const newHotel: HotelDetails = {
            ...initialHotel,
            id: Date.now().toString(),
            roomTypes: [{ ...initialRoomType, id: `rt_${Date.now()}` }],
            meetingRooms: [],
            dining: [],
            images: []
        };
        setFormData({ ...formData, hotelOptions: [...formData.hotelOptions, newHotel] });
    };
    const removeHotel = (index: number) => { const h = [...formData.hotelOptions]; h.splice(index, 1); setFormData({ ...formData, hotelOptions: h }); };
    const updateHotel = (index: number, field: keyof HotelDetails, value: any) => { const h = [...formData.hotelOptions]; h[index] = { ...h[index], [field]: value }; setFormData({ ...formData, hotelOptions: h }); };
    const updateHotelImageTag = (index: number, imgIdx: number, tag: string) => { const h = [...formData.hotelOptions]; h[index].images[imgIdx].tag = tag === 'none' ? undefined : (tag as ImageTag); setFormData({ ...formData, hotelOptions: h }); };
    const addHotelImage = (index: number, url: string) => { const h = [...formData.hotelOptions]; if (h[index].images.length >= 3) return; h[index].images.push({ url, tag: undefined }); setFormData({ ...formData, hotelOptions: h }); };
    const addMultipleHotelImages = (index: number, urls: string[]) => { const h = [...formData.hotelOptions]; const remaining = 3 - h[index].images.length; const toAdd = urls.slice(0, remaining); toAdd.forEach(url => h[index].images.push({ url, tag: undefined })); setFormData({ ...formData, hotelOptions: h }); };
    const removeHotelImage = (index: number, imgIdx: number) => { const h = [...formData.hotelOptions]; h[index].images.splice(imgIdx, 1); setFormData({ ...formData, hotelOptions: h }); };
    const reorderHotelImages = (hotelIndex: number, fromIdx: number, toIdx: number) => { const h = [...formData.hotelOptions]; const imgs = [...h[hotelIndex].images]; const [moved] = imgs.splice(fromIdx, 1); imgs.splice(toIdx, 0, moved); h[hotelIndex] = { ...h[hotelIndex], images: imgs }; setFormData({ ...formData, hotelOptions: h }); };
    const addRoomType = (hotelIndex: number) => { const h = [...formData.hotelOptions]; h[hotelIndex].roomTypes.push({ ...initialRoomType, id: Date.now().toString(), includeInSummary: true }); setFormData({ ...formData, hotelOptions: h }); };

    // Date Update Logics
    const updateRoomTypeDates = (hotelIndex: number, roomIndex: number, checkIn: string, checkOut: string) => {
        const h = [...formData.hotelOptions];
        const updatedRoom = { ...h[hotelIndex].roomTypes[roomIndex], checkIn, checkOut };
        if (checkIn && checkOut) {
            const diff = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
            updatedRoom.numNights = diff > 0 ? diff : 0;
        }
        h[hotelIndex].roomTypes[roomIndex] = updatedRoom;
        setFormData({ ...formData, hotelOptions: h });
    };

    const updateRoomType = (hotelIndex: number, roomIndex: number, field: keyof RoomType, value: any) => { const h = [...formData.hotelOptions]; let updatedRoom = { ...h[hotelIndex].roomTypes[roomIndex], [field]: value }; h[hotelIndex].roomTypes[roomIndex] = updatedRoom; setFormData({ ...formData, hotelOptions: h }); };
    const removeRoomType = (hotelIndex: number, roomIndex: number) => { const h = [...formData.hotelOptions]; h[hotelIndex].roomTypes.splice(roomIndex, 1); setFormData({ ...formData, hotelOptions: h }); };
    const addMeeting = (hotelIndex: number) => { const h = [...formData.hotelOptions]; h[hotelIndex].meetingRooms.push({ id: Date.now().toString(), name: '', price: 0, quantity: 1, days: 1, startDate: '', endDate: '', includeInSummary: true }); setFormData({ ...formData, hotelOptions: h }); };

    const updateMeetingDates = (hotelIndex: number, mIndex: number, startDate: string, endDate: string) => {
        const h = [...formData.hotelOptions];
        let meeting = { ...h[hotelIndex].meetingRooms[mIndex], startDate, endDate };
        if (startDate && endDate) {
            const diff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1; // Inclusive
            meeting.days = diff > 0 ? diff : 1;
        }
        h[hotelIndex].meetingRooms[mIndex] = meeting;
        setFormData({ ...formData, hotelOptions: h });
    };

    const updateMeeting = (hotelIndex: number, mIndex: number, field: keyof MeetingDetails, value: any) => { const h = [...formData.hotelOptions]; let meeting = { ...h[hotelIndex].meetingRooms[mIndex], [field]: value }; h[hotelIndex].meetingRooms[mIndex] = meeting; setFormData({ ...formData, hotelOptions: h }); };
    const removeMeeting = (hotelIndex: number, mIndex: number) => { const h = [...formData.hotelOptions]; h[hotelIndex].meetingRooms.splice(mIndex, 1); setFormData({ ...formData, hotelOptions: h }); };

    const addDining = (hotelIndex: number) => { const h = [...formData.hotelOptions]; h[hotelIndex].dining.push({ id: Date.now().toString(), name: '', price: 0, quantity: 1, days: 1, includeInSummary: true }); setFormData({ ...formData, hotelOptions: h }); };

    const updateDiningDates = (hotelIndex: number, dIndex: number, startDate: string, endDate: string) => {
        const h = [...formData.hotelOptions];
        let dining = { ...h[hotelIndex].dining[dIndex], startDate, endDate };
        if (startDate && endDate) {
            const diff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1; // Inclusive
            dining.days = diff > 0 ? diff : 1;
        }
        h[hotelIndex].dining[dIndex] = dining;
        setFormData({ ...formData, hotelOptions: h });
    };

    const updateDining = (hotelIndex: number, dIndex: number, field: keyof DiningDetails, value: any) => {
        const h = [...formData.hotelOptions];
        let dining = { ...h[hotelIndex].dining[dIndex], [field]: value };
        h[hotelIndex].dining[dIndex] = dining;
        setFormData({ ...formData, hotelOptions: h });
    };
    const removeDining = (hotelIndex: number, dIndex: number) => { const h = [...formData.hotelOptions]; h[hotelIndex].dining.splice(dIndex, 1); setFormData({ ...formData, hotelOptions: h }); };

    const renderHotelStep = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <SectionHeader title="Accommodation Options" icon={<BedIcon />} />
                <Button variant="secondary" onClick={addHotel} className="h-9 text-xs"><PlusIcon size={14} /> Add Hotel Option</Button>
            </div>

            {formData.hotelOptions.map((hotel, index) => {
                const isExpanded = expandedHotels[hotel.id] !== false;
                const toggleExpanded = () => setExpandedHotels({ ...expandedHotels, [hotel.id]: !isExpanded });

                return (
                    <div key={hotel.id} className="form-panel relative overflow-hidden transition-all duration-300">
                        {/* Header / Accordion Trigger */}
                        <div className="flex items-center justify-between cursor-pointer" onClick={toggleExpanded}>
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${isExpanded ? 'bg-ai-accent text-white' : 'bg-white/5 text-[var(--text-muted)]'}`}>
                                    {index + 1}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] capitalize">{hotel.name || `Hotel Option ${index + 1}`}</h3>
                                    {!isExpanded && <p className="text-xs text-[var(--text-muted)]">{hotel.location || 'No location set'} • {hotel.roomTypes.length} Room Types</p>}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeHotel(index); }}
                                    className="p-2 text-red-400/50 hover:text-red-400 transition-colors"
                                    title="Remove Hotel"
                                >
                                    <TrashIcon />
                                </button>
                                <div className={`text-[var(--text-disabled)] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                    <ChevronDownIcon size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Collapsible Content */}
                        {isExpanded && (
                            <div className="mt-8 pt-8 border-t border-[var(--panel-border)] animate-fade-in">
                                <div className="form-grid">
                                    <div className="col-span-1 md:col-span-2">
                                        <FormInput label="Hotel Name" value={hotel.name} onChange={(e) => updateHotel(index, 'name', e.target.value)} />
                                    </div>
                                    <FormInput label="Website URL (Optional)" value={hotel.website || ''} onChange={(e) => updateHotel(index, 'website', e.target.value)} placeholder="https://..." />
                                    <div className="col-span-1 md:col-span-2">
                                        <FormInput label="Location / Address (Optional)" value={hotel.location || ''} onChange={(e) => updateHotel(index, 'location', e.target.value)} placeholder="e.g. King Fahd Rd, Riyadh" />
                                    </div>
                                    <FormSelect label="VAT Rule" options={[{ label: 'Domestic', value: 'domestic' }, { label: 'International', value: 'international' }]} value={hotel.vatRule} onChange={(e) => updateHotel(index, 'vatRule', e.target.value)} />
                                </div>

                                <div className="space-y-6 mt-8">
                                    {/* Sub-panel: Rooms */}
                                    <div className="p-5 rounded-2xl bg-[var(--panel-bg-2)] border border-[var(--panel-border)]">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-[11px] uppercase tracking-widest font-black text-ai-secondary/80 flex items-center gap-2">
                                                <BedIcon /> Room Configuration
                                            </h4>
                                            <Button variant="secondary" onClick={() => addRoomType(index)} className="h-7 text-[10px] px-3"><PlusIcon size={14} /> Add Room</Button>
                                        </div>
                                        <div className="space-y-3">
                                            {hotel.roomTypes.map((rt, rtIdx) => (
                                                <div key={rt.id} className="p-4 section-surface rounded-xl border border-white/[0.03]">
                                                    <div className="form-grid mb-4">
                                                        <div className="col-span-1 md:col-span-2">
                                                            <FormInput label="Room Name" value={rt.name} onChange={e => updateRoomType(index, rtIdx, 'name', e.target.value)} className="mb-0 text-sm" />
                                                        </div>
                                                        <div className="form-grid grid-cols-2 gap-3">
                                                            <FormInput label={`Net Price (${formData.pricing.currency})`} type="number" value={rt.netPrice} onChange={e => updateRoomType(index, rtIdx, 'netPrice', parseFloat(e.target.value))} className="mb-0 text-sm" />
                                                            <FormInput label="Qty" type="number" value={rt.quantity} onChange={e => updateRoomType(index, rtIdx, 'quantity', parseInt(e.target.value))} className="mb-0 text-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col md:flex-row gap-4 items-center pt-4 border-t border-[var(--panel-border)]">
                                                        <div className="flex-1 w-full">
                                                            <DateRangePicker label="Stay Dates" startDate={rt.checkIn} endDate={rt.checkOut} onChange={(s, e) => updateRoomTypeDates(index, rtIdx, s, e)} />
                                                        </div>
                                                        <div className="flex items-center gap-6 px-4">
                                                            <div className="text-center">
                                                                <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Nights</div>
                                                                <div className="text-sm font-black text-ai-secondary">{rt.numNights}</div>
                                                            </div>
                                                            <div className="pt-2"><FormCheckbox label="Sum" checked={rt.includeInSummary !== false} onChange={e => updateRoomType(index, rtIdx, 'includeInSummary', e.target.checked)} /></div>
                                                            <button onClick={() => removeRoomType(index, rtIdx)} className="p-2 hover:bg-red-500/10 text-[var(--text-disabled)] hover:text-red-400 transition-colors"><TrashIcon /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sub-panel: Meetings */}
                                    <div className="p-5 rounded-2xl bg-[var(--panel-bg-2)] border border-[var(--panel-border)]">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-[11px] uppercase tracking-widest font-black text-ai-secondary/80 flex items-center gap-2">
                                                <MeetingIcon /> Meeting Rooms
                                            </h4>
                                            <Button variant="secondary" onClick={() => addMeeting(index)} className="h-7 text-[10px] px-3"><PlusIcon size={14} /> Add Meeting</Button>
                                        </div>
                                        <div className="space-y-3">
                                            {hotel.meetingRooms.map((m, mIdx) => {
                                                const isStandard = MEETING_ROOM_OPTIONS.some(o => o.value === m.name && o.value !== 'Other');
                                                const dropdownValue = isStandard ? m.name : 'Other';
                                                return (
                                                    <div key={m.id} className="p-4 section-surface rounded-xl border border-white/[0.03]">
                                                        <div className="form-grid mb-4">
                                                            <FormSelect label="Room Name" options={MEETING_ROOM_OPTIONS} value={dropdownValue} onChange={e => updateMeeting(index, mIdx, 'name', e.target.value === 'Other' ? '' : e.target.value)} className="mb-0 text-sm" />
                                                            {dropdownValue === 'Other' && <FormInput label="Custom Name" value={m.name} onChange={e => updateMeeting(index, mIdx, 'name', e.target.value)} className="mb-0 text-sm" />}
                                                            <div className="form-grid grid-cols-2 gap-3">
                                                                <FormInput label="Unit Price" type="number" value={m.price} onChange={e => updateMeeting(index, mIdx, 'price', parseFloat(e.target.value))} className="mb-0 text-sm" />
                                                                <FormInput label="Guests" type="number" value={m.quantity} onChange={e => updateMeeting(index, mIdx, 'quantity', parseInt(e.target.value))} className="mb-0 text-sm" />
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col md:flex-row gap-4 items-center pt-4 border-t border-[var(--panel-border)]">
                                                            <div className="flex-1 w-full">
                                                                <DateRangePicker label="Event Dates" startDate={m.startDate || ''} endDate={m.endDate || ''} onChange={(s, e) => updateMeetingDates(index, mIdx, s, e)} />
                                                            </div>
                                                            <div className="flex items-center gap-6 px-4">
                                                                <div className="text-center">
                                                                    <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Days</div>
                                                                    <div className="text-sm font-black text-ai-secondary">{m.days}</div>
                                                                </div>
                                                                <div className="pt-2"><FormCheckbox label="Sum" checked={m.includeInSummary !== false} onChange={e => updateMeeting(index, mIdx, 'includeInSummary', e.target.checked)} /></div>
                                                                <button onClick={() => removeMeeting(index, mIdx)} className="p-2 hover:bg-red-500/10 text-[var(--text-disabled)] hover:text-red-400 transition-colors"><TrashIcon /></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Sub-panel: Dining */}
                                    <div className="p-5 rounded-2xl bg-[var(--panel-bg-2)] border border-[var(--panel-border)]">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-[11px] uppercase tracking-widest font-black text-ai-secondary/80 flex items-center gap-2">
                                                <UtensilsIcon /> Dining & Catering
                                            </h4>
                                            <Button variant="secondary" onClick={() => addDining(index)} className="h-7 text-[10px] px-3">+ Add Dining</Button>
                                        </div>
                                        <div className="space-y-3">
                                            {hotel.dining.map((d, dIdx) => (
                                                <div key={d.id} className="p-4 section-surface rounded-xl border border-white/[0.03]">
                                                    <div className="form-grid mb-4">
                                                        <FormInput label="Menu / Option Name" value={d.name} onChange={e => updateDining(index, dIdx, 'name', e.target.value)} placeholder="e.g. Set Lunch" className="mb-0 text-sm" />
                                                        <div className="form-grid grid-cols-2 gap-3">
                                                            <FormInput label="Price/Person" type="number" value={d.price} onChange={e => updateDining(index, dIdx, 'price', parseFloat(e.target.value))} className="mb-0 text-sm" />
                                                            <FormInput label="Guests" type="number" value={d.quantity} onChange={e => updateDining(index, dIdx, 'quantity', parseInt(e.target.value))} className="mb-0 text-sm" />
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col md:flex-row gap-4 items-center pt-4 border-t border-[var(--panel-border)]">
                                                        <div className="flex-1 w-full">
                                                            <DateRangePicker label="Dates" startDate={d.startDate || ''} endDate={d.endDate || ''} onChange={(s, e) => updateDiningDates(index, dIdx, s, e)} />
                                                        </div>
                                                        <div className="flex items-center gap-6 px-4">
                                                            <div className="text-center">
                                                                <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Days</div>
                                                                <div className="text-sm font-black text-ai-secondary">{d.days}</div>
                                                            </div>
                                                            <div className="pt-2"><FormCheckbox label="Sum" checked={d.includeInSummary !== false} onChange={e => updateDining(index, dIdx, 'includeInSummary', e.target.checked)} /></div>
                                                            <button onClick={() => removeDining(index, dIdx)} className="p-2 hover:bg-red-500/10 text-[var(--text-disabled)] hover:text-red-400 transition-colors"><TrashIcon /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sub-panel: Gallery */}
                                    <div className="p-5 rounded-2xl bg-[var(--panel-bg-2)] border border-[var(--panel-border)]">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-[11px] uppercase tracking-widest font-black text-[var(--text-muted)]">Hotel Photo Gallery (Max 3)</h4>
                                            {hotel.images.length > 1 && <span className="text-[10px] text-ai-accent font-bold uppercase animate-pulse">· Drag to reorder</span>}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="md:col-span-1">
                                                <MultiFileUploader label="Upload Hotel Photos" maxFiles={3} currentCount={hotel.images.length} onFilesSelect={(b64s) => addMultipleHotelImages(index, b64s)} />
                                            </div>
                                            <div className="md:col-span-3 flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                                                {hotel.images.map((img, ii) => (
                                                    <div
                                                        key={`${hotel.id}-img-${ii}`}
                                                        draggable
                                                        onDragStart={(e) => { e.dataTransfer.setData('sourceIdx', ii.toString()); (e.currentTarget as HTMLElement).style.opacity = '0.4'; }}
                                                        onDragEnd={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                                                        onDragOver={(e) => { e.preventDefault(); (e.currentTarget as HTMLElement).style.outline = '2px solid #0a62f0'; }}
                                                        onDragLeave={(e) => { (e.currentTarget as HTMLElement).style.outline = 'none'; }}
                                                        onDrop={(e) => { e.preventDefault(); (e.currentTarget as HTMLElement).style.outline = 'none'; const from = parseInt(e.dataTransfer.getData('sourceIdx')); reorderHotelImages(index, from, ii); }}
                                                        className="relative w-28 h-28 rounded-xl border border-[var(--panel-border)] overflow-hidden group cursor-move shadow-lg shrink-0 transition-premium"
                                                    >
                                                        <img src={img.url} className="w-full h-full object-cover" alt="Hotel" />
                                                        <div className="absolute top-1 left-1 bg-black/60 text-[8px] text-white/80 px-1.5 py-0.5 rounded font-bold">{ii + 1}</div>
                                                        <div className="absolute bottom-0 inset-x-0 bg-black/70 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <select className="w-full bg-transparent text-[8px] text-[var(--text-primary)] border-none p-0 outline-none" value={img.tag || 'none'} onChange={e => updateHotelImageTag(index, ii, e.target.value)}><option value="none">No Tag</option><option value="exterior">Exterior</option><option value="rooms">Rooms</option><option value="interior">Interior</option></select>
                                                        </div>
                                                        <button onClick={() => removeHotelImage(index, ii)} className="absolute top-1 right-1 bg-red-600/60 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white"><TrashIcon className="w-3 h-3" /></button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

    const addFlight = () => { setFormData({ ...formData, flightOptions: [...formData.flightOptions, { ...initialFlight, id: Date.now().toString() }] }); };
    const removeFlight = (index: number) => { const f = [...formData.flightOptions]; f.splice(index, 1); setFormData({ ...formData, flightOptions: f }); };
    const updateFlight = (index: number, field: keyof FlightDetails, value: any) => { const f = [...formData.flightOptions]; f[index] = { ...f[index], [field]: value }; setFormData({ ...formData, flightOptions: f }); };
    const addFlightLeg = (flightIndex: number, legType: 'outbound' | 'return') => { const f = [...formData.flightOptions]; f[flightIndex][legType].push({ ...initialFlightLeg }); setFormData({ ...formData, flightOptions: f }); };
    const removeFlightLeg = (flightIndex: number, legType: 'outbound' | 'return', legIdx: number) => { const f = [...formData.flightOptions]; if (f[flightIndex][legType].length > 1) { f[flightIndex][legType].splice(legIdx, 1); setFormData({ ...formData, flightOptions: f }); } };
    const updateFlightLeg = (flightIndex: number, legType: 'outbound' | 'return', legIdx: number, field: keyof FlightLeg, value: any) => { const f = [...formData.flightOptions]; f[flightIndex][legType][legIdx] = { ...f[flightIndex][legType][legIdx], [field]: value }; setFormData({ ...formData, flightOptions: f }); };
    const addFlightQuote = (index: number) => { const f = [...formData.flightOptions]; f[index].quotes.push({ class: 'Economy', price: 0, quantity: 1 }); setFormData({ ...formData, flightOptions: f }); };
    const updateFlightQuote = (fIndex: number, qIndex: number, field: keyof FlightQuote, value: any) => { const f = [...formData.flightOptions]; f[fIndex].quotes[qIndex] = { ...f[fIndex].quotes[qIndex], [field]: value }; setFormData({ ...formData, flightOptions: f }); };
    const removeFlightQuote = (fIndex: number, qIndex: number) => { const f = [...formData.flightOptions]; f[fIndex].quotes.splice(qIndex, 1); setFormData({ ...formData, flightOptions: f }); };

    // Helper to add item with default includeInSummary: true
    const addItem = <T,>(listKey: 'transportation' | 'customItems' | 'activities', item: T) => { setFormData({ ...formData, [listKey]: [...formData[listKey], { ...item, includeInSummary: true }] }); };

    const updateItemDates = (listKey: 'transportation' | 'customItems' | 'activities', index: number, startDate: string, endDate: string) => {
        const list = [...formData[listKey]] as any[];
        const updatedItem = { ...list[index], startDate, endDate };
        if (startDate && endDate) {
            const diff = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1; // Inclusive
            updatedItem.days = diff > 0 ? diff : 1;
        } else {
            updatedItem.days = 1; // Default
        }
        list[index] = updatedItem;
        setFormData({ ...formData, [listKey]: list });
    };

    const updateItem = <T,>(listKey: 'transportation' | 'customItems' | 'activities', index: number, field: keyof T, value: any) => { const list = [...formData[listKey]] as any[]; const updatedItem = { ...list[index], [field]: value }; list[index] = updatedItem; setFormData({ ...formData, [listKey]: list }); };
    const removeItem = (listKey: 'transportation' | 'customItems' | 'activities', index: number) => { const list = [...formData[listKey]]; list.splice(index, 1); setFormData({ ...formData, [listKey]: list }); };

    const renderFlightStep = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <SectionHeader title="Flight Options" icon={<PlaneIcon />} />
                <div className="flex items-center gap-4">
                    <FormCheckbox
                        label="Skip Flights"
                        checked={!formData.inclusions.flights}
                        onChange={e => setFormData({ ...formData, inclusions: { ...formData.inclusions, flights: !e.target.checked } })}
                    />
                    {formData.inclusions.flights && (
                        <Button variant="secondary" onClick={addFlight} className="h-9 text-xs"><PlusIcon size={14} /> Add Flight Option</Button>
                    )}
                </div>
            </div>

            {formData.inclusions.flights && formData.flightOptions.map((flight, index) => {
                const isExpanded = expandedFlights[flight.id] !== false;
                const toggleExpanded = () => setExpandedFlights({ ...expandedFlights, [flight.id]: !isExpanded });

                return (
                    <div key={flight.id} className="form-panel relative overflow-hidden transition-all duration-300">
                        {/* Header / Accordion Trigger */}
                        <div className="flex items-center justify-between cursor-pointer" onClick={toggleExpanded}>
                            <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${isExpanded ? 'bg-ai-accent text-white' : 'bg-white/5 text-[var(--text-muted)]'}`}>
                                    {index + 1}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] capitalize">{flight.routeDescription || `Flight Option ${index + 1}`}</h3>
                                    {!isExpanded && <p className="text-xs text-[var(--text-muted)]">{flight.quotes.length} Price Quotes • {flight.outbound.length} Outbound / {flight.return.length} Return</p>}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="pt-2 scale-75 h-8 flex items-center">
                                    <FormCheckbox label="Sum" checked={flight.includeInSummary !== false} onChange={e => updateFlight(index, 'includeInSummary', e.target.checked)} />
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeFlight(index); }}
                                    className="p-2 text-red-400/50 hover:text-red-400 transition-colors"
                                    title="Remove Flight"
                                >
                                    <TrashIcon />
                                </button>
                                <div className={`text-[var(--text-disabled)] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                    <ChevronDownIcon size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Collapsible Content */}
                        {isExpanded && (
                            <div className="mt-8 pt-8 border-t border-[var(--panel-border)] animate-fade-in">
                                <div className="mb-6">
                                    <FormInput
                                        label="Route Description"
                                        value={flight.routeDescription}
                                        onChange={e => updateFlight(index, 'routeDescription', e.target.value)}
                                        placeholder="e.g. Riyadh to London"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    {/* Outbound Sub-panel */}
                                    <div className="p-5 rounded-2xl bg-[var(--panel-bg-2)] border border-[var(--panel-border)]">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-[11px] uppercase tracking-widest font-black text-ai-secondary/80 flex items-center gap-2">
                                                <PlaneIcon /> Outbound Journey
                                            </h4>
                                            <Button variant="secondary" onClick={() => addFlightLeg(index, 'outbound')} className="h-7 text-[10px] px-3">+ Add Connection</Button>
                                        </div>
                                        <div className="space-y-4">
                                            {flight.outbound.map((leg, i) => (
                                                <div key={i} className="p-4 section-surface rounded-xl border border-[var(--divider)] relative group">
                                                    {flight.outbound.length > 1 && (
                                                        <button
                                                            onClick={() => removeFlightLeg(index, 'outbound', i)}
                                                            className="absolute right-2 top-2 p-1 text-white/10 hover:text-red-400/70 transition-colors"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                                        <FormInput label="From" value={leg.from} onChange={e => updateFlightLeg(index, 'outbound', i, 'from', e.target.value)} className="mb-0 text-sm" />
                                                        <FormInput label="To" value={leg.to} onChange={e => updateFlightLeg(index, 'outbound', i, 'to', e.target.value)} className="mb-0 text-sm" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                                        <FormInput label="Airline" value={leg.airline} onChange={e => updateFlightLeg(index, 'outbound', i, 'airline', e.target.value)} className="mb-0 text-sm" />
                                                        <FormInput label="Flight #" value={leg.flightNumber} onChange={e => updateFlightLeg(index, 'outbound', i, 'flightNumber', e.target.value)} className="mb-0 text-sm" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                                        <FormInput label="Dept Date" type="date" value={leg.departureDate} onChange={e => updateFlightLeg(index, 'outbound', i, 'departureDate', e.target.value)} className="mb-0 text-xs" />
                                                        <FormInput label="Dept Time" type="time" value={leg.departureTime} onChange={e => updateFlightLeg(index, 'outbound', i, 'departureTime', e.target.value)} className="mb-0 text-xs" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                                        <FormInput label="Arr Date" type="date" value={leg.arrivalDate} onChange={e => updateFlightLeg(index, 'outbound', i, 'arrivalDate', e.target.value)} className="mb-0 text-xs" />
                                                        <FormInput label="Arr Time" type="time" value={leg.arrivalTime} onChange={e => updateFlightLeg(index, 'outbound', i, 'arrivalTime', e.target.value)} className="mb-0 text-xs" />
                                                    </div>
                                                    <FormInput label="Duration" value={leg.duration} onChange={e => updateFlightLeg(index, 'outbound', i, 'duration', e.target.value)} placeholder="e.g. 6h 30m" className="mb-0 text-xs" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Return Sub-panel */}
                                    <div className="p-5 rounded-2xl bg-[var(--panel-bg-2)] border border-[var(--panel-border)]">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="text-[11px] uppercase tracking-widest font-black text-ai-secondary/80 flex items-center gap-2">
                                                <PlaneIcon /> Return Journey
                                            </h4>
                                            <Button variant="secondary" onClick={() => addFlightLeg(index, 'return')} className="h-7 text-[10px] px-3">+ Add Connection</Button>
                                        </div>
                                        <div className="space-y-4">
                                            {flight.return.map((leg, i) => (
                                                <div key={i} className="p-4 section-surface rounded-xl border border-[var(--divider)] relative group">
                                                    {flight.return.length > 1 && (
                                                        <button
                                                            onClick={() => removeFlightLeg(index, 'return', i)}
                                                            className="absolute right-2 top-2 p-1 text-white/10 hover:text-red-400/70 transition-colors"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                                        <FormInput label="From" value={leg.from} onChange={e => updateFlightLeg(index, 'return', i, 'from', e.target.value)} className="mb-0 text-sm" />
                                                        <FormInput label="To" value={leg.to} onChange={e => updateFlightLeg(index, 'return', i, 'to', e.target.value)} className="mb-0 text-sm" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                                        <FormInput label="Airline" value={leg.airline} onChange={e => updateFlightLeg(index, 'return', i, 'airline', e.target.value)} className="mb-0 text-sm" />
                                                        <FormInput label="Flight #" value={leg.flightNumber} onChange={e => updateFlightLeg(index, 'return', i, 'flightNumber', e.target.value)} className="mb-0 text-sm" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                                        <FormInput label="Dept Date" type="date" value={leg.departureDate} onChange={e => updateFlightLeg(index, 'return', i, 'departureDate', e.target.value)} className="mb-0 text-xs" />
                                                        <FormInput label="Dept Time" type="time" value={leg.departureTime} onChange={e => updateFlightLeg(index, 'return', i, 'departureTime', e.target.value)} className="mb-0 text-xs" />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                                        <FormInput label="Arr Date" type="date" value={leg.arrivalDate} onChange={e => updateFlightLeg(index, 'return', i, 'arrivalDate', e.target.value)} className="mb-0 text-xs" />
                                                        <FormInput label="Arr Time" type="time" value={leg.arrivalTime} onChange={e => updateFlightLeg(index, 'return', i, 'arrivalTime', e.target.value)} className="mb-0 text-xs" />
                                                    </div>
                                                    <FormInput label="Duration" value={leg.duration} onChange={e => updateFlightLeg(index, 'return', i, 'duration', e.target.value)} placeholder="e.g. 6h 30m" className="mb-0 text-xs" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Quotes Sub-panel */}
                                <div className="p-5 rounded-2xl bg-[var(--panel-bg-2)] border border-[var(--panel-border)] mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-[11px] uppercase tracking-widest font-black text-[var(--text-muted)]">Price Quotes</h4>
                                        <Button variant="secondary" onClick={() => addFlightQuote(index)} className="h-7 text-[10px] px-3">+ Add Quote</Button>
                                    </div>
                                    <div className="space-y-3">
                                        {flight.quotes.map((q, qIdx) => (
                                            <div key={qIdx} className="form-grid items-center p-3 section-surface rounded-xl border border-[var(--divider)]">
                                                <FormInput label="Class / Type" value={q.class} onChange={e => updateFlightQuote(index, qIdx, 'class', e.target.value)} className="mb-0 text-sm" />
                                                <div className="form-grid grid-cols-12 gap-3 items-end">
                                                    <div className="col-span-4">
                                                        <FormInput label="Qty" type="number" value={q.quantity} onChange={e => updateFlightQuote(index, qIdx, 'quantity', parseInt(e.target.value))} className="mb-0 text-sm" />
                                                    </div>
                                                    <div className="col-span-6">
                                                        <FormInput label={`Net Price (${formData.pricing.currency})`} type="number" value={q.price} onChange={e => updateFlightQuote(index, qIdx, 'price', parseFloat(e.target.value))} className="mb-0 text-sm" />
                                                    </div>
                                                    <div className="col-span-2 flex justify-end">
                                                        <button onClick={() => removeFlightQuote(index, qIdx)} className="p-2.5 hover:bg-red-500/10 text-[var(--text-disabled)] hover:text-red-400 transition-colors"><TrashIcon /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-[var(--panel-border)]">
                                    <FormSelect
                                        label="VAT Rule"
                                        options={[{ label: 'Domestic', value: 'domestic' }, { label: 'International', value: 'international' }]}
                                        value={flight.vatRule}
                                        onChange={e => updateFlight(index, 'vatRule', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );

    const renderTransportationStep = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <SectionHeader title="Transportation" icon={<BusIcon />} />
                <div className="flex items-center gap-4">
                    <FormCheckbox
                        label="Skip Transportation"
                        checked={!formData.inclusions.transportation}
                        onChange={(e) => setFormData({ ...formData, inclusions: { ...formData.inclusions, transportation: !e.target.checked } })}
                    />
                    {formData.inclusions.transportation && (
                        <Button variant="secondary" onClick={() => addItem<TransportationDetails>('transportation', { id: Date.now().toString(), type: VehicleType.Sedan, model: '', description: '', startDate: '', endDate: '', days: 1, netPricePerDay: 0, quantity: 1, vatRule: 'domestic' })} className="h-9 text-xs"><PlusIcon size={14} /> Add Vehicle</Button>
                    )}
                </div>
            </div>

            {formData.inclusions.transportation && formData.transportation.map((item, idx) => (
                <div key={idx} className="form-panel group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-ai-secondary/10 flex items-center justify-center text-[10px] font-black text-ai-secondary border border-ai-secondary/20">
                                {idx + 1}
                            </div>
                            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">{item.type} Service</h3>
                        </div>
                        <button onClick={() => removeItem('transportation', idx)} className="p-2 text-red-400/50 hover:text-red-400 transition-colors">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="form-grid">
                        <div className="col-span-1 md:col-span-2 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormSelect label="Vehicle Category" options={Object.values(VehicleType).map(v => ({ label: v, value: v }))} value={item.type} onChange={(e) => updateItem('transportation', idx, 'type', e.target.value)} />
                                <FormInput label="Vehicle Model / Year" value={item.model} onChange={(e) => updateItem('transportation', idx, 'model', e.target.value)} placeholder="e.g. Mercedes V-Class 2024" />
                            </div>
                            <FormInput label="Route or Service Description" value={item.description} onChange={(e) => updateItem('transportation', idx, 'description', e.target.value)} placeholder="e.g. Airport Transfers & Local Disposal" />
                            <FormSelect label="VAT Rule" options={[{ label: 'Domestic', value: 'domestic' }, { label: 'International', value: 'international' }]} value={item.vatRule} onChange={(e) => updateItem('transportation', idx, 'vatRule', e.target.value)} />
                        </div>
                        <div className="col-span-1 md:col-span-1 border border-[var(--panel-border)] bg-[var(--panel-bg-2)] rounded-xl p-4">
                            <FileUploader label="Vehicle Image" currentImage={item.image} onFileSelect={(b64) => updateItem('transportation', idx, 'image', b64)} />
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-[var(--panel-border)] grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div className="form-grid grid-cols-12 gap-3 items-center">
                            <div className="col-span-9">
                                <DateRangePicker label="Service Dates" startDate={item.startDate} endDate={item.endDate} onChange={(s, e) => updateItemDates('transportation', idx, s, e)} />
                            </div>
                            <div className="col-span-3 text-center">
                                <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Days</div>
                                <div className="text-sm font-black text-ai-secondary">{item.days}</div>
                            </div>
                        </div>
                        <div className="form-grid grid-cols-12 gap-3 items-end">
                            <div className="col-span-5">
                                <FormInput label="Net Price/Day" type="number" value={item.netPricePerDay} onChange={(e) => updateItem('transportation', idx, 'netPricePerDay', parseFloat(e.target.value))} className="mb-0 text-sm" />
                            </div>
                            <div className="col-span-3">
                                <FormInput label="Qty" type="number" value={item.quantity} onChange={(e) => updateItem('transportation', idx, 'quantity', parseInt(e.target.value))} className="mb-0 text-sm" />
                            </div>
                            <div className="col-span-4 flex items-center justify-end h-[42px] px-2">
                                <FormCheckbox label="Sum" checked={item.includeInSummary !== false} onChange={(e) => updateItem('transportation', idx, 'includeInSummary', e.target.checked)} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderCustomStep = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <SectionHeader title="Other Custom Items" icon={<CustomIcon />} />
                <div className="flex items-center gap-4">
                    <FormCheckbox
                        label="Skip Custom Items"
                        checked={!formData.inclusions.customItems}
                        onChange={(e) => setFormData({ ...formData, inclusions: { ...formData.inclusions, customItems: !e.target.checked } })}
                    />
                    {formData.inclusions.customItems && (
                        <Button variant="secondary" onClick={() => addItem<CustomItem>('customItems', { id: Date.now().toString(), description: '', unitPrice: 0, quantity: 1, vatRule: 'domestic', days: 1 })} className="h-9 text-xs"><PlusIcon size={14} /> Add Item</Button>
                    )}
                </div>
            </div>

            {formData.inclusions.customItems && formData.customItems.map((item, idx) => (
                <div key={idx} className="form-panel group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black text-[var(--text-muted)] border border-white/10">
                                {idx + 1}
                            </div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{item.description || 'Custom Item'}</h3>
                        </div>
                        <button onClick={() => removeItem('customItems', idx)} className="p-2 text-red-400/50 hover:text-red-400 transition-colors">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="form-grid">
                        <div className="col-span-1 md:col-span-2">
                            <FormInput label="Detailed Description" value={item.description} onChange={(e) => updateItem('customItems', idx, 'description', e.target.value)} />
                        </div>
                        <FormSelect label="VAT Rule" options={[{ label: 'Domestic', value: 'domestic' }, { label: 'International', value: 'international' }]} value={item.vatRule} onChange={(e) => updateItem('customItems', idx, 'vatRule', e.target.value)} />
                    </div>

                    <div className="mt-6 pt-6 border-t border-[var(--panel-border)] grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div className="form-grid grid-cols-12 gap-3 items-center">
                            <div className="col-span-9">
                                <DateRangePicker label="Service Dates" startDate={item.startDate || ''} endDate={item.endDate || ''} onChange={(s, e) => updateItemDates('customItems', idx, s, e)} />
                            </div>
                            <div className="col-span-3 text-center">
                                <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Days</div>
                                <div className="text-sm font-black text-ai-secondary">{item.days}</div>
                            </div>
                        </div>
                        <div className="form-grid grid-cols-12 gap-3 items-end">
                            <div className="col-span-5">
                                <FormInput label="Net Unit Price" type="number" value={item.unitPrice} onChange={(e) => updateItem('customItems', idx, 'unitPrice', parseFloat(e.target.value))} className="mb-0 text-sm" />
                            </div>
                            <div className="col-span-3">
                                <FormInput label="Quantity" type="number" value={item.quantity} onChange={(e) => updateItem('customItems', idx, 'quantity', parseInt(e.target.value))} className="mb-0 text-sm" />
                            </div>
                            <div className="col-span-4 flex items-center justify-end h-[42px] px-2">
                                <FormCheckbox label="Sum" checked={item.includeInSummary !== false} onChange={(e) => updateItem('customItems', idx, 'includeInSummary', e.target.checked)} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderActivitiesStep = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <SectionHeader title="Activities" icon={<ActivityIcon />} />
                <div className="flex items-center gap-4">
                    <FormCheckbox
                        label="Skip Activities"
                        checked={!formData.inclusions.activities}
                        onChange={(e) => setFormData({ ...formData, inclusions: { ...formData.inclusions, activities: !e.target.checked } })}
                    />
                    {formData.inclusions.activities && (
                        <Button variant="secondary" onClick={() => addItem<ActivityDetails>('activities', { id: Date.now().toString(), name: '', pricePerPerson: 0, guests: 1, vatRule: 'domestic', days: 1 })} className="h-9 text-xs"><PlusIcon size={14} /> Add Activity</Button>
                    )}
                </div>
            </div>

            {formData.inclusions.activities && formData.activities.map((item, idx) => (
                <div key={idx} className="form-panel group">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-ai-accent/10 flex items-center justify-center text-[10px] font-black text-ai-accent border border-ai-accent/20">
                                {idx + 1}
                            </div>
                            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">{item.name || 'New Activity'}</h3>
                        </div>
                        <button onClick={() => removeItem('activities', idx)} className="p-2 text-red-400/50 hover:text-red-400 transition-colors">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="form-grid">
                        <div className="col-span-1 md:col-span-2 space-y-4">
                            <FormInput label="Activity Name" value={item.name} onChange={(e) => updateItem('activities', idx, 'name', e.target.value)} />
                            <FormSelect label="VAT Rule" options={[{ label: 'Domestic', value: 'domestic' }, { label: 'International', value: 'international' }]} value={item.vatRule} onChange={(e) => updateItem('activities', idx, 'vatRule', e.target.value)} />
                        </div>
                        <div className="col-span-1 md:col-span-1 border border-[var(--panel-border)] bg-[var(--panel-bg-2)] rounded-xl p-4">
                            <FileUploader label="Activity Image" currentImage={item.image} onFileSelect={(b64) => updateItem('activities', idx, 'image', b64)} />
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-[var(--panel-border)] grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <div className="form-grid grid-cols-12 gap-3 items-center">
                            <div className="col-span-9">
                                <DateRangePicker label="Activity Dates" startDate={item.startDate || ''} endDate={item.endDate || ''} onChange={(s, e) => updateItemDates('activities', idx, s, e)} />
                            </div>
                            <div className="col-span-3 text-center">
                                <div className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Days</div>
                                <div className="text-sm font-black text-ai-secondary">{item.days}</div>
                            </div>
                        </div>
                        <div className="form-grid grid-cols-12 gap-3 items-end">
                            <div className="col-span-5">
                                <FormInput label="Price/Person" type="number" value={item.pricePerPerson} onChange={(e) => updateItem('activities', idx, 'pricePerPerson', parseFloat(e.target.value))} className="mb-0 text-sm" />
                            </div>
                            <div className="col-span-3">
                                <FormInput label="Guests" type="number" value={item.guests} onChange={(e) => updateItem('activities', idx, 'guests', parseInt(e.target.value))} className="mb-0 text-sm" />
                            </div>
                            <div className="col-span-4 flex items-center justify-end h-[42px] px-2">
                                <FormCheckbox label="Sum" checked={item.includeInSummary !== false} onChange={(e) => updateItem('activities', idx, 'includeInSummary', e.target.checked)} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderInclusionsStep = () => (
        <div className="form-panel">
            <SectionHeader title="Inclusions Check" icon={<PalmLogo className="w-6 h-6" />} />
            <p className="text-xs text-[var(--text-muted)] mb-8 mt-2">Manage which sections and costings should be visible in the final generated proposal document.</p>

            <div className="form-grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(formData.inclusions).map((key) => {
                    // Logic to hide inclusions for disabled sections (Requirement 13.x)
                    const inclusionMap: Record<string, keyof ProposalSectionsConfig | null> = {
                        hotels: 'accommodation',
                        flights: 'flights',
                        transportation: 'transportation',
                        customItems: 'customServices',
                        activities: 'activities'
                    };

                    const configKey = inclusionMap[key];
                    if (configKey && !sectionsConfig[configKey]) return null;

                    const isChecked = formData.inclusions[key as keyof Inclusions];
                    return (
                        <label
                            key={key}
                            className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 cursor-pointer group ${isChecked ? 'bg-ai-accent/5 border-ai-accent/20' : 'bg-white/[0.01] border-[var(--panel-border)] hover:border-[var(--panel-border)]'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full transition-all ${isChecked ? 'bg-ai-accent shadow-[0_0_8px_rgba(10,98,240,0.6)]' : 'bg-[var(--divider)]'}`}></div>
                                <span className={`text-sm font-semibold transition-colors ${isChecked ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'}`}>
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                            </div>
                            <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => setFormData({ ...formData, inclusions: { ...formData.inclusions, [key]: e.target.checked } })}
                                className="w-5 h-5 text-ai-accent rounded bg-[var(--input-bg)] border-[var(--input-border)] focus:ring-0 focus:ring-offset-0 transition-all cursor-pointer"
                            />
                        </label>
                    );
                })}
            </div>

            <div className="mt-10 p-5 rounded-2xl bg-ai-accent/5 border border-ai-accent/10 flex items-start gap-4">
                <div className="p-2 bg-ai-accent/10 rounded-lg text-ai-accent">
                    <SaveIcon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">Final Review Ready</h4>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-lg">Your proposal structure is now defined. You can generate the PDF preview to see how your selections translate to the final export layout.</p>
                </div>
            </div>
        </div>
    );

    // Dynamic Step Generation (Requirement 13.x)
    const userCompany = companies.find(c => c.id === user?.companyId);
    const sectionsConfig = resolveProposalSections(userCompany);

    const allSteps = [
        { id: 'details', label: 'Proposal Details', icon: <UserIcon size={18} />, component: renderBrandingStep() },
        { id: 'pricing', label: 'Pricing & Markup', icon: <WalletIcon size={18} />, component: renderPricingConfigStep(), toggle: sectionsConfig.pricingMarkup },
        { id: 'accommodation', label: 'Accommodation', icon: <BuildingIcon size={18} />, component: renderHotelStep(), toggle: sectionsConfig.accommodation },
        { id: 'flights', label: 'Flights', icon: <PlaneIcon size={18} />, component: renderFlightStep(), toggle: sectionsConfig.flights },
        { id: 'transportation', label: 'Transportation', icon: <BusIcon size={18} />, component: renderTransportationStep(), toggle: sectionsConfig.transportation },
        { id: 'custom', label: 'Custom Services', icon: <CustomIcon size={18} />, component: renderCustomStep(), toggle: sectionsConfig.customServices },
        { id: 'activities', label: 'Activities', icon: <ActivityIcon size={18} />, component: renderActivitiesStep(), toggle: sectionsConfig.activities },
        { id: 'inclusions', label: 'Inclusions Check', icon: <ShieldCheckIcon size={18} />, component: renderInclusionsStep() }
    ];

    const enabledSteps = allSteps.filter(s => s.toggle !== false);
    const Steps = enabledSteps.map(s => s.component);
    const StepsNames = enabledSteps.map(s => ({ label: s.label, icon: s.icon }));

    const renderStepNav = () => (
        <div className="wizard-left">
            <div className="glass p-5 rounded-2xl">
                <div className="flex items-center gap-3 mb-6 px-1">
                    <div className="p-2 bg-ai-accent/10 rounded-lg text-ai-secondary"><SaveIcon /></div>
                    <div>
                        <h4 className="text-sm font-bold text-[var(--text-primary)] leading-none mb-1">Creation Progress</h4>
                        <div className="h-1.5 w-32 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                            <div className="h-full gradient-accent transition-all duration-500" style={{ width: `${((step + 1) / StepsNames.length) * 100}%` }}></div>
                        </div>
                    </div>
                </div>
                <div className="step-nav-list">
                    {StepsNames.map((s, idx) => (
                        <button
                            key={idx}
                            onClick={() => setStep(idx)}
                            className={`step-nav-item ${step === idx ? 'active' : ''}`}
                        >
                            <div className="step-nav-icon">{idx < step ? <CheckIcon size={16} strokeWidth={3} /> : s.icon}</div>
                            <span className="step-nav-label">{s.label}</span>
                        </button>
                    ))}
                </div>
                <div className="mt-8 pt-6 border-t border-[var(--panel-border)]">
                    <Button variant="secondary" onClick={() => handleSaveProposal(true)} disabled={isGenerating} className="w-full gap-2">
                        <SaveIcon /> Save Draft
                    </Button>
                </div>
                <div className="mt-4">
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="w-full flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--row-hover)] transition-all group shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-[var(--input-bg)] text-ai-secondary group-hover:text-ai-accent transition-all duration-300">
                                {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                            </div>
                            <span className="text-xs font-bold text-[var(--text-primary)]">Theme Mode</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-black text-ai-accent">{theme}</span>
                    </button>
                </div>
            </div>
        </div>
    );

    const renderQuickSummary = () => (
        <div className="wizard-right">
            <div className="summary-card space-y-6 sticky top-6">
                <SectionHeader title="Draft Summary" />

                <div className="space-y-4">
                    <div className="p-4 bg-[var(--panel-bg-2)] rounded-2xl border border-[var(--divider)]">
                        <div className="text-[10px] uppercase text-[var(--text-muted)] mb-1 font-bold tracking-widest">Proposal Name</div>
                        <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{formData.proposalName || 'Untitled Proposal'}</div>
                    </div>

                    <div className="p-4 bg-[var(--panel-bg-2)] rounded-2xl border border-[var(--divider)]">
                        <div className="text-[10px] uppercase text-[var(--text-muted)] mb-1 font-bold tracking-widest">Client / Customer</div>
                        <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{formData.customerName || 'No Client Set'}</div>
                    </div>
                </div>

                <div className="pt-2 space-y-3">
                    <div className="flex justify-between items-center px-1">
                        <span className="text-xs text-[var(--text-muted)]">Total Hotels</span>
                        <span className="text-xs font-black text-[var(--text-primary)]">{formData.hotelOptions.length}</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                        <span className="text-xs text-[var(--text-muted)]">Total Flights</span>
                        <span className="text-xs font-black text-[var(--text-primary)]">{formData.flightOptions.length}</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                        <span className="text-xs text-[var(--text-muted)]">Vehicles</span>
                        <span className="text-xs font-black text-[var(--text-primary)]">{formData.transportation.length}</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                        <span className="text-xs text-[var(--text-muted)]">Activities</span>
                        <span className="text-xs font-black text-[var(--text-primary)]">{formData.activities.length}</span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                        <span className="text-xs text-[var(--text-muted)]">Custom Items</span>
                        <span className="text-xs font-black text-[var(--text-primary)]">{formData.customItems.length}</span>
                    </div>
                </div>

                <div className="pt-6 border-t border-[var(--panel-border)]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="text-[10px] text-ai-secondary/80 font-black uppercase tracking-widest">Currency</div>
                        <div className="text-sm font-black text-ai-secondary">{formData.pricing.currency}</div>
                    </div>

                    <div className="p-4 bg-ai-accent/5 rounded-2xl border border-ai-accent/10">
                        <p className="text-[10px] text-ai-secondary/80 text-center uppercase font-black leading-relaxed">
                            Auto-update active. Saving your drafts securely to the cloud.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );


    if (!user) {
        return <AuthScreen onLogin={(u) => {
            setUser(u);
            setSubMode('my_proposals');
        }} />;
    }

    const isSuper = user.role === 'super_admin';
    const isAdmin = user.role === 'admin';

    // Header Logic (15.1, 15.2)
    const companyLogo = !isSuper && user.companyId
        ? companies.find(c => c.id === user.companyId)?.logo
        : null;

    const renderDashboard = () => {
        let displayedProposals: ProposalData[] = [];
        const activeProposals = savedProposals.filter(p => !p.isDeleted);

        if (subMode === 'my_proposals') {
            displayedProposals = activeProposals.filter(p => p.createdBy === user.email || p.sharedWith.includes(user.email));
        } else if (subMode === 'all_proposals') {
            if (isSuper) {
                displayedProposals = activeProposals;
            } else if (isAdmin) {
                displayedProposals = activeProposals.filter(p => p.companyId === user.companyId);
            }
        }

        return (
            <div className="w-full max-w-7xl mx-auto p-6 md:p-8">
                {renderEditUserModal()}
                {/* Premium Navbar */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 pb-6 border-b border-[var(--panel-border)]">
                    {/* Header Branding */}
                    {isSuper ? (
                        <div className="flex items-center gap-4">
                            <img src="/sitc_logo_final.png" className="h-[72px] object-contain opacity-90" alt="SITC" />
                            <div className="h-6 w-px bg-white/10"></div>
                            <h1 className="text-xl font-display font-semibold text-[var(--text-primary)]">Travel Proposal Portal</h1>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            {companyLogo ? (
                                <img src={companyLogo} className="h-12 w-auto object-contain bg-white/[0.06] rounded-xl p-1.5 backdrop-blur-sm border border-[var(--panel-border)]" alt="Company Logo" />
                            ) : (
                                <SITCLogo className="w-20 h-auto opacity-40" />
                            )}
                            <div className="h-6 w-px bg-white/10"></div>
                            <h1 className="text-xl font-display font-semibold text-white">Portal</h1>
                        </div>
                    )}

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-[var(--text-primary)]">{user.firstName} {user.lastName}</span>
                            <span className="text-xs text-[var(--text-muted)]">{user.email}</span>
                            <button onClick={handleLogout} className="text-xs text-red-400/70 hover:text-red-300 mt-1 transition-colors flex items-center gap-1.5 group">
                                <LogOutIcon size={12} className="group-hover:translate-x-0.5 transition-transform" /> Log Out
                            </button>
                        </div>
                        <IconButton
                            icon={theme === 'dark' ? SunIcon : MoonIcon}
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            title="Toggle Theme"
                        />
                        <div className="h-10 w-10 bg-ai-accent/10 rounded-xl flex items-center justify-center text-ai-accent border border-ai-accent/20 shadow-sm">
                            <UserIcon size={20} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-1 mb-8 overflow-x-auto bg-[var(--bg-secondary)] p-1.5 rounded-xl border border-[var(--divider)] shadow-sm">
                    <button onClick={() => setSubMode('my_proposals')} className={`pb-2 pt-2 px-5 font-semibold whitespace-nowrap rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${subMode === 'my_proposals' ? 'gradient-accent text-white shadow-lg shadow-ai-accent/15' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--row-hover)]'}`}>
                        <ProposalIcon size={16} /> My Proposals
                    </button>

                    {(isSuper || isAdmin) && (
                        <button onClick={() => setSubMode('all_proposals')} className={`pb-2 pt-2 px-5 font-semibold whitespace-nowrap rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${subMode === 'all_proposals' ? 'gradient-accent text-white shadow-lg shadow-ai-accent/15' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--row-hover)]'}`}>
                            <ProposalIcon size={16} /> {isSuper ? 'All Proposals' : 'Company Proposals'}
                        </button>
                    )}

                    {isSuper && (
                        <button onClick={() => setSubMode('companies')} className={`pb-2 pt-2 px-5 font-semibold whitespace-nowrap rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${subMode === 'companies' ? 'gradient-accent text-white shadow-lg shadow-ai-accent/15' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--row-hover)]'}`}>
                            <BuildingIcon size={16} /> Companies
                        </button>
                    )}

                    {(isSuper || isAdmin) && (
                        <button onClick={() => setSubMode('company_users')} className={`pb-2 pt-2 px-5 font-semibold whitespace-nowrap rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${subMode === 'company_users' ? 'gradient-accent text-white shadow-lg shadow-ai-accent/15' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--row-hover)]'}`}>
                            <UsersIcon size={16} /> Users
                        </button>
                    )}

                    <button onClick={() => setSubMode('account_settings')} className={`pb-2 pt-2 px-5 font-semibold whitespace-nowrap rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${subMode === 'account_settings' ? 'gradient-accent text-white shadow-lg shadow-ai-accent/15' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--row-hover)]'}`}>
                        <SettingsIcon size={16} /> Settings
                    </button>
                </div>

                {
                    (subMode === 'my_proposals' || subMode === 'all_proposals') && (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                                    {subMode === 'my_proposals' ? 'My Proposals' : (isSuper ? 'All System Proposals' : 'Team Proposals')}
                                </h2>
                                <Button onClick={handleCreateNew} className="gap-2">
                                    <PlusIcon size={18} /> Create Proposal
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
                                {displayedProposals.length === 0 && <div className="col-span-3 text-center py-20 empty-state flex items-center justify-center">No proposals found. Create your first proposal to get started.</div>}
                                {displayedProposals.map((p) => (
                                    <div key={p.id} className="glass p-6 rounded-2xl hover:border-ai-accent/30 transition-all duration-300 flex flex-col relative group card-hover">
                                        {sharingId === p.id && (
                                            <div className="absolute inset-0 bg-ai-bg/95 z-10 flex flex-col items-center justify-center p-4 rounded-2xl animate-fade-up backdrop-blur-md">
                                                <h4 className="text-[var(--text-primary)] mb-3">Share Proposal</h4>
                                                <FormInput label="Enter Email" value={shareEmail} onChange={e => setShareEmail(e.target.value)} className="w-full mb-2" />
                                                <div className="flex gap-2">
                                                    <button onClick={() => setSharingId(null)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">Cancel</button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-[var(--text-primary)] truncate w-48">{p.proposalName || p.customerName || 'Untitled'}</h3>
                                                <div className="text-sm text-[var(--text-secondary)] truncate">{p.customerName}</div>
                                                <div className="flex flex-col mt-2">
                                                    <span className="text-xs text-[var(--text-muted)]">Created: {new Date(Number(p.id)).toLocaleDateString()}</span>
                                                    {p.createdBy !== user.email && <span className="text-[10px] text-ai-secondary uppercase tracking-wide mt-1 font-semibold">By: {p.createdBy}</span>}
                                                    {isSuper && p.companyId && <span className="text-[10px] text-[var(--text-disabled)] uppercase mt-1">Comp: {companies.find(c => c.id === p.companyId)?.name}</span>}
                                                </div>
                                            </div>
                                            <span className="px-2.5 py-1 bg-ai-accent/10 text-ai-secondary rounded-lg text-xs font-semibold border border-ai-accent/20">{p.pricing.currency}</span>
                                        </div>

                                        <div className="flex gap-2 pt-4 border-t border-[var(--panel-border)] mt-auto">
                                            <Button onClick={() => handleEdit(p)} className="flex-1 h-10 gap-2">
                                                <EditIcon size={16} /> Edit
                                            </Button>
                                            <IconButton icon={CopyIcon} onClick={() => handleDuplicate(p)} size={18} title="Duplicate" />
                                            {(isSuper || isAdmin || p.createdBy === user.email) && (
                                                <IconButton icon={TrashIcon} onClick={() => handleDelete(p.id)} variant="ghost" className="text-red-400 hover:text-red-500 hover:bg-red-500/10" size={18} title="Delete" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )
                }

                {subMode === 'companies' && isSuper && renderCompanyManagement()}
                {subMode === 'company_users' && (isSuper || isAdmin) && renderUserManagement()}

                {
                    subMode === 'account_settings' && (
                        <div className="glass p-8 rounded-2xl max-w-md mx-auto">
                            <SectionHeader title="Change Password" icon={<LockIcon />} />
                            {passMsg.text && <div className={`mb-5 p-3.5 rounded-xl text-sm border ${passMsg.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>{passMsg.text}</div>}
                            <FormInput label="Current Password" type="password" value={passData.current} onChange={e => setPassData({ ...passData, current: e.target.value })} />
                            <FormInput label="New Password" type="password" value={passData.new} onChange={e => setPassData({ ...passData, new: e.target.value })} />
                            <Button onClick={() => { try { changePassword(user.email, passData.current, passData.new); setPassMsg({ type: 'success', text: 'Updated' }); } catch (e: any) { setPassMsg({ type: 'error', text: e.message }); } }}>Update Password</Button>
                        </div>
                    )
                }
            </div >
        );
    };

    if (viewMode === 'dashboard') return <div className="min-h-screen bg-premium">{renderDashboard()}</div>;

    if (viewMode === 'preview') return (
        <div className="min-h-screen bg-gray-100 pb-20">
            <div className="sticky top-0 z-50 bg-white shadow-md p-4 no-print flex justify-between items-center">
                <div className="flex gap-4">
                    <button onClick={() => setViewMode('dashboard')} className="flex items-center gap-2 text-gray-600 font-semibold hover:text-corporate-blue"><HomeIcon /> Dashboard</button>
                    <button onClick={() => setViewMode('form')} className="flex items-center gap-2 text-gray-600 font-semibold hover:text-corporate-blue"><EditIcon /> Edit Proposal</button>
                </div>
                <h1 className="text-xl font-bold text-corporate-blue flex items-center gap-2">{formData.proposalName}</h1>
                <button onClick={() => window.print()} className="px-6 py-2 bg-corporate-blue text-white rounded font-bold hover:bg-sky-900 transition-colors">Print / Download PDF</button>
            </div>
            <div className="mt-8"><ProposalPDF data={formData} /></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-premium p-0 md:p-4 lg:p-6 overflow-x-hidden">
            <ProposalGenerationLoader
                isVisible={isGenerating}
                isComplete={generationComplete}
                onFadeComplete={() => {
                    setIsGenerating(false);
                    setGenerationComplete(false);
                    setViewMode('preview');
                }}
            />

            <div className="wizard-shell">
                {/* Left Drawer / Sidebar */}
                {renderStepNav()}

                {/* Main Content Area */}
                <main className="wizard-main">
                    {/* Top bar for mobile only */}
                    <div className="mobile-step-header glass p-4 rounded-xl mb-4">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs text-[var(--text-muted)] uppercase font-black">Step {step + 1} / {StepsNames.length}</span>
                            <span className="text-sm font-bold text-[var(--text-primary)]">{StepsNames[step].label}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                            <div className="h-full gradient-accent" style={{ width: `${((step + 1) / StepsNames.length) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setViewMode('dashboard')} className="p-2 rounded-lg bg-[var(--input-bg)] hover:bg-[var(--row-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                                <HomeIcon />
                            </button>
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">{StepsNames[step].label}</h2>
                        </div>
                        <div className="hidden md:block">
                            <Button variant="secondary" onClick={() => handleSaveProposal(true)} disabled={isGenerating} className="gap-2 h-9 text-xs">
                                <SaveIcon /> Save Draft
                            </Button>
                        </div>
                    </div>

                    <div className="animate-fade-in-up">
                        {Steps[step]}
                    </div>

                    {/* Footer Nav */}
                    <div className="wizard-footer flex justify-between items-center gap-4">
                        <Button
                            variant="secondary"
                            onClick={() => setStep(s => Math.max(0, s - 1))}
                            disabled={step === 0 || isGenerating}
                            className="flex-1 md:flex-initial gap-2"
                        >
                            <ArrowLeftIcon size={18} /> Previous
                        </Button>
                        <div className="flex-1 md:flex-initial flex justify-end">
                            {step < StepsNames.length - 1 ? (
                                <Button
                                    onClick={() => setStep(s => Math.min(StepsNames.length - 1, s + 1))}
                                    className="w-full md:w-auto gap-2"
                                >
                                    Next Step <ArrowRightIcon size={18} />
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => handleSaveProposal(false)}
                                    disabled={isGenerating}
                                    className="w-full md:w-auto shadow-glow shadow-ai-accent/20 gap-2"
                                >
                                    {isGenerating ? (
                                        <>Generating...</>
                                    ) : (
                                        <>
                                            <SaveIcon size={18} /> Generate Proposal
                                        </>
                                    )}
                                </Button>
                            ) /* Final step check */}
                        </div>
                    </div>
                </main>

                {/* Right Context / Summary Area */}
                {renderQuickSummary()}
            </div>
        </div>
    );
};

export default App;
