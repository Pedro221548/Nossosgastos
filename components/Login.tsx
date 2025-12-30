
import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { Heart, Mail, Lock, Loader2, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const PremiumLogo = () => (
  <div className="relative flex items-center justify-center mb-6">
    <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse"></div>
    <div className="relative w-20 h-20 bg-neutral-900 border-2 border-primary/40 rounded-[2rem] flex items-center justify-center shadow-glow overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
      <Heart size={40} className="text-primary logo-glow" fill="currentColor" strokeWidth={0} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-8 bg-neutral-900/50 rounded-full blur-[1px]"></div>
    </div>
  </div>
);

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

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
              Nossa <span className="text-primary">Carteira</span>
            </h1>
            <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-[0.4em]">Sincronização do Casal</p>
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
                    title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
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

          <div className="mt-8 flex flex-col space-y-4 items-center">
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-neutral-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              {isRegistering ? 'Já somos membros? Entrar.' : 'Ainda não temos conta conjunta? Criar.'}
            </button>
            {!isRegistering && (
              <button 
                onClick={handleResetPassword}
                className="text-neutral-700 hover:text-neutral-500 text-[10px] font-bold uppercase tracking-widest"
              >
                Esqueci a senha
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 text-neutral-700">
          <Sparkles size={14} />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Criptografia de Ponta a Ponta</span>
        </div>
      </div>
    </div>
  );
};
