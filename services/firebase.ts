
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, get, onValue } from "firebase/database";
import { getFirestore, collection, onSnapshot, query, orderBy, where, addDoc, updateDoc, deleteDoc, doc, setDoc } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const firestore = getFirestore(app);

let messaging: any = null;
if (typeof window !== "undefined") {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error("Firebase Messaging Error:", error);
  }
}

export const requestNotificationPermission = async (deviceOwner?: 'A' | 'B' | null) => {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { 
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY 
      });
      console.log('Push notification token:', token);
      
      const user = auth.currentUser;
      if (user) {
        if (deviceOwner) {
          await set(ref(db, `users/${user.uid}/pushTokens/${deviceOwner}`), token);
        } else {
          await set(ref(db, `users/${user.uid}/pushToken`), token);
        }
        
        // Save to Firestore 'users' collection as requested
        try {
          await setDoc(doc(firestore, "users", user.uid), {
            email: user.email,
            fcmToken: token,
            role: "USER"
          }, { merge: true });
        } catch (err) {
          // Ignore, RTDB is the primary source
        }
      }
      
      return token;
    }
  } catch (error) {
    console.error("Background Push Notifications error:", error);
    return null;
  }
};

if (messaging) {
  onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);
    const title = payload?.data?.title || payload?.notification?.title || "Notificação";
    const body = payload?.data?.body || payload?.notification?.body || "";
    
    if (title || body) {
      if ("Notification" in window && Notification.permission === "granted" && !document.hidden) {
         new Notification(title, { 
           body: body, 
           icon: '/icon-192x192.png' 
         });
      }
    }
  });
}


// Helpers para Realtime Database (Configurações e Perfil)
export const syncData = async (path: string, data: any) => {
  const user = auth.currentUser;
  if (!user) return;
  
  localStorage.setItem(`nc_backup_${path}`, JSON.stringify(data));
  
  try {
    await set(ref(db, `users/${user.uid}/${path}`), data);
    return true;
  } catch (error) {
    console.error(`[Sync Error] ${path}:`, error);
    return false;
  }
};

export const listenToData = (path: string, callback: (data: any) => void) => {
  const user = auth.currentUser;
  if (!user) return;
  
  const dataRef = ref(db, `users/${user.uid}/${path}`);
  return onValue(dataRef, (snapshot) => {
    const val = snapshot.val();
    if (val !== null) {
      localStorage.setItem(`nc_backup_${path}`, JSON.stringify(val));
      callback(val);
    }
  });
};

// Helpers para Firestore (Transações)
export const listenToFirestoreTransactions = (
  callback: (data: any[]) => void,
  onRemoteChange?: (type: 'added' | 'modified', data: any) => void
) => {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(collection(firestore, "transacoes"), where("tenantId", "==", user.uid));

  let isFirstSnapshot = true;

  return onSnapshot(q, (snapshot) => {
    if (!isFirstSnapshot && onRemoteChange) {
      snapshot.docChanges().forEach(change => {
        if (!change.doc.metadata.hasPendingWrites) {
          if (change.type === 'added') onRemoteChange('added', change.doc.data());
          if (change.type === 'modified') onRemoteChange('modified', change.doc.data());
        }
      });
    }

    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(transactions);
    isFirstSnapshot = false;
  });
};

export const updateFirestoreTransaction = async (id: string, data: any) => {
  try {
    const txRef = doc(firestore, "transacoes", id);
    await updateDoc(txRef, data);
    return true;
  } catch (error) {
    console.error("Erro ao atualizar Firestore:", error);
    return false;
  }
};

export const deleteFirestoreTransaction = async (id: string) => {
  try {
    const txRef = doc(firestore, "transacoes", id);
    await deleteDoc(txRef);
    return true;
  } catch (error) {
    console.error("Erro ao deletar no Firestore:", error);
    return false;
  }
};

export const sendNotificationToPartner = async (partnerOwner: 'A' | 'B', title: string, body: string) => {
  return notifyDevices(partnerOwner === 'A' ? 'B' : 'A', title, body); 
};

export const notifyDevices = async (excludeDevice: 'A' | 'B' | null, title: string, body: string) => {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const targets = new Set<string>();

    const tokensRef = ref(db, `users/${user.uid}/pushTokens`);
    const snapshot = await get(tokensRef);
    const tokens = snapshot.val();
    
    if (tokens) {
      if (tokens.A && excludeDevice !== 'A') targets.add(tokens.A);
      if (tokens.B && excludeDevice !== 'B') targets.add(tokens.B);
    }

    const singleTokenRef = ref(db, `users/${user.uid}/pushToken`);
    const singleSnapshot = await get(singleTokenRef);
    const singleToken = singleSnapshot.val();
    if (singleToken) targets.add(singleToken);

    try {
        const userDocRef = doc(firestore, "users", user.uid);
        const { getDoc } = await import('firebase/firestore');
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().fcmToken) {
            targets.add(userDoc.data().fcmToken);
        }
    } catch(err) {
        // Silently ignore firestore permission errors as we primarily use Realtime Database
    }

    try {
      const { getToken } = await import('firebase/messaging');
      if (typeof window !== 'undefined' && messaging) {
         const currentToken = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY }).catch(() => null);
         if (currentToken) {
             targets.delete(currentToken);
         }
      }
    } catch(err) {
      console.log('Could not get current token', err);
    }

    if (targets.size === 0) return false;

    let success = false;
    for (const token of targets) {
      try {
        const response = await fetch('/api/send_notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            title,
            body
          })
        });
        if (response.ok) success = true;
      } catch (err) {
        console.error("Error sending to a token:", err);
      }
    }
    return success;
  } catch (error) {
    console.error("Failed to send notification:", error);
    return false;
  }
};
