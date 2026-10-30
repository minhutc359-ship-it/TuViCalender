import { Download, CheckCircle2, WifiOff } from 'lucide-react';
import { useEffect } from 'react';
import { prepareOffline, registerOffline, useOfflineState } from '../../lib/offline';
export function OfflineSettings() {
  const state = useOfflineState();
  useEffect(() => {
    void registerOffline();
  }, []);
  return (
    <section className="offline-settings panel" aria-labelledby="offline-heading">
      <div>
        <span className="eyebrow">MANG THEO KHÔNG GIAN CỦA BẠN</span>
        <h2 id="offline-heading">Dùng ngoại tuyến</h2>
        <p>
          Lưu giao diện, đủ 78 hình của mỗi bộ và dữ liệu luận giải tiếng Việt. Sau khi tải xong,
          bạn có thể tắt mạng, mở lại ứng dụng, rút bài, đọc luận giải và lưu nhật ký.
        </p>
        <p className="small muted">
          Chat AI và liên kết nguồn bên ngoài cần Internet. Xóa dữ liệu trình duyệt sẽ xóa bản ngoại
          tuyến và dữ liệu cá nhân lưu tại máy.
        </p>
      </div>
      <div className="offline-settings-actions">
        {state.supported ? (
          <>
            <p className={state.ready ? 'success small' : 'muted small'} role="status">
              {state.ready
                ? 'Đã sẵn sàng dùng offline'
                : state.busy
                  ? `Đang tải ${state.done}/${state.total || '…'} tệp`
                  : 'Chưa tải đủ bộ dữ liệu offline'}
            </p>
            <button
              className="button primary"
              disabled={state.busy}
              onClick={() => void prepareOffline()}
            >
              {state.ready ? <CheckCircle2 size={17} /> : <Download size={17} />}{' '}
              {state.ready
                ? 'Kiểm tra / tải lại'
                : state.busy
                  ? 'Đang lưu…'
                  : 'Tải bộ dữ liệu offline'}
            </button>
            {state.total > 0 && (
              <>
                <progress
                  max={state.total}
                  value={state.done}
                  aria-label="Tiến độ tải ngoại tuyến"
                />
                <span className="small muted">
                  {state.done}/{state.total} tệp · {(state.bytes / 1048576).toFixed(1)} MiB
                </span>
              </>
            )}
          </>
        ) : (
          <>
            <WifiOff size={25} />
            <p className="small muted">
              Chế độ ngoại tuyến khả dụng trên bản ứng dụng hoàn chỉnh chạy bằng HTTPS hoặc
              localhost. Bản xem thử vẫn luận giải tại máy, nhưng chưa lưu toàn bộ ứng dụng để mở
              lại khi mất mạng.
            </p>
          </>
        )}
        {state.error && (
          <p className="error-message" role="alert">
            {state.error}
          </p>
        )}
      </div>
    </section>
  );
}
