/**
 * Astrology Calculator - Western & Eastern
 * Tính toán cung hoàng đạo và bát tự
 */

import { solarToLunar, dateToJD, THIEN_CAN, DIA_CHI, CAN_TO_NGU_HANH } from './lunar';
import { approximateFourPillars } from './solar-terms';

// Western Zodiac Signs
export const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

// Vietnamese names for zodiac signs
export const ZODIAC_VN: { [K in ZodiacSign]: string } = {
  Aries: 'Bạch Dương',
  Taurus: 'Kim Ngưu',
  Gemini: 'Song Tử',
  Cancer: 'Cự Giải',
  Leo: 'Sư Tử',
  Virgo: 'Xử Nữ',
  Libra: 'Thiên Bình',
  Scorpio: 'Bọ Cạp',
  Sagittarius: 'Nhân Mã',
  Capricorn: 'Ma Kết',
  Aquarius: 'Bảo Bình',
  Pisces: 'Song Ngư',
};

// 8 Cung (8 Trigrams)
export const BAT_QUAI = [
  { name: 'Càn', element: 'Kim', direction: 'Tây Bắc', meaning: 'Trời' },
  { name: 'Đoài', element: 'Kim', direction: 'Tây', meaning: 'Hồ' },
  { name: 'Ly', element: 'Hỏa', direction: 'Nam', meaning: 'Lửa' },
  { name: 'Chấn', element: 'Mộc', direction: 'Đông', meaning: 'Sấm' },
  { name: 'Tốn', element: 'Mộc', direction: 'Đông Nam', meaning: 'Gió' },
  { name: 'Khảm', element: 'Thủy', direction: 'Bắc', meaning: 'Nước' },
  { name: 'Cấn', element: 'Thổ', direction: 'Đông Bắc', meaning: 'Núi' },
  { name: 'Khôn', element: 'Thổ', direction: 'Tây Nam', meaning: 'Đất' },
];

export interface WesternChart {
  sunSign: ZodiacSign;
  sunSignVN: string;
  birthDate: Date;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  quality: 'Cardinal' | 'Fixed' | 'Mutable';
  ruler: string;
}

export interface EasternChart {
  canChi: {
    year: string;
    month: string;
    day: string;
    hour?: string;
  };
  nguHanh: string;
  cungMenh: string;
  conGiap: string;
  batTu?: {
    yearPillar: { can: string; chi: string };
    monthPillar: { can: string; chi: string };
    dayPillar: { can: string; chi: string };
    hourPillar?: { can: string; chi: string };
  };
}

/**
 * Get Western Sun Sign from birth date
 */
export function getSunSign(day: number, month: number): ZodiacSign {
  const dateNum = month * 100 + day;

  if (dateNum >= 321 && dateNum <= 419) return 'Aries';
  if (dateNum >= 420 && dateNum <= 520) return 'Taurus';
  if (dateNum >= 521 && dateNum <= 620) return 'Gemini';
  if (dateNum >= 621 && dateNum <= 722) return 'Cancer';
  if (dateNum >= 723 && dateNum <= 822) return 'Leo';
  if (dateNum >= 823 && dateNum <= 922) return 'Virgo';
  if (dateNum >= 923 && dateNum <= 1022) return 'Libra';
  if (dateNum >= 1023 && dateNum <= 1121) return 'Scorpio';
  if (dateNum >= 1122 && dateNum <= 1221) return 'Sagittarius';
  if (dateNum >= 1222 || dateNum <= 119) return 'Capricorn';
  if (dateNum >= 120 && dateNum <= 218) return 'Aquarius';
  return 'Pisces';
}

/**
 * Get Western element and quality for a sign
 */
function getSignAttributes(sign: ZodiacSign): Pick<WesternChart, 'element' | 'quality' | 'ruler'> {
  const attributes: { [K in ZodiacSign]: Pick<WesternChart, 'element' | 'quality' | 'ruler'> } = {
    Aries: { element: 'Fire', quality: 'Cardinal', ruler: 'Mars' },
    Taurus: { element: 'Earth', quality: 'Fixed', ruler: 'Venus' },
    Gemini: { element: 'Air', quality: 'Mutable', ruler: 'Mercury' },
    Cancer: { element: 'Water', quality: 'Cardinal', ruler: 'Moon' },
    Leo: { element: 'Fire', quality: 'Fixed', ruler: 'Sun' },
    Virgo: { element: 'Earth', quality: 'Mutable', ruler: 'Mercury' },
    Libra: { element: 'Air', quality: 'Cardinal', ruler: 'Venus' },
    Scorpio: { element: 'Water', quality: 'Fixed', ruler: 'Pluto' },
    Sagittarius: { element: 'Fire', quality: 'Mutable', ruler: 'Jupiter' },
    Capricorn: { element: 'Earth', quality: 'Cardinal', ruler: 'Saturn' },
    Aquarius: { element: 'Air', quality: 'Fixed', ruler: 'Uranus' },
    Pisces: { element: 'Water', quality: 'Mutable', ruler: 'Neptune' },
  };

  return attributes[sign];
}

/**
 * Calculate Western birth chart
 */
export function calculateWesternChart(day: number, month: number, year: number): WesternChart {
  const sunSign = getSunSign(day, month);
  const attributes = getSignAttributes(sunSign);

  return {
    sunSign,
    sunSignVN: ZODIAC_VN[sunSign],
    birthDate: new Date(year, month - 1, day),
    ...attributes,
  };
}

/**
 * Get Can Chi for year/month/day/hour
 */
function getCanChiForDate(
  year: number,
  month: number,
  day: number,
  hour?: number,
): EasternChart['canChi'] {
  // Year Can Chi
  const lunar = solarToLunar(day, month, year);
  const yearCan = THIEN_CAN[(lunar.year + 6) % 10];
  const yearChi = DIA_CHI[(lunar.year + 8) % 12];

  // Month Can Chi (simplified - needs solar term adjustment for accuracy)
  const monthCan = THIEN_CAN[(lunar.year * 12 + lunar.month + 3) % 10];
  const monthChi = DIA_CHI[(lunar.month + 1) % 12];

  // Day Can Chi (using Julian Day approximation)
  const jd = dateToJD(day, month, year);
  const dayCan = THIEN_CAN[(jd + 9) % 10];
  const dayChi = DIA_CHI[(jd + 1) % 12];

  const canChi: EasternChart['canChi'] = {
    year: `${yearCan} ${yearChi}`,
    month: `${monthCan} ${monthChi}`,
    day: `${dayCan} ${dayChi}`,
  };

  // Hour Can Chi (if provided)
  if (hour !== undefined) {
    const hourIndex = Math.floor((hour + 1) / 2) % 12;
    const hourChi = DIA_CHI[hourIndex];
    // Hour Can depends on day Can (complex calculation - simplified here)
    const hourCanIndex = ((((jd + 9) % 10) % 5) * 2 + hourIndex) % 10;
    const hourCan = THIEN_CAN[hourCanIndex];
    canChi.hour = `${hourCan} ${hourChi}`;
  }

  return canChi;
}

/**
 * Get Cung Mệnh (Life Palace) based on birth year
 */
function getCungMenh(year: number): string {
  const index = (year + 8) % 12;
  const palaces = [
    'Khảm',
    'Khôn',
    'Chấn',
    'Tốn',
    'Càn',
    'Đoài',
    'Cấn',
    'Ly',
    'Càn',
    'Đoài',
    'Cấn',
    'Ly',
  ];
  return palaces[index];
}

/**
 * Calculate Eastern birth chart
 */
export function calculateEasternChart(
  day: number,
  month: number,
  year: number,
  hour?: number,
  minute = 0,
): EasternChart {
  const lunar = solarToLunar(day, month, year);
  const canChi = getCanChiForDate(year, month, day, hour);

  // Get Ngũ Hành from year Can
  const yearCan = THIEN_CAN[(lunar.year + 6) % 10];
  const nguHanh = CAN_TO_NGU_HANH[yearCan];

  // Get Cung Mệnh
  const cungMenh = getCungMenh(year);

  // Get Con Giáp
  const conGiap = DIA_CHI[(lunar.year + 8) % 12];

  return {
    canChi,
    nguHanh,
    cungMenh,
    conGiap,
    batTu:
      hour !== undefined
        ? approximateFourPillars(day, month, year, hour, minute)
        : {
            yearPillar: {
              can: canChi.year.split(' ')[0],
              chi: canChi.year.split(' ')[1],
            },
            monthPillar: {
              can: canChi.month.split(' ')[0],
              chi: canChi.month.split(' ')[1],
            },
            dayPillar: {
              can: canChi.day.split(' ')[0],
              chi: canChi.day.split(' ')[1],
            },
            ...(hour !== undefined && canChi.hour
              ? {
                  hourPillar: {
                    can: canChi.hour.split(' ')[0],
                    chi: canChi.hour.split(' ')[1],
                  },
                }
              : {}),
          },
  };
}

/**
 * Calculate zodiac compatibility (simplified)
 */
export function calculateCompatibility(
  sign1: ZodiacSign,
  sign2: ZodiacSign,
): {
  score: number;
  description: string;
} {
  const compatibilityMap: { [key: string]: number } = {
    // Fire signs
    'Aries-Leo': 90,
    'Aries-Sagittarius': 85,
    'Aries-Aquarius': 75,
    'Leo-Sagittarius': 90,
    'Leo-Aries': 90,
    'Leo-Gemini': 80,
    'Sagittarius-Aries': 85,
    'Sagittarius-Leo': 90,
    'Sagittarius-Aquarius': 80,

    // Earth signs
    'Taurus-Virgo': 90,
    'Taurus-Capricorn': 85,
    'Taurus-Cancer': 80,
    'Virgo-Capricorn': 90,
    'Virgo-Taurus': 90,
    'Virgo-Scorpio': 75,
    'Capricorn-Taurus': 85,
    'Capricorn-Virgo': 90,
    'Capricorn-Pisces': 70,

    // Air signs
    'Gemini-Libra': 90,
    'Gemini-Aquarius': 85,
    'Gemini-Leo': 80,
    'Libra-Aquarius': 90,
    'Libra-Gemini': 90,
    'Libra-Sagittarius': 75,
    'Aquarius-Gemini': 85,
    'Aquarius-Libra': 90,
    'Aquarius-Aries': 75,

    // Water signs
    'Cancer-Scorpio': 90,
    'Cancer-Pisces': 85,
    'Cancer-Taurus': 80,
    'Scorpio-Pisces': 90,
    'Scorpio-Cancer': 90,
    'Scorpio-Capricorn': 75,
    'Pisces-Cancer': 85,
    'Pisces-Scorpio': 90,
    'Pisces-Taurus': 70,
  };

  const key1 = `${sign1}-${sign2}`;
  const key2 = `${sign2}-${sign1}`;

  const score = compatibilityMap[key1] || compatibilityMap[key2] || 50;

  let description = '';
  if (score >= 85) {
    description = 'Rất hợp! Hai người có nhiều điểm chung và dễ hiểu nhau.';
  } else if (score >= 70) {
    description = 'Khá tốt! Cần thời gian để thấu hiểu nhau hơn.';
  } else if (score >= 55) {
    description = 'Trung bình. Cần nỗ lực để duy trì mối quan hệ.';
  } else {
    description = 'Khó khăn. Hai người có tính cách khá khác biệt.';
  }

  return { score, description };
}

/**
 * Get personality traits for zodiac sign
 */
export function getZodiacTraits(sign: ZodiacSign): {
  strengths: string[];
  weaknesses: string[];
  personality: string;
} {
  const traits: { [K in ZodiacSign]: ReturnType<typeof getZodiacTraits> } = {
    Aries: {
      strengths: ['Dũng cảm', 'Quyết đoán', 'Nhiệt huyết', 'Tự tin'],
      weaknesses: ['Bốc đồng', 'Nóng tính', 'Thiếu kiên nhẫn'],
      personality: 'Năng động, thích dẫn đầu, luôn tràn đầy năng lượng',
    },
    Taurus: {
      strengths: ['Kiên định', 'Đáng tin cậy', 'Thực tế', 'Kiên nhẫn'],
      weaknesses: ['Cứng đầu', 'Bảo thủ', 'Vật chất'],
      personality: 'Ổn định, yêu thích sự thoải mái và an toàn',
    },
    Gemini: {
      strengths: ['Thông minh', 'Linh hoạt', 'Giao tiếp tốt', 'Tò mò'],
      weaknesses: ['Hay thay đổi', 'Thiếu kiên định', 'Lo lắng'],
      personality: 'Năng động, thích giao lưu, luôn tìm kiếm điều mới',
    },
    Cancer: {
      strengths: ['Trung thành', 'Nhạy cảm', 'Thấu hiểu', 'Bảo vệ'],
      weaknesses: ['Dễ tổn thương', 'Hay suy nghĩ', 'Bảo thủ'],
      personality: 'Tình cảm sâu sắc, coi trọng gia đình và tình bạn',
    },
    Leo: {
      strengths: ['Tự tin', 'Hào phóng', 'Lãnh đạo', 'Sáng tạo'],
      weaknesses: ['Kiêu ngạo', 'Ích kỷ', 'Thống trị'],
      personality: 'Nổi bật, thích là trung tâm chú ý, có khả năng lãnh đạo',
    },
    Virgo: {
      strengths: ['Tỉ mỉ', 'Thực tế', 'Chăm chỉ', 'Phân tích'],
      weaknesses: ['Cầu toàn', 'Lo lắng', 'Phê bình'],
      personality: 'Chi tiết, thích hoàn hảo, luôn cải thiện',
    },
    Libra: {
      strengths: ['Công bằng', 'Hòa đồng', 'Ngoại giao', 'Thẩm mỹ'],
      weaknesses: ['Lưỡng lự', 'Tránh xung đột', 'Phụ thuộc'],
      personality: 'Cân bằng, yêu hòa bình, thích sự hài hòa',
    },
    Scorpio: {
      strengths: ['Đam mê', 'Quyết tâm', 'Trung thành', 'Thông minh'],
      weaknesses: ['Ghen tuông', 'Bí mật', 'Thù hận'],
      personality: 'Sâu sắc, bí ẩn, cảm xúc mạnh mẽ',
    },
    Sagittarius: {
      strengths: ['Lạc quan', 'Tự do', 'Phiêu lưu', 'Trung thực'],
      weaknesses: ['Thiếu trách nhiệm', 'Bốc đồng', 'Thiếu tế nhị'],
      personality: 'Phóng khoáng, yêu tự do, khám phá',
    },
    Capricorn: {
      strengths: ['Kỷ luật', 'Tham vọng', 'Trách nhiệm', 'Kiên nhẫn'],
      weaknesses: ['Cứng nhắc', 'Bi quan', 'Lạnh lùng'],
      personality: 'Nghiêm túc, hướng đến mục tiêu, đáng tin cậy',
    },
    Aquarius: {
      strengths: ['Sáng tạo', 'Độc lập', 'Nhân đạo', 'Thông minh'],
      weaknesses: ['Cô độc', 'Xa cách', 'Cứng đầu'],
      personality: 'Độc đáo, tiến bộ, quan tâm xã hội',
    },
    Pisces: {
      strengths: ['Đồng cảm', 'Nghệ thuật', 'Trực giác', 'Từ bi'],
      weaknesses: ['Quá nhạy cảm', 'Mơ mộng', 'Thoái lui'],
      personality: 'Tinh tế, nghệ sĩ, đầy cảm xúc',
    },
  };

  return traits[sign];
}
