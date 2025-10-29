import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import authService from '../services/authService';
import mealService from '../services/mealService';

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
  const [authLoading, setAuthLoading] = useState(true);
  const [products, setProducts] = useState([]);

  // Simular notificaciones
  const [notifications, setNotifications] = useState([]);
  const [toastNotifications, setToastNotifications] = useState([]);
  const notifiedProductsRef = useRef(new Set());

  // Manejar cambios en el estado de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(authService.formatUser(firebaseUser));
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    const result = await authService.logout();
    if (result.success) {
      setUser(null);
      setNotifications([]);
      setToastNotifications([]);
      notifiedProductsRef.current.clear();
    }
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

  // Verificar comidas que necesitan recordatorio (2-3 días después de guardar)
  useEffect(() => {
    if (!user) return;

    const checkMealNotifications = async () => {
      const result = await mealService.getMealsNeedingNotification();
      
      if (result.success && result.meals.length > 0) {
        console.log('Comidas que necesitan notificación:', result.meals.length);
        
        const mealNotifications = result.meals.map(meal => ({
          id: `meal-${meal.id}`,
          type: 'info',
          message: `¿Ya terminaste "${meal.recipeName}"? Revisa si se te acabó`,
          meal: meal,
          timestamp: new Date().toISOString()
        }));
        
        setNotifications(prev => [...prev, ...mealNotifications]);
        
        // Crear toasts para cada comida
        const mealToasts = mealNotifications.map(notification => ({
          ...notification,
          showAsToast: true,
          id: `toast-${notification.id}`
        }));
        
        // Añadir toasts con delay escalonado
        mealToasts.forEach((toast, index) => {
          setTimeout(() => {
            setToastNotifications(prev => [...prev, toast]);
          }, index * 500);
        });
        
        // Marcar notificaciones como enviadas
        result.meals.forEach(meal => {
          mealService.markNotificationSent(meal.id);
        });
      }
    };

    // Verificar al cargar
    const timeoutId = setTimeout(checkMealNotifications, 2000);
    
    // Verificar cada hora
    const interval = setInterval(checkMealNotifications, 60 * 60 * 1000);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, [user]);

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
    authLoading,
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
