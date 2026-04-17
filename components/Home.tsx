
import React, { useState, useEffect } from 'react';
import { Transaction, Goal, User, AppTab, ShoppingItem } from '../types';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Heart,
  Clock,
  ShieldCheck,
  ChevronRight,
  ShoppingCart,
  Zap,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface HomeProps {
  transactions: Transaction[];
  goals: Goal[];
  shoppingItems: ShoppingItem[];
  users: { A: User; B: User };
  familyName: string;
  onNavigate: (tab: AppTab) => void;
  onOpenAddModal: () => void;
}

const PremiumLogo = ({ className = "" }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse"></div>
    <div className="relative w-16 h-16 xs:w-20 xs:h-20 bg-neutral-900 border-2 border-primary/30 rounded-[1.5rem] xs:rounded-[2rem] flex items-center justify-center shadow-glow overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent group-hover:opacity-100 transition-opacity"></div>
      <Heart size={32} className="text-primary logo-glow transform group-hover:scale-110 transition-transform" fill="currentColor" strokeWidth={0} />
    </div>
  </div>
);

export const Home: React.FC<HomeProps> = ({ 
  transactions, 
  goals, 
  shoppingItems,
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

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Widget Data
  const todayStr = now.toLocaleDateString('pt-BR');
  const spentToday = transactions
    .filter(t => t.date === todayStr && t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingTransactions = transactions
    .filter(t => t.type === 'expense' && !t.isPaid && !t.isFixed)
    .sort((a, b) => {
      const [da, ma, ya] = a.date.split('/').map(Number);
      const [db, mb, yb] = b.date.split('/').map(Number);
      return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
    });
  
  const nextBill = pendingTransactions[0];
  
  const shoppingCount = shoppingItems.filter(i => !i.completed).length;

  const closestGoal = [...goals]
    .filter(g => g.currentAmount < g.targetAmount)
    .sort((a, b) => (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount))[0];

  const formattedDate = now.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
  const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6 xs:space-y-8 animate-slide-up pb-24 px-1 sm:px-0">
      <div className="flex flex-col items-center justify-center text-center space-y-4 xs:space-y-6 px-1 pt-4">
        <PremiumLogo />
        <div className="space-y-2">
          <p className="text-[10px] xs:text-xs font-black text-neutral-500 uppercase tracking-[0.4em] italic">
            SINCRONIZAÇÃO EM TEMPO REAL
          </p>
          <h2 className="text-3xl xs:text-4xl md:text-6xl font-display font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic leading-none truncate max-w-[320px] md:max-w-none">
            {familyName.split(' ')[0]} <span className="text-primary">SINC</span>
          </h2>
          <div className="flex items-center justify-center space-x-3 mt-4">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">{formattedDate}</p>
            <span className="text-neutral-300 dark:text-neutral-800 opacity-30">|</span>
            <div className="flex items-center space-x-2">
              <Clock size={12} className="text-primary animate-pulse" />
              <p className="text-[10px] font-black text-neutral-600 dark:text-neutral-400 uppercase tracking-widest tabular-nums">{formattedTime}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative group overflow-hidden bg-neutral-950 rounded-[2.5rem] xs:rounded-[3rem] p-8 xs:p-10 md:p-16 shadow-2xl transition-all border border-neutral-800 mx-1">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 blur-[120px] rounded-full -mr-40 -mt-40"></div>
        <div className="relative z-10 space-y-6 xs:space-y-8 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-3">
             <ShieldCheck size={14} className="text-primary" />
             <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">Fluxo de Caixa Real</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 xs:gap-8">
            <div className="space-y-2">
              <p className="text-neutral-400 text-xs xs:text-sm font-black uppercase tracking-[0.2em]">Saldo Livre (Estimado)</p>
              <div className="flex items-baseline justify-center md:justify-start space-x-2 xs:space-x-3">
                <span className="text-xl xs:text-2xl font-black text-primary italic shrink-0">R$</span>
                <h3 className="text-4xl xs:text-5xl sm:text-6xl md:text-8xl font-display font-black text-white tracking-tighter italic tabular-nums leading-none truncate">
                  {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('dashboard')}
              className="flex items-center justify-center space-x-3 bg-white/5 border border-white/10 px-8 py-5 rounded-2xl transition-all active:scale-95 group/btn hover:bg-white/10"
            >
              <TrendingUp size={18} className="text-primary group-hover/btn:translate-x-1 transition-transform" />
              <span className="text-xs font-black text-white uppercase tracking-widest italic">EXTRATO</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid corrigida sem props inválidas */}
      <div className="grid grid-cols-3 gap-3 xs:gap-4 px-1 sm:px-2">
        <QuickActionCircle icon={<Plus size={28} strokeWidth={3} />} label="NOVO" color="bg-primary text-neutral-950" onClick={onOpenAddModal} />
        <QuickActionCircle icon={<ShoppingCart size={24} />} label="COMPRA" color="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800" onClick={() => onNavigate('shopping')} />
        <QuickActionCircle icon={<Target size={24} />} label="METAS" color="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800" onClick={() => onNavigate('goals')} />
      </div>

      <div className="space-y-4 px-1 pb-4">
        <div className="flex items-center space-x-3 px-2">
           <Zap size={14} className="text-primary" />
           <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">Widgets Inteligentes</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Widget 
            title="Hoje" 
            value={`R$ ${spentToday.toLocaleString('pt-BR')}`} 
            icon={<Calendar size={16} />} 
            subtitle="gastos do dia"
            color="border-primary/20 bg-primary/5"
            onClick={() => onNavigate('dashboard')}
          />
          <Widget 
            title="Compras" 
            value={shoppingCount} 
            icon={<ShoppingCart size={16} />} 
            subtitle="itens na lista"
            color="border-amber-500/20 bg-amber-500/5"
            onClick={() => onNavigate('shopping')}
          />
          <Widget 
            title="Meta Próxima" 
            value={closestGoal ? `${Math.round((closestGoal.currentAmount / closestGoal.targetAmount) * 100)}%` : '---'} 
            icon={<Target size={16} />} 
            subtitle={closestGoal ? closestGoal.title : 'sem metas ativas'}
            color="border-emerald-500/20 bg-emerald-500/5"
            onClick={() => onNavigate('goals')}
          />
          <Widget 
            title="Próxima Conta" 
            value={nextBill ? `R$ ${nextBill.amount.toLocaleString()}` : '---'} 
            icon={<AlertCircle size={16} />} 
            subtitle={nextBill ? nextBill.title : 'tudo em dia!'}
            color="border-neutral-200 dark:border-neutral-800 bg-white/5"
            onClick={() => onNavigate('dashboard')}
          />
        </div>
      </div>
    </div>
  );
};

const Widget = ({ title, value, icon, subtitle, color, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col p-5 rounded-[2rem] border transition-all active:scale-95 text-left space-y-3 group ${color}`}>
    <div className="flex items-center justify-between">
      <div className="p-2 rounded-xl bg-white/10 text-primary group-hover:bg-primary group-hover:text-neutral-950 transition-colors">
        {icon}
      </div>
      <ChevronRight size={14} className="text-neutral-500 group-hover:translate-x-1 transition-transform" />
    </div>
    <div>
      <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest leading-none mb-1">{title}</p>
      <h4 className="text-xl xs:text-2xl font-display font-black text-neutral-900 dark:text-white leading-tight italic">{value}</h4>
      <p className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest mt-1.5 truncate">{subtitle}</p>
    </div>
  </button>
);

const QuickActionCircle = ({ icon, label, color, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center space-y-3 xs:space-y-4 group w-full">
    <div className={`w-full aspect-square rounded-[1.8rem] xs:rounded-[2.5rem] flex items-center justify-center shadow-lg active:scale-90 transition-all border border-transparent group-hover:border-primary/50 ${color}`}>
      {React.cloneElement(icon, { className: "w-7 h-7 xs:w-9 xs:h-9" })}
    </div>
    <span className="text-[11px] xs:text-xs font-black text-neutral-500 uppercase tracking-widest group-hover:text-primary transition-colors text-center truncate w-full italic">{label}</span>
  </button>
);
