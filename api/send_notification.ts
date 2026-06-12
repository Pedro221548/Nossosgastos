import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

let initError: any = null;

if (!admin.apps.length) {
  try {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (clientEmail && privateKey) {
      let cleanedKey = privateKey.trim();
      if ((cleanedKey.startsWith('"') && cleanedKey.endsWith('"')) ||
          (cleanedKey.startsWith("'") && cleanedKey.endsWith("'"))) {
        cleanedKey = cleanedKey.substring(1, cleanedKey.length - 1).trim();
      }
      cleanedKey = cleanedKey.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: 'nossos-gastos-f495d',
          clientEmail,
          privateKey: cleanedKey,
        }),
      });
    } else if (serviceAccountVar) {
      const serviceAccount = JSON.parse(serviceAccountVar);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      initError = new Error("Neither separate Firebase credentials (FIREBASE_CLIENT_EMAIL & FIREBASE_PRIVATE_KEY) nor FIREBASE_SERVICE_ACCOUNT variable is defined.");
      console.warn(initError.message);
      admin.initializeApp();
    }
  } catch (error: any) {
    initError = error;
    console.error('Firebase admin initialization error:', error);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (initError) {
    return res.status(500).json({ 
      error: "Erro de inicialização do Firebase Admin", 
      details: initError.message || String(initError),
      hint: "Verifique se as variáveis de ambiente FIREBASE_CLIENT_EMAIL e FIREBASE_PRIVATE_KEY (ou FIREBASE_SERVICE_ACCOUNT) estão configuradas corretamente no painel do Vercel."
    });
  }

  try {
    const { token, title, body, data } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Missing FCM token" });
    }

    const message: admin.messaging.Message = {
      token,
      notification: {
        title: title || "Nova notificação",
        body: body || "",
      },
      data: {
        title: title || "Nova notificação",
        body: body || "",
        ...data
      },
      webpush: {
        headers: {
          Urgency: 'high'
        },
        notification: {
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          vibrate: [200, 100, 200],
          requireInteraction: true
        }
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default'
        }
      },
      apns: {
        payload: {
          aps: {
            contentAvailable: true,
            sound: 'default'
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    return res.status(200).json({ success: true, response });
  } catch (error: any) {
    console.error("FCM Send Error:", error);
    return res.status(500).json({ error: "Erro ao enviar notificação", details: error.message });
  }
}
