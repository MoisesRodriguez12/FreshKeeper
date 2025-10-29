import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getDisposalTips, getExpiryStatus } from '../utils/helpers';
import { Recycle, Trash2, Sprout, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import productService from '../services/productService';

const Disposal = () => {
  const { user } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar productos del usuario desde Firebase
  useEffect(() => {
    if (user) {
      loadUserProducts();
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

  const expiredProducts = products.filter(p => getExpiryStatus(p.expiryDate) === 'expired');
  const categories = [...new Set(products.map(p => p.category))];

  const compostGuide = {
    suitable: [
      'Restos de frutas y verduras',
      'Cáscaras de huevo trituradas',
      'Posos de café y filtros',
      'Bolsitas de té (sin grapas)',
      'Pan y cereales (sin moho)',
      'Hojas secas',
      'Recortes de césped',
      'Papel y cartón sin tintas'
    ],
    avoid: [
      'Carnes y pescados',
      'Productos lácteos',
      'Aceites y grasas',
      'Alimentos cocinados con sal',
      'Cenizas de carbón',
      'Excrementos de mascotas',
      'Plantas enfermas',
      'Material sintético'
    ]
  };

  const compostSteps = [
    {
      title: 'Preparación del contenedor',
      description: 'Usa un contenedor con agujeros para ventilación. Puede ser una compostera comercial o un recipiente casero.'
    },
    {
      title: 'Capas alternas',
      description: 'Alterna capas de material húmedo (restos de cocina) con material seco (hojas, papel).'
    },
    {
      title: 'Humedad adecuada',
      description: 'El compost debe estar húmedo como una esponja escurrida. Riega si está muy seco.'
    },
    {
      title: 'Ventilación',
      description: 'Remueve el compost cada 2-3 semanas para aportar oxígeno y acelerar la descomposición.'
    },
    {
      title: 'Tiempo de maduración',
      description: 'El compost estará listo en 3-6 meses. Tendrá aspecto de tierra oscura y olor a bosque.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-2">
          <Recycle className="h-6 w-6 text-green-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Residuos</h1>
        </div>
        <p className="text-gray-600">Aprende a desechar correctamente y crear compost casero</p>
      </div>

      {/* Productos caducados */}
      {expiredProducts.length > 0 && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h2 className="text-lg font-semibold text-red-900">Productos caducados que necesitan gestión</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expiredProducts.map((product) => {
              const tips = getDisposalTips(product.category);
              
              return (
                <div key={product.id} className="bg-white rounded-lg border border-red-200 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.category}</p>
                    </div>
                    <span className="text-2xl">{tips.icon}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                      tips.compost ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {tips.compost ? (
                        <>
                          <Sprout className="h-3 w-3 mr-1" />
                          Apto para compost
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-3 w-3 mr-1" />
                          Solo contenedor orgánico
                        </>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-700">{tips.disposal}</p>
                    
                    {tips.compostTip && (
                      <p className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-200">
                        Tip: {tips.compostTip}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Guía por categorías */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Consejos de desecho */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Trash2 className="h-5 w-5 text-gray-600 mr-2" />
            Consejos de Desecho por Categoría
          </h2>
          
          <div className="space-y-4">
            {categories.map((category) => {
              const tips = getDisposalTips(category);
              
              return (
                <div key={category} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">{tips.icon}</span>
                    <h3 className="font-medium text-gray-900">{category}</h3>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2">{tips.disposal}</p>
                  
                  <div className={`inline-flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                    tips.compost ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {tips.compost ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Compostable
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        No compostable
                      </>
                    )}
                  </div>
                  
                  {tips.compostTip && (
                    <p className="text-xs text-green-700 mt-2 bg-green-50 p-2 rounded border border-green-200">
                      <strong>Tip:</strong> {tips.compostTip}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Guía de compost */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Sprout className="h-5 w-5 text-green-600 mr-2" />
            Guía de Compost Casero
          </h2>
          
          {/* Qué compostar */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">¿Qué puedo compostar?</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Materiales adecuados
                </h4>
                <div className="space-y-1">
                  {compostGuide.suitable.map((item, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Evitar compostar
                </h4>
                <div className="space-y-1">
                  {compostGuide.avoid.map((item, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-700">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pasos del compost */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Pasos para hacer compost</h3>
            
            <div className="space-y-4">
              {compostSteps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="bg-green-100 text-green-800 rounded-full p-2 mr-3 flex-shrink-0">
                    <span className="text-lg">{step.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{step.title}</h4>
                    <p className="text-sm text-gray-700 mt-1">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Información importante</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p>• <strong>Contenedor orgánico:</strong> Para residuos orgánicos que no se pueden compostar en casa o productos caducados.</p>
              <p>• <strong>Compost casero:</strong> Solo para material vegetal fresco, sin cocinar y sin productos de origen animal.</p>
              <p>• <strong>Seguridad:</strong> Nunca consumas alimentos visiblemente deteriorados, con moho o mal olor.</p>
              <p>• <strong>Higiene:</strong> Lávate bien las manos después de manipular residuos orgánicos.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disposal;
