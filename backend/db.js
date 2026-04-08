const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/calendar';

// Conectar a MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => console.log('?? Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

// Esquemas
const eventSchema = new mongoose.Schema({
  title: String,
  date: String,
  time: String,
  endTime: String,
  color: String,
  reminderMinutes: Number
});

// Transformar _id a id para que siga funcionando igual en el frontend
eventSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

const subscriptionSchema = new mongoose.Schema({
  endpoint: String,
  keys: String
});

const Event = mongoose.model('Event', eventSchema);
const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = {
  getEvents: async () => await Event.find({}),
  insertEvent: async (eventData) => {
    const newEvent = new Event(eventData);
    return await newEvent.save();
  },
  updateEvent: async (id, eventData) => {
    return await Event.findByIdAndUpdate(id, eventData, { new: true });
  },
  deleteEvent: async (id) => {
    await Event.findByIdAndDelete(id);
  },
  getSubscriptions: async () => await Subscription.find({}),
  insertSubscription: async (endpoint, keys) => {
    const exists = await Subscription.findOne({ endpoint });
    if (!exists) {
      await new Subscription({ endpoint, keys: JSON.stringify(keys) }).save();
    }
  },
  deleteSubscription: async (endpoint) => {
    await Subscription.findOneAndDelete({ endpoint });
  }
};
