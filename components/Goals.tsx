
import React, { useState } from 'react';
import { Goal } from '../types';
import { Plus, Target, Edit3, Trash2, X, DollarSign, Image as ImageIcon, Zap, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { ConfirmationModal } from './ui/ConfirmationModal';

interface GoalsProps {
  goals: Goal[];
  onUpdateGoal: (id: string, amount: number) => void;
  onSaveGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
}

export const Goals: React.FC<GoalsProps> = ({ goals, onUpdateGoal, onSaveGoal, onDeleteGoal }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isContributionOpen, setIsContributionOpen] = useState<{ isOpen: boolean, goalId: string | null }>({ isOpen: false, goalId: null });
  const [contributionAmount, setContributionAmount] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null });

  const activeGoals = goals.filter(g => !g.isDeleted);

  const handleOpenEdit = (goal: Goal) => { setEditingGoal(goal); setIsModalOpen(true); };

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in px-1 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-center md:text-left space-y-2">
          <h2 className="text-3xl font-display font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic">Nossas Metas</h2>
          <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Investindo no nosso futuro juntos</p>
        </div>
        <button onClick={() => { setEditingGoal(null); setIsModalOpen(true); }} className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 px-8 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all"><Plus size={18} strokeWidth={3} className="inline mr-2" />Novo Objetivo</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeGoals.map(goal => {
          const percentage = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          return (
            <div key={goal.id} className="rounded-[2.5rem] bg-white dark:bg-neutral-900 shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden group">
              <div className="h-44 relative">
                <img src={goal.imageUrl || 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=800&auto=format&fit=crop'} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute top-4 right-4 flex space-x-2">
                   {goal.purchaseUrl && (
                     <a href={goal.purchaseUrl} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/90 rounded-2xl text-primary hover:scale-110 transition-transform"><LinkIcon size={16} /></a>
                   )}
                   <button onClick={() => handleOpenEdit(goal)} className="p-3 bg-white/90 rounded-2xl text-neutral-600 hover:text-primary"><Edit3 size={16} /></button>
                   <button onClick={() => setConfirmDelete({ isOpen: true, id: goal.id })} className="p-3 bg-white/90 rounded-2xl text-neutral-600 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
                <h3 className="absolute bottom-4 left-6 text-white font-display font-black text-2xl uppercase tracking-tight italic">{goal.title}</h3>
              </div>
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-end mb-4">
                  <div className="space-y-1"><span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Acumulado</span><p className="text-2xl font-display font-black text-neutral-900 dark:text-white">R$ {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
                  <div className="text-right"><span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Meta</span><p className="text-xs font-bold text-neutral-500 italic">R$ {goal.targetAmount.toLocaleString('pt-BR')}</p></div>
                </div>
                <div className="h-4 bg-neutral-100 dark:bg-neutral-950 rounded-full border border-neutral-200 dark:border-neutral-800 p-1 mb-6"><div className={`h-full ${goal.color} rounded-full transition-all duration-1000 shadow-glow`} style={{ width: `${percentage}%` }} /></div>
                <button onClick={() => setIsContributionOpen({ isOpen: true, goalId: goal.id })} className="w-full text-[10px] font-black bg-primary px-6 py-5 rounded-3xl uppercase tracking-widest shadow-glow active:scale-95 transition-all">Adicionar Economia</button>
              </div>
            </div>
          );
        })}
      </div>

      {isContributionOpen.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsContributionOpen({ isOpen: false, goalId: null })} />
          <form onSubmit={(e) => { e.preventDefault(); onUpdateGoal(isContributionOpen.goalId!, parseFloat(contributionAmount)); setIsContributionOpen({ isOpen: false, goalId: null }); setContributionAmount(''); }} className="relative bg-[#0F0F0F] border border-neutral-800 w-full max-w-sm rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
            <h4 className="text-xl font-display font-black text-white text-center uppercase italic mb-8">Quanto vamos poupar?</h4>
            <div className="relative mb-10">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-primary font-black text-xl">R$</span>
              <input type="number" autoFocus inputMode="decimal" value={contributionAmount} onChange={e => setContributionAmount(e.target.value)} className="w-full bg-neutral-900 border-2 border-neutral-800 rounded-3xl py-6 pl-16 pr-6 text-3xl font-display font-black text-white outline-none focus:border-primary" placeholder="0,00" />
            </div>
            <button type="submit" className="w-full bg-primary py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-glow active:scale-95 transition-all">Confirmar Depósito</button>
          </form>
        </div>
      )}

      <GoalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={onSaveGoal} goal={editingGoal} />
      <ConfirmationModal isOpen={confirmDelete.isOpen} title="Excluir Meta?" message="Deseja remover este objetivo permanentemente?" onConfirm={() => { onDeleteGoal(confirmDelete.id!); setConfirmDelete({ isOpen: false, id: null }); setIsModalOpen(false); }} onCancel={() => setConfirmDelete({ isOpen: false, id: null })} />
    </div>
  );
};

const GoalModal = ({ isOpen, onClose, onSave, goal }: any) => {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [purchaseUrl, setPurchaseUrl] = useState('');
  const [color, setColor] = useState('bg-primary');

  React.useEffect(() => {
    if (goal) { 
      setTitle(goal.title); 
      setTarget(goal.targetAmount.toString()); 
      setImageUrl(goal.imageUrl || ''); 
      setPurchaseUrl(goal.purchaseUrl || '');
      setColor(goal.color); 
    } else { 
      setTitle(''); 
      setTarget(''); 
      setImageUrl(''); 
      setPurchaseUrl('');
      setColor('bg-primary'); 
    }
  }, [goal, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={onClose} />
      <form onSubmit={(e) => { 
        e.preventDefault(); 
        onSave({ 
          id: goal ? goal.id : `goal_${Date.now()}`, 
          title, 
          targetAmount: parseFloat(target), 
          currentAmount: goal ? goal.currentAmount : 0, 
          imageUrl, 
          purchaseUrl,
          color 
        }); 
        onClose(); 
      }} className="relative bg-[#0F0F0F] border border-neutral-800 w-full max-w-lg rounded-[3.5rem] p-8 md:p-12 shadow-2xl animate-in slide-in-from-bottom duration-500 overflow-y-auto max-h-[90vh] scrollbar-hide">
        
        <div className="flex justify-between items-center mb-10">
           <h2 className="text-3xl font-display font-black text-white uppercase italic tracking-tighter leading-none">Novo Objetivo</h2>
           <button onClick={onClose} className="p-3 bg-neutral-900 rounded-full text-neutral-500 hover:text-white transition-all"><X size={24} /></button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">O que vamos conquistar?</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ex: Viagem, Carro, Sofá..." className="w-full px-8 py-6 bg-neutral-900/50 border border-neutral-800 rounded-[2.5rem] font-bold text-white outline-none focus:border-primary transition-all shadow-inner" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">Valor do Objetivo</label>
            <div className="relative">
              <span className="absolute left-8 top-1/2 -translate-y-1/2 text-primary font-black text-2xl italic">R$</span>
              <input type="number" inputMode="decimal" value={target} onChange={e => setTarget(e.target.value)} required className="w-full pl-20 pr-8 py-8 bg-neutral-900/50 border border-neutral-800 rounded-[2.8rem] font-display font-black text-white text-4xl outline-none focus:border-primary transition-all tracking-tighter italic" placeholder="0,00" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">Link da Imagem (Visualização)</label>
            <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://exemplo.com/foto.jpg" className="w-full px-8 py-5 bg-neutral-900/30 border border-neutral-800 rounded-[2rem] text-neutral-400 text-xs font-semibold outline-none focus:border-primary" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">Link de onde comprar</label>
            <input type="url" value={purchaseUrl} onChange={e => setPurchaseUrl(e.target.value)} placeholder="https://mercadolivre.com.br/..." className="w-full px-8 py-5 bg-neutral-900/30 border border-neutral-800 rounded-[2rem] text-neutral-400 text-xs font-semibold outline-none focus:border-primary" />
          </div>

          <div className="pt-4">
            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1 mb-4 block">Cor do Indicador</label>
            <div className="grid grid-cols-6 gap-3">
              {['bg-primary', 'bg-blue-500', 'bg-orange-500', 'bg-emerald-500', 'bg-purple-500', 'bg-pink-500'].map(c => (
                <button 
                  key={c} 
                  type="button" 
                  onClick={() => setColor(c)} 
                  className={`h-12 rounded-2xl border-4 transition-all active:scale-90 ${color === c ? 'border-white scale-110 shadow-glow' : 'border-transparent opacity-40'} ${c}`} 
                />
              ))}
            </div>
          </div>
        </div>

        <button type="submit" className="w-full mt-12 py-8 bg-primary rounded-[2.5rem] font-display font-black text-sm uppercase tracking-[0.2em] shadow-glow active:scale-95 transition-all text-neutral-950">
          SALVAR OBJETIVO
        </button>
      </form>
    </div>
  );
};
