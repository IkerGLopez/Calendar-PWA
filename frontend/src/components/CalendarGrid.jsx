import React from 'react';
import { 
  format, addMonths, subMonths, startOfWeek, endOfWeek, startOfMonth, 
  endOfMonth, isSameMonth, isSameDay, addDays 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function CalendarGrid({ currentDate, setCurrentDate, events, onDayClick, onDeleteEvent }) {
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Generar cuadrícula de días
  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Lunes comienza
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        
        // Obtener eventos del día
        const dayEvents = events.filter(e => e.date === format(cloneDay, 'yyyy-MM-dd'));

        days.push(
          <div
            key={day}
            onClick={() => onDayClick(format(cloneDay, 'yyyy-MM-dd'))}
            className={`min-h-[80px] p-1 border-b border-r cursor-pointer transition-colors hover:bg-blue-50/50 ${
              !isSameMonth(day, monthStart)
                ? "bg-gray-50/50 text-gray-400"
                : isSameDay(day, new Date())
                ? "bg-blue-50/30 font-semibold"
                : "bg-white text-gray-700"
            }`}
          >
            <div className="flex justify-between items-start">
              <span className={`flex items-center justify-center w-7 h-7 rounded-full text-sm ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white' : ''}`}>
                {formattedDate}
              </span>
            </div>
            
            {/* Lista de Eventos */}
            <div className="mt-1 space-y-1.5 flex flex-col items-center sm:items-stretch overflow-hidden">
              {dayEvents.map(evt => (
                <div 
                  key={evt.id} 
                  className="w-2 h-2 rounded-full sm:w-full sm:h-auto sm:rounded sm:px-1.5 sm:py-0.5 text-xs text-white truncate shadow-sm relative group"
                  style={{ backgroundColor: evt.color }}
                  title={`${evt.title} - ${evt.time}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if(window.confirm(`¿Eliminar evento: ${evt.title}?`)) {
                      onDeleteEvent(evt.id);
                    }
                  }}
                >
                  <span className="hidden sm:inline">{evt.time} {evt.title}</span>
                </div>
              ))}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div key={day} className="grid grid-cols-7 w-full border-l border-t">
          {days}
        </div>
      );
      days = [];
    }
    return rows;
  };

  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <h2 className="text-xl font-bold text-gray-800 capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex space-x-2">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm font-medium rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition">
            Hoy
          </button>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      
      {/* Días de la semana */}
      <div className="grid grid-cols-7 border-t border-b border-gray-100 bg-gray-50/50">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1">
        {renderCells()}
      </div>

      {/* Floating Action Button (Mobile Only) */}
      <div className="fixed bottom-6 right-6 sm:hidden z-40">
        <button 
          onClick={() => onDayClick(format(currentDate, 'yyyy-MM-dd'))}
          className="w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 active:scale-95 transition-transform"
        >
          <Plus size={28} />
        </button>
      </div>
    </div>
  );
}
