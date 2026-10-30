/** Original vector presentation metadata. Trigram lines are read from top to bottom. */
export const ELEMENTS = [
  { name: 'Mộc', english: 'Wood', color: '#80c7aa' },
  { name: 'Hỏa', english: 'Fire', color: '#df9285' },
  { name: 'Thổ', english: 'Earth', color: '#d8bb86' },
  { name: 'Kim', english: 'Metal', color: '#d6dce5' },
  { name: 'Thủy', english: 'Water', color: '#8dbbd4' },
] as const;

/** Traditional correspondences; display order is ornamental, not an actual compass reading. */
export const BAGUA = [
  { name: 'Khảm', element: 'Thủy', direction: 'Bắc', meaning: 'Nước', lines: [0, 1, 0] },
  { name: 'Cấn', element: 'Thổ', direction: 'Đông Bắc', meaning: 'Núi', lines: [1, 0, 0] },
  { name: 'Chấn', element: 'Mộc', direction: 'Đông', meaning: 'Sấm', lines: [0, 0, 1] },
  { name: 'Tốn', element: 'Mộc', direction: 'Đông Nam', meaning: 'Gió', lines: [1, 1, 0] },
  { name: 'Ly', element: 'Hỏa', direction: 'Nam', meaning: 'Lửa', lines: [1, 0, 1] },
  { name: 'Khôn', element: 'Thổ', direction: 'Tây Nam', meaning: 'Đất', lines: [0, 0, 0] },
  { name: 'Đoài', element: 'Kim', direction: 'Tây', meaning: 'Hồ', lines: [0, 1, 1] },
  { name: 'Càn', element: 'Kim', direction: 'Tây Bắc', meaning: 'Trời', lines: [1, 1, 1] },
] as const;

export const ZODIAC_ANIMALS = [
  { name: 'Tý', animal: 'Chuột' },
  { name: 'Sửu', animal: 'Trâu' },
  { name: 'Dần', animal: 'Hổ' },
  { name: 'Mão', animal: 'Mèo' },
  { name: 'Thìn', animal: 'Rồng' },
  { name: 'Tị', animal: 'Rắn' },
  { name: 'Ngọ', animal: 'Ngựa' },
  { name: 'Mùi', animal: 'Dê' },
  { name: 'Thân', animal: 'Khỉ' },
  { name: 'Dậu', animal: 'Gà' },
  { name: 'Tuất', animal: 'Chó' },
  { name: 'Hợi', animal: 'Lợn' },
] as const;

export const PLANETS = [
  { name: 'Sun', label: 'Mặt Trời' },
  { name: 'Moon', label: 'Mặt Trăng' },
  { name: 'Mercury', label: 'Sao Thủy' },
  { name: 'Venus', label: 'Sao Kim' },
  { name: 'Mars', label: 'Sao Hỏa' },
  { name: 'Jupiter', label: 'Sao Mộc' },
  { name: 'Saturn', label: 'Sao Thổ' },
  { name: 'Uranus', label: 'Thiên Vương' },
  { name: 'Neptune', label: 'Hải Vương' },
  { name: 'Pluto', label: 'Diêm Vương' },
] as const;
