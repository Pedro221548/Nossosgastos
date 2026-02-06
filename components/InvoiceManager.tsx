
import React, { useState, useRef } from 'react';
import { Invoice, InvoiceItem } from '../types';
import { FileText, Upload, CreditCard, Loader2, Trash2, X, FileUp, FileType, Zap, CheckCircle2 } from 'lucide-react';
import { parseInvoiceText, parseInvoiceFile } from '../services/invoiceService';
import { Card } from './ui/Card';

interface InvoiceManagerProps {
  invoices: Invoice[];
  onSaveInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
}

export const InvoiceManager: React.FC<InvoiceManagerProps> = ({ invoices, onSaveInvoice, onDeleteInvoice }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importMode, setImportMode] = useState<'file' | 'text'>('file');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      let result;
      if (importMode === 'text') {
        if (!inputText.trim()) return;
        result = await parseInvoiceText(inputText);
      } else {
        if (!selectedFile) return;
        const base64 = await fileToBase64(selectedFile);
        result = await parseInvoiceFile(base64, selectedFile.type);
      }

      const newInvoice: Invoice = {
        id: `inv_${Date.now()}`,
        bankName: (result.bankName || "BANCO").toUpperCase(),
        month: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase(),
        totalAmount: result.totalAmount || 0,
        processedAt: new Date().toLocaleDateString('pt-BR'),
        items: result.items || []
      };

      onSaveInvoice(newInvoice);
      resetForm();
    } catch (error) {
      console.error(error);
      alert("Erro ao processar fatura.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setInputText('');
    setSelectedFile(null);
  };

  return (
    <div className="space-y-8 animate-slide-up pb-32 max-w-2xl mx-auto px-2">
      {/* HEADER SECTION - Simplified without toggle button */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-1">
          <h2 className="text-2xl font-display font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic leading-none">
            FATURAS <span className="text-primary">IA</span>
          </h2>
          <p className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.3em]">Gestão Inteligente de Cartões</p>
        </div>
      </div>

      {/* IMPORT SECTION - NOW PERMANENTLY OPEN */}
      <Card className="rounded-[2.5rem] border-neutral-200 dark:border-neutral-800 shadow-xl bg-white dark:bg-neutral-900/50 backdrop-blur-sm">
        <div className="space-y-5">
          <div className="flex bg-neutral-100 dark:bg-neutral-950 p-1 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <button 
              onClick={() => setImportMode('file')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest ${importMode === 'file' ? 'bg-white dark:bg-neutral-900 shadow-sm text-primary' : 'text-neutral-500'}`}
            >
              <FileType size={14} /> <span>PDF / IMAGEM</span>
            </button>
            <button 
              onClick={() => setImportMode('text')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest ${importMode === 'text' ? 'bg-white dark:bg-neutral-900 shadow-sm text-primary' : 'text-neutral-500'}`}
            >
              <FileText size={14} /> <span>TEXTO COPIADO</span>
            </button>
          </div>

          {importMode === 'file' ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group border border-dashed border-neutral-200 dark:border-neutral-800 rounded-[2rem] py-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all active:scale-[0.98] bg-neutral-50/30 dark:bg-black/20"
            >
              <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf,image/*" onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} />
              <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-950 rounded-2xl flex items-center justify-center text-neutral-400 group-hover:text-primary transition-all mb-4 border border-neutral-200 dark:border-neutral-800">
                {selectedFile ? <CheckCircle2 className="text-primary animate-in zoom-in" size={28} /> : <FileUp size={28} />}
              </div>
              <p className="text-[10px] font-black text-neutral-900 dark:text-white uppercase tracking-widest truncate max-w-[240px] px-4 text-center">
                {selectedFile ? selectedFile.name : 'CLIQUE PARA SUBIR ARQUIVO'}
              </p>
            </div>
          ) : (
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-32 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 text-xs font-medium outline-none focus:border-primary transition-all scrollbar-hide text-neutral-900 dark:text-white"
              placeholder="Cole o extrato de texto aqui..."
            />
          )}

          <button 
            onClick={handleProcess}
            disabled={isProcessing || (importMode === 'text' ? !inputText.trim() : !selectedFile)}
            className="w-full bg-primary text-neutral-950 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center space-x-3 disabled:opacity-30 transition-all shadow-glow hover:bg-yellow-300"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
            <span>{isProcessing ? "PROCESSANDO..." : "SINCRONIZAR FATURA"}</span>
          </button>
        </div>
      </Card>

      {/* HISTORY LIST SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-[9px] font-black text-neutral-500 uppercase tracking-[0.3em]">Histórico de Faturas</h3>
          <span className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest">{invoices.length} PROCESSADAS</span>
        </div>
        
        <div className="grid grid-cols-1 gap-3 px-1">
          {invoices.map((inv) => (
            <div 
              key={inv.id}
              className="group bg-white dark:bg-neutral-900/40 border border-neutral-100 dark:border-neutral-800 p-4 sm:p-5 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center justify-between cursor-pointer active:scale-[0.98]"
              onClick={() => setSelectedInvoice(inv)}
            >
              <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-950 rounded-xl flex items-center justify-center text-neutral-400 group-hover:text-primary transition-colors shrink-0 border border-neutral-200 dark:border-neutral-800">
                  <CreditCard size={18} />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="text-xs sm:text-sm font-display font-black text-neutral-900 dark:text-white uppercase italic tracking-tighter leading-none truncate">{inv.month}</h4>
                  <p className="text-[8px] sm:text-[9px] font-black text-neutral-400 uppercase tracking-widest truncate">{inv.bankName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
                <div className="text-right">
                  <p className="text-xs sm:text-sm font-display font-black text-neutral-900 dark:text-white italic tracking-tighter tabular-nums">R$ {inv.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-[7px] sm:text-[8px] font-bold text-neutral-400 uppercase tracking-widest">{inv.items.length} lançamentos</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDeleteInvoice(inv.id); }} 
                  className="text-neutral-300 hover:text-red-500 p-2 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {invoices.length === 0 && (
            <div className="py-12 text-center bg-neutral-50/50 dark:bg-neutral-900/20 rounded-[2rem] border-2 border-dashed border-neutral-200 dark:border-neutral-800">
               <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest italic">Nenhuma fatura sincronizada</p>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL - ULTIMATE READABILITY UPDATE */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-0 sm:p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-2xl" onClick={() => setSelectedInvoice(null)} />
          
          <div className="relative bg-neutral-950 border border-neutral-800 w-full h-full sm:h-auto sm:max-w-lg sm:rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,1)] animate-in slide-in-from-bottom duration-500 sm:max-h-[88vh] flex flex-col overflow-hidden">
            
            {/* Safe Area Header - Drastically improved for mobile notches */}
            <div className="px-6 pt-[max(4rem,calc(env(safe-area-inset-top)+1rem))] pb-6 flex justify-between items-start shrink-0 border-b border-neutral-900 bg-neutral-950/90 sticky top-0 z-20">
               <div className="space-y-1.5 min-w-0 flex-1 pr-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                    <p className="text-[9px] xs:text-[10px] font-black text-neutral-500 uppercase tracking-[0.5em] leading-none truncate">{selectedInvoice.bankName}</p>
                  </div>
                  <h3 className="text-2xl xs:text-3xl font-display font-black text-white uppercase italic tracking-tighter leading-tight truncate drop-shadow-sm">{selectedInvoice.month}</h3>
               </div>
               <button onClick={() => setSelectedInvoice(null)} className="p-3.5 bg-neutral-900 rounded-2xl text-neutral-400 hover:text-white border border-neutral-800 active:scale-90 transition-all shrink-0 shadow-lg mt-1">
                 <X size={20} strokeWidth={2.5} />
               </button>
            </div>
            
            {/* Items List - Better padding and contrast */}
            <div className="flex-1 overflow-y-auto px-4 xs:px-6 space-y-3 scrollbar-hide py-6 bg-gradient-to-b from-neutral-950 to-black">
              {selectedInvoice.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-neutral-900/40 border border-neutral-800/40 rounded-3xl transition-all hover:bg-neutral-900/60 group">
                   <div className="flex items-center space-x-4 min-w-0 flex-1">
                      <div className="w-10 h-10 xs:w-12 xs:h-12 bg-neutral-950 rounded-2xl flex items-center justify-center text-lg xs:text-xl border border-neutral-800 shrink-0 group-hover:border-primary/40 transition-colors shadow-inner">
                        {item.description.toLowerCase().includes('uber') ? '🚗' : 
                         item.description.toLowerCase().includes('mercado') ? '🛒' : 
                         item.description.toLowerCase().includes('ifood') ? '🍴' : '💳'}
                      </div>
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-[11px] xs:text-[12px] font-bold text-white uppercase tracking-tight truncate leading-none mb-2">{item.description}</p>
                        <div className="flex flex-wrap items-center gap-2">
                           <span className="text-[8px] xs:text-[9px] font-black text-neutral-500 uppercase tracking-[0.1em]">{item.date}</span>
                           {item.installments && (
                             <span className="inline-flex items-center px-2 py-0.5 border border-primary/20 rounded-md bg-primary/5 text-[8px] font-black text-primary uppercase tracking-tighter">
                               {item.installments.current}/{item.installments.total}
                             </span>
                           )}
                        </div>
                      </div>
                   </div>
                   <div className="text-right ml-2 shrink-0">
                      <p className="text-sm xs:text-base font-display font-black text-white italic tracking-tighter tabular-nums drop-shadow-sm">
                        {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                   </div>
                </div>
              ))}
            </div>

            {/* Total Footer - Safe, solid and readable */}
            <div className="mt-auto px-8 pt-6 pb-[max(2rem,calc(env(safe-area-inset-bottom)+1.5rem))] border-t border-neutral-900 bg-neutral-950 shrink-0 flex items-center justify-between gap-4 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
               <div className="flex flex-col min-w-0">
                  <span className="text-[9px] xs:text-[10px] font-black text-neutral-600 uppercase tracking-[0.5em] block mb-1">FECHAMENTO</span>
                  <span className="text-[8px] xs:text-[9px] font-bold text-neutral-500 uppercase tracking-widest truncate">{selectedInvoice.items.length} LANÇAMENTOS</span>
               </div>
               <div className="text-right shrink-0">
                  <span className="text-3xl xs:text-4xl font-display font-black text-primary italic tracking-tighter leading-none block drop-shadow-[0_0_20px_rgba(250,204,21,0.25)]">
                    R$ {selectedInvoice.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
