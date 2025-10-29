import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ChefHat, Clock, Users, Trash2, Calendar, AlertCircle } from 'lucide-react';
import mealService from '../services/mealService';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const MyMeals = () => {
  const { user } = useApp();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadMeals();
    }
  }, [user]);

  const loadMeals = async () => {
    setLoading(true);
    const result = await mealService.getUserMeals(user.uid);
    if (result.success) {
      setMeals(result.meals);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleDeleteMeal = async (mealId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
      return;
    }

    const result = await mealService.deleteMeal(mealId);
    if (result.success) {
      setMeals(prev => prev.filter(m => m.id !== mealId));
    } else {
      setError(result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-2">
          <ChefHat className="h-6 w-6 text-green-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Mis Comidas</h1>
        </div>
        <p className="text-gray-600">Recetas que has guardado y preparado</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Lista de comidas */}
      {meals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tienes comidas guardadas</h3>
          <p className="text-gray-600 mb-4">
            Genera recetas con IA y guárdalas para tener un historial de tus comidas
          </p>
          <a
            href="/recipes"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Ir a Recetas
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meals.map((meal) => (
            <MealCard 
              key={meal.id} 
              meal={meal} 
              onDelete={() => handleDeleteMeal(meal.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const MealCard = ({ meal, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Parsear la receta si está en JSON
  let recipeData;
  try {
    recipeData = typeof meal.recipeContent === 'string' 
      ? JSON.parse(meal.recipeContent)
      : meal.recipeContent;
  } catch (e) {
    recipeData = {
      nombre: meal.recipeName,
      ingredientes: meal.ingredients,
      pasos: meal.instructions
    };
  }

  const createdDate = new Date(meal.createdAt);
  const notificationDate = new Date(meal.notificationDate);
  const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true, locale: es });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{meal.recipeName}</h3>
            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {timeAgo}
              </span>
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {meal.servings} {meal.servings === 1 ? 'persona' : 'personas'}
              </span>
            </div>
          </div>
          
          <button
            onClick={onDelete}
            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        {/* Productos usados */}
        {meal.products && meal.products.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Productos usados:</h4>
            <div className="flex flex-wrap gap-1">
              {meal.products.map((product, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {product.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notificación */}
        {!meal.notificationSent && notificationDate > new Date() && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-800">
              Te recordaremos revisar esta comida el{' '}
              {notificationDate.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        )}

        {/* Toggle detalles */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          {expanded ? 'Ocultar detalles' : 'Ver receta completa'}
        </button>

        {/* Detalles expandidos */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            {/* Ingredientes */}
            {recipeData.ingredientes && recipeData.ingredientes.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Ingredientes:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {recipeData.ingredientes.map((ingredient, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Instrucciones */}
            {recipeData.pasos && recipeData.pasos.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Preparación:</h4>
                <ol className="text-sm text-gray-600 space-y-2">
                  {recipeData.pasos.map((step, index) => (
                    <li key={index} className="flex">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full mr-2 flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Tiempo y dificultad */}
            {recipeData.tiempo && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {recipeData.tiempo}
                </span>
                {recipeData.dificultad && (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    {recipeData.dificultad}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMeals;
