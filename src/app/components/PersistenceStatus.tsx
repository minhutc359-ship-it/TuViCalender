import { useSyncExternalStore } from 'react';
import { Link } from 'react-router';
import { deviceDatabase } from '../../offline/db';
export function PersistenceStatus() {
  const state = useSyncExternalStore(
    deviceDatabase.subscribe,
    () => deviceDatabase.state,
    () => deviceDatabase.state,
  );
  return state.error ? (
    <aside className="persistence-warning panel" role="alert">
      {state.error}{' '}
      <Link to="/settings" className="text-link">
        Mở sao lưu dữ liệu
      </Link>
    </aside>
  ) : null;
}
