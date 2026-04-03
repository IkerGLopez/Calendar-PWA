import React, { useState } from 'react';
import { 
  format, addMonths, subMonths, addWeeks, subWeeks, startOfWeek, endOfWeek,
  startOfMonth, endOfMonth, isSameMonth, isSameDay, addDays, parseISO,
  isBefore, startOfToday
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, CalendarDays, List } from 'lucide-react';

export default function CalendarGrid({ currentDate, setCurrentDate, events, onDayClick, onEventClick }) {
  const [viewMode, setViewMode] = useState('month');

  const nextPeriod = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else setCurrentDate(addWeeks(currentDate, 1));
  };

  const prevPeriod = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else setCurrentDate(subWeeks(currentDate, 1));
  };

  // Convert "HH:MM" to minutes for absolute positioning
  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h * 60) + (m || 0);
  };

  // Generar vista mensual
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const cloneDay = day;
        const dayEvents = events.filter(e => e.date === format(cloneDay, 'yyyy-MM-dd'));

        const isPastOrEdge = !isSameMonth(day, monthStart) || isBefore(day, startOfToday());

        days.push(
          <div
            key={cloneDay.toString()}
            onClick={() => {
              if (!isPastOrEdge) onDayClick(format(cloneDay, 'yyyy-MM-dd'));
            }}
            className={`min-h-[80px] p-1 border-b border-r transition-colors ${
              !isSameMonth(day, monthStart)
                ? "bg-gray-50/50 text-gray-400 cursor-not-allowed"
                : isBefore(day, startOfToday())
                ? "bg-gray-200/60 text-gray-400 cursor-not-allowed"
                : isSameDay(day, new Date())
                ? "bg-blue-50/30 font-semibold cursor-pointer hover:bg-blue-50/50"
                : "bg-white text-gray-700 cursor-pointer hover:bg-blue-50/50"
            }`}
          >
            <div className="flex justify-between items-start">
              <span className={`flex items-center justify-center w-7 h-7 rounded-full text-sm ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white' : ''}`}>
                {formattedDate}
              </span>
            </div>
            <div className="mt-1 space-y-1.5 flex flex-col items-center sm:items-stretch overflow-hidden">
              {dayEvents.map(evt => (
                <div 
                  key={evt.id} 
                  className="w-2 h-2 rounded-full sm:w-full sm:h-auto sm:rounded sm:px-1.5 sm:py-0.5 text-xs text-white truncate shadow-sm relative group"
                  style={{ backgroundColor: evt.color }}
                  title={`${evt.time} - ${evt.endTime || evt.time} : ${evt.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(evt);
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
      rows.push(<div key={day.toString()} className="grid grid-cols-7 w-full border-l border-t">{days}</div>);
      days = [];
    }
    return rows;
  };

  // Generar vista semanal por horas
  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(startDate, i));
    }
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="flex flex-col h-[600px] overflow-y-auto relative bg-white">
        <div className="flex border-b border-gray-100 bg-gray-50/90 sticky top-0 z-20">
          <div className="w-16 flex-shrink-0 border-r border-gray-100"></div>
          {days.map((day) => (
            <div key={day.toString()} className={`flex-1 min-w-[50px] text-center py-2 border-r border-gray-100 font-medium text-xs sm:text-sm ${isSameDay(day, new Date()) ? 'text-blue-600 bg-blue-50/50' : 'text-gray-600'}`}>
              <div className="uppercase text-[10px] text-gray-400">{format(day, 'EEE', { locale: es })}</div>
              <div className={`mt-0.5 mx-auto w-6 h-6 flex items-center justify-center rounded-full ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        <div className="flex relative">
          <div className="w-16 flex-shrink-0 border-r border-gray-100 relative bg-white z-10">
            {hours.map((hour) => (
              <div key={hour} className="h-16 border-b border-gray-100/50 text-[10px] text-gray-400 text-right pr-2 pt-1 font-medium select-none">
                {`${hour.toString().padStart(2, '0')}:00`}
              </div>
            ))}
          </div>

          <div className="flex flex-1 relative bg-white">
            {hours.map((hour) => (
              <div key={`grid-${hour}`} className="absolute w-full h-16 border-b border-gray-100/50 pointer-events-none" style={{ top: hour * 64 }}></div>
            ))}

            {days.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const dayEvents = events.filter(e => e.date === dayStr);
              const isPastDay = isBefore(day, startOfToday());

              return (
                <div key={day.toString()}
                  className={`flex-1 border-r border-gray-100 relative min-w-[50px] ${isPastDay ? 'bg-gray-200/50 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-50/10 transition-colors'}`}
                  onClick={(e) => {
                    if (isPastDay) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickY = e.clientY - rect.top;
                    const clickedHour = Math.floor(clickY / 64);
                    onDayClick(dayStr, clickedHour);
                  }}
                >
                  <div className="absolute inset-0 h-[1536px]">
                    {dayEvents.map(evt => {
                      const startMins = timeToMinutes(evt.time);
                      const endMins = evt.endTime ? timeToMinutes(evt.endTime) : (startMins + 60);
                      
                      const top = (startMins / 60) * 64;
                      let height = ((endMins - startMins) / 60) * 64;
                      if (height <= 0) height = 64; // Si la hora de fin es menor o igual al inicio mínimo 1 hora  (evita heights negativos)
                      if (height < 20) height = 32; // Mínimo 30 mins visuales

                      return (
                        <div 
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(evt);
                          }}
                          className="absolute left-1 right-1 rounded-md px-1.5 py-1 text-xs text-white shadow-sm overflow-hidden cursor-pointer hover:opacity-90 transition-opacity flex flex-col justify-start"
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                            backgroundColor: evt.color,
                            zIndex: 10
                          }}
                          title={`${evt.time} - ${evt.endTime} : ${evt.title}`}
                        >
                          <div className="font-semibold truncate">{evt.title}</div>
                          {height > 40 && <div className="text-[10px] opacity-90 truncate">{evt.time} - {evt.endTime}</div>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 sm:px-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800 capitalize w-full text-center sm:text-left">
          {format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : "'Semana del' d 'de' MMMM yyyy", { locale: es })}
        </h2>
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setViewMode('month')} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition ${viewMode === 'month' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <CalendarDays size={16} /> <span className="hidden sm:inline">Mes</span>
            </button>
            <button onClick={() => setViewMode('week')} className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition ${viewMode === 'week' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              <List size={16} /> <span className="hidden sm:inline">Semana</span>
            </button>
          </div>
          <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
          <div className="flex space-x-2">
            <button onClick={prevPeriod} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition"><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 text-sm font-medium rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition">Hoy</button>
            <button onClick={nextPeriod} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>
      
      {viewMode === 'month' && (
        <div className="grid grid-cols-7 border-t border-b border-gray-100 bg-gray-50/50">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
            <div key={d} className="py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">{d}</div>
          ))}
        </div>
      )}

      <div className="flex-1 w-full bg-gray-50/30">
        {viewMode === 'month' ? renderMonthView() : renderWeekView()}
      </div>

      <div className="fixed bottom-6 right-6 sm:hidden z-40">
        <button
          onClick={() => {
            const dateToUse = isBefore(currentDate, startOfToday()) ? format(new Date(), 'yyyy-MM-dd') : format(currentDate, 'yyyy-MM-dd');
            onDayClick(dateToUse);
          }}
          className="w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-blue-700 active:scale-95 transition-transform"
        >
          <Plus size={28} />
        </button>
      </div>
    </div>
  );
}
