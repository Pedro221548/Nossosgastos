
import React, { useState, useRef, useEffect } from 'react';
import { Card } from './ui/Card';
import { Send, Sparkles, User, Bot, Loader2 } from 'lucide-react';
import { getAiMediatorResponse } from '../services/geminiService';
import { ChatMessage, Transaction, User as UserType } from '../types';

interface AiMediatorProps {
  transactions: Transaction[];
  users: { A: UserType; B: UserType };
}

export const AiMediator: React.FC<AiMediatorProps> = ({ transactions, users }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Olá! Analisei os lançamentos reais de vocês no banco de dados. Como posso ajudar com o planejamento do casal hoje?",
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

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Usando dados reais vindos do Firebase via props
      const context = {
        users,
        recentSharedTransactions: transactions.slice(0, 10), // Envia os 10 últimos para contexto
        totalExpenses: transactions.reduce((acc, t) => acc + t.amount, 0)
      };
      
      const responseText = await getAiMediatorResponse(input, context);
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
    <div className="flex flex-col h-[calc(100vh-180px)] md:h-[750px] w-full max-w-3xl mx-auto bg-white/40 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-xl animate-slide-up">
      {/* Chat Header */}
      <div className="bg-white/80 dark:bg-neutral-900/80 px-6 py-5 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 shrink-0">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-glow">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-neutral-900 dark:text-white font-display font-bold text-sm uppercase tracking-wider">Coach Financeiro Real</h2>
            <div className="flex items-center space-x-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Sincronizado com o Banco</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide">
        {messages.map(msg => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[90%] md:max-w-[85%] items-end space-x-2 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shadow-sm
                ${msg.role === 'user' ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white' : 'bg-primary text-neutral-900'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              <div 
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm border
                  ${msg.role === 'user' 
                    ? 'bg-primary/10 text-neutral-900 dark:text-white border-primary/20 rounded-br-sm' 
                    : 'bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800 rounded-bl-sm'}
                `}
              >
                {msg.text}
                <div className={`text-[8px] font-bold mt-1 uppercase opacity-40 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start items-center">
             <div className="bg-white dark:bg-neutral-950 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center space-x-3 shadow-sm">
                <Loader2 size={16} className="text-primary animate-spin" />
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Consultando Banco de Dados...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-t border-neutral-200 dark:border-neutral-800 shrink-0">
        <div className="relative flex items-center bg-neutral-50 dark:bg-neutral-950 p-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 focus-within:border-primary transition-all">
          <textarea
            rows={1}
            className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 resize-none min-h-[44px] max-h-[120px]"
            placeholder="Analise nossos gastos reais..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="ml-2 w-11 h-11 flex items-center justify-center bg-primary rounded-xl text-neutral-950 hover:bg-yellow-300 disabled:opacity-30 disabled:grayscale transition-all shadow-glow active:scale-90"
          >
            <Send size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
