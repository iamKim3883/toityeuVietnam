import React from 'react';
import { Star, MessageSquarePlus } from 'lucide-react';

interface CustomPromptInputProps {
  customPrompt: string;
  onCustomPromptChange: (prompt: string) => void;
}

const CustomPromptInput: React.FC<CustomPromptInputProps> = ({ customPrompt, onCustomPromptChange }) => {
  return (
    <div className="text-white">
      <h2 className="text-lg font-bold text-yellow-400 mb-6 flex items-center gap-3 uppercase tracking-tighter">
        <Star className="w-5 h-5 fill-yellow-400" />
        Góp nét tinh hoa
      </h2>
      <div className="relative group">
        <div className="absolute top-4 left-4 text-yellow-500/40 group-focus-within:text-yellow-400/80 transition-colors">
          <MessageSquarePlus className="w-5 h-5" />
        </div>
        <textarea
          value={customPrompt}
          onChange={(e) => onCustomPromptChange(e.target.value)}
          placeholder="Mô tả thêm: nụ cười rạng rỡ, trang phục lộng lẫy, bối cảnh sang trọng..."
          className="w-full h-32 pl-12 pr-4 py-4 bg-red-950/40 border-2 border-yellow-500/10 rounded-2xl focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300 text-sm text-yellow-50 yellowPlaceholder resize-none outline-none hover:border-yellow-500/20"
          aria-label="Custom prompt details"
        />
      </div>
      <p className="mt-3 text-[10px] text-yellow-200/40 uppercase tracking-[0.2em] font-bold text-center">
        Để trống nếu bạn muốn sử dụng concept mặc định
      </p>
    </div>
  );
};

export default CustomPromptInput;