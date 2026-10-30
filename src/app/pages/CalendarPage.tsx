import { useMemo, useState, type FormEvent } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { analyzeDay, EVENT_TYPES, findGoodDaysForEvent, isGoodDayForAge } from '../../lib/goodDays';
import { solarToLunar, formatLunarDate } from '../../lib/lunar';
import { vietnamToday, vietnamDateKey } from '../../lib/date';
import { useStoredState } from '../../lib/storage';
type EventType = keyof typeof EVENT_TYPES;
interface CalendarEvent {
  id: string;
  date: string;
  title: string;
}
const validEvents = (value: unknown): value is CalendarEvent[] =>
  Array.isArray(value) &&
  value.every(
    (e) =>
      e &&
      typeof e.id === 'string' &&
      typeof e.title === 'string' &&
      typeof e.date === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(e.date),
  );
const solarHolidays: Record<string, string> = {
  '1-1': 'Tết Dương lịch',
  '30-4': 'Ngày Thống nhất',
  '1-5': 'Quốc tế Lao động',
  '2-9': 'Quốc khánh',
};
const lunarHolidays: Record<string, string> = {
  '1-1': 'Tết Nguyên đán',
  '10-3': 'Giỗ Tổ Hùng Vương',
  '15-1': 'Rằm tháng Giêng',
  '15-7': 'Vu Lan',
  '15-8': 'Tết Trung thu',
};
const holiday = (day: number, month: number, lunar: ReturnType<typeof solarToLunar>) =>
  solarHolidays[`${day}-${month}`] ||
  (!lunar.isLeap ? lunarHolidays[`${lunar.day}-${lunar.month}`] : '') ||
  '';
export default function CalendarPage() {
  const today = vietnamToday();
  const [current, setCurrent] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [eventType, setEventType] = useState<EventType | ''>('');
  const [birthYear, setBirthYear] = useState('');
  const [events, setEvents, storageError] = useStoredState<CalendarEvent[]>(
    'astroai.calendar-events.v1',
    [],
    validEvents,
  );
  const [eventTitle, setEventTitle] = useState('');
  const [notice, setNotice] = useState('');
  const year = current.getFullYear(),
    month = current.getMonth() + 1;
  const days = useMemo(
    () =>
      Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) =>
        analyzeDay(i + 1, month, year),
      ),
    [year, month],
  );
  const matches = useMemo(
    () =>
      eventType
        ? findGoodDaysForEvent(year, month, eventType, 31).map((d) => d.date.getDate())
        : days.filter((d) => d.isHoangDao).map((d) => d.date.getDate()),
    [eventType, days, year, month],
  );
  const ageValid =
    /^\d{4}$/.test(birthYear) &&
    Number(birthYear) >= 1900 &&
    Number(birthYear) <= today.getFullYear();
  const goodDays = matches.filter(
    (day) => !ageValid || isGoodDayForAge(day, month, year, Number(birthYear)).isGood,
  );
  const selected = days[selectedDay - 1];
  const key = `${year}-${String(month).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const selectedEvents = events.filter((e) => e.date === key);
  const selectedHoliday = holiday(selectedDay, month, selected.lunar);
  function changeMonth(delta: number) {
    setCurrent(new Date(year, month - 1 + delta, 1));
    setSelectedDay(1);
    setEventTitle('');
    setNotice('');
  }
  function addEvent(e: FormEvent) {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    setEvents([...events, { id: crypto.randomUUID(), date: key, title: eventTitle.trim() }]);
    setEventTitle('');
    setNotice('Đã lưu sự kiện trên thiết bị.');
  }
  return (
    <div className="page-enter">
      <div className="page-heading">
        <div>
          <span className="eyebrow">THUẬN NHỊP THỜI GIAN</span>
          <h1>
            Lịch Việt Nam<span className="gold">.</span>
          </h1>
          <p>Âm dương song hành, lưu những ngày có ý nghĩa với bạn.</p>
        </div>
        <button
          className="button subtle"
          onClick={() => {
            setCurrent(new Date(today.getFullYear(), today.getMonth(), 1));
            setSelectedDay(today.getDate());
          }}
        >
          Về hôm nay
        </button>
      </div>
      <section className="calendar-filters">
        <span className="eyebrow">CHỌN NGÀY THEO VIỆC BẠN DỰ ĐỊNH</span>
        <div className="filter-chips">
          <button
            className={!eventType ? 'active' : ''}
            onClick={() => setEventType('')}
            aria-pressed={!eventType}
          >
            Tất cả
          </button>
          {(Object.keys(EVENT_TYPES) as EventType[]).map((id) => (
            <button
              className={eventType === id ? 'active' : ''}
              aria-pressed={eventType === id}
              key={id}
              onClick={() => setEventType(id)}
            >
              {EVENT_TYPES[id].name}
            </button>
          ))}
        </div>
        <label className="birth-filter" htmlFor="calendar-birth-year">
          Lọc xung tuổi · Năm sinh âm lịch
          <input
            type="number"
            id="calendar-birth-year"
            min="1900"
            max={today.getFullYear()}
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            placeholder="Ví dụ 1995"
          />
          {ageValid && <span>{goodDays.length} ngày phù hợp bộ lọc</span>}
        </label>
      </section>
      <div className="calendar-layout">
        <section className="calendar-panel panel">
          <div className="month-heading">
            <button
              className="icon-button"
              onClick={() => changeMonth(-1)}
              aria-label="Tháng trước"
            >
              <ChevronLeft size={18} />
            </button>
            <h2>
              Tháng {month} <span className="gold">{year}</span>
            </h2>
            <button className="icon-button" onClick={() => changeMonth(1)} aria-label="Tháng sau">
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="calendar-grid">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
              <div className="weekday" key={day}>
                {day}
              </div>
            ))}
            {Array.from({ length: (current.getDay() + 6) % 7 }, (_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {days.map((analysis, i) => {
              const day = i + 1,
                dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                isToday = dateKey === vietnamDateKey();
              return (
                <button
                  key={day}
                  aria-label={`Ngày ${day}/${month}/${year}, âm lịch ${analysis.lunar.day}/${analysis.lunar.month}${goodDays.includes(day) ? ', phù hợp bộ lọc' : ''}`}
                  aria-pressed={day === selectedDay}
                  aria-current={isToday ? 'date' : undefined}
                  className={`calendar-day ${goodDays.includes(day) ? 'good' : ''} ${isToday ? 'today' : ''} ${day === selectedDay ? 'selected' : ''} ${events.some((e) => e.date === dateKey) ? 'has-event' : ''}`}
                  onClick={() => {
                    setSelectedDay(day);
                    setNotice('');
                  }}
                >
                  <span>{day}</span>
                  <small>
                    {analysis.lunar.day === 1
                      ? `${analysis.lunar.day}/${analysis.lunar.month}`
                      : analysis.lunar.day}
                  </small>
                </button>
              );
            })}
          </div>
          <div className="calendar-legend">
            <span>Phù hợp bộ lọc</span>
            <span>Viền tím: hôm nay</span>
            <span>Chấm góc: sự kiện riêng</span>
          </div>
          <details className="method-note">
            <summary>Quy tắc lịch và giới hạn</summary>
            <p>
              Âm lịch được tính theo UTC+7 bằng thuật toán thiên văn hiện có. Can Chi ngày dùng số
              ngày Julian; hoàng đạo tra theo tháng âm và địa chi; giờ hoàng đạo tra theo địa chi
              ngày, đủ 6 khung giờ. Trực dùng tháng âm, chưa hiệu chỉnh tiết khí; 28 Tú và điểm ngày
              còn là quy tắc giản lược. Lọc tuổi chỉ xét lục xung theo năm âm, chưa phải phép chọn
              ngày chuyên sâu. Kết quả dùng để tham khảo cùng điều kiện thực tế.
            </p>
          </details>
        </section>
        <aside className="day-detail content-panel panel">
          <span className="eyebrow">
            {selected.date.toLocaleDateString('vi-VN', { weekday: 'long' })} · {year}
          </span>
          <h2>
            Ngày {selectedDay}, tháng {month}
          </h2>
          <p>
            Âm lịch {formatLunarDate(selected.lunar)} · {selected.dayCanChi}
          </p>
          {selectedHoliday && <span className="holiday-label">✦ {selectedHoliday}</span>}
          <span className="day-type">
            {selected.isHoangDao ? '✦ Hoàng đạo' : 'Hắc đạo'} · Trực {selected.truc}
          </span>
          {ageValid && <p>{isGoodDayForAge(selectedDay, month, year, Number(birthYear)).reason}</p>}
          <h3>GỢI Ý THEO TRỰC THAM KHẢO</h3>
          <p>
            {selected.goodFor.length
              ? selected.goodFor.join(' · ')
              : 'Dành thời gian cho những việc thường ngày.'}
          </p>
          <h3>VIỆC CẦN CÂN NHẮC</h3>
          <p>
            {selected.badFor.length
              ? selected.badFor.join(' · ')
              : 'Không có gợi ý đặc biệt theo quy tắc này.'}
          </p>
          <h3>GIỜ HOÀNG ĐẠO · UTC+7</h3>
          <div className="hour-chips">
            {selected.luckyHours.map((h) => (
              <span key={h}>{h}</span>
            ))}
          </div>
          <h3>SỰ KIỆN CỦA BẠN</h3>
          {selectedEvents.map((e) => (
            <div className="event-item" key={e.id}>
              <span>{e.title}</span>
              <button
                className="icon-button"
                aria-label={`Xóa sự kiện ${e.title}`}
                onClick={() => setEvents(events.filter((x) => x.id !== e.id))}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <form className="event-form" onSubmit={addEvent}>
            <input
              required
              aria-label="Tên sự kiện"
              maxLength={150}
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="Thêm một điều đáng nhớ…"
            />
            <button className="icon-button" aria-label="Lưu sự kiện" type="submit">
              <Plus size={18} />
            </button>
          </form>
          {notice && !storageError && (
            <p className="success small" role="status">
              {notice}
            </p>
          )}
          {storageError && (
            <p className="error-message" role="alert">
              Không thể lưu vào trình duyệt.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
