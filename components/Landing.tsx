import React, { useState, useEffect } from 'react';
import { ArrowRight, Heart, Target, RefreshCw, LogIn, ChevronRight, CheckCircle2 } from 'lucide-react';

const FadeIn: React.FC<{ delay: number; duration: number; children: React.ReactNode; className?: string }> = ({ delay, duration, children, className = '' }) => {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`transition-opacity ${className}`}
      style={{
        opacity: show ? 1 : 0,
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'ease-out'
      }}
    >
      {children}
    </div>
  );
};

interface AnimatedHeadingProps {
  text: string;
}

const AnimatedHeading: React.FC<AnimatedHeadingProps> = ({ text }) => {
  const [started, setStarted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 200); // 200ms initial delay
    
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
    }
    
    return () => {
      clearTimeout(t);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', listener);
      }
    };
  }, []);

  const lines = text.split('\n');
  const wordDelay = 80;

  return (
    <h1 
      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-medium mb-6 leading-[1.1] drop-shadow-2xl" 
      style={{ letterSpacing: '-0.04em' }}
    >
      {lines.map((line, lineIndex) => {
        return (
          <div key={lineIndex} className="block">
            {line.split(' ').map((word, wordIndex) => {
              const delay = (lineIndex * 4 * wordDelay) + (wordIndex * wordDelay);
              
              return (
                <span
                  key={wordIndex}
                  className="inline-block mr-3.5 transition-all"
                  style={prefersReducedMotion ? {
                    opacity: started ? 1 : 0,
                    transitionDuration: '300ms',
                    transitionDelay: `${delay}ms`
                  } : {
                    opacity: started ? 1 : 0,
                    transform: started ? 'translateY(0)' : 'translateY(12px)',
                    transitionDuration: '500ms',
                    transitionDelay: `${delay}ms`,
                    transitionTimingFunction: 'ease-out'
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        );
      })}
    </h1>
  );
};

export const Landing: React.FC<{ onStartClick: () => void }> = ({ onStartClick }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-neutral-950 text-white overflow-x-hidden font-sans">
      
      {/* Hero Section */}
      <div className="relative min-h-[100svh] flex flex-col pt-24">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            className="w-full h-full object-cover"
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          {/* Subtle gradient for text readability without being too muddy */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        </div>

        {/* Navbar */}
        <div className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 flex justify-center ${scrolled ? 'pt-4' : 'pt-8'}`}>
          <div className="px-4 w-full flex justify-center">
            <nav className={`rounded-full px-6 py-3 flex items-center justify-between transition-all duration-500 border backdrop-blur-xl w-full max-w-5xl ${scrolled ? 'bg-black/60 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]' : 'bg-black/20 border-white/10 shadow-2xl'}`}>
              
              {/* Logo */}
              <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                <div className="w-10 h-10 bg-neutral-900 border border-primary/30 rounded-full flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
                  <Heart size={18} className="text-primary fill-primary/20" />
                </div>
                <div>
                  <h1 className="text-xl font-display font-black tracking-tighter italic leading-none">
                    Nossa <span className="text-primary">Carteira</span>
                  </h1>
                </div>
              </div>

              {/* Center Links (hidden on mobile) */}
              <div className="hidden md:flex items-center gap-10 text-[11px] font-bold tracking-[0.2em] uppercase">
                <a href="#funcionalidades" className="text-neutral-300 hover:text-white transition-colors">Recursos</a>
                <a href="#como-funciona" className="text-neutral-300 hover:text-white transition-colors">Como Funciona</a>
                <a href="#depoimentos" className="text-neutral-300 hover:text-white transition-colors">Depoimentos</a>
              </div>

              {/* Right Button */}
              <div>
                <button onClick={onStartClick} className="bg-primary text-neutral-950 px-6 py-3 rounded-full text-xs font-black uppercase tracking-[0.15em] hover:bg-yellow-300 hover:scale-105 active:scale-95 transition-all shadow-glow flex items-center space-x-2">
                  <span className="hidden sm:inline">Acessar App</span>
                  <span className="sm:hidden">Entrar</span>
                  <LogIn size={16} strokeWidth={2.5} className="hidden sm:block ml-1" />
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 px-6 md:px-12 lg:px-16 flex-1 flex flex-col justify-end pb-16 md:pb-24 max-w-7xl mx-auto w-full">
          <div className="w-full lg:grid lg:grid-cols-12 gap-12 items-end">
            
            {/* Left Column */}
            <div className="w-full lg:col-span-8">
              <AnimatedHeading text={"O fim das brigas\npor dinheiro."} />
              
              <FadeIn delay={800} duration={1000} className="mb-8">
                <p className="text-lg md:text-xl lg:text-2xl text-neutral-200 max-w-2xl font-light leading-relaxed drop-shadow-md">
                  Para casais que constroem juntos. Sincronize gastos, atinja metas e tenha o controle do futuro de vocês.
                </p>
              </FadeIn>
              
              <FadeIn delay={1200} duration={1000}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <button onClick={onStartClick} className="bg-primary text-neutral-950 px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest hover:bg-yellow-300 transition-all shadow-glow hover:scale-105 flex items-center space-x-2 w-full sm:w-auto justify-center group">
                    <span>Começar Teste Grátis</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="liquid-glass border border-white/20 text-white px-8 py-4 rounded-full text-xs font-bold tracking-widest uppercase transition-all hover:bg-white/10 hover:border-white w-full sm:w-auto justify-center">
                    Ver Funcionalidades
                  </button>
                </div>
              </FadeIn>
            </div>

            {/* Right Column */}
            <div className="w-full lg:col-span-4 flex items-end justify-start lg:justify-end mt-12 lg:mt-0">
              <FadeIn delay={1400} duration={1000}>
                <div className="liquid-glass border-l-4 border-l-primary border-t border-t-white/10 border-r border-r-white/10 border-b border-b-white/10 pl-6 pr-8 py-5 rounded-2xl inline-flex flex-col backdrop-blur-md bg-black/40">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Estatística</span>
                  <p className="text-2xl font-light text-white leading-tight">
                    <span className="font-bold">68%</span> das brigas<br/>são financeiras.
                  </p>
                  <span className="text-xs text-neutral-400 mt-2">Mude essa realidade hoje.</span>
                </div>
              </FadeIn>
            </div>
            
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="funcionalidades" className="py-24 bg-neutral-950 px-6 md:px-12 lg:px-16 border-t border-neutral-900 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
             <h2 className="text-primary font-black uppercase tracking-widest text-xs mb-4">A Ferramenta Definitiva</h2>
             <h3 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">Criado especificamente<br/>para a vida a dois.</h3>
             <p className="text-neutral-400 max-w-2xl mx-auto text-lg leading-relaxed">Esqueça planilhas complexas ou aplicativos individuais que não conversam entre si. A Nossa Carteira sincroniza tudo magicamente.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
             <FeatureCard 
               icon={<RefreshCw strokeWidth={1.5} className="text-primary" size={32} />} 
               title="Sincronização em Tempo Real" 
               description="Você adiciona uma compra no mercado, e instantaneamente aparece no celular do seu parceiro."
             />
             <FeatureCard 
               icon={<Target strokeWidth={1.5} className="text-primary" size={32} />} 
               title="Metas Compartilhadas" 
               description="A viagem dos sonhos ou a compra da casa. Guardem dinheiro juntos para os mesmos objetivos."
             />
             <FeatureCard 
               icon={<Heart strokeWidth={1.5} className="text-primary" size={32} />} 
               title="Sem Julgamentos" 
               description="Tenha visibilidade das contas da casa enquanto mantêm a individualidade e privacidade necessárias."
             />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-24 bg-neutral-900/50 px-6 md:px-12 lg:px-16 border-t border-neutral-900 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
             <h2 className="text-primary font-black uppercase tracking-widest text-xs mb-4">Simples e Rápido</h2>
             <h3 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">Como Funciona?</h3>
             <p className="text-neutral-400 max-w-2xl mx-auto text-lg leading-relaxed">Em menos de 3 minutos vocês já estarão sincronizados e prontos para usar o aplicativo.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
             <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-neutral-800" />
             <StepCard 
               step="1"
               title="Crie sua conta" 
               description="Comece seu teste de 30 dias grátis. Você só precisa de um e-mail."
             />
             <StepCard 
               step="2"
               title="Defina o perfil" 
               description="Nós configuramos automaticamente os avatares e o espaço do casal usando seus nomes."
             />
             <StepCard 
               step="3"
               title="Tudo pronto!" 
               description="Acesse o mesmo link no outro celular, escolha de quem é o aparelho e pronto: vocês já estão sincronizados."
             />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="depoimentos" className="py-24 bg-neutral-950 px-6 md:px-12 lg:px-16 border-t border-neutral-900 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
             <h2 className="text-primary font-black uppercase tracking-widest text-xs mb-4">Histórias Reais</h2>
             <h3 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">Casais que mudaram<br/>sua relação com dinheiro.</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
             <TestimonialCard 
               quote="Antes era uma briga no fim do mês para ver quem pagou o quê pelo WhatsApp. Agora, cada um lança sua parte e o app faz a mágica. Simples assim."
               author="Mariana e Lucas"
               time="Usam há 4 meses"
             />
             <TestimonialCard 
               quote="O que eu mais gosto são as metas compartilhadas. Ver a barra da nossa reserva de emergência crescendo juntos mudou a nossa mentalidade financeira."
               author="Pedro e Juliana"
               time="Usam há 8 meses"
             />
             <TestimonialCard 
               quote="A gente tentou planilhas, banco compartilhado e outros apps. A Nossa Carteira foi a única solução que não pareceu um 'trabalho' preencher."
               author="Carlos e Amanda"
               time="Usam há 1 ano"
             />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 bg-neutral-950 pt-24 pb-32 border-t border-neutral-900 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="text-center mb-16">
            <h2 className="text-primary font-black uppercase tracking-widest text-xs mb-4">Planos e Preços</h2>
            <h3 className="text-4xl md:text-5xl font-medium tracking-tight mb-6">
              Um valor justo por<br/>paz de espírito
            </h3>
            <p className="text-neutral-400 max-w-lg mx-auto text-lg leading-relaxed">
              Menos do que o casal gasta em um lanche de fim de semana.
            </p>
          </div>

          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-[3rem] p-10 relative shadow-2xl">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-neutral-950 font-black uppercase text-[10px] tracking-widest px-6 py-2 rounded-full shadow-glow">
              Plano Casal
            </div>
            
            <div className="text-center mb-10 mt-4">
              <span className="text-neutral-400 text-xl font-medium pr-1">R$</span>
              <span className="text-7xl font-display font-medium tracking-tighter text-white">19</span>
              <span className="text-2xl font-medium text-neutral-400">,90</span>
              <span className="text-neutral-500 font-bold ml-2 text-sm">/ mês</span>
            </div>

            <div className="space-y-5 mb-10">
              {[
                'Acesso para 2 contas simultâneas',
                'Lançamentos e sincronização ilimitada',
                'Gestão de metas compartilhadas',
                'Faturas e lista de mercado',
                'Relatórios avançados'
              ].map((feature, i) => (
                <div key={i} className="flex items-center space-x-4 text-sm font-medium text-neutral-300">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={14} className="text-primary" strokeWidth={3} />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={onStartClick}
              className="w-full bg-white text-neutral-950 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-neutral-200 transition-all shadow-xl hover:scale-105 active:scale-95 flex justify-center items-center gap-2"
            >
              <span>Assinar Agora</span>
              <ArrowRight size={16} />
            </button>
            <p className="text-center text-xs text-neutral-500 mt-6">Teste 30 dias grátis. Cancele quando quiser.</p>
          </div>
        </div>
      </section>

      {/* Social Proof / CTA Section */}
      <section className="py-24 px-6 md:px-12 lg:px-16 bg-neutral-900/50 border-t border-neutral-900 text-center">
        <h3 className="text-3xl md:text-4xl font-medium mb-6">Prontos para organizar a vida financeira?</h3>
        <p className="text-neutral-400 mb-10 max-w-xl mx-auto">Junte-se à Nossa Carteira e transforme a maneira como você e seu parceiro lidam com o dinheiro.</p>
        <button onClick={onStartClick} className="bg-primary text-neutral-950 px-10 py-5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-yellow-300 hover:scale-105 transition-all shadow-glow">
           Criar Conta do Casal
        </button>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-neutral-500 text-xs border-t border-neutral-900 flex flex-col md:flex-row items-center justify-between px-6 md:px-12 lg:px-16 max-w-7xl mx-auto w-full">
         <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Heart size={14} className="text-primary" />
            <span className="font-bold tracking-wider uppercase">Nossa Carteira</span>
         </div>
         <p>© {new Date().getFullYear()} Nossa Carteira. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="bg-neutral-900/50 border border-neutral-800 p-8 rounded-3xl hover:bg-neutral-900 hover:border-neutral-700 transition-colors group">
    <div className="w-16 h-16 bg-neutral-950 border border-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-glow">
      {icon}
    </div>
    <h4 className="text-xl font-bold mb-3 text-white">{title}</h4>
    <p className="text-neutral-400 leading-relaxed text-sm">{description}</p>
  </div>
);

const StepCard = ({ step, title, description }: { step: string, title: string, description: string }) => (
  <div className="flex flex-col items-center relative z-10 text-center">
    <div className="w-24 h-24 bg-neutral-950 border-4 border-neutral-800 rounded-full flex items-center justify-center mb-8 shadow-2xl relative">
       <span className="text-4xl font-display font-black italic text-white">{step}</span>
       <div className="absolute inset-0 border-2 border-primary rounded-full blur-[4px] opacity-20"></div>
    </div>
    <h4 className="text-2xl font-bold mb-4 text-white">{title}</h4>
    <p className="text-neutral-400 leading-relaxed text-[15px] max-w-xs">{description}</p>
  </div>
);

const TestimonialCard = ({ quote, author, time }: { quote: string, author: string, time: string }) => (
  <div className="bg-neutral-900/40 border border-neutral-800 p-8 rounded-3xl relative">
    <div className="text-primary text-6xl font-serif absolute top-6 left-6 opacity-20">"</div>
    <p className="text-lg text-neutral-300 leading-relaxed mb-8 relative z-10 pt-4 font-light">
      "{quote}"
    </p>
    <div className="flex items-center space-x-4 border-t border-neutral-800 pt-6">
       <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-500 font-bold uppercase">
         {author.charAt(0)}
       </div>
       <div>
         <p className="text-white font-bold text-sm tracking-wide">{author}</p>
         <p className="text-neutral-500 text-xs mt-1">{time}</p>
       </div>
    </div>
  </div>
);
