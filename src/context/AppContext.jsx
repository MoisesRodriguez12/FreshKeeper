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
      const newNotifications = expiring
        .filter(product => !notifiedProductsRef.current.has(product.id))
        .map(product => ({
          id: `exp-${product.id}`,
          type: 'warning',
          message: `${product.name} expirará pronto`,
          product: product,
          timestamp: new Date().toISOString()
        }));
      
      if (newNotifications.length > 0) {
        setNotifications(prev => [...prev, ...newNotifications]);
        
        // Marcar productos como notificados
        newNotifications.forEach(notification => {
          notifiedProductsRef.current.add(notification.product.id);
        });
      }
    };

    // Verificar inmediatamente al cargar
    checkExpiringProducts();
    
    // Verificar cada 30 minutos
    const interval = setInterval(checkExpiringProducts, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, getExpiringProducts]);

  // Solicitar permisos de notificación
  useEffect(() => {
    if (user && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [user]);

  // Enviar notificaciones push
  const lastNotificationCount = useRef(0);
  
  useEffect(() => {
    // Solo enviar notificaciones para nuevas notificaciones
    const newNotificationsCount = notifications.length;
    
    if (newNotificationsCount > lastNotificationCount.current && 'Notification' in window && Notification.permission === 'granted') {
      const newNotifications = notifications.slice(lastNotificationCount.current);
      
      newNotifications.forEach(notification => {
        if (notification.type === 'warning') {
          new Notification('🍎 FreshKeeper - ¡Producto por caducar!', {
            body: notification.message,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag: `expiry-${notification.product.id}`,
            requireInteraction: false,
            silent: false,
            data: {
              productId: notification.product.id,
              productName: notification.product.name
            }
          });
        }
      });
    }
    
    lastNotificationCount.current = newNotificationsCount;
  }, [notifications]);

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
