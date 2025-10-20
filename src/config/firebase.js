// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

// Obtener configuración desde variables de entorno
// Las credenciales están en el archivo .env.local (no se sube a GitHub)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validar configuración
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'tu_firebase_api_key_aqui') {
  console.error('❌ FIREBASE no configurado. Revisa el archivo .env.local');
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Storage
export const storage = getStorage(app);

// Inicializar Firestore
export const db = getFirestore(app);

export default app;
