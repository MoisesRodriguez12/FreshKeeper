import { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Camera, Upload, Plus, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import productService from '../services/productService';

const AddProduct = () => {
  const { user } = useApp();
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    expiryDate: ''
  });
  
  const [imageFile, setImageFile] = useState(null); // Guardar archivo real en vez de base64
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, photo: 'Por favor selecciona una imagen válida' }));
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photo: 'La imagen debe ser menor a 5MB' }));
        return;
      }
      
      // Guardar archivo real
      setImageFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setErrors(prev => ({ ...prev, photo: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del producto es obligatorio';
    }
    
    // La fecha ahora es opcional - se calculará automáticamente si no se proporciona
    if (formData.expiryDate) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user) {
      setErrors({ general: 'Debes iniciar sesión para agregar productos' });
      return;
    }
    
    setLoading(true);
    setSuccess('');
    setErrors({});
    
    const productData = {
      name: formData.name.trim()
    };
    
    // Solo agregar expiryDate si el usuario la proporcionó
    if (formData.expiryDate) {
      productData.expiryDate = formData.expiryDate;
    }
    
    // Pasar el archivo de imagen separadamente
    const result = await productService.addProduct(user.uid, productData, imageFile);
    
    setLoading(false);
    
    if (result.success) {
      setSuccess(`¡Producto "${result.product.name}" añadido en categoría "${result.product.category}"!`);
      
      setFormData({
        name: '',
        expiryDate: ''
      });
      setImageFile(null);
      setImagePreview(null);
      
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setErrors({ general: result.error });
    }
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto del producto (opcional)
            </label>
            
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
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
                      setImageFile(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div 
                  className="h-32 w-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-green-400 transition-colors cursor-pointer"
                  onClick={triggerFileInput}
                >
                  <Upload className="h-6 w-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500 text-center px-2">Click para subir</span>
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
            
            {errors.photo && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.photo}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del producto *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={loading}
              className={'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ' + (errors.name ? 'border-red-300' : 'border-gray-300')}
              placeholder="Ej: Manzanas, Leche, Pan integral..."
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.name}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              La categoría se detectará automáticamente según el nombre
            </p>
          </div>

          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de caducidad (opcional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                disabled={loading}
                min={new Date().toISOString().split('T')[0]}
                className={'w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ' + (errors.expiryDate ? 'border-red-300' : 'border-gray-300')}
              />
            </div>
            {errors.expiryDate && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.expiryDate}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Si no la especificas, se calculará automáticamente según el tipo de producto
            </p>
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-5 w-5" />
              <span>{loading ? 'Guardando...' : 'Añadir Producto'}</span>
            </button>
            
            <button
              type="button"
              onClick={() => {
                setFormData({
                  name: '',
                  expiryDate: ''
                });
                setImageFile(null);
                setImagePreview(null);
                setErrors({});
                setSuccess('');
              }}
              disabled={loading}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
