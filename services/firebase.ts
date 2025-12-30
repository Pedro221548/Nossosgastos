
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref, set, onValue } from "firebase/database";
import { getFirestore, collection, onSnapshot, query, orderBy, where, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBSA3ggl68i-g8rgLzUyc7gbXizdbv5Frk",
  authDomain: "nossos-gastos-f495d.firebaseapp.com",
  databaseURL: "https://nossos-gastos-f495d-default-rtdb.firebaseio.com",
  projectId: "nossos-gastos-f495d",
  storageBucket: "nossos-gastos-f495d.firebasestorage.app",
  messagingSenderId: "247154942228",
  appId: "1:247154942228:web:5aad334ac029df17a1e201",
  measurementId: "G-VLF5HD290Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const firestore = getFirestore(app);

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
export const listenToFirestoreTransactions = (callback: (data: any[]) => void) => {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(collection(firestore, "transacoes"));

  return onSnapshot(q, (snapshot) => {
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(transactions);
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
