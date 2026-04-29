import { useState } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

export default function TarotPage() {
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [isReading, setIsReading] = useState(false);

  const cards = [
    { name: 'The Fool', meaning: 'Khởi đầu mới, phiêu lưu' },
    { name: 'The Magician', meaning: 'Sức mạnh, kỹ năng' },
    { name: 'The High Priestess', meaning: 'Trực giác, bí ẩn' },
    { name: 'The Empress', meaning: 'Sáng tạo, nuôi dưỡng' },
    { name: 'The Emperor', meaning: 'Quyền lực, ổn định' },
    { name: 'The Lovers', meaning: 'Tình yêu, lựa chọn' },
    { name: 'The Chariot', meaning: 'Ý chí, chiến thắng' },
    { name: 'Strength', meaning: 'Can đảm, kiên nhẫn' },
    { name: 'The Hermit', meaning: 'Tự soi, cô độc' },
    { name: 'Wheel of Fortune', meaning: 'Vận may, thay đổi' },
  ];

  const handleCardSelect = (index: number) => {
    if (selectedCards.length < 3 && !selectedCards.includes(index)) {
      setSelectedCards([...selectedCards, index]);
    }
  };

  const handleReset = () => {
    setSelectedCards([]);
    setIsReading(false);
  };

  const handleReveal = () => {
    setIsReading(true);
  };

  return (
    <div className="pb-20 px-4 pt-8 max-w-lg mx-auto relative z-10">
      <h1 className="text-2xl mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        Bói Tarot
      </h1>

      {/* Instructions */}
      <div className="bg-purple-900/30 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-purple-500/20 text-center">
        <Sparkles className="mx-auto mb-3 text-purple-300" size={32} />
        <p className="text-purple-100 mb-2">
          {selectedCards.length === 0 && 'Chọn 3 lá bài để xem vận mệnh'}
          {selectedCards.length > 0 && selectedCards.length < 3 && `Đã chọn ${selectedCards.length}/3 lá`}
          {selectedCards.length === 3 && !isReading && 'Nhấn "Giải Bài" để xem kết quả'}
          {isReading && 'Kết quả bói bài của bạn'}
        </p>
      </div>

      {/* Card Grid */}
      {!isReading && (
        <div className="grid grid-cols-5 gap-3 mb-6">
          {cards.map((card, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCardSelect(idx)}
              disabled={selectedCards.length === 3}
              className={`
                aspect-[2/3] rounded-lg transition-all
                ${
                  selectedCards.includes(idx)
                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-2 border-purple-300'
                    : 'bg-purple-900/40 border border-purple-500/30 hover:border-purple-400'
                }
                ${selectedCards.length === 3 && !selectedCards.includes(idx) ? 'opacity-30' : ''}
              `}
            >
              <div className="h-full flex items-center justify-center">
                <Sparkles size={20} className="text-purple-200" />
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* Selected Cards Reading */}
      {isReading && (
        <div className="space-y-4 mb-6">
          {selectedCards.map((cardIdx, position) => (
            <motion.div
              key={cardIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: position * 0.3 }}
              className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/20"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-24 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shrink-0">
                  <Sparkles size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg text-purple-200 mb-1">
                    {position === 0 && 'Quá khứ: '}
                    {position === 1 && 'Hiện tại: '}
                    {position === 2 && 'Tương lai: '}
                    {cards[cardIdx].name}
                  </h3>
                  <p className="text-purple-300/80 text-sm mb-2">{cards[cardIdx].meaning}</p>
                  <p className="text-purple-100/70 text-sm">
                    Lá bài này cho thấy {position === 0 && 'những gì đã qua trong hành trình của bạn'}
                    {position === 1 && 'tình hình hiện tại bạn đang đối mặt'}
                    {position === 2 && 'những gì sắp đến trong tương lai gần'}.
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {selectedCards.length === 3 && !isReading && (
          <button
            onClick={handleReveal}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl py-4 text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Sparkles size={20} />
            Giải Bài
          </button>
        )}

        {(selectedCards.length > 0 || isReading) && (
          <button
            onClick={handleReset}
            className="flex-1 bg-purple-900/40 border border-purple-500/30 rounded-xl py-4 text-purple-100 hover:bg-purple-900/60 transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={20} />
            Bói Lại
          </button>
        )}
      </div>
    </div>
  );
}
