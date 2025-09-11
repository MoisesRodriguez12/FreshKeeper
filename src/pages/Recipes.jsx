import { useApp } from '../context/AppContext';
import { getRecipeSuggestions, getExpiryStatus } from '../utils/helpers';
import { ChefHat, Clock, Users, Lightbulb, ArrowRight } from 'lucide-react';

const Recipes = () => {
  const { products, getExpiringProducts } = useApp();
  
  const expiringProducts = getExpiringProducts();
  const suggestedRecipes = getRecipeSuggestions(expiringProducts);
  
  const allRecipes = [
    {
      id: 1,
      name: 'Smoothie de frutas maduras',
      ingredients: ['2 manzanas maduras', '1 plátano', '200ml leche', '1 cucharada miel'],
      instructions: [
        'Pela y corta las frutas en trozos pequeños',
        'Añade todos los ingredientes en la licuadora',
        'Licúa durante 1-2 minutos hasta obtener una mezcla homogénea',
        'Sirve inmediatamente y disfruta'
      ],
      time: '5 min',
      servings: '2 personas',
      difficulty: 'Fácil',
      image: '🥤',
      tips: 'Perfecto para aprovechar frutas muy maduras que están perdiendo su firmeza'
    },
    {
      id: 2,
      name: 'Torrijas clásicas',
      ingredients: ['4 rebanadas pan del día anterior', '250ml leche', '2 huevos', 'Canela', 'Azúcar', 'Aceite'],
      instructions: [
        'Calienta la leche con canela y azúcar al gusto',
        'Remoja las rebanadas de pan en la leche tibia',
        'Bate los huevos en un plato hondo',
        'Pasa cada rebanada por huevo batido',
        'Fríe en aceite caliente hasta dorar por ambos lados',
        'Escurre sobre papel absorbente y espolvorea con azúcar y canela'
      ],
      time: '20 min',
      servings: '4 personas',
      difficulty: 'Medio',
      image: '🍞',
      tips: 'Ideal para aprovechar pan que está perdiendo frescura pero no está mohoso'
    },
    {
      id: 3,
      name: 'Batido de yogur con frutas',
      ingredients: ['200ml yogur natural', '1 manzana', '1 cucharada miel', 'Hielo', 'Canela'],
      instructions: [
        'Pela y trocea la manzana',
        'Mezcla el yogur con la miel',
        'Añade la fruta y unos cubitos de hielo',
        'Bate todo junto hasta obtener la consistencia deseada',
        'Decora con un poquito de canela'
      ],
      time: '3 min',
      servings: '1 persona',
      difficulty: 'Fácil',
      image: '🥛',
      tips: 'Excelente para yogures que están cerca de su fecha de caducidad'
    },
    {
      id: 4,
      name: 'Compota de manzana casera',
      ingredients: ['4-5 manzanas maduras', '2 cucharadas azúcar', '1 cucharadita canela', 'Zumo de limón'],
      instructions: [
        'Pela y corta las manzanas en cubos medianos',
        'Ponlas en una cacerola con un poco de agua',
        'Añade el azúcar, canela y unas gotas de limón',
        'Cocina a fuego medio durante 15-20 minutos removiendo ocasionalmente',
        'Aplasta ligeramente con un tenedor al final si deseas una textura más suave'
      ],
      time: '25 min',
      servings: '4 personas',
      difficulty: 'Fácil',
      image: '🍎',
      tips: 'Perfecta para manzanas muy maduras o ligeramente arrugadas'
    },
    {
      id: 5,
      name: 'Crema de verduras mixta',
      ingredients: ['Verduras variadas (zanahorias, calabacín, etc.)', 'Cebolla', 'Ajo', 'Caldo de verduras', 'Aceite de oliva'],
      instructions: [
        'Limpia y trocea todas las verduras',
        'Sofríe la cebolla y ajo en aceite de oliva',
        'Añade las verduras más duras primero',
        'Agrega el caldo y cocina hasta que estén tiernas',
        'Tritura con batidora hasta obtener una crema suave',
        'Ajusta sal y pimienta al gusto'
      ],
      time: '35 min',
      servings: '4 personas',
      difficulty: 'Medio',
      image: '🥣',
      tips: 'Aprovecha verduras que están perdiendo firmeza pero siguen siendo comestibles'
    },
    {
      id: 6,
      name: 'Pan tostado con tomate',
      ingredients: ['Pan del día anterior', 'Tomates maduros', 'Ajo', 'Aceite de oliva', 'Sal'],
      instructions: [
        'Tuesta las rebanadas de pan',
        'Frota un diente de ajo por la superficie tostada',
        'Ralla el tomate maduro sobre el pan',
        'Añade un chorrito de aceite de oliva',
        'Espolvorea con sal al gusto'
      ],
      time: '10 min',
      servings: '2 personas',
      difficulty: 'Fácil',
      image: '🍅',
      tips: 'Aprovecha tomates muy maduros y pan que ha perdido frescura'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-2">
          <ChefHat className="h-6 w-6 text-orange-500 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Recetas Sugeridas</h1>
        </div>
        <p className="text-gray-600">Aprovecha tus ingredientes antes de que caduquen</p>
      </div>

      {/* Productos por caducar */}
      {expiringProducts.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 p-6">
          <div className="flex items-center mb-4">
            <Lightbulb className="h-5 w-5 text-orange-600 mr-2" />
            <h2 className="text-lg font-semibold text-orange-900">Ingredientes disponibles por caducar</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {expiringProducts.map((product) => (
              <span 
                key={product.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white border border-orange-200 text-orange-800"
              >
                {product.name}
                <span className="ml-2 text-xs text-orange-600">
                  ({getExpiryStatus(product.expiryDate) === 'critical' ? 'Urgente' : 'Pronto'})
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recetas sugeridas basadas en productos */}
      {suggestedRecipes.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <ArrowRight className="h-5 w-5 text-green-600 mr-2" />
            Recetas recomendadas para tus ingredientes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {suggestedRecipes.map((recipe) => (
              <RecipeCard key={`suggested-${recipe.id}`} recipe={recipe} highlighted={true} />
            ))}
          </div>
        </div>
      )}

      {/* Todas las recetas */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Todas las recetas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </div>
    </div>
  );
};

const RecipeCard = ({ recipe, highlighted = false }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border transition-shadow hover:shadow-md ${
      highlighted ? 'border-green-300 bg-green-50' : 'border-gray-100'
    }`}>
      <div className="p-6">
        {/* Header de la receta */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <span className="text-3xl mr-3">{recipe.image}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{recipe.name}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {recipe.time}
                </span>
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {recipe.servings}
                </span>
              </div>
            </div>
          </div>
          
          {highlighted && (
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              Recomendada
            </span>
          )}
        </div>

        {/* Ingredientes */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Ingredientes:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {(recipe.ingredients || []).map((ingredient, index) => (
              <li key={index} className="flex items-start">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        {/* Instrucciones */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Preparación:</h4>
          <ol className="text-sm text-gray-600 space-y-2">
            {(recipe.instructions || []).map((step, index) => (
              <li key={index} className="flex">
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full mr-2 flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Tips */}
        {recipe.tips && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <div className="flex items-start">
              <Lightbulb className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                <span className="font-medium">Consejo:</span> {recipe.tips}
              </p>
            </div>
          </div>
        )}

        {/* Dificultad */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Dificultad:</span>
            <span className={`text-sm font-medium px-2 py-1 rounded-full ${
              recipe.difficulty === 'Fácil' ? 'bg-green-100 text-green-800' :
              recipe.difficulty === 'Medio' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {recipe.difficulty}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recipes;
