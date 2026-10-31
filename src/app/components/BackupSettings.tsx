import { useState } from 'react';
import {
  createBackup,
  parseBackup,
  previewBackup,
  importBackupToDevice,
  type Backup,
} from '../../offline/backup';
import { deviceStorage } from '../../offline/db';
export function BackupSettings() {
  const [pending, setPending] = useState<Backup | null>(null);
  const [preview, setPreview] = useState<ReturnType<typeof previewBackup>>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [importing, setImporting] = useState(false);
  return (
    <section className="backup-settings panel" aria-labelledby="backup-heading">
      <h2 id="backup-heading">Sao lưu dữ liệu</h2>
      <p>
        Xuất hồ sơ, nhật ký, lịch, bookmark và chat local. Tệp JSON có dữ liệu cá nhân; hãy giữ ở
        nơi riêng tư. Thông tin đăng nhập và lịch sử AI theo tài khoản không được xuất.
      </p>
      <button
        className="button primary"
        onClick={() => {
          setError('');
          setNotice('');
          try {
            const backup = createBackup(deviceStorage);
            const url = URL.createObjectURL(
              new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }),
            );
            const a = document.createElement('a');
            a.href = url;
            a.download = `AstroAI-backup-${backup.createdAt.slice(0, 10)}.json`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            setNotice('Đã tạo tệp sao lưu.');
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        Xuất bản sao JSON
      </button>
      <label className="backup-file-label">
        Chọn bản sao để nhập
        <input
          type="file"
          disabled={importing}
          accept="application/json,.json"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            setPending(null);
            setError('');
            setNotice('');
            if (!file) return;
            try {
              if (file.size > 8 * 1048576) throw new Error('Tệp sao lưu vượt quá 8 MiB.');
              const b = parseBackup(await file.text());
              setPreview(previewBackup(b, deviceStorage));
              setPending(b);
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        />
      </label>
      {pending && (
        <div className="backup-preview">
          <p>
            Chỉ thêm mục mới; ID trùng và cài đặt hiện tại được giữ. AI luôn cần bật lại trên thiết
            bị mới. Ngày sao lưu: {new Date(pending.createdAt).toLocaleDateString('vi-VN')}.
          </p>
          <ul>
            {preview.map((p) => (
              <li key={p.title}>
                {p.title}: thêm {p.added}, giữ tại máy {p.kept}
              </li>
            ))}
          </ul>
          <button
            className="button primary"
            disabled={importing}
            onClick={async () => {
              if (importing) return;
              setImporting(true);
              try {
                await importBackupToDevice(pending);
                setPending(null);
                setNotice('Đã gộp dữ liệu. Tải lại trang để áp dụng các cài đặt vừa nhập.');
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setImporting(false);
              }
            }}
          >
            Xác nhận gộp dữ liệu
          </button>
          <button className="button subtle" onClick={() => setPending(null)}>
            Hủy nhập
          </button>
        </div>
      )}
      {notice && <p role="status">{notice}</p>}
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
