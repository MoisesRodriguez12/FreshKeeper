import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getExpiryStatus } from '../utils/helpers';
import { ChefHat, Clock, Users, Lightbulb, Sparkles, RefreshCw, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { generateRecipes } from '../config/gemini';
import productService from '../services/productService';
import mealService from '../services/mealService';

const Recipes = () => {
  const { user } = useApp();
  
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [servings, setServings] = useState(2);
  const [loading, setLoading] = useState(false);
  const [generatedRecipes, setGeneratedRecipes] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Cargar productos del usuario
  useEffect(() => {
    if (user) {
      loadUserProducts();
    }
  }, [user]);

  const loadUserProducts = async () => {
    const result = await productService.getUserProducts(user.uid);
    if (result.success) {
      // Ordenar productos por fecha de caducidad (más próximos primero)
      const sorted = result.products.sort((a, b) => {
        return new Date(a.expiryDate) - new Date(b.expiryDate);
      });
      setProducts(sorted);
    }
  };

  const handleProductToggle = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleGenerateRecipe = async () => {
    if (selectedProducts.length === 0) {
      setError('Selecciona al menos un producto');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedRecipes([]);

    try {
      const selectedProductNames = products
        .filter(p => selectedProducts.includes(p.id))
        .map(p => p.name);

      const recipes = await generateRecipes(selectedProductNames, servings);
      setGeneratedRecipes(recipes);
    } catch (err) {
      setError(err.message || 'Error al generar la receta');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateRecipe = () => {
    handleGenerateRecipe();
  };

  const handleSaveRecipe = async (recipe, recipeIndex) => {
    if (!user) {
      setError('Debes iniciar sesión');
      return;
    }

    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));

    const mealData = {
      products: selectedProductsData.map(p => ({ id: p.id, name: p.name })),
      servings: servings,
      recipeName: recipe.nombre,
      recipeContent: JSON.stringify(recipe),
      ingredients: recipe.ingredientes,
      instructions: recipe.pasos
    };

    const result = await mealService.saveMeal(user.uid, mealData);

    if (result.success) {
      setSuccess(`¡Receta "${recipe.nombre}" guardada! Te recordaremos en 2-3 días.`);
      
      // Eliminar la receta guardada del array de recetas generadas
      setGeneratedRecipes(prev => prev.filter((_, index) => index !== recipeIndex));
      
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError(result.error);
    }
  };

  // Obtener productos por caducar (próximos 7 días)
  const expiringProducts = products.filter(product => {
    const status = getExpiryStatus(product.expiryDate);
    return status === 'critical' || status === 'warning';
  });
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-2">
          <ChefHat className="h-6 w-6 text-orange-500 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Generar Receta con IA</h1>
        </div>
        <p className="text-gray-600">Selecciona ingredientes y genera recetas personalizadas con Gemini AI</p>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Productos por caducar sugeridos */}
      {expiringProducts.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 p-6">
          <div className="flex items-center mb-4">
            <Lightbulb className="h-5 w-5 text-orange-600 mr-2" />
            <h2 className="text-lg font-semibold text-orange-900">Productos sugeridos (próximos a caducar)</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {expiringProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductToggle(product.id)}
                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedProducts.includes(product.id)
                    ? 'bg-orange-600 text-white'
                    : 'bg-white border border-orange-200 text-orange-800 hover:bg-orange-100'
                }`}
              >
                {product.name}
                <span className="ml-2 text-xs">
                  ({getExpiryStatus(product.expiryDate) === 'critical' ? '⚠️ Urgente' : '⏰ Pronto'})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selector de productos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecciona ingredientes</h2>
        
        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No tienes productos registrados. Agrega productos primero para generar recetas.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductToggle(product.id)}
                className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedProducts.includes(product.id)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {product.photo && (
                  <img 
                    src={product.photo} 
                    alt={product.name}
                    className="w-5 h-5 rounded mr-2 object-cover"
                  />
                )}
                {product.name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cantidad de personas
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="number"
                min="1"
                max="10"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value) || 2)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateRecipe}
              disabled={loading || selectedProducts.length === 0}
              className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-5 w-5" />
              <span>{loading ? 'Generando...' : 'Generar Receta'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recetas generadas */}
      {generatedRecipes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recetas Generadas</h2>
            <button
              onClick={handleRegenerateRecipe}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Regenerar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generatedRecipes.map((recipe, index) => (
              <RecipeCard 
                key={index} 
                recipe={recipe} 
                onSave={() => handleSaveRecipe(recipe, index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const RecipeCard = ({ recipe, onSave }) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave();
    setSaved(true);
    // Esperar un momento antes de que desaparezca por completo
    setTimeout(() => {
      setSaving(false);
    }, 500);
  };

  // Si ya fue guardada, aplicar animación de salida
  if (saved) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 opacity-0 transition-opacity duration-500">
        <div className="p-6">
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-green-700 font-medium">¡Receta guardada!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 ${saving ? 'opacity-75 scale-95' : 'opacity-100 scale-100'}`}>
      <div className="p-6">
        {/* Header de la receta */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{recipe.nombre}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {recipe.tiempo}
              </span>
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {recipe.porciones} {recipe.porciones === 1 ? 'persona' : 'personas'}
              </span>
            </div>
          </div>
          
          <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
            {recipe.dificultad}
          </span>
        </div>

        {/* Descripción */}
        {recipe.descripcion && (
          <p className="text-sm text-gray-600 mb-4 italic">{recipe.descripcion}</p>
        )}

        {/* Ingredientes */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Ingredientes:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {(recipe.ingredientes || []).map((ingredient, index) => (
              <li key={index} className="flex items-start">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        {/* Instrucciones */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Preparación:</h4>
          <ol className="text-sm text-gray-600 space-y-2">
            {(recipe.pasos || []).map((step, index) => (
              <li key={index} className="flex">
                <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full mr-2 flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Botón guardar */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-5 w-5" />
          <span>{saving ? 'Guardando...' : 'Guardar Receta'}</span>
        </button>
      </div>
    </div>
  );
};

export default Recipes;
