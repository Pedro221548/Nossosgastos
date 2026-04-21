
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
  CircleDashed,
  Share2
} from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  totalIncome: number;
  currentDate: Date;
  users: { A: User; B: User };
  familyName: string;
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
  familyName,
  onMonthChange,
  onDelete, 
  onTogglePaid, 
  onEdit
}) => {
  const currentMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
  const month = currentDate.toLocaleString('pt-BR', { month: 'long' });
  const monthLabel = `${month.charAt(0).toUpperCase() + month.slice(1)} ${currentDate.getFullYear()}`;

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
      balance: effectiveIncome - paidExpenses - pendingExpenses
    };
  }, [filteredList, baseIncome, currentMonthKey]);

  const handleShareWhatsApp = () => {
    const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    
    let message = `📊 *Resumo Financeiro - ${monthLabel}*\n\n`;
    message += `💰 *Saldo Livre (Estimado):* ${formatCurrency(stats.balance)}\n`;
    message += `🏦 *Saldo Atual em Conta:* ${formatCurrency(stats.balance + stats.pending)}\n`;
    message += `⏳ *A Pagar:* ${formatCurrency(stats.pending)}\n`;
    message += `✅ *Pagos:* ${formatCurrency(stats.paid)}\n\n`;
    
    message += `*--- Detalhamento (${filteredList.length} itens) ---*\n`;
    
    filteredList.forEach(tx => {
      const isActuallyPaid = tx.isFixed ? (tx.paidMonths?.includes(currentMonthKey) ?? false) : tx.isPaid;
      const statusIcon = isActuallyPaid ? '✅' : '⏳';
      const typeIcon = tx.type === 'revenue' ? '📈' : '📉';
      message += `${statusIcon} ${tx.title} - ${formatCurrency(tx.amount)}\n`;
    });

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-slide-up text-left max-w-2xl mx-auto px-1 sm:px-0 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-2 sm:px-0">
        <div className="flex items-center space-x-3 md:space-x-5">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-neutral-900 border border-neutral-800 rounded-2xl md:rounded-3xl flex items-center justify-center text-primary shadow-inner transform -rotate-3 shrink-0">
            <Calendar className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[9px] md:text-xs font-black text-neutral-500 uppercase tracking-[0.2em] mb-1 truncate">{familyName}</h2>
            <span className="text-lg xs:text-xl md:text-4xl font-display font-black text-neutral-900 dark:text-white italic tracking-tighter leading-none block">{monthLabel}</span>
          </div>
        </div>
        <div className="flex items-center bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[1.5rem] md:rounded-2xl p-1.5 shadow-xl sm:w-auto w-full justify-between sm:justify-start">
          <button onClick={() => onMonthChange('prev')} className="p-4 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all active:scale-90 flex-1 sm:flex-none flex justify-center"><ChevronLeft size={24} /></button>
          <div className="w-px h-8 bg-neutral-100 dark:bg-neutral-800 mx-2" />
          <button onClick={() => onMonthChange('next')} className="p-4 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all active:scale-90 flex-1 sm:flex-none flex justify-center"><ChevronRight size={24} /></button>
        </div>
      </div>
      
      <div className="bg-neutral-950 border border-neutral-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group mx-1 sm:mx-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full -mr-24 -mt-24"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-8">
          <div className="space-y-3">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em] mb-1">Saldo Livre (Estimado)</p>
            <div className="flex items-baseline space-x-2 xs:space-x-3">
              <span className="text-xl xs:text-2xl font-black text-primary italic shrink-0">R$</span>
              <h2 className={`text-3xl xs:text-4xl sm:text-5xl md:text-7xl font-display font-black tracking-tighter italic tabular-nums leading-none ${stats.balance < 0 ? 'text-red-500' : 'text-white'}`}>
                {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="flex items-center space-x-2 opacity-40">
              <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Saldo Atual em Conta:</p>
              <p className="text-[10px] font-black text-white italic tabular-nums">R$ {(stats.balance + stats.pending).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 min-w-[160px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/5 border border-white/10 px-4 py-3 rounded-xl">
               <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest sm:mb-0 mb-1">A Pagar</span>
               <span className="text-xs xs:text-sm font-black text-amber-500 tabular-nums">R$ {stats.pending.toLocaleString()}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl">
               <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest sm:mb-0 mb-1">Pagos</span>
               <span className="text-xs xs:text-sm font-black text-emerald-500 tabular-nums">R$ {stats.paid.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">Detalhamento</h3>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleShareWhatsApp}
              className="flex items-center space-x-1.5 text-neutral-400 hover:text-emerald-500 transition-colors active:scale-95"
              title="Compartilhar no WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="text-[9px] font-bold uppercase tracking-widest hidden sm:inline">Compartilhar</span>
            </button>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{filteredList.length} Itens</span>
          </div>
        </div>
        <div className="space-y-4 px-1 sm:px-0">
          {filteredList.map((tx) => {
            const isActuallyPaid = tx.isFixed ? (tx.paidMonths?.includes(currentMonthKey) ?? false) : tx.isPaid;
            return (
              <div 
                key={tx.id} 
                className={`group relative bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[1.8rem] p-4 xs:p-5 transition-all duration-300 shadow-sm overflow-hidden ${isActuallyPaid ? 'bg-neutral-50/50 dark:bg-neutral-900/40' : 'hover:shadow-2xl hover:border-primary/20'}`}
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all ${isActuallyPaid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
                  <div className="flex items-center space-x-3 md:space-x-5 min-w-0 flex-1">
                    <div className={`w-12 h-12 xs:w-14 xs:h-14 rounded-2xl flex items-center justify-center text-xl xs:text-2xl transition-all shrink-0 ${isActuallyPaid ? 'bg-emerald-500/5 text-emerald-500/50' : 'bg-neutral-100 dark:bg-neutral-950 text-neutral-400 group-hover:text-primary shadow-inner'}`}>
                      {tx.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className={`text-sm xs:text-base sm:text-lg font-display font-black uppercase italic tracking-tighter leading-tight mb-0.5 ${isActuallyPaid ? 'text-neutral-500 line-through decoration-emerald-500/30' : 'text-neutral-900 dark:text-white'}`}>
                        {tx.title}
                      </h4>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-[8px] xs:text-[9px] font-black text-neutral-400 uppercase tracking-widest truncate">{tx.category}</span>
                        <span className="text-neutral-200 dark:text-neutral-800 opacity-20">|</span>
                        <span className="text-[8px] xs:text-[9px] font-black text-neutral-400 uppercase tracking-widest flex items-center truncate">
                          {tx.isFixed ? <Clock className="w-3 h-3 mr-1 shrink-0" /> : null}
                          {tx.isFixed ? 'FIXO' : tx.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 sm:mt-0">
                    <p className={`text-lg xs:text-xl md:text-2xl font-display font-black tracking-tighter italic tabular-nums leading-none ${tx.type === 'revenue' ? 'text-emerald-500' : isActuallyPaid ? 'text-neutral-500' : 'text-neutral-900 dark:text-white'}`}>
                      <span className="text-xs mr-1 opacity-40 italic">R$</span>
                      {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <div className="flex items-center space-x-2">
                       <button 
                        onClick={() => onTogglePaid(tx.id, tx.isFixed ? currentMonthKey : undefined)} 
                        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border transition-all active:scale-90 ${
                          isActuallyPaid 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-black' 
                            : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:border-primary hover:text-primary'
                        }`}
                       >
                         {isActuallyPaid ? <CheckCircle2 className="w-3 h-3" strokeWidth={3} /> : <CircleDashed className="w-3 h-3" />}
                         <span className="text-[8px] font-black uppercase tracking-widest">{isActuallyPaid ? 'PAGO' : 'PEND'}</span>
                       </button>
                       <div className="flex bg-neutral-950 rounded-full border border-neutral-800 p-0.5 shadow-inner">
                          <button onClick={() => onEdit(tx)} className="p-1.5 text-neutral-500 hover:text-primary transition-colors active:scale-90"><Edit3 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => onDelete(tx.id)} className="p-1.5 text-neutral-500 hover:text-red-500 transition-colors active:scale-90"><Trash2 className="w-3.5 h-3.5" /></button>
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
