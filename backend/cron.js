const cron = require('node-cron');
const db = require('./db');
const webpush = require('web-push');

const start = () => {
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const events = await db.getEvents();

    for (const event of events) {
      const eventDateTime = new Date(`${event.date}T${event.time}:00`);
      const timeDiffMs = eventDateTime.getTime() - now.getTime();
      const timeDiffMinutes = Math.floor(timeDiffMs / 60000);

      if (timeDiffMinutes === parseInt(event.reminderMinutes)) {
         await sendPushNotifications(event);
      }
    }
  });
};

async function sendPushNotifications(event) {
  const subs = await db.getSubscriptions();
  const payload = JSON.stringify({
    title: `Calendario: ${event.title}`,
    body: `Faltan ${event.reminderMinutes} minutos. El evento empieza a las ${event.time}.`,
    icon: '/icon-180x180.png'
  });

  for (const row of subs) {
    const pushSubscription = {
      endpoint: row.endpoint,
      keys: JSON.parse(row.keys)
    };

    try {
      await webpush.sendNotification(pushSubscription, payload);
    } catch (err) {
      console.error('Error al enviar Push:', err);
      if (err.statusCode === 410) {
        await db.deleteSubscription(row.endpoint);
      }
    }
  }
}

module.exports = { start };
