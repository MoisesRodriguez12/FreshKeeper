import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { User, Camera, X, Save, AlertCircle, CheckCircle, Edit2, Trash2 } from 'lucide-react';
import userService from '../services/userService';
import dietService from '../services/dietService';

const Profile = () => {
  const { user } = useApp();
  
  const [profile, setProfile] = useState(null);
  const [dietPreferences, setDietPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Estados del formulario
  const [displayName, setDisplayName] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  
  // Estados de preferencias de dieta
  const [goal, setGoal] = useState('');
  const [restrictions, setRestrictions] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [activityLevel, setActivityLevel] = useState('moderado');

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    setLoading(true);
    
    // Cargar perfil
    const profileResult = await userService.getUserProfile(user.uid);
    if (profileResult.success) {
      setProfile(profileResult.profile);
      setDisplayName(profileResult.profile.displayName || user.name || '');
      setPhotoPreview(profileResult.profile.photoURL || '');
    }

    // Cargar preferencias de dieta
    const dietResult = await dietService.getUserDiet(user.uid);
    if (dietResult.success && dietResult.diet) {
      const prefs = dietResult.diet.preferences || {};
      setDietPreferences(prefs);
      setGoal(prefs.goal || '');
      setRestrictions(prefs.restrictions || []);
      setPreferences(prefs.preferences || []);
      setMealsPerDay(prefs.mealsPerDay || 3);
      setActivityLevel(prefs.activityLevel || 'moderado');
    }

    setLoading(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar los 5MB');
        return;
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        return;
      }

      setPhotoFile(file);

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar tu foto de perfil?')) {
      return;
    }

    setSaving(true);
    setError('');

    const result = await userService.removeProfilePhoto(user.uid, profile?.photoPath);

    if (result.success) {
      setSuccess('Foto de perfil eliminada correctamente');
      setPhotoPreview('');
      setPhotoFile(null);
      
      // Recargar perfil
      const profileResult = await userService.getUserProfile(user.uid);
      if (profileResult.success) {
        setProfile(profileResult.profile);
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } else {
      setError(result.error);
    }

    setSaving(false);
  };

  const handleToggleRestriction = (restriction) => {
    setRestrictions(prev => {
      if (prev.includes(restriction)) {
        return prev.filter(r => r !== restriction);
      } else {
        return [...prev, restriction];
      }
    });
  };

  const handleTogglePreference = (preference) => {
    setPreferences(prev => {
      if (prev.includes(preference)) {
        return prev.filter(p => p !== preference);
      } else {
        return [...prev, preference];
      }
    });
  };

  const handleSaveProfile = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // 1. Actualizar nombre si cambió
      if (displayName !== profile?.displayName) {
        const nameResult = await userService.updateDisplayName(user.uid, displayName);
        if (!nameResult.success) {
          throw new Error(nameResult.error);
        }
      }

      // 2. Actualizar foto si hay una nueva
      if (photoFile) {
        const photoResult = await userService.updateProfilePhoto(
          user.uid,
          photoFile,
          profile?.photoPath
        );
        if (!photoResult.success) {
          throw new Error(photoResult.error);
        }
      }

      // 3. Actualizar preferencias de dieta si cambiaron
      const newPreferences = {
        goal,
        restrictions,
        preferences,
        mealsPerDay,
        activityLevel
      };

      // Verificar si las preferencias cambiaron
      const prefsChanged = JSON.stringify(newPreferences) !== JSON.stringify(dietPreferences || {});
      
      if (prefsChanged) {
        // Si hay preferencias de dieta, actualizar en Diets
        const dietResult = await dietService.getUserDiet(user.uid);
        if (dietResult.success && dietResult.diet) {
          // Actualizar solo las preferencias, mantener el plan
          const updatedDiet = {
            ...dietResult.diet,
            preferences: newPreferences,
            updatedAt: new Date().toISOString()
          };
          
          await dietService.saveDiet(user.uid, updatedDiet);
        }
        
        // También guardar en Users para referencia
        await userService.updateDietPreferences(user.uid, newPreferences);
      }

      setSuccess('Perfil actualizado correctamente');
      
      // Recargar datos
      await loadUserData();
      
      // Limpiar archivo temporal
      setPhotoFile(null);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setSaving(false);
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
          <User className="h-6 w-6 text-green-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
        </div>
        <p className="text-gray-600">Administra tu información personal y preferencias</p>
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

      {/* Información Personal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Información Personal</h2>

        {/* Foto de perfil */}
        <div className="flex items-start space-x-6 mb-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Perfil" className="h-full w-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-gray-400" />
              )}
            </div>
            
            {photoPreview && (
              <button
                onClick={handleRemovePhoto}
                disabled={saving}
                className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                title="Eliminar foto"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Foto de perfil
            </label>
            <div className="flex items-center space-x-3">
              <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                <Camera className="h-4 w-4" />
                <span className="text-sm">Cambiar foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              JPG, PNG o GIF. Máximo 5MB.
            </p>
          </div>
        </div>

        {/* Nombre */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre completo
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Ingresa tu nombre"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Email (solo lectura) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correo electrónico
          </label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            El correo electrónico no se puede modificar
          </p>
        </div>
      </div>

      {/* Preferencias de Dieta */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferencias de Dieta</h2>

        {/* Objetivo */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Objetivo principal
          </label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Selecciona un objetivo</option>
            <option value="bajar_peso">Bajar de peso</option>
            <option value="mantener_peso">Mantener peso</option>
            <option value="ganar_peso">Ganar peso</option>
            <option value="ganar_musculo">Ganar músculo</option>
            <option value="salud_general">Salud general</option>
          </select>
        </div>

        {/* Restricciones dietéticas */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Restricciones alimentarias
          </label>
          <div className="flex flex-wrap gap-2">
            {['Vegetariano', 'Vegano', 'Sin gluten', 'Sin lácteos', 'Sin azúcar', 'Bajo en carbohidratos', 'Keto'].map((restriction) => (
              <button
                key={restriction}
                onClick={() => handleToggleRestriction(restriction)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  restrictions.includes(restriction)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {restriction}
              </button>
            ))}
          </div>
        </div>

        {/* Preferencias */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preferencias de comida
          </label>
          <div className="flex flex-wrap gap-2">
            {['Pollo', 'Pescado', 'Carne roja', 'Pasta', 'Arroz', 'Ensaladas', 'Sopas', 'Smoothies'].map((preference) => (
              <button
                key={preference}
                onClick={() => handleTogglePreference(preference)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  preferences.includes(preference)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {preference}
              </button>
            ))}
          </div>
        </div>

        {/* Comidas por día */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comidas por día: {mealsPerDay}
          </label>
          <input
            type="range"
            min="2"
            max="6"
            value={mealsPerDay}
            onChange={(e) => setMealsPerDay(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>2 comidas</span>
            <span>6 comidas</span>
          </div>
        </div>

        {/* Nivel de actividad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nivel de actividad física
          </label>
          <select
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="sedentario">Sedentario (poco o ningún ejercicio)</option>
            <option value="ligero">Ligero (ejercicio 1-3 días/semana)</option>
            <option value="moderado">Moderado (ejercicio 3-5 días/semana)</option>
            <option value="activo">Activo (ejercicio 6-7 días/semana)</option>
            <option value="muy_activo">Muy activo (ejercicio intenso diario)</option>
          </select>
        </div>
      </div>

      {/* Botón guardar */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-8 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="h-5 w-5" />
          <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
