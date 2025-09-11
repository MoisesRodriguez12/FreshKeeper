import { useApp } from '../context/AppContext';
import { formatRelativeDate, getExpiryStatus, getStatusColor } from '../utils/helpers';
import { AlertTriangle, Clock, Package, TrendingUp, Bell } from 'lucide-react';

const Dashboard = () => {
  const { products, getExpiringProducts, getExpiredProducts } = useApp();
  
  const expiringProducts = getExpiringProducts();
  const expiredProducts = getExpiredProducts();
  const totalProducts = products.length;
  const freshProducts = products.filter(p => getExpiryStatus(p.expiryDate) === 'fresh').length;

  const testNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('🍎 FreshKeeper - Notificación de prueba', {
          body: 'Las notificaciones están funcionando correctamente',
          icon: '/favicon.svg',
          tag: 'test-notification',
        });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('🍎 FreshKeeper - ¡Notificaciones activadas!', {
              body: 'Ahora recibirás alertas sobre productos por caducar',
              icon: '/favicon.svg',
              tag: 'permission-granted',
            });
          }
        });
      } else {
        alert('Las notificaciones están bloqueadas. Por favor, habilítalas en la configuración del navegador.');
      }
    } else {
      alert('Tu navegador no soporta notificaciones push.');
    }
  };

  const stats = [
    {
      title: 'Total de Productos',
      value: totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Productos Frescos',
      value: freshProducts,
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Por Vencer',
      value: expiringProducts.length,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Caducados',
      value: expiredProducts.length,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Panel de Control</h1>
            <p className="text-gray-600">Gestiona tus alimentos y evita el desperdicio</p>
          </div>
          <button
            onClick={testNotification}
            className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            title="Probar notificaciones push"
          >
            <Bell className="h-4 w-4 mr-2" />
            Probar Notificaciones
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.textColor} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Productos por caducar */}
      {expiringProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Productos Próximos a Caducar</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expiringProducts.map((product) => {
              const status = getExpiryStatus(product.expiryDate);
              const statusColor = getStatusColor(status);
              
              return (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                      {formatRelativeDate(product.expiryDate)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                  
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Todos los productos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Todos los Productos</h2>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No tienes productos registrados</p>
            <p className="text-sm text-gray-500 mt-1">Añade productos para comenzar a gestionarlos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de Caducidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => {
                  const status = getExpiryStatus(product.expiryDate);
                  const statusColor = getStatusColor(status);
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="h-10 w-10 rounded-lg object-cover mr-3"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                              <Package className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatRelativeDate(product.expiryDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${statusColor}`}>
                          {status === 'expired' ? 'Caducado' : 
                           status === 'critical' ? 'Crítico' :
                           status === 'warning' ? 'Por vencer' : 'Fresco'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
