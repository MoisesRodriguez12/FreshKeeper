// Validación de contenido inapropiado y ingredientes válidos

// Lista de palabras prohibidas (contenido inapropiado)
const PALABRAS_PROHIBIDAS = [
  // Palabras ofensivas (agrega más según necesites)
  'idiota', 'estúpido', 'pendejo', 'cabrón', 'mierda', 'puto', 'puta',
  'imbécil', 'tonto', 'basura', 'maldito', 'carajo', 'verga', 'pene',
  'vagina', 'sexo', 'xxx', 'porno', 'drogas', 'cocaína', 'marihuana',
  'hitler', 'nazi', 'racista', 'terrorista', 'bomba', 'arma', 'matar',
  'violencia', 'odio', 'racismo', 'discriminación'
];

// Categorías de ingredientes válidos
const INGREDIENTES_COMUNES = {
  // Vegetales
  vegetales: [
    'tomate', 'cebolla', 'ajo', 'zanahoria', 'papa', 'patata', 'lechuga',
    'espinaca', 'brócoli', 'coliflor', 'pimiento', 'chile', 'pepino',
    'calabaza', 'calabacín', 'berenjena', 'apio', 'rábano', 'nabo',
    'col', 'repollo', 'remolacha', 'betabel', 'champiñón', 'hongo',
    'seta', 'elote', 'maíz', 'choclo', 'ejote', 'judía', 'vainita',
    'arveja', 'guisante', 'chícharo', 'alcachofa', 'espárrago', 'puerro'
  ],
  
  // Frutas
  frutas: [
    'manzana', 'pera', 'plátano', 'banana', 'naranja', 'mandarina',
    'limón', 'lima', 'toronja', 'pomelo', 'uva', 'fresa', 'frutilla',
    'frambuesa', 'mora', 'arándano', 'cereza', 'ciruela', 'durazno',
    'melocotón', 'mango', 'papaya', 'piña', 'ananá', 'sandía', 'melón',
    'kiwi', 'coco', 'aguacate', 'palta', 'higo', 'dátil', 'granada',
    'maracuyá', 'guayaba', 'guanábana', 'lichi', 'caqui', 'membrillo'
  ],
  
  // Proteínas
  proteinas: [
    'pollo', 'pechuga', 'muslo', 'res', 'carne', 'bistec', 'cerdo',
    'jamón', 'tocino', 'bacon', 'salchicha', 'chorizo', 'pescado',
    'salmón', 'atún', 'trucha', 'bacalao', 'merluza', 'camarón',
    'gamba', 'langostino', 'pulpo', 'calamar', 'mejillón', 'almeja',
    'huevo', 'clara', 'yema', 'tofu', 'tempeh', 'seitán', 'lentejas',
    'garbanzos', 'frijoles', 'alubias', 'judías', 'habas', 'soja',
    'edamame', 'quinoa', 'quinua'
  ],
  
  // Lácteos
  lacteos: [
    'leche', 'queso', 'yogur', 'yogurt', 'crema', 'nata', 'mantequilla',
    'manteca', 'ricotta', 'mozzarella', 'parmesano', 'cheddar', 'gouda',
    'brie', 'camembert', 'feta', 'panela', 'requesón', 'cottage',
    'mascarpone', 'cream cheese', 'philadelphia', 'suero', 'kéfir'
  ],
  
  // Granos y cereales
  granos: [
    'arroz', 'pasta', 'fideos', 'tallarines', 'espagueti', 'macarrones',
    'pan', 'harina', 'avena', 'cereal', 'granola', 'trigo', 'centeno',
    'cebada', 'maíz', 'polenta', 'cuscús', 'bulgur', 'amaranto',
    'tortilla', 'tostada', 'galleta', 'cracker', 'panko', 'pan rallado'
  ],
  
  // Condimentos y especias
  condimentos: [
    'sal', 'pimienta', 'azúcar', 'miel', 'aceite', 'oliva', 'vinagre',
    'mostaza', 'mayonesa', 'ketchup', 'catsup', 'salsa', 'soya', 'soja',
    'orégano', 'albahaca', 'tomillo', 'romero', 'laurel', 'perejil',
    'cilantro', 'menta', 'hierbabuena', 'jengibre', 'curry', 'comino',
    'canela', 'nuez moscada', 'clavo', 'cardamomo', 'cúrcuma', 'azafrán',
    'pimentón', 'paprika', 'chile en polvo', 'ají', 'wasabi', 'tahini',
    'ajonjolí', 'sésamo', 'vainilla', 'cacao', 'chocolate'
  ],
  
  // Frutos secos y semillas
  frutos_secos: [
    'nuez', 'almendra', 'avellana', 'pistacho', 'anacardo', 'castaña',
    'cacahuate', 'maní', 'pecana', 'macadamia', 'piñón', 'semilla',
    'girasol', 'calabaza', 'chía', 'linaza', 'ajonjolí', 'sésamo'
  ],
  
  // Otros
  otros: [
    'agua', 'caldo', 'consomé', 'vino', 'cerveza', 'té', 'café',
    'gelatina', 'agar', 'levadura', 'polvo de hornear', 'bicarbonato',
    'maicena', 'fécula', 'tapioca', 'coco rallado', 'leche de coco',
    'crema de cacahuate', 'mantequilla de maní', 'mermelada', 'jalea',
    'conserva', 'encurtido', 'pepinillo', 'aceituna', 'oliva', 'alcaparra'
  ]
};

// Crear una lista plana de todos los ingredientes válidos
const todosLosIngredientes = Object.values(INGREDIENTES_COMUNES).flat();

/**
 * Normaliza el texto para comparación
 */
function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .trim();
}

/**
 * Verifica si el texto contiene palabras prohibidas
 */
export function tieneContenidoInapropiado(texto) {
  const textoNormalizado = normalizarTexto(texto);
  
  return PALABRAS_PROHIBIDAS.some(palabra => {
    const palabraNormalizada = normalizarTexto(palabra);
    return textoNormalizado.includes(palabraNormalizada);
  });
}

/**
 * Verifica si el ingrediente es válido (existe en la lista o es similar)
 * NOTA: Esta función ya no se usa para validar, solo para sugerencias
 */
export function esIngredienteValido(ingrediente) {
  const ingredienteNormalizado = normalizarTexto(ingrediente);
  
  // Verificar coincidencia exacta
  const coincidenciaExacta = todosLosIngredientes.some(ing => 
    normalizarTexto(ing) === ingredienteNormalizado
  );
  
  if (coincidenciaExacta) return true;
  
  // Verificar si el ingrediente contiene o está contenido en algún ingrediente válido
  const coincidenciaRelativa = todosLosIngredientes.some(ing => {
    const ingNormalizado = normalizarTexto(ing);
    return ingredienteNormalizado.includes(ingNormalizado) || 
           ingNormalizado.includes(ingredienteNormalizado);
  });
  
  if (coincidenciaRelativa) return true;
  
  // Verificar si es una combinación válida (ej: "aceite de oliva", "queso cheddar")
  const palabras = ingredienteNormalizado.split(' ');
  if (palabras.length > 1) {
    // Si al menos una palabra es un ingrediente válido, aceptar
    return palabras.some(palabra => 
      todosLosIngredientes.some(ing => 
        normalizarTexto(ing) === palabra
      )
    );
  }
  
  // Si el ingrediente tiene más de 3 caracteres y no está en la lista, rechazar
  if (ingredienteNormalizado.length < 3) {
    return false;
  }
  
  // Última verificación: calcular similitud aproximada
  // Aceptar si la longitud es razonable (3-30 caracteres)
  return ingredienteNormalizado.length >= 3 && ingredienteNormalizado.length <= 30;
}

/**
 * Valida el ingrediente completo (solo contenido inapropiado + formato)
 */
export function validarIngrediente(ingrediente) {
  const ingredienteLimpio = ingrediente.trim();
  
  // 1. Verificar longitud
  if (ingredienteLimpio.length < 2) {
    return {
      valido: false,
      error: 'El ingrediente debe tener al menos 2 caracteres'
    };
  }
  
  if (ingredienteLimpio.length > 50) {
    return {
      valido: false,
      error: 'El ingrediente es demasiado largo (máximo 50 caracteres)'
    };
  }
  
  // 2. Verificar que solo contenga letras, números, espacios y algunos caracteres especiales
  const caracteresValidos = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s\-]+$/;
  if (!caracteresValidos.test(ingredienteLimpio)) {
    return {
      valido: false,
      error: 'El ingrediente contiene caracteres no permitidos'
    };
  }
  
  // 3. Verificar contenido inapropiado (ESTA ES LA ÚNICA VALIDACIÓN DE CONTENIDO)
  if (tieneContenidoInapropiado(ingredienteLimpio)) {
    return {
      valido: false,
      error: 'Por favor, ingresa solo ingredientes de cocina apropiados'
    };
  }
  
  // 4. REMOVIDO: Ya NO verificamos si es un ingrediente real
  // Ahora se acepta cualquier ingrediente que pase las validaciones anteriores
  
  return {
    valido: true,
    ingrediente: ingredienteLimpio
  };
}

/**
 * Valida el comentario del usuario
 */
export function validarComentario(comentario) {
  const comentarioLimpio = comentario.trim();
  
  if (comentarioLimpio.length === 0) {
    return { valido: true }; // Comentario vacío es válido (opcional)
  }
  
  if (tieneContenidoInapropiado(comentarioLimpio)) {
    return {
      valido: false,
      error: 'El comentario contiene contenido inapropiado. Por favor sé respetuoso.'
    };
  }
  
  return { valido: true };
}

/**
 * Obtiene sugerencias de ingredientes similares
 */
export function obtenerSugerencias(textoParcial) {
  if (textoParcial.length < 2) return [];
  
  const textoNormalizado = normalizarTexto(textoParcial);
  
  return todosLosIngredientes
    .filter(ing => normalizarTexto(ing).includes(textoNormalizado))
    .slice(0, 5); // Máximo 5 sugerencias
}
