# 🚀 Inicio Rápido - Challenge FreshKeeper

## ⚡ Configuración en 3 Pasos

### 1️⃣ Configurar Gemini AI (2 minutos)

1. Ve a: https://aistudio.google.com/app/apikey
2. Crea una API Key (es gratis, no necesitas el JSON de Google Cloud)
3. Copia el archivo `.env.example` a `.env.local`
4. Pega tu API Key en `VITE_GEMINI_API_KEY`

### 2️⃣ Configurar Firebase (5 minutos)

1. Ve a: https://console.firebase.google.com
2. Crea un proyecto nuevo
3. Agrega una app Web y copia la configuración
4. Habilita Storage en la consola
5. Pega los valores en `.env.local` (líneas de VITE_FIREBASE_*)

### 3️⃣ Ejecutar

```bash
npm install
npm run dev
```

---

## 📝 Archivo .env.local

Crea el archivo `.env.local` en la raíz del proyecto con este contenido:

```bash
# Gemini AI (solo necesitas esto, NO el JSON de Google Cloud)
VITE_GEMINI_API_KEY=tu_api_key_aqui

# Firebase
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## ❓ Preguntas Frecuentes

**¿Necesito el archivo JSON de Google Cloud?**
- ❌ NO, ese archivo es para servicios con facturación
- ✅ Solo necesitas la API Key de AI Studio (gratis)

**¿Dónde están mis credenciales?**
- En el archivo `.env.local` (NO se sube a GitHub)
- Este archivo está protegido en `.gitignore`

---

## 📖 Documentación Completa

Ver archivo: **CONFIGURACION_APIS.md** para instrucciones detalladas paso a paso con capturas de pantalla y solución de problemas.

---

## 🎯 Flujo del Challenge

1. **Bienvenida** → Explicación del challenge
2. **Ingredientes** → Agrega mínimo 2 ingredientes
3. **IA Genera Recetas** → Gemini crea 2 opciones
4. **Selecciona Receta** → Elige tu favorita
5. **Cocina** → Prepara el plato
6. **Sube Evidencia** → Foto o video
7. **¡Completo!** → Acceso a toda la app

---

## 🔧 Comandos Útiles

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build producción
npm run build

# Preview producción
npm run preview
```

---

## ⚠️ Problemas Comunes

### Gemini no funciona:
- Verifica la API Key
- Revisa la consola (F12)
- Límite: 60 requests/minuto

### Firebase no sube archivos:
- Verifica configuración en `firebase.js`
- Revisa reglas de Storage
- Confirma que Storage está habilitado

---

## 📞 Soporte

Revisa el archivo **CONFIGURACION_APIS.md** en la sección "Solución de Problemas" para ayuda detallada.
