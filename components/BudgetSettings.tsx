
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { Card } from './ui/Card';
import { Save, Wallet, Camera, Upload, Sun, Moon, Palette, LogOut, Loader2, Sparkles, Check, User as UserIcon } from 'lucide-react';
import { AVATAR_OPTIONS } from '../constants';

interface BudgetSettingsProps {
  users: { A: User; B: User };
  familyName: string;
  alertThreshold: number;
  onUpdateUser: (userId: string, data: Partial<User>) => void;
  onUpdateFamilySettings: (name: string, threshold: number) => void;
  currentTheme: 'dark' | 'light';
  onThemeToggle: (theme: 'dark' | 'light') => void;
  onLogout: () => void;
  onForceSync: (overrideUsers?: { A: User; B: User }, overrideFamilyName?: string, overrideThreshold?: number) => Promise<void>;
  isSyncing: boolean;
}

export const BudgetSettings: React.FC<BudgetSettingsProps> = ({ 
  users, 
  familyName: dbFamilyName, 
  alertThreshold: dbThreshold,
  onUpdateUser, 
  onUpdateFamilySettings,
  currentTheme,
  onThemeToggle,
  onLogout,
  onForceSync,
  isSyncing
}) => {
  // Estados locais para edição instantânea
  const [incomeA, setIncomeA] = useState(users.A.income.toString());
  const [nameA, setNameA] = useState(users.A.name);
  const [avatarA, setAvatarA] = useState(users.A.avatar);
  
  const [incomeB, setIncomeB] = useState(users.B.income.toString());
  const [nameB, setNameB] = useState(users.B.name);
  const [avatarB, setAvatarB] = useState(users.B.avatar);
  
  const [familyName, setFamilyName] = useState(dbFamilyName);
  const [localSaving, setLocalSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Mantém os campos sincronizados se houver mudança externa (ex: outro dispositivo)
  useEffect(() => {
    if (!localSaving) {
      setNameA(users.A.name);
      setIncomeA(users.A.income.toString());
      setAvatarA(users.A.avatar);
      setNameB(users.B.name);
      setIncomeB(users.B.income.toString());
      setAvatarB(users.B.avatar);
      setFamilyName(dbFamilyName);
    }
  }, [users, dbFamilyName]);

  const fileInputRefA = useRef<HTMLInputElement>(null);
  const fileInputRefB = useRef<HTMLInputElement>(null);

  const handleSaveAll = async () => {
    setLocalSaving(true);
    setShowSuccess(false);

    const finalUsers = {
      A: { ...users.A, name: nameA, income: parseFloat(incomeA) || 0, avatar: avatarA },
      B: { ...users.B, name: nameB, income: parseFloat(incomeB) || 0, avatar: avatarB }
    };

    onUpdateUser(users.A.id, finalUsers.A);
    onUpdateUser(users.B.id, finalUsers.B);
    onUpdateFamilySettings(familyName, dbThreshold);
    
    await onForceSync(finalUsers, familyName, dbThreshold);
    
    setLocalSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const total = (parseFloat(incomeA) || 0) + (parseFloat(incomeB) || 0);

  return (
    <div className="space-y-8 animate-slide-up max-w-4xl mx-auto pb-24">
      
      {/* HEADER DINÂMICO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-display font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic">Configurações</h2>
          <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.2em]">Personalize seu ecossistema financeiro</p>
        </div>
        {showSuccess && (
          <div className="bg-emerald-500 text-white px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-widest flex items-center space-x-2 animate-bounce">
            <Check size={14} /> <span>Sincronizado!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD USUÁRIO A - AMARELO/OURO */}
        <div className="group relative p-8 bg-white dark:bg-neutral-900 border-2 border-primary/40 rounded-[2.5rem] space-y-8 shadow-xl transition-all hover:border-primary">
          <div className="absolute top-6 right-8 text-[10px] font-black text-primary uppercase tracking-[0.3em]">Perfil Principal</div>
          
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-[2rem] border-4 border-primary/20 p-1 bg-neutral-100 dark:bg-neutral-800 shadow-2xl overflow-hidden transition-transform group-hover:scale-105">
                <img src={avatarA} alt="User A" className="w-full h-full rounded-[1.5rem] object-cover" />
              </div>
              <button onClick={() => fileInputRefA.current?.click()} className="absolute -bottom-2 -right-2 p-3 bg-primary text-neutral-950 rounded-2xl shadow-glow hover:scale-110 transition-transform active:scale-90">
                <Camera size={18} strokeWidth={2.5} />
              </button>
              <input type="file" ref={fileInputRefA} className="hidden" accept="image/*" onChange={(e) => {
                const f = e.target.files?.[0];
                if(f){ const r=new FileReader(); r.onloadend=()=>setAvatarA(r.result as string); r.readAsDataURL(f); }
              }} />
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Nome de Exibição</label>
              <input 
                type="text" 
                value={nameA} 
                onChange={e => setNameA(e.target.value)} 
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-lg font-bold text-neutral-900 dark:text-white outline-none focus:border-primary transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Renda Mensal</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">R$</span>
                <input 
                  type="number" 
                  value={incomeA} 
                  onChange={e => setIncomeA(e.target.value)} 
                  className="w-full pl-14 pr-6 py-5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-2xl font-display font-black text-neutral-900 dark:text-white outline-none focus:border-primary transition-all" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* CARD USUÁRIO B - AZUL/SKY */}
        <div className="group relative p-8 bg-white dark:bg-neutral-900 border-2 border-blue-500/40 rounded-[2.5rem] space-y-8 shadow-xl transition-all hover:border-blue-500">
          <div className="absolute top-6 right-8 text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Co-Responsável</div>
          
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-[2rem] border-4 border-blue-500/20 p-1 bg-neutral-100 dark:bg-neutral-800 shadow-2xl overflow-hidden transition-transform group-hover:scale-105">
                <img src={avatarB} alt="User B" className="w-full h-full rounded-[1.5rem] object-cover" />
              </div>
              <button onClick={() => fileInputRefB.current?.click()} className="absolute -bottom-2 -right-2 p-3 bg-blue-500 text-white rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:scale-110 transition-transform active:scale-90">
                <Camera size={18} strokeWidth={2.5} />
              </button>
              <input type="file" ref={fileInputRefB} className="hidden" accept="image/*" onChange={(e) => {
                const f = e.target.files?.[0];
                if(f){ const r=new FileReader(); r.onloadend=()=>setAvatarB(r.result as string); r.readAsDataURL(f); }
              }} />
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Nome de Exibição</label>
              <input 
                type="text" 
                value={nameB} 
                onChange={e => setNameB(e.target.value)} 
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-6 py-4 text-lg font-bold text-neutral-900 dark:text-white outline-none focus:border-blue-500 transition-all" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Renda Mensal</label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">R$</span>
                <input 
                  type="number" 
                  value={incomeB} 
                  onChange={e => setIncomeB(e.target.value)} 
                  className="w-full pl-14 pr-6 py-5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-2xl font-display font-black text-neutral-900 dark:text-white outline-none focus:border-blue-500 transition-all" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOMIZAÇÃO E TEMA */}
      <div className="p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] shadow-sm">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20"><Sun size={24} /></div>
          <div><h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-widest">Tema Visual</h3><p className="text-[10px] text-neutral-500 font-medium">Adapte a interface ao seu estilo de uso.</p></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => onThemeToggle('light')} className={`flex flex-col items-center justify-center space-y-3 p-8 rounded-[2rem] border-2 transition-all ${currentTheme === 'light' ? 'border-primary bg-primary/5 shadow-glow' : 'border-neutral-100 dark:border-neutral-800 opacity-40 hover:opacity-70'}`}>
            <Sun size={28} />
            <span className="text-[10px] font-black uppercase tracking-widest">Modo Claro</span>
          </button>
          <button onClick={() => onThemeToggle('dark')} className={`flex flex-col items-center justify-center space-y-3 p-8 rounded-[2rem] border-2 transition-all ${currentTheme === 'dark' ? 'border-primary bg-primary/5 shadow-glow' : 'border-neutral-100 dark:border-neutral-800 opacity-40 hover:opacity-70'}`}>
            <Moon size={28} />
            <span className="text-[10px] font-black uppercase tracking-widest">Modo Escuro</span>
          </button>
        </div>
      </div>

      {/* RODAPÉ DE AÇÃO COM RENDA COMBINADA */}
      <div className="sticky bottom-24 md:static bg-neutral-950 border border-neutral-800 p-8 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_60px_rgba(0,0,0,0.6)] z-50 animate-in slide-in-from-bottom-4">
        <div className="flex items-center space-x-6">
          <div className="p-6 bg-primary rounded-[2rem] shadow-glow transform hover:rotate-12 transition-transform">
            <Wallet className="w-8 h-8 text-neutral-950" />
          </div>
          <div>
            <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.25em] mb-1">Renda Mensal Combinada</p>
            <p className="text-white font-display font-bold text-4xl tracking-tighter">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        
        <button 
          onClick={handleSaveAll} 
          disabled={isSyncing || localSaving} 
          className={`w-full md:w-auto min-w-[280px] flex items-center justify-center space-x-3 px-12 py-8 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] transition-all active:scale-95 ${
            isSyncing || localSaving 
              ? 'bg-emerald-500 text-white animate-pulse cursor-wait' 
              : 'bg-primary text-neutral-950 shadow-glow hover:bg-yellow-300'
          }`}
        >
          {isSyncing || localSaving ? (
            <><Loader2 className="animate-spin" size={20} /><span>Sincronizando...</span></>
          ) : (
            <><Save size={20} /><span>Salvar na Nuvem</span></>
          )}
        </button>
      </div>

      <div className="pt-4 pb-12">
        <button onClick={onLogout} className="w-full flex items-center justify-center space-x-3 px-8 py-6 border-2 border-red-500/20 text-red-500 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-red-500/5 transition-all">
          <LogOut size={18} /><span>Encerrar Sessão do Casal</span>
        </button>
      </div>
    </div>
  );
};
