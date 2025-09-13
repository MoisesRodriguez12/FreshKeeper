import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { 
  Search, 
  Filter, 
  Trash2, 
  Check, 
  Clock, 
  MapPin, 
  Package,
  AlertTriangle,
  Image as ImageIcon,
  Eye,
  X
} from 'lucide-react';

const MyProducts = () => {
  const { products, deleteProduct, markProductAsConsumed } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [sortBy, setSortBy] = useState('expiryDate');

  // Obtener categorías únicas
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    return cats.sort();
  }, [products]);

  // Función para determinar el estado de caducidad
  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return 'no-expiry';
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 1) return 'expiring-soon';
    if (daysUntilExpiry <= 7) return 'expiring-week';
    return 'fresh';
  };

  // Filtrar y ordenar productos
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (product.category?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      
      const expiryStatus = getExpiryStatus(product.expiryDate);
      const matchesStatus = selectedStatus === 'all' || 
                           (selectedStatus === 'expired' && expiryStatus === 'expired') ||
                           (selectedStatus === 'expiring' && (expiryStatus === 'expiring-soon' || expiryStatus === 'expiring-week')) ||
                           (selectedStatus === 'fresh' && expiryStatus === 'fresh') ||
                           (selectedStatus === 'no-expiry' && expiryStatus === 'no-expiry');
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Ordenar productos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        case 'addedDate':
          return new Date(b.addedDate) - new Date(a.addedDate);
        case 'expiryDate':
        default:
          if (!a.expiryDate && !b.expiryDate) return 0;
          if (!a.expiryDate) return 1;
          if (!b.expiryDate) return -1;
          return new Date(a.expiryDate) - new Date(b.expiryDate);
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, selectedStatus, sortBy]);

  const handleDeleteProduct = (productId, productName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${productName}"?`)) {
      deleteProduct(productId);
    }
  };

  const handleMarkAsConsumed = (productId, productName) => {
    if (window.confirm(`¿Marcar "${productName}" como consumido?`)) {
      markProductAsConsumed(productId);
    }
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  const getStatusBadge = (expiryStatus) => {
    const statusConfig = {
      'expired': { bg: 'bg-red-100', text: 'text-red-800', label: 'Caducado' },
      'expiring-soon': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Caduca pronto' },
      'expiring-week': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Caduca esta semana' },
      'fresh': { bg: 'bg-green-100', text: 'text-green-800', label: 'Fresco' },
      'no-expiry': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Sin caducidad' }
    };

    const config = statusConfig[expiryStatus] || statusConfig['fresh'];
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Productos</h1>
            <p className="text-gray-600 mt-1">
              Gestiona tu inventario: {filteredProducts.length} productos
            </p>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por categoría */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Filtro por estado */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="expired">Caducados</option>
            <option value="expiring">Por caducar</option>
            <option value="fresh">Frescos</option>
            <option value="no-expiry">Sin caducidad</option>
          </select>

          {/* Ordenar por */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="expiryDate">Fecha de caducidad</option>
            <option value="name">Nombre</option>
            <option value="category">Categoría</option>
            <option value="addedDate">Fecha agregado</option>
          </select>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'No se encontraron productos con los filtros aplicados.'
                : 'Aún no has agregado productos a tu inventario.'}
            </p>
          </div>
        ) : (
          filteredProducts.map(product => {
            const expiryStatus = getExpiryStatus(product.expiryDate);
            
            return (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Información del producto */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Imagen del producto */}
                    <div className="flex-shrink-0">
                      {product.photo ? (
                        <div className="relative">
                          <img
                            src={product.photo}
                            alt={product.name}
                            className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => openImageModal(product.photo)}
                          />
                          <button
                            onClick={() => openImageModal(product.photo)}
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 rounded-lg transition-all"
                          >
                            <Eye className="h-4 w-4 text-white opacity-0 hover:opacity-100" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Detalles */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {product.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            {product.category && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                {product.category}
                              </span>
                            )}
                            {getStatusBadge(expiryStatus)}
                          </div>
                        </div>
                      </div>

                      {/* Información adicional */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <span>{product.quantity} {product.unit}</span>
                        </div>
                        
                        {product.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{product.location}</span>
                          </div>
                        )}
                        
                        {product.expiryDate && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>Caduca: {format(new Date(product.expiryDate), 'dd/MM/yyyy')}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <span>Agregado: {format(new Date(product.addedDate), 'dd/MM/yyyy')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleMarkAsConsumed(product.id, product.name)}
                      className="flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                      title="Marcar como consumido"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Consumido
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id, product.name)}
                      className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                      title="Eliminar producto"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal para imagen */}
      {showImageModal && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-8 w-8" />
            </button>
            <img
              src={selectedImage}
              alt="Imagen del producto"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProducts;