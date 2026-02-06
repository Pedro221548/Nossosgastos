
import React, { useState, useRef } from 'react';
import { Invoice, InvoiceItem } from '../types';
import { FileText, Upload, ChevronRight, CreditCard, Loader2, Search, Trash2, X, FileUp, FileType, Zap, CheckCircle2 } from 'lucide-react';
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
  const [importMode, setImportMode] = useState<'text' | 'file'>('file');
  const [showInput, setShowInput] = useState(false);
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
        bankName: result.bankName || "BANCO DESCONHECIDO",
        month: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase(),
        totalAmount: result.totalAmount || 0,
        processedAt: new Date().toLocaleDateString('pt-BR'),
        items: result.items || []
      };

      onSaveInvoice(newInvoice);
      resetForm();
    } catch (error) {
      console.error(error);
      alert("Erro ao processar fatura. Verifique o arquivo.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setInputText('');
    setSelectedFile(null);
    setShowInput(false);
  };

  return (
    <div className="space-y-8 animate-slide-up pb-32 max-w-4xl mx-auto px-2">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl md:text-5xl font-display font-black text-neutral-900 dark:text-white uppercase tracking-tighter italic leading-none">
            FATURAS <span className="text-primary">INTELIGENTES</span>
          </h2>
          <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.4em] ml-1">IA MULTIMODAL V3.0</p>
        </div>
        <button 
          onClick={() => setShowInput(!showInput)}
          className="bg-primary text-neutral-950 px-10 py-5 rounded-[2.2rem] font-black uppercase tracking-widest text-[11px] shadow-glow flex items-center justify-center space-x-3 active:scale-95 transition-all w-full md:w-auto"
        >
          {showInput ? <X size={18} /> : <Upload size={18} />}
          <span>{showInput ? "CANCELAR" : "IMPORTAR AGORA"}</span>
        </button>
      </div>

      {showInput && (
        <Card variant="accent" className="animate-in slide-in-from-top duration-500 rounded-[3rem] border-primary/30">
          <div className="space-y-6">
            <div className="flex bg-neutral-100 dark:bg-neutral-950 p-2 rounded-[2rem] border border-neutral-200 dark:border-neutral-800">
              <button 
                onClick={() => setImportMode('file')}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest ${importMode === 'file' ? 'bg-white dark:bg-neutral-900 shadow-xl text-primary' : 'text-neutral-500'}`}
              >
                <FileType size={16} /> <span>PDF / FOTO</span>
              </button>
              <button 
                onClick={() => setImportMode('text')}
                className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest ${importMode === 'text' ? 'bg-white dark:bg-neutral-900 shadow-xl text-primary' : 'text-neutral-500'}`}
              >
                <FileText size={16} /> <span>COPIAR TEXTO</span>
              </button>
            </div>

            {importMode === 'file' ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-[3rem] py-20 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all hover:bg-primary/5 active:scale-[0.98]"
              >
                <input type="file" ref={fileInputRef} className="hidden" accept="application/pdf,image/*" onChange={(e) => e.target.files && setSelectedFile(e.target.files[0])} />
                <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-950 rounded-[2.5rem] flex items-center justify-center text-neutral-400 group-hover:text-primary transition-all mb-6 shadow-inner border border-transparent group-hover:border-primary/20">
                  {selectedFile ? <CheckCircle2 className="text-primary animate-in zoom-in" size={40} /> : <FileUp size={40} />}
                </div>
                <div className="text-center px-6">
                  <p className="text-sm font-black text-neutral-900 dark:text-white uppercase tracking-widest mb-1 truncate max-w-[300px]">
                    {selectedFile ? selectedFile.name : 'CLIQUE PARA CARREGAR'}
                  </p>
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">PDF, JPG ou PNG</p>
                </div>
              </div>
            ) : (
              <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-48 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] p-8 text-sm font-medium outline-none focus:border-primary transition-all scrollbar-hide shadow-inner"
                placeholder="Cole aqui os dados da fatura..."
              />
            )}

            <button 
              onClick={handleProcess}
              disabled={isProcessing || (importMode === 'text' ? !inputText.trim() : !selectedFile)}
              className="w-full bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 py-7 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center space-x-4 disabled:opacity-30 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} fill="currentColor" />}
              <span>{isProcessing ? "IA ESCANEANDO..." : "SINCROMIZAR AGORA"}</span>
            </button>
          </div>
        </Card>
      )}

      {/* HISTORY LIST */}
      <div className="space-y-4">
        <h3 className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.4em] px-3">HISTÓRICO DE PROCESSAMENTOS</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {invoices.map((inv) => (
            <div 
              key={inv.id}
              className="group bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-8 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all relative overflow-hidden cursor-pointer active:scale-95"
              onClick={() => setSelectedInvoice(inv)}
            >
              <div className="absolute -top-4 -right-4 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <CreditCard size={100} />
              </div>
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">{inv.bankName}</span>
                  <h4 className="text-2xl font-display font-black text-neutral-900 dark:text-white uppercase italic tracking-tighter leading-none">{inv.month}</h4>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">VALOR TOTAL</p>
                  <p className="text-2xl font-display font-black text-neutral-900 dark:text-white italic tracking-tighter leading-none">
                    R$ {inv.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-neutral-50 dark:border-neutral-800 relative z-10">
                <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">{inv.items.length} LANÇAMENTOS</span>
                <div className="flex space-x-2">
                   <button onClick={(e) => { e.stopPropagation(); onDeleteInvoice(inv.id); }} className="p-3 text-neutral-300 hover:text-red-500 transition-colors bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-transparent hover:border-red-500/20"><Trash2 size={18} /></button>
                   <div className="p-3 text-neutral-300 group-hover:text-primary transition-colors bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-transparent group-hover:border-primary/20"><ChevronRight size={18} /></div>
                </div>
              </div>
            </div>
          ))}
          {invoices.length === 0 && (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-[4rem]">
              <p className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.6em] italic">Nenhuma fatura processada</p>
            </div>
          )}
        </div>
      </div>

      {/* DETAIL MODAL - MATCHING THE REFERENCE IMAGE */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/98 backdrop-blur-2xl" onClick={() => setSelectedInvoice(null)} />
          
          <div className="relative bg-[#050505] border border-neutral-800 w-full max-w-2xl rounded-[4rem] shadow-[0_0_120px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-500 max-h-[92dvh] overflow-hidden flex flex-col">
            
            {/* Header Fixo do Modal */}
            <div className="px-8 pt-10 pb-6 md:px-12 md:pt-12 flex justify-between items-start shrink-0">
               <div className="space-y-1">
                  <p className="text-[11px] font-black text-neutral-600 uppercase tracking-[0.5em] ml-1">{selectedInvoice.bankName}</p>
                  <h3 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-white uppercase italic tracking-tighter leading-[0.9]">{selectedInvoice.month}</h3>
               </div>
               <button onClick={() => setSelectedInvoice(null)} className="p-4 bg-neutral-900/50 rounded-full text-neutral-500 hover:text-white transition-all active:scale-90 border border-neutral-800"><X size={28} /></button>
            </div>
            
            {/* Lista com Scroll Interno */}
            <div className="flex-1 overflow-y-auto px-6 md:px-10 space-y-3 scrollbar-hide pb-10">
              {selectedInvoice.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-5 bg-neutral-900/40 border border-neutral-800/60 rounded-[2.2rem] hover:bg-neutral-900/80 transition-all group">
                   <div className="flex items-center space-x-5 min-w-0">
                      <div className="w-14 h-14 bg-neutral-950 rounded-[1.5rem] flex items-center justify-center text-2xl shadow-inner shrink-0 border border-neutral-800 group-hover:border-primary/20 transition-colors">
                        {item.description.toLowerCase().includes('uber') ? '🚗' : 
                         item.description.toLowerCase().includes('mercado') ? '🛒' : 
                         item.description.toLowerCase().includes('ifood') ? '🍴' : '💳'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base md:text-lg font-display font-black text-white uppercase italic leading-none mb-2 truncate pr-2">{item.description}</p>
                        <div className="flex flex-wrap items-center gap-3">
                           <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{item.date}</span>
                           {item.installments && (
                             <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-blue-500/30">
                               PARCELA {item.installments.current}/{item.installments.total}
                             </span>
                           )}
                        </div>
                      </div>
                   </div>
                   <div className="text-right shrink-0">
                      <p className="text-xl md:text-2xl font-display font-black text-white italic tracking-tighter tabular-nums">
                        <span className="text-xs mr-1 text-neutral-600">R$</span>
                        {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                   </div>
                </div>
              ))}
            </div>

            {/* Footer Fixo com Totalizador Gigante (Exatamente como a imagem) */}
            <div className="mt-auto px-8 py-10 md:px-12 md:py-12 border-t border-neutral-900 bg-black/80 backdrop-blur-md shrink-0 flex flex-col items-center">
               <span className="text-[11px] font-black text-neutral-600 uppercase tracking-[0.6em] mb-4">TOTAL DA FATURA</span>
               <span className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-primary italic tracking-tighter leading-none drop-shadow-[0_0_30px_rgba(250,204,21,0.3)]">
                 R$ {selectedInvoice.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
               </span>
               <div className="h-2 w-24 bg-primary/20 rounded-full mt-8 blur-sm"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
