const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

const defaultData = {
  events: [],
  subscriptions: [],
  currentEventId: 1,
  currentSubId: 1
};

// Cach� en memoria (RAM) para lecturas instant�neas
let cache = null;

function loadCache() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      cache = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } catch (err) {
      console.error('Error leyendo data.json, usando valores por defecto:', err);
      cache = { ...defaultData };
    }
  } else {
    cache = { ...defaultData };
  }
}

// Cargar la base de datos a memoria al iniciar el servidor
loadCache();

// Guardar en disco de forma as�ncrona (no bloquea el hilo principal)
function saveCache() {
  fs.writeFile(DATA_FILE, JSON.stringify(cache, null, 2), (err) => {
    if (err) console.error('Error guardando la base de datos en JSON:', err);
  });
}

module.exports = {
  getEvents: () => cache.events,
  insertEvent: (eventData) => {
    const newEvent = { id: cache.currentEventId++, ...eventData };
    cache.events.push(newEvent);
    saveCache();
    return newEvent;
  },
  updateEvent: (id, eventData) => {
    const index = cache.events.findIndex(e => e.id === parseInt(id));
    if (index !== -1) {
      cache.events[index] = { ...cache.events[index], ...eventData };
      saveCache();
      return cache.events[index];
    }
    return null;
  },
  deleteEvent: (id) => {
    cache.events = cache.events.filter(e => e.id !== parseInt(id));
    saveCache();
  },
  getSubscriptions: () => cache.subscriptions,
  insertSubscription: (endpoint, keys) => {
    if (!cache.subscriptions.some(s => s.endpoint === endpoint)) {
      cache.subscriptions.push({
        id: cache.currentSubId++,
        endpoint,
        keys: JSON.stringify(keys)
      });
      saveCache();
    }
  },
  deleteSubscription: (endpoint) => {
    cache.subscriptions = cache.subscriptions.filter(s => s.endpoint !== endpoint);
    saveCache();
  }
};
