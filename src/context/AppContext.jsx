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
    // Datos de ejemplo con imágenes reales
    {
      id: 1,
      name: 'Leche entera',
      expiryDate: '2025-09-14', // 2 días desde hoy
      category: 'Lácteos',
      quantity: 1,
      unit: 'litro',
      location: 'Nevera',
      addedDate: '2025-09-10',
      photo: '/leche.jpeg',
      status: 'fresh'
    },
    {
      id: 2,
      name: 'Manzanas Rojas',
      expiryDate: '2025-09-13', // 1 día desde hoy
      category: 'Frutas',
      quantity: 6,
      unit: 'unidades',
      location: 'Frutero',
      addedDate: '2025-09-08',
      photo: '/manzanasrojas.jpg',
      status: 'ripe'
    },
    {
      id: 3,
      name: 'Pan integral',
      expiryDate: '2025-09-15', // 3 días desde hoy
      category: 'Panadería',
      quantity: 1,
      unit: 'barra',
      location: 'Despensa',
      addedDate: '2025-09-12',
      photo: '/panintegral.jpg',
      status: 'fresh'
    },
    {
      id: 4,
      name: 'Yogur natural',
      expiryDate: '2025-09-11', // Caducado ayer
      category: 'Lácteos',
      quantity: 4,
      unit: 'unidades',
      location: 'Nevera',
      addedDate: '2025-09-01',
      photo: '/yogurthnatural.jpg',
      status: 'expired'
    }
  ]);

  // Simular notificaciones
  const [notifications, setNotifications] = useState([]);
  const [toastNotifications, setToastNotifications] = useState([]);
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
    setToastNotifications([]);
    notifiedProductsRef.current.clear();
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
    setToastNotifications(prev => prev.filter(n => n.product.id !== id));
    // Remover de productos notificados
    notifiedProductsRef.current.delete(id);
  };

  const markProductAsConsumed = (id) => {
    setProducts(prev => prev.filter(product => product.id !== id));
    // Limpiar notificaciones del producto consumido
    setNotifications(prev => prev.filter(n => n.product.id !== id));
    setToastNotifications(prev => prev.filter(n => n.product.id !== id));
    // Remover de productos notificados
    notifiedProductsRef.current.delete(id);
    
    // Agregar notificación de confirmación
    setToastNotifications(prev => [...prev, {
      id: `consumed-${Date.now()}`,
      type: 'success',
      message: 'Producto marcado como consumido',
      timestamp: new Date().toISOString()
    }]);
  };

  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const clearToastNotification = (notificationId) => {
    setToastNotifications(prev => prev.filter(n => n.id !== notificationId));
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
        
        // Crear notificaciones toast personalizadas para cada producto
        const toastNotifications = newNotifications.map(notification => ({
          ...notification,
          showAsToast: true,
          id: `toast-${notification.id}` // ID único para toast
        }));
        
        newNotifications.forEach(notification => {
          notifiedProductsRef.current.add(notification.product.id);
        });
        
        // Añadir toasts con un pequeño delay para animación escalonada
        toastNotifications.forEach((toast, index) => {
          setTimeout(() => {
            setToastNotifications(prev => [...prev, toast]);
          }, index * 500); // 500ms de delay entre cada toast
        });
        
        console.log('Notificaciones añadidas al estado y toasts creados');
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

  // Registrar service worker (mantenido para funcionalidad PWA)
  useEffect(() => {
    if (user) {
      // Registrar service worker para funcionalidad PWA
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registrado exitosamente');
            
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
    }
  }, [user]);

  // Sistema de notificaciones toast personalizadas (reemplaza las push notifications del navegador)
  // Las notificaciones toast se manejan en el contenedor NotificationToastContainer

  const value = {
    user,
    products,
    notifications,
    toastNotifications,
    login,
    logout,
    addProduct,
    deleteProduct,
    markProductAsConsumed,
    clearNotification,
    clearToastNotification,
    getExpiringProducts,
    getExpiredProducts,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
