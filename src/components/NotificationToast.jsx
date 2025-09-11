import { useState, useEffect, useRef } from 'react';
import { Bell, X, AlertTriangle, Clock } from 'lucide-react';
import './NotificationToast.css';

const NotificationToast = ({ notification, onClose, onView, isMobile }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartY = useRef(0);
  const toastRef = useRef(null);

  useEffect(() => {
    // Animación de entrada
    const timer = setTimeout(() => {
      setIsVisible(true);
      
      // Vibración en dispositivos móviles
      if (isMobile && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isMobile]);

  useEffect(() => {
    // Auto cerrar después de 8 segundos
    const timer = setTimeout(() => {
      handleClose();
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleView = () => {
    onView();
    handleClose();
  };

  // Gestos táctiles para móvil
  const handleTouchStart = (e) => {
    if (!isMobile) return;
    touchStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isMobile || !isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;
    
    // Solo permitir deslizar hacia abajo
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isMobile || !isDragging) return;
    
    // Si se deslizó más de 50px hacia abajo, cerrar
    if (dragOffset > 50) {
      handleClose();
    } else {
      // Volver a la posición original
      setDragOffset(0);
    }
    
    setIsDragging(false);
  };

  return (
    <div
      ref={toastRef}
      className={`
        notification-toast bg-white rounded-xl border border-gray-100 overflow-hidden
        backdrop-blur-sm select-none
        ${isMobile 
          ? 'notification-toast-mobile mx-4 max-w-sm touch-pan-y' 
          : 'w-96'
        }
        ${isVisible && !isExiting 
          ? 'opacity-100 scale-100' 
          : 'opacity-0 scale-95'
        }
        ${isDragging ? 'notification-dragging' : 'notification-drag-transition'}
      `}
      style={{
        boxShadow: isMobile 
          ? '0 10px 25px rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.1)' 
          : '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
        transform: `translateY(${
          isVisible && !isExiting 
            ? dragOffset 
            : '100%'
        }px) scale(${
          isVisible && !isExiting 
            ? isDragging 
              ? Math.max(0.95, 1 - dragOffset / 500)
              : 1
            : 0.95
        })`
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Indicador de deslizar en móvil */}
      {isMobile && (
        <div className="flex justify-center py-1 bg-gray-50">
          <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
        </div>
      )}

      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-orange-400 to-red-400 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 rounded-full p-1">
              <Bell className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-medium text-sm">
              🍎 FreshKeeper
            </span>
          </div>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

        {/* Contenido */}
        <div className={`p-4 ${isDragging && dragOffset > 30 ? 'opacity-70' : ''}`}>
          <div className="flex items-start space-x-3">
            <div className="bg-orange-100 rounded-full p-2 flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                ¡Producto por caducar!
              </h4>
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">{notification.product.name}</span> expirará pronto
              </p>
              <p className="text-xs text-gray-500 mb-3">
                ¡Úsalo antes de que se eche a perder!
              </p>
              
              {/* Fecha de caducidad */}
              <div className="flex items-center space-x-1 text-xs text-gray-500 mb-3">
                <Clock className="h-3 w-3" />
                <span>
                  Caduca: {new Date(notification.product.expiryDate).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {/* Botones de acción */}
              <div className="flex space-x-2">
                <button
                  onClick={handleView}
                  className={`
                    flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700 
                    text-white text-xs font-medium rounded-lg transition-all duration-150
                    ${isMobile 
                      ? 'py-3 px-4 text-sm' 
                      : 'py-2 px-3'
                    }
                    transform active:scale-95
                  `}
                >
                  Ver productos
                </button>
                <button
                  onClick={handleClose}
                  className={`
                    text-gray-500 hover:text-gray-700 active:text-gray-800 
                    text-xs font-medium transition-all duration-150 rounded-lg
                    hover:bg-gray-100 active:bg-gray-200
                    ${isMobile 
                      ? 'py-3 px-4 text-sm' 
                      : 'py-2 px-3'
                    }
                    transform active:scale-95
                  `}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Barra de progreso */}
      <div className="h-1 bg-gray-100">
        <div 
          className="h-full bg-gradient-to-r from-orange-400 to-red-400 transition-all duration-[8000ms] ease-linear origin-left"
          style={{
            transform: isVisible ? 'scaleX(0)' : 'scaleX(1)',
            transformOrigin: 'left'
          }}
        />
      </div>
    </div>
  );
};

export default NotificationToast;