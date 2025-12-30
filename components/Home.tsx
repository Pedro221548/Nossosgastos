
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
  ShieldCheck,
  ChevronRight,
  Share2
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
    <div className="relative w-12 h-12 md:w-14 md:h-14 bg-neutral-900 border-2 border-primary/30 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center shadow-glow overflow-hidden">
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
  const monthKey = `${currentYear}-${currentMonth + 1}`;

  const currentMonthTransactions = transactions.filter(t => {
    const [d, m, y] = t.date.split('/').map(Number);
    return (m === currentMonth + 1 && y === currentYear) || (t.isFixed);
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

  const handleShareWhatsApp = () => {
    const monthName = now.toLocaleString('pt-BR', { month: 'long' });
    const message = `📊 *Resumo Financeiro - ${familyName}*\n` +
      `📅 Mês: ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}\n\n` +
      `💰 *Saldo Real:* R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `📈 *Ganhos:* R$ ${totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n` +
      `💸 *Gastos Pagos:* R$ ${paidExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n\n` +
      `Sincronizado via *Nossa Carteira* 🚀`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-slide-up pb-24 md:pb-0 px-2 sm:px-0">
      <div className="flex flex-col items-center justify-center text-center space-y-4 md:space-y-5 pt-2">
        <PremiumLogo />
        <div className="space-y-1 px-4">
          <div className="flex items-center justify-center space-x-2">
            <span className="h-px w-4 sm:w-6 bg-neutral-200 dark:bg-neutral-800"></span>
            <p className="text-[9px] md:text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] italic">
              {now.getHours() < 12 ? 'BOM DIA' : now.getHours() < 18 ? 'BOA TARDE' : 'BOA NOITE'}
            </p>
            <span className="h-px w-4 sm:w-6 bg-neutral-200 dark:bg-neutral-800"></span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic leading-tight">
            {familyName.split(' ')[0]} <span className="text-primary italic">Sinc</span>
          </h2>
          <div className="flex items-center justify-center space-x-2 mt-1">
            <p className="text-[8px] md:text-[9px] font-black text-neutral-500 uppercase tracking-[0.2em]">{formattedDate}</p>
            <span className="text-neutral-300 dark:text-neutral-800 opacity-30">|</span>
            <div className="flex items-center space-x-1.5">
              <Clock size={10} className="text-primary animate-pulse" />
              <p className="text-[8px] md:text-[9px] font-black text-neutral-600 dark:text-neutral-400 uppercase tracking-widest tabular-nums">{formattedTime}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative group overflow-hidden bg-neutral-950 rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-8 md:p-12 shadow-2xl transition-all border border-neutral-800 mx-1 sm:mx-0">
        <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-primary/5 blur-[80px] md:blur-[100px] rounded-full -mr-24 -mt-24"></div>
        <div className="relative z-10 space-y-4 md:space-y-8 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-between">
            <div className="flex items-center space-x-2 bg-white/5 md:bg-transparent px-3 py-1 md:p-0 rounded-full">
               <ShieldCheck size={12} className="text-primary" />
               <span className="text-[8px] md:text-[9px] font-black text-neutral-500 uppercase tracking-[0.3em]">Saldo Real (Líquido)</span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-5">
            <div className="space-y-1">
              <p className="text-neutral-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Fluxo Disponível Hoje</p>
              <div className="flex items-baseline justify-center md:justify-start space-x-2">
                <span className="text-lg md:text-xl font-black text-primary italic">R$</span>
                <h3 className="text-4xl xs:text-5xl md:text-7xl font-display font-black text-white tracking-tighter italic tabular-nums leading-none">
                  {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => onNavigate('dashboard')}
                className="flex-1 flex items-center justify-center space-x-3 bg-white/5 border border-white/10 px-5 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-[1.5rem] transition-all active:scale-95 group/btn"
              >
                <TrendingUp size={16} className="text-primary group-hover/btn:translate-x-1 transition-transform" />
                <span className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest italic">Ver Extrato</span>
              </button>
              <button 
                onClick={handleShareWhatsApp}
                className="flex-1 flex items-center justify-center space-x-3 bg-emerald-500/10 border border-emerald-500/20 px-5 py-3 md:px-6 md:py-4 rounded-2xl md:rounded-[1.5rem] transition-all active:scale-95 group/share"
              >
                <Share2 size={16} className="text-emerald-500 group-hover/share:scale-110 transition-transform" />
                <span className="text-[9px] md:text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Compartilhar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 md:gap-4 px-1 sm:px-0">
        <QuickActionCircle icon={<Plus size={24} strokeWidth={3} />} label="Novo" color="bg-primary text-neutral-950" onClick={onOpenAddModal} />
        <QuickActionCircle icon={<ShoppingCart size={22} />} label="Lista" color="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800" onClick={() => onNavigate('shopping')} />
        <QuickActionCircle icon={<Target size={22} />} label="Metas" color="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800" onClick={() => onNavigate('goals')} />
        <QuickActionCircle icon={<Zap size={22} />} label="Alexa" color="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800" onClick={() => onNavigate('alexa')} />
      </div>
    </div>
  );
};

const QuickActionCircle = ({ icon, label, color, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center space-y-2 md:space-y-3 group w-full">
    <div className={`w-14 h-14 xs:w-16 xs:h-16 rounded-2xl xs:rounded-[1.8rem] flex items-center justify-center shadow-lg active:scale-90 transition-all border border-transparent group-hover:border-primary/50 ${color}`}>
      {icon}
    </div>
    <span className="text-[8px] md:text-[9px] font-black text-neutral-500 uppercase tracking-widest group-hover:text-primary transition-colors text-center">{label}</span>
  </button>
);
