# PWA-CALENDAR-AGENT.md

## 1. Contexto y Objetivo del Proyecto
Este proyecto es una Progressive Web App (PWA) de calendario diseñada bajo una mentalidad "Mobile-First", con optimización estricta para dispositivos iOS (iPhone). El usuario podrá visualizar un calendario, crear eventos, asignarles colores personalizados y configurar alertas para recibir notificaciones Push en su dispositivo con antelación al evento.

## 2. Stack Tecnológico
* **Gestor de Paquetes:** pnpm (Uso obligatorio y exclusivo en todo el proyecto).
* **Frontend:** React, Vite, Tailwind CSS.
* **Backend:** Node.js, Express.js.
* **Service Worker:** Integración nativa o mediante vite-plugin-pwa.
* **Notificaciones:** API Web Push, librería web-push (Node), y node-cron (o similar) para la evaluación de alertas temporales.
* **Base de Datos (Prototipo):** Memoria local o base de datos ligera (SQLite/MongoDB) para almacenar eventos y suscripciones (PushSubscriptions).

## 3. Reglas Estrictas para iOS (Safari/Apple)
* **Requisito de Instalación:** Las notificaciones Web Push solo funcionan en iOS 16.4+ y ÚNICAMENTE si la aplicación ha sido añadida a la pantalla de inicio ("Add to Home Screen").
* **Diseño Seguro (Notch/Dynamic Island):** Todo el CSS global debe incluir las variables de entorno de Apple env(safe-area-inset-top) y env(safe-area-inset-bottom) para evitar que el contenido quede oculto bajo la cámara o la barra de navegación del sistema.
* **Permisos de Usuario:** El prompt para solicitar permisos de notificación (Notification.requestPermission()) DEBE ser disparado por una interacción directa del usuario (por ejemplo, un clic en un botón "Activar Alertas"), nunca de forma automática al cargar la página.
* **Iconografía:** El archivo manifest.json no es suficiente para Apple. Se debe inyectar la etiqueta <link rel="apple-touch-icon" href="/icon-180x180.png"> en el <head> del index.html.

## 4. Especificaciones del Frontend (Vite + React)
* Crear una interfaz de calendario mensual y semanal limpia utilizando Tailwind CSS.
* Implementar un formulario modal para la creación de eventos con los siguientes campos obligatorios: Título, Fecha y Hora de inicio, Color representativo (selector visual) y "Avisarme con [X] tiempo de antelación".
* Desarrollar un componente o banner de "Onboarding" que detecte si el usuario está en Safari iOS y no está en modo "standalone", mostrando instrucciones visuales de cómo instalar la PWA manualmente (Compartir -> Añadir a pantalla de inicio).
* Crear la lógica en React para registrar el Service Worker (sw.js) al iniciar la app.
* Implementar la función que suscriba al usuario al PushManager usando la clave pública VAPID y envíe el objeto de suscripción al backend.

## 5. Especificaciones del Backend (Node + Express)
* Configurar Express para recibir peticiones REST (CORS habilitado para el frontend).
* Generar y almacenar las llaves VAPID necesarias para la autenticación en los servidores de notificaciones (APNs/FCM).
* Crear un endpoint POST /api/subscribe para almacenar las suscripciones asociadas a los usuarios/dispositivos.
* Crear endpoints CRUD (GET, POST, PUT, DELETE) para la gestión de los eventos del calendario.
* Implementar un proceso en segundo plano (Cron Job) que se ejecute cada minuto. Este proceso debe consultar los eventos próximos, calcular el tiempo restante según la preferencia de aviso del usuario y disparar la función webpush.sendNotification() a la suscripción correspondiente.

## 6. Flujo de Notificaciones Push
1. El usuario instala la PWA en su iPhone.
2. El usuario interactúa con la UI y otorga permisos de notificación.
3. El Frontend genera una suscripción Push y la envía al Backend.
4. El usuario crea un evento para mañana a las 10:00 AM con un aviso de "15 minutos de antelación".
5. El Cron Job del Backend detecta la alerta a las 09:45 AM del día siguiente.
6. El Backend envía el payload al servicio de notificaciones usando VAPID.
7. El Service Worker (sw.js) en el iPhone del usuario recibe el evento push y muestra la notificación visual en pantalla.

## 7. Criterios de Aceptación
Para dar el proyecto por finalizado, se deben cumplir obligatoriamente los siguientes puntos:
* [ ] La PWA se puede instalar correctamente en la pantalla de inicio de un iPhone a través de Safari.
* [ ] La interfaz gráfica se adapta al dispositivo y respeta el área segura de iOS (notch, dynamic island y barra inferior de navegación).
* [ ] El usuario puede crear, visualizar, editar y eliminar eventos en el calendario de forma fluida.
* [ ] Los eventos creados se muestran con el color personalizado elegido por el usuario.
* [ ] El prompt para permitir notificaciones solo aparece cuando la app está instalada en la pantalla de inicio y tras un clic explícito del usuario.
* [ ] El Service Worker se registra correctamente y el backend guarda con éxito el objeto de suscripción Push.
* [ ] El proceso en segundo plano (Cron) detecta correctamente cuándo debe enviarse una notificación según la antelación configurada.
* [ ] Las notificaciones Push llegan y se muestran visualmente en un dispositivo iOS (16.4+) aunque la PWA no esté activa en primer plano.
* [ ] Todas las dependencias han sido instaladas y gestionadas exclusivamente mediante pnpm.

## 8. Mensajes de Commit
Al final de cada respuesta que implique la creación, modificación o eliminación de código o archivos, el agente DEBE proporcionar un mensaje de commit en castellano resumiendo los cambios realizados. 
* El formato del mensaje debe seguir convenciones estándar (ej. feat: [descripción], fix: [descripción], docs: [descripción]).
* Este mensaje debe presentarse en un bloque de código independiente al final de la interacción.