# 🍎 FreshKeeper - Gestión de Alimentos

Una aplicación web progresiva (PWA) para gestionar alimentos y evitar el desperdicio, construida con React, Vite y Tailwind CSS.

## ✨ Características

- 🔐 **Sistema de login** sencillo para demostración
- 📊 **Dashboard** con estadísticas de productos
- ➕ **Registro de productos** con cámara y fechas de caducidad
- 👨‍🍳 **Sugerencias de recetas** basadas en productos por caducar
- ♻️ **Consejos de compost** y gestión de residuos
- 🔔 **Notificaciones push** para productos próximos a caducar
- 📱 **PWA completa** con instalación offline
- 🎨 **Diseño responsive** optimizado para móviles

## 🚀 Deployment en Vercel

### Preparación

1. **Commit todos los cambios** al repositorio Git
2. **Push al repositorio** de GitHub/GitLab

### Deployment

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Importa tu repositorio desde GitHub
3. Configura las siguientes variables:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Configuración de Notificaciones Push

Para que las notificaciones funcionen en producción:

1. **HTTPS requerido**: Vercel proporciona HTTPS automáticamente
2. **Service Worker**: Ya incluido en `/public/sw.js`
3. **Permisos**: Los usuarios deben permitir notificaciones manualmente

### Variables de Entorno (Opcional)

Si necesitas configurar variables de entorno:

```bash
# .env.local
VITE_APP_NAME=FreshKeeper
VITE_APP_VERSION=1.0.0
```

## 📱 Optimización Móvil

### Características PWA incluidas:

- **Manifest.json** con configuración completa
- **Service Worker** para notificaciones
- **Meta tags** optimizados para móviles
- **Instalación** desde navegador
- **Diseño responsive** con breakpoints móviles

### Testing en móvil:

1. **Chrome DevTools**: Usa el modo responsive
2. **Lighthouse**: Ejecuta auditoría PWA
3. **Dispositivo real**: Testa en dispositivos reales

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de producción
npm run preview
```

## 📦 Dependencias Principales

- **React 18+** - Framework principal
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework de estilos
- **Lucide React** - Iconos
- **Date-fns** - Manejo de fechas
- **React Router** - Navegación (futuro)

## 🔧 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Layout.jsx      # Layout principal
│   └── InstallPWA.jsx  # Banner de instalación
├── pages/              # Páginas de la aplicación
│   ├── Login.jsx       # Página de login
│   ├── Dashboard.jsx   # Panel principal
│   ├── AddProduct.jsx  # Añadir productos
│   ├── Recipes.jsx     # Sugerencias de recetas
│   └── Disposal.jsx    # Gestión de residuos
├── context/            # Context API
│   └── AppContext.jsx  # Estado global
├── utils/              # Utilidades
│   └── helpers.js      # Funciones auxiliares
└── assets/             # Recursos estáticos

public/
├── sw.js              # Service Worker
├── manifest.json      # Manifiesto PWA
└── favicon.svg        # Favicon personalizado
```

## 🎯 Funcionalidades Demo

### Datos de prueba incluidos:
- 4 productos de ejemplo con diferentes estados
- Notificaciones automáticas cada 30 minutos
- Recetas basadas en ingredientes disponibles

### Credenciales de login:
- **Email**: cualquier@email.com
- **Contraseña**: cualquier contraseña

## 🐛 Troubleshooting

### Notificaciones no funcionan:
1. Verificar que sea HTTPS (Vercel lo proporciona)
2. Comprobar permisos en navegador
3. Usar el botón "Probar Notificaciones"

### Problemas móviles:
1. Limpiar caché del navegador
2. Verificar viewport meta tag
3. Comprobar touch events

### Build errors:
1. Verificar versiones de Node.js (16+)
2. Limpiar node_modules: `rm -rf node_modules && npm install`
3. Verificar archivos de configuración

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

## 👨‍💻 Desarrollo

Desarrollado como MVP/Prototipo para demostración de funcionalidades.

---

¡Disfruta gestionando tus alimentos con FreshKeeper! 🌱+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
