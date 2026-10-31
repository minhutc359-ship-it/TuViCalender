/**
 * Good Days Calculator - Vietnamese Feng Shui Calendar
 * Tính toán ngày tốt xấu theo phong thủy Việt Nam
 */

import { solarToLunar, dateToJD, getDayCanChi, type LunarDate, DIA_CHI } from './lunar';
import { traditionalSolarMonth } from './solar-terms';

// 12 Trực (12 Day Officers)
export const TRUC = [
  'Kiến', // +++  Very good
  'Trừ', // +    Good
  'Mãn', // ++   Very good
  'Bình', // +    Average
  'Định', // +++  Very good
  'Chấp', // +    Good
  'Phá', // ---  Very bad (Hắc Đạo)
  'Nguy', // --   Bad (Hắc Đạo)
  'Thành', // +++  Very good
  'Thâu', // +    Good
  'Khai', // ++   Very good
  'Bế', // --   Bad (Hắc Đạo)
];

// Hoàng Đạo days (good days)
export const HOANG_DAO = ['Kiến', 'Trừ', 'Mãn', 'Định', 'Chấp', 'Thành', 'Khai'];

// Hắc Đạo days (bad days)
export const HAC_DAO = ['Phá', 'Nguy', 'Bế'];

// 28 Tú (Lunar Mansions)
export const TU_28 = [
  // Đông Phương Thanh Long (East - Azure Dragon)
  { name: 'Giác', good: true, color: 'Xanh' },
  { name: 'Càng', good: false, color: 'Xanh' },
  { name: 'Đê', good: true, color: 'Xanh' },
  { name: 'Phòng', good: true, color: 'Xanh' },
  { name: 'Tâm', good: true, color: 'Xanh' },
  { name: 'Vĩ', good: true, color: 'Xanh' },
  { name: 'Kỉ', good: false, color: 'Xanh' },

  // Bắc Phương Huyền Vũ (North - Black Tortoise)
  { name: 'Đấu', good: true, color: 'Đen' },
  { name: 'Ngưu', good: false, color: 'Đen' },
  { name: 'Nữ', good: false, color: 'Đen' },
  { name: 'Hư', good: false, color: 'Đen' },
  { name: 'Nguy', good: false, color: 'Đen' },
  { name: 'Thất', good: false, color: 'Đen' },
  { name: 'Bích', good: true, color: 'Đen' },

  // Tây Phương Bạch Hổ (West - White Tiger)
  { name: 'Khuê', good: true, color: 'Trắng' },
  { name: 'Lâu', good: false, color: 'Trắng' },
  { name: 'Vị', good: true, color: 'Trắng' },
  { name: 'Mão', good: false, color: 'Trắng' },
  { name: 'Tất', good: true, color: 'Trắng' },
  { name: 'Chủy', good: false, color: 'Trắng' },
  { name: 'Sâm', good: true, color: 'Trắng' },

  // Nam Phương Chu Tước (South - Vermillion Bird)
  { name: 'Tỉnh', good: true, color: 'Đỏ' },
  { name: 'Quỷ', good: false, color: 'Đỏ' },
  { name: 'Liễu', good: false, color: 'Đỏ' },
  { name: 'Tinh', good: false, color: 'Đỏ' },
  { name: 'Trương', good: true, color: 'Đỏ' },
  { name: 'Dực', good: true, color: 'Đỏ' },
  { name: 'Chẩn', good: true, color: 'Đỏ' },
];

// Event types and their suitable activities
export const EVENT_TYPES = {
  wedding: {
    name: 'Cưới hỏi',
    requiredActivities: ['Cưới hỏi', 'Gia thất'],
    avoidActivities: ['Tang sự'],
  },
  business: {
    name: 'Khai trương',
    requiredActivities: ['Khai trương', 'Xuất hành'],
    avoidActivities: ['Phá thổ', 'Tang sự'],
  },
  travel: {
    name: 'Xuất hành',
    requiredActivities: ['Xuất hành'],
    avoidActivities: ['Nhập trạch'],
  },
  moving: {
    name: 'Nhập trạch',
    requiredActivities: ['Nhập trạch'],
    avoidActivities: ['Tang sự'],
  },
  vehicle: {
    name: 'Mua xe',
    requiredActivities: ['Giao dịch'],
    avoidActivities: ['Tang sự'],
  },
  contract: {
    name: 'Ký hợp đồng',
    requiredActivities: ['Giao dịch'],
    avoidActivities: ['Tang sự'],
  },
};

export interface DayAnalysis {
  date: Date;
  lunar: LunarDate;
  truc: string;
  isHoangDao: boolean;
  tu: { name: string; good: boolean; color: string };
  score: number;
  goodFor: string[];
  badFor: string[];
  luckyHours: string[];
  description: string;
  dayCanChi: string;
}

/**
 * Get Trực for a lunar day
 */
export function getTruc(dayBranch: number, lunarMonth: number): string {
  // Lunar-month convention, without solar-term boundary correction.
  const index = (dayBranch - ((lunarMonth + 1) % 12) + 12) % 12;
  return TRUC[index];
}

/**
 * Get Tú (28 Lunar Mansions) for a day
 */
export function getTu(lunar: LunarDate): { name: string; good: boolean; color: string } {
  return { name: 'Chưa kiểm định', good: false, color: 'Trung tính' }; // Do not reset a continuous cycle every lunar month/year.
}

/**
 * Get suitable activities for a Trực
 */
function getActivitiesForTruc(truc: string): { good: string[]; bad: string[] } {
  const activities: { [key: string]: { good: string[]; bad: string[] } } = {
    Kiến: {
      good: ['Cưới hỏi', 'Khai trương', 'Xuất hành', 'Giao dịch'],
      bad: ['Tang sự'],
    },
    Trừ: {
      good: ['Trừ bệnh', 'Dọn dẹp', 'Sửa chữa'],
      bad: ['Cưới hỏi', 'Nhập trạch'],
    },
    Mãn: {
      good: ['Cưới hỏi', 'Khai trương', 'An táng'],
      bad: ['Xuất hành'],
    },
    Bình: {
      good: ['Giao dịch', 'Học tập'],
      bad: [],
    },
    Định: {
      good: ['Cưới hỏi', 'Nhập trạch', 'Khai trương'],
      bad: ['Tang sự', 'Kiện tụng'],
    },
    Chấp: {
      good: ['Nhập trạch', 'An táng', 'Sửa chữa'],
      bad: ['Cưới hỏi', 'Xuất hành'],
    },
    Phá: {
      good: [],
      bad: ['Cưới hỏi', 'Khai trương', 'Xuất hành', 'Nhập trạch', 'Giao dịch'],
    },
    Nguy: {
      good: ['Săn bắt', 'Đánh cá'],
      bad: ['Cưới hỏi', 'Khai trương', 'Nhập trạch'],
    },
    Thành: {
      good: ['Cưới hỏi', 'Khai trương', 'Xuất hành', 'Giao dịch', 'Nhập trạch'],
      bad: [],
    },
    Thâu: {
      good: ['Thu hoạch', 'Giao dịch', 'Nhập kho'],
      bad: ['Xuất hành'],
    },
    Khai: {
      good: ['Khai trương', 'Xuất hành', 'Giao dịch', 'Học tập'],
      bad: ['Tang sự', 'An táng'],
    },
    Bế: {
      good: ['Nghỉ ngơi', 'Tu dưỡng'],
      bad: ['Cưới hỏi', 'Khai trương', 'Xuất hành', 'Nhập trạch'],
    },
  };

  return activities[truc] || { good: [], bad: [] };
}

/**
 * Get lucky hours for a day
 */
export function getLuckyHours(jd: number): string[] {
  // Traditional six-row lookup, indexed by the Julian day's earthly branch.
  const masks = [
    '110100101100',
    '001101001011',
    '110011010010',
    '101100110100',
    '001011001101',
    '010010110011',
  ];
  const mask = masks[((jd + 1) % 12) % 6];
  return DIA_CHI.flatMap((chi, i) =>
    mask[i] === '1' ? [`${chi} (${(i * 2 + 23) % 24}–${(i * 2 + 1) % 24}h)`] : [],
  );
}

export function isHoangDaoDay(lunarMonth: number, dayBranch: number): boolean {
  const start = (lunarMonth * 2 - 2) % 12;
  return [0, 1, 4, 5, 7, 10].some((offset) => (start + offset) % 12 === dayBranch);
}

/**
 * Calculate day score (0-100)
 */
function calculateDayScore(
  truc: string,
  tu: { good: boolean; verified?: boolean },
  isHoangDao: boolean,
): number {
  let score = 50; // Base score

  // Hoàng Đạo bonus
  if (isHoangDao) {
    score += 30;
  }

  // Hắc Đạo penalty
  if (HAC_DAO.includes(truc)) {
    score -= 40;
  }

  // Tú bonus/penalty
  if (tu.verified === false) {
    // No mansion weight until a referenced continuous-cycle anchor has been verified.
  } else if (tu.good) {
    score += 10;
  } else {
    score -= 10;
  }

  // Specific Trực bonuses
  if (['Kiến', 'Định', 'Thành'].includes(truc)) {
    score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Analyze a specific day
 */
export function analyzeDay(day: number, month: number, year: number): DayAnalysis {
  const lunar = solarToLunar(day, month, year);
  const jd = dateToJD(day, month, year);
  const branch = (jd + 1) % 12;
  const solarMonth = traditionalSolarMonth(day, month, year);
  const truc = TRUC[(branch - solarMonth.branch + 12) % 12];
  const tu = { name: 'Chưa kiểm định', good: false, color: 'Trung tính', verified: false };
  const activities = getActivitiesForTruc(truc);
  const isHoangDao = isHoangDaoDay(lunar.month, branch);
  const score = calculateDayScore(truc, tu, isHoangDao);

  let description = '';
  if (isHoangDao) {
    description = `Ngày ${getDayCanChi(jd)}, trực ${truc} · Hoàng đạo theo bảng tháng âm và địa chi ngày.`;
  } else if (HAC_DAO.includes(truc)) {
    description = `Ngày ${getDayCanChi(jd)}, trực ${truc} · Cân nhắc kế hoạch và điều kiện thực tế trước các việc quan trọng.`;
  } else {
    description = `Ngày ${truc}. Nên cân nhắc kỹ trước khi làm việc quan trọng.`;
  }

  return {
    date: new Date(year, month - 1, day),
    dayCanChi: getDayCanChi(jd),
    lunar,
    truc,
    isHoangDao,
    tu,
    score,
    goodFor: activities.good,
    badFor: activities.bad,
    luckyHours: getLuckyHours(jd),
    description,
  };
}

/**
 * Find good days for a specific event type in a month
 */
export function findGoodDaysForEvent(
  year: number,
  month: number,
  eventType: keyof typeof EVENT_TYPES,
  limit: number = 10,
): DayAnalysis[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const results: DayAnalysis[] = [];
  const eventConfig = EVENT_TYPES[eventType];

  for (let day = 1; day <= daysInMonth; day++) {
    const analysis = analyzeDay(day, month, year);

    // Check if day is suitable for the event
    const hasRequiredActivity = eventConfig.requiredActivities.some((activity) =>
      analysis.goodFor.includes(activity),
    );

    const hasAvoidActivity =
      eventConfig.requiredActivities.some((activity) => analysis.badFor.includes(activity)) ||
      eventConfig.avoidActivities.some((activity) => analysis.goodFor.includes(activity));

    // Must be Hoàng Đạo, have required activities, and not have avoid activities
    if (analysis.isHoangDao && hasRequiredActivity && !hasAvoidActivity) {
      results.push(analysis);
    }
  }

  // Sort by score and return top results
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Check if a day is good for a specific age (birth year)
 */
export function isGoodDayForAge(
  day: number,
  month: number,
  year: number,
  birthYear: number,
): { isGood: boolean; reason: string } {
  const birthChi = DIA_CHI[(birthYear + 8) % 12];
  const dayChi = DIA_CHI[(dateToJD(day, month, year) + 1) % 12];

  // Simplified conflict check - in real implementation, use Kim Lâu, Hoang Ốc tables
  const conflictPairs: { [key: string]: string[] } = {
    Tý: ['Ngọ'],
    Sửu: ['Mùi'],
    Dần: ['Thân'],
    Mão: ['Dậu'],
    Thìn: ['Tuất'],
    Tị: ['Hợi'],
    Ngọ: ['Tý'],
    Mùi: ['Sửu'],
    Thân: ['Dần'],
    Dậu: ['Mão'],
    Tuất: ['Thìn'],
    Hợi: ['Tị'],
  };

  if (conflictPairs[birthChi]?.includes(dayChi)) {
    return { isGood: false, reason: `Tuổi ${birthChi} xung với ngày ${dayChi}` };
  }

  return { isGood: true, reason: 'Ngày hợp tuổi' };
}

/**
 * Get all good days in a month
 */
export function getGoodDaysInMonth(year: number, month: number): number[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const goodDays: number[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const analysis = analyzeDay(day, month, year);
    if (analysis.isHoangDao && analysis.score >= 70) {
      goodDays.push(day);
    }
  }

  return goodDays;
}
