import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Upload, Plus, Calendar, Package, Tag, AlertCircle } from 'lucide-react';
import { getFreshnesOptions } from '../utils/helpers';

const AddProduct = () => {
  const { addProduct } = useApp();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    expiryDate: '',
    image: null,
    status: 'fresh',
    customCategory: ''
  });
  
  const [showFreshnessOptions, setShowFreshnessOptions] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const categories = [
    'Frutas', 'Verduras', 'Lácteos', 'Carnes', 'Pescados', 'Panadería', 
    'Conservas', 'Congelados', 'Bebidas', 'Snacks', 'Otros'
  ];

  const freshnessOptions = getFreshnesOptions();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mostrar opciones de frescura para frutas y verduras
    if (name === 'category' && (value === 'Frutas' || value === 'Verduras')) {
      setShowFreshnessOptions(true);
    } else if (name === 'category') {
      setShowFreshnessOptions(false);
      setFormData(prev => ({ ...prev, status: 'fresh' }));
    }
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Por favor selecciona una imagen válida' }));
        return;
      }
      
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'La imagen debe ser menor a 5MB' }));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setImagePreview(imageUrl);
        setFormData(prev => ({ ...prev, image: imageUrl }));
        setErrors(prev => ({ ...prev, image: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del producto es obligatorio';
    }
    
    if (!formData.category && !formData.customCategory) {
      newErrors.category = 'Selecciona o escribe una categoría';
    }
    
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'La fecha de caducidad es obligatoria';
    } else {
      const selectedDate = new Date(formData.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.expiryDate = 'La fecha no puede ser anterior a hoy';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const finalCategory = formData.customCategory || formData.category;
    
    const productData = {
      name: formData.name.trim(),
      category: finalCategory,
      expiryDate: new Date(formData.expiryDate),
      image: formData.image,
      status: formData.status
    };
    
    addProduct(productData);
    
    // Resetear formulario
    setFormData({
      name: '',
      category: '',
      expiryDate: '',
      image: null,
      status: 'fresh',
      customCategory: ''
    });
    setImagePreview(null);
    setShowFreshnessOptions(false);
    setErrors({});
    
    // Mostrar mensaje de éxito (podrías usar un toast aquí)
    alert('Producto añadido exitosamente');
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center mb-6">
          <Plus className="h-6 w-6 text-green-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Añadir Producto</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Imagen del producto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagen del producto (opcional)
            </label>
            
            <div className="flex space-x-4">
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, image: null }));
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="h-32 w-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-green-400 transition-colors cursor-pointer"
                     onClick={triggerFileInput}>
                  <Upload className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Subir imagen</span>
                </div>
              )}
              
              <button
                type="button"
                onClick={triggerFileInput}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Camera className="h-4 w-4 mr-2" />
                Seleccionar imagen
              </button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            {errors.image && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.image}
              </p>
            )}
          </div>

          {/* Nombre del producto */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del producto *
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: Leche entera, Manzanas, Pan integral..."
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <div className="space-y-3">
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="text-center text-sm text-gray-500">o</div>
              
              <input
                type="text"
                name="customCategory"
                value={formData.customCategory}
                onChange={handleInputChange}
                placeholder="Escribe una categoría personalizada"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Opciones de frescura para frutas y verduras */}
          {showFreshnessOptions && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Estado del producto
              </label>
              <div className="grid grid-cols-2 gap-3">
                {freshnessOptions.map(option => (
                  <label
                    key={option.value}
                    className={`relative flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      formData.status === option.value 
                        ? `border-${option.color}-300 bg-${option.color}-50` 
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={option.value}
                      checked={formData.status === option.value}
                      onChange={handleInputChange}
                      className="sr-only"
                    />
                    <div className={`w-3 h-3 rounded-full border-2 mr-3 ${
                      formData.status === option.value 
                        ? `bg-${option.color}-500 border-${option.color}-500` 
                        : 'border-gray-300'
                    }`} />
                    <span className="text-sm font-medium text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Fecha de caducidad */}
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de caducidad *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  errors.expiryDate ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.expiryDate && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.expiryDate}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Añadir Producto</span>
            </button>
            
            <button
              type="button"
              onClick={() => {
                setFormData({
                  name: '',
                  category: '',
                  expiryDate: '',
                  image: null,
                  status: 'fresh',
                  customCategory: ''
                });
                setImagePreview(null);
                setShowFreshnessOptions(false);
                setErrors({});
              }}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
