
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Loader2, Lightbulb, Zap, TrendingUp, ShieldCheck } from 'lucide-react';
import { getAiMediatorResponse } from '../services/geminiService';
import { ChatMessage, Transaction, User as UserType, Goal } from '../types';

interface AiMediatorProps {
  transactions: Transaction[];
  users: { A: UserType; B: UserType };
  goals: Goal[];
}

const SUGGESTED_PROMPTS = [
  { label: "Plano de Economia", icon: <TrendingUp size={14} />, text: "Como podemos economizar 10% da nossa renda conjunta este mês?" },
  { label: "Análise de Gastos", icon: <Zap size={14} />, text: "Analise nossos gastos recentes e identifique onde estamos 'vazando' dinheiro." },
  { label: "Meta Prioritária", icon: <Sparkles size={14} />, text: "Qual a melhor estratégia para atingirmos nossa meta mais próxima mais rápido?" },
  { label: "Dica do PM", icon: <Bot size={14} />, text: "Como PM financeiro, qual o maior 'insight' que você tem sobre o nosso comportamento de gastos hoje?" }
];

export const AiMediator: React.FC<AiMediatorProps> = ({ transactions, users, goals }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Saudações! Sou o seu Mediador Sinc. Como seu Strategist Financeiro, analisei seus KPIs e o roadmap de metas. Em qual frente estratégica vamos atuar hoje?",
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
      const totalIncome = users.A.income + users.B.income;
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

      const context = {
        users,
        recentTransactions: transactions.slice(-15),
        activeGoals: goals.filter(g => !g.isDeleted),
        currentBalance: totalIncome - expenses,
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
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] w-full max-w-4xl mx-auto bg-white/60 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-xl animate-slide-up">
      {/* Premium Header */}
      <div className="bg-white/80 dark:bg-neutral-900/80 px-6 py-5 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-glow">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-neutral-900 dark:text-white font-display font-black text-sm uppercase tracking-wider italic">Estrategista Sinc</h2>
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">IA Sincronizada</p>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-2">
            <div className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-full border border-neutral-200 dark:border-neutral-700">
                <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Fintech PM v3.0</span>
            </div>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-8 scrollbar-hide">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[85%] md:max-w-[75%] items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-10 h-10 rounded-2xl border flex items-center justify-center shadow-lg transition-transform hover:scale-110
                ${msg.role === 'user' 
                  ? 'bg-neutral-900 text-white border-neutral-800' 
                  : 'bg-primary text-neutral-950 shadow-glow border-primary/30'}`}>
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
          <div className="flex justify-start items-center">
             <div className="bg-white/50 dark:bg-neutral-900/50 p-4 rounded-[1.5rem] border border-neutral-200 dark:border-neutral-800 flex items-center space-x-3 shadow-sm animate-pulse">
                <Loader2 size={16} className="text-primary animate-spin" />
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Gerando Roadmap...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts & Input Area */}
      <div className="p-4 md:p-8 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 shrink-0">
        <div className="mb-6 flex overflow-x-auto pb-2 space-x-3 scrollbar-hide">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button 
                    key={idx}
                    onClick={() => handleSend(prompt.text)}
                    disabled={loading}
                    className="flex-shrink-0 px-5 py-2.5 rounded-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-[10px] font-black text-neutral-500 uppercase tracking-widest hover:border-primary hover:text-primary transition-all active:scale-95 flex items-center space-x-2"
                >
                    <span className="opacity-60">{prompt.icon}</span>
                    <span>{prompt.label}</span>
                </button>
            ))}
        </div>

        <div className="relative flex items-center bg-white dark:bg-neutral-900 p-2 rounded-[2rem] border-2 border-neutral-100 dark:border-neutral-800 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5 transition-all shadow-xl group">
          <textarea
            rows={1}
            className="flex-1 bg-transparent border-none outline-none px-6 py-4 text-sm font-medium text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 resize-none min-h-[56px] max-h-[150px] scrollbar-hide"
            placeholder="Consulte o estrategista..."
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
        
        <div className="mt-4 flex items-center justify-center space-x-2 opacity-30">
            <ShieldCheck size={10} />
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Criptografia Financeira de Ponta a Ponta</span>
        </div>
      </div>
    </div>
  );
};
