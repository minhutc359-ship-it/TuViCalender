import { BrowserRouter, Routes, Route, NavLink, Link, useLocation } from 'react-router';
import { useEffect, lazy, Suspense } from 'react';
import {
  Home,
  CalendarDays,
  MessageCircle,
  Sparkles,
  UserRound,
  Orbit,
  Settings,
} from 'lucide-react';
import { TarotAppearanceProvider } from '../features/tarot/context/TarotAppearance';
import { VisualThemeProvider, useVisualTheme, THEME_NAMES } from './components/astro/VisualTheme';
import { MysticBackdrop } from './components/astro/MysticBackdrop';
import { AstroSymbol } from './components/astro/AstroSymbol';
import { registerOffline } from '../lib/offline';
import { PersistenceStatus } from './components/PersistenceStatus';
const HomePage = lazy(() => import('./pages/HomePage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const TarotPage = lazy(() => import('./pages/TarotPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const KnowledgePage = lazy(() => import('./pages/KnowledgePage'));
const OraclePage = lazy(() => import('./pages/OraclePage'));

const links = [
  { to: '/', name: 'Tổng quan', icon: Home },
  { to: '/calendar', name: 'Lịch vạn niên', icon: CalendarDays },
  { to: '/tarot', name: 'Tarot', icon: Sparkles },
  { to: '/chat', name: 'Trợ lý AI', icon: MessageCircle },
  { to: '/profile', name: 'Hồ sơ', icon: UserRound },
  { to: '/settings', name: 'Cài đặt', icon: Settings },
];
function Shell() {
  const { pathname } = useLocation();
  const { resolved } = useVisualTheme();
  useEffect(() => {
    void registerOffline();
  }, []);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    const auxiliaryTitle = pathname === '/knowledge' ? 'Thư viện chiêm nghiệm' : pathname === '/oracle' ? 'Gieo quẻ offline' : 'Trang không tồn tại';
    document.title = `${links.find((l) => l.to === pathname)?.name ?? auxiliaryTitle} · AstroAI`;
  }, [pathname]);
  return (
    <div className="app-shell">
      <MysticBackdrop />
      <a className="skip-link" href="#main">
        Đến nội dung chính
      </a>
      <header className="site-header">
        <Link to="/" className="brand" aria-label="AstroAI — Trang chủ">
          <span className="brand-mark">
            <AstroSymbol name="fusion" size={31} />
          </span>
          <span>
            Astro<span className="gold">AI</span>
            <small>CELESTIAL FENG SHUI</small>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Điều hướng chính">
          {links.map(({ to, name }) => (
            <NavLink end={to === '/'} key={to} to={to}>
              {name}
            </NavLink>
          ))}
        </nav>
        <Link to="/profile" className="header-profile" aria-label="Mở hồ sơ cá nhân">
          <UserRound size={18} />
          <span>Không gian của bạn</span>
        </Link>
      </header>
      <div className="tradition-ribbon">
        <span>ASTROAI / KHÔNG GIAN CHIÊM NGHIỆM</span>
        <Link to="/settings" aria-label="Đổi chủ đề giao diện">
          <AstroSymbol
            name={resolved === 'eastern' ? 'Càn' : resolved === 'western' ? 'star' : 'fusion'}
            size={14}
          />
          {THEME_NAMES[resolved]}
        </Link>
      </div>
      <main id="main" className="main-content">
        <PersistenceStatus />
        <Suspense
          fallback={
            <div className="empty-state" role="status">
              Đang mở không gian của bạn…
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/tarot" element={<TarotPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/knowledge" element={<KnowledgePage />} />
            <Route path="/oracle" element={<OraclePage />} />
            <Route
              path="*"
              element={
                <div className="empty-state">
                  <Orbit />
                  <h1>Chưa tìm thấy vì sao này</h1>
                  <Link to="/" className="button primary">
                    Về trang chủ
                  </Link>
                </div>
              }
            />
          </Routes>
        </Suspense>
      </main>
      <footer className="site-footer">
        <span>✦ ASTROAI</span>
        <p>Một khoảng lặng để hiểu mình hơn.</p>
        <small>Chiêm tinh & Tarot dành cho tham khảo và tự suy ngẫm.</small>
      </footer>
      <nav className="mobile-nav" aria-label="Điều hướng di động">
        {links.map(({ to, name, icon: Icon }) => (
          <NavLink end={to === '/'} key={to} to={to}>
            <Icon size={20} />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
export default function App() {
  return (
    <TarotAppearanceProvider>
      <BrowserRouter>
        <VisualThemeProvider>
          <Shell />
        </VisualThemeProvider>
      </BrowserRouter>
    </TarotAppearanceProvider>
  );
}
