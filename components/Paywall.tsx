import React, { useState } from 'react';
import { Heart, CheckCircle2, ShieldCheck, Zap, LogOut, Loader2 } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, syncData } from '../services/firebase';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

initMercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || "TEST-b02d8471-bc0d-40d6-8b22-cadb3b4d2454", { locale: 'pt-BR' });

interface PaywallProps {
  onSubscribeSuccess: () => void;
}

export const Paywall: React.FC<PaywallProps> = ({ onSubscribeSuccess }) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [brickError, setBrickError] = useState(false);
  const [loading, setLoading] = useState(false);

  const simulateCheckout = () => {
    setLoading(true);
    setTimeout(async () => {
      await syncData('subscription', {
        status: 'active',
        plan: 'premium',
        since: new Date().toISOString()
      });
      setLoading(false);
      onSubscribeSuccess();
    }, 2500);
  };

  const handlePaymentSubmit = async (paymentFormData: any) => {
    return new Promise<void>((resolve, reject) => {
      fetch("/api/process_payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentFormData),
      })
        .then((response) => response.json())
        .then(async (data) => {
          if (data.status === 'approved' || typeof data.id !== 'undefined') {
            await syncData('subscription', {
              status: 'active',
              plan: 'premium',
              since: new Date().toISOString()
            });
            resolve();
            onSubscribeSuccess();
          } else {
            console.error('Pagamento rejeitado:', data);
            reject();
          }
        })
        .catch((error) => {
          console.error("Erro ao processar pagamento", error);
          reject();
        });
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-start md:justify-center p-4 py-8 sm:p-12 relative">
        {/* Decor */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center md:items-start z-10 w-full">
          
          <div className="space-y-8 text-center md:text-left relative md:sticky top-6 md:top-12 pb-8 md:pb-0 flex flex-col items-center md:items-start">
            <div className="inline-flex items-center justify-center md:justify-start space-x-3 mb-4">
              <div className="w-12 h-12 bg-neutral-900 border border-primary/30 rounded-xl flex items-center justify-center shadow-glow">
                <Heart size={24} className="text-primary" fill="currentColor" />
              </div>
              <h1 className="text-2xl font-display font-black uppercase tracking-tighter italic leading-none">
                Nossa <span className="text-primary">Carteira</span>
              </h1>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-display font-black uppercase tracking-tighter italic leading-none">
              Libere o <span className="text-primary">acesso total</span>
            </h2>
            <p className="text-neutral-400 font-medium">
              Sua conta foi criada com sucesso! Para usar o app com seu parceiro(a) e sincronizar finanças em tempo real, escolha o plano premium.
            </p>

            <div className="space-y-6 md:space-y-5 w-full flex flex-col items-center md:items-start">
              {[
                { icon: <Zap size={18} className="text-primary" />, title: 'Sincronização Imediata', text: 'Adicionou? O outro celular apita na hora.' },
                { icon: <ShieldCheck size={18} className="text-emerald-500" />, title: 'Pagamento Seguro', text: 'Checkout transparente e 100% seguro pelo Mercado Pago.' },
                { icon: <Heart size={18} className="text-blue-500" />, title: 'Acesso para Dois', text: 'Dois perfis conectados na mesma assinatura.' }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center md:flex-row md:items-start text-center md:text-left space-y-2 md:space-y-0 md:space-x-4 max-w-xs md:max-w-none">
                  <div className="mt-0.5">{item.icon}</div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">{item.title}</h3>
                    <p className="text-[10px] sm:text-xs text-neutral-500 mt-1">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => signOut(auth)}
              className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest hover:text-white transition-colors flex items-center justify-center md:justify-start space-x-2 w-full md:w-auto"
            >
              <LogOut size={14} />
              <span>Sair da conta e voltar ao início</span>
            </button>
          </div>

          <div className={`mx-auto bg-neutral-900 border-2 border-primary/30 shadow-glow relative transition-all duration-300 w-full ${showCheckout ? 'max-w-md p-4 sm:p-6 md:p-8 rounded-[1.5rem] sm:rounded-[2.5rem]' : 'max-w-sm p-6 sm:p-8 rounded-[2.5rem]'}`}>
            {!showCheckout ? (
              <>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-neutral-950 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                  Assinatura Mensal
                </div>

                <div className="text-center mt-6 mb-8">
                  <span className="text-primary text-xl font-bold align-top pr-1">R$</span>
                  <span className="text-6xl font-display font-black italic tracking-tighter">1</span>
                  <span className="text-2xl font-bold">,00</span>
                </div>

                <div className="space-y-4 mb-8">
                  {['Acesso ilimitado a todas as funções', '2 perfis na mesma assinatura', 'Metas do casal', 'Lista de compras sincronizada', 'Extratos e relatórios inteligentes'].map((feature, i) => (
                    <div key={i} className="flex items-center space-x-3 text-xs font-medium text-neutral-300">
                      <CheckCircle2 size={16} className="text-primary shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-white text-neutral-950 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-neutral-200 transition-colors flex items-center justify-center space-x-2 active:scale-95"
                >
                  <ShieldCheck size={18} />
                  <span>Ir para Pagamento Seguro</span>
                </button>
                <p className="text-center text-[9px] font-bold text-neutral-500 uppercase tracking-widest mt-4">
                  Cancele a qualquer momento
                </p>
              </>
            ) : (
             <div className="animate-slide-up w-full min-h-[400px]">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-sm font-black uppercase tracking-widest">Finalizar Pagamento</h3>
                 <button onClick={() => setShowCheckout(false)} className="text-[10px] uppercase font-bold text-neutral-500 hover:text-white">Voltar</button>
               </div>
               
               {/* Transpareny background override for Mercado Pago Brick */}
               <div className="bg-neutral-950 rounded-xl overflow-hidden relative border border-neutral-800">
                 {brickError ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-neutral-300">
                      <div className="mb-4">
                         <ShieldCheck size={48} className="text-neutral-700 mx-auto" />
                      </div>
                      <h4 className="font-bold mb-2 text-white">Checkout Indisponível</h4>
                      <p className="text-xs text-neutral-500 mb-6 font-medium">A chave do Mercado Pago não está configurada neste ambiente ou é inválida.</p>
                      
                      <button 
                        onClick={simulateCheckout}
                        disabled={loading}
                        className="bg-primary text-neutral-950 w-full py-4 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                        <span>Simular Pagamento Seguro (Teste)</span>
                      </button>
                    </div>
                 ) : (
                   <div className="px-0 sm:px-1 pt-1">
                     <Payment
                        initialization={{ amount: 1 }}
                        customization={{
                          visual: {
                            style: {
                              theme: 'dark',
                              customVariables: {
                                textPrimaryColor: '#ffffff',
                                textSecondaryColor: '#a3a3a3',
                                inputBackgroundColor: '#171717',
                                formBackgroundColor: '#0a0a0a',
                                baseColor: '#fde047',
                                baseColorFirstVariant: '#facc15',
                                baseColorSecondVariant: '#eab308',
                                outlinePrimaryColor: '#fde047',
                              }
                            }
                          },
                          paymentMethods: {
                            ticket: "all",
                            creditCard: "all",
                            bankTransfer: "all",
                          },
                        }}
                        onSubmit={async ({ selectedPaymentMethod, formData }) => {
                           await handlePaymentSubmit(formData);
                        }}
                        onError={(error) => {
                          console.error("Brick error:", error);
                          setBrickError(true);
                        }}
                        onReady={() => {
                          console.log("Brick ready");
                        }}
                     />
                     <div className="text-center pb-4 pt-2 text-[9px] text-neutral-600 font-bold uppercase flex justify-center items-center space-x-1">
                        <ShieldCheck size={10} />
                        <span>Transação via Mercado Pago</span>
                     </div>
                   </div>
                 )}
               </div>
             </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
