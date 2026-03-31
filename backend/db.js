// db.js (Base de datos en memoria para el Prototipo)

let events = [];
let subscriptions = [];
let currentEventId = 1;
let currentSubId = 1;

module.exports = {
  // --- Eventos ---
  getEvents: () => {
    return events;
  },
  insertEvent: (eventData) => {
    const newEvent = { id: currentEventId++, ...eventData };
    events.push(newEvent);
    return newEvent;
  },
  deleteEvent: (id) => {
    events = events.filter(e => e.id !== parseInt(id));
  },

  // --- Suscripciones ---
  getSubscriptions: () => {
    return subscriptions;
  },
  insertSubscription: (endpoint, keys) => {
    // Evitar duplicados por endpoint
    if (!subscriptions.some(s => s.endpoint === endpoint)) {
      subscriptions.push({
        id: currentSubId++,
        endpoint,
        keys: JSON.stringify(keys)
      });
    }
  },
  deleteSubscription: (endpoint) => {
    subscriptions = subscriptions.filter(s => s.endpoint !== endpoint);
  }
};
