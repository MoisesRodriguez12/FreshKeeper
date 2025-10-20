# 🔑 Guía de Configuración de APIs - FreshKeeper Challenge

## 📋 Índice
1. [Configurar Gemini AI](#1-configurar-gemini-ai)
2. [Configurar Firebase Storage](#2-configurar-firebase-storage)
3. [Verificar la Configuración](#3-verificar-la-configuración)

---

## 1. Configurar Gemini AI

### Paso 1: Obtener API Key de Google AI Studio

1. **Ve a Google AI Studio**
   - Abre tu navegador y ve a: https://aistudio.google.com/app/apikey

2. **Inicia sesión**
   - Inicia sesión con tu cuenta de Google

3. **Crear API Key**
   - Haz clic en **"Get API key"** o **"Create API key"**
   - Selecciona **"Create API key in new project"** o usa un proyecto existente
   - Copia la API Key que se genera (algo como: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

### Paso 2: Configurar en el Proyecto

1. **Abre el archivo:**
   ```
   src/config/gemini.js
   ```

2. **Reemplaza la línea 12:**
   ```javascript
   const API_KEY = "TU_GEMINI_API_KEY_AQUI";
   ```
   
   Por:
   ```javascript
   const API_KEY = "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"; // Tu API Key aquí
   ```

3. **Guarda el archivo** (Ctrl+S o Cmd+S)

### ⚠️ Importante:
- **NO compartas** tu API Key públicamente
- **NO la subas** a GitHub (agrega el archivo a .gitignore)
- Gemini tiene un límite de uso gratuito de 60 requests por minuto

---

## 2. Configurar Firebase Storage

### Paso 1: Crear Proyecto en Firebase

1. **Ve a Firebase Console**
   - Abre: https://console.firebase.google.com

2. **Crear nuevo proyecto**
   - Haz clic en **"Agregar proyecto"** o **"Add project"**
   - Nombre: `freshkeeper-challenge` (o el que prefieras)
   - Acepta los términos y continúa
   - **Puedes desactivar** Google Analytics si no lo necesitas
   - Haz clic en **"Crear proyecto"**

### Paso 2: Agregar una App Web

1. **Dentro de tu proyecto Firebase:**
   - Haz clic en el ícono **"</>"** (Web) para agregar una app web
   - Nombre de la app: `FreshKeeper`
   - **NO marques** "Firebase Hosting" por ahora
   - Haz clic en **"Registrar app"**

2. **Copiar la configuración**
   - Verás un código JavaScript con `firebaseConfig`
   - Copia **SOLO** el objeto de configuración (las líneas entre las llaves `{}`)

### Paso 3: Habilitar Storage

1. **En el menú lateral de Firebase:**
   - Ve a **"Build"** → **"Storage"**
   - Haz clic en **"Get started"** o **"Comenzar"**

2. **Configurar reglas de seguridad:**
   - Selecciona **"Start in test mode"** (modo de prueba)
   - Haz clic en **"Next"** y luego en **"Done"**

3. **IMPORTANTE - Actualizar reglas (opcional pero recomendado):**
   - Ve a la pestaña **"Rules"**
   - Reemplaza las reglas por estas (permite subir archivos sin autenticación para el challenge):
   ```
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /challenge/{allPaths=**} {
         allow read, write: if true; // Solo para el challenge
       }
     }
   }
   ```
   - Haz clic en **"Publish"**

### Paso 4: Configurar en el Proyecto

1. **Abre el archivo:**
   ```
   src/config/firebase.js
   ```

2. **Reemplaza el objeto firebaseConfig (líneas 13-19):**
   ```javascript
   const firebaseConfig = {
     apiKey: "TU_API_KEY_AQUI",
     authDomain: "tu-proyecto.firebaseapp.com",
     projectId: "tu-proyecto-id",
     storageBucket: "tu-proyecto.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef123456"
   };
   ```
   
   Por tus valores reales:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
     authDomain: "freshkeeper-12345.firebaseapp.com",
     projectId: "freshkeeper-12345",
     storageBucket: "freshkeeper-12345.appspot.com",
     messagingSenderId: "987654321",
     appId: "1:987654321:web:abc123def456"
   };
   ```

3. **Guarda el archivo** (Ctrl+S o Cmd+S)

### Ejemplo de configuración completa:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "freshkeeper-12345.firebaseapp.com",
  projectId: "freshkeeper-12345",
  storageBucket: "freshkeeper-12345.appspot.com",
  messagingSenderId: "987654321",
  appId: "1:987654321:web:abc123def456"
};
```

---

## 3. Verificar la Configuración

### Paso 1: Ejecutar la aplicación

```bash
npm run dev
```

### Paso 2: Probar el Challenge

1. **Abre la aplicación** en http://localhost:5173
2. **Deberías ver** la pantalla de bienvenida del challenge
3. **Haz clic en** "¡Comenzar Challenge!"

### Paso 3: Probar Gemini AI

1. **Agrega ingredientes** (ej: manzanas, huevos, leche)
2. **Haz clic en** "Generar Recetas con IA"
3. **Si funciona:** Verás 2 recetas generadas
4. **Si da error:** Revisa tu API Key de Gemini en la consola del navegador (F12)

### Paso 4: Probar Firebase Storage

1. **Selecciona una receta**
2. **Haz clic en** "Continuar al Siguiente Paso"
3. **Sube una foto** o video
4. **Haz clic en** "Completar Challenge"
5. **Si funciona:** Verás "¡Felicitaciones!"
6. **Verificar en Firebase:**
   - Ve a Firebase Console → Storage
   - Deberías ver tu archivo en la carpeta `challenge/`

---

## ⚠️ Solución de Problemas

### Gemini AI no genera recetas:

**Error: "Invalid API Key"**
- Verifica que copiaste correctamente la API Key
- Asegúrate de que no hay espacios antes o después
- Verifica que la API Key esté activa en AI Studio

**Error: "Quota exceeded"**
- Has excedido el límite gratuito (60 requests/minuto)
- Espera 1 minuto e intenta de nuevo

### Firebase Storage no sube archivos:

**Error: "Storage bucket not configured"**
- Verifica que `storageBucket` en firebaseConfig sea correcto
- Debe terminar en `.appspot.com`

**Error: "Permission denied"**
- Ve a Firebase Console → Storage → Rules
- Asegúrate de que las reglas permitan escribir en `/challenge/*`

**Error: "Network error"**
- Verifica tu conexión a internet
- Revisa la consola del navegador (F12) para más detalles

---

## 🔒 Seguridad en Producción

### Para Gemini AI:
```javascript
// Opción 1: Variables de entorno (recomendado)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Opción 2: Usar backend para ocultar la API Key
// Crear un endpoint en tu servidor que llame a Gemini
```

### Para Firebase:
```javascript
// En producción, usa reglas de seguridad más estrictas:
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /challenge/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 📝 Checklist Final

- [ ] Gemini API Key configurada en `src/config/gemini.js`
- [ ] Firebase config configurado en `src/config/firebase.js`
- [ ] Firebase Storage habilitado en la consola
- [ ] Reglas de Storage configuradas
- [ ] Aplicación ejecutándose sin errores
- [ ] Challenge probado exitosamente
- [ ] Archivos subidos visibles en Firebase Console

---

## 🎉 ¡Listo!

Si completaste todos los pasos, tu aplicación FreshKeeper Challenge está lista para usar. 

**Próximos pasos:**
1. Prueba el flujo completo del challenge
2. Personaliza los estilos si lo deseas
3. Considera agregar más funcionalidades
4. Prepara para deployment en Vercel

---

**¿Tienes problemas?** 
- Revisa la consola del navegador (F12) para errores
- Verifica que todas las dependencias estén instaladas: `npm install`
- Asegúrate de estar en la versión correcta de Node.js (16+)
