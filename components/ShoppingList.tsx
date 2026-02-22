
import React, { useState, useMemo } from 'react';
import { ShoppingItem } from '../types';
import { Plus, Trash2, CheckCircle2, Circle, History, Eraser, Info, Calculator } from 'lucide-react';
import { ConfirmationModal } from './ui/ConfirmationModal';

interface ShoppingListProps {
  items: ShoppingItem[];
  onAdd: (item: Partial<ShoppingItem>) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onClearHistory?: () => void;
}

export const ShoppingList: React.FC<ShoppingListProps> = ({ items, onAdd, onToggle, onDelete, onClearHistory }) => {
  const [text, setText] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [showHistory, setShowHistory] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null });

  const activeItems = useMemo(() => items.filter(i => !i.archivedAt && !i.isDeleted), [items]);
  const historyItems = useMemo(() => items.filter(i => i.archivedAt && !i.isDeleted), [items]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    onAdd({
      text: text.trim(),
      price: price ? parseFloat(price) : undefined,
      quantity: quantity ? parseInt(quantity) : 1,
      completed: false
    });

    setText('');
    setPrice('');
    setQuantity('1');
  };

  const totalActive = activeItems.reduce((acc, i) => acc + ((i.price || 0) * (i.quantity || 1)), 0);

  return (
    <div className="space-y-8 animate-slide-up pb-24">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-5">
          <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[1.5rem] flex items-center justify-center text-2xl shadow-inner transform rotate-3">🛒</div>
          <div>
            <h2 className="text-3xl md:text-5xl font-display font-black text-neutral-900 dark:text-white uppercase italic tracking-tighter leading-none">Carrinho</h2>
            <p className="text-[10px] md:text-xs text-neutral-500 font-bold uppercase tracking-[0.2em] mt-1">Sincronizado e Compartilhado</p>
          </div>
        </div>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className={`p-4 rounded-[1.2rem] transition-all shadow-lg active:scale-90 ${showHistory ? 'bg-primary text-neutral-950' : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-500 border border-neutral-200 dark:border-neutral-800'}`}
          title="Ver Histórico"
        >
          <History size={24} />
        </button>
      </div>

      {!showHistory ? (
        <>
          <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl space-y-6">
            <input 
              type="text" 
              value={text} 
              onChange={e => setText(e.target.value)} 
              placeholder="O que vamos comprar?" 
              className="w-full p-6 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-[1.5rem] md:rounded-[2rem] font-bold text-lg outline-none focus:border-primary transition-all shadow-inner" 
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-neutral-400 uppercase tracking-widest">R$</span>
                <input 
                  type="number" 
                  step="0.01"
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                  placeholder="Valor" 
                  className="w-full p-6 pl-12 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-[1.5rem] md:rounded-[2rem] text-sm font-bold outline-none focus:border-primary shadow-inner" 
                />
              </div>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-neutral-400 uppercase tracking-widest">QTD</span>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={e => setQuantity(e.target.value)} 
                  placeholder="1" 
                  className="w-full p-6 pl-14 bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-[1.5rem] md:rounded-[2rem] text-sm font-bold outline-none focus:border-primary shadow-inner" 
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-primary text-neutral-950 py-6 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-[0.25em] text-xs shadow-glow active:scale-95 transition-all">
              Adicionar à Lista
            </button>
          </form>

          <div className="space-y-3">
            {activeItems.map(item => (
              <div key={item.id} className={`flex items-center justify-between p-5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl transition-all ${item.completed ? 'opacity-40 grayscale' : ''}`}>
                <div className="flex items-center space-x-4 flex-1">
                  <button onClick={() => onToggle(item.id)}>
                    {item.completed ? <CheckCircle2 size={24} className="text-emerald-500" strokeWidth={3} /> : <Circle size={24} className="text-neutral-300" strokeWidth={2} />}
                  </button>
                  <div className="flex flex-col">
                    <span className={`text-lg font-bold italic tracking-tight ${item.completed ? 'line-through' : ''}`}>{item.text}</span>
                    {item.price && (
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center">
                        <Calculator size={10} className="mr-1" />
                        R$ {item.price.toFixed(2)} x {item.quantity} = R$ {(item.price * (item.quantity || 1)).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => setConfirmDelete({ isOpen: true, id: item.id })} className="p-2 text-neutral-200 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            {activeItems.length === 0 && (
              <div className="text-center py-20 bg-neutral-50 dark:bg-neutral-900/30 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-800">
                <p className="text-neutral-400 font-black uppercase italic text-xs tracking-widest">Lista Vazia. Que tal planejar?</p>
              </div>
            )}
          </div>

          {totalActive > 0 && (
            <div className="bg-neutral-950 text-white p-6 rounded-[2.5rem] flex items-center justify-between border border-neutral-800 shadow-2xl">
               <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/10 rounded-xl"><Calculator size={20} className="text-primary" /></div>
                  <div>
                    <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Total Estimado</p>
                    <p className="text-2xl font-display font-black text-white italic">R$ {totalActive.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
               </div>
               <button 
                onClick={() => setConfirmClear(true)}
                className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                title="Limpar Itens Concluídos"
               >
                 <Eraser size={20} />
               </button>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-right duration-300">
           <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest">Histórico de Compras</h3>
              <button onClick={() => setShowHistory(false)} className="text-[10px] font-black text-primary uppercase underline">Voltar</button>
           </div>
           {historyItems.length === 0 ? (
             <div className="text-center py-20 opacity-30 italic text-sm font-bold uppercase tracking-widest">Nenhum histórico disponível</div>
           ) : (
             <div className="space-y-3">
               {historyItems.map(item => (
                  <div key={item.id} className="p-4 bg-neutral-100 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl flex justify-between items-center opacity-70">
                    <div>
                      <p className="font-bold text-neutral-700 dark:text-neutral-300 italic">{item.text}</p>
                      <p className="text-[8px] font-black text-neutral-400 uppercase tracking-widest mt-1">Concluído em: {item.archivedAt}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-black text-neutral-500">R$ {((item.price || 0) * (item.quantity || 1)).toFixed(2)}</p>
                       <p className="text-[8px] font-bold text-neutral-400">{item.quantity} unidades</p>
                    </div>
                  </div>
               ))}
             </div>
           )}
        </div>
      )}

      <ConfirmationModal 
        isOpen={confirmClear} 
        title="Arquivar Concluídos?" 
        message="Os itens marcados serão movidos para o histórico. Isso ajuda a manter sua lista limpa enquanto preservamos os dados para suas análises de gastos futuros." 
        confirmLabel="Arquivar Agora"
        onConfirm={() => { onClearHistory?.(); setConfirmClear(false); }} 
        onCancel={() => setConfirmClear(false)} 
        variant="warning"
      />

      <ConfirmationModal 
        isOpen={confirmDelete.isOpen} 
        title="Remover Item?" 
        message="Deseja excluir este item permanentemente da sua lista?" 
        onConfirm={() => { if (confirmDelete.id) onDelete(confirmDelete.id); setConfirmDelete({ isOpen: false, id: null }); }} 
        onCancel={() => setConfirmDelete({ isOpen: false, id: null })} 
      />
    </div>
  );
};
