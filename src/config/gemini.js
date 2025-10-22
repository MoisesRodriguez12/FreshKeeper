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
export const generateRecipes = async (ingredients, numPersonas = 2) => {
  try {
    const model = getGeminiModel();
    
    const prompt = `Eres un chef experto. Genera exactamente 2 recetas diferentes y creativas usando estos ingredientes: ${ingredients.join(', ')}, puedes agregar ingedientes pero intenta solo usar los anteriores.
    Recomienda solo recetas faciles de menos de 15 minutos y sin procedimientos complicados.
    
IMPORTANTE: Las recetas deben ser para ${numPersonas} ${numPersonas === 1 ? 'persona' : 'personas'}. Ajusta las cantidades de ingredientes en consecuencia.

Para cada receta proporciona:
1. Nombre de la receta (máximo 50 caracteres)
2. Tiempo de preparación estimado
3. Dificultad (Fácil)
4. Descripción breve (máximo 300 caracteres)
5. Lista de ingredientes con cantidades específicas para ${numPersonas} ${numPersonas === 1 ? 'persona' : 'personas'}
6. Pasos detallados de preparación numerados

Formato JSON exacto:
{
  "recetas": [
    {
      "nombre": "Nombre de la receta",
      "tiempo": "30 minutos",
      "dificultad": "Fácil",
      "descripcion": "Descripción breve",
      "ingredientes": ["ingrediente 1", "ingrediente 2"],
      "pasos": ["Paso 1", "Paso 2", "Paso 3"],
      "porciones": ${numPersonas}
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

export default genAI;
