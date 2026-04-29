import { User, Calendar, MapPin, Clock, Crown, ChevronRight } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="pb-20 px-4 pt-8 max-w-lg mx-auto relative z-10">
      <h1 className="text-2xl mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Thông tin cá nhân
      </h1>

      {/* Profile Card */}
      <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-purple-500/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <User size={40} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl text-purple-100 mb-1">Người dùng</h2>
            <p className="text-purple-300/70 text-sm">Thành viên miễn phí</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3 text-purple-100">
            <Calendar size={18} className="text-purple-300" />
            <span className="text-sm">Chưa có thông tin ngày sinh</span>
          </div>
          <div className="flex items-center gap-3 text-purple-100">
            <Clock size={18} className="text-purple-300" />
            <span className="text-sm">Chưa có thông tin giờ sinh</span>
          </div>
          <div className="flex items-center gap-3 text-purple-100">
            <MapPin size={18} className="text-purple-300" />
            <span className="text-sm">Chưa có thông tin nơi sinh</span>
          </div>
        </div>

        <button className="w-full mt-6 bg-purple-800/30 hover:bg-purple-800/50 transition-colors rounded-xl py-3 text-purple-100 border border-purple-500/20">
          Cập nhật thông tin
        </button>
      </div>

      {/* Birth Chart Info */}
      <div className="bg-purple-900/30 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-purple-500/20">
        <h3 className="text-lg mb-4 text-purple-200">Bát tự & Horoscope</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-800/20 rounded-lg p-3">
            <p className="text-purple-300/70 text-xs mb-1">Cung Mệnh</p>
            <p className="text-purple-100">--</p>
          </div>

          <div className="bg-purple-800/20 rounded-lg p-3">
            <p className="text-purple-300/70 text-xs mb-1">Ngũ Hành</p>
            <p className="text-purple-100">--</p>
          </div>

          <div className="bg-purple-800/20 rounded-lg p-3">
            <p className="text-purple-300/70 text-xs mb-1">Sun Sign</p>
            <p className="text-purple-100">--</p>
          </div>

          <div className="bg-purple-800/20 rounded-lg p-3">
            <p className="text-purple-300/70 text-xs mb-1">Moon Sign</p>
            <p className="text-purple-100">--</p>
          </div>
        </div>

        <p className="text-purple-300/60 text-xs mt-4 text-center">
          Nhập ngày sinh để xem bát tự và natal chart
        </p>
      </div>

      {/* Premium Upgrade */}
      <div className="bg-gradient-to-br from-yellow-900/40 to-purple-900/40 backdrop-blur-sm rounded-2xl p-6 border border-yellow-500/20">
        <div className="flex items-center gap-3 mb-4">
          <Crown className="text-yellow-400" size={32} />
          <div>
            <h3 className="text-lg text-yellow-300">Nâng cấp Premium</h3>
            <p className="text-purple-300/70 text-xs">Mở khóa tất cả tính năng</p>
          </div>
        </div>

        <ul className="space-y-2 mb-6 text-sm text-purple-100">
          <li className="flex items-center gap-2">
            <ChevronRight size={16} className="text-purple-300" />
            AI hỏi đáp không giới hạn
          </li>
          <li className="flex items-center gap-2">
            <ChevronRight size={16} className="text-purple-300" />
            Chọn ngày đẹp chi tiết
          </li>
          <li className="flex items-center gap-2">
            <ChevronRight size={16} className="text-purple-300" />
            Natal chart đầy đủ
          </li>
          <li className="flex items-center gap-2">
            <ChevronRight size={16} className="text-purple-300" />
            AI Tarot không giới hạn
          </li>
        </ul>

        <button className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-xl py-3 text-white hover:opacity-90 transition-opacity">
          Nâng cấp ngay
        </button>
      </div>
    </div>
  );
}
