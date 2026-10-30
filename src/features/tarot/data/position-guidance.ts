import type { SpreadId } from './spreads';
export type PositionRole =
  | 'daily'
  | 'past'
  | 'present'
  | 'direction'
  | 'self'
  | 'connection'
  | 'nurture'
  | 'challenge'
  | 'resource'
  | 'advice'
  | 'next'
  | 'root'
  | 'wish'
  | 'environment'
  | 'fear'
  | 'outcome';
export const SPREAD_ROLES: Record<SpreadId, readonly PositionRole[]> = {
  daily: ['daily'],
  three: ['past', 'present', 'direction'],
  love: ['self', 'connection', 'nurture'],
  career: ['present', 'challenge', 'resource', 'advice', 'next'],
  celtic: [
    'present',
    'challenge',
    'root',
    'past',
    'wish',
    'direction',
    'self',
    'environment',
    'fear',
    'outcome',
  ],
};
export const POSITION_GUIDANCE: Record<PositionRole, { lens: string; question: string }> = {
  daily: {
    lens: 'Dùng thông điệp này làm một điểm chú ý trong hôm nay, rồi kiểm tra nó qua trải nghiệm thực tế.',
    question: 'Một việc nhỏ nào hôm nay có thể giúp bạn kiểm chứng góc nhìn này?',
  },
  past: {
    lens: 'Đọc như lời mời nhìn lại trải nghiệm hoặc thói quen đã có; lá bài không xác nhận một sự kiện trong quá khứ.',
    question: 'Bạn đang mang theo bài học hay phản ứng nào từ trải nghiệm trước?',
  },
  present: {
    lens: 'Đối chiếu chủ đề của lá với dữ kiện hiện tại và tách điều quan sát được khỏi điều đang suy đoán.',
    question: 'Điều gì đang thực sự diễn ra, và điều gì mới là cách bạn diễn giải?',
  },
  direction: {
    lens: 'Đọc như một hướng có thể phát triển nếu cách tiếp cận hiện tại tiếp tục, không phải kết quả chắc chắn sẽ xảy ra.',
    question: 'Bạn muốn duy trì điều gì và chủ động đổi điều gì trong bước tiếp theo?',
  },
  self: {
    lens: 'Xem cách bạn đang phản ứng và phần có thể tự điều chỉnh; không dùng lá để gán tính cách cố định.',
    question: 'Bạn có thể nhận trách nhiệm cho lựa chọn nào của chính mình?',
  },
  connection: {
    lens: 'Đọc động lực cho–nhận và đối thoại giữa các bên. Lá bài không thể xác định suy nghĩ hay tình cảm bí mật của người khác.',
    question: 'Một cuộc trao đổi trực tiếp nào có thể làm rõ điều đang được suy đoán?',
  },
  nurture: {
    lens: 'Tìm một hành vi chăm sóc có thể thực hiện và kiểm chứng, thay vì chỉ mong quan hệ tự thay đổi.',
    question: 'Hai bên có thể thống nhất một hành động nhỏ nào để chăm sự kết nối?',
  },
  challenge: {
    lens: 'Đây là điểm cần điều chỉnh hoặc rèn luyện. Lá xuôi tích cực ở vị trí này vẫn có thể chỉ phẩm chất đang thiếu hoặc được dùng quá mức.',
    question: 'Phẩm chất nào đang thiếu, bị dùng quá mức hoặc khó thực hiện trong hoàn cảnh này?',
  },
  resource: {
    lens: 'Tìm năng lực, người hỗ trợ hoặc điều kiện có thể huy động. Với lá ngược, xem nguồn lực nào đang bị bỏ quên hoặc khó tiếp cận.',
    question: 'Bạn đang có nguồn hỗ trợ nào mà chưa thực sự sử dụng?',
  },
  advice: {
    lens: 'Chuyển thông điệp thành hành động trong phạm vi chủ động của bạn; đây là gợi ý, không phải mệnh lệnh từ bộ bài.',
    question: 'Hành động nào vừa sức, cụ thể và có thể kiểm tra kết quả?',
  },
  next: {
    lens: 'Chọn một bước thử có giới hạn và mốc xem lại, thay vì suy ra một kết quả nghề nghiệp chắc chắn.',
    question: 'Bước nhỏ tiếp theo là gì, và khi nào bạn sẽ nhìn lại nó?',
  },
  root: {
    lens: 'Xem giả định, nhu cầu hoặc điều kiện nền đang ảnh hưởng tình huống, nhưng vẫn cần đối chiếu với trải nghiệm thật.',
    question: 'Nhu cầu hoặc giả định nào đang đứng phía sau phản ứng hiện tại?',
  },
  wish: {
    lens: 'Làm rõ điều bạn mong muốn hoặc cho là đúng; đừng đồng nhất mong muốn với bằng chứng rằng điều đó sẽ xảy ra.',
    question: 'Bạn đang mong điều gì, và tiêu chí thực tế nào cho thấy điều đó phù hợp?',
  },
  environment: {
    lens: 'Xem bối cảnh và những ảnh hưởng có thể quan sát. Lá bài không đọc được ý định kín đáo của người xung quanh.',
    question: 'Yếu tố môi trường nào có bằng chứng đang hỗ trợ hoặc gây khó cho bạn?',
  },
  fear: {
    lens: 'Phân biệt hy vọng và nỗi sợ với dữ kiện; một kịch bản đáng lo không tự trở thành lời dự báo.',
    question: 'Điều gì là nỗi sợ, điều gì đã được xác nhận, và điều gì bạn cần hỏi thêm?',
  },
  outcome: {
    lens: 'Đây là bức tranh có điều kiện khi nối các vị trí còn lại; không phải lời khẳng định về tương lai hoặc thời điểm xảy ra.',
    question: 'Nếu muốn một kết quả khác, bạn cần thay đổi yếu tố chủ động nào từ bây giờ?',
  },
};
