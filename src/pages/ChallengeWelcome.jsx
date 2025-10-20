import { useState, useEffect } from 'react';
import { Plus, X, ChefHat, Sparkles, RefreshCw, Upload, CheckCircle, Image as ImageIcon, Video, Eye, Heart } from 'lucide-react';
import { generateRecipes } from '../config/gemini';
import { storage, db } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';

const ChallengeWelcome = ({ onComplete }) => {
  const [step, setStep] = useState(1); // 1: Welcome, 2: Add ingredients, 3: Recipes, 4: Upload, 5: Gallery
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [filePreview, setFilePreview] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [userName, setUserName] = useState('');
  const [userComment, setUserComment] = useState('');

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient('');
    }
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleGenerateRecipes = async () => {
    if (ingredients.length < 2) {
      alert('Agrega al menos 2 ingredientes para generar recetas');
      return;
    }

    setLoading(true);
    try {
      const generatedRecipes = await generateRecipes(ingredients);
      setRecipes(generatedRecipes);
      setStep(3);
    } catch (error) {
      alert(error.message || 'Error al generar recetas. Verifica tu API Key de Gemini.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateRecipes = async () => {
    setLoading(true);
    setSelectedRecipe(null);
    try {
      const generatedRecipes = await generateRecipes(ingredients);
      setRecipes(generatedRecipes);
    } catch (error) {
      alert(error.message || 'Error al regenerar recetas');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea imagen o video
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      
      if (!isImage && !isVideo) {
        alert('Por favor selecciona una imagen o video');
        return;
      }

      // Validar tamaño (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo es muy grande. Máximo 10MB');
        return;
      }

      setUploadedFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadFile = async () => {
    if (!uploadedFile) {
      alert('Por favor selecciona una foto o video');
      return;
    }

    // Nombre ahora es opcional
    setLoading(true);
    setUploadProgress(0);

    try {
      // Crear referencia en Firebase Storage
      const timestamp = Date.now();
      const fileName = `challenge/${timestamp}_${uploadedFile.name}`;
      const storageRef = ref(storage, fileName);

      // Subir archivo
      const snapshot = await uploadBytes(storageRef, uploadedFile);
      
      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('Archivo subido exitosamente:', downloadURL);
      
      setUploadProgress(100);
      
      // Guardar en Firestore en colección "Comentarios"
      const commentData = {
        userName: userName.trim() || 'Anónimo',
        userComment: userComment.trim() || '',
        recipeName: recipes[selectedRecipe]?.nombre || 'Receta sin nombre',
        ingredients: ingredients,
        fileUrl: downloadURL,
        fileType: uploadedFile.type.startsWith('image/') ? 'image' : 'video',
        createdAt: new Date().toISOString(),
        timestamp: timestamp
      };

      await addDoc(collection(db, 'Comentarios'), commentData);
      console.log('Comentario guardado en Firestore');
      
      // Ir a la galería
      setTimeout(() => {
        setStep(5);
      }, 1000);
      
    } catch (error) {
      console.error('Error subiendo archivo:', error);
      alert('Error al subir el archivo. Por favor verifica las reglas de Firestore en Firebase Console.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Welcome
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-3 sm:p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-8 md:p-12 text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <ChefHat className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                ¡Bienvenido al Challenge! 🎉
              </h1>
              <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-xs sm:text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4 mr-2" />
                Challenge de Cocina Creativa
              </div>
            </div>

            <div className="text-left space-y-4 sm:space-y-6 mb-8">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                  ¿De qué trata el challenge?
                </h2>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">
                  Aprovecha los alimentos que están por caducar y crea algo delicioso. 
                  Este es tu momento para ser creativo, reducir el desperdicio y descubrir 
                  nuevas recetas.
                </p>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full text-xs sm:text-sm mr-2">1</span>
                  Agrega tus ingredientes
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 ml-8">
                  Ingresa los alimentos que tienes disponibles (mínimo 2)
                </p>

                <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full text-xs sm:text-sm mr-2">2</span>
                  Descubre recetas con IA
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 ml-8">
                  Nuestra IA te sugerirá 2 recetas creativas basadas en tus ingredientes
                </p>

                <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full text-xs sm:text-sm mr-2">3</span>
                  Cocina y comparte
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 ml-8">
                  Prepara la receta y sube una foto o video de tu creación
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              ¡Comenzar Challenge! 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Add Ingredients
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-3 sm:p-4 py-6 sm:py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Agrega tus Ingredientes
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Ingresa los alimentos que tienes disponibles (mínimo 2)
              </p>
            </div>

            {/* Input para agregar ingredientes */}
            <div className="flex gap-2 mb-4 sm:mb-6">
              <input
                type="text"
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                placeholder="Ej: Manzanas, Huevos..."
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
              />
              <button
                onClick={addIngredient}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 active:scale-95 transition-all font-medium flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">Agregar</span>
                <span className="sm:hidden">+</span>
              </button>
            </div>

            {/* Lista de ingredientes */}
            {ingredients.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">
                  Ingredientes agregados ({ingredients.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 text-green-800 rounded-full text-sm sm:text-base"
                    >
                      <span>{ingredient}</span>
                      <button
                        onClick={() => removeIngredient(index)}
                        className="hover:bg-green-200 rounded-full p-0.5 transition-colors active:scale-90"
                      >
                        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:scale-95 transition-all font-medium text-sm sm:text-base"
              >
                Volver
              </button>
              <button
                onClick={handleGenerateRecipes}
                disabled={ingredients.length < 2 || loading}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 active:scale-95 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Generando recetas con IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generar Recetas con IA
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Show Recipes
  if (step === 3) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-3 sm:p-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              ¡Tus Recetas Están Listas! 🎉
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Selecciona una receta o regenera para ver más opciones
            </p>
            <button
              onClick={handleRegenerateRecipes}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 active:scale-95 transition-all font-medium disabled:opacity-50 text-sm sm:text-base"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Regenerando...' : 'Regenerar Recetas'}
            </button>
          </div>

          {/* Grid de recetas */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {recipes.map((recipe, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all cursor-pointer active:scale-[0.98] ${
                  selectedRecipe === index
                    ? 'ring-2 sm:ring-4 ring-green-500 shadow-2xl'
                    : 'hover:shadow-xl'
                }`}
                onClick={() => setSelectedRecipe(selectedRecipe === index ? null : index)}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                        {recipe.nombre}
                      </h3>
                      <p className="text-gray-600 text-xs sm:text-sm mb-3">
                        {recipe.descripcion}
                      </p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-800 rounded-full text-[10px] sm:text-xs font-medium">
                          ⏱️ {recipe.tiempo}
                        </span>
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                          recipe.dificultad === 'Fácil' 
                            ? 'bg-green-100 text-green-800'
                            : recipe.dificultad === 'Media'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          📊 {recipe.dificultad}
                        </span>
                      </div>
                    </div>
                    {selectedRecipe === index && (
                      <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
                    )}
                  </div>

                  {selectedRecipe === index && (
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 space-y-3 sm:space-y-4">
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
                          🥘 Ingredientes:
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-gray-700">
                          {recipe.ingredientes.map((ing, i) => (
                            <li key={i}>{ing}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
                          👨‍🍳 Preparación:
                        </h4>
                        <ol className="space-y-2">
                          {recipe.pasos.map((paso, i) => (
                            <li key={i} className="text-xs sm:text-sm text-gray-700">
                              <span className="font-medium text-green-600">
                                Paso {i + 1}:
                              </span>{' '}
                              {paso}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Botón para continuar */}
          {selectedRecipe !== null && (
            <div className="text-center">
              <button
                onClick={() => setStep(4)}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold text-lg hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
              >
                Continuar al Siguiente Paso →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 4: Upload Photo/Video
  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-3 sm:p-4 py-6 sm:py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-3 sm:mb-4">
                <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                ¡Muestra tu Creación! 📸
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Sube una foto o video de tu plato terminado
              </p>
            </div>

            {/* Área de upload */}
            <div className="mb-4 sm:mb-6">
              {!filePreview ? (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 sm:p-12 text-center hover:border-green-500 hover:bg-green-50 active:scale-[0.99] transition-all">
                    <div className="flex justify-center mb-3 sm:mb-4">
                      <ImageIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                      <Video className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 ml-3 sm:ml-4" />
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 font-medium mb-1 sm:mb-2">
                      Haz clic para seleccionar
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Foto o Video (máx. 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative">
                  {uploadedFile.type.startsWith('image/') ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-full h-48 sm:h-64 object-cover rounded-xl"
                    />
                  ) : (
                    <video
                      src={filePreview}
                      controls
                      className="w-full h-48 sm:h-64 rounded-xl bg-black"
                    />
                  )}
                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      setFilePreview(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 sm:p-2 bg-red-500 text-white rounded-full hover:bg-red-600 active:scale-90 transition-all shadow-lg"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Campo de nombre */}
            <div className="mb-3 sm:mb-4">
              <label htmlFor="userName" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Tu nombre <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              <input
                type="text"
                id="userName"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ej: María García"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                maxLength={50}
              />
            </div>

            {/* Campo de comentarios */}
            <div className="mb-4 sm:mb-6">
              <label htmlFor="userComment" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Comentario <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              <textarea
                id="userComment"
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Cuenta cómo te quedó la receta..."
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-sm sm:text-base"
                maxLength={500}
              />
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                {userComment.length}/500 caracteres
              </p>
            </div>

            {/* Progress bar */}
            {loading && uploadProgress > 0 && (
              <div className="mb-4 sm:mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-center text-xs sm:text-sm text-gray-600 mt-2">
                  Subiendo... {uploadProgress}%
                </p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setStep(3)}
                disabled={loading}
                className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:scale-95 transition-all font-medium disabled:opacity-50 text-sm sm:text-base"
              >
                Volver
              </button>
              <button
                onClick={handleUploadFile}
                disabled={!uploadedFile || loading}
                className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 active:scale-95 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    Subir y Ver Galería
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Gallery
  if (step === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-3 sm:p-4 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full mb-3 sm:mb-4">
              <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              ¡Galería de Creaciones! 🎨
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Mira lo que otros han cocinado en el challenge
            </p>
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const q = query(
                    collection(db, 'Comentarios'),
                    orderBy('timestamp', 'desc'),
                    limit(20)
                  );
                  const querySnapshot = await getDocs(q);
                  const items = [];
                  querySnapshot.forEach((doc) => {
                    items.push({ id: doc.id, ...doc.data() });
                  });
                  setGalleryItems(items);
                } catch (error) {
                  console.error('Error cargando galería:', error);
                  alert('Error al cargar la galería. Verifica que Firestore esté habilitado y las reglas de seguridad permitan lectura.');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 active:scale-95 transition-all font-medium disabled:opacity-50 text-sm sm:text-base"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Cargando...' : galleryItems.length === 0 ? 'Cargar Creaciones' : 'Actualizar'}
            </button>
          </div>

          {/* Grid de galería */}
          {galleryItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl active:scale-[0.98] transition-all"
                >
                  {/* Imagen o video */}
                  <div className="relative h-48 sm:h-56 md:h-64 bg-gray-100">
                    {item.fileType === 'image' ? (
                      <img
                        src={item.fileUrl}
                        alt={item.recipeName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={item.fileUrl}
                        controls
                        className="w-full h-full object-cover bg-black"
                      />
                    )}
                  </div>

                  {/* Información */}
                  <div className="p-3 sm:p-4">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-2">
                      {item.recipeName}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                      Por: <span className="font-medium text-green-600">{item.userName || 'Anónimo'}</span>
                    </p>
                    
                    {/* Comentario del usuario */}
                    {item.userComment && (
                      <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs sm:text-sm text-gray-700 italic line-clamp-3">
                          "{item.userComment}"
                        </p>
                      </div>
                    )}
                    
                    {/* Ingredientes */}
                    <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                      {item.ingredients?.slice(0, 3).map((ing, i) => (
                        <span
                          key={i}
                          className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-50 text-green-700 rounded-full text-[10px] sm:text-xs"
                        >
                          {ing}
                        </span>
                      ))}
                      {item.ingredients?.length > 3 && (
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] sm:text-xs">
                          +{item.ingredients.length - 3} más
                        </span>
                      )}
                    </div>

                    {/* Fecha */}
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !loading && (
              <div className="text-center py-8 sm:py-12 px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full mb-3 sm:mb-4">
                  <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
                  Aún no hay creaciones en la galería
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Haz clic en "Cargar Creaciones" para ver las recetas de otros usuarios
                </p>
              </div>
            )
          )}

          {/* Botón para completar */}
          <div className="text-center px-4">
            <button
              onClick={() => {
                onComplete({
                  ingredients,
                  selectedRecipe: recipes[selectedRecipe],
                  userName
                });
              }}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold text-base sm:text-lg hover:from-green-600 hover:to-green-700 active:scale-95 transition-all shadow-lg hover:shadow-xl"
            >
              Completar Challenge y Explorar App 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ChallengeWelcome;
