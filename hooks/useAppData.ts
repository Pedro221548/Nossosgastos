import React, { useState, useEffect, useRef } from 'react';
import { User, Transaction, Goal, ShoppingItem, Invoice } from '../types';
import { USERS } from '../constants';
import { 
  syncData, 
  listenToData, 
  listenToFirestoreTransactions, 
  updateFirestoreTransaction, 
  deleteFirestoreTransaction, 
  firestore, 
  requestNotificationPermission, 
  notifyDevices 
} from '../services/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { collection, addDoc, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';

// Hook 1: useFamilyData
export function useFamilyData(user: FirebaseUser | null, deviceOwner: 'A' | 'B' | null) {
  const [users, setUsers] = useState<{ A: User; B: User }>(USERS);
  const [familyName, setFamilyName] = useState('Nossa Família');
  const [alertThreshold, setAlertThreshold] = useState(15);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Securing names: Load names and parameters from Firestore upon login.
  // If user document is absent, seed Firestore with standard name/income properties.
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(firestore, "users", user.uid);
    
    const unsubFirestoreDoc = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.users) {
          setUsers(data.users);
        }
        if (data.familyName) {
          setFamilyName(data.familyName);
        }
        if (data.alertThreshold !== undefined) {
          setAlertThreshold(data.alertThreshold);
        }
        if (data.goals) {
          setGoals(data.goals);
        }
        if (data.shoppingItems) {
          setShoppingItems(data.shoppingItems);
        }
        if (data.invoices) {
          setInvoices(data.invoices);
        }
      } else {
        const initialData = {
          users: {
            A: {
              id: 'user_a',
              name: 'Pedro',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
              income: 5000,
              currentBalance: 0
            },
            B: {
              id: 'user_b',
              name: 'Emilly',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emilly',
              income: 3500,
              currentBalance: 0
            },
          },
          familyName: 'Nossa Família',
          alertThreshold: 15,
          email: user.email,
          role: "USER"
        };
        await setDoc(userDocRef, initialData, { merge: true });
      }
    }, (error) => {
      console.error("Error subscribing to family config from Firestore:", error);
    });

    return () => {
      unsubFirestoreDoc();
    };
  }, [user]);

  const triggerSync = async (path: string, data: any) => {
    setIsSyncing(true);
    // Sync to Realtime database for backward compatibility
    await syncData(path, data);
    
    // Also save to Firestore
    if (user) {
      const userDocRef = doc(firestore, "users", user.uid);
      const updateObj: Record<string, any> = {};
      updateObj[path] = data;
      await setDoc(userDocRef, updateObj, { merge: true }).catch(() => null);
    }
    setTimeout(() => setIsSyncing(false), 1000);
  };

  const handleUpdateUser = async (uid: string, data: Partial<User>) => {
    const key = uid === users.A.id ? 'A' : 'B';
    const updated = { ...users, [key]: { ...users[key], ...data } };
    setUsers(updated);
    await triggerSync('users', updated);
  };

  const handleUpdateFamilySettings = async (name: string, threshold: number) => {
    setFamilyName(name);
    setAlertThreshold(threshold);
    setIsSyncing(true);
    await syncData('familyName', name);
    await syncData('alertThreshold', threshold);
    if (user) {
      await setDoc(doc(firestore, "users", user.uid), { familyName: name, alertThreshold: threshold }, { merge: true }).catch(() => null);
    }
    setTimeout(() => setIsSyncing(false), 1000);
  };

  const forceFullSync = async (overrideUsers?: { A: User; B: User }, overrideFamilyName?: string, overrideThreshold?: number) => {
    setIsSyncing(true);
    try {
      if (user) {
        await Promise.all([
          syncData('goals', goals),
          syncData('shoppingItems', shoppingItems),
          syncData('invoices', invoices),
          syncData('users', overrideUsers || users),
          syncData('familyName', overrideFamilyName || familyName),
          syncData('alertThreshold', overrideThreshold || alertThreshold)
        ]);

        await setDoc(doc(firestore, "users", user.uid), { 
          users: overrideUsers || users, 
          familyName: overrideFamilyName || familyName, 
          alertThreshold: overrideThreshold || alertThreshold,
          invoices,
          goals,
          shoppingItems
        }, { merge: true });
      }
    } catch (e) {
      console.error("Full synchronization failed: ", e);
    }
    setTimeout(() => setIsSyncing(false), 1000);
  };

  return {
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
  };
}

// Hook 2: useSubscription
export function useSubscription(user: FirebaseUser | null, nowMs: number) {
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);
  const [forcePaywall, setForcePaywall] = useState(false);

  useEffect(() => {
    if (!user) {
      setSubscriptionLoaded(true);
      return;
    }

    const unsubSubscription = listenToData('subscription', (data: any) => {
      setSubscription(data);
      setSubscriptionLoaded(true);
    });

    const subTimeout = setTimeout(() => {
      setSubscriptionLoaded(true);
    }, 1000);

    return () => {
      unsubSubscription?.();
      clearTimeout(subTimeout);
    };
  }, [user]);

  const creationTimeMs = user ? new Date(user.metadata.creationTime || Date.now()).getTime() : Date.now();
  const trialEndMs = creationTimeMs + (30 * 24 * 3600 * 1000);
  const trialTimeLeftMs = trialEndMs - nowMs;
  const hasActiveTrial = trialTimeLeftMs > 0;
  
  const deletionEndMs = trialEndMs + (10 * 24 * 3600 * 1000);
  const deletionTimeLeftMs = deletionEndMs - nowMs;
  const daysUntilDeletion = Math.max(0, Math.ceil(deletionTimeLeftMs / (24 * 3600 * 1000)));

  const hasSubscription = (subscription && subscription.status === 'active') || user?.email === 'pedroassfernandes.25@gmail.com';
  const isLocked = (!hasSubscription && !hasActiveTrial) || forcePaywall;

  const trialDaysLeft = Math.floor(trialTimeLeftMs / (24 * 3600 * 1000));
  const trialHoursLeft = Math.floor((trialTimeLeftMs % (24 * 3600 * 1000)) / (3600 * 1000));

  return {
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
  };
}

// Hook 3: useNotifications (incorporates User Request 9 - requested manually)
export function useNotifications(
  user: FirebaseUser | null,
  deviceOwner: 'A' | 'B' | null,
  usersRef: React.MutableRefObject<{ A: User; B: User }>
) {
  const [toastData, setToastData] = useState<{ title: string; message: string; variant?: 'info' | 'error' } | null>(null);

  useEffect(() => {
    const handleAppError = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setToastData({
          title: customEvent.detail.title || "Ops! Houve um erro",
          message: customEvent.detail.message || "Por favor, tente novamente.",
          variant: "error"
        });
        setTimeout(() => setToastData(null), 8000);
      }
    };
    window.addEventListener('app-error', handleAppError);
    return () => window.removeEventListener('app-error', handleAppError);
  }, []);

  const triggerNotificationPermission = async () => {
    if (user && deviceOwner) {
      try {
        const token = await requestNotificationPermission(deviceOwner);
        if (token) {
          setToastData({
            title: "Notificações Ativas",
            message: "Este aparelho receberá os alertas do casal com sucesso!",
            variant: "info"
          });
          setTimeout(() => setToastData(null), 5000);
        } else {
          setToastData({
            title: "Recurso Indisponível",
            message: "As notificações do Firebase não estão configuradas ou foram negadas no seu navegador.",
            variant: "error"
          });
          setTimeout(() => setToastData(null), 5000);
        }
      } catch (err) {
        console.error("Notification trigger exception:", err);
        setToastData({
          title: "Erro",
          message: "Falha ao requisitar permissão de áudio/notificações.",
          variant: "error"
        });
        setTimeout(() => setToastData(null), 5000);
      }
    } else {
      setToastData({
        title: "Dispositivo Não Identificado",
        message: "Por favor, identifique seu perfil primeiro para ativar alertas de gastos.",
        variant: "error"
      });
      setTimeout(() => setToastData(null), 5000);
    }
  };

  return {
    toastData,
    setToastData,
    triggerNotificationPermission
  };
}

// Hook 4: useTransactions
export function useTransactions(
  user: FirebaseUser | null,
  deviceOwner: 'A' | 'B' | null,
  usersRef: React.MutableRefObject<{ A: User; B: User }>,
  setToastData: React.Dispatch<React.SetStateAction<{ title: string; message: string } | null>>,
  setIsSyncing: React.Dispatch<React.SetStateAction<boolean>>
) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    if (!user) return;

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
       setTimeout(() => setToastData(null), 8000);
    });

    return () => {
      unsubFirestore?.();
    };
  }, [user, deviceOwner]);

  const handleTogglePaid = async (id: string, targetMonth?: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    try {
      if (tx.isFixed && targetMonth) {
        const currentPaidMonths = tx.paidMonths || [];
        const isPaying = !currentPaidMonths.includes(targetMonth);
        const updatedMonths = isPaying
          ? [...currentPaidMonths, targetMonth]
          : currentPaidMonths.filter(m => m !== targetMonth);
        await updateFirestoreTransaction(id, { paidMonths: updatedMonths, updatedByDevice: deviceOwner });
        
        const statusTitle = isPaying ? "Conta Paga" : "Conta Pendente";
        const statusMessage = isPaying ? `A conta ${tx.title} foi paga` : `A conta ${tx.title} foi marcada como pendente`;
        await notifyDevices(deviceOwner, statusTitle, statusMessage);
      } else {
        const isPaying = !tx.isPaid;
        await updateFirestoreTransaction(id, { pago: isPaying, updatedByDevice: deviceOwner });
        
        const statusTitle = isPaying ? "Conta Paga" : "Conta Pendente";
        const statusMessage = isPaying ? `A conta ${tx.title} foi paga` : `A conta ${tx.title} foi marcada como pendente`;
        await notifyDevices(deviceOwner, statusTitle, statusMessage);
      }
    } catch (err: any) {
      console.error("Error updating transaction paid state:", err);
      window.dispatchEvent(new CustomEvent('app-error', {
        detail: {
          title: "Erro de Sincronização",
          message: "Não foi possível atualizar o status de pagamento. Verifique se está autenticado e conectado."
        }
      }));
    }
  };

  const handleAddOrUpdateTransaction = async (tx: Transaction) => {
    setIsSyncing(true);
    try {
      const [d, m, y] = tx.date.split('/');
      
      const createPayload = (currentDate: string, currentInstallment?: number) => ({
        descricao: tx.title,
        valor: tx.amount,
        categoria: tx.category,
        data: currentDate,
        userId: tx.spenderId,
        emoji: tx.emoji,
        tipo: tx.type === 'expense' ? 'despesa' : 'receita',
        pago: tx.isPaid ?? false,
        isFixed: tx.isFixed ?? false,
        paidMonths: tx.paidMonths || [],
        installments: currentInstallment ? { current: currentInstallment, total: tx.installments!.total } : null,
        tenantId: user?.uid,
        updatedByDevice: deviceOwner
      });

      if (editingTransaction) {
        const isoDate = `${y}-${m}-${d}`;
        await updateFirestoreTransaction(editingTransaction.id, createPayload(isoDate, tx.installments?.current));
        
        await notifyDevices(
          deviceOwner, 
          "Conta Alterada", 
          `A conta ${tx.title} foi alterada.`
        );
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

        await notifyDevices(
          deviceOwner, 
          "Nova Transação", 
          `A conta ${tx.title} foi adicionada no valor R$ ${tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        );
      }
      setIsAddModalOpen(false);
      setEditingTransaction(null);
    } catch (e: any) { 
      console.error(e); 
      window.dispatchEvent(new CustomEvent('app-error', {
        detail: {
          title: "Erro ao Salvar Transação",
          message: e.message || "Ocorreu um erro ao salvar o registro no banco de dados."
        }
      }));
    } finally { 
      setIsSyncing(false); 
    }
  };

  return {
    transactions,
    isAddModalOpen,
    setIsAddModalOpen,
    editingTransaction,
    setEditingTransaction,
    handleTogglePaid,
    handleAddOrUpdateTransaction
  };
}
