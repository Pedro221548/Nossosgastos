importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBSA3ggl68i-g8rgLzUyc7gbXizdbv5Frk",
  authDomain: "nossos-gastos-f495d.firebaseapp.com",
  databaseURL: "https://nossos-gastos-f495d-default-rtdb.firebaseio.com",
  projectId: "nossos-gastos-f495d",
  storageBucket: "nossos-gastos-f495d.firebasestorage.app",
  messagingSenderId: "247154942228",
  appId: "1:247154942228:web:5aad334ac029df17a1e201",
  measurementId: "G-VLF5HD290Z"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  if (!payload.notification) {
    const notificationTitle = payload?.data?.title || "Nova Atualização";
    const notificationOptions = {
      body: payload?.data?.body || "",
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [200, 100, 200, 100, 200, 100, 200], // Long vibration pattern
      requireInteraction: true,
      data: {
        url: self.location.origin
      }
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
