
import React, { useState, useEffect } from 'react';
import { Transaction, Goal, User, AppTab } from '../types';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Heart,
  Clock,
  ShieldCheck,
  ChevronRight,
  ShoppingCart,
  Zap
} from 'lucide-react';

interface HomeProps {
  transactions: Transaction[];
  goals: Goal[];
  users: { A: User; B: User };
  familyName: string;
  onNavigate: (tab: AppTab) => void;
  onOpenAddModal: () => void;
}

const PremiumLogo = ({ className = "" }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
    <div className="relative w-12 h-12 xs:w-14 xs:h-14 bg-neutral-900 border-2 border-primary/30 rounded-[1.2rem] xs:rounded-[1.5rem] flex items-center justify-center shadow-glow overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
      <Heart size={24} className="text-primary logo-glow" fill="currentColor" strokeWidth={0} />
    </div>
  </div>
);

export const Home: React.FC<HomeProps> = ({ 
  transactions, 
  goals, 
  users, 
  familyName, 
  onNavigate, 
  onOpenAddModal 
}) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthKey = `${currentYear}-${currentMonth + 1}`;

  const currentMonthTransactions = transactions.filter(t => {
    const [d, m, y] = t.date.split('/').map(Number);
    return m === currentMonth + 1 && y === currentYear || (t.isFixed);
  });

  const totalIncome = users.A.income + users.B.income + currentMonthTransactions
    .filter(t => t.type === 'revenue')
    .reduce((acc, t) => acc + t.amount, 0);

  const paidExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .filter(t => t.isFixed ? t.paidMonths?.includes(monthKey) : t.isPaid)
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - paidExpenses;

  const formattedDate = now.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
  const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6 xs:space-y-8 animate-slide-up pb-24 px-1 sm:px-0">
      <div className="flex flex-col items-center justify-center text-center space-y-3 xs:space-y-4 px-1 pt-2">
        <PremiumLogo />
        <div className="space-y-1">
          <p className="text-[8px] xs:text-[9px] font-black text-neutral-400 uppercase tracking-[0.4em] italic">
            SINCRONIZAÇÃO EM TEMPO REAL
          </p>
          <h2 className="text-2xl xs:text-3xl md:text-4xl font-display font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic leading-none truncate max-w-[280px]">
            {familyName.split(' ')[0]} <span className="text-primary">SINC</span>
          </h2>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <p className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.2em]">{formattedDate}</p>
            <span className="text-neutral-300 dark:text-neutral-800 opacity-30">|</span>
            <div className="flex items-center space-x-1.5">
              <Clock size={10} className="text-primary animate-pulse" />
              <p className="text-[8px] font-black text-neutral-600 dark:text-neutral-400 uppercase tracking-widest tabular-nums">{formattedTime}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative group overflow-hidden bg-neutral-950 rounded-[2.2rem] xs:rounded-[2.5rem] p-6 xs:p-8 md:p-12 shadow-2xl transition-all border border-neutral-800 mx-1">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10 space-y-4 xs:space-y-6 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-2">
             <ShieldCheck size={10} className="text-primary" />
             <span className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.3em]">Fluxo de Caixa Real</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 xs:gap-5">
            <div className="space-y-1">
              <p className="text-neutral-400 text-[9px] xs:text-[10px] font-black uppercase tracking-[0.2em]">Disponível Líquido</p>
              <div className="flex items-baseline justify-center md:justify-start space-x-1.5 xs:space-x-2">
                <span className="text-base xs:text-lg font-black text-primary italic shrink-0">R$</span>
                <h3 className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl font-display font-black text-white tracking-tighter italic tabular-nums leading-none truncate">
                  {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('dashboard')}
              className="flex items-center justify-center space-x-2.5 bg-white/5 border border-white/10 px-5 py-3.5 rounded-2xl transition-all active:scale-95 group/btn"
            >
              <TrendingUp size={14} className="text-primary group-hover/btn:translate-x-1 transition-transform" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest italic">EXTRATO</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid corrigida sem props inválidas */}
      <div className="grid grid-cols-4 gap-2 xs:gap-3 px-1 sm:px-2">
        <QuickActionCircle icon={<Plus size={24} strokeWidth={3} />} label="NOVO" color="bg-primary text-neutral-950" onClick={onOpenAddModal} />
        <QuickActionCircle icon={<ShoppingCart size={20} />} label="COMPRA" color="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800" onClick={() => onNavigate('shopping')} />
        <QuickActionCircle icon={<Target size={20} />} label="METAS" color="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800" onClick={() => onNavigate('goals')} />
        <QuickActionCircle icon={<Zap size={20} />} label="SINC" color="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800" onClick={() => onNavigate('mediator')} />
      </div>
    </div>
  );
};

const QuickActionCircle = ({ icon, label, color, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center space-y-2 xs:space-y-3 group w-full">
    <div className={`w-full aspect-square rounded-[1.2rem] xs:rounded-[1.8rem] flex items-center justify-center shadow-lg active:scale-90 transition-all border border-transparent group-hover:border-primary/30 ${color}`}>
      {icon}
    </div>
    <span className="text-[7px] xs:text-[8px] font-black text-neutral-500 uppercase tracking-widest group-hover:text-primary transition-colors text-center truncate w-full">{label}</span>
  </button>
);
