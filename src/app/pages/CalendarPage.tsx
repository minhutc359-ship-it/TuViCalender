import { useMemo, useState, type FormEvent } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { analyzeDay, EVENT_TYPES, findGoodDaysForEvent, isGoodDayForAge } from '../../lib/goodDays';
import { solarToLunar, formatLunarDate, CAN_TO_NGU_HANH } from '../../lib/lunar';
import { vietnamToday, vietnamDateKey } from '../../lib/date';
import { useStoredState } from '../../lib/storage';
import { AstroSymbol } from '../components/astro/AstroSymbol';
import { BaguaWheel } from '../components/astro/AstroWheels';
import { useMonthSwipe } from '../../motion/gestures';
import { traditionalSolarMonth } from '../../lib/solar-terms';
import { Modal } from '../components/Modal';
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
  const [detailOpen, setDetailOpen] = useState(false);
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
  const selectedElement = CAN_TO_NGU_HANH[selected.dayCanChi.split(' ')[0]];
  const topDays = days
    .filter((d) => goodDays.includes(d.date.getDate()))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  function changeMonth(delta: number) {
    setCurrent(new Date(year, month - 1 + delta, 1));
    setSelectedDay(1);
    setEventTitle('');
    setNotice('');
  }
  const swipe = useMonthSwipe(changeMonth);
  function addEvent(e: FormEvent) {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    setEvents([...events, { id: crypto.randomUUID(), date: key, title: eventTitle.trim() }]);
    setEventTitle('');
    setNotice('Đã lưu sự kiện trên thiết bị.');
  }
  return (
    <div className="calendar-page page-enter">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ĐÔNG PHƯƠNG / THUẬN NHỊP THỜI GIAN</span>
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
      <div className="calendar-visual-legend panel" aria-label="Chú giải lịch">
        <span>
          <i className="jade-dot" />
          Hoàng đạo
        </span>
        <span>
          <i className="cinnabar-dot" />
          Hắc đạo · cần cân nhắc
        </span>
        <span>
          <i className="amber-dot" />
          Hắc đạo · thường nhật
        </span>
        <span>
          <AstroSymbol name="star" size={15} />
          Viền vàng: phù hợp bộ lọc
        </span>
        <span>◦ Chấm góc: sự kiện riêng</span>
      </div>
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
          <div className="calendar-grid" {...swipe} style={{ touchAction: 'pan-y' }}>
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
                  aria-label={`Ngày ${day}/${month}/${year}, âm lịch ${analysis.lunar.day}/${analysis.lunar.month}, ${analysis.isHoangDao ? 'hoàng đạo' : 'hắc đạo'}, trực ${analysis.truc}${goodDays.includes(day) ? ', phù hợp bộ lọc' : ''}`}
                  aria-pressed={day === selectedDay}
                  aria-current={isToday ? 'date' : undefined}
                  title={`${analysis.isHoangDao ? 'Hoàng đạo' : 'Hắc đạo'} · Trực ${analysis.truc} · Tú ${analysis.tu.name}`}
                  className={`calendar-day tone-${analysis.isHoangDao ? 'jade' : analysis.badFor.length > 2 ? 'cinnabar' : 'amber'} ${goodDays.includes(day) ? 'good' : ''} ${isToday ? 'today' : ''} ${day === selectedDay ? 'selected' : ''} ${events.some((e) => e.date === dateKey) ? 'has-event' : ''}`}
                  onClick={() => {
                    setSelectedDay(day);
                    setNotice('');
                    setDetailOpen(true);
                  }}
                >
                  <span>{day}</span>
                  <small>
                    {analysis.lunar.day === 1
                      ? `${analysis.lunar.day}/${analysis.lunar.month}`
                      : analysis.lunar.day}
                  </small>
                  <i className="day-tone" aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <div className="calendar-legend">
            <span>Viền bạc: hôm nay</span>
            <span>Dấu ấn: ngày đang chọn</span>
          </div>
          <div className="auspicious-days">
            <div>
              <span className="eyebrow">GỢI Ý TRONG THÁNG</span>
              <h3>{eventType ? EVENT_TYPES[eventType].name : 'Những ngày hoàng đạo'}</h3>
            </div>
            <div className="auspicious-list">
              {topDays.length ? (
                topDays.map((d) => (
                  <button
                    key={d.date.getDate()}
                    onClick={() => {
                      setSelectedDay(d.date.getDate());
                      setDetailOpen(true);
                    }}
                  >
                    <span className="auspicious-seal">CÁT</span>
                    <strong>
                      {String(d.date.getDate()).padStart(2, '0')}
                      <small>/{month}</small>
                    </strong>
                    <span>
                      {d.dayCanChi}
                      <small>Trực {d.truc}</small>
                    </span>
                  </button>
                ))
              ) : (
                <p className="small muted">Chưa có ngày phù hợp bộ lọc này trong tháng.</p>
              )}
            </div>
          </div>
          <details className="method-note">
            <summary>Quy tắc lịch và giới hạn</summary>
            <p>
              Âm lịch được tính theo UTC+7 bằng thuật toán thiên văn hiện có. Can Chi ngày dùng số
              ngày Julian; hoàng đạo tra theo tháng âm và địa chi; giờ hoàng đạo tra theo địa chi
              ngày, đủ 6 khung giờ. Trực theo tháng tiết khí ở 12:00 UTC+7 (xấp xỉ); 28 Tú chưa kiểm
              định và không tham gia điểm ngày. Điểm ngày còn là quy tắc giản lược. Lọc tuổi chỉ xét
              lục xung theo năm âm, chưa phải phép chọn ngày chuyên sâu. Kết quả dùng để tham khảo
              cùng điều kiện thực tế.
            </p>
          </details>
        </section>
        <aside className="day-detail content-panel panel">
          <div className="day-medallion" data-element={selectedElement}>
            <AstroSymbol name={selectedElement} size={34} />
            <strong>{String(selectedDay).padStart(2, '0')}</strong>
            <span>Hành {selectedElement}</span>
          </div>
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
      {detailOpen && (
        <Modal title={`Ngày ${selectedDay}/${month}/${year}`} onClose={() => setDetailOpen(false)}>
          <div className="day-reading-sheet">
            <div className="day-sheet-art">
              <BaguaWheel element={selectedElement} />
              <div className="sheet-date">
                <strong>{selectedDay}</strong>
                <span>
                  THÁNG {month} · {year}
                </span>
              </div>
              <span className="edition-tag">{selected.isHoangDao ? 'HOÀNG ĐẠO' : 'HẮC ĐẠO'}</span>
            </div>
            <div className="day-sheet-copy">
              <span className="eyebrow">ÂM LỊCH {formatLunarDate(selected.lunar)}</span>
              <h3>{selected.dayCanChi}</h3>
              <p>{selected.description}</p>
              <p className="small muted">
                Tiết khí ở 12:00 UTC+7: {traditionalSolarMonth(selectedDay, month, year).term} · mô
                hình Mặt Trời xấp xỉ.
              </p>
              <div className="day-sheet-facts">
                <span>
                  <AstroSymbol name={selectedElement} size={22} />
                  Thiên can hành {selectedElement}
                </span>
                <span>Trực {selected.truc}</span>
                <span>Tú {selected.tu.name}</span>
              </div>
              {selectedHoliday && <p className="gold">{selectedHoliday}</p>}
              <h4>Việc có thể tham khảo</h4>
              <p>{selected.goodFor.join(' · ') || 'Ưu tiên việc thường nhật và nghỉ ngơi.'}</p>
              <h4>Việc cần cân nhắc</h4>
              <p>{selected.badFor.join(' · ') || 'Không có lưu ý riêng theo quy tắc này.'}</p>
              {ageValid && (
                <p className="small">
                  {isGoodDayForAge(selectedDay, month, year, Number(birthYear)).reason}
                </p>
              )}
              <h4>Giờ hoàng đạo · UTC+7</h4>
              <div className="hour-chips">
                {selected.luckyHours.map((h) => (
                  <span key={h}>{h}</span>
                ))}
              </div>
              <p className="small muted">
                Trực theo tháng tiết khí xấp xỉ UTC+7; 28 Tú chưa có mốc tham chiếu được kiểm định.
                Điểm ngày chỉ là quy tắc giải trí. Kết hợp lịch tham khảo với điều kiện thực tế.
              </p>
              <button
                className="button primary"
                onClick={() => {
                  setDetailOpen(false);
                  setTimeout(
                    () => document.querySelector<HTMLInputElement>('.event-form input')?.focus(),
                    0,
                  );
                }}
              >
                Ghi sự kiện cho ngày này
                <Plus size={15} />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
