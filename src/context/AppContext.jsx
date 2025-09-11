import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([
    // Datos de ejemplo
    {
      id: 1,
      name: 'Leche entera',
      expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 días
      category: 'Lácteos',
      image: null,
      status: 'fresh'
    },
    {
      id: 2,
      name: 'Manzanas',
      expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 día
      category: 'Frutas',
      image: null,
      status: 'ripe'
    },
    {
      id: 3,
      name: 'Pan integral',
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días
      category: 'Panadería',
      image: null,
      status: 'fresh'
    },
    {
      id: 4,
      name: 'Yogur natural',
      expiryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Caducado ayer
      category: 'Lácteos',
      image: null,
      status: 'expired'
    }
  ]);

  // Simular notificaciones
  const [notifications, setNotifications] = useState([]);
  const notifiedProductsRef = useRef(new Set());

  const login = (email, password) => {
    // Simulación de login
    if (email && password) {
      setUser({ email, name: 'Usuario Demo' });
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    // Limpiar notificaciones y estado al hacer logout
    setNotifications([]);
    notifiedProductsRef.current.clear();
    lastNotificationCount.current = 0;
  };

  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now(),
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(product => product.id !== id));
    // Limpiar notificaciones del producto eliminado
    setNotifications(prev => prev.filter(n => n.product.id !== id));
    // Remover de productos notificados
    notifiedProductsRef.current.delete(id);
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getExpiringProducts = useCallback(() => {
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    return products.filter(product => {
      const expiryDate = new Date(product.expiryDate);
      return expiryDate <= threeDaysFromNow && expiryDate >= today;
    });
  }, [products]);

  const getExpiredProducts = useCallback(() => {
    const today = new Date();
    return products.filter(product => {
      const expiryDate = new Date(product.expiryDate);
      return expiryDate < today;
    });
  }, [products]);

  // Verificar productos que expiran y generar notificaciones
  useEffect(() => {
    if (!user) return;

    const checkExpiringProducts = () => {
      const expiring = getExpiringProducts();
      console.log('Productos por caducar encontrados:', expiring.length);
      
      const newNotifications = expiring
        .filter(product => !notifiedProductsRef.current.has(product.id))
        .map(product => ({
          id: `exp-${product.id}`,
          type: 'warning',
          message: `${product.name} expirará pronto`,
          product: product,
          timestamp: new Date().toISOString()
        }));
      
      console.log('Nuevas notificaciones a crear:', newNotifications.length);
      
      if (newNotifications.length > 0) {
        setNotifications(prev => [...prev, ...newNotifications]);
        
        // Enviar push notifications para cada producto
        newNotifications.forEach(notification => {
          notifiedProductsRef.current.add(notification.product.id);
          
          // Enviar push notification
          console.log('Enviando push notification para:', notification.product.name);
          sendNotification({
            id: notification.id,
            type: 'expiry',
            product: notification.product,
            message: `${notification.product.name} expirará pronto. ¡Úsalo antes de que se eche a perder!`,
            timestamp: new Date()
          });
        });
        
        console.log('Notificaciones añadidas al estado y push notifications enviadas');
      }
    };

    // Verificar inmediatamente al cargar con un pequeño delay
    const timeoutId = setTimeout(checkExpiringProducts, 1000);
    
    // Verificar cada 30 minutos
    const interval = setInterval(checkExpiringProducts, 30 * 60 * 1000);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [user, getExpiringProducts]);

  // Registrar service worker y solicitar permisos de notificación
  useEffect(() => {
    if (user) {
      // Registrar service worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registrado exitosamente');
            
            // Esperar a que esté listo
            return navigator.serviceWorker.ready;
          })
          .then((registration) => {
            console.log('Service Worker listo para notificaciones');
            
            // Verificar si hay actualizaciones
            registration.addEventListener('updatefound', () => {
              console.log('Nueva versión disponible');
            });
          })
          .catch((error) => {
            console.error('Error al registrar Service Worker:', error);
          });
      } else {
        console.log('Service Workers no soportados en este navegador');
      }

      // Solicitar permisos de notificación
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              console.log('Permisos de notificación concedidos');
            }
          });
        }
      }
    }
  }, [user]);

  // Enviar notificaciones push
  const lastNotificationCount = useRef(0);
  
  const sendNotification = useCallback(async (notification) => {
    if (!('Notification' in window)) {
      console.log('Notificaciones no soportadas');
      return;
    }

    if (Notification.permission !== 'granted') {
      console.log('Permisos de notificación no concedidos');
      return;
    }

    console.log('Intentando enviar notificación para:', notification.product.name);

    try {
      // Intentar usar Service Worker para notificaciones con acciones
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        try {
          const registration = await navigator.serviceWorker.ready;
          
          if (registration && typeof registration.showNotification === 'function') {
            console.log('Enviando notificación via Service Worker');
            await registration.showNotification('🍎 FreshKeeper - ¡Producto por caducar!', {
              body: notification.message,
              icon: '/favicon.svg',
              badge: '/favicon.svg',
              tag: `expiry-${notification.product.id}`,
              requireInteraction: false,
              silent: false,
              vibrate: [200, 100, 200],
              data: {
                productId: notification.product.id,
                productName: notification.product.name,
                url: window.location.origin
              },
              actions: [
                {
                  action: 'view',
                  title: 'Ver producto',
                  icon: '/favicon.svg'
                }
              ]
            });
            console.log('Notificación SW enviada exitosamente');
            return;
          }
        } catch (swError) {
          console.log('Error con Service Worker, usando fallback:', swError.message);
        }
      }

      // Fallback: notificación simple sin acciones
      console.log('Enviando notificación directa (fallback)');
      const notificationOptions = {
        body: notification.message,
        icon: window.location.origin + '/favicon.svg',
        tag: `expiry-${notification.product.id}`,
        requireInteraction: false,
        silent: false,
        data: {
          productId: notification.product.id,
          productName: notification.product.name
        }
      };

      // Añadir vibración solo en dispositivos móviles
      if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        notificationOptions.vibrate = [200, 100, 200];
      }

      const notif = new Notification('🍎 FreshKeeper - ¡Producto por caducar!', notificationOptions);
      console.log('Notificación directa creada');
      
      // Auto-cerrar después de 8 segundos
      setTimeout(() => {
        try {
          notif.close();
        } catch (e) {
          // Ignorar errores de cierre
        }
      }, 8000);

      notif.onclick = () => {
        window.focus();
        notif.close();
      };

      notif.onerror = (error) => {
        console.error('Error en notificación directa:', error);
      };

    } catch (error) {
      console.error('Error al enviar notificación:', error);
      
      // Último recurso: notificación ultra básica
      try {
        console.log('Intentando notificación ultra básica');
        const basicNotif = new Notification('🍎 FreshKeeper', {
          body: notification.message
        });
        
        basicNotif.onclick = () => {
          window.focus();
          basicNotif.close();
        };
        
        setTimeout(() => basicNotif.close(), 5000);
        console.log('Notificación básica enviada');
      } catch (basicError) {
        console.error('Error con notificación básica:', basicError);
      }
    }
  }, []);
  
  useEffect(() => {
    // Solo enviar notificaciones para nuevas notificaciones
    const newNotificationsCount = notifications.length;
    console.log(`Total notificaciones: ${newNotificationsCount}, Últimas enviadas: ${lastNotificationCount.current}`);
    
    if (newNotificationsCount > lastNotificationCount.current) {
      const newNotifications = notifications.slice(lastNotificationCount.current);
      console.log('Enviando notificaciones push:', newNotifications.length);
      
      newNotifications.forEach((notification, index) => {
        if (notification.type === 'warning') {
          console.log(`Enviando notificación ${index + 1}:`, notification.product.name);
          sendNotification(notification);
        }
      });
    }
    
    lastNotificationCount.current = newNotificationsCount;
  }, [notifications, sendNotification]);

  const value = {
    user,
    products,
    notifications,
    login,
    logout,
    addProduct,
    deleteProduct,
    clearNotification,
    getExpiringProducts,
    getExpiredProducts,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
