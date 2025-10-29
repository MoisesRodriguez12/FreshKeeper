// Gemini AI Configuration
import { GoogleGenerativeAI } from '@google/generative-ai';

// Obtener API Key desde variables de entorno
// La API Key está en el archivo .env.local (no se sube a GitHub)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Validar que la API Key existe
if (!API_KEY || API_KEY === 'tu_api_key_de_gemini_aqui') {
  console.error('❌ GEMINI API KEY no configurada. Revisa el archivo .env.local');
}

// Inicializar Gemini AI
const genAI = new GoogleGenerativeAI(API_KEY);

// Obtener el modelo
// Para la API gratuita de AI Studio usa:
// - "gemini-1.5-flash" (más rápido, recomendado)
// - "gemini-pro" (alternativa)
export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
};

// Función para generar recetas basadas en ingredientes
export const generateRecipes = async (ingredients, numPersonas = 2, userPreferences = null) => {
  try {
    const model = getGeminiModel();
    
    // Construir el prompt considerando las preferencias del usuario
    let dietaryInfo = '';
    if (userPreferences) {
      if (userPreferences.restrictions && userPreferences.restrictions.length > 0) {
        dietaryInfo += `\nRESTRICCIONES ALIMENTARIAS: ${userPreferences.restrictions.join(', ')}`;
      }
      if (userPreferences.preferences && userPreferences.preferences.length > 0) {
        dietaryInfo += `\nPREFERENCIAS CULINARIAS: ${userPreferences.preferences.join(', ')}`;
      }
      if (userPreferences.goal) {
        const goalText = {
          'bajar_peso': 'bajar de peso (recetas bajas en calorías)',
          'mantener_peso': 'mantener peso (recetas balanceadas)',
          'ganar_peso': 'ganar peso (recetas más calóricas)',
          'ganar_musculo': 'ganar músculo (recetas altas en proteína)',
          'salud_general': 'mejorar salud general (recetas nutritivas)'
        }[userPreferences.goal] || 'comer saludable';
        dietaryInfo += `\nOBJETIVO: ${goalText}`;
      }
    }
    
    const prompt = `Eres un chef experto y nutricionista. Genera exactamente 2 recetas diferentes y creativas usando estos ingredientes: ${ingredients.join(', ')}, puedes agregar ingredientes pero intenta usar principalmente los anteriores.
    Recomienda solo recetas fáciles de menos de 15 minutos y sin procedimientos complicados.
    ${dietaryInfo}

IMPORTANTE: Las recetas deben ser para ${numPersonas} ${numPersonas === 1 ? 'persona' : 'personas'}. Ajusta las cantidades de ingredientes en consecuencia.

${userPreferences?.restrictions?.length > 0 ? `RESTRICCIONES IMPORTANTES: Asegúrate de que las recetas NO contengan: ${userPreferences.restrictions.join(', ')}` : ''}

Para cada receta proporciona:
1. Nombre de la receta (máximo 50 caracteres)
2. Tiempo de preparación estimado
3. Dificultad (Fácil)
4. Descripción breve (máximo 300 caracteres)
5. Lista de ingredientes con cantidades específicas para ${numPersonas} ${numPersonas === 1 ? 'persona' : 'personas'} Y CALORÍAS APROXIMADAS de cada ingrediente
6. Pasos detallados de preparación numerados
7. INFORMACIÓN NUTRICIONAL: Calorías totales aproximadas por porción y desglose de macronutrientes

Formato JSON exacto:
{
  "recetas": [
    {
      "nombre": "Nombre de la receta",
      "tiempo": "30 minutos",
      "dificultad": "Fácil",
      "descripcion": "Descripción breve",
      "ingredientes": [
        {
          "nombre": "ingrediente 1 con cantidad",
          "calorias": 100
        },
        {
          "nombre": "ingrediente 2 con cantidad",
          "calorias": 50
        }
      ],
      "pasos": ["Paso 1", "Paso 2", "Paso 3"],
      "porciones": ${numPersonas},
      "nutricion": {
        "calorias_totales": 300,
        "calorias_por_porcion": 150,
        "proteinas": "20g",
        "carbohidratos": "30g",
        "grasas": "10g"
      }
    }
  ]
}

Responde SOLO con el JSON, sin texto adicional.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Limpiar el texto para obtener solo el JSON
    let jsonText = text.trim();
    
    // Remover markdown code blocks si existen
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    // Parse JSON
    const data = JSON.parse(jsonText);
    
    return data.recetas || [];
  } catch (error) {
    console.error('Error generando recetas:', error);
    throw new Error('No se pudieron generar las recetas. Por favor intenta de nuevo.');
  }
};

// Función para generar plan dietético personalizado
export const generateDiet = async (preferences) => {
  try {
    const model = getGeminiModel();
    
    const { goal, restrictions, preferences: prefs, mealsPerDay, caloriesTarget, activityLevel } = preferences;
    
    const goalText = {
      'lose_weight': 'perder peso',
      'maintain': 'mantener peso',
      'gain_muscle': 'ganar músculo',
      'healthy_eating': 'comer más saludable'
    }[goal] || 'mejorar hábitos alimenticios';

    const prompt = `Eres un nutricionista experto. Crea un plan dietético personalizado de 7 días con las siguientes características:

OBJETIVO: ${goalText}
RESTRICCIONES ALIMENTARIAS: ${restrictions.join(', ') || 'Ninguna'}
PREFERENCIAS CULINARIAS: ${prefs.join(', ') || 'Variadas'}
COMIDAS POR DÍA: ${mealsPerDay}
OBJETIVO CALÓRICO: ${caloriesTarget}
NIVEL DE ACTIVIDAD: ${activityLevel}

Genera un plan que incluya:
1. Resumen general del plan (150 palabras máx)
2. Recomendaciones nutricionales específicas
3. Plan de comidas para 7 días con:
   - Desayuno, Almuerzo, Cena (y snacks si aplica)
   - Descripción de cada comida
   - Calorías aproximadas
   - Ingredientes principales

IMPORTANTE: El plan debe ser realista, variado y fácil de seguir.

Formato JSON exacto:
{
  "resumen": "Descripción del plan",
  "recomendaciones": [
    "Recomendación 1",
    "Recomendación 2",
    "Recomendación 3"
  ],
  "calorias_diarias_target": "1500-2000 kcal",
  "dias": [
    {
      "dia": 1,
      "comidas": [
        {
          "tipo": "Desayuno",
          "nombre": "Nombre del plato",
          "descripcion": "Descripción breve",
          "calorias": 400,
          "ingredientes": ["ingrediente1", "ingrediente2"]
        }
      ]
    }
  ]
}

Responde SOLO con el JSON, sin texto adicional.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Limpiar el texto para obtener solo el JSON
    let jsonText = text.trim();
    
    // Remover markdown code blocks si existen
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    // Parse JSON
    const data = JSON.parse(jsonText);
    
    return data;
  } catch (error) {
    console.error('Error generando plan dietético:', error);
    throw new Error('No se pudo generar el plan dietético. Por favor intenta de nuevo.');
  }
};

export default genAI;
