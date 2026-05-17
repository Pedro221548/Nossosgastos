
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
  onUpdateUser: (userId: string, data: Partial<User>) => void;
}

const PremiumLogo = ({ className = "" }: { className?: string }) => (
  <div className={`relative flex items-center justify-center ${className}`}>
    <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full"></div>
    <div className="relative w-14 h-14 bg-white/5 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full flex items-center justify-center shadow-lg group backdrop-blur-md">
      <Heart size={24} className="text-primary transform group-hover:scale-105 transition-transform" strokeWidth={1.5} />
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
  onOpenAddModal,
  onUpdateUser
}) => {
  const [now, setNow] = useState(new Date());
  const [editingBalance, setEditingBalance] = useState<{ userId: string; value: string } | null>(null);

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
    let refMonth = m - 1;
    let refYear = y;
    if (t.referenceMonth) {
       const [ry, rm] = t.referenceMonth.split('-');
       refYear = Number(ry);
       refMonth = Number(rm) - 1;
    }
    return refMonth === currentMonth && refYear === currentYear || (t.isFixed);
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
      const getRefDate = (tx: Transaction) => {
        let rm = Number(tx.date.split('/')[1]) - 1;
        let ry = Number(tx.date.split('/')[2]);
        if (tx.referenceMonth) {
           ry = Number(tx.referenceMonth.split('-')[0]);
           rm = Number(tx.referenceMonth.split('-')[1]) - 1;
        }
        return new Date(ry, rm, Number(tx.date.split('/')[0])).getTime();
      };
      return getRefDate(a) - getRefDate(b);
    });
  
  const nextBill = pendingTransactions[0];
  
  const shoppingCount = shoppingItems.filter(i => !i.completed).length;

  const closestGoal = [...goals]
    .filter(g => g.currentAmount < g.targetAmount)
    .sort((a, b) => (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount))[0];

  const totalBankBalance = (users.A.currentBalance || 0) + (users.B.currentBalance || 0);

  const billsToPay = currentMonthTransactions
    .filter(t => t.type === 'expense' && !(t.isFixed ? t.paidMonths?.includes(monthKey) : t.isPaid))
    .sort((a, b) => b.amount - a.amount); // Prioritize larger bills for recommendation

  let tempBalance = totalBankBalance;
  const recommendedBills = [];
  for (const bill of billsToPay) {
    if (tempBalance >= bill.amount) {
      recommendedBills.push(bill);
      tempBalance -= bill.amount;
    }
  }

  const handleBalanceUpdate = (userId: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    onUpdateUser(userId, { currentBalance: numericValue });
    setEditingBalance(null);
  };

  const formattedDate = now.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();
  const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-8 xs:space-y-10 animate-slide-up pb-24 px-1 sm:px-0">
      <div className="flex flex-col items-center justify-center text-center space-y-5 px-1 pt-6">
        <PremiumLogo />
        <div className="space-y-2">
          <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-[0.4em]">
            Visão Compartilhada
          </p>
          <h2 className="text-3xl md:text-4xl font-sans font-light text-neutral-900 dark:text-white uppercase tracking-widest leading-none truncate max-w-[320px] md:max-w-none">
            {familyName.split(' ')[0]} <span className="font-semibold text-primary">SINC</span>
          </h2>
          <div className="flex items-center justify-center space-x-4 mt-6">
            <p className="text-[10px] font-medium text-neutral-500 uppercase tracking-[0.2em]">{formattedDate}</p>
            <span className="text-neutral-300 dark:text-neutral-800 opacity-30">|</span>
            <div className="flex items-center space-x-2">
              <Clock size={12} className="text-primary" />
              <p className="text-[10px] font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-widest tabular-nums">{formattedTime}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative group overflow-hidden bg-white dark:bg-neutral-900/40 rounded-[2rem] pt-10 pb-12 px-8 xs:px-10 md:px-16 shadow-lg border border-neutral-100 dark:border-neutral-800/80 backdrop-blur-md mx-1">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -mr-40 -mt-40 pointer-events-none"></div>
        <div className="relative z-10 space-y-8 md:space-y-12 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center md:justify-start space-x-3">
                 <ShieldCheck size={14} className="text-primary" />
                 <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-[0.3em]">Fluxo de Caixa Real</span>
              </div>
              <div className="flex items-baseline justify-center md:justify-start space-x-3">
                <span className="text-xl xs:text-2xl font-light text-primary shrink-0 opacity-80">R$</span>
                <h3 className="text-4xl xs:text-5xl sm:text-6xl md:text-[5.5rem] font-sans font-light text-neutral-900 dark:text-white tracking-tight tabular-nums leading-none truncate">
                  {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h3>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('dashboard')}
              className="flex items-center justify-center space-x-3 border border-neutral-200 dark:border-neutral-800 px-8 py-4 rounded-full transition-all active:scale-95 group/btn hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
            >
              <TrendingUp size={16} className="text-primary group-hover/btn:translate-x-1 transition-transform" />
              <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest">Acessar Extrato</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-1 sm:px-2">
        {/* Pedro's Balance */}
        <div className="bg-white/60 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] p-8 space-y-6 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700">
                <img src={users.A.avatar} alt={users.A.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest">{users.A.name}</span>
            </div>
            <ShieldCheck size={16} className="text-primary opacity-60" />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-[0.2em]">Saldo em Conta</p>
            {editingBalance?.userId === users.A.id ? (
              <input 
                autoFocus
                type="number"
                defaultValue={users.A.currentBalance}
                onBlur={(e) => handleBalanceUpdate(users.A.id, e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBalanceUpdate(users.A.id, (e.target as HTMLInputElement).value)}
                className="w-full bg-white dark:bg-neutral-950 border border-primary/50 shadow-inner rounded-xl px-4 py-3 text-2xl font-light text-neutral-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            ) : (
              <h4 
                onClick={() => setEditingBalance({ userId: users.A.id, value: (users.A.currentBalance || 0).toString() })}
                className="text-3xl font-light text-neutral-900 dark:text-white leading-none cursor-pointer hover:text-primary transition-colors tabular-nums"
              >
                <span className="text-lg opacity-40 mr-1 font-normal">R$</span>{(users.A.currentBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h4>
            )}
          </div>
        </div>

        {/* Emilly's Balance */}
        <div className="bg-white/60 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-[2rem] p-8 space-y-6 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700">
                <img src={users.B.avatar} alt={users.B.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-widest">{users.B.name}</span>
            </div>
            <ShieldCheck size={16} className="text-blue-500 opacity-60" />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-[0.2em]">Saldo em Conta</p>
            {editingBalance?.userId === users.B.id ? (
              <input 
                autoFocus
                type="number"
                defaultValue={users.B.currentBalance}
                onBlur={(e) => handleBalanceUpdate(users.B.id, e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBalanceUpdate(users.B.id, (e.target as HTMLInputElement).value)}
                className="w-full bg-white dark:bg-neutral-950 border border-blue-500/50 shadow-inner rounded-xl px-4 py-3 text-2xl font-light text-neutral-900 dark:text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            ) : (
              <h4 
                onClick={() => setEditingBalance({ userId: users.B.id, value: (users.B.currentBalance || 0).toString() })}
                className="text-3xl font-light text-neutral-900 dark:text-white leading-none cursor-pointer hover:text-blue-500 transition-colors tabular-nums"
              >
                <span className="text-lg opacity-40 mr-1 font-normal">R$</span>{(users.B.currentBalance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h4>
            )}
          </div>
        </div>
      </div>

      {totalBankBalance > 0 && recommendedBills.length > 0 && (
        <div className="relative group overflow-hidden bg-emerald-500/5 dark:bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 p-8 mx-1 animate-slide-up">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-[80px] rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-3">
               <Zap size={14} className="text-emerald-500" />
               <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.3em]">Recomendação do Casal</span>
            </div>
            <div className="space-y-4">
              <p className="text-neutral-600 dark:text-neutral-400 text-[11px] font-bold uppercase tracking-widest">
                Com os <span className="text-emerald-500">R$ {totalBankBalance.toLocaleString('pt-BR')}</span> combinados de vocês, dá para pagar:
              </p>
              <div className="flex flex-wrap gap-2">
                {recommendedBills.map(bill => (
                  <div key={bill.id} className="bg-white dark:bg-neutral-800 border border-emerald-500/20 px-3 py-2 rounded-xl flex items-center space-x-2 shadow-sm">
                    <span className="text-lg">{bill.emoji}</span>
                    <span className="text-[10px] font-bold text-neutral-900 dark:text-white uppercase truncate max-w-[100px]">{bill.title}</span>
                    <span className="text-[10px] font-black text-emerald-500 tabular-nums">R$ {bill.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-emerald-500/10">
                <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest italic">Total sugerido: R$ {recommendedBills.reduce((acc, b) => acc + b.amount, 0).toLocaleString('pt-BR')}</p>
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className="text-[9px] font-black text-emerald-600 underline uppercase tracking-widest"
                >Ir para Extrato</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid corrigida sem props inválidas */}
      <div className="grid grid-cols-3 gap-3 xs:gap-4 px-1 sm:px-2">
        <QuickActionCircle icon={<Plus size={28} strokeWidth={3} />} label="NOVO" color="bg-primary text-neutral-950" onClick={onOpenAddModal} />
        <QuickActionCircle icon={<ShoppingCart size={24} />} label="COMPRA" color="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800" onClick={() => onNavigate('shopping')} />
        <QuickActionCircle icon={<Target size={24} />} label="METAS" color="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800" onClick={() => onNavigate('goals')} />
      </div>

      {/* Ad Space */}
      <div className="bg-neutral-100/50 dark:bg-neutral-900/50 border-2 border-dashed border-neutral-300 dark:border-neutral-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-2 opacity-70 mb-8 mx-1 min-h-[120px]">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Espaço para Anúncio</span>
        <span className="text-xs text-neutral-500 dark:text-neutral-500 font-bold">Coloque o seu bloco aqui (ex: AdSense 320x100)</span>
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
  <button onClick={onClick} className={`flex flex-col p-6 rounded-[2rem] border transition-all active:scale-95 text-left space-y-4 group bg-white/40 dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 backdrop-blur-sm hover:shadow-md`}>
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-xl text-neutral-600 dark:text-neutral-400 group-hover:bg-neutral-100 dark:group-hover:bg-neutral-800 transition-colors`}>
        {icon}
      </div>
      <ChevronRight size={14} className="text-neutral-400 group-hover:translate-x-1 transition-transform" />
    </div>
    <div>
      <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest leading-none mb-1.5">{title}</p>
      <h4 className="text-xl xs:text-2xl font-sans font-light text-neutral-900 dark:text-white leading-tight mb-1">{value}</h4>
      <p className="text-[9px] font-medium text-neutral-500 uppercase tracking-wider truncate">{subtitle}</p>
    </div>
  </button>
);

const QuickActionCircle = ({ icon, label, color, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center space-y-3 xs:space-y-4 group w-full">
    <div className={`w-full aspect-square rounded-[2rem] flex items-center justify-center shadow-sm active:scale-90 transition-all border border-neutral-200 dark:border-neutral-800 group-hover:border-neutral-300 dark:group-hover:border-neutral-700 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm`}>
      <div className="text-neutral-700 dark:text-neutral-300 group-hover:text-primary transition-colors">
        {React.cloneElement(icon, { className: "w-6 h-6 xs:w-8 xs:h-8", strokeWidth: 1.5 })}
      </div>
    </div>
    <span className="text-[10px] xs:text-[11px] font-semibold text-neutral-500 uppercase tracking-widest group-hover:text-primary transition-colors text-center w-full">{label}</span>
  </button>
);
