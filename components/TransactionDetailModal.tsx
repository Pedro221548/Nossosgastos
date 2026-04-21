
import React from 'react';
import { X, Edit3, Trash2, Calendar, Tag, User, DollarSign, Clock, CheckCircle2, CircleDashed } from 'lucide-react';
import { Transaction, User as UserType } from '../types';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  users: { A: UserType; B: UserType };
  currentMonthKey: string;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onEdit,
  onDelete,
  users,
  currentMonthKey
}) => {
  if (!isOpen || !transaction) return null;

  const isActuallyPaid = transaction.isFixed 
    ? (transaction.paidMonths?.includes(currentMonthKey) ?? false) 
    : transaction.isPaid;

  const spender = transaction.spenderId === users.A.id ? users.A : users.B;

  return (
    <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative bg-[#0F0F0F] w-full max-w-md md:rounded-[32px] rounded-t-[32px] border-t md:border border-neutral-800 shadow-2xl animate-in slide-in-from-bottom duration-500 overflow-hidden">
        
        <div className={`absolute left-0 top-0 bottom-0 w-1 md:w-1.5 ${isActuallyPaid ? 'bg-emerald-500' : 'bg-amber-500'} z-10`} />

        <div className="px-6 md:px-8 py-5 md:py-6 flex justify-between items-center border-b border-neutral-900 shrink-0">
          <div className="flex items-center space-x-3">
            <span className="text-xl">{transaction.emoji}</span>
            <h2 className="text-lg md:text-xl font-display font-black text-white uppercase italic tracking-tighter truncate max-w-[180px]">
              {transaction.title}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 bg-neutral-900 rounded-full text-neutral-400 hover:text-white transition-all active:scale-90">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 space-y-1">
              <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest leading-none">Valor Total</p>
              <h3 className={`text-xl font-display font-black tracking-tighter italic tabular-nums leading-none ${transaction.type === 'revenue' ? 'text-emerald-500' : 'text-white'}`}>
                R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 space-y-1">
              <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest leading-none">Status</p>
              <div className="flex items-center space-x-1.5">
                {isActuallyPaid ? (
                  <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> <span className="text-emerald-500 font-black text-[9px] uppercase tracking-widest">PAGO</span></>
                ) : (
                  <><CircleDashed className="w-3.5 h-3.5 text-amber-500" /> <span className="text-amber-500 font-black text-[9px] uppercase tracking-widest">PENDENTE</span></>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <DetailItem icon={<Calendar className="w-3.5 h-3.5 text-emerald-500" />} label="Data do Pagamento" value={transaction.date} />
            {transaction.referenceDate && (
              <DetailItem icon={<Calendar className="w-3.5 h-3.5 text-primary" />} label="Data de Referência" value={transaction.referenceDate} />
            )}
            <DetailItem icon={<Tag className="w-3.5 h-3.5 text-primary" />} label="Categoria" value={transaction.category} />
            <DetailItem 
              icon={<User className="w-3.5 h-3.5 text-primary" />} 
              label="Responsável" 
              value={spender.name} 
              extra={<img src={spender.avatar} className="w-4 h-4 rounded-full border border-neutral-700" />}
            />
            {transaction.isFixed && (
              <DetailItem icon={<Clock className="w-3.5 h-3.5 text-primary" />} label="Tipo" value="Despesa Fixa Mensal" />
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => { onEdit(transaction); onClose(); }} 
              className="flex-1 py-4 rounded-[1.5rem] bg-neutral-900 border border-neutral-800 text-white font-black uppercase text-[9px] tracking-widest hover:bg-neutral-800 transition-all active:scale-95 flex items-center justify-center space-x-2"
            >
              <Edit3 size={14} className="text-primary" />
              <span>Editar Dados</span>
            </button>
            <button 
              onClick={() => { onDelete(transaction.id); onClose(); }} 
              className="px-6 py-4 rounded-[1.5rem] bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase text-[9px] tracking-widest hover:bg-red-500/20 transition-all active:scale-95 flex items-center justify-center"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ icon, label, value, extra }: { icon: any, label: string, value: string, extra?: any }) => (
  <div className="flex items-center justify-between p-4 bg-neutral-900/30 rounded-2xl border border-neutral-800/50">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-neutral-950 rounded-xl">{icon}</div>
      <div>
        <p className="text-[8px] font-black text-neutral-500 uppercase tracking-widest leading-none mb-1">{label}</p>
        <p className="text-xs font-bold text-neutral-200 uppercase tracking-widest leading-none">{value}</p>
      </div>
    </div>
    {extra && <div>{extra}</div>}
  </div>
);

const CreditCard = ({ size, className }: { size?: number, className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
);
