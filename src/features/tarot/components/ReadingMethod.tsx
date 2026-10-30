import { INTERPRETATION_VERSION, READING_SOURCES } from '../data/reading-topics';
export const TAROT_REFERENCE_URL = READING_SOURCES[0].url;
export function ReadingMethod() {
  return (
    <details className="method-note reading-method">
      <summary>Luận giải này dựa trên điều gì?</summary>
      <p>
        Bộ luận giải {INTERPRETATION_VERSION} có dữ liệu biên soạn cho 78 lá, cả xuôi/ngược; đối
        chiếu các chủ đề hình tượng của hệ Rider–Waite–Smith. Nghĩa ngược được đọc theo từng lá: có
        thể là cản trở, quá mức, hướng nội hoặc sự giải tỏa; không mặc định là xấu. Đây là bản diễn
        giải tiếng Việt hiện đại, không phải bản dịch nguyên văn Waite hay bộ nghĩa duy nhất.
      </p>
      <p>
        Kết quả kết hợp ý nghĩa lá, hướng xuôi/ngược, vị trí trải, chủ đề đã chọn, hướng dẫn riêng
        theo tình cảm/công việc/tài chính, các cặp lá và chủ đề lặp lại. Chủ đề tự động chỉ nhận
        diện bằng từ khóa; bạn có thể chọn chủ đề trước khi rút. Bộ quy tắc xử lý toàn bộ tại máy,
        không hiểu ngôn ngữ như một mô hình AI và không tự biết hoàn cảnh chưa được cung cấp.
      </p>
      <p>
        Phần liên hệ và hành động là hướng dẫn do ứng dụng biên soạn, không phải quy tắc dự báo đã
        kiểm chứng. Không có tỷ lệ “chính xác tương lai” được xác lập. Vị trí tương lai hoặc kết quả
        chỉ đọc như khả năng có điều kiện. Celtic Cross là một biến thể 10 vị trí.
      </p>
      <p>
        JoJo ref chỉ thay hình: 22 Major có đối ứng trong truyện; 56 Minor là liên tưởng mỹ thuật do
        ứng dụng chọn. Tính cách, năng lực hay phe phái của nhân vật không được dùng để quyết định
        nghĩa Tarot.
      </p>
      <ul>
        {READING_SOURCES.map((source) => (
          <li key={source.url}>
            <a className="text-link" href={source.url} target="_blank" rel="noreferrer">
              {source.label}
            </a>
          </li>
        ))}
      </ul>
      <p>
        Các liên kết nguồn cần Internet để mở. Toàn bộ nội dung tiếng Việt, quy tắc đọc và ảnh có
        thể lưu trong mục Cài đặt → Dùng ngoại tuyến.
      </p>
    </details>
  );
}
