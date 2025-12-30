
import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Mic, Zap, RefreshCw } from 'lucide-react';

export const AlexaConnect: React.FC = () => {
  const [code, setCode] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const generateCode = () => {
    setGenerating(true);
    setTimeout(() => {
      setCode(Math.random().toString(36).substring(2, 8).toUpperCase());
      setGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-slide-up pb-24 max-w-2xl mx-auto">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-blue-500/10 rounded-[2rem] flex items-center justify-center text-blue-500 mx-auto shadow-glow border border-blue-500/20">
          <Mic size={32} />
        </div>
        <h2 className="text-3xl font-display font-black text-neutral-900 dark:text-white uppercase italic tracking-tighter">Conectar Alexa</h2>
        <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Controle sua carteira por voz</p>
      </div>

      <Card className="p-8 md:p-12 border-2 border-blue-500/20 bg-gradient-to-br from-white to-blue-50/30 dark:from-neutral-900 dark:to-blue-900/10 rounded-[3rem]">
        <div className="space-y-8">
          <div className="bg-blue-500/5 p-6 rounded-[2rem] border border-blue-500/10">
            <h4 className="font-bold text-neutral-900 dark:text-white mb-4 flex items-center italic">
              <Zap size={16} className="mr-2 text-blue-500" fill="currentColor" /> Como Parear:
            </h4>
            <ol className="space-y-4">
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">1</span>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Habilite a Skill <span className="font-bold text-blue-500">"Nossa Carteira"</span> no App Alexa.</p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">2</span>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Diga: "Alexa, abrir minha carteira".</p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-[10px] font-black flex items-center justify-center shrink-0">3</span>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">Digite ou fale o código gerado abaixo.</p>
              </li>
            </ol>
          </div>

          <div className="text-center space-y-6">
            {code ? (
              <div className="space-y-4 animate-in zoom-in-95">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Seu código único</p>
                <div className="text-5xl md:text-6xl font-display font-black text-blue-500 tracking-[0.3em] ml-[0.3em] bg-neutral-100 dark:bg-neutral-950 py-8 rounded-[2.5rem] border-2 border-dashed border-blue-500/30">
                  {code}
                </div>
                <button 
                  onClick={generateCode}
                  className="text-[10px] font-black text-neutral-500 uppercase tracking-widest hover:text-blue-500 flex items-center justify-center mx-auto"
                >
                  <RefreshCw size={12} className="mr-2" /> Gerar Novo Código
                </button>
              </div>
            ) : (
              <button 
                onClick={generateCode}
                disabled={generating}
                className="w-full bg-blue-500 text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-[0_0_30px_rgba(59,130,246,0.4)] active:scale-95 transition-all flex items-center justify-center space-x-3"
              >
                {generating ? <RefreshCw className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                <span>{generating ? 'GERANDO...' : 'GERAR CÓDIGO DE PAREAMENTO'}</span>
              </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
