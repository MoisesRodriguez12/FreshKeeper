# Sistema de Perfil de Usuario - Documentación

## 🎯 Funcionalidad Implementada

Se ha creado un **sistema completo de gestión de perfil de usuario** que permite a los usuarios:

1. ✅ Ver y editar su **nombre de usuario**
2. ✅ Cargar, actualizar y eliminar **foto de perfil**
3. ✅ Gestionar **preferencias de dieta**
4. ✅ Todos los cambios se **guardan automáticamente en Firebase**

---

## 📁 Archivos Creados

### 1. **userService.js** (`src/services/userService.js`)

Servicio completo para gestionar datos del usuario en Firebase.

**Métodos principales:**

```javascript
// Obtener perfil del usuario
getUserProfile(userId)

// Actualizar nombre
updateDisplayName(userId, displayName)

// Gestión de foto de perfil
uploadProfilePhoto(file, userId)
updateProfilePhoto(userId, photoFile, oldPhotoPath)
removeProfilePhoto(userId, photoPath)
deleteProfilePhoto(photoPath)

// Preferencias de dieta
updateDietPreferences(userId, preferences)

// Actualizar perfil completo
updateProfile(userId, profileData)
```

**Almacenamiento:**
- **Fotos**: Firebase Storage en carpeta `/profiles/`
- **Datos**: Firestore colección `Users`

---

### 2. **Profile.jsx** (`src/pages/Profile.jsx`)

Página completa de perfil de usuario con interfaz moderna y responsiva.

**Características:**

#### Sección: Información Personal
- 📷 **Foto de perfil**
  - Preview en tiempo real
  - Botón para cambiar foto
  - Botón para eliminar foto
  - Validación de tamaño (máx 5MB)
  - Solo archivos de imagen
  
- ✏️ **Nombre completo**
  - Campo editable
  - Se actualiza en Firebase

- 📧 **Email**
  - Solo lectura (no editable)

#### Sección: Preferencias de Dieta
- 🎯 **Objetivo principal**
  - Bajar de peso
  - Mantener peso
  - Ganar peso
  - Ganar músculo
  - Salud general

- 🚫 **Restricciones alimentarias** (multi-selección)
  - Vegetariano
  - Vegano
  - Sin gluten
  - Sin lácteos
  - Sin azúcar
  - Bajo en carbohidratos
  - Keto

- ❤️ **Preferencias de comida** (multi-selección)
  - Pollo
  - Pescado
  - Carne roja
  - Pasta
  - Arroz
  - Ensaladas
  - Sopas
  - Smoothies

- 🍽️ **Comidas por día**
  - Slider de 2 a 6 comidas

- 🏃 **Nivel de actividad física**
  - Sedentario
  - Ligero
  - Moderado
  - Activo
  - Muy activo

**Funcionalidades:**
- ✅ Carga automática de datos existentes
- ✅ Preview de foto antes de guardar
- ✅ Validaciones de formulario
- ✅ Mensajes de éxito/error
- ✅ Estado de carga
- ✅ Actualización en tiempo real

---

## 🔄 Modificaciones en Archivos Existentes

### 1. **Layout.jsx** (`src/components/Layout.jsx`)

**Cambios realizados:**

#### Desktop:
```jsx
// ANTES: Icono estático
<div className="bg-green-100 rounded-full p-1.5 sm:p-2">
  <User className="..." />
</div>

// AHORA: Botón clickeable
<button
  onClick={() => onPageChange('profile')}
  className="bg-green-100 rounded-full p-1.5 sm:p-2 hover:bg-green-200..."
  title="Ver perfil"
>
  <User className="..." />
</button>
```

#### Móvil:
```jsx
// AÑADIDO: Botón "Mi Perfil" en menú móvil
<button
  onClick={() => {
    onPageChange('profile');
    setIsMobileMenuOpen(false);
  }}
  className="..."
>
  <User className="h-5 w-5 mr-3" />
  Mi Perfil
</button>
```

---

### 2. **App.jsx** (`src/App.jsx`)

**Cambios realizados:**

```jsx
// Importación del componente Profile
import Profile from './pages/Profile';

// Añadido case en renderCurrentPage()
case 'profile':
  return <Profile />;
```

---

## 💾 Estructura de Datos en Firebase

### Colección: `Users`

```javascript
{
  userId: string,                    // ID del usuario (Firebase Auth)
  displayName: string,               // Nombre completo del usuario
  photoURL: string,                  // URL de la foto de perfil
  photoPath: string,                 // Ruta en Storage para eliminar
  dietPreferences: {                 // Preferencias de dieta
    goal: string,                    // Objetivo (bajar_peso, mantener_peso, etc.)
    restrictions: [string],          // Array de restricciones
    preferences: [string],           // Array de preferencias
    mealsPerDay: number,             // Comidas al día (2-6)
    activityLevel: string            // Nivel de actividad
  },
  neverShowDietQuestionnaire: boolean,  // Control de cuestionario
  showDietQuestionnaire: boolean,       // Control de cuestionario
  lastSkippedAt: Timestamp,             // Última vez que saltó cuestionario
  createdAt: string,                    // Fecha de creación
  updatedAt: string                     // Última actualización
}
```

### Firebase Storage: `/profiles/`

```
/profiles/
  └── profile_{userId}_{timestamp}
      Ejemplos:
      - profile_abc123_1698765432.jpg
      - profile_xyz789_1698765555.png
```

---

## 🎨 Interfaz de Usuario

### Diseño Responsivo
- ✅ Desktop: Layout de 2 columnas
- ✅ Tablet: Layout adaptativo
- ✅ Mobile: Layout de 1 columna

### Componentes Visuales
- 🎨 Gradientes modernos
- 📦 Cards con sombras suaves
- 🔘 Botones interactivos
- 📸 Preview de imagen circular
- ⚡ Animaciones de transición
- 📱 Totalmente responsive

### Estados del Sistema
- ⏳ **Loading**: Spinner mientras carga datos
- ✅ **Success**: Mensaje verde de confirmación
- ❌ **Error**: Mensaje rojo de error
- 💾 **Saving**: Botón deshabilitado con texto "Guardando..."

---

## 🔐 Validaciones Implementadas

### Foto de Perfil:
- ✅ Tamaño máximo: 5MB
- ✅ Solo archivos de imagen (jpg, png, gif, etc.)
- ✅ Confirmación antes de eliminar
- ✅ Elimina foto anterior al subir nueva

### Formulario:
- ✅ Detecta cambios en cada campo
- ✅ Solo guarda si hay cambios reales
- ✅ Validación de campos requeridos
- ✅ Sincronización con colección `Diets`

---

## 🔄 Flujo de Actualización

### 1. Actualización de Nombre:
```
Usuario modifica nombre → Click en "Guardar" → 
userService.updateDisplayName() → 
Actualiza Firestore → 
Mensaje de éxito → 
Recarga datos
```

### 2. Actualización de Foto:
```
Usuario selecciona imagen → 
Validación (tamaño/tipo) → 
Preview en interfaz → 
Click en "Guardar" → 
Elimina foto anterior → 
Sube nueva foto a Storage → 
Actualiza URL en Firestore → 
Mensaje de éxito
```

### 3. Actualización de Preferencias:
```
Usuario modifica preferencias → 
Click en "Guardar" → 
Compara con valores anteriores → 
Si hay cambios:
  - Actualiza colección Users
  - Actualiza colección Diets (si existe dieta)
→ Mensaje de éxito
```

---

## 🚀 Cómo Usar

### Para el Usuario:

1. **Acceder al perfil:**
   - Click en el icono de usuario (círculo verde) en la barra superior
   - O seleccionar "Mi Perfil" en el menú móvil

2. **Cambiar foto:**
   - Click en "Cambiar foto"
   - Seleccionar imagen (máx 5MB)
   - Click en "Guardar Cambios"

3. **Eliminar foto:**
   - Click en el botón rojo (🗑️) sobre la foto
   - Confirmar eliminación

4. **Editar nombre:**
   - Escribir en el campo "Nombre completo"
   - Click en "Guardar Cambios"

5. **Modificar preferencias:**
   - Seleccionar objetivo
   - Click en restricciones/preferencias deseadas
   - Ajustar comidas por día
   - Seleccionar nivel de actividad
   - Click en "Guardar Cambios"

---

## 🔧 Integración con Sistema de Dietas

### Sincronización Automática:

Cuando el usuario actualiza sus preferencias de dieta en el perfil:

1. ✅ Se actualiza la colección `Users` con las nuevas preferencias
2. ✅ Si existe una dieta en `Diets`, se actualizan solo las preferencias (mantiene el plan)
3. ✅ El cuestionario de dieta puede acceder a estas preferencias pre-cargadas
4. ✅ Futura regeneración de dieta usará las preferencias actualizadas

### Consistencia de Datos:

```
Users/{userId}.dietPreferences
    ↕️
Diets/{userId}.preferences
```

Ambas colecciones mantienen las mismas preferencias sincronizadas.

---

## 📊 Beneficios del Sistema

### Para el Usuario:
- ✅ Control total sobre su información personal
- ✅ Personalización de experiencia
- ✅ Foto de perfil visible en toda la app
- ✅ Preferencias guardadas permanentemente
- ✅ No necesita rellenar cuestionario cada vez

### Para el Sistema:
- ✅ Datos centralizados en Firebase
- ✅ Fácil acceso a preferencias del usuario
- ✅ Mejores recomendaciones de IA
- ✅ Experiencia personalizada
- ✅ Almacenamiento eficiente en Storage

---

## 🎯 Próximas Mejoras Sugeridas

1. **Estadísticas del perfil:**
   - Total de productos agregados
   - Comidas guardadas
   - Días activo en la plataforma

2. **Configuración adicional:**
   - Notificaciones push on/off
   - Idioma preferido
   - Tema claro/oscuro

3. **Privacidad:**
   - Opción de perfil público/privado
   - Control de qué mostrar en galería

4. **Integración social:**
   - Compartir perfil
   - Seguir a otros usuarios
   - Compartir recetas favoritas

---

## ✅ Estado Final

### Completado:
- [x] Servicio de usuario (userService.js)
- [x] Página de perfil (Profile.jsx)
- [x] Actualización de Layout para hacer clickeable el icono
- [x] Integración con App.jsx
- [x] Gestión de foto de perfil con Storage
- [x] Formulario de preferencias de dieta
- [x] Validaciones completas
- [x] Mensajes de éxito/error
- [x] Sincronización con colección Diets
- [x] Interfaz responsive
- [x] Guardado en Firebase

### Listo para usar:
✅ El sistema está completamente funcional y listo para producción.
