import { differenceInDays, format, isToday, isTomorrow, isPast } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date) => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: es });
};

export const formatRelativeDate = (date) => {
  const targetDate = new Date(date);
  
  if (isPast(targetDate) && !isToday(targetDate)) {
    return 'Caducado';
  }
  
  if (isToday(targetDate)) {
    return 'Hoy';
  }
  
  if (isTomorrow(targetDate)) {
    return 'Mañana';
  }
  
  const days = differenceInDays(targetDate, new Date());
  
  if (days > 0) {
    return `En ${days} días`;
  }
  
  return formatDate(date);
};

export const getExpiryStatus = (date) => {
  const targetDate = new Date(date);
  const today = new Date();
  const days = differenceInDays(targetDate, today);
  
  if (days < 0) {
    return 'expired';
  } else if (days <= 1) {
    return 'critical';
  } else if (days <= 3) {
    return 'warning';
  } else {
    return 'fresh';
  }
};

export const getStatusColor = (status) => {
  switch (status) {
    case 'expired':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'fresh':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getFreshnesOptions = () => [
  { value: 'fresh', label: 'Fresco/Nuevo', color: 'green' },
  { value: 'ripe', label: 'Maduro', color: 'yellow' },
  { value: 'overripe', label: 'Muy maduro', color: 'orange' },
  { value: 'spoiled', label: 'En mal estado', color: 'red' }
];

export const getRecipeSuggestions = (products) => {
  const recipes = [
    {
      id: 1,
      name: 'Smoothie de frutas',
      ingredients: ['manzana', 'plátano', 'leche'],
      description: 'Un delicioso smoothie para aprovechar frutas maduras',
      time: '5 min'
    },
    {
      id: 2,
      name: 'Torrijas',
      ingredients: ['pan', 'leche', 'huevo'],
      description: 'Perfectas para aprovechar pan que está por caducar',
      time: '20 min'
    },
    {
      id: 3,
      name: 'Batido de yogur',
      ingredients: ['yogur', 'fruta'],
      description: 'Aprovecha yogures que están por vencer',
      time: '3 min'
    },
    {
      id: 4,
      name: 'Compota de manzana',
      ingredients: ['manzana'],
      description: 'Ideal para manzanas muy maduras',
      time: '15 min'
    }
  ];

  // Filtrar recetas basadas en productos disponibles
  const productNames = products.map(p => p.name.toLowerCase());
  
  return recipes.filter(recipe => 
    recipe.ingredients.some(ingredient => 
      productNames.some(name => name.includes(ingredient))
    )
  );
};

export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = () => {
  return /Android/i.test(navigator.userAgent);
};

export const getDisposalTips = (category) => {
  const tips = {
    'Lácteos': {
      disposal: 'Los lácteos caducados deben desecharse en el contenedor orgánico. No son aptos para compost doméstico.',
      compost: false
    },
    'Frutas': {
      disposal: 'Las frutas se pueden compostar o desechar en contenedor orgánico.',
      compost: true,
      compostTip: 'Corta en trozos pequeños para acelerar la descomposición.'
    },
    'Verduras': {
      disposal: 'Las verduras son excelentes para compost.',
      compost: true,
      compostTip: 'Mezcla con material seco como hojas o papel.'
    },
    'Panadería': {
      disposal: 'El pan viejo se puede compostar o usar como alimento para animales (si no tiene moho).',
      compost: true,
      compostTip: 'Desmenúzalo antes de añadirlo al compost.'
    },
    'Carnes': {
      disposal: 'Las carnes deben desecharse en el contenedor orgánico. NO añadir al compost doméstico.',
      compost: false
    }
  };

  return tips[category] || {
    disposal: 'Consulta las normas locales de reciclaje para este producto.',
    compost: false
  };
};


