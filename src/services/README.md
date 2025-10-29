# Servicio de Autenticación

## Descripción
Servicio centralizado para manejar la autenticación con Firebase en la aplicación FreshKeeper.

## Características

### ✅ Autenticación con Email/Password
- Registro de nuevos usuarios
- Inicio de sesión
- Manejo de errores en español

### ✅ Autenticación con Google
- Login con popup de Google
- Detección automática de cuentas existentes
- Manejo de errores de popup

### ✅ Gestión de Sesión
- Cierre de sesión
- Persistencia automática de sesión
- Observador de cambios de autenticación

## Uso

### Importar el servicio
```javascript
import authService from '../services/authService';
```

### Login con Email
```javascript
const result = await authService.loginWithEmail(email, password);

if (result.success) {
  console.log('Usuario:', result.user);
} else {
  console.error('Error:', result.error);
}
```

### Registro con Email
```javascript
const result = await authService.registerWithEmail(email, password);

if (result.success) {
  console.log('Usuario creado:', result.user);
} else {
  console.error('Error:', result.error);
}
```

### Login con Google
```javascript
const result = await authService.loginWithGoogle();

if (result.success) {
  console.log('Usuario:', result.user);
} else {
  console.error('Error:', result.error);
}
```

### Cerrar Sesión
```javascript
const result = await authService.logout();

if (result.success) {
  console.log('Sesión cerrada');
}
```

### Observar cambios de autenticación
```javascript
const unsubscribe = authService.onAuthStateChanged((user) => {
  if (user) {
    console.log('Usuario autenticado:', user);
  } else {
    console.log('Usuario no autenticado');
  }
});

// Limpiar observador
unsubscribe();
```

## Estructura de Respuesta

Todas las operaciones retornan un objeto con la siguiente estructura:

### Éxito
```javascript
{
  success: true,
  user: {
    uid: string,
    email: string,
    name: string,
    photoURL: string | null,
    emailVerified: boolean
  }
}
```

### Error
```javascript
{
  success: false,
  error: string  // Mensaje de error en español
}
```

## Mensajes de Error

El servicio traduce los códigos de error de Firebase a mensajes en español:

- `auth/invalid-email`: "Correo electrónico inválido"
- `auth/user-not-found`: "No existe una cuenta con este correo"
- `auth/wrong-password`: "Contraseña incorrecta"
- `auth/email-already-in-use`: "Ya existe una cuenta con este correo"
- `auth/weak-password`: "La contraseña debe tener al menos 6 caracteres"
- Y más...

## Integración con el Contexto

El servicio está integrado con `AppContext.jsx`:

```javascript
// En AppContext.jsx
useEffect(() => {
  const unsubscribe = authService.onAuthStateChanged((firebaseUser) => {
    if (firebaseUser) {
      setUser(authService.formatUser(firebaseUser));
    } else {
      setUser(null);
    }
    setAuthLoading(false);
  });

  return () => unsubscribe();
}, []);
```

Cuando un usuario inicia sesión exitosamente:
1. Firebase actualiza su estado interno
2. `onAuthStateChanged` detecta el cambio
3. El contexto actualiza el estado global del usuario
4. La app redirige automáticamente al Dashboard

## Notas Importantes

- **No se requiere llamada manual a `login()`**: Firebase Auth maneja el estado automáticamente
- **Redirección automática**: Cuando la autenticación es exitosa, el usuario es redirigido al Dashboard
- **Persistencia**: La sesión persiste automáticamente entre recargas de página
- **Popup de Google**: Usa `signInWithPopup` (puede ser bloqueado por navegadores)

## Solución de Problemas

### El popup de Google es bloqueado
- Asegúrate de que el navegador permita popups
- Verifica que el dominio esté autorizado en Firebase Console

### Credenciales inválidas
- Verifica que Firebase Auth esté habilitado en Firebase Console
- Confirma que Email/Password y Google estén activados como proveedores

### Usuario no redirige al Dashboard
- Verifica que `onAuthStateChanged` se esté ejecutando
- Revisa la consola del navegador para ver logs
- Confirma que `authLoading` cambie a `false`
