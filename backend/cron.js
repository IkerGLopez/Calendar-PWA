const cron = require('node-cron');
const db = require('./db');
const webpush = require('web-push');

const start = () => {
  // Se ejecuta cada minuto
  cron.schedule('* * * * *', () => {
    const now = new Date();
    
    // Obtener todos los eventos para comprobar su fecha de inicio y la antelación
    db.all(`SELECT * FROM events`, [], (err, events) => {
      if (err) {
        console.error("Error al leer eventos en Cron Job:", err);
        return;
      }
      
      events.forEach(event => {
        // Construimos el objeto Date del evento (asumiendo formato local YYYY-MM-DD y HH:MM)
        const eventDateTime = new Date(`${event.date}T${event.time}:00`);
        
        // Diferencia en milisegundos
        const timeDiffMs = eventDateTime.getTime() - now.getTime();
        // Diferencia en minutos
        const timeDiffMinutes = Math.floor(timeDiffMs / 60000);

        // Si la diferencia cuadra con el momento de recordatorio (ej. quedan 15 mins exactos)
        if (timeDiffMinutes === parseInt(event.reminderMinutes)) {
           sendPushNotifications(event);
        }
      });
    });
  });
};

function sendPushNotifications(event) {
  db.all(`SELECT * FROM subscriptions`, [], (err, subs) => {
    if (err) {
      console.error("Error al obtener suscripciones:", err);
      return;
    }
    
    const payload = JSON.stringify({
      title: `Calendario: ${event.title}`,
      body: `Faltan ${event.reminderMinutes} minutos. El evento empieza a las ${event.time}.`,
      icon: '/icon-180x180.png'
    });

    subs.forEach(row => {
      const pushSubscription = {
        endpoint: row.endpoint,
        keys: JSON.parse(row.keys)
      };
      
      webpush.sendNotification(pushSubscription, payload).catch(err => {
        console.error('Error al enviar Push:', err);
        // Si la suscripción ha expirado o ya no es válida (código 410 Gone) en iOS/servicios
        if (err.statusCode === 410) {
          db.run(`DELETE FROM subscriptions WHERE endpoint = ?`, [row.endpoint]);
        }
      });
    });
  });
}

module.exports = { start };
