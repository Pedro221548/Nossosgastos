
import React, { useState, useEffect } from 'react';
import { USERS } from './constants';
import { Transaction, User, Goal, ShoppingItem, AppTab, Invoice } from './types';
import { Home } from './components/Home';
import { Landing } from './components/Landing';
import { Paywall } from './components/Paywall';
import { Dashboard } from './components/Dashboard';
import { Goals } from './components/Goals';
import { BudgetSettings } from './components/BudgetSettings'; 
import { ShoppingList } from './components/ShoppingList';
import { Analytics } from './components/Analytics';
import { InvoiceManager } from './components/InvoiceManager';
import { AddTransactionModal } from './components/AddTransactionModal';
import { ConfirmationModal } from './components/ui/ConfirmationModal';
import { Login } from './components/Login';
import { auth, syncData, listenToData, listenToFirestoreTransactions, updateFirestoreTransaction, deleteFirestoreTransaction, firestore } from './services/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { 
  Target, 
  Plus, 
  Settings, 
  ShoppingCart, 
  LogOut, 
  Heart,
  Loader2,
  TrendingUp,
  Home as HomeIcon,
  ListOrdered,
  Sparkles,
  FileText,
  Bell,
  X
} from 'lucide-react';

type Theme = 'dark' | 'light';

const App: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('nc_theme') as Theme) || 'dark');
  const [nowMs, setNowMs] = useState(Date.now());
  const [forcePaywall, setForcePaywall] = useState(false);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [users, setUsers] = useState<{ A: User; B: User }>(USERS);
  const usersRef = React.useRef(users);
  const [familyName, setFamilyName] = useState('Nossa Família');
  const [alertThreshold, setAlertThreshold] = useState(15);
  const [toastData, setToastData] = useState<{title: string, message: string} | null>(null);
  const [deviceOwner, setDeviceOwner] = useState<'A' | 'B' | null>(() => {
    return localStorage.getItem('deviceOwner') as 'A' | 'B' | null;
  });

  useEffect(() => {
    if (deviceOwner) {
      localStorage.setItem('deviceOwner', deviceOwner);
    } else {
      localStorage.removeItem('deviceOwner');
    }
  }, [deviceOwner]);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning';
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', variant: 'danger', onConfirm: () => {} });

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const unsubGoals = listenToData('goals', (data: Goal[]) => data && setGoals(data));
    const unsubShopping = listenToData('shoppingItems', (data: ShoppingItem[]) => data && setShoppingItems(data));
    const unsubInvoices = listenToData('invoices', (data: Invoice[]) => data && setInvoices(data));
    const unsubUsers = listenToData('users', (data: { A: User; B: User }) => data && setUsers(data));
    const unsubFamily = listenToData('familyName', (data: string) => data && setFamilyName(data));
    const unsubThreshold = listenToData('alertThreshold', (data: number) => data && setAlertThreshold(data));
    const unsubSubscription = listenToData('subscription', (data: any) => {
      setSubscription(data);
      setSubscriptionLoaded(true);
    });
    
    // Fallback if no subscription data is found quickly
    const subTimeout = setTimeout(() => {
      setSubscriptionLoaded(true);
    }, 1000);

    const unsubFirestore = listenToFirestoreTransactions((data: any[]) => {
      const mappedTransactions: Transaction[] = data.map(item => {
        let formattedDate = item.data;
        if (formattedDate && formattedDate.includes('-') && formattedDate.split('-').length === 3) {
           const [y, m, d] = formattedDate.split('-');
           formattedDate = `${d}/${m}/${y}`;
        }

        return {
          id: item.id,
          title: item.descricao || 'Sem título',
          amount: Number(item.valor) || 0,
          category: item.categoria || 'Geral',
          date: formattedDate || new Date().toLocaleDateString('pt-BR'),
          spenderId: item.userId || 'unknown',
          emoji: item.emoji || (item.tipo === 'despesa' ? '💸' : '💰'),
          type: item.tipo === 'despesa' ? 'expense' : 'revenue',
          isPaid: item.pago ?? false,
          isFixed: item.isFixed ?? false,
          paidMonths: item.paidMonths || [],
          installments: item.installments || undefined
        };
      });
      setTransactions(mappedTransactions);
    }, (type, data) => {
       // Evitar notificação se eu mesmo fiz a alteração noutro separador, 
       // mas a variável hasPendingWrites deveria cobrir isso. 
       // Adicionalmente filtramos o deviceOwner
       if (deviceOwner && data.updatedByDevice === deviceOwner) return;

       const updaterId = data.updatedByDevice || data.userId;
       const updaterName = updaterId && usersRef.current[updaterId as 'A'|'B'] ? usersRef.current[updaterId as 'A'|'B'].name : 'Seu parceiro';
       const title = type === 'added' ? 'Nova Transação' : 'Transação Editada';
       const action = type === 'added' ? 'adicionou' : 'editou';
       
       let extraInfo = '';
       if (data.isFixed) {
          extraInfo = ' (Fixo)';
       } else if (data.installments?.total > 1) {
          extraInfo = ` (Parcelado em ${data.installments.total}x)`;
       }
       
       const paidInfo = data.pago ? 'pago(a)' : 'lançado(a)';
       const amount = Number(data.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
       const typeStr = data.tipo === 'despesa' ? 'despesa' : 'receita';
       const msg = `${updaterName} ${action} uma ${typeStr}: ${data.descricao} de ${amount} que já consta como ${paidInfo}${extraInfo}.`;

       setToastData({ title, message: msg });
       if ("Notification" in window && Notification.permission === "granted" && document.hidden) {
         new Notification(title, { body: msg, icon: '/icon-192x192.png' });
       }
       setTimeout(() => setToastData(null), 8000);
    });

    return () => {
      unsubGoals?.(); unsubShopping?.(); unsubInvoices?.(); unsubUsers?.(); unsubFamily?.(); 
      unsubThreshold?.(); unsubSubscription?.(); unsubFirestore?.();
      clearTimeout(subTimeout);
    };
  }, [user]);

  useEffect(() => {
    localStorage.setItem('nc_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveInvoice = async (invoice: Invoice) => {
    setIsSyncing(true);
    const updated = [...invoices, invoice];
    setInvoices(updated);
    await syncData('invoices', updated);
    setIsSyncing(false);
  };

  const handleDeleteInvoice = async (id: string) => {
    setIsSyncing(true);
    const updated = invoices.filter(i => i.id !== id);
    setInvoices(updated);
    await syncData('invoices', updated);
    setIsSyncing(false);
  };

  const handleSaveGoal = async (goal: Goal) => {
    setIsSyncing(true);
    const existing = goals.find(g => g.id === goal.id);
    let updatedGoals = existing ? goals.map(g => g.id === goal.id ? goal : g) : [...goals, goal];
    setGoals(updatedGoals);
    await syncData('goals', updatedGoals);
    setIsSyncing(false);
  };

  const handleUpdateGoalProgress = async (goalId: string, amountToAdd: number) => {
    setIsSyncing(true);
    const updated = goals.map(g => g.id === goalId ? { ...g, currentAmount: g.currentAmount + amountToAdd } : g);
    setGoals(updated);
    await syncData('goals', updated);
    setIsSyncing(false);
  };

  const handleDeleteGoal = async (goalId: string) => {
    setIsSyncing(true);
    const updated = goals.filter(g => g.id !== goalId);
    setGoals(updated);
    await syncData('goals', updated);
    setIsSyncing(false);
  };

  const handleTogglePaid = async (id: string, targetMonth?: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    if (tx.isFixed && targetMonth) {
      const currentPaidMonths = tx.paidMonths || [];
      const updatedMonths = currentPaidMonths.includes(targetMonth)
        ? currentPaidMonths.filter(m => m !== targetMonth)
        : [...currentPaidMonths, targetMonth];
      await updateFirestoreTransaction(id, { paidMonths: updatedMonths, updatedByDevice: deviceOwner });
    } else {
      await updateFirestoreTransaction(id, { pago: !tx.isPaid, updatedByDevice: deviceOwner });
    }
  };

  const handleAddOrUpdateTransaction = async (tx: Transaction) => {
    setIsSyncing(true);
    try {
      const [d, m, y] = tx.date.split('/');
      
      const createPayload = (currentDate: string, currentInstallment?: number) => ({
        descricao: tx.title,
        valor: tx.amount,
        category: tx.category,
        data: currentDate,
        userId: tx.spenderId,
        emoji: tx.emoji,
        tipo: tx.type === 'expense' ? 'despesa' : 'receita',
        pago: tx.isPaid,
        isFixed: tx.isFixed,
        paidMonths: tx.paidMonths || [],
        installments: currentInstallment ? { current: currentInstallment, total: tx.installments!.total } : null,
        tenantId: user?.uid,
        updatedByDevice: deviceOwner
      });

      if (editingTransaction) {
        const isoDate = `${y}-${m}-${d}`;
        await updateFirestoreTransaction(editingTransaction.id, createPayload(isoDate, tx.installments?.current));
      } else {
        if (tx.installments && tx.installments.total > 1) {
          const promises = [];
          const startDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
          
          for (let i = 0; i < tx.installments.total; i++) {
            const nextDate = new Date(startDate);
            nextDate.setMonth(startDate.getMonth() + i);
            const isoDateString = `${nextDate.getFullYear()}-${(nextDate.getMonth() + 1).toString().padStart(2, '0')}-${nextDate.getDate().toString().padStart(2, '0')}`;
            promises.push(addDoc(collection(firestore, "transacoes"), createPayload(isoDateString, i + 1)));
          }
          await Promise.all(promises);
        } else {
          const isoDate = `${y}-${m}-${d}`;
          await addDoc(collection(firestore, "transacoes"), createPayload(isoDate));
        }
      }
      setIsAddModalOpen(false);
      setEditingTransaction(null);
    } catch (e) { console.error(e); } finally { setIsSyncing(false); }
  };

  const handleDeleteTransaction = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Lançamento?',
      message: 'Esta ação removerá o registro permanentemente.',
      variant: 'danger',
      onConfirm: async () => {
        await deleteFirestoreTransaction(id);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleAddShoppingItem = async (itemData: Partial<ShoppingItem>) => {
    const newItem: ShoppingItem = {
      id: `shop_${Date.now()}`,
      text: itemData.text || '',
      completed: false,
      price: itemData.price,
      quantity: itemData.quantity,
    };
    const updated = [...shoppingItems, newItem];
    setShoppingItems(updated);
    await syncData('shoppingItems', updated);
  };

  const handleToggleShopping = async (id: string) => {
    const updated = shoppingItems.map(i => i.id === id ? { ...i, completed: !i.completed } : i);
    setShoppingItems(updated);
    await syncData('shoppingItems', updated);
  };

  const handleDeleteShopping = async (id: string) => {
    const updated = shoppingItems.filter(i => i.id !== id);
    setShoppingItems(updated);
    await syncData('shoppingItems', updated);
  };

  const handleClearShoppingHistory = async () => {
    const now = new Date().toLocaleDateString('pt-BR');
    const updated = shoppingItems.map(i => i.completed && !i.archivedAt ? { ...i, archivedAt: now } : i);
    setShoppingItems(updated);
    await syncData('shoppingItems', updated);
  };

  const triggerSync = async (path: string, data: any) => {
    setIsSyncing(true);
    await syncData(path, data);
    setTimeout(() => setIsSyncing(false), 1000);
  };

  const forceFullSync = async (overrideUsers?: { A: User; B: User }, overrideFamilyName?: string, overrideThreshold?: number) => {
    setIsSyncing(true);
    try {
      await Promise.all([
        syncData('goals', goals),
        syncData('shoppingItems', shoppingItems),
        syncData('invoices', invoices),
        syncData('users', overrideUsers || users),
        syncData('familyName', overrideFamilyName || familyName),
        syncData('alertThreshold', overrideThreshold || alertThreshold)
      ]);
    } catch (e) { console.error(e); }
    setTimeout(() => setIsSyncing(false), 1000);
  };

  if (authLoading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center"><Loader2 className="text-primary animate-spin" size={48} /></div>;
  if (!user) {
    if (showLogin) {
      return (
        <div className="relative">
          <button 
            onClick={() => setShowLogin(false)}
            className="absolute top-6 left-6 z-50 text-white flex items-center space-x-2 bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors"
          >
            Voltar
          </button>
          <Login onLoginSuccess={() => {}} />
        </div>
      );
    }
    return <Landing onStartClick={() => setShowLogin(true)} />;
  }

  if (!subscriptionLoaded) {
    return <div className="min-h-screen bg-neutral-950 flex items-center justify-center"><Loader2 className="text-primary animate-spin" size={48} /></div>;
  }

  const creationTimeMs = user ? new Date(user.metadata.creationTime || Date.now()).getTime() : Date.now();
  const trialEndMs = creationTimeMs + (30 * 24 * 3600 * 1000);
  const trialTimeLeftMs = trialEndMs - nowMs;
  const hasActiveTrial = trialTimeLeftMs > 0;
  
  const deletionEndMs = trialEndMs + (10 * 24 * 3600 * 1000);
  const deletionTimeLeftMs = deletionEndMs - nowMs;
  const daysUntilDeletion = Math.max(0, Math.ceil(deletionTimeLeftMs / (24 * 3600 * 1000)));

  const hasSubscription = (subscription && subscription.status === 'active') || user?.email === 'pedroassfernandes.25@gmail.com';
  const isLocked = (!hasSubscription && !hasActiveTrial) || forcePaywall;

  if (isLocked) {
    return <Paywall onSubscribeSuccess={() => { setSubscription({ status: 'active' }); setForcePaywall(false); }} onCancel={hasActiveTrial ? () => setForcePaywall(false) : undefined} daysUntilDeletion={daysUntilDeletion} />;
  }

  const trialDaysLeft = Math.floor(trialTimeLeftMs / (24 * 3600 * 1000));
  const trialHoursLeft = Math.floor((trialTimeLeftMs % (24 * 3600 * 1000)) / (3600 * 1000));

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-200 flex flex-col md:flex-row transition-colors duration-300">
      
      {deviceOwner === null && (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-xl font-display font-black text-white text-center mb-2 uppercase tracking-tighter">Quem é você?</h2>
            <p className="text-sm text-neutral-400 text-center mb-8">
              Para enviarmos notificações corretas para seu parceiro, precisamos saber quem está usando este aparelho.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setDeviceOwner('A')} className="flex flex-col items-center p-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 hover:ring-2 hover:ring-primary transition-all">
                <img src={users.A.avatar} className="w-16 h-16 rounded-full mb-3 object-cover border-2 border-transparent hover:border-primary" />
                <span className="text-sm font-bold text-white truncate max-w-full">{users.A.name}</span>
              </button>
              <button onClick={() => setDeviceOwner('B')} className="flex flex-col items-center p-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 hover:ring-2 hover:ring-primary transition-all">
                <img src={users.B.avatar} className="w-16 h-16 rounded-full mb-3 object-cover border-2 border-transparent hover:border-primary" />
                <span className="text-sm font-bold text-white truncate max-w-full">{users.B.name}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {toastData && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[150] bg-neutral-900 border border-primary/20 shadow-2xl rounded-3xl p-4 flex items-center space-x-4 text-white max-w-[90vw] w-[400px] mx-auto animate-in fade-in slide-in-from-top-10 duration-500">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shrink-0 shadow-glow">
            <Bell size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black tracking-widest text-primary uppercase mb-0.5">{toastData.title}</p>
            <p className="text-xs font-semibold leading-relaxed text-neutral-200">{toastData.message}</p>
          </div>
          <button onClick={() => setToastData(null)} className="text-neutral-500 hover:text-white transition-colors p-2"><X size={16}/></button>
        </div>
      )}

      {!hasSubscription && hasActiveTrial && (
        <div className="fixed top-0 left-0 right-0 z-[200] bg-primary text-neutral-950 text-[10px] sm:text-xs font-black uppercase tracking-widest py-2 px-4 text-center shadow-lg">
          Período de Teste Grátis: Restam {trialDaysLeft} dias e {trialHoursLeft} horas. <button onClick={() => setForcePaywall(true)} className="underline ml-2">Assinar Agora</button>
        </div>
      )}

      <div className={`fixed top-[calc(env(safe-area-inset-top)+10px)] right-4 md:right-6 z-[100] flex items-center space-x-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-800 shadow-2xl transition-all ${!hasSubscription && hasActiveTrial ? 'mt-8' : ''}`}>
        {isSyncing ? <><Loader2 size={12} className="text-primary animate-spin" /><span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Sincronizando</span></> : <><div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" /><span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Online</span></>}
      </div>

      <aside className="hidden lg:flex flex-col w-80 bg-white dark:bg-neutral-900/50 border-r border-neutral-200 dark:border-neutral-800 sticky top-0 h-screen p-10 z-50">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-neutral-950 rounded-2xl flex items-center justify-center text-primary shadow-glow border border-primary/30 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <Heart size={24} strokeWidth={3} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl font-display font-black text-neutral-900 dark:text-white tracking-tighter leading-none uppercase italic">NOSSA <span className="text-primary">CARTEIRA</span></h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] truncate mt-1.5">{familyName}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-3">
          <SidebarItem icon={<HomeIcon />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <SidebarItem icon={<ListOrdered />} label="Extrato" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<FileText />} label="Faturas" active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} />
          <SidebarItem icon={<TrendingUp />} label="Saúde" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          <SidebarItem icon={<Target />} label="Metas" active={activeTab === 'goals'} onClick={() => setActiveTab('goals')} />
          <SidebarItem icon={<ShoppingCart />} label="Compras" active={activeTab === 'shopping'} onClick={() => setActiveTab('shopping')} />
          <SidebarItem icon={<Settings />} label="Ajustes" active={activeTab === 'budget'} onClick={() => setActiveTab('budget')} />
        </nav>
        <div className="mt-auto pt-6 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
          <button 
            onClick={() => setDeviceOwner(prev => prev === 'A' ? 'B' : 'A')} 
            className="w-full flex items-center p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors text-left"
            title="Alternar identificação do aparelho"
          >
            <div className="w-8 h-8 rounded-full border border-primary overflow-hidden flex-shrink-0 mr-3">
              <img src={deviceOwner === 'A' ? users.A.avatar : deviceOwner === 'B' ? users.B.avatar : '/icon-192x192.png'} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-[9px] font-black tracking-widest text-neutral-400 uppercase">Aparelho de:</p>
               <p className="text-xs font-bold text-neutral-900 dark:text-neutral-200 truncate">
                 {deviceOwner === 'A' ? users.A.name : deviceOwner === 'B' ? users.B.name : 'Selecionar...'}
               </p>
            </div>
          </button>
          
          <button onClick={() => signOut(auth)} className="w-full flex items-center justify-between p-3 hover:bg-red-500/10 rounded-2xl transition-all text-neutral-500 hover:text-red-500 group">
            <span className="text-xs font-black uppercase tracking-widest ml-2">Sair da Conta</span>
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </aside>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 md:px-12 md:py-20 lg:py-24 pb-40 lg:pb-24 pt-[calc(2rem+env(safe-area-inset-top))]">
        {activeTab === 'home' && <Home transactions={transactions} goals={goals} shoppingItems={shoppingItems} users={users} familyName={familyName} onNavigate={setActiveTab} onOpenAddModal={() => setIsAddModalOpen(true)} onUpdateUser={(uid, data) => { const key = uid === users.A.id ? 'A' : 'B'; const updated = { ...users, [key]: { ...users[key], ...data } }; setUsers(updated); triggerSync('users', updated); }} />}
        {activeTab === 'dashboard' && <Dashboard transactions={transactions} totalIncome={users.A.income + users.B.income} currentDate={currentDate} users={users} familyName={familyName} alertThreshold={alertThreshold} onMonthChange={(dir: 'prev' | 'next') => { const nd = new Date(currentDate); nd.setMonth(nd.getMonth() + (dir === 'next' ? 1 : -1)); setCurrentDate(nd); }} onDelete={handleDeleteTransaction} onTogglePaid={handleTogglePaid} onEdit={(tx: Transaction) => { setEditingTransaction(tx); setIsAddModalOpen(true); }} onClearAll={() => {}} onOpenShopping={() => setActiveTab('shopping')} onOpenAddModal={() => { setEditingTransaction(null); setIsAddModalOpen(true); }} />}
        {activeTab === 'invoices' && <InvoiceManager invoices={invoices} onSaveInvoice={handleSaveInvoice} onDeleteInvoice={handleDeleteInvoice} />}
        {activeTab === 'analytics' && <Analytics transactions={transactions} baseIncome={users.A.income + users.B.income} currentDate={currentDate} onMonthChange={(dir: 'prev' | 'next') => { const nd = new Date(currentDate); nd.setMonth(nd.getMonth() + (dir === 'next' ? 1 : -1)); setCurrentDate(nd); }} />}
        {activeTab === 'goals' && <Goals goals={goals} onUpdateGoal={handleUpdateGoalProgress} onSaveGoal={handleSaveGoal} onDeleteGoal={handleDeleteGoal} />}
        {activeTab === 'shopping' && <ShoppingList items={shoppingItems} onAdd={handleAddShoppingItem} onToggle={handleToggleShopping} onDelete={handleDeleteShopping} onClearHistory={handleClearShoppingHistory} />}
        {activeTab === 'budget' && <BudgetSettings users={users} familyName={familyName} alertThreshold={alertThreshold} onUpdateUser={(uid: string, data: Partial<User>) => { const key = uid === users.A.id ? 'A' : 'B'; const updated = { ...users, [key]: { ...users[key], ...data } }; setUsers(updated); triggerSync('users', updated); }} onUpdateFamilySettings={(name: string, threshold: number) => { setFamilyName(name); setAlertThreshold(threshold); triggerSync('familyName', name); triggerSync('alertThreshold', threshold); }} currentTheme={theme} onThemeToggle={setTheme} onLogout={() => signOut(auth)} onForceSync={forceFullSync} isSyncing={isSyncing} />}
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[calc(80px+env(safe-area-inset-bottom))] bg-white/95 dark:bg-neutral-950/95 backdrop-blur-3xl border-t border-neutral-200 dark:border-neutral-800 flex justify-around items-start z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] px-1 pt-2 pb-[env(safe-area-inset-bottom)]">
         <MobileNavItem icon={<HomeIcon />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
         <MobileNavItem icon={<ListOrdered />} label="Extrato" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
         <div className="relative -top-8 px-2 flex flex-col items-center">
           <button onClick={() => { setEditingTransaction(null); setIsAddModalOpen(true); }} className="w-16 h-16 bg-primary rounded-[2rem] flex items-center justify-center text-neutral-950 shadow-glow active:scale-90 transition-all border-[6px] border-neutral-50 dark:border-neutral-950">
             <Plus size={32} strokeWidth={3} />
           </button>
           <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mt-2 hidden sm:block">Novo</span>
         </div>
         <MobileNavItem icon={<FileText />} label="Faturas" active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} />
         <MobileNavItem icon={<Settings />} label="Ajustes" active={activeTab === 'budget'} onClick={() => setActiveTab('budget')} />
      </nav>

      <AddTransactionModal isOpen={isAddModalOpen} users={users} initialDate={currentDate} onClose={() => { setIsAddModalOpen(false); setEditingTransaction(null); }} onAdd={handleAddOrUpdateTransaction} editingTransaction={editingTransaction} />
      <ConfirmationModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} variant={confirmModal.variant} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} />
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-5 px-5 py-4 rounded-2xl transition-all duration-300 group ${active ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-md ring-1 ring-neutral-200 dark:ring-neutral-700' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 dark:hover:text-white'}`}>
    <div className={active ? 'text-primary scale-110' : 'text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-400 group-hover:scale-110 transition-transform'}>{React.cloneElement(icon, { size: 20, strokeWidth: active ? 2.5 : 2 })}</div>
    <span className="text-xs font-bold uppercase tracking-[0.15em]">{label}</span>
  </button>
);

const MobileNavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all flex-1 ${active ? 'text-primary' : 'text-neutral-400 opacity-60'}`}>
    <div className={`transition-transform duration-300 ${active ? '-translate-y-1' : ''}`}>
      {React.cloneElement(icon, { size: 22, strokeWidth: active ? 2.5 : 2 })}
    </div>
    <span className={`text-[9px] font-black uppercase tracking-widest mt-1 transition-all duration-300 ${active ? 'opacity-100' : 'opacity-0 h-0 hidden'}`}>
      {label}
    </span>
    {/* active dot for non-active states that become active, replaced by label now, but kept for transition smoothness if wanted */}
  </button>
);

export default App;
