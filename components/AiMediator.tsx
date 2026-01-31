
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Loader2, TrendingDown, ArrowUpRight, Lightbulb } from 'lucide-react';
import { getAiMediatorResponse } from '../services/geminiService';
import { ChatMessage, Transaction, User as UserType, Goal } from '../types';

interface AiMediatorProps {
  transactions: Transaction[];
  users: { A: UserType; B: UserType };
  goals: Goal[];
}

const SUGGESTED_PROMPTS = [
  "Como podemos economizar 10% este mês?",
  "Analise nossos maiores gastos recentes.",
  "Qual a melhor estratégia para nossas metas?",
  "Dê uma dica de investimento para o casal."
];

export const AiMediator: React.FC<AiMediatorProps> = ({ transactions, users, goals }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Olá! Sou o seu Mediador Sinc. Como seu estrategista financeiro pessoal, analisei seus fluxos e metas. Em que posso ajudar no roadmap de vocês hoje?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const currentMonthTx = transactions.filter(t => {
        const [d, m, y] = t.date.split('/').map(Number);
        return (m === currentMonth + 1 && y === currentYear) || t.isFixed;
      });

      const totalIncome = users.A.income + users.B.income;
      const totalExpenses = currentMonthTx
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

      const context = {
        users,
        recentTransactions: transactions.slice(0, 20),
        activeGoals: goals.filter(g => !g.isDeleted),
        currentBalance: totalIncome - totalExpenses,
        stats: {
          totalIncome,
          totalExpenses,
          savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
        }
      };
      
      const responseText = await getAiMediatorResponse(textToSend, context);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] w-full max-w-4xl mx-auto bg-white/60 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-xl animate-slide-up">
      {/* Header */}
      <div className="bg-white/80 dark:bg-neutral-900/80 px-6 py-5 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-glow">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-neutral-900 dark:text-white font-display font-black text-sm uppercase tracking-wider italic">Estrategista de IA</h2>
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Sincronizado com a Nuvem</p>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex space-x-2">
            <div className="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full border border-neutral-200 dark:border-neutral-700">
                <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Fintech Architect v3.0</span>
            </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 scrollbar-hide">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] md:max-w-[75%] items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-10 h-10 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shadow-md
                ${msg.role === 'user' ? 'bg-neutral-900 text-white' : 'bg-primary text-neutral-950 shadow-glow border-primary/30'}`}>
                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              
              <div className="space-y-1">
                  <div 
                    className={`px-5 py-4 rounded-[1.8rem] text-sm leading-relaxed shadow-sm border transition-all
                      ${msg.role === 'user' 
                        ? 'bg-neutral-900 text-white border-neutral-800 rounded-tr-none' 
                        : 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-800 rounded-tl-none'}
                    `}
                  >
                    {msg.text}
                  </div>
                  <p className={`text-[9px] font-black uppercase opacity-30 tracking-widest ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start items-center animate-pulse">
             <div className="bg-white/50 dark:bg-neutral-900/50 p-4 rounded-[1.5rem] border border-neutral-200 dark:border-neutral-800 flex items-center space-x-3 shadow-sm">
                <Loader2 size={16} className="text-primary animate-spin" />
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Processando Roadmaps...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input & Suggestions */}
      <div className="p-4 md:p-8 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 shrink-0">
        <div className="mb-6 flex overflow-x-auto pb-2 space-x-3 scrollbar-hide">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button 
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    disabled={loading}
                    className="flex-shrink-0 px-5 py-2.5 rounded-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[10px] font-black text-neutral-500 uppercase tracking-widest hover:border-primary hover:text-primary transition-all active:scale-95 flex items-center space-x-2"
                >
                    <Lightbulb size={12} />
                    <span>{prompt}</span>
                </button>
            ))}
        </div>

        <div className="relative flex items-center bg-white dark:bg-neutral-900 p-2 rounded-[2rem] border-2 border-neutral-100 dark:border-neutral-800 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 transition-all shadow-xl">
          <textarea
            rows={1}
            className="flex-1 bg-transparent border-none outline-none px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 resize-none min-h-[56px] max-h-[150px] scrollbar-hide"
            placeholder="Pergunte ao estrategista..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="ml-2 w-14 h-14 flex items-center justify-center bg-primary rounded-[1.4rem] text-neutral-950 hover:bg-yellow-300 disabled:opacity-30 disabled:grayscale transition-all shadow-glow active:scale-90"
          >
            <Send size={22} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
