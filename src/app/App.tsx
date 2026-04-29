import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router';
import { Home, Calendar, MessageCircle, Sparkles, User, Moon } from 'lucide-react';
import HomePage from './pages/HomePage';
import CalendarPage from './pages/CalendarPage';
import ChatPage from './pages/ChatPage';
import TarotPage from './pages/TarotPage';
import ProfilePage from './pages/ProfilePage';

function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-purple-500/20 z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('/') ? 'text-purple-400' : 'text-slate-400 hover:text-purple-300'
          }`}
        >
          <Home size={24} />
          <span className="text-xs">Trang chủ</span>
        </Link>

        <Link
          to="/calendar"
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('/calendar') ? 'text-purple-400' : 'text-slate-400 hover:text-purple-300'
          }`}
        >
          <Calendar size={24} />
          <span className="text-xs">Lịch</span>
        </Link>

        <Link
          to="/chat"
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('/chat') ? 'text-purple-400' : 'text-slate-400 hover:text-purple-300'
          }`}
        >
          <MessageCircle size={24} />
          <span className="text-xs">AI Chat</span>
        </Link>

        <Link
          to="/tarot"
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('/tarot') ? 'text-purple-400' : 'text-slate-400 hover:text-purple-300'
          }`}
        >
          <Sparkles size={24} />
          <span className="text-xs">Tarot</span>
        </Link>

        <Link
          to="/profile"
          className={`flex flex-col items-center gap-1 transition-colors ${
            isActive('/profile') ? 'text-purple-400' : 'text-slate-400 hover:text-purple-300'
          }`}
        >
          <User size={24} />
          <span className="text-xs">Cá nhân</span>
        </Link>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950">
        {/* Starry background effect */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-1 h-1 bg-purple-300 rounded-full animate-pulse" />
          <div className="absolute top-20 right-20 w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-100" />
          <div className="absolute top-40 left-1/4 w-1 h-1 bg-purple-200 rounded-full animate-pulse delay-200" />
          <div className="absolute bottom-40 right-1/3 w-1 h-1 bg-purple-300 rounded-full animate-pulse delay-300" />
          <Moon className="absolute top-8 right-8 text-purple-300/30 animate-pulse" size={80} />
        </div>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/tarot" element={<TarotPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>

        <Navigation />
      </div>
    </BrowserRouter>
  );
}
