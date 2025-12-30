
import React, { useState, useEffect } from 'react';
import { Transaction, Goal, User, AppTab } from '../types';
import { 
  Zap, 
  ShoppingCart, 
  Target, 
  TrendingUp, 
  Plus, 
  Heart,
  Clock,
  ChevronRight as ChevronIcon,
  ShieldCheck
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
    <div className="relative w-14 h-14 bg-neutral-900 border-2 border-primary/30 rounded-[1.5rem] flex items-center justify-center shadow-glow overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
      <Heart size={28} className="text-primary logo-glow" fill="currentColor" strokeWidth={0} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-5 bg-neutral-900/40 rounded-full blur-[1px]"></div>
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

  const filteredTransactions = transactions.filter(t => {
    const [d, m, y] = t.date.split('/').map(Number);
    return m === currentMonth + 1 && y === currentYear;
  });

  const totalIncome = users.A.income + users.B.income + filteredTransactions.filter(t => t.type === 'revenue').reduce((acc, t) => acc + t.amount, 0);
  const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  const expensePercentage = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  const recentTransactions = [...transactions]
    .sort((a, b) => {
      const [da, ma, ya] = a.date.split('/').map(Number);
      const [db, mb, yb] = b.date.split('/').map(Number);
      return new Date(yb, mb - 1, db).getTime() - new Date(ya, ma - 1, da).getTime();
    })
    .slice(0, 3);

  const activeGoals = goals.filter(g => !g.isDeleted).slice(0, 2);

  const getGreeting = () => {
    const hour = now.getHours();
    if (hour >= 5 && hour < 12) return 'BOM DIA';
    if (hour >= 12 && hour < 18) return 'BOA TARDE';
    return 'BOA NOITE';
  };

  const formattedDate = now.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
  const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6 md:space-y-10 animate-slide-up pb-24">
      <div className="flex flex-col items-center justify-center text-center space-y-5 px-1 pt-2">
        <PremiumLogo />
        <div className="space-y-1">
          <div className="flex items-center justify-center space-x-2">
            <span className="h-px w-6 bg-neutral-200 dark:bg-neutral-800"></span>
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] italic">
              {getGreeting()}
            </p>
            <span className="h-px w-6 bg-neutral-200 dark:bg-neutral-800"></span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic leading-none">
            {familyName.split(' ')[0]} <span className="text-primary italic">Sinc</span>
          </h2>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <p className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em]">
              {formattedDate}
            </p>
            <span className="text-neutral-300 dark:text-neutral-800 opacity-30">|</span>
            <div className="flex items-center space-x-1.5">
              <Clock size={10} className="text-primary animate-pulse" />
              <p className="text-[9px] font-black text-neutral-600 dark:text-neutral-400 uppercase tracking-widest tabular-nums">
                {formattedTime}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative group overflow-hidden bg-neutral-950 rounded-[2.8rem] md:rounded-[3rem] p-7 md:p-12 shadow-2xl transition-all border border-neutral-800">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10 space-y-6 md:space-y-8 text-center md:text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
               <ShieldCheck size={12} className="text-primary" />
               <span className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.3em]">Backup Sincronizado</span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
            <div className="space-y-1">
              <p className="text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em]">Fluxo Disponível</p>
              <div className="flex items-baseline justify-center md:justify-start space-x-2">
                <span className="text-xl font-black text-primary italic">R$</span>
                <h3 className="text-5xl md:text-7xl font-display font-black text-white tracking-tighter italic">
                  {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('analytics')}
              className="flex items-center justify-center space-x-3 bg-white/5 border border-white/10 px-6 py-4 rounded-[1.5rem] transition-all active:scale-95 group/btn"
            >
              <TrendingUp size={16} className="text-primary group-hover/btn:translate-x-1 transition-transform" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Saúde de Dados</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 px-1">
        <QuickActionCircle icon={<Plus size={24} strokeWidth={3} />} label="Novo" color="bg-primary text-neutral-950" onClick={onOpenAddModal} />
        <QuickActionCircle icon={<ShoppingCart size={22} />} label="Lista" color="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800" onClick={() => onNavigate('shopping')} />
        <QuickActionCircle icon={<Target size={22} />} label="Metas" color="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800" onClick={() => onNavigate('goals')} />
        <QuickActionCircle icon={<TrendingUp size={22} />} label="Dados" color="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800" onClick={() => onNavigate('analytics')} />
      </div>
    </div>
  );
};

const QuickActionCircle = ({ icon, label, color, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center space-y-3 group">
    <div className={`w-15 h-15 md:w-16 md:h-16 rounded-[1.8rem] flex items-center justify-center shadow-lg active:scale-90 transition-all border border-transparent group-hover:border-primary/50 ${color}`}>
      {icon}
    </div>
    <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest group-hover:text-primary transition-colors">{label}</span>
  </button>
);
