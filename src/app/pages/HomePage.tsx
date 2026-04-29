import { Star, Heart, Briefcase, Activity, TrendingUp } from 'lucide-react';
import { getCurrentLunarDate, formatLunarDate, getCanChi } from '../../lib/lunar';
import { analyzeDay } from '../../lib/goodDays';

export default function HomePage() {
  const now = new Date();
  const today = now.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const lunar = getCurrentLunarDate();
  const lunarDateStr = formatLunarDate(lunar);
  const canChi = getCanChi(lunar.year);
  const dayAnalysis = analyzeDay(now.getDate(), now.getMonth() + 1, now.getFullYear());

  // Calculate fortune scores based on day analysis
  const fortuneScore = Math.min(10, Math.floor(dayAnalysis.score / 10));
  const loveScore = Math.max(5, Math.min(10, fortuneScore + Math.floor(Math.random() * 3) - 1));
  const careerScore = Math.max(5, Math.min(10, fortuneScore + Math.floor(Math.random() * 3) - 1));
  const healthScore = Math.max(5, Math.min(10, fortuneScore + Math.floor(Math.random() * 3) - 1));

  return (
    <div className="pb-20 px-4 pt-8 max-w-lg mx-auto relative z-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          AstroAI
        </h1>
        <p className="text-purple-300/80 text-sm mb-1">{today}</p>
        <p className="text-purple-400/70 text-xs">{lunarDateStr} • Năm {canChi}</p>
        <p className="text-purple-300/60 text-xs mt-1">
          Ngày {dayAnalysis.truc} • {dayAnalysis.isHoangDao ? '🌟 Hoàng Đạo' : 'Hắc Đạo'}
        </p>
      </div>

      {/* Daily Summary Card */}
      <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
        <h2 className="text-xl mb-4 text-purple-200">Vận mệnh hôm nay</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <TrendingUp className="text-yellow-400" size={20} />
              </div>
              <span className="text-purple-100">Tài lộc</span>
            </div>
            <div className="flex gap-1">
              {[...Array(fortuneScore)].map((_, i) => (
                <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
              ))}
              {[...Array(10 - fortuneScore)].map((_, i) => (
                <Star key={i + fortuneScore} size={16} className="text-slate-600" />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                <Heart className="text-pink-400" size={20} />
              </div>
              <span className="text-purple-100">Tình duyên</span>
            </div>
            <div className="flex gap-1">
              {[...Array(loveScore)].map((_, i) => (
                <Star key={i} size={16} className="text-pink-400 fill-pink-400" />
              ))}
              {[...Array(10 - loveScore)].map((_, i) => (
                <Star key={i + loveScore} size={16} className="text-slate-600" />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Briefcase className="text-blue-400" size={20} />
              </div>
              <span className="text-purple-100">Công việc</span>
            </div>
            <div className="flex gap-1">
              {[...Array(careerScore)].map((_, i) => (
                <Star key={i} size={16} className="text-blue-400 fill-blue-400" />
              ))}
              {[...Array(10 - careerScore)].map((_, i) => (
                <Star key={i + careerScore} size={16} className="text-slate-600" />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Activity className="text-green-400" size={20} />
              </div>
              <span className="text-purple-100">Sức khỏe</span>
            </div>
            <div className="flex gap-1">
              {[...Array(healthScore)].map((_, i) => (
                <Star key={i} size={16} className="text-green-400 fill-green-400" />
              ))}
              {[...Array(10 - healthScore)].map((_, i) => (
                <Star key={i + healthScore} size={16} className="text-slate-600" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lucky Items */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-purple-900/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
          <p className="text-purple-300/70 text-xs mb-1">Màu may mắn</p>
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full ${
              dayAnalysis.tu.color === 'Xanh' ? 'bg-blue-500' :
              dayAnalysis.tu.color === 'Đỏ' ? 'bg-red-500' :
              dayAnalysis.tu.color === 'Trắng' ? 'bg-white' :
              'bg-purple-500'
            }`} />
            <span className="text-purple-100">{dayAnalysis.tu.color}</span>
          </div>
        </div>

        <div className="bg-purple-900/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
          <p className="text-purple-300/70 text-xs mb-1">Số may mắn</p>
          <p className="text-2xl text-purple-100">{lunar.day}, {lunar.month}, {fortuneScore}</p>
        </div>

        <div className="bg-purple-900/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
          <p className="text-purple-300/70 text-xs mb-1">Sao hôm nay</p>
          <p className="text-xl text-purple-100">{dayAnalysis.tu.name}</p>
        </div>

        <div className="bg-purple-900/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20">
          <p className="text-purple-300/70 text-xs mb-1">Giờ tốt</p>
          <p className="text-sm text-purple-100">{dayAnalysis.luckyHours[0]}</p>
        </div>
      </div>

      {/* Horoscope Summary */}
      <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20 shadow-lg shadow-purple-500/10">
        <h3 className="text-lg mb-3 text-purple-200">Lời khuyên hôm nay</h3>
        <p className="text-purple-100/90 leading-relaxed mb-4">
          {dayAnalysis.description}
        </p>

        {dayAnalysis.goodFor.length > 0 && (
          <div className="mb-3">
            <p className="text-purple-200 text-sm mb-2">✅ Nên làm:</p>
            <div className="flex flex-wrap gap-2">
              {dayAnalysis.goodFor.map((activity) => (
                <span
                  key={activity}
                  className="bg-green-900/30 border border-green-500/30 rounded-lg px-2 py-1 text-xs text-green-200"
                >
                  {activity}
                </span>
              ))}
            </div>
          </div>
        )}

        {dayAnalysis.badFor.length > 0 && (
          <div>
            <p className="text-purple-200 text-sm mb-2">❌ Nên tránh:</p>
            <div className="flex flex-wrap gap-2">
              {dayAnalysis.badFor.map((activity) => (
                <span
                  key={activity}
                  className="bg-red-900/30 border border-red-500/30 rounded-lg px-2 py-1 text-xs text-red-200"
                >
                  {activity}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
