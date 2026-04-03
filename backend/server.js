require('dotenv').config();
const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const db = require('./db');
const cronJob = require('./cron');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Endpoint 'keep-awake' para evitar que servidores gratuitos duerman
app.get('/api/ping', (req, res) => {
  res.send('pong');
});

// Configurar Web Push VAPID Keys
webpush.setVapidDetails(
  'mailto:soporte@tucalendariopwa.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// === RUTAS API ===

// 1. Obtener llave pública VAPID para el Frontend
app.get('/api/vapidPublicKey', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// 2. Suscribir un dispositivo
app.post('/api/subscribe', (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Suscripción inválida' });
  }
  db.insertSubscription(subscription.endpoint, subscription.keys);
  res.status(201).json({ message: 'Suscripción guardada con éxito' });
});

// 3. Obtener eventos
app.get('/api/events', (req, res) => {
  res.json(db.getEvents());
});

// 4. Crear un evento
app.post('/api/events', (req, res) => {
  const { title, date, time, color, reminderMinutes } = req.body;
  if (!title || !date || !time) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  const newEvent = db.insertEvent({ title, date, time, color, reminderMinutes: reminderMinutes || 0 });
  res.status(201).json({ id: newEvent.id, message: 'Evento creado' });
});

// 5. Eliminar un evento
app.delete('/api/events/:id', (req, res) => {
  db.deleteEvent(req.params.id);
  res.json({ message: 'Evento eliminado' });
});

// Iniciar procesos
cronJob.start();

app.listen(PORT, () => {
  console.log(`🚀 Backend corriendo en http://localhost:${PORT}`);
});
