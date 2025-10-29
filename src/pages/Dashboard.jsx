import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatRelativeDate, getExpiryStatus, getStatusColor } from '../utils/helpers';
import { AlertTriangle, Clock, Package, TrendingUp } from 'lucide-react';
import DietQuestionnaire from '../components/DietQuestionnaire';
import dietService from '../services/dietService';
import productService from '../services/productService';

const Dashboard = () => {
  const { user } = useApp();
  
  const [products, setProducts] = useState([]);
  const [showDietQuestionnaire, setShowDietQuestionnaire] = useState(false);
  const [checkingDiet, setCheckingDiet] = useState(true);
  const [loading, setLoading] = useState(true);

  // Cargar productos del usuario desde Firebase
  useEffect(() => {
    if (user) {
      loadUserProducts();
      checkDietStatus();
    }
  }, [user]);

  const loadUserProducts = async () => {
    setLoading(true);
    const result = await productService.getUserProducts(user.uid);
    if (result.success) {
      setProducts(result.products);
    }
    setLoading(false);
  };

  const expiringProducts = products.filter(p => {
    const status = getExpiryStatus(p.expiryDate);
    return status === 'critical' || status === 'warning';
  });
  
  const expiredProducts = products.filter(p => getExpiryStatus(p.expiryDate) === 'expired');
  const totalProducts = products.length;
  const freshProducts = products.filter(p => getExpiryStatus(p.expiryDate) === 'fresh').length;

  const checkDietStatus = async () => {
    setCheckingDiet(true);
    
    // Verificar si tiene dieta
    const dietResult = await dietService.getUserDiet(user.uid);
    
    // Si no tiene dieta, verificar preferencias
    if (!dietResult.diet) {
      const prefsResult = await dietService.getUserPreferences(user.uid);
      
      if (prefsResult.success) {
        const { neverShowAgain } = prefsResult.preferences;
        
        // Solo mostrar si no ha marcado "nunca mostrar"
        if (!neverShowAgain) {
          setShowDietQuestionnaire(true);
        }
      }
    }
    
    setCheckingDiet(false);
  };

  const handleDietComplete = (diet) => {
    setShowDietQuestionnaire(false);
    // Aquí podrías mostrar un mensaje de éxito o redirigir a la página de dieta
    console.log('Dieta generada:', diet);
  };

  const handleSkipQuestionnaire = async () => {
    await dietService.skipQuestionnaire(user.uid);
    setShowDietQuestionnaire(false);
  };

  const handleNeverShowAgain = async () => {
    await dietService.setNeverShowAgain(user.uid);
    setShowDietQuestionnaire(false);
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Panel de Control</h1>
          <p className="text-sm sm:text-base text-gray-600">Gestiona tus alimentos y evita el desperdicio</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{stat.title}</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} ${stat.textColor} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
                  <Icon className="h-4 w-4 sm:h-6 sm:w-6" />
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
                  
                  {product.photo ? (
                    <img 
                      src={product.photo} 
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
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : (
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
                            {product.photo ? (
                              <img 
                                src={product.photo} 
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
      )}

      {/* Diet Questionnaire Modal */}
      {showDietQuestionnaire && (
        <DietQuestionnaire
          userId={user.uid}
          onComplete={handleDietComplete}
          onSkip={handleSkipQuestionnaire}
          onNeverShowAgain={handleNeverShowAgain}
        />
      )}
    </div>
  );
};

export default Dashboard;
