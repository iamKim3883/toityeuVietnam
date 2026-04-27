import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { GeneratedImage } from '../types';
import Modal from './Modal';
import { ImageIcon, ZoomIn, Star, Download } from 'lucide-react';

interface ResultGridProps {
  isLoading: boolean;
  images: GeneratedImage[];
  prompt: string;
  numberOfImages: number;
}

const Skeleton: React.FC = () => (
  <div className="relative aspect-[9/16] bg-red-800/50 rounded-2xl overflow-hidden animate-pulse border border-yellow-500/10">
     <div className="w-full h-full bg-gradient-to-br from-red-800 to-red-900"></div>
     <Star className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-yellow-500/20" />
  </div>
);

const ResultGrid: React.FC<ResultGridProps> = ({ isLoading, images, prompt, numberOfImages }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const handleDownload = (imageUrl: string, id: string) => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.open(imageUrl, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `nghe-thuat-hon-viet-${id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: numberOfImages }).map((_, index) => (
            <Skeleton key={index} />
          ))}
        </div>
      );
    }

    if (images.length > 0) {
      return (
        <div className="grid grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className="relative group overflow-hidden rounded-2xl shadow-2xl bg-red-950 border border-yellow-500/20"
              >
                <img
                  src={image.url}
                  alt={`Generated art ${image.id}`}
                  className="w-full h-auto object-cover aspect-[9/16] transition-transform duration-700 group-hover:scale-110 cursor-zoom-in allow-context-menu"
                  onClick={() => setSelectedImageIndex(index)}
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 flex flex-col gap-2">
                  <button 
                    onClick={() => setSelectedImageIndex(index)}
                    className="flex items-center justify-center gap-2 py-2 bg-yellow-400 text-red-900 font-bold rounded-xl hover:bg-yellow-300 transition-all transform active:scale-95 shadow-xl text-[10px] uppercase tracking-tighter"
                  >
                    <ZoomIn className="h-3 w-3" />
                    <span>Xem chi tiết</span>
                  </button>
                  <button 
                    onClick={() => handleDownload(image.url, image.id)}
                    className="flex items-center justify-center gap-2 py-2 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl hover:bg-white/20 transition-all transform active:scale-95 shadow-xl text-[10px] uppercase tracking-tighter border border-white/20"
                  >
                    <Download className="h-3 w-3" />
                    <span>Tải ảnh về</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-grow flex flex-col items-center justify-center text-center p-8 bg-black/10 rounded-3xl border border-dashed border-yellow-500/20"
      >
        <div className="bg-yellow-400/10 p-6 rounded-full mb-6">
          <ImageIcon className="h-16 w-16 text-yellow-400/50" />
        </div>
        <h3 className="text-2xl font-bold text-yellow-200 mb-3 uppercase tracking-tight">Sẵn sàng kiến tạo kiệt tác</h3>
        <p className="text-red-100/70 max-w-sm leading-relaxed">
          Tải ảnh lên và để chúng tôi biến hoá phong cách đẳng cấp thượng lưu cho riêng bạn.
        </p>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6 px-2 text-zinc-900">
        <h2 className="text-xl font-bold text-yellow-400 uppercase tracking-widest flex items-center gap-2">
          <Star className="w-5 h-5 fill-yellow-400" />
          KẾT QUẢ HIỂN THỊ
        </h2>
        {images.length > 0 && <span className="text-xs text-yellow-500/50 font-bold uppercase">{images.length}/{numberOfImages} ẢNH</span>}
      </div>
      
      <div className="flex-grow">
        {renderContent()}
      </div>

      {selectedImageIndex !== null && (
        <Modal 
          isOpen={selectedImageIndex !== null} 
          onClose={() => setSelectedImageIndex(null)} 
          images={images} 
          initialIndex={selectedImageIndex} 
          prompt={prompt}
        />
      )}
    </div>
  );
};

export default ResultGrid;