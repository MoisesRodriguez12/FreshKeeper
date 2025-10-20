# Reglas de Firestore para FreshKeeper

## ⚠️ IMPORTANTE: Configurar estas reglas en Firebase Console

El error `Missing or insufficient permissions` se debe a que Firestore necesita reglas de seguridad configuradas.

### 📋 Pasos para configurar:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto **freshkeeper-a3719**
3. En el menú lateral, click en **Firestore Database**
4. Ve a la pestaña **Reglas** (Rules)
5. Reemplaza el contenido con las reglas de abajo
6. Click en **Publicar** (Publish)

---

## 🔒 Reglas de Seguridad Recomendadas

### Opción 1: Modo Desarrollo (Acceso Total - Solo para Testing)

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Permite lectura y escritura a todos durante 30 días
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 11, 20);
    }
  }
}
```

⚠️ **Advertencia**: Esta regla da acceso total. Solo úsala temporalmente durante desarrollo.

---

### Opción 2: Reglas de Producción (Recomendado)

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Colección Comentarios (Challenge submissions)
    match /Comentarios/{commentId} {
      // Cualquiera puede leer
      allow read: if true;
      
      // Solo se puede crear (no editar ni eliminar)
      allow create: if request.resource.data.keys().hasAll([
        'userName', 'recipeName', 'ingredients', 'fileUrl', 
        'fileType', 'createdAt', 'timestamp'
      ])
      && request.resource.data.userName is string
      && request.resource.data.recipeName is string
      && request.resource.data.ingredients is list
      && request.resource.data.fileUrl is string
      && request.resource.data.fileType in ['image', 'video']
      && request.resource.data.timestamp is number;
      
      // No permite actualizar ni eliminar (inmutable)
      allow update, delete: if false;
    }
    
    // Otras colecciones (si las tienes)
    match /{document=**} {
      allow read: if true;
      allow write: if false; // Por seguridad, bloquea escritura por defecto
    }
  }
}
```

**Características**:
- ✅ Lectura pública (cualquiera puede ver la galería)
- ✅ Creación controlada (solo con campos válidos)
- ✅ Validación de tipos de datos
- ✅ Inmutable (no se puede editar ni borrar después de crear)
- ✅ Validación de tipos de archivo (solo image/video)

---

## 🔍 Crear Índice Compuesto

Para que la query `orderBy('timestamp', 'desc')` funcione, necesitas un índice:

### Método Automático (Recomendado):
1. Intenta cargar la galería en la app
2. Firebase mostrará un error con un **enlace azul**
3. Haz click en el enlace
4. Se creará el índice automáticamente

### Método Manual:
1. Ve a Firestore → pestaña **Índices** (Indexes)
2. Click en **Crear índice**
3. Configura:
   - **Collection ID**: `Comentarios`
   - **Fields to index**:
     - Field: `timestamp` → Order: `Descending`
   - **Query scope**: `Collection`
4. Click **Crear**

---

## 🧪 Verificar que funciona

Después de aplicar las reglas:

1. Recarga tu aplicación
2. Sube una foto/video en el challenge
3. No deberías ver el error de permisos
4. En la galería, deberías ver tu creación
5. Verifica en Firebase Console → Firestore → Datos que se creó el documento

---

## 📊 Estructura de Datos en Firestore

Colección: **Comentarios**

```javascript
{
  userName: "María García" | "Anónimo",
  userComment: "¡Me quedó deliciosa!" | "",
  recipeName: "Pasta Carbonara",
  ingredients: ["pasta", "huevos", "queso"],
  fileUrl: "https://firebasestorage.googleapis.com/...",
  fileType: "image" | "video",
  createdAt: "2025-10-20T15:30:00.000Z",
  timestamp: 1729437000000
}
```

---

## 🚨 Solución de Problemas

### Error: "Missing or insufficient permissions"
- ✅ Verifica que aplicaste las reglas en Firebase Console
- ✅ Espera 1-2 minutos después de publicar las reglas
- ✅ Recarga la aplicación completamente

### Error: "PERMISSION_DENIED: Missing or insufficient permissions"
- ✅ Las reglas están mal configuradas
- ✅ Usa la Opción 1 (modo desarrollo) temporalmente

### Error al ordenar: "The query requires an index"
- ✅ Crea el índice compuesto (ver sección anterior)
- ✅ O haz click en el enlace del error

---

## 📝 Notas Adicionales

- **Storage ya funciona**: El archivo se sube correctamente a Firebase Storage
- **Solo Firestore necesita configuración**: El error es al guardar metadatos
- **Límite de archivos**: 10MB (configurado en la app)
- **Campos opcionales**: userName y userComment pueden estar vacíos
- **Colección**: Se llama "Comentarios" (con mayúscula)

---

¿Necesitas ayuda con la configuración? Comparte el mensaje de error exacto que ves en la consola.
