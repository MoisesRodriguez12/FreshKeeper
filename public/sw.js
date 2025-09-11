// Service Worker para notificaciones push
self.addEventListener('install', (event) => {
  console.log('Service Worker instalado');
  // Forzar la activación inmediata
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activado');
  // Tomar control de todas las pestañas abiertas
  event.waitUntil(self.clients.claim());
});

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Tienes productos próximos a caducar',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: data.tag || 'freshkeeper-notification',
    data: data.data || {},
    requireInteraction: false,
    silent: false,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'view',
        title: 'Ver productos',
        icon: '/favicon.svg'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/favicon.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || '🍎 FreshKeeper - Producto por caducar',
      options
    )
  );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    // Abrir o enfocar la ventana de la aplicación
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        const client = clients.find((c) => c.visibilityState === 'visible');
        if (client) {
          client.focus();
        } else {
          self.clients.openWindow('/');
        }
      })
    );
  }
});

// Manejar cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
  console.log('Notificación cerrada:', event.notification.tag);
});
