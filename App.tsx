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
import { auth, syncData, listenToData, listenToFirestoreTransactions, updateFirestoreTransaction, deleteFirestoreTransaction, firestore, requestNotificationPermission, notifyDevices } from './services/firebase';
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

import { useFamilyData, useSubscription, useNotifications, useTransactions } from './hooks/useAppData';

type Theme = 'dark' | 'light';

const App: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('nc_theme') as Theme) || 'dark');
  const [nowMs, setNowMs] = useState(Date.now());
  
  const [deviceOwner, setDeviceOwner] = useState<'A' | 'B' | null>(() => {
    return localStorage.getItem('deviceOwner') as 'A' | 'B' | null;
  });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: 'danger' | 'warning';
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', variant: 'danger', onConfirm: () => {} });

  useEffect(() => {
    if (deviceOwner) {
      localStorage.setItem('deviceOwner', deviceOwner);
    } else {
      localStorage.removeItem('deviceOwner');
    }
  }, [deviceOwner]);

  useEffect(() => {
    return onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });
  }, []);

  // 1. Hook for couple configurations, family names, goals, budgets, invoices.
  const {
    users,
    setUsers,
    familyName,
    setFamilyName,
    alertThreshold,
    setAlertThreshold,
    currentDate,
    setCurrentDate,
    goals,
    setGoals,
    shoppingItems,
    setShoppingItems,
    invoices,
    setInvoices,
    isSyncing,
    setIsSyncing,
    triggerSync,
    handleUpdateUser,
    handleUpdateFamilySettings,
    forceFullSync
  } = useFamilyData(user, deviceOwner);

  const usersRef = React.useRef(users);
  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  // 2. Hook for checking subscription state securely on the server
  const {
    subscription,
    setSubscription,
    subscriptionLoaded,
    forcePaywall,
    setForcePaywall,
    hasActiveTrial,
    daysUntilDeletion,
    hasSubscription,
    isLocked,
    trialDaysLeft,
    trialHoursLeft
  } = useSubscription(user, nowMs);

  // 3. Hook for toast warnings and custom alerts (moved permission call to manual activation)
  const {
    toastData,
    setToastData,
    triggerNotificationPermission
  } = useNotifications(user, deviceOwner, usersRef);

  // 4. Hook for transaction management (handles listening, paging, deleting, adding, toggling pay status)
  const {
    transactions,
    isAddModalOpen,
    setIsAddModalOpen,
    editingTransaction,
    setEditingTransaction,
    handleTogglePaid,
    handleAddOrUpdateTransaction
  } = useTransactions(user, deviceOwner, usersRef, setToastData, setIsSyncing);

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
    await triggerSync('invoices', updated);
    await notifyDevices(deviceOwner, 'Nova Fatura', `Fatura de ${invoice.bankName} - R$ ${invoice.totalAmount.toLocaleString('pt-BR', {minimumFractionDigits:2})}`);
    setIsSyncing(false);
  };

  const handleDeleteInvoice = async (id: string) => {
    setIsSyncing(true);
    const invoice = invoices.find(i => i.id === id);
    const updated = invoices.filter(i => i.id !== id);
    setInvoices(updated);
    await triggerSync('invoices', updated);
    if (invoice) {
      await notifyDevices(deviceOwner, 'Fatura Excluída', `Fatura de ${invoice.bankName} apagada`);
    }
    setIsSyncing(false);
  };

  const handleSaveGoal = async (goal: Goal) => {
    setIsSyncing(true);
    const existing = goals.find(g => g.id === goal.id);
    let updatedGoals = existing ? goals.map(g => g.id === goal.id ? goal : g) : [...goals, goal];
    setGoals(updatedGoals);
    await triggerSync('goals', updatedGoals);
    await notifyDevices(deviceOwner, 'Objetivo', existing ? `Objetivo atualizado: ${goal.title}` : `Novo objetivo: ${goal.title}`);
    setIsSyncing(false);
  };

  const handleUpdateGoalProgress = async (goalId: string, amountToAdd: number) => {
    setIsSyncing(true);
    const goal = goals.find(g => g.id === goalId);
    const updated = goals.map(g => g.id === goalId ? { ...g, currentAmount: g.currentAmount + amountToAdd } : g);
    setGoals(updated);
    await triggerSync('goals', updated);
    if (goal) {
      await notifyDevices(deviceOwner, 'Objetivo', `Adicionado R$ ${amountToAdd} no objetivo ${goal.title}`);
    }
    setIsSyncing(false);
  };

  const handleDeleteGoal = async (goalId: string) => {
    setIsSyncing(true);
    const goal = goals.find(g => g.id === goalId);
    const updated = goals.filter(g => g.id !== goalId);
    setGoals(updated);
    await triggerSync('goals', updated);
    if (goal) {
      await notifyDevices(deviceOwner, 'Objetivo', `Objetivo ${goal.title} apagado`);
    }
    setIsSyncing(false);
  };

  const handleDeleteTransaction = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Lançamento?',
      message: 'Esta ação removerá o registro permanentemente.',
      variant: 'danger',
      onConfirm: async () => {
        const tx = transactions.find(t => t.id === id);
        await deleteFirestoreTransaction(id);
        if (tx) {
          await notifyDevices(deviceOwner, 'Item Excluído', `A conta ${tx.title} foi removida.`);
        }
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
    await triggerSync('shoppingItems', updated);
    await notifyDevices(deviceOwner, 'Mercado', `Item adicionado: ${newItem.text}`);
  };

  const handleToggleShopping = async (id: string) => {
    const item = shoppingItems.find(i => i.id === id);
    const updated = shoppingItems.map(i => i.id === id ? { ...i, completed: !i.completed } : i);
    setShoppingItems(updated);
    await triggerSync('shoppingItems', updated);
    if (item) {
      await notifyDevices(deviceOwner, 'Mercado', `Item marcado: ${item.text}`);
    }
  };

  const handleDeleteShopping = async (id: string) => {
    const item = shoppingItems.find(i => i.id === id);
    const updated = shoppingItems.filter(i => i.id !== id);
    setShoppingItems(updated);
    await triggerSync('shoppingItems', updated);
    if (item) {
      await notifyDevices(deviceOwner, 'Mercado', `Item apagado: ${item.text}`);
    }
  };

  const handleClearShoppingHistory = async () => {
    const now = new Date().toLocaleDateString('pt-BR');
    const updated = shoppingItems.map(i => i.completed && !i.archivedAt ? { ...i, archivedAt: now } : i);
    setShoppingItems(updated);
    await triggerSync('shoppingItems', updated);
    await notifyDevices(deviceOwner, 'Mercado', 'Histórico de mercado limpo');
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

  if (isLocked) {
    return <Paywall onSubscribeSuccess={() => { setSubscription({ status: 'active' }); setForcePaywall(false); }} onCancel={hasActiveTrial ? () => setForcePaywall(false) : undefined} daysUntilDeletion={daysUntilDeletion} />;
  }

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
        <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[150] bg-neutral-900 border ${toastData.variant === 'error' ? 'border-red-500/30' : 'border-primary/20'} shadow-2xl rounded-3xl p-4 flex items-center space-x-4 text-white max-w-[90vw] w-[400px] mx-auto animate-in fade-in slide-in-from-top-10 duration-500`}>
          <div className={`w-12 h-12 ${toastData.variant === 'error' ? 'bg-red-500/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'bg-primary/20 text-primary shadow-glow'} rounded-2xl flex items-center justify-center shrink-0`}>
            {toastData.variant === 'error' ? <Bell className="animate-bounce" size={24} /> : <Bell size={24} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-[10px] font-black tracking-widest ${toastData.variant === 'error' ? 'text-red-500' : 'text-primary'} uppercase mb-0.5`}>{toastData.title}</p>
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

      <aside className="hidden lg:flex flex-col w-80 bg-white/50 dark:bg-neutral-900/40 border-r border-neutral-200 dark:border-neutral-800/80 sticky top-0 h-screen p-10 z-[100] backdrop-blur-md">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/5 dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center shadow-md group">
              <Heart size={20} strokeWidth={2} className="text-primary transform group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h1 className="text-lg font-sans font-medium text-neutral-900 dark:text-white tracking-widest leading-none uppercase">Nossa <span className="text-primary font-semibold">Carteira</span></h1>
              <p className="text-[9px] font-semibold text-neutral-400 uppercase tracking-[0.3em] truncate mt-1.5">{familyName}</p>
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
        <div className="mt-auto pt-6 border-t border-neutral-200 dark:border-neutral-800/50 space-y-2">
          <button 
            onClick={() => setDeviceOwner(prev => prev === 'A' ? 'B' : 'A')} 
            className="w-full flex items-center p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/30 hover:bg-white dark:hover:bg-neutral-800/80 hover:shadow-sm border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700/50 transition-all text-left"
            title="Alternar identificação do aparelho"
          >
            <div className="w-8 h-8 rounded-full border border-neutral-200 dark:border-neutral-700 overflow-hidden flex-shrink-0 mr-3">
              <img src={deviceOwner === 'A' ? users.A.avatar : deviceOwner === 'B' ? users.B.avatar : '/icon-192x192.png'} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
               <p className="text-[8px] font-semibold tracking-widest text-neutral-400 uppercase">Aparelho de:</p>
               <p className="text-[11px] font-medium text-neutral-900 dark:text-neutral-200 truncate">
                 {deviceOwner === 'A' ? users.A.name : deviceOwner === 'B' ? users.B.name : 'Selecionar...'}
               </p>
            </div>
          </button>
          
          <button onClick={() => signOut(auth)} className="w-full flex items-center justify-between p-3 hover:bg-red-500/10 rounded-xl transition-all text-neutral-500 hover:text-red-500 group">
            <span className="text-[10px] font-semibold uppercase tracking-widest ml-2">Sair da Conta</span>
            <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </aside>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 md:px-12 md:py-20 lg:py-24 pb-40 lg:pb-24 pt-[calc(2rem+env(safe-area-inset-top))]">
        {activeTab === 'home' && <Home transactions={transactions} goals={goals} shoppingItems={shoppingItems} users={users} familyName={familyName} onNavigate={setActiveTab} onOpenAddModal={() => setIsAddModalOpen(true)} onUpdateUser={handleUpdateUser} />}
        {activeTab === 'dashboard' && <Dashboard transactions={transactions} totalIncome={users.A.income + users.B.income} currentDate={currentDate} users={users} familyName={familyName} alertThreshold={alertThreshold} onMonthChange={(dir: 'prev' | 'next') => { const nd = new Date(currentDate); nd.setMonth(nd.getMonth() + (dir === 'next' ? 1 : -1)); setCurrentDate(nd); }} onDelete={handleDeleteTransaction} onTogglePaid={handleTogglePaid} onEdit={(tx: Transaction) => { setEditingTransaction(tx); setIsAddModalOpen(true); }} onClearAll={() => {}} onOpenShopping={() => setActiveTab('shopping')} onOpenAddModal={() => { setEditingTransaction(null); setIsAddModalOpen(true); }} />}
        {activeTab === 'invoices' && <InvoiceManager invoices={invoices} onSaveInvoice={handleSaveInvoice} onDeleteInvoice={handleDeleteInvoice} />}
        {activeTab === 'analytics' && <Analytics transactions={transactions} baseIncome={users.A.income + users.B.income} currentDate={currentDate} onMonthChange={(dir: 'prev' | 'next') => { const nd = new Date(currentDate); nd.setMonth(nd.getMonth() + (dir === 'next' ? 1 : -1)); setCurrentDate(nd); }} />}
        {activeTab === 'goals' && <Goals goals={goals} onUpdateGoal={handleUpdateGoalProgress} onSaveGoal={handleSaveGoal} onDeleteGoal={handleDeleteGoal} />}
        {activeTab === 'shopping' && <ShoppingList items={shoppingItems} onAdd={handleAddShoppingItem} onToggle={handleToggleShopping} onDelete={handleDeleteShopping} onClearHistory={handleClearShoppingHistory} />}
        {activeTab === 'budget' && <BudgetSettings users={users} familyName={familyName} alertThreshold={alertThreshold} onUpdateUser={handleUpdateUser} onUpdateFamilySettings={handleUpdateFamilySettings} currentTheme={theme} onThemeToggle={setTheme} onLogout={() => signOut(auth)} onForceSync={forceFullSync} isSyncing={isSyncing} onRequestNotifications={triggerNotificationPermission} />}
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
  <button onClick={onClick} className={`w-full flex items-center space-x-5 px-5 py-3.5 rounded-xl transition-all duration-300 group ${active ? 'bg-white dark:bg-neutral-800/80 text-neutral-900 dark:text-white shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-700/50' : 'text-neutral-500 hover:bg-white/50 hover:dark:bg-neutral-800/40 hover:text-neutral-900 dark:hover:text-white'}`}>
    <div className={active ? 'text-primary' : 'text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors'}>{React.cloneElement(icon, { size: 18, strokeWidth: 2 })}</div>
    <span className="text-[11px] font-semibold uppercase tracking-widest">{label}</span>
  </button>
);

const MobileNavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all flex-1 ${active ? 'text-primary' : 'text-neutral-400 opacity-60'}`}>
    <div className={`transition-transform duration-300 ${active ? '-translate-y-1' : ''}`}>
      {React.cloneElement(icon, { size: 22, strokeWidth: active ? 2.5 : 2 })}
    </div>
    <span className={`text-[9px] font-semibold uppercase tracking-widest mt-1 transition-all duration-300 ${active ? 'opacity-100' : 'opacity-0 h-0 hidden'}`}>
      {label}
    </span>
  </button>
);

export default App;
