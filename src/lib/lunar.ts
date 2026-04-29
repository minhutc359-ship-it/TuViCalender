/**
 * Vietnamese Lunar Calendar Utilities
 * Based on: https://www.informatik.uni-leipzig.de/~duc/amlich/
 */

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  isLeap: boolean;
}

// 10 Thiên Can (Heavenly Stems)
export const THIEN_CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];

// 12 Địa Chi (Earthly Branches)
export const DIA_CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tị', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

// 12 Con Giáp (Zodiac Animals)
export const CON_GIAP = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Rắn', 'Ngựa', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];

// Ngũ Hành (Five Elements)
export const NGU_HANH = ['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ'];

// Mapping Thiên Can to Ngũ Hành
export const CAN_TO_NGU_HANH: { [key: string]: string } = {
  'Giáp': 'Mộc',
  'Ất': 'Mộc',
  'Bính': 'Hỏa',
  'Đinh': 'Hỏa',
  'Mậu': 'Thổ',
  'Kỷ': 'Thổ',
  'Canh': 'Kim',
  'Tân': 'Kim',
  'Nhâm': 'Thủy',
  'Quý': 'Thủy'
};

/**
 * Convert Julian Day Number to Date
 */
function jdToDate(jd: number): { day: number; month: number; year: number } {
  const a = jd + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((b * 146097) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);

  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = b * 100 + d - 4800 + Math.floor(m / 10);

  return { day, month, year };
}

/**
 * Convert Date to Julian Day Number
 */
function dateToJD(day: number, month: number, year: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  let jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  if (jd < 2299161) {
    jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }

  return jd;
}

/**
 * Get new moon day
 */
function getNewMoonDay(k: number, timeZone: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;

  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);

  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;

  let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 = C1 - 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(dr * 2 * Mpr);
  C1 = C1 - 0.0004 * Math.sin(dr * 3 * Mpr);
  C1 = C1 + 0.0104 * Math.sin(dr * 2 * F) - 0.0051 * Math.sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));

  let deltat;
  if (T < -11) {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }

  const JdNew = Jd1 + C1 - deltat;
  return Math.floor(JdNew + 0.5 + timeZone / 24.0);
}

/**
 * Get sun longitude
 */
function getSunLongitude(jdn: number, timeZone: number): number {
  const T = (jdn - 2451545.5 - timeZone / 24.0) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;

  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;

  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);

  let L = L0 + DL;
  L = L * dr;
  L = L - Math.PI * 2 * Math.floor(L / (Math.PI * 2));

  return Math.floor((L / Math.PI) * 6);
}

/**
 * Get lunar month 11
 */
function getLunarMonth11(yy: number, timeZone: number): number {
  const off = dateToJD(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);

  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }

  return nm;
}

/**
 * Get leap month offset
 */
function getLeapMonthOffset(a11: number, timeZone: number): number {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);

  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);

  return i - 1;
}

/**
 * Convert Solar Date to Lunar Date
 */
export function solarToLunar(day: number, month: number, year: number): LunarDate {
  const timeZone = 7; // UTC+7 for Vietnam
  const dayNumber = dateToJD(day, month, year);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);

  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }

  let a11 = getLunarMonth11(year, timeZone);
  let b11 = a11;

  if (a11 >= monthStart) {
    const lunarYear = year;
    a11 = getLunarMonth11(year - 1, timeZone);
  } else {
    const lunarYear = year + 1;
    b11 = getLunarMonth11(year + 1, timeZone);
  }

  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let lunarLeap = false;
  let lunarMonth = diff + 11;

  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        lunarLeap = true;
      }
    }
  }

  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    const lunarYear = year - 1;
    return { day: lunarDay, month: lunarMonth, year: lunarYear, isLeap: lunarLeap };
  }

  return { day: lunarDay, month: lunarMonth, year, isLeap: lunarLeap };
}

/**
 * Get Can Chi for a given year
 */
export function getCanChi(year: number): string {
  const can = THIEN_CAN[(year + 6) % 10];
  const chi = DIA_CHI[(year + 8) % 12];
  return `${can} ${chi}`;
}

/**
 * Get Ngũ Hành for a given year
 */
export function getNguHanh(year: number): string {
  const can = THIEN_CAN[(year + 6) % 10];
  return CAN_TO_NGU_HANH[can];
}

/**
 * Get Can Chi for day
 */
export function getDayCanChi(jd: number): string {
  const can = THIEN_CAN[(jd + 9) % 10];
  const chi = DIA_CHI[(jd + 1) % 12];
  return `${can} ${chi}`;
}

/**
 * Get current lunar date
 */
export function getCurrentLunarDate(): LunarDate {
  const now = new Date();
  return solarToLunar(now.getDate(), now.getMonth() + 1, now.getFullYear());
}

/**
 * Format lunar date to string
 */
export function formatLunarDate(lunar: LunarDate): string {
  return `${lunar.day}/${lunar.month}${lunar.isLeap ? ' (nhuận)' : ''}/${lunar.year}`;
}

/**
 * Get zodiac animal for year
 */
export function getZodiacAnimal(year: number): string {
  return CON_GIAP[(year + 8) % 12];
}