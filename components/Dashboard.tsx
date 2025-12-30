
import React, { useState, useMemo } from 'react';
import { Transaction, User } from '../types';
import { Card } from './ui/Card';
import { 
  ArrowUpRight, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Edit3, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  MoreVertical,
  DollarSign
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
    <div className="space-y-8 animate-slide-up text-left max-w-2xl mx-auto">
      {/* Header com Seletor de Mês Moderno */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary/10 rounded-[1.2rem] flex items-center justify-center text-primary border border-primary/20 shadow-glow">
            <Calendar size={22} />
          </div>
          <div>
            <h2 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.3em]">Extrato Mensal</h2>
            <span className="text-2xl font-display font-black text-neutral-900 dark:text-white uppercase italic tracking-tighter leading-none">{monthLabel}</span>
          </div>
        </div>
        <div className="flex items-center bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-1.5 shadow-xl">
          <button onClick={() => onMonthChange('prev')} className="p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all active:scale-90"><ChevronLeft size={18} /></button>
          <div className="w-px h-6 bg-neutral-100 dark:bg-neutral-800 mx-1" />
          <button onClick={() => onMonthChange('next')} className="p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-xl transition-all active:scale-90"><ChevronRight size={18} /></button>
        </div>
      </div>
      
      {/* Dashboard de Saldo Real */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-[3rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32 transition-opacity group-hover:opacity-60"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em] mb-1">Saldo Líquido Disponível</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-black text-primary italic">R$</span>
              <h2 className={`text-6xl md:text-7xl font-display font-black tracking-tighter italic tabular-nums leading-none ${stats.balance < 0 ? 'text-red-500' : 'text-white'}`}>
                {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 min-w-[160px]">
            <div className="flex items-center justify-between bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
               <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">A Pagar</span>
               <span className="text-sm font-black text-amber-500 tabular-nums">R$ {stats.pending.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-2xl">
               <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">Pagos</span>
               <span className="text-sm font-black text-emerald-500 tabular-nums">R$ {stats.paid.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Transações Redesenhada */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em]">Detalhamento</h3>
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">{filteredList.length} Lançamentos</span>
        </div>

        <div className="space-y-3">
          {filteredList.map((tx) => {
            const isActuallyPaid = tx.isFixed ? (tx.paidMonths?.includes(currentMonthKey) ?? false) : tx.isPaid;
            return (
              <div 
                key={tx.id} 
                className={`group relative bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-[2rem] p-5 md:p-6 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${isActuallyPaid ? 'opacity-60 dark:opacity-40' : ''}`}
              >
                {/* Linha Lateral de Status */}
                <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full transition-all ${isActuallyPaid ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'}`} />

                <div className="flex items-center justify-between gap-4">
                  {/* Info Lado Esquerdo */}
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-all ${isActuallyPaid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-neutral-50 dark:bg-neutral-950 text-neutral-400 group-hover:text-primary'}`}>
                      {tx.emoji}
                    </div>
                    <div>
                      <h4 className={`text-lg font-black uppercase italic tracking-tighter leading-tight ${isActuallyPaid ? 'text-neutral-400 line-through decoration-emerald-500/50 decoration-2' : 'text-neutral-900 dark:text-white'}`}>
                        {tx.title}
                      </h4>
                      <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] mt-1 flex items-center">
                        {tx.category} <span className="mx-2 opacity-30">|</span> {tx.isFixed ? <span className="flex items-center"><Clock size={10} className="mr-1" /> FIXO</span> : tx.date}
                      </p>
                    </div>
                  </div>

                  {/* Info Lado Direito / Ações */}
                  <div className="flex flex-col items-end space-y-3">
                    <div className="text-right">
                      <p className={`text-xl font-display font-black tracking-tighter italic tabular-nums leading-none ${tx.type === 'revenue' ? 'text-emerald-500' : 'text-neutral-900 dark:text-white'}`}>
                        <span className="text-[10px] mr-1 opacity-40">R$</span>
                        {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                       {/* Botão PAGO Moderno */}
                       <button 
                        onClick={() => onTogglePaid(tx.id, tx.isFixed ? currentMonthKey : undefined)}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-all active:scale-95 ${
                          isActuallyPaid 
                            ? 'bg-emerald-500 border-emerald-500 text-neutral-950 font-black' 
                            : 'bg-transparent border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:border-amber-500 hover:text-amber-500'
                        }`}
                       >
                         {isActuallyPaid ? <CheckCircle2 size={14} strokeWidth={3} /> : <Circle size={14} strokeWidth={2.5} />}
                         <span className="text-[9px] font-black uppercase tracking-widest">{isActuallyPaid ? 'PAGO' : 'PENDENTE'}</span>
                       </button>

                       {/* Grupo de Ações secundárias */}
                       <div className="flex bg-neutral-50 dark:bg-neutral-950 rounded-full border border-neutral-100 dark:border-neutral-800 p-0.5">
                          <button onClick={() => onEdit(tx)} className="p-2 text-neutral-300 hover:text-primary transition-colors"><Edit3 size={14} /></button>
                          <button onClick={() => onDelete(tx.id)} className="p-2 text-neutral-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {filteredList.length === 0 && (
            <div className="py-20 text-center bg-neutral-50 dark:bg-neutral-900/30 rounded-[3rem] border-2 border-dashed border-neutral-100 dark:border-neutral-800">
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.4em] italic">Nenhum lançamento para este mês</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
