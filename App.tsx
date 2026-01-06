
import React, { useState, useEffect } from 'react';
import { getBackgroundStyles, getSceneOptions, getPoseOptions, HAIR_COLOR_OPTIONS, getHairstyleOptions, SKIN_TONE_OPTIONS } from './constants';
import { BackgroundStyle, GenerationState, GenerationMode, Gender, AspectRatio, Scene, Pose, HairColor, Hairstyle, SkinTone, CharacterSource, Discount, WhitelistedUser, AdminSubView, User } from './types';
import { generateProductPhoto } from './services/geminiService';
import Button from './components/Button';
import StyleCard from './components/StyleCard';
import { Language, translations } from './translations';

const ASPECT_RATIOS: { label: string; value: AspectRatio; icon: React.ReactNode }[] = [
  { label: 'Square', value: '1:1', icon: <div className="w-6 h-6 border-2 border-current rounded-sm" /> },
  { label: 'Landscape', value: '16:9', icon: <div className="w-8 h-4 border-2 border-current rounded-sm" /> },
  { label: 'Portrait', value: '9:16', icon: <div className="w-4 h-8 border-2 border-current rounded-sm" /> },
  { label: 'Classic', value: '4:3', icon: <div className="w-7 h-5 border-2 border-current rounded-sm" /> },
];

const DEMO_ACCOUNTS = [
  { email: 'premium_user1@madrun.com', pass: 'Premium123!' },
  { email: 'studio_pro@madrun.com', pass: 'StudioPro2025' },
  { email: 'creative_mind@madrun.com', pass: 'Creative373' }
];

const App: React.FC = () => {
  // Localization State
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  // Auth & View State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [view, setView] = useState<'studio' | 'admin' | 'billing'>('studio');
  const [adminSubView, setAdminSubView] = useState<AdminSubView>('overview');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Configuration State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCharacterImage, setSelectedCharacterImage] = useState<string | null>(null);
  const [mode, setMode] = useState<GenerationMode>('background');
  const [characterSource, setCharacterSource] = useState<CharacterSource>('ai');
  const [selectedStyle, setSelectedStyle] = useState<BackgroundStyle>('white-studio');
  const [selectedGender, setSelectedGender] = useState<Gender>('female');
  const [selectedScene, setSelectedScene] = useState<Scene>('studio');
  const [selectedPose, setSelectedPose] = useState<Pose>('neutral');
  const [selectedHairColor, setSelectedHairColor] = useState<HairColor>('brown');
  const [selectedHairstyle, setSelectedHairstyle] = useState<Hairstyle>('medium');
  const [selectedSkinTone, setSelectedSkinTone] = useState<SkinTone>('medium');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>('1:1');
  const [genState, setGenState] = useState<GenerationState>({
    isGenerating: false,
    error: null,
    resultUrl: null
  });

  // Admin & Financial Data
  const [history, setHistory] = useState<{id: string, timestamp: string, type: string, url: string, user: string}[]>([]);
  const [payments, setPayments] = useState<{id: string, user: string, amount: number, date: string, status: string}[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('madrun_current_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    const savedHistory = localStorage.getItem('madrun_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedPayments = localStorage.getItem('madrun_payments');
    if (savedPayments) setPayments(JSON.parse(savedPayments));

    const savedUsersRaw = localStorage.getItem('madrun_registered_users');
    let usersList: User[] = savedUsersRaw ? JSON.parse(savedUsersRaw) : [];
    
    const virtualUsers: User[] = DEMO_ACCOUNTS.map(demo => ({
      email: demo.email,
      password: demo.pass,
      role: 'user',
      createdAt: new Date().toISOString(),
      subscriptionStatus: 'active',
      trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    }));

    virtualUsers.forEach(vUser => {
      if (!usersList.some(u => u.email === vUser.email)) {
        usersList.push(vUser);
      }
    });

    localStorage.setItem('madrun_registered_users', JSON.stringify(usersList));
    setRegisteredUsers(usersList);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string | null) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
        setGenState(prev => ({ ...prev, resultUrl: null, error: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (authEmail === 'doru373@gmail.com' && authPassword === 'Madrun@373$$') {
      const admin: User = { 
        email: authEmail, 
        role: 'admin', 
        createdAt: new Date().toISOString(),
        subscriptionStatus: 'active',
        trialEndsAt: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString()
      };
      loginUser(admin);
      return;
    }

    const allUsers: User[] = JSON.parse(localStorage.getItem('madrun_registered_users') || '[]');

    if (authMode === 'signup') {
      if (allUsers.find(u => u.email === authEmail)) {
        setAuthError(lang === 'en' ? 'Email already registered' : 'Email déjà enregistré');
        return;
      }
      const trialDays = 3;
      const newUser: User = { 
        email: authEmail, 
        password: authPassword, 
        role: 'user', 
        createdAt: new Date().toISOString(),
        subscriptionStatus: 'trialing',
        trialEndsAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString()
      };
      const updatedUsers = [...allUsers, newUser];
      setRegisteredUsers(updatedUsers);
      localStorage.setItem('madrun_registered_users', JSON.stringify(updatedUsers));
      loginUser(newUser);
    } else {
      const user = allUsers.find(u => u.email === authEmail && u.password === authPassword);
      if (user) {
        loginUser(user);
      } else {
        setAuthError(lang === 'en' ? 'Invalid email or password' : 'Email ou mot de passe invalide');
      }
    }
  };

  const loginUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('madrun_current_user', JSON.stringify(user));
    setAuthEmail('');
    setAuthPassword('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('studio');
    localStorage.removeItem('madrun_current_user');
  };

  const simulateStripeCheckout = async () => {
    setIsProcessingPayment(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (currentUser) {
      const updatedUser: User = { 
        ...currentUser, 
        subscriptionStatus: 'active',
        stripeCustomerId: 'cus_' + Math.random().toString(36).substr(2, 9)
      };
      
      const newPayment = {
        id: 'pi_' + Math.random().toString(36).substr(2, 9),
        user: currentUser.email,
        amount: 1900,
        date: new Date().toISOString(),
        status: 'succeeded'
      };

      const updatedPayments = [newPayment, ...payments];
      setPayments(updatedPayments);
      localStorage.setItem('madrun_payments', JSON.stringify(updatedPayments));

      const allUsers: User[] = JSON.parse(localStorage.getItem('madrun_registered_users') || '[]');
      const updatedAllUsers = allUsers.map(u => u.email === currentUser.email ? updatedUser : u);
      setRegisteredUsers(updatedAllUsers);
      localStorage.setItem('madrun_registered_users', JSON.stringify(updatedAllUsers));

      setCurrentUser(updatedUser);
      localStorage.setItem('madrun_current_user', JSON.stringify(updatedUser));
    }
    
    setIsProcessingPayment(false);
    setShowPaymentModal(false);
    setView('studio');
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;
    
    if (currentUser && currentUser.subscriptionStatus === 'trialing') {
      const trialOver = new Date(currentUser.trialEndsAt) < new Date();
      if (trialOver) {
        setGenState(prev => ({ ...prev, error: lang === 'en' ? "Trial ended. Please subscribe." : "Essai terminé. Veuillez vous abonner." }));
        setShowPaymentModal(true);
        return;
      }
    }

    if (mode === 'avatar' && characterSource === 'custom' && !selectedCharacterImage) {
      setGenState(prev => ({ ...prev, error: lang === 'en' ? "Please upload a character reference." : "Veuillez charger une référence de personnage." }));
      return;
    }

    setGenState({ isGenerating: true, error: null, resultUrl: null });
    try {
      const result = await generateProductPhoto(selectedImage, mode, { 
        style: selectedStyle, 
        gender: selectedGender,
        aspectRatio: selectedAspectRatio,
        scene: selectedScene,
        pose: selectedPose,
        hairColor: selectedHairColor,
        hairstyle: selectedHairstyle,
        skinTone: selectedSkinTone,
        characterSource: characterSource,
        characterImage: selectedCharacterImage
      });
      const newHistoryItem = { 
        id: Math.random().toString(36).substr(2, 9), 
        timestamp: new Date().toLocaleString(), 
        type: mode, 
        url: result,
        user: currentUser?.email || 'unknown'
      };
      const updatedHistory = [newHistoryItem, ...history].slice(0, 100);
      setHistory(updatedHistory);
      localStorage.setItem('madrun_history', JSON.stringify(updatedHistory));
      setGenState({ isGenerating: false, error: null, resultUrl: result });
    } catch (err: any) {
      setGenState({ isGenerating: false, error: err.message || "Failed to generate photo.", resultUrl: null });
    }
  };

  // UI Part
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FDFDFF] flex flex-col items-center justify-center p-8 selection:bg-indigo-100">
        {/* Lang Toggle for Auth Screen */}
        <div className="absolute top-12 right-12 flex bg-slate-100 p-2 rounded-full shadow-inner">
          <button onClick={() => setLang('en')} className={`px-6 py-2 rounded-full font-black text-xs transition-all ${lang === 'en' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}>EN</button>
          <button onClick={() => setLang('fr')} className={`px-6 py-2 rounded-full font-black text-xs transition-all ${lang === 'fr' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}>FR</button>
        </div>

        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-16">
            <div className="flex items-center gap-6">
              <div className="bg-indigo-600 w-20 h-20 flex items-center justify-center rounded-[2rem] shadow-2xl shadow-indigo-100">
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </div>
              <h1 className="text-4xl font-black tracking-tighter">E-commerce Studio by Madrun</h1>
            </div>
            <div className="space-y-8">
              <h2 className="text-8xl font-black tracking-tighter leading-[0.85]">{t.auth.slogan} <span className="text-indigo-600">{t.auth.noCameras}</span></h2>
              <p className="text-3xl text-slate-400 font-medium leading-relaxed max-w-xl">{t.auth.automate}</p>
            </div>
          </div>

          <div className="bg-white rounded-[5rem] p-20 shadow-[0_80px_150px_-30px_rgba(79,70,229,0.2)] border border-slate-50 w-full animate-in zoom-in slide-in-from-right-12 duration-1000">
            <div className="mb-16">
              <h3 className="text-5xl font-black tracking-tighter mb-6">{authMode === 'signin' ? t.auth.welcome : t.auth.create}</h3>
              <p className="text-xl text-slate-400 font-medium">{t.auth.subtitle}</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-12">
              <div className="space-y-6">
                <label className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">{t.auth.emailLabel}</label>
                <input 
                  type="email" 
                  value={authEmail} 
                  onChange={(e) => setAuthEmail(e.target.value)} 
                  className="w-full px-10 py-8 rounded-[2.5rem] bg-slate-50 border-4 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all text-2xl font-bold" 
                  placeholder="ceo@brand.com" 
                  required 
                />
              </div>
              <div className="space-y-6">
                <label className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">{t.auth.passLabel}</label>
                <input 
                  type="password" 
                  value={authPassword} 
                  onChange={(e) => setAuthPassword(e.target.value)} 
                  className="w-full px-10 py-8 rounded-[2.5rem] bg-slate-50 border-4 border-transparent focus:border-indigo-600 focus:bg-white outline-none transition-all text-2xl font-bold" 
                  placeholder="••••••••" 
                  required 
                />
              </div>
              {authError && <p className="text-red-500 font-bold text-center bg-red-50 py-5 rounded-3xl text-lg">{authError}</p>}
              <Button type="submit" lang={lang} className="w-full h-28 rounded-[3rem] text-3xl shadow-2xl shadow-indigo-100">
                {authMode === 'signin' ? t.auth.launch : t.auth.claim}
              </Button>
            </form>

            <div className="mt-16 text-center">
              <p className="text-slate-400 font-bold text-xl">
                {authMode === 'signin' ? t.auth.newHere : t.auth.alreadyMember}{' '}
                <button 
                  onClick={() => { setAuthMode(authMode === 'signin' ? 'signup' : 'signin'); setAuthError(''); }} 
                  className="text-indigo-600 hover:underline decoration-4 underline-offset-8"
                >
                  {authMode === 'signin' ? t.auth.createLink : t.auth.signinLink}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFF] text-slate-900 selection:bg-indigo-100">
      <nav className="bg-white/90 backdrop-blur-2xl border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-[1700px] mx-auto px-12 h-28 flex items-center justify-between">
          <div className="flex items-center gap-6 cursor-pointer group" onClick={() => setView('studio')}>
            <div className="bg-indigo-600 w-16 h-16 flex items-center justify-center rounded-[1.75rem] shadow-2xl shadow-indigo-100 group-hover:scale-110 transition-transform">
              <svg className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black tracking-tighter hidden md:block">E-commerce Studio by Madrun</h1>
          </div>

          <div className="flex items-center gap-6">
            {/* Lang Toggle In Nav */}
            <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 mr-4">
              <button onClick={() => setLang('en')} className={`px-4 py-2 rounded-xl font-black text-[10px] tracking-widest transition-all ${lang === 'en' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>EN</button>
              <button onClick={() => setLang('fr')} className={`px-4 py-2 rounded-xl font-black text-[10px] tracking-widest transition-all ${lang === 'fr' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}>FR</button>
            </div>

            <div className="hidden lg:flex items-center gap-4 bg-slate-50 px-6 py-2 rounded-full border border-slate-100">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{t.nav.status}</span>
                <span className={`text-[10px] font-black uppercase ${currentUser.subscriptionStatus === 'active' ? 'text-green-600' : 'text-orange-500'}`}>
                  {currentUser.subscriptionStatus === 'trialing' ? t.nav.trial : t.nav.premium}
                </span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{t.nav.identity}</span>
                <span className="text-[10px] font-black text-slate-900">{currentUser.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {currentUser.role === 'admin' && (
                <button 
                  onClick={() => setView(view === 'admin' ? 'studio' : 'admin')} 
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'admin' ? 'bg-indigo-600 text-white shadow-2xl' : 'bg-slate-900 text-white hover:scale-105'}`}
                >
                  {view === 'admin' ? t.nav.studio : t.nav.admin}
                </button>
              )}
              {currentUser.subscriptionStatus !== 'active' && currentUser.role !== 'admin' && (
                <button 
                  onClick={() => setShowPaymentModal(true)} 
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
                >
                  {t.nav.upgrade}
                </button>
              )}
              <button onClick={handleLogout} className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-all">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1700px] mx-auto p-12 lg:p-20">
        {view === 'admin' ? (
          <div className="flex gap-20 animate-in fade-in slide-in-from-bottom-12 duration-1000">
             <aside className="w-96 space-y-4">
                {(['overview', 'users', 'discounts', 'logs', 'payments'] as const).map((sub) => (
                  <button 
                    key={sub} 
                    onClick={() => setAdminSubView(sub as AdminSubView)} 
                    className={`w-full flex items-center gap-6 px-10 py-7 rounded-[2.5rem] text-xl font-black transition-all ${adminSubView === sub ? 'bg-indigo-600 text-white shadow-2xl' : 'text-slate-400 hover:bg-white hover:text-indigo-600 border-4 border-transparent'}`}
                  >
                    <span className="capitalize">{t.admin[sub as keyof typeof t.admin] || sub}</span>
                  </button>
                ))}
             </aside>
             
             <div className="flex-1 bg-white rounded-[4rem] p-20 border border-slate-100 shadow-sm min-h-[80vh]">
                <h2 className="text-7xl font-black mb-20 tracking-tight capitalize">{t.admin.analytics} <span className="text-indigo-600">{t.admin[adminSubView as keyof typeof t.admin] || adminSubView}</span></h2>
                
                {adminSubView === 'overview' && (
                  <div className="space-y-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                      <div className="bg-slate-50 p-12 rounded-[3.5rem] border border-slate-100">
                        <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-6">{t.admin.liveUsers}</p>
                        <p className="text-7xl font-black text-slate-900">{registeredUsers.length}</p>
                      </div>
                      <div className="bg-indigo-50 p-12 rounded-[3.5rem] border border-indigo-100">
                        <p className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] mb-6">{t.admin.revenue}</p>
                        <p className="text-7xl font-black text-indigo-600">
                          ${(payments.reduce((acc, p) => acc + p.amount, 0) / 100).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-green-50 p-12 rounded-[3.5rem] border border-green-100">
                        <p className="text-sm font-black text-green-400 uppercase tracking-[0.3em] mb-6">{t.admin.generations}</p>
                        <p className="text-7xl font-black text-green-600">{history.length}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50/50 p-12 rounded-[3.5rem] border border-slate-100 space-y-8">
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest">{t.admin.demoCreds}</h3>
                      <p className="text-slate-400 font-medium text-lg">{t.admin.demoSub}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {DEMO_ACCOUNTS.map((demo, idx) => (
                          <div key={idx} className="flex flex-col p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 bg-indigo-600 text-white rounded-bl-2xl font-black text-[10px] tracking-widest uppercase">PRO</div>
                            <div className="space-y-4">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</span>
                                <span className="text-base font-bold text-slate-800 break-all">{demo.email}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</span>
                                <span className="text-base font-bold text-indigo-600 font-mono">{demo.pass}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 items-start animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="lg:col-span-5 space-y-24">
              <section className="space-y-12">
                <div className="space-y-4">
                  <span className="text-indigo-600 font-black text-2xl tracking-tighter uppercase">{t.studio.step1}</span>
                  <h2 className="text-6xl lg:text-7xl font-black tracking-tighter">{t.studio.subject}</h2>
                </div>
                
                <div className="relative group">
                  {selectedImage ? (
                    <div className="relative rounded-[4rem] overflow-hidden aspect-square bg-white border-8 border-indigo-50 shadow-[0_50px_100px_-20px_rgba(79,70,229,0.1)] transition-all duration-700 hover:scale-[1.02]">
                      <img src={selectedImage} alt="Product" className="w-full h-full object-contain p-20" />
                      <button onClick={() => setSelectedImage(null)} className="absolute top-12 right-12 bg-white/90 hover:bg-white text-slate-900 p-8 rounded-full shadow-2xl transition-all hover:rotate-90">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full aspect-square border-8 border-dashed border-slate-100 rounded-[5rem] cursor-pointer bg-white hover:bg-indigo-50/20 hover:border-indigo-200 transition-all group p-20">
                      <div className="bg-indigo-50 p-16 rounded-[3rem] mb-12 group-hover:scale-110 transition-transform duration-700">
                        <svg className="w-20 h-20 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <p className="text-4xl font-black text-slate-900">{t.studio.import}</p>
                      <p className="text-2xl text-slate-400 font-medium mt-4">{t.studio.fidelity}</p>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setSelectedImage)} />
                    </label>
                  )}
                </div>
              </section>

              <section className="space-y-12">
                <div className="space-y-4">
                  <span className="text-indigo-600 font-black text-2xl tracking-tighter uppercase">{t.studio.step2}</span>
                  <h2 className="text-6xl font-black tracking-tighter">{t.studio.vision}</h2>
                </div>
                <div className="flex gap-8 p-4 bg-slate-50 rounded-[3.5rem]">
                  {(['background', 'avatar'] as const).map((m) => (
                    <button key={m} onClick={() => setMode(m)} className={`flex-1 py-10 rounded-[3rem] text-2xl font-black transition-all ${mode === m ? 'bg-white text-indigo-600 shadow-2xl scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}>
                      {m === 'background' ? t.studio.studioPack : t.studio.lifestyle}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-12">
                <div className="space-y-4">
                  <span className="text-indigo-600 font-black text-2xl tracking-tighter uppercase">{t.studio.step3}</span>
                  <h2 className="text-6xl font-black tracking-tighter">{mode === 'background' ? t.studio.stage : t.studio.cast}</h2>
                </div>
                
                {mode === 'background' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                    {getBackgroundStyles(lang).map((style) => (
                      <StyleCard key={style.id} style={style} isSelected={selectedStyle === style.id} onClick={() => setSelectedStyle(style.id)} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-[4rem] p-16 border border-slate-100 shadow-sm space-y-20">
                    <div className="space-y-10">
                      <label className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">{t.studio.source}</label>
                      <div className="flex gap-6 p-3 bg-slate-50 rounded-[2.5rem]">
                        {(['ai', 'custom'] as const).map((s) => (
                          <button key={s} onClick={() => setCharacterSource(s)} className={`flex-1 py-6 rounded-[2rem] text-xl font-black transition-all ${characterSource === s ? 'bg-white text-indigo-600 shadow-xl scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}>
                            {s === 'ai' ? t.studio.aiModel : t.studio.customImg}
                          </button>
                        ))}
                      </div>
                    </div>

                    {characterSource === 'custom' ? (
                      <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
                        <label className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">{t.studio.refImg}</label>
                        <div className="relative group">
                          {selectedCharacterImage ? (
                            <div className="relative rounded-[3rem] overflow-hidden aspect-square bg-slate-50 border-4 border-indigo-100 shadow-xl transition-all duration-500 hover:scale-[1.02]">
                              <img src={selectedCharacterImage} alt="Character Reference" className="w-full h-full object-cover" />
                              <button onClick={() => setSelectedCharacterImage(null)} className="absolute top-8 right-8 bg-white/90 hover:bg-white text-slate-900 p-6 rounded-full shadow-2xl transition-all hover:rotate-90">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full aspect-square border-4 border-dashed border-slate-100 rounded-[3rem] cursor-pointer bg-slate-50 hover:bg-indigo-50/30 hover:border-indigo-200 transition-all group p-12">
                              <div className="bg-white p-12 rounded-[2rem] mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                                <svg className="w-16 h-16 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <p className="text-3xl font-black text-slate-900 text-center">{t.studio.refModel}</p>
                              <p className="text-xl text-slate-400 font-medium mt-3 text-center">{t.studio.clearPhoto}</p>
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setSelectedCharacterImage)} />
                            </label>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
                        <label className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">{t.studio.identity}</label>
                        <div className="grid grid-cols-2 gap-8">
                          {(['female', 'male'] as const).map((g) => (
                            <button key={g} onClick={() => setSelectedGender(g)} className={`py-10 rounded-[2.5rem] font-black text-2xl border-4 transition-all ${selectedGender === g ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-50 text-slate-300'}`}>
                              {lang === 'en' ? g.charAt(0).toUpperCase() + g.slice(1) : (g === 'female' ? 'Femme' : 'Homme')}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-10">
                      <label className="text-sm font-black text-slate-400 uppercase tracking-[0.4em]">{t.studio.atmosphere}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {getSceneOptions(lang).map((scene) => (
                          <button key={scene.id} onClick={() => setSelectedScene(scene.id)} className={`flex items-center gap-6 p-8 rounded-[2.5rem] font-bold border-4 transition-all ${selectedScene === scene.id ? 'border-indigo-600 bg-white text-indigo-600 shadow-xl scale-[1.02]' : 'border-slate-50 text-slate-400'}`}>
                            <span className="text-5xl">{scene.icon}</span>
                            <span className="text-2xl">{scene.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <div className="pt-20">
                <Button 
                  lang={lang}
                  className="w-full h-32 rounded-[3.5rem] text-4xl shadow-[0_50px_100px_-20px_rgba(79,70,229,0.3)] hover:scale-[1.02]" 
                  onClick={handleGenerate} 
                  isLoading={genState.isGenerating}
                  disabled={!selectedImage}
                >
                  {t.studio.generate}
                </Button>
                {genState.error && (
                  <div className="mt-10 bg-red-50 p-8 rounded-[2.5rem] border-4 border-red-100 animate-in shake duration-500">
                    <p className="text-red-500 font-black text-2xl text-center">{genState.error}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="sticky top-40 space-y-12">
                <div className="bg-[#0A0B10] rounded-[5rem] p-6 shadow-[0_80px_160px_-40px_rgba(0,0,0,0.4)] overflow-hidden min-h-[850px] flex items-center justify-center relative group border-4 border-slate-900">
                  {genState.isGenerating ? (
                    <div className="flex flex-col items-center gap-20 animate-in fade-in zoom-in duration-1000">
                      <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-20 scale-[2.5]"></div>
                        <div className="bg-white p-20 rounded-[3rem] shadow-2xl relative z-10">
                          <svg className="w-28 h-28 text-indigo-600 animate-spin" viewBox="0 0 24 24"><circle className="opacity-10" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                        </div>
                      </div>
                      <div className="text-center space-y-6 px-20">
                        <p className="text-white text-5xl font-black tracking-tighter">{t.studio.mastering}</p>
                        <p className="text-slate-500 text-2xl font-medium max-w-lg">{t.studio.engineMsg}</p>
                      </div>
                    </div>
                  ) : genState.resultUrl ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-12 animate-in zoom-in fade-in duration-1000">
                      <img src={genState.resultUrl} alt="Final" className="max-w-full max-h-[1000px] object-contain rounded-[4rem] shadow-2xl border-[12px] border-white/5" />
                      <div className="absolute bottom-20 right-20 flex gap-8">
                        <a href={genState.resultUrl} download={`madrun-export-${Date.now()}.png`} className="bg-white text-slate-900 px-12 py-7 rounded-[2.5rem] font-black text-2xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-[0_40px_80px_-15px_rgba(255,255,255,0.4)]">
                          <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                          {t.studio.export}
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center p-32 space-y-16 opacity-30">
                      <div className="bg-slate-900/50 p-24 rounded-[6rem] border-4 border-slate-800 shadow-inner">
                         <svg className="w-48 h-48 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <div className="space-y-6">
                        <p className="text-white text-6xl font-black tracking-tighter">{t.studio.waiting}</p>
                        <p className="text-slate-500 text-3xl font-medium">{t.studio.waitingSub}</p>
                      </div>
                    </div>
                  )}

                  <div className="absolute top-20 left-20">
                    <div className="bg-white/5 backdrop-blur-3xl border-2 border-white/10 px-10 py-5 rounded-full flex items-center gap-5">
                      <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_20px_rgba(79,70,229,0.8)]"></div>
                      <span className="text-white font-black text-lg uppercase tracking-[0.2em]">{t.studio.renderActive}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-12">
          <div className="absolute inset-0 bg-[#0A0B10]/95 backdrop-blur-3xl" onClick={() => !isProcessingPayment && setShowPaymentModal(false)}></div>
          <div className="relative bg-white w-full max-w-4xl rounded-[5rem] shadow-[0_100px_200px_-40px_rgba(0,0,0,0.5)] p-20 animate-in zoom-in duration-700 overflow-hidden">
            <div className="flex justify-between items-center mb-16">
              <div className="flex items-center gap-6">
                <div className="bg-indigo-600 text-white p-4 rounded-3xl font-black text-2xl tracking-tighter">S|</div>
                <h3 className="text-5xl font-black tracking-tighter">{t.payment.checkout}</h3>
              </div>
              <button onClick={() => !isProcessingPayment && setShowPaymentModal(false)} className="text-slate-200 hover:text-slate-900 p-6 transition-all">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
              <div className="space-y-12">
                <div className="space-y-4">
                  <p className="text-slate-400 font-black uppercase tracking-widest text-sm">{t.payment.plan}</p>
                  <p className="text-5xl font-black text-slate-900">{t.payment.premiumPro}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-7xl font-black text-indigo-600">$19</span>
                    <span className="text-2xl text-slate-400 font-bold">/ {lang === 'en' ? 'month' : 'mois'}</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-6 text-xl font-bold text-slate-600"><div className="w-3 h-3 bg-indigo-600 rounded-full" />{t.payment.unlimited}</div>
                  <div className="flex items-center gap-6 text-xl font-bold text-slate-600"><div className="w-3 h-3 bg-indigo-600 rounded-full" />{t.payment.ultraHd}</div>
                  <div className="flex items-center gap-6 text-xl font-bold text-slate-600"><div className="w-3 h-3 bg-indigo-600 rounded-full" />{t.payment.customChar}</div>
                </div>
              </div>

              <div className="bg-slate-50 p-12 rounded-[4rem] border-4 border-slate-100 space-y-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.payment.cardInfo}</label>
                    <div className="bg-white px-8 py-6 rounded-[2rem] border-4 border-slate-100 text-xl font-bold text-slate-900 flex items-center justify-between">
                       <span>4242 4242 4242 4242</span>
                       <svg className="w-12 h-12 text-slate-200" viewBox="0 0 38 24"><path fill="currentColor" d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.3 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.3-3-3-3zM14 18.6h-2.9l1.8-11.4h2.9L14 18.6zm13.1-11.1c-1.3-.5-2.2-.8-3.3-.8-3.4 0-5.8 1.8-5.8 4.4 0 1.9 1.7 3 3 3.6.4.2 1.4.6 1.4 1 0 .6-.7.9-1.3.9-1.1 0-1.7-.2-2.7-.6l-.4-.2-.4 2.5c.7.3 2 .6 3.3.6 3.5 0 5.9-1.7 5.9-4.4 0-1.5-.9-2.6-2.9-3.5-.5-.2-.9-.5-.9-.8 0-.3.3-.6.9-.6.5 0 1 .1 1.5.3l.3.1.5-2.6z"/></svg>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white px-8 py-6 rounded-[2rem] border-4 border-slate-100 text-xl font-bold text-slate-400">MM / YY</div>
                    <div className="bg-white px-8 py-6 rounded-[2rem] border-4 border-slate-100 text-xl font-bold text-slate-400">CVC</div>
                 </div>
                 <Button onClick={simulateStripeCheckout} isLoading={isProcessingPayment} lang={lang} className="w-full h-24 rounded-[2.5rem] text-2xl shadow-2xl shadow-indigo-100">
                    {t.payment.payUnlock}
                 </Button>
                 <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.payment.secureMsg}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
