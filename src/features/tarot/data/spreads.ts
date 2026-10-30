export const SPREADS = [
  {
    id: 'daily',
    name: 'Lá bài hôm nay',
    short: '1 lá',
    description: 'Một thông điệp để bắt đầu ngày mới.',
    positions: ['Thông điệp hôm nay'],
  },
  {
    id: 'three',
    name: 'Dòng chảy thời gian',
    short: '3 lá',
    description: 'Nhìn lại, lắng nghe và mở một hướng đi.',
    positions: ['Quá khứ', 'Hiện tại', 'Hướng phát triển'],
  },
  {
    id: 'love',
    name: 'Kết nối tình yêu',
    short: '3 lá',
    description: 'Hiểu mình và nuôi dưỡng sự kết nối.',
    positions: ['Bạn', 'Sự kết nối', 'Điều cần nuôi dưỡng'],
  },
  {
    id: 'career',
    name: 'Con đường sự nghiệp',
    short: '5 lá',
    description: 'Khám phá nguồn lực và bước tiếp theo.',
    positions: ['Hiện tại', 'Thử thách', 'Nguồn lực', 'Lời khuyên', 'Bước tiếp theo'],
  },
  {
    id: 'celtic',
    name: 'Celtic Cross',
    short: '10 lá',
    description: 'Một góc nhìn sâu hơn về hành trình của bạn.',
    positions: [
      'Tâm điểm',
      'Thử thách',
      'Nền tảng',
      'Quá khứ',
      'Mong muốn',
      'Hướng phát triển',
      'Bản thân',
      'Môi trường',
      'Hy vọng & lo ngại',
      'Bức tranh chung',
    ],
  },
] as const;
export type SpreadId = (typeof SPREADS)[number]['id'];
export function getSpread(id: string) {
  return SPREADS.find((s) => s.id === id) ?? SPREADS[1];
}
