
import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Heart, Mail, Lock, Loader2, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';

const PremiumLogo = () => (
  <div className="relative flex items-center justify-center mb-6">
    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse"></div>
    <div className="relative w-20 h-20 bg-neutral-900 border-2 border-primary rounded-[2.2rem] flex items-center justify-center shadow-glow overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
      <Heart size={44} className="text-primary logo-glow" fill="currentColor" strokeWidth={0} />
    </div>
  </div>
);

export const Login: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [acceptedLGPD, setAcceptedLGPD] = useState(false);
  const [acceptedMarketing, setAcceptedMarketing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (password.match(/[A-Z]/)) strength += 1;
    if (password.match(/[0-9]/)) strength += 1;
    if (password.match(/[^A-Za-z0-9]/)) strength += 1;
    return strength;
  };
  const strength = getPasswordStrength();
  const strengthColors = ['bg-neutral-800', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
  const strengthLabels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Erro ao autenticar com Google. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (isRegistering && password !== confirmPassword) {
      setError('As senhas não coincidem.');
      setLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message.includes('auth/user-not-found') ? 'Usuário não encontrado.' : 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Digite seu e-mail para recuperar a senha.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('E-mail de recuperação enviado!');
    } catch (err) {
      setError('Erro ao enviar e-mail de recuperação.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-950 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <PremiumLogo />
          <div className="space-y-1">
            <h1 className="text-4xl font-display font-black text-white uppercase tracking-tighter italic leading-none">
              NOSSA <span className="text-primary">CARTEIRA</span>
            </h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] italic">Sincronização do Casal</p>
          </div>
        </div>

        <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 p-8 rounded-[40px] shadow-2xl">
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">E-mail do Casal</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl py-4 pl-12 pr-4 text-white font-semibold outline-none focus:border-primary transition-all"
                    placeholder="exemplo@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Senha de Acesso</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl py-4 pl-12 pr-12 text-white font-semibold outline-none focus:border-primary transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {isRegistering && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1">Confirmar Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        required 
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl py-4 pl-12 pr-12 text-white font-semibold outline-none focus:border-primary transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  
                  {password && (
                    <div className="space-y-1.5 px-1">
                      <div className="flex space-x-1 h-1.5">
                        {[1, 2, 3, 4].map(level => (
                          <div 
                            key={level} 
                            className={`flex-1 rounded-full transition-colors duration-300 ${strength >= level ? strengthColors[strength] : 'bg-neutral-800'}`}
                          />
                        ))}
                      </div>
                      <p className={`text-[9px] font-bold uppercase tracking-widest ${strength >= 3 ? 'text-emerald-500' : 'text-neutral-500'}`}>
                        Força da senha: {strengthLabels[strength]}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 space-y-3">
                    <div className="flex items-start space-x-3 bg-neutral-950/50 p-3 rounded-xl border border-neutral-800/50">
                      <input
                        type="checkbox"
                        id="lgpd"
                        checked={acceptedLGPD}
                        onChange={(e) => setAcceptedLGPD(e.target.checked)}
                        className="mt-0.5 accent-primary w-4 h-4 rounded border-neutral-700 bg-neutral-950 flex-shrink-0"
                        required
                      />
                      <label htmlFor="lgpd" className="text-[10px] text-neutral-400 leading-relaxed cursor-pointer select-none">
                        Li e concordo com os <a href="#" className="text-primary hover:underline">Termos de Uso</a> e <a href="#" className="text-primary hover:underline">Política de Privacidade</a>. (Obrigatório)
                      </label>
                    </div>

                    <div className="flex items-start space-x-3 bg-neutral-950/50 p-3 rounded-xl border border-neutral-800/50">
                      <input
                        type="checkbox"
                        id="marketing"
                        checked={acceptedMarketing}
                        onChange={(e) => setAcceptedMarketing(e.target.checked)}
                        className="mt-0.5 accent-primary w-4 h-4 rounded border-neutral-700 bg-neutral-950 flex-shrink-0"
                      />
                      <label htmlFor="marketing" className="text-[10px] text-neutral-400 leading-relaxed cursor-pointer select-none">
                        Aceito receber dicas financeiras, ofertas e novidades por e-mail. (Opcional)
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {error && <p className="text-red-500 text-[10px] font-bold uppercase text-center">{error}</p>}
            {message && <p className="text-emerald-500 text-[10px] font-bold uppercase text-center">{message}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-neutral-950 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-glow hover:bg-yellow-300 transition-all flex items-center justify-center space-x-2 active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span>{isRegistering ? 'Criar Conta Conjunta' : 'Entrar na Carteira'}</span>
                  <ArrowRight size={18} strokeWidth={3} />
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-x-0 h-px bg-neutral-800"></div>
            <span className="relative bg-neutral-900/50 px-4 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              Ou
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white text-neutral-900 py-4 mb-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-glow hover:bg-neutral-200 transition-all flex items-center justify-center space-x-2 active:scale-95 border border-neutral-200"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 bg-white rounded-full p-0.5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continuar com Google</span>
          </button>

          <div className="mt-8 flex flex-col space-y-4 items-center">
            <button 
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setMessage('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-neutral-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              {isRegistering ? 'Já somos membros? Entrar.' : 'Ainda não temos conta conjunta? Criar.'}
            </button>
            {!isRegistering && (
              <button 
                type="button"
                onClick={handleResetPassword}
                className="text-neutral-700 hover:text-neutral-500 text-[10px] font-bold uppercase tracking-widest"
              >
                Esqueci a senha
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-2 text-neutral-600 text-center max-w-sm mx-auto">
          <div className="flex items-center space-x-2">
            <Sparkles size={14} className="text-primary/50" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Privacidade & LGPD</span>
          </div>
          <p className="text-[10px] leading-relaxed">
            Seus dados são anonimizados e protegidos com criptografia de ponta a ponta. Nossa infraestrutura atende a todos os requisitos da <b>LGPD (Lei nº 13.709/2018)</b>.
          </p>
        </div>
      </div>
    </div>
  );
};
