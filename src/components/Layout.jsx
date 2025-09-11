import { useState } from 'react';
import { useApp } from '../context/AppContext';
import InstallPWA from './InstallPWA';
import { 
  Home, 
  Plus, 
  ChefHat, 
  Recycle, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X,
  Leaf
} from 'lucide-react';

const Layout = ({ children, currentPage, onPageChange }) => {
  const { user, logout, notifications, clearNotification } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'add-product', name: 'Añadir Producto', icon: Plus },
    { id: 'recipes', name: 'Recetas', icon: ChefHat },
    { id: 'disposal', name: 'Gestión de Residuos', icon: Recycle },
  ];

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación superior */}
      <nav className="bg-white border-b border-gray-200 shadow-sm fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            {/* Logo y menú móvil */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
              
              <div className="flex items-center ml-2 md:ml-0">
                <div className="h-7 w-7 sm:h-8 sm:w-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                  <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">FreshKeeper</h1>
              </div>
            </div>

            {/* Navegación desktop */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onPageChange(item.id)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </button>
                );
              })}
            </div>

            {/* Usuario y notificaciones */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Notificaciones */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 relative"
                >
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 bg-red-500 rounded-full transform translate-x-1 -translate-y-1"></span>
                  )}
                </button>

                {/* Panel de notificaciones */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900">Notificaciones</h3>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">No hay notificaciones</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div key={notification.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start flex-1">
                                <div className="bg-orange-100 rounded-full p-1 mr-3">
                                  <Bell className="h-4 w-4 text-orange-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {notification.timestamp ? 
                                      new Date(notification.timestamp).toLocaleTimeString('es-ES', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })
                                      : 'Producto por caducar'
                                    }
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => clearNotification(notification.id)}
                                className="text-gray-400 hover:text-gray-600 ml-2"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Menú de usuario */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate max-w-32">{user?.email}</p>
                </div>
                
                <div className="bg-green-100 rounded-full p-1.5 sm:p-2">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onPageChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </button>
                );
              })}
              
              {/* Usuario en móvil */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 pt-20 sm:pt-24">
        {children}
      </main>

      {/* Click overlay para cerrar notificaciones */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}

      {/* Banner de instalación PWA */}
      <InstallPWA />
    </div>
  );
};

export default Layout;
