import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Star, Info } from 'lucide-react';
import { getGoodDaysInMonth, analyzeDay, EVENT_TYPES, findGoodDaysForEvent } from '../../lib/goodDays';
import { solarToLunar, formatLunarDate } from '../../lib/lunar';

type EventType = keyof typeof EVENT_TYPES | null;

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventType>(null);

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const { firstDay, daysInMonth } = getDaysInMonth(currentMonth);
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;

  // Calculate good days for current month
  const goodDays = useMemo(() => {
    if (selectedEvent) {
      const results = findGoodDaysForEvent(year, month, selectedEvent, 31);
      return results.map(r => r.date.getDate());
    } else {
      return getGoodDaysInMonth(year, month);
    }
  }, [year, month, selectedEvent]);

  // Get analysis for selected day
  const dayAnalysis = selectedDay
    ? analyzeDay(selectedDay, month, year)
    : null;

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    setSelectedDay(null);
  };

  const today = new Date().getDate();
  const isCurrentMonth =
    currentMonth.getMonth() === new Date().getMonth() &&
    currentMonth.getFullYear() === new Date().getFullYear();

  const handleEventSelect = (eventKey: EventType) => {
    setSelectedEvent(eventKey === selectedEvent ? null : eventKey);
    setSelectedDay(null);
  };

  return (
    <div className="pb-20 px-4 pt-8 max-w-lg mx-auto relative z-10">
      <h1 className="text-2xl mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Lịch ngày đẹp
      </h1>

      {/* Month Navigation */}
      <div className="bg-purple-900/30 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-purple-500/20">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={previousMonth}
            className="p-2 rounded-lg bg-purple-800/30 hover:bg-purple-800/50 transition-colors text-purple-200"
          >
            <ChevronLeft size={20} />
          </button>

          <h2 className="text-lg text-purple-100">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>

          <button
            onClick={nextMonth}
            className="p-2 rounded-lg bg-purple-800/30 hover:bg-purple-800/50 transition-colors text-purple-200"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
            <div key={day} className="text-center text-purple-300/70 text-xs py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {[...Array(firstDay)].map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const isGoodDay = goodDays.includes(day);
            const isToday = isCurrentMonth && day === today;
            const isSelected = day === selectedDay;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-lg relative transition-all
                  ${isToday ? 'bg-purple-600/50 border-2 border-purple-400' : ''}
                  ${isGoodDay && !isToday ? 'bg-green-900/30 border border-green-500/30 hover:bg-green-900/50' : ''}
                  ${!isGoodDay && !isToday ? 'bg-purple-900/20 hover:bg-purple-900/30' : ''}
                  ${isSelected ? 'ring-2 ring-purple-300' : ''}
                `}
              >
                <span className={`text-sm ${isGoodDay || isToday ? 'text-purple-100' : 'text-purple-300/70'}`}>
                  {day}
                </span>
                {isGoodDay && (
                  <Star size={10} className="text-yellow-400 fill-yellow-400 absolute bottom-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Details */}
      {dayAnalysis && (
        <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-purple-500/20">
          <div className="flex items-start gap-3 mb-4">
            <Info size={20} className="text-purple-300 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg text-purple-100 mb-1">
                Ngày {selectedDay} - {formatLunarDate(dayAnalysis.lunar)}
              </h3>
              <p className="text-purple-300/80 text-sm mb-3">
                {dayAnalysis.description}
              </p>

              <div className="space-y-2 mb-4">
                <div>
                  <p className="text-purple-200 text-sm mb-1">✅ Nên làm:</p>
                  <div className="flex flex-wrap gap-2">
                    {dayAnalysis.goodFor.length > 0 ? (
                      dayAnalysis.goodFor.map((activity) => (
                        <span
                          key={activity}
                          className="bg-green-900/30 border border-green-500/30 rounded-lg px-2 py-1 text-xs text-green-200"
                        >
                          {activity}
                        </span>
                      ))
                    ) : (
                      <span className="text-purple-300/50 text-xs">Không có việc đặc biệt</span>
                    )}
                  </div>
                </div>

                {dayAnalysis.badFor.length > 0 && (
                  <div>
                    <p className="text-purple-200 text-sm mb-1">❌ Nên tránh:</p>
                    <div className="flex flex-wrap gap-2">
                      {dayAnalysis.badFor.map((activity) => (
                        <span
                          key={activity}
                          className="bg-red-900/30 border border-red-500/30 rounded-lg px-2 py-1 text-xs text-red-200"
                        >
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <p className="text-purple-200 text-sm mb-1">🕐 Giờ tốt:</p>
                <p className="text-purple-300/80 text-xs">
                  {dayAnalysis.luckyHours.join(' • ')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-900/30 rounded-lg px-3 py-2">
            <p className="text-purple-300/70 text-xs">
              Điểm số: <span className="text-purple-100">{dayAnalysis.score}/100</span>
              {' • '}
              Sao: <span className="text-purple-100">{dayAnalysis.tu.name}</span>
            </p>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-purple-900/30 backdrop-blur-sm rounded-xl p-4 mb-6 border border-purple-500/20 space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-green-900/30 border border-green-500/30 flex items-center justify-center">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
          </div>
          <span className="text-purple-100 text-sm">
            Ngày hoàng đạo {selectedEvent && `(${EVENT_TYPES[selectedEvent].name})`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-purple-600/50 border-2 border-purple-400" />
          <span className="text-purple-100 text-sm">Hôm nay</span>
        </div>
      </div>

      {/* Event Type Selector */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20">
        <h3 className="text-lg mb-4 text-purple-200">Lọc theo sự kiện</h3>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(EVENT_TYPES) as EventType[]).map((eventKey) => {
            if (!eventKey) return null;
            const event = EVENT_TYPES[eventKey];
            const isSelected = selectedEvent === eventKey;

            return (
              <button
                key={eventKey}
                onClick={() => handleEventSelect(eventKey)}
                className={`
                  rounded-lg py-3 px-4 text-sm border transition-all
                  ${isSelected
                    ? 'bg-purple-600/50 border-purple-400 text-purple-100'
                    : 'bg-purple-800/30 hover:bg-purple-800/50 border-purple-500/20 text-purple-100'
                  }
                `}
              >
                {event.name}
              </button>
            );
          })}
        </div>

        {selectedEvent && (
          <button
            onClick={() => setSelectedEvent(null)}
            className="mt-3 w-full bg-purple-900/30 hover:bg-purple-900/50 transition-colors rounded-lg py-2 text-purple-300 text-sm border border-purple-500/20"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}
