import { useState } from 'react';
import { X, ChefHat, Target, AlertCircle, Heart, Utensils, Coffee, Loader } from 'lucide-react';
import { generateDiet } from '../config/gemini';
import dietService from '../services/dietService';

const DietQuestionnaire = ({ userId, onComplete, onSkip, onNeverShowAgain }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    goal: '',
    restrictions: [],
    preferences: [],
    mealsPerDay: 3,
    caloriesTarget: 'moderate',
    activityLevel: 'moderate'
  });

  const goals = [
    { value: 'lose_weight', label: 'Perder peso', icon: Target },
    { value: 'maintain', label: 'Mantener peso', icon: Heart },
    { value: 'gain_muscle', label: 'Ganar músculo', icon: Utensils },
    { value: 'healthy_eating', label: 'Comer más saludable', icon: Coffee }
  ];

  const restrictions = [
    'Vegetariano',
    'Vegano',
    'Sin gluten',
    'Sin lactosa',
    'Sin frutos secos',
    'Diabético',
    'Bajo en sodio',
    'Ninguna restricción'
  ];

  const preferences = [
    'Comida mediterránea',
    'Comida mexicana',
    'Comida asiática',
    'Comida americana',
    'Comida rápida y fácil',
    'Recetas elaboradas'
  ];

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentario (poco o ningún ejercicio)' },
    { value: 'light', label: 'Ligeramente activo (ejercicio 1-3 días/semana)' },
    { value: 'moderate', label: 'Moderadamente activo (ejercicio 3-5 días/semana)' },
    { value: 'very_active', label: 'Muy activo (ejercicio 6-7 días/semana)' },
    { value: 'extremely_active', label: 'Extremadamente activo (ejercicio intenso diario)' }
  ];

  const caloriesTargets = [
    { value: 'low', label: '1200-1500 kcal (Pérdida rápida)' },
    { value: 'moderate', label: '1500-2000 kcal (Mantenimiento/Pérdida moderada)' },
    { value: 'high', label: '2000-2500 kcal (Mantenimiento activo)' },
    { value: 'very_high', label: '2500+ kcal (Ganancia muscular)' }
  ];

  const handleSelect = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleArray = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Generar dieta con Gemini AI
      const diet = await generateDiet(formData);
      
      // Guardar en Firestore
      const result = await dietService.saveDiet(userId, {
        preferences: formData,
        plan: diet,
        createdAt: new Date().toISOString()
      });

      if (result.success) {
        onComplete(result.diet);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'Error al generar la dieta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ChefHat className="h-8 w-8 mr-3" />
              <div>
                <h2 className="text-2xl font-bold">Crea tu Plan Dietético</h2>
                <p className="text-green-100 text-sm mt-1">
                  Personaliza tu alimentación con IA
                </p>
              </div>
            </div>
            <button
              onClick={onSkip}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-2">
              <span>Paso {step} de 4</span>
              <span>{Math.round((step / 4) * 100)}%</span>
            </div>
            <div className="h-2 bg-white bg-opacity-30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2 mb-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Objetivo */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ¿Cuál es tu objetivo principal?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {goals.map((goal) => {
                  const Icon = goal.icon;
                  return (
                    <button
                      key={goal.value}
                      onClick={() => handleSelect('goal', goal.value)}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        formData.goal === goal.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <Icon className={`h-8 w-8 mx-auto mb-2 ${
                        formData.goal === goal.value ? 'text-green-600' : 'text-gray-400'
                      }`} />
                      <span className="block font-medium">{goal.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Restricciones */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ¿Tienes alguna restricción alimentaria?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Selecciona todas las que apliquen
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {restrictions.map((restriction) => (
                  <button
                    key={restriction}
                    onClick={() => handleToggleArray('restrictions', restriction)}
                    className={`p-3 border-2 rounded-lg transition-all text-left ${
                      formData.restrictions.includes(restriction)
                        ? 'border-green-500 bg-green-50 font-medium'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    {restriction}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Preferencias */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ¿Qué tipo de comida prefieres?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Selecciona tus preferencias culinarias
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {preferences.map((preference) => (
                  <button
                    key={preference}
                    onClick={() => handleToggleArray('preferences', preference)}
                    className={`p-3 border-2 rounded-lg transition-all text-left ${
                      formData.preferences.includes(preference)
                        ? 'border-green-500 bg-green-50 font-medium'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    {preference}
                  </button>
                ))}
              </div>

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Comidas por día
                  </span>
                  <input
                    type="number"
                    min="2"
                    max="6"
                    value={formData.mealsPerDay}
                    onChange={(e) => handleSelect('mealsPerDay', parseInt(e.target.value))}
                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Step 4: Calorías y actividad */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Nivel de actividad física
                </h3>
                <div className="space-y-2">
                  {activityLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => handleSelect('activityLevel', level.value)}
                      className={`w-full p-3 border-2 rounded-lg transition-all text-left ${
                        formData.activityLevel === level.value
                          ? 'border-green-500 bg-green-50 font-medium'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Objetivo calórico diario
                </h3>
                <div className="space-y-2">
                  {caloriesTargets.map((target) => (
                    <button
                      key={target.value}
                      onClick={() => handleSelect('caloriesTarget', target.value)}
                      className={`w-full p-3 border-2 rounded-lg transition-all text-left ${
                        formData.caloriesTarget === target.value
                          ? 'border-green-500 bg-green-50 font-medium'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      {target.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex gap-2">
              <button
                onClick={onSkip}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors text-sm"
              >
                Saltar por ahora
              </button>
              <button
                onClick={onNeverShowAgain}
                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors text-sm"
              >
                No volver a mostrar
              </button>
            </div>

            <div className="flex gap-3">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  Atrás
                </button>
              )}
              
              {step < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={!formData.goal && step === 1}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    'Generar mi dieta'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DietQuestionnaire;
