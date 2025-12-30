
import React, { useState, useEffect } from 'react';
import { X, DollarSign, Tag, Check, Repeat, CreditCard, Clock, ArrowUpCircle, ArrowDownCircle, Zap, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Transaction, User, TransactionType } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (t: Transaction) => void;
  editingTransaction: Transaction | null;
  users: { A: User; B: User };
  initialDate?: Date; 
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  editingTransaction, 
  users,
  initialDate
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [spenderId, setSpenderId] = useState(users.A.id);
  const [isFixed, setIsFixed] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isInstallment, setIsInstallment] = useState(false);
  const [totalInstallments, setTotalInstallments] = useState('1');
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type || 'expense');
      setAmount(editingTransaction.amount.toString());
      setTitle(editingTransaction.title);
      
      if (editingTransaction.date.includes('/')) {
        const [d, m, y] = editingTransaction.date.split('/');
        setDate(`${y}-${m}-${d}`);
      } else {
        setDate(editingTransaction.date);
      }

      const cat = CATEGORIES.find(c => c.id === editingTransaction.category) || CATEGORIES[0];
      setCategory(cat);
      setSpenderId(editingTransaction.spenderId);
      setIsFixed(editingTransaction.isFixed || false);
      setIsPaid(editingTransaction.isPaid || false);
      setIsInstallment(!!editingTransaction.installments);
      if (editingTransaction.installments) {
        setTotalInstallments(editingTransaction.installments.total.toString());
      }
    } else if (isOpen) {
      const baseDate = initialDate || new Date();
      const isCurrentMonth = baseDate.getMonth() === new Date().getMonth() && baseDate.getFullYear() === new Date().getFullYear();
      
      const day = isCurrentMonth ? new Date().getDate().toString().padStart(2, '0') : '01';
      const year = baseDate.getFullYear();
      const month = (baseDate.getMonth() + 1).toString().padStart(2, '0');
      
      setDate(`${year}-${month}-${day}`);
      
      const saved = localStorage.getItem('nc_draft_tx');
      if (saved && !editingTransaction) {
        const draft = JSON.parse(saved);
        setType(draft.type || 'expense');
        setAmount(draft.amount || '');
        setTitle(draft.title || '');
      } else {
        setType('expense');
        setAmount('');
        setTitle('');
        setCategory(CATEGORIES[0]);
        setSpenderId(users.A.id);
        setIsFixed(false);
        setIsPaid(false);
        setIsInstallment(false);
        setTotalInstallments('1');
      }
    }
    setShowExitConfirm(false);
  }, [editingTransaction, isOpen, users.A.id, initialDate]);

  useEffect(() => {
    if (isOpen && !editingTransaction) {
      localStorage.setItem('nc_draft_tx', JSON.stringify({ type, amount, title }));
    }
  }, [type, amount, title, isOpen]);

  if (!isOpen) return null;

  const handleAttemptClose = () => {
    if ((amount || title) && !editingTransaction) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !title) return;

    const [y, m, d] = date.split('-');
    const formattedDate = `${d}/${m}/${y}`;
    const installmentsCount = parseInt(totalInstallments);

    const tx: Transaction = {
      id: editingTransaction ? editingTransaction.id : `tx_${Date.now()}`,
      title,
      amount: parseFloat(amount),
      category: category.id,
      date: formattedDate,
      spenderId,
      emoji: category.emoji,
      type,
      isPaid: isPaid,
      isFixed: isFixed,
      paidMonths: editingTransaction?.paidMonths || [],
      installments: (isInstallment && installmentsCount > 1) ? {
        current: 1,
        total: installmentsCount
      } : undefined
    };

    localStorage.removeItem('nc_draft_tx');
    onAdd(tx);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleAttemptClose}/>
      
      <div className="relative bg-[#0F0F0F] w-full max-w-xl md:rounded-[40px] rounded-t-[40px] border-t md:border border-neutral-800 shadow-2xl animate-in slide-in-from-bottom duration-500 overflow-hidden flex flex-col max-h-[95vh]">
        
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${type === 'expense' ? 'bg-red-500' : 'bg-emerald-500'} z-10`} />

        <div className="px-8 py-6 flex justify-between items-center border-b border-neutral-900 shrink-0">
          <h2 className="text-lg font-display font-black text-white uppercase italic tracking-tighter">
            {editingTransaction ? 'Editar Dados' : 'Novo Lançamento'}
          </h2>
          <button onClick={handleAttemptClose} className="p-3 bg-neutral-900 rounded-full text-neutral-400 hover:text-white transition-all active:scale-90">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8 overflow-y-auto pb-32 md:pb-8 scrollbar-hide">
          
          <div className="space-y-4">
            <input 
              type="text" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Ex: Mercado, Luz..." 
              className="w-full bg-neutral-900/50 border border-neutral-800 rounded-3xl px-8 py-6 text-xl font-bold text-white placeholder:text-neutral-700 outline-none focus:border-primary transition-all shadow-inner" 
            />
          </div>

          {/* Campo de Data Ajustado - Foco em legibilidade e não sobreposição */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Data do Lançamento (Planejada)</label>
            <div className="relative group">
              <div className="absolute left-8 top-1/2 -translate-y-1/2 text-neutral-500 transition-colors group-focus-within:text-primary z-20 pointer-events-none">
                <CalendarIcon size={20} />
              </div>
              
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className="w-full px-12 pl-20 py-7 bg-neutral-950/50 border border-neutral-800 rounded-[2.5rem] font-display font-black text-white text-xl md:text-2xl outline-none focus:border-primary/50 focus:bg-neutral-900/80 transition-all [color-scheme:dark] shadow-xl tracking-tighter relative z-10 appearance-none text-left" 
              />

              <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 z-20">
                <CalendarIcon size={16} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Tipo e Status</label>
             <div className="grid grid-cols-3 gap-3">
                <button type="button" onClick={() => setIsPaid(!isPaid)} className={`flex flex-col items-center justify-center py-6 rounded-3xl border transition-all ${isPaid ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-neutral-900/30 border-neutral-800 text-neutral-600'}`}>
                  <Check size={24} strokeWidth={3} className={isPaid ? 'animate-pulse' : ''} />
                  <span className="text-[9px] font-black uppercase mt-2">{isPaid ? 'Confirmado' : 'Pendente'}</span>
                </button>
                <button type="button" onClick={() => { setIsFixed(!isFixed); if(!isFixed) setIsInstallment(false); }} className={`flex flex-col items-center justify-center py-6 rounded-3xl border transition-all ${isFixed ? 'bg-primary/10 border-primary text-primary' : 'bg-neutral-900/30 border-neutral-800 text-neutral-600'}`}>
                  <Repeat size={24} />
                  <span className="text-[9px] font-black uppercase mt-2">Fixo/Mês</span>
                </button>
                <button type="button" onClick={() => { setIsInstallment(!isInstallment); if(!isInstallment) setIsFixed(false); }} className={`flex flex-col items-center justify-center py-6 rounded-3xl border transition-all ${isInstallment ? 'bg-blue-500/10 border-blue-500 text-blue-500' : 'bg-neutral-900/30 border-neutral-800 text-neutral-600'}`}>
                  <CreditCard size={24} />
                  <span className="text-[9px] font-black uppercase mt-2">Parcelado</span>
                </button>
             </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Responsável</label>
            <div className="grid grid-cols-2 gap-4">
              {[users.A, users.B].map(u => (
                <button 
                  key={u.id}
                  type="button" 
                  onClick={() => setSpenderId(u.id)} 
                  className={`flex items-center justify-center space-x-3 p-4 rounded-[2.5rem] border-2 transition-all ${spenderId === u.id ? 'border-primary bg-primary/5 shadow-glow' : 'border-neutral-900 bg-neutral-900/30 text-neutral-600 opacity-50'}`}
                >
                  <img src={u.avatar} className={`w-8 h-8 rounded-full border-2 ${spenderId === u.id ? 'border-primary' : 'border-neutral-800'}`} />
                  <span className="font-black text-[9px] uppercase tracking-widest">{u.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
             <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Valor Final</label>
             <div className="relative group">
               <span className="absolute left-10 top-1/2 -translate-y-1/2 text-2xl font-black text-neutral-700 transition-colors group-focus-within:text-white">R$</span>
               <input 
                 type="number" 
                 inputMode="decimal"
                 value={amount} 
                 onChange={e => setAmount(e.target.value)} 
                 placeholder="0,00" 
                 className="w-full bg-neutral-900/50 border border-neutral-800 rounded-[3.5rem] px-24 py-10 text-5xl font-display font-black text-white outline-none focus:border-primary transition-all tracking-tighter italic" 
               />
             </div>
          </div>

          <div className="pt-6">
              <button 
                type="submit" 
                disabled={!amount || !title} 
                className="w-full py-8 rounded-[2.5rem] bg-primary text-neutral-950 font-display font-black text-sm uppercase tracking-[0.25em] shadow-glow active:scale-95 flex items-center justify-center space-x-3 transition-all disabled:opacity-30"
              >
                <Zap size={20} fill="currentColor" />
                <span>CONFIRMAR AGENDAMENTO</span>
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};
