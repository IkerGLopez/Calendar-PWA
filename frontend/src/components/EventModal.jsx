import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, Bell, Trash2 } from 'lucide-react';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'];

export default function EventModal({ isOpen, onClose, onSave, onDelete, selectedDate, selectedHour, selectedEvent }) { 
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [color, setColor] = useState(COLORS[5]); // Azul por defecto
  const [reminderMinutes, setReminderMinutes] = useState('15');

  // Inicializar forma si es ediciÃ³n o creaciÃ³n
  useEffect(() => {
    if (isOpen) {
      if (selectedEvent) {
        setTitle(selectedEvent.title);
        setTime(selectedEvent.time);
        setEndTime(selectedEvent.endTime);
        setColor(selectedEvent.color);
        setReminderMinutes(selectedEvent.reminderMinutes.toString());
      } else {
        setTitle('');
        if (selectedHour !== null && selectedHour >= 0 && selectedHour <= 23) {
          setTime(`${selectedHour.toString().padStart(2, '0')}:00`);
          setEndTime(`${(selectedHour + 1 > 23 ? 23 : selectedHour + 1).toString().padStart(2, '0')}:00`);
        } else {
          setTime('10:00');
          setEndTime('11:00');
        }
        setColor(COLORS[5]);
        setReminderMinutes('15');
      }
    }
  }, [isOpen, selectedEvent, selectedHour]);

  // Ajustar endTime auto si se cambia start time
  useEffect(() => {
    if (time) {
      const [h, m] = time.split(':').map(Number);
      let endH = h + 1;
      let endM = m;
      if (endH >= 24) {
        endH = 23;
        endM = 59;
      }
      setEndTime(`${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`);
    }
  }, [time]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    onSave({
      id: selectedEvent ? selectedEvent.id : undefined,
      title,
      date: selectedDate, // YYYY-MM-DD
      time,
      endTime,
      color,
      reminderMinutes: parseInt(reminderMinutes, 10),
    });

    onClose();
  };

  const handleDelete = () => {
    if (selectedEvent && window.confirm('¿Seguro que quieres borrar este evento?')) {
      onDelete(selectedEvent.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm p-4 sm:p-0">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom pb-safe">
        
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {selectedEvent ? 'Editar Evento' : 'Nuevo Evento'}
          </h2> 
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-5">
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Título</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Reunión, Cumpleaños..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required 
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <Clock size={14} /> Inicio
              </label>
              <input 
                type="time" 
                value={time} 
                onChange={(e) => setTime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition"
                required 
              />
            </div>
            <div className="flex-1 space-y-1">
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <Clock size={14} /> Fin
              </label>
              <input 
                type="time" 
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition"
                required 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Color Representativo</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition focus:outline-none`}
                  style={{ backgroundColor: c, border: color === c ? '2px solid black' : '2px solid transparent' }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Bell size={14} /> Avisarme antes de
            </label>
            <select 
              value={reminderMinutes} 
              onChange={(e) => setReminderMinutes(e.target.value)}
              className="w-full border border-gray-200 bg-white rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="0">En el momento (0 min)</option>
              <option value="5">5 minutos antes</option>
              <option value="15">15 minutos antes</option>
              <option value="30">30 minutos antes</option>
              <option value="60">1 hora antes</option>
              <option value="1440">1 día antes</option>
            </select>
          </div>

          <div className="pt-2 flex gap-3">
            {selectedEvent && (
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 flex items-center justify-center px-4 rounded-xl shadow-sm transition active:scale-95"
                aria-label="Borrar Evento"
              >
                <Trash2 size={20} />
              </button>
            )}
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl shadow-sm transition active:scale-95"
            >
              Guardar Evento
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
