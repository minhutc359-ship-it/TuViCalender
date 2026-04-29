/**
 * Good Days Calculator - Vietnamese Feng Shui Calendar
 * Tính toán ngày tốt xấu theo phong thủy Việt Nam
 */

import { solarToLunar, type LunarDate, DIA_CHI } from './lunar';

// 12 Trực (12 Day Officers)
export const TRUC = [
  'Kiến',   // +++  Very good
  'Trừ',    // +    Good
  'Mãn',    // ++   Very good
  'Bình',   // +    Average
  'Định',   // +++  Very good
  'Chấp',   // +    Good
  'Phá',    // ---  Very bad (Hắc Đạo)
  'Nguy',   // --   Bad (Hắc Đạo)
  'Thành',  // +++  Very good
  'Thâu',   // +    Good
  'Khai',   // ++   Very good
  'Bế'      // --   Bad (Hắc Đạo)
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
  { name: 'Chẩn', good: true, color: 'Đỏ' }
];

// Event types and their suitable activities
export const EVENT_TYPES = {
  'wedding': {
    name: 'Cưới hỏi',
    requiredActivities: ['Cưới hỏi', 'Gia thất'],
    avoidActivities: ['Tang sự']
  },
  'business': {
    name: 'Khai trương',
    requiredActivities: ['Khai trương', 'Xuất hành'],
    avoidActivities: ['Phá thổ', 'Tang sự']
  },
  'travel': {
    name: 'Xuất hành',
    requiredActivities: ['Xuất hành'],
    avoidActivities: ['Nhập trạch']
  },
  'moving': {
    name: 'Nhập trạch',
    requiredActivities: ['Nhập trạch', 'An táng'],
    avoidActivities: []
  },
  'contract': {
    name: 'Ký hợp đồng',
    requiredActivities: ['Giao dịch'],
    avoidActivities: ['Tang sự']
  }
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
}

/**
 * Get Trực for a lunar day
 */
export function getTruc(lunarDay: number, lunarMonth: number): string {
  const index = (lunarMonth + lunarDay - 2) % 12;
  return TRUC[index];
}

/**
 * Get Tú (28 Lunar Mansions) for a day
 */
export function getTu(lunar: LunarDate): { name: string; good: boolean; color: string } {
  const totalDays = (lunar.month - 1) * 30 + lunar.day;
  const index = (totalDays - 1) % 28;
  return TU_28[index];
}

/**
 * Get suitable activities for a Trực
 */
function getActivitiesForTruc(truc: string): { good: string[]; bad: string[] } {
  const activities: { [key: string]: { good: string[]; bad: string[] } } = {
    'Kiến': {
      good: ['Cưới hỏi', 'Khai trương', 'Xuất hành', 'Giao dịch'],
      bad: ['Tang sự']
    },
    'Trừ': {
      good: ['Trừ bệnh', 'Dọn dẹp', 'Sửa chữa'],
      bad: ['Cưới hỏi', 'Nhập trạch']
    },
    'Mãn': {
      good: ['Cưới hỏi', 'Khai trương', 'An táng'],
      bad: ['Xuất hành']
    },
    'Bình': {
      good: ['Giao dịch', 'Học tập'],
      bad: []
    },
    'Định': {
      good: ['Cưới hỏi', 'Nhập trạch', 'Khai trương'],
      bad: ['Tang sự', 'Kiện tụng']
    },
    'Chấp': {
      good: ['Nhập trạch', 'An táng', 'Sửa chữa'],
      bad: ['Cưới hỏi', 'Xuất hành']
    },
    'Phá': {
      good: [],
      bad: ['Cưới hỏi', 'Khai trương', 'Xuất hành', 'Nhập trạch', 'Giao dịch']
    },
    'Nguy': {
      good: ['Săn bắt', 'Đánh cá'],
      bad: ['Cưới hỏi', 'Khai trương', 'Nhập trạch']
    },
    'Thành': {
      good: ['Cưới hỏi', 'Khai trương', 'Xuất hành', 'Giao dịch', 'Nhập trạch'],
      bad: []
    },
    'Thâu': {
      good: ['Thu hoạch', 'Giao dịch', 'Nhập kho'],
      bad: ['Xuất hành']
    },
    'Khai': {
      good: ['Khai trương', 'Xuất hành', 'Giao dịch', 'Học tập'],
      bad: ['Tang sự', 'An táng']
    },
    'Bế': {
      good: ['Nghỉ ngơi', 'Tu dưỡng'],
      bad: ['Cưới hỏi', 'Khai trương', 'Xuất hành', 'Nhập trạch']
    }
  };

  return activities[truc] || { good: [], bad: [] };
}

/**
 * Get lucky hours for a day
 */
function getLuckyHours(lunar: LunarDate): string[] {
  // Simplified version - in real implementation, use complex astrology calculations
  const hours = [
    '5-7h (Mão)', '7-9h (Thìn)', '9-11h (Tỵ)',
    '11-13h (Ngọ)', '13-15h (Mùi)', '15-17h (Thân)',
    '17-19h (Dậu)', '19-21h (Tuất)', '21-23h (Hợi)',
    '23-1h (Tý)', '1-3h (Sửu)', '3-5h (Dần)'
  ];

  // Select 2-3 lucky hours based on day
  const seed = (lunar.day + lunar.month) % hours.length;
  return [
    hours[seed],
    hours[(seed + 4) % hours.length],
    hours[(seed + 8) % hours.length]
  ];
}

/**
 * Calculate day score (0-100)
 */
function calculateDayScore(truc: string, tu: { good: boolean }): number {
  let score = 50; // Base score

  // Hoàng Đạo bonus
  if (HOANG_DAO.includes(truc)) {
    score += 30;
  }

  // Hắc Đạo penalty
  if (HAC_DAO.includes(truc)) {
    score -= 40;
  }

  // Tú bonus/penalty
  if (tu.good) {
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
  const truc = getTruc(lunar.day, lunar.month);
  const tu = getTu(lunar);
  const activities = getActivitiesForTruc(truc);
  const score = calculateDayScore(truc, tu);
  const isHoangDao = HOANG_DAO.includes(truc);

  let description = '';
  if (isHoangDao) {
    description = `Ngày ${truc} - Hoàng Đạo. Tốt cho hầu hết mọi việc.`;
  } else if (HAC_DAO.includes(truc)) {
    description = `Ngày ${truc} - Hắc Đạo. Nên tránh các việc quan trọng.`;
  } else {
    description = `Ngày ${truc}. Nên cân nhắc kỹ trước khi làm việc quan trọng.`;
  }

  return {
    date: new Date(year, month - 1, day),
    lunar,
    truc,
    isHoangDao,
    tu,
    score,
    goodFor: activities.good,
    badFor: activities.bad,
    luckyHours: getLuckyHours(lunar),
    description
  };
}

/**
 * Find good days for a specific event type in a month
 */
export function findGoodDaysForEvent(
  year: number,
  month: number,
  eventType: keyof typeof EVENT_TYPES,
  limit: number = 10
): DayAnalysis[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const results: DayAnalysis[] = [];
  const eventConfig = EVENT_TYPES[eventType];

  for (let day = 1; day <= daysInMonth; day++) {
    const analysis = analyzeDay(day, month, year);

    // Check if day is suitable for the event
    const hasRequiredActivity = eventConfig.requiredActivities.some(
      activity => analysis.goodFor.includes(activity)
    );

    const hasAvoidActivity = eventConfig.avoidActivities.some(
      activity => analysis.badFor.includes(activity)
    );

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
  birthYear: number
): { isGood: boolean; reason: string } {
  const lunar = solarToLunar(day, month, year);
  const birthChi = DIA_CHI[(birthYear + 8) % 12];
  const dayChi = DIA_CHI[(lunar.day - 1) % 12];

  // Simplified conflict check - in real implementation, use Kim Lâu, Hoang Ốc tables
  const conflictPairs: { [key: string]: string[] } = {
    'Tý': ['Ngọ'],
    'Sửu': ['Mùi'],
    'Dần': ['Thân'],
    'Mão': ['Dậu'],
    'Thìn': ['Tuất'],
    'Tị': ['Hợi'],
    'Ngọ': ['Tý'],
    'Mùi': ['Sửu'],
    'Thân': ['Dần'],
    'Dậu': ['Mão'],
    'Tuất': ['Thìn'],
    'Hợi': ['Tị']
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