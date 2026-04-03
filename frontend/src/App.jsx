import React, { useState, useEffect } from 'react';
import CalendarGrid from './components/CalendarGrid';
import EventModal from './components/EventModal';
import Onboarding from './components/Onboarding';
import { Bell } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedHour, setSelectedHour] = useState(null);
  const [pushSupported, setPushSupported] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setPushSupported(true);
    }
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/events`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const handleSaveEvent = async (eventData) => {
    try {
      const isEdit = !!eventData.id;
      const url = isEdit ? `${API_URL}/events/${eventData.id}` : `${API_URL}/events`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      if (res.ok) {
        fetchEvents();
      }
    } catch (err) {
      console.error('Error saving event:', err);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await fetch(`${API_URL}/events/${id}`, { method: 'DELETE' });
      fetchEvents();
      setModalOpen(false);
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  };

  const handleDayClick = (dateStr, hour = null) => {
    setSelectedDate(dateStr);
    setSelectedEvent(null);
    setSelectedHour(hour);
    setModalOpen(true);
  };

  const handleEventClick = (event) => {
    setSelectedDate(event.date);
    setSelectedHour(null);
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const requestPushPermission = async () => {
    if (pushSupported) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        try {
          const swReg = await navigator.serviceWorker.ready;
          // Pedir llave pública al backend
          const vapidRes = await fetch(`${API_URL}/vapidPublicKey`);
          const vapidData = await vapidRes.json();
          const pubKey = vapidData.publicKey;
          
          // Helper para decodificar base64 a Uint8Array
          function urlBase64ToUint8Array(base64String) {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
            const rawData = window.atob(base64);
            const outputArray = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; ++i) {
              outputArray[i] = rawData.charCodeAt(i);
            }
            return outputArray;
          }

          // Suscribirse
          const subscription = await swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(pubKey)
          });

          // Enviar la suscripción al Backend
          await fetch(`${API_URL}/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
          });
          
          alert('¡Suscrito con éxito a las notificaciones Push!');
        } catch (err) {
          console.error('Error al suscribir', err);
          alert('Ocurrió un error al intentar suscribir este dispositivo a Notificaciones');
        }
      } else {
        alert('Permiso denegado.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-safe px-safe pb-safe">
      <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-30 pt-safe">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">C</div>
            <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">Calendar PWA</h1>
          </div>
          {pushSupported && (
            <button onClick={requestPushPermission} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full text-sm font-medium transition">
              <Bell size={16} />
              <span className="hidden sm:inline">Activar Alertas</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 sm:pb-12 mb-16 sm:mb-0">
        <CalendarGrid currentDate={currentDate} setCurrentDate={setCurrentDate} events={events} onDayClick={handleDayClick} onEventClick={handleEventClick} />
      </main>

      <EventModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveEvent} onDelete={handleDeleteEvent} selectedDate={selectedDate} selectedHour={selectedHour} selectedEvent={selectedEvent} />
      <Onboarding />
    </div>
  );
}

export default App;
