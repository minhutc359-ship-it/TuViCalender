import { dateToJD, THIEN_CAN, DIA_CHI } from './lunar';
export const SOLAR_TERMS = [
  'Xuân phân',
  'Thanh minh',
  'Cốc vũ',
  'Lập hạ',
  'Tiểu mãn',
  'Mang chủng',
  'Hạ chí',
  'Tiểu thử',
  'Đại thử',
  'Lập thu',
  'Xử thử',
  'Bạch lộ',
  'Thu phân',
  'Hàn lộ',
  'Sương giáng',
  'Lập đông',
  'Tiểu tuyết',
  'Đại tuyết',
  'Đông chí',
  'Tiểu hàn',
  'Đại hàn',
  'Lập xuân',
  'Vũ thủy',
  'Kinh trập',
];
const mod = (n: number, b: number) => ((n % b) + b) % b;
/** Same truncated solar model used by the lunar engine; degrees, approximate, not ephemeris. */
export function solarLongitude(jd: number) {
  const t = (jd - 2451545) / 36525,
    t2 = t * t,
    r = Math.PI / 180;
  const mean = 357.5291 + 35999.0503 * t - 0.0001559 * t2 - 0.00000048 * t * t2;
  const base = 280.46645 + 36000.76983 * t + 0.0003032 * t2;
  return mod(
    base +
      (1.9146 - 0.004817 * t - 0.000014 * t2) * Math.sin(mean * r) +
      (0.019993 - 0.000101 * t) * Math.sin(2 * mean * r) +
      0.00029 * Math.sin(3 * mean * r),
    360,
  );
}
export function traditionalSolarMonth(
  day: number,
  month: number,
  year: number,
  hour = 12,
  minute = 0,
) {
  const jd = dateToJD(day, month, year) - 0.5 + (hour + minute / 60 - 7) / 24;
  const degrees = solarLongitude(jd);
  const index = Math.floor(mod(degrees - 315, 360) / 30);
  return {
    index,
    branch: (index + 2) % 12,
    term: SOLAR_TERMS[Math.floor(degrees / 15)],
    longitude: degrees,
  };
}
export function approximateFourPillars(
  day: number,
  month: number,
  year: number,
  hour: number,
  minute = 0,
) {
  const checkedDate = new Date(Date.UTC(year, month - 1, day));
  if (
    year < 1900 ||
    year > 2100 ||
    checkedDate.getUTCFullYear() !== year ||
    checkedDate.getUTCMonth() !== month - 1 ||
    checkedDate.getUTCDate() !== day
  )
    throw new Error('Ngày sinh chưa hợp lệ.');
  if (
    ![day, month, year, hour, minute].every(Number.isFinite) ||
    hour < 0 ||
    hour >= 24 ||
    minute < 0 ||
    minute >= 60
  )
    throw new Error('Giờ sinh chưa hợp lệ.');
  const solar = traditionalSolarMonth(day, month, year, hour, minute);
  const solarYear = year - (month === 1 || (month === 2 && solar.longitude < 315) ? 1 : 0);
  const yearStem = mod(solarYear - 4, 10),
    yearBranch = mod(solarYear - 4, 12);
  const dayStem = mod(dateToJD(day, month, year) + 9, 10),
    dayBranch = mod(dateToJD(day, month, year) + 1, 12);
  const hourBranch = Math.floor((hour + 1) / 2) % 12;
  const pillar = (can: number, chi: number) => ({ can: THIEN_CAN[can], chi: DIA_CHI[chi] });
  return {
    yearPillar: pillar(yearStem, yearBranch),
    monthPillar: pillar((yearStem * 2 + 2 + solar.index) % 10, solar.branch),
    dayPillar: pillar(dayStem, dayBranch),
    hourPillar: pillar((dayStem * 2 + hourBranch) % 10, hourBranch),
  };
}
