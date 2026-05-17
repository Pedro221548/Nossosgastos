import React, { useState, useEffect } from 'react';
import { Heart, CheckCircle2, ShieldCheck, Zap, LogOut, Loader2 } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, syncData } from '../services/firebase';
import { initMercadoPago, Payment } from '@mercadopago/sdk-react';

const MP_KEY = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY?.trim();
if (MP_KEY) {
  initMercadoPago(MP_KEY, { locale: 'pt-BR' });
}

interface PaywallProps {
  onSubscribeSuccess: () => void;
  daysUntilDeletion?: number;
  onCancel?: () => void;
}

export const Paywall: React.FC<PaywallProps> = ({ onSubscribeSuccess, daysUntilDeletion, onCancel }) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [brickError, setBrickError] = useState(!MP_KEY);
  const [brickDiagnostic, setBrickDiagnostic] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(localStorage.getItem('mp_pending_payment_id') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
    if (paymentId) {
      setPendingPaymentId(paymentId);
      setShowCheckout(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (pendingPaymentId) {
      localStorage.setItem('mp_pending_payment_id', pendingPaymentId);
    } else {
      localStorage.removeItem('mp_pending_payment_id');
    }
  }, [pendingPaymentId]);

  useEffect(() => {
    if (!pendingPaymentId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/check_payment?id=${pendingPaymentId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'approved') {
            await syncData('subscription', {
              status: 'active',
              plan: 'premium',
              since: new Date().toISOString()
            });
            setPaymentSuccess(true);
            setPendingPaymentId(null);
            clearInterval(interval);
          } else if (data.status === 'rejected' || data.status === 'cancelled') {
            setPaymentError('O pagamento foi recusado ou cancelado.');
            setPendingPaymentId(null);
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error("Erro ao checar status", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [pendingPaymentId]);

  const handlePaymentSubmit = async (paymentFormData: any) => {
    setPaymentError(null);
    return new Promise<void>((resolve, reject) => {
      let bodyStr;
      try {
        bodyStr = JSON.stringify(paymentFormData);
      } catch (e) {
        console.error("Erro ao serializar paymentFormData", e);
        setPaymentError("Formato de dados inválido.");
        reject();
        return;
      }
      
      fetch("/api/process_payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: bodyStr,
      })
        .then(async (response) => {
          let data;
          try {
            data = await response.json();
          } catch (e) {
            // Em caso de erro de parsing de JSON (ex: resposta 404 em HTML no Vercel)
            const text = await response.text().catch(() => "");
            console.error("Erro ao analisar resposta:", text);
            setPaymentError(`Erro no servidor: O backend não está respondendo corretamente. Se você publicou na Vercel, certifique-se de configurar a API e colocar a variável MERCADOPAGO_ACCESS_TOKEN nela.`);
            reject();
            return;
          }

          if (response.ok && data.status === 'approved') {
            await syncData('subscription', {
              status: 'active',
              plan: 'premium',
              since: new Date().toISOString()
            });
            resolve();
            setPaymentSuccess(true);
          } else if (response.ok && data.status === 'pending') {
             // For PIX and ticket, it will be pending. 
             // Resolve to let the Brick show the QR Code or instructions.
             setPendingPaymentId(data.id.toString());
             resolve();
             // We do NOT set paymentSuccess(true) here because the user still needs to pay.
          } else if (response.ok && typeof data.id !== 'undefined') {
             setPendingPaymentId(data.id.toString());
             resolve();
          } else {
            console.error('Pagamento rejeitado ou erro na API:', data);
            setPaymentError(data.message || data.error || JSON.stringify(data));
            reject();
          }
        })
        .catch((error) => {
          console.error("Erro ao processar pagamento", error);
          setPaymentError(error.message || "Erro de conexão com o servidor ao processar pagamento.");
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
            {daysUntilDeletion !== undefined && daysUntilDeletion <= 10 && (
              <div className="bg-red-500/20 text-red-500 border border-red-500/30 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-center w-full shadow-lg">
                Seu teste acabou. Assine para não perder seus dados em {daysUntilDeletion} {daysUntilDeletion === 1 ? 'dia' : 'dias'}.
              </div>
            )}
            
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
            {paymentSuccess ? (
              <div className="flex flex-col items-center justify-center text-center animate-in zoom-in duration-500 py-8">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl font-display font-black uppercase tracking-tighter mb-4 text-white">
                  Muito Obrigado!
                </h3>
                <p className="text-neutral-400 font-medium mb-8">
                  Sua assinatura foi ativada com sucesso. Aproveite todas as funcionalidades premium do app, agora você pode convidar seu parceiro(a).
                </p>
                <button
                  onClick={onSubscribeSuccess}
                  className="w-full bg-primary text-neutral-950 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-glow hover:bg-primary/90 transition-all flex items-center justify-center space-x-2 active:scale-95"
                >
                  <Zap size={18} fill="currentColor" />
                  <span>Começar a Usar</span>
                </button>
              </div>
            ) : !showCheckout ? (
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
                      
                      {(!MP_KEY || brickDiagnostic) && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] p-4 rounded-lg mb-6 text-left w-full break-normal shadow-inner space-y-2">
                          <strong className="block text-red-400 border-b border-red-500/20 pb-1 mb-2">Diagnóstico do Erro:</strong>
                          {brickDiagnostic && <p className="font-mono bg-red-950/50 p-2 rounded text-[9px] break-all mb-2">{brickDiagnostic}</p>}
                          <p>Isso geralmente acontece por três motivos:</p>
                          <ol className="list-decimal pl-4 space-y-1">
                            <li><strong>Chave Ausente:</strong> Você precisa adicionar a variável <code className="bg-red-500/20 px-1 rounded">VITE_MERCADOPAGO_PUBLIC_KEY</code> e <code className="bg-red-500/20 px-1 rounded">MERCADOPAGO_ACCESS_TOKEN</code> nas configurações de variáveis de ambiente do AI Studio (no menu lateral esquerdo da engrenagem).</li>
                            <li><strong>Chave Invertida:</strong> Você colocou o Access Token no lugar da Public Key. A <code className="bg-red-500/20 px-1 rounded">VITE_MERCADOPAGO_PUBLIC_KEY</code> sempre começa com <code className="bg-red-500/20 px-1 rounded">APP_USR-</code>.</li>
                            <li><strong>Domínio não autorizado:</strong> Sua chave pública é de produção, mas o domínio do app (<code className="bg-red-500/20 px-1 rounded">{window.location.hostname}</code>) não está autorizado no painel de segurança do Mercado Pago.</li>
                          </ol>
                        </div>
                      )}

                      <button 
                        onClick={() => window.location.reload()}
                        className="bg-primary text-neutral-950 w-full py-4 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg flex items-center justify-center space-x-2"
                      >
                        <span>Tentar Novamente</span>
                      </button>
                      
                      {onCancel && (
                        <div className="flex justify-center mt-4">
                          <button onClick={onCancel} className="mt-2 text-[10px] uppercase font-bold text-neutral-400 hover:text-white transition-colors">Voltar a usar o app</button>
                        </div>
                      )}
                    </div>
                 ) : (
                   <div className="px-0 sm:px-1 pt-1">
                     {paymentError && (
                       <div className="mx-4 mt-4 mb-2 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] p-3 rounded-lg text-left break-all">
                         <strong className="block mb-1 text-red-400">Erro no Processamento:</strong>
                         {paymentError}
                       </div>
                     )}
                     <Payment
                        initialization={{ 
                          amount: 1.00,
                          payer: {
                            email: auth.currentUser?.email || ''
                          }
                        }}
                        customization={{
                          visual: {
                            style: {
                              theme: 'dark',
                              customVariables: {
                                textPrimaryColor: '#ffffff',
                                textSecondaryColor: '#a3a3a3',
                                inputBackgroundColor: '#171717',
                                baseColor: '#fde047'
                              }
                            }
                          },
                          paymentMethods: {
                            ticket: "all",
                            creditCard: "all",
                            bankTransfer: "all",
                          },
                        }}
                        onSubmit={async (param: any) => {
                           try {
                             let paymentData = param.formData ? param.formData : param;
                             
                             // Extrair APENAS os campos necessários para a API do Mercado Pago
                             // Isso previne qualquer erro de 'circular structure' caso a lib mande objetos complexos.
                             const cleanData = {
                               transaction_amount: paymentData.transaction_amount,
                               installments: paymentData.installments,
                               token: paymentData.token,
                               issuer_id: paymentData.issuer_id,
                               payment_method_id: paymentData.payment_method_id,
                               payer: paymentData.payer ? {
                                 email: paymentData.payer.email,
                                 identification: paymentData.payer.identification,
                                 first_name: paymentData.payer.first_name,
                                 last_name: paymentData.payer.last_name
                               } : undefined
                             };

                             await handlePaymentSubmit(cleanData);
                           } catch (err) {
                             console.error("onSubmit error", err);
                           }
                        }}
                        onError={(error) => {
                          console.error("Brick error:", error);
                          let diagnostic = "Erro desconhecido";
                          if (error instanceof Error) {
                            diagnostic = error.message;
                          } else {
                            try {
                               diagnostic = JSON.stringify(error);
                            } catch(e) {
                               diagnostic = String(error) + " (Não foi possível analisar o erro completo)";
                            }
                          }
                          setBrickDiagnostic(diagnostic);
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
                     {onCancel && (
                       <div className="flex justify-center pb-6">
                         <button onClick={onCancel} className="mt-2 text-[10px] uppercase font-bold text-neutral-400 hover:text-white transition-colors">Voltar a usar o app</button>
                       </div>
                     )}
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
