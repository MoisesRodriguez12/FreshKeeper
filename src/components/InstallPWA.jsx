import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevenir que Chrome 67 y anteriores muestren automáticamente el prompt
      e.preventDefault();
      // Guardar el evento para poder activarlo después
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Mostrar el prompt de instalación
    deferredPrompt.prompt();

    // Esperar a que el usuario responda al prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('Usuario aceptó instalar la PWA');
    } else {
      console.log('Usuario rechazó instalar la PWA');
    }

    // Limpiar el prompt guardado
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    setDeferredPrompt(null);
  };

  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm bg-green-600 text-white rounded-lg shadow-lg p-4 z-50 animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-semibold mb-1">Instalar FreshKeeper</h3>
          <p className="text-xs text-green-100 mb-3">
            Instala la app para acceso rápido y notificaciones push mejoradas
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={handleInstallClick}
              className="flex items-center px-3 py-1.5 bg-white text-green-600 rounded text-xs font-medium hover:bg-green-50 transition-colors"
            >
              <Download className="h-3 w-3 mr-1" />
              Instalar
            </button>
            
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-green-100 hover:text-white text-xs transition-colors"
            >
              Más tarde
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="ml-2 text-green-200 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default InstallPWA;
