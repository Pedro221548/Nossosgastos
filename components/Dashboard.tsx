
import React, { useMemo } from 'react';
import { Transaction, User } from '../types';
import { 
  Calendar, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  CircleDashed
} from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  totalIncome: number;
  currentDate: Date;
  users: { A: User; B: User };
  alertThreshold: number;
  onMonthChange: (direction: 'prev' | 'next') => void;
  onDelete: (id: string) => void;
  onTogglePaid: (id: string, monthKey?: string) => void;
  onEdit: (tx: Transaction) => void;
  onClearAll: () => void;
  onOpenShopping: () => void;
  onOpenAddModal: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  transactions, 
  totalIncome: baseIncome, 
  currentDate,
  onMonthChange,
  onDelete, 
  onTogglePaid, 
  onEdit
}) => {
  const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
  const monthLabel = currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  const filteredList = useMemo(() => {
    return transactions.filter(t => {
      const [day, month, year] = t.date.split('/').map(Number);
      const tDate = new Date(year, month - 1, day);
      const isCurrentMonth = tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear();
      const isFixedAndRelevant = t.isFixed && (tDate.getFullYear() < currentDate.getFullYear() || (tDate.getFullYear() === currentDate.getFullYear() && tDate.getMonth() <= currentDate.getMonth()));
      return isCurrentMonth || isFixedAndRelevant;
    }).sort((a, b) => a.amount - b.amount);
  }, [transactions, currentDate]);

  const stats = useMemo(() => {
    const expenses = filteredList.filter(t => t.type === 'expense');
    const revenues = filteredList.filter(t => t.type === 'revenue');
    const totalExtraRevenue = revenues.reduce((acc, t) => acc + t.amount, 0);
    const effectiveIncome = baseIncome + totalExtraRevenue;
    const paidExpenses = expenses.filter(t => t.isFixed ? t.paidMonths?.includes(currentMonthKey) : t.isPaid)
                                .reduce((acc, t) => acc + t.amount, 0);
    const pendingExpenses = expenses.filter(t => t.isFixed ? !t.paidMonths?.includes(currentMonthKey) : !t.isPaid)
                                   .reduce((acc, t) => acc + t.amount, 0);

    return {
      income: effectiveIncome,
      paid: paidExpenses,
      pending: pendingExpenses,
      balance: effectiveIncome - paidExpenses
    };
  }, [filteredList, baseIncome, currentMonthKey]);

  return (
    <div className="space-y-6 md:space-y-8 animate-slide-up text-left max-w-2xl mx-auto px-1 sm:px-0 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 sm:px-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 shadow-glow shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">Extrato Mensal</h2>
            <span className="text-lg xs:text-xl md:text-2xl font-display font-black text-neutral-900 dark:text-white uppercase italic tracking-tighter leading-none block truncate">{monthLabel}</span>
          </div>
        </div>
        <div className="flex items-center bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-1 shadow-xl sm:w-auto w-full justify-between sm:justify-start">
          <button onClick={() => onMonthChange('prev')} className="p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all active:scale-90 flex-1 sm:flex-none flex justify-center"><ChevronLeft size={18} /></button>
          <div className="w-px h-6 bg-neutral-100 dark:border-neutral-800 mx-1" />
          <button onClick={() => onMonthChange('next')} className="p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all active:scale-90 flex-1 sm:flex-none flex justify-center"><ChevronRight size={18} /></button>
        </div>
      </div>
      
      <div className="bg-neutral-950 border border-neutral-800 rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden group mx-1 sm:mx-0">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[80px] rounded-full -mr-24 -mt-24"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.3em] mb-1">Saldo Projetado</p>
            <div className="flex items-baseline space-x-1.5 xs:space-x-2">
              <span className="text-lg xs:text-xl font-black text-primary italic shrink-0">R$</span>
              <h2 className={`text-2xl xs:text-3xl sm:text-4xl md:text-6xl font-display font-black tracking-tighter italic tabular-nums leading-none truncate ${stats.balance < 0 ? 'text-red-500' : 'text-white'}`}>
                {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 min-w-[140px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
               <span className="text-[7px] font-black text-neutral-500 uppercase tracking-widest sm:mb-0 mb-0.5">A Pagar</span>
               <span className="text-[10px] xs:text-xs font-black text-amber-500 tabular-nums">R$ {stats.pending.toLocaleString()}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
               <span className="text-[7px] font-black text-emerald-500/60 uppercase tracking-widest sm:mb-0 mb-0.5">Pagos</span>
               <span className="text-[10px] xs:text-xs font-black text-emerald-500 tabular-nums">R$ {stats.paid.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.3em]">Detalhamento</h3>
          <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">{filteredList.length} Itens</span>
        </div>
        <div className="space-y-3 px-1 sm:px-0">
          {filteredList.map((tx) => {
            const isActuallyPaid = tx.isFixed ? (tx.paidMonths?.includes(currentMonthKey) ?? false) : tx.isPaid;
            return (
              <div 
                key={tx.id} 
                className={`group relative bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[1.8rem] p-4 xs:p-5 transition-all duration-300 shadow-sm overflow-hidden ${isActuallyPaid ? 'bg-neutral-50/50 dark:bg-neutral-900/40' : ''}`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${isActuallyPaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                
                <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-3 sm:gap-4">
                  <div className="flex items-center space-x-3 md:space-x-4 min-w-0 flex-1">
                    <div className={`w-10 h-10 xs:w-12 xs:h-12 rounded-2xl flex items-center justify-center text-lg xs:text-xl transition-all shrink-0 ${isActuallyPaid ? 'bg-emerald-500/5 text-emerald-500/50' : 'bg-neutral-100 dark:bg-neutral-950 text-neutral-400 group-hover:text-primary shadow-inner'}`}>
                      {tx.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className={`text-sm xs:text-base font-display font-black uppercase italic tracking-tighter leading-tight truncate mb-1 ${isActuallyPaid ? 'text-neutral-500 line-through decoration-emerald-500/30' : 'text-neutral-900 dark:text-white'}`}>
                        {tx.title}
                      </h4>
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="text-[7px] font-black text-neutral-400 uppercase tracking-widest truncate">{tx.category}</span>
                        <span className="text-neutral-200 dark:text-neutral-800 opacity-30">|</span>
                        <span className="text-[7px] font-black text-neutral-400 uppercase tracking-widest flex items-center truncate">
                          {tx.isFixed ? <Clock className="w-2.5 h-2.5 mr-1 shrink-0" /> : null}
                          {tx.isFixed ? 'FIXO' : tx.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row xs:flex-col items-center xs:items-end justify-between xs:justify-start gap-2 sm:gap-3 shrink-0">
                    <p className={`text-base xs:text-lg md:text-xl font-display font-black tracking-tighter italic tabular-nums leading-none ${tx.type === 'revenue' ? 'text-emerald-500' : isActuallyPaid ? 'text-neutral-500' : 'text-neutral-900 dark:text-white'}`}>
                      <span className="text-[9px] mr-0.5 opacity-40 italic">R$</span>
                      {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center space-x-1">
                       <button 
                        onClick={() => onTogglePaid(tx.id, tx.isFixed ? currentMonthKey : undefined)} 
                        className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-full border transition-all active:scale-90 ${
                          isActuallyPaid 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-black' 
                            : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:border-primary hover:text-primary'
                        }`}
                       >
                         {isActuallyPaid ? <CheckCircle2 className="w-2.5 h-2.5" strokeWidth={3} /> : <CircleDashed className="w-2.5 h-2.5" />}
                         <span className="text-[7px] font-black uppercase tracking-widest">{isActuallyPaid ? 'PAGO' : 'PEND'}</span>
                       </button>
                       <div className="flex bg-neutral-950 rounded-full border border-neutral-800 p-0.5 shadow-inner">
                          <button onClick={() => onEdit(tx)} className="p-1.5 text-neutral-500 hover:text-primary transition-colors active:scale-90"><Edit3 className="w-3 h-3" /></button>
                          <button onClick={() => onDelete(tx.id)} className="p-1.5 text-neutral-500 hover:text-red-500 transition-colors active:scale-90"><Trash2 className="w-3 h-3" /></button>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredList.length === 0 && (
            <div className="py-20 text-center bg-neutral-950/20 rounded-[2rem] border-2 border-dashed border-neutral-800 mx-1">
              <p className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.4em] italic">Nenhum lançamento</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
