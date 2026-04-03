# 📅 Calendar PWA para iOS

Una Progressive Web App (PWA) de calendario diseñada específicamente con una mentalidad **Mobile-First** y optimizada para cumplir con las estrictas directrices de diseño y funcionalidad de **iOS (iPhone)**.

## ✨ Funcionalidades Principales

* **Visualización de Calendario:** Vista interactiva con selector para alternar entre modo **Mensual** y **Semanal**. El modo semanal incluye un **Time Grid dividido por horas**, donde los eventos se dibujan respetando su duración y horas de inicio/fin, permitiendo visualizar los solapamientos. 
* **Gestión de Eventos:** Creación de eventos personalizados donde puedes configurar:
  * Título, hora de inicio y **hora de fin**.
  * Color representativo (código de colores visual).
  * Antelación del aviso (En el momento, 5 min, 15 min, 30 min, 1 hora, 1 día).
* **Notificaciones Web Push Nativas:** Alertas push que llegarán a tu dispositivo en el momento exacto programado, **incluso si la aplicación está cerrada**.
* **Diseño Seguro iOS:** La interfaz respeta el *Notch*, la *Dynamic Island* y la barra inferior de navegación de Apple (`safe-area-insets`), eliminando además el molesto efecto rebote (*bounce/overscroll*) nativo de Safari.

---

## 📱 Cómo utilizar la app (Guía iOS)

Debido a las políticas de Apple, para disfrutar de la experiencia completa (especialmente las notificaciones), debes seguir estos pasos:

### 1. Instalación (Añadir a pantalla de inicio)
1. Abre la URL de la aplicación en **Safari**.
2. Verás un banner inferior indicando que debes instalar la app.
3. Toca el botón de **Compartir** (el cuadrado con la flecha hacia arriba) en la barra de navegación de Safari.
4. Desliza hacia abajo y selecciona **"Añadir a pantalla de inicio"**.
5. Cierra Safari y abre la nueva aplicación desde el icono en tu pantalla de inicio.

### 2. Activar Notificaciones
1. Una vez dentro de la app instalada, busca el botón **"Activar Alertas"** en la parte superior derecha.
2. Púlselo y acepta el prompt nativo del sistema que dice *"Calendar PWA desea enviarte notificaciones"*.
3. ¡Listo! Tu dispositivo ya está suscrito de forma segura al backend.

### 3. Crear y Gestionar Eventos
* **Crear:** Toca cualquier día en el calendario (o el botón flotante `+`) para abrir el modal. Rellena los datos, escoge un color, define tu antelación de aviso y guarda.
* **Eliminar:** Toca directamente sobre la píldora de color del evento dentro de la cuadrícula del calendario para borrarlo.

---

## ⚠️ Limitaciones (Qué se puede y qué NO se puede hacer)

### Lo que SÍ puedes hacer:
* Recibir notificaciones en tu Apple Watch o pantalla de bloqueo del iPhone gracias a la integración con el servicio APNs de Apple a través del Service Worker.
* Ver el calendario e interactuar con una interfaz fluida similar a una app nativa de la App Store.
* Asociar múltiples notificaciones en un mismo día.

### Lo que NO puedes hacer (Limitaciones del Prototipo actual):
* **Notificaciones en Safari estándar:** Apple bloquea la API Web Push en navegadores móviles estándar. Si no instalas la app en la pantalla de inicio, las notificaciones nunca llegarán.
* **Edición de eventos:** Actualmente el flujo soporta creación y eliminación (CRUD parcial). Para editar un evento, debes borrarlo y volver a crearlo.
* **Sesiones de usuario (Login):** Este prototipo no cuenta con autenticación (JWT/OAuth). Todos los eventos creados son globales para la instancia de la base de datos.
* **Persistencia de datos (Si aplica en la versión gratuita):** El prototipo actual utiliza una memoria volátil para los eventos por compatibilidad de despliegue. Si el servidor se reinicia, los datos y las suscripciones podrían borrarse.

---

## 🛠️ Stack Tecnológico y Desarrollo Local

El proyecto está estructurado en un **Monorepo** gestionado con `pnpm workspaces`.

* **Frontend:** React, Vite, Tailwind CSS (v3), Lucide React, date-fns.
* **Backend:** Node.js, Express.js, node-cron, web-push.

### Instalación en local

1. Clona el repositorio.
2. Instala todas las dependencias desde la raíz:
   ```bash
   pnpm install
   ```
3. Configura las variables de entorno basándote en los archivos `.env.example` tanto en `/backend` como en `/frontend`.
4. Levanta ambos entornos (Frontend y Backend) simultáneamente con:
   ```bash
   pnpm run dev
   ```

*(El Frontend correrá en `http://localhost:5173` y el Backend en `http://localhost:3001`)*