import { useState, useEffect } from 'react';
import NotificationToast from './NotificationToast';

const NotificationToastContainer = ({ notifications, onViewProduct, onClose }) => {
  const [activeToasts, setActiveToasts] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Gestionar notificaciones activas
  useEffect(() => {
    // Agregar nuevas notificaciones que no estén ya activas
    const newToasts = notifications.filter(notification => 
      !activeToasts.some(toast => toast.id === notification.id) &&
      notification.showAsToast // Solo mostrar las marcadas para toast
    );

    if (newToasts.length > 0) {
      setActiveToasts(prev => [...prev, ...newToasts]);
    }
  }, [notifications, activeToasts]);

  const handleCloseToast = (notificationId) => {
    setActiveToasts(prev => prev.filter(toast => toast.id !== notificationId));
    onClose(notificationId);
  };

  const handleViewProduct = () => {
    onViewProduct();
    // Cerrar todos los toasts
    setActiveToasts([]);
  };

  return (
    <>
      {activeToasts.map((notification, index) => (
        <div
          key={notification.id}
          className={`
            notification-toast-container fixed
            ${isMobile 
              ? 'left-0 right-0' 
              : 'right-4'
            }
          `}
          style={{
            zIndex: 9999 - index,
            ...(isMobile ? {
              // En móvil, apilar desde abajo
              bottom: `${16 + (index * 100)}px`
            } : {
              // En desktop, apilar hacia abajo
              top: `${16 + (index * 120)}px`
            })
          }}
        >
          <NotificationToast
            notification={notification}
            onClose={() => handleCloseToast(notification.id)}
            onView={handleViewProduct}
            isMobile={isMobile}
          />
        </div>
      ))}
    </>
  );
};

export default NotificationToastContainer;