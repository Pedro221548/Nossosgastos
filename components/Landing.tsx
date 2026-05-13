import React from 'react';
import { Heart, ShieldCheck, Zap, TrendingUp, ChevronRight, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export const Landing: React.FC<{ onStartClick: () => void }> = ({ onStartClick }) => {
  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-neutral-900 border border-primary/30 rounded-xl flex items-center justify-center shadow-glow">
            <Heart size={20} className="text-primary" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl font-display font-black uppercase tracking-tighter italic leading-none">
              Nossa <span className="text-primary">Carteira</span>
            </h1>
          </div>
        </div>
        <button 
          onClick={onStartClick}
          className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary hover:text-yellow-300 transition-colors"
        >
          Entrar / Cadastrar
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8">
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">O app financeiro definitivo para casais</span>
        </div>
        
        <h2 className="text-5xl sm:text-7xl md:text-8xl font-display font-black uppercase tracking-tighter italic leading-[0.9] text-white max-w-4xl">
          PAREM DE BRIGAR <br/> POR CAUSA DE <span className="text-primary">DINHEIRO.</span>
        </h2>
        
        <p className="mt-8 text-lg sm:text-xl text-neutral-400 max-w-2xl font-medium">
          Diga adeus às planilhas confusas e grupos do WhatsApp. Sincronize gastos, divida as contas e alcance metas com o seu parceiro(a) em tempo real.
        </p>

        <button 
          onClick={onStartClick}
          className="mt-12 bg-primary text-neutral-950 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm shadow-glow hover:bg-yellow-300 transition-all flex items-center space-x-3 active:scale-95"
        >
          <span>Começar Teste Grátis de 7 Dias</span>
          <ArrowRight size={18} strokeWidth={3} />
        </button>

        <p className="mt-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
          Sem compromisso. Cancele quando quiser.
        </p>

        {/* Dashboard Preview Mockup */}
        <div className="mt-24 w-full max-w-5xl rounded-[2rem] border border-neutral-800 bg-neutral-900/50 backdrop-blur-xl p-4 sm:p-8 shadow-2xl relative">
          <div className="absolute top-0 right-10 w-32 h-32 bg-primary/20 blur-[60px] rounded-full"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-neutral-950 rounded-2xl p-6 border border-neutral-800">
              <Zap className="text-primary mb-4" />
              <h3 className="text-sm font-black uppercase tracking-widest mb-2">Sincronização Real</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">Adicionou uma despesa? O celular do seu amor apita na mesma hora.</p>
            </div>
            <div className="bg-neutral-950 rounded-2xl p-6 border border-neutral-800">
              <TrendingUp className="text-emerald-500 mb-4" />
              <h3 className="text-sm font-black uppercase tracking-widest mb-2">Metas do Casal</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">Viagem de fim de ano ou casa nova? Guardem juntos e vejam o progresso.</p>
            </div>
            <div className="bg-neutral-950 rounded-2xl p-6 border border-neutral-800">
              <Lock className="text-blue-500 mb-4" />
              <h3 className="text-sm font-black uppercase tracking-widest mb-2">Privacidade</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">Mostre apenas o que quiser. Vocês decidem o nível de transparência financeira.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Pricing Section */}
      <section className="relative z-10 bg-black pt-24 pb-32 border-t border-neutral-900 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl sm:text-5xl font-display font-black uppercase tracking-tighter italic text-center mb-4">
            Um valor justo por<br/><span className="text-primary">Paz de Espírito</span>
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base mb-16 text-center max-w-lg">
            Menos do que o casal gasta em um lanche de fim de semana.
          </p>

          <div className="w-full max-w-md bg-neutral-900 border-2 border-primary/30 rounded-[3rem] p-10 relative shadow-glow">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-neutral-950 font-black uppercase text-[10px] tracking-widest px-4 py-2 rounded-full">
              Plano Casal Premium
            </div>
            
            <div className="text-center mb-8">
              <span className="text-primary text-2xl font-bold pr-1">R$</span>
              <span className="text-6xl font-display font-black italic tracking-tighter">19</span>
              <span className="text-2xl font-bold">,90</span>
              <span className="text-neutral-500 font-bold ml-2">/ mês</span>
            </div>

            <div className="space-y-4 mb-10">
              {[
                'Acesso para 2 contas conectadas',
                'Lançamentos ilimitados',
                'Extratos em formato PDF (TBA)',
                'Sistema de Metas inteligente',
                'Widgets de recomendação'
              ].map((feature, i) => (
                <div key={i} className="flex items-center space-x-3 text-sm font-medium text-neutral-300">
                  <CheckCircle2 size={18} className="text-primary shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={onStartClick}
              className="w-full bg-white text-neutral-950 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-neutral-200 transition-colors"
            >
              Assinar Agora
            </button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-900 py-10 text-center">
        <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest">
          © {new Date().getFullYear()} NOSSA CARTEIRA S.A.
        </p>
      </footer>
    </div>
  );
};
