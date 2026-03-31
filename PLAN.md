# Plan de Desarrollo: PWA Calendario para iOS

Este documento detalla los pasos para construir la PWA de Calendario basándose en las especificaciones del archivo `PWA-CALENDAR-AGENT.md`.

## Fase 1: Configuración Inicial y Estructura
- Inicializar el workspace utilizando estrictamente `pnpm`.
- Establecer la estructura del proyecto dividida en dos partes: `/frontend` y `/backend`.
- **Frontend:** Inicializar con Vite, React y Tailwind CSS.
- **Backend:** Inicializar el servidor Node.js e instalar dependencias clave: `express`, `cors`, `web-push`, `node-cron` y una base de datos ligera (ej. `sqlite3` o arrays en memoria para la primera iteración).

## Fase 2: Desarrollo del Backend (API y Push Notifications)
- **Servidor Express:** Configurar enrutamiento básico y habilitar CORS para aceptar peticiones del frontend.
- **Base de Datos:** Crear la lógica para persistir `eventos` (título, fecha, hora, color, antelación) y `suscripciones` (PushSubscriptions).
- **VAPID Keys:** Generar y configurar las llaves públicas y privadas para los servicios APNs/FCM usando `web-push`.
- **Endpoints de la API:**
  - CRUD de Eventos: `GET`, `POST`, `PUT`, `DELETE` en `/api/events`.
  - Suscripciones Push: `POST /api/subscribe` para recibir el objeto del cliente y guardarlo.
- **Cron Job:** Implementar la lógica con `node-cron` ejecutándose cada minuto. Deberá calcular si la hora actual concuerda con la fórmula `HoraEvento - Antelación`, y si es así, disparar `webpush.sendNotification()`.

## Fase 3: Desarrollo del Frontend (UI & UX Mobile-First)
- **Safe Areas iOS:** Configurar el archivo CSS base con las variables de Apple (`env(safe-area-inset-top)` y `env(safe-area-inset-bottom)`) para evitar colisiones con el Notch/Dynamic Island y la barra inferior.
- **Interfaz del Calendario:** Diseñar las vistas del calendario (mensual/semanal) y la renderización de eventos respetando sus colores correspondientes.
- **Modal de Creación:** Formulario para nuevos eventos. Campos: Título, Fecha, Hora, Color (selector) y opción de Antelación (ej. 15 mins, 1 hora).
- **Componente Onboarding:** Lógica para detectar el navedador (Safari iOS) y el modo de visualización. Si no es `standalone`, mostrar de forma estética las instrucciones para hacer "Compartir -> Añadir a pantalla de inicio".

## Fase 4: PWA y Service Worker
- **Archivos PWA Core:** 
  - Configurar `manifest.json`.
  - Añadir obligatoriamente el tag `<link rel="apple-touch-icon" href="/icon-180x180.png">` en el `index.html`.
- **Lógica de Permisos Push:** Crear un botón claro en la interfaz (ej. "Activar Notificaciones") que actúe bajo demanda del usuario para invocar `Notification.requestPermission()`.
- **Service Worker (`sw.js`):** Script encargado de recibir los eventos push del server en background y lanzar la API de notificaciones (`self.registration.showNotification`).

## Fase 5: Pruebas y Cumplimiento de Criterios (QA)
- Verificación en dispositivo iOS (16.4+) real o simulador:
  - Instalación exitosa en Home Screen.
  - La UI fluye correctamente bajo la zona segura.
  - El modal de permisos se dispara solo al hacer clic.
  - Se recibe una notificación PUSH correctamente calculada tras configurar un evento a X minutos vista, incluso con la app cerrada.