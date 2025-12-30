
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
    }).sort((a, b) => {
      const [da, ma, ya] = a.date.split('/').map(Number);
      const [db, mb, yb] = b.date.split('/').map(Number);
      return new Date(yb, mb - 1, db).getTime() - new Date(ya, ma - 1, da).getTime();
    });
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
    <div className="space-y-6 md:space-y-8 animate-slide-up text-left max-w-2xl mx-auto px-1 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl md:rounded-[1.2rem] flex items-center justify-center text-primary border border-primary/20 shadow-glow shrink-0">
            <Calendar className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h2 className="text-[8px] md:text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] md:tracking-[0.3em]">Extrato Mensal</h2>
            <span className="text-xl md:text-2xl font-display font-black text-neutral-900 dark:text-white uppercase italic tracking-tighter leading-none">{monthLabel}</span>
          </div>
        </div>
        <div className="flex items-center bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl md:rounded-2xl p-1 shadow-xl sm:w-auto w-full justify-between sm:justify-start">
          <button onClick={() => onMonthChange('prev')} className="p-2 md:p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg md:rounded-xl transition-all active:scale-90 flex-1 sm:flex-none flex justify-center"><ChevronLeft size={18} /></button>
          <div className="w-px h-5 md:h-6 bg-neutral-100 dark:bg-neutral-800 mx-1" />
          <button onClick={() => onMonthChange('next')} className="p-2 md:p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg md:rounded-xl transition-all active:scale-90 flex-1 sm:flex-none flex justify-center"><ChevronRight size={18} /></button>
        </div>
      </div>
      
      <div className="bg-neutral-950 border border-neutral-800 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl relative overflow-hidden group mx-1 sm:mx-0">
        <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-primary/10 blur-[80px] md:blur-[100px] rounded-full -mr-24 -mt-24 transition-opacity group-hover:opacity-60"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-[8px] md:text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] md:tracking-[0.4em] mb-1">Saldo Líquido Disponível</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl md:text-2xl font-black text-primary italic">R$</span>
              <h2 className={`text-4xl xs:text-5xl md:text-7xl font-display font-black tracking-tighter italic tabular-nums leading-none ${stats.balance < 0 ? 'text-red-500' : 'text-white'}`}>
                {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 min-w-[140px] md:min-w-[160px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 border border-white/10 px-3 py-2 md:px-4 md:py-3 rounded-xl md:rounded-2xl">
               <span className="text-[7px] md:text-[9px] font-black text-neutral-500 uppercase tracking-widest sm:mb-0 mb-1">A Pagar</span>
               <span className="text-xs md:text-sm font-black text-amber-500 tabular-nums">R$ {stats.pending.toLocaleString()}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 md:px-4 md:py-3 rounded-xl md:rounded-2xl">
               <span className="text-[7px] md:text-[9px] font-black text-emerald-500/60 uppercase tracking-widest sm:mb-0 mb-1">Pagos</span>
               <span className="text-xs md:text-sm font-black text-emerald-500 tabular-nums">R$ {stats.paid.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[8px] md:text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] md:tracking-[0.4em]">Detalhamento</h3>
          <span className="text-[8px] md:text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{filteredList.length} Lançamentos</span>
        </div>
        <div className="space-y-3">
          {filteredList.map((tx) => {
            const isActuallyPaid = tx.isFixed ? (tx.paidMonths?.includes(currentMonthKey) ?? false) : tx.isPaid;
            return (
              <div 
                key={tx.id} 
                className={`group relative bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden ${isActuallyPaid ? 'bg-neutral-50/50 dark:bg-neutral-900/40' : ''}`}
              >
                {/* Barra Lateral de Status - Referência da imagem do usuário */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all ${isActuallyPaid ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'}`} />
                
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center text-xl md:text-2xl transition-all shrink-0 ${isActuallyPaid ? 'bg-emerald-500/5 text-emerald-500/50' : 'bg-neutral-100 dark:bg-neutral-950 text-neutral-400 group-hover:text-primary shadow-inner'}`}>
                      {tx.emoji}
                    </div>
                    <div className="min-w-0 flex flex-col justify-center">
                      <h4 className={`text-base md:text-lg font-display font-black uppercase italic tracking-tighter leading-none truncate mb-1 ${isActuallyPaid ? 'text-neutral-500 line-through decoration-emerald-500/30' : 'text-neutral-900 dark:text-white'}`}>
                        {tx.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[7px] md:text-[9px] font-black text-neutral-400 uppercase tracking-widest truncate">{tx.category}</span>
                        <span className="text-neutral-300 dark:text-neutral-800 opacity-30">|</span>
                        <span className="text-[7px] md:text-[9px] font-black text-neutral-400 uppercase tracking-widest flex items-center">
                          {tx.isFixed ? <><Clock className="w-2.5 h-2.5 mr-1" /> FIXO</> : tx.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-3 shrink-0">
                    <div className="text-right">
                      <p className={`text-lg md:text-2xl font-display font-black tracking-tighter italic tabular-nums leading-none ${tx.type === 'revenue' ? 'text-emerald-500' : isActuallyPaid ? 'text-neutral-500' : 'text-neutral-900 dark:text-white'}`}>
                        <span className="text-[8px] md:text-[10px] mr-0.5 opacity-40">R$</span>
                        {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1.5">
                       <button 
                        onClick={() => onTogglePaid(tx.id, tx.isFixed ? currentMonthKey : undefined)} 
                        className={`flex items-center space-x-1.5 px-3 py-2 md:px-4 md:py-2.5 rounded-full border transition-all active:scale-90 ${
                          isActuallyPaid 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-black' 
                            : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:border-primary hover:text-primary'
                        }`}
                       >
                         {isActuallyPaid ? <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" strokeWidth={3} /> : <CircleDashed className="w-3 h-3 md:w-4 md:h-4" />}
                         <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest">{isActuallyPaid ? 'PAGO' : 'PENDENTE'}</span>
                       </button>
                       <div className="flex bg-neutral-950 rounded-full border border-neutral-800 p-0.5 shadow-inner">
                          <button onClick={() => onEdit(tx)} className="p-2 text-neutral-500 hover:text-primary transition-colors active:scale-90"><Edit3 className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                          <button onClick={() => onDelete(tx.id)} className="p-2 text-neutral-500 hover:text-red-500 transition-colors active:scale-90"><Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /></button>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredList.length === 0 && (
            <div className="py-20 text-center bg-neutral-950/20 rounded-[2rem] border-2 border-dashed border-neutral-800 mx-1">
              <p className="text-[8px] md:text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em] italic">Nenhum lançamento para este mês</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
