import { Download, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  prepareOffline,
  registerOffline,
  useOfflineState,
  acceptOfflineUpdate,
  offlineAction,
} from '../../lib/offline';
const names: Record<string, string> = {
  core: 'Lõi ứng dụng',
  eastern: 'Tri thức Đông phương',
  western: 'Tri thức Tây phương',
  tarot: 'Tarot & minh họa',
};
export function OfflineSettings() {
  const state = useOfflineState();
  const [storage, setStorage] = useState<StorageEstimate | null>(null);
  const [persistent, setPersistent] = useState(false);
  const [note, setNote] = useState('');
  const inspect = async () => {
    try {
      if (navigator.storage) {
        setStorage(await navigator.storage.estimate());
        setPersistent(await navigator.storage.persisted());
      }
    } catch {}
  };
  useEffect(() => {
    void registerOffline();
    void inspect();
    const refresh = () => {
      void offlineAction('STATUS');
      void inspect();
    };
    window.addEventListener('focus', refresh);
    window.addEventListener('online', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('online', refresh);
    };
  }, []);
  return (
    <section className="offline-settings panel" aria-labelledby="offline-heading">
      <div>
        <span className="eyebrow">MANG THEO KHÔNG GIAN CỦA BẠN</span>
        <h2 id="offline-heading">Dùng ngoại tuyến</h2>
        <p>
          Gói lõi tự lưu khi mở ứng dụng online. Tải thêm Đông phương, Tây phương và Tarot để dùng
          đầy đủ khi không có Internet. Có thể dừng và tiếp tục tải; chỉ file còn thiếu hoặc sai
          hash được tải lại.
        </p>
        <p className="small muted">
          AI online, đăng nhập và liên kết nguồn ngoài cần mạng. Xóa pack chỉ xóa tài nguyên, giữ hồ
          sơ và nhật ký. Trình duyệt vẫn có thể dọn dữ liệu nếu thiết bị thiếu chỗ.
        </p>
      </div>
      <div className="offline-settings-actions">
        {state.updateAvailable && (
          <div className="offline-update" role="status">
            <p>
              Có phiên bản mới. Hãy lưu nhật ký và nội dung đang nhập; trang sẽ tải lại sau khi cập
              nhật đủ tài nguyên.
            </p>
            <button
              className="button primary"
              disabled={state.busy}
              onClick={() => void acceptOfflineUpdate()}
            >
              Tôi đã lưu · Cập nhật ứng dụng
            </button>
          </div>
        )}
        {state.supported ? (
          <>
            <p
              className={`offline-bundle-status ${state.ready ? 'success small' : 'muted small'}`}
              role="status"
            >
              {state.ready
                ? 'Đã sẵn sàng dùng offline'
                : state.busy
                  ? `Đang tải / kiểm tra ${state.done}/${state.total || '…'} tệp`
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
            {state.busy && (
              <button className="button subtle" onClick={() => void offlineAction('CANCEL')}>
                Dừng tải · Giữ phần đã tải
              </button>
            )}
            {state.total > 0 && (
              <>
                <progress
                  max={state.total}
                  value={state.done}
                  aria-label="Tiến độ tải ngoại tuyến"
                />
                <span className="small muted">
                  {state.done}/{state.total} tệp · {(state.bytes / 1048576).toFixed(2)} MiB · phiên
                  bản {state.version}
                </span>
              </>
            )}
            <div className="offline-pack-list">
              {state.packs.map((pack) => (
                <article key={pack.id} className="offline-pack" data-pack={pack.id}>
                  <div>
                    <h3>{names[pack.id] ?? pack.id}</h3>
                    <p className="small" role="status">
                      {pack.ready ? 'Sẵn sàng offline' : `${pack.done}/${pack.total} tệp`} ·{' '}
                      {(pack.bytes / 1048576).toFixed(2)} MiB
                    </p>
                  </div>
                  <div>
                    <button
                      className="button subtle"
                      disabled={state.busy}
                      onClick={() => void prepareOffline(pack.id)}
                    >
                      {pack.ready ? 'Kiểm tra gói' : 'Tải / tiếp tục'}
                    </button>
                    {pack.id !== 'core' && (
                      <button
                        className="button subtle"
                        disabled={state.busy || pack.done === 0}
                        onClick={() => void offlineAction('DELETE_PACK', pack.id)}
                      >
                        Xóa pack {names[pack.id]}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
            <button
              className="button subtle"
              disabled={state.busy}
              onClick={() => void offlineAction('CLEAR_OLD')}
            >
              Dọn tài nguyên phiên bản cũ
            </button>
          </>
        ) : (
          <p className="small muted">
            Tải PWA ngoại tuyến cần bản production trên HTTPS hoặc localhost. Dữ liệu cá nhân và các
            phép tính vẫn được xử lý tại máy.
          </p>
        )}
        {storage && (
          <p className="small muted">
            Trình duyệt đang dùng khoảng {((storage.usage ?? 0) / 1048576).toFixed(1)} MiB /{' '}
            {((storage.quota ?? 0) / 1048576).toFixed(0)} MiB được cấp. Bao gồm cả dữ liệu cá nhân,
            cache cũ và metadata; khác kích thước tải pack.
          </p>
        )}
        {navigator.storage?.persist && (
          <button
            className="button subtle"
            onClick={async () => {
              try {
                const allowed = await navigator.storage.persist();
                setPersistent(allowed);
                setNote(
                  allowed
                    ? 'Trình duyệt đã cấp lưu trữ bền vững.'
                    : 'Trình duyệt chưa cấp lưu trữ bền vững; vẫn nên xuất bản sao.',
                );
                await inspect();
              } catch {
                setNote('Chưa xin được lưu trữ bền vững. Hãy xuất bản sao dữ liệu.');
              }
            }}
          >
            {persistent ? 'Kiểm tra lưu trữ bền vững' : 'Xin giữ dữ liệu bền vững'}
          </button>
        )}
        {note && (
          <p className="small" role="status">
            {note}
          </p>
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
