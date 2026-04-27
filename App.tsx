
import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ImageUploader from './components/ImageUploader';
import ConceptSelector from './components/ConceptSelector';
import CustomPromptInput from './components/CustomPromptInput';
import ResultGrid from './components/ResultGrid';
import LoadingModal from './components/LoadingModal';
import { CONCEPTS, LOADING_QUOTES } from './constants';
import { generatePortraits } from './services/geminiService';
import type { GeneratedImage, NumberOfImages } from './types';
import { Star } from 'lucide-react';

const App: React.FC = () => {
  // State management
  const [uploadedImage, setUploadedImage] = useState<{ file: File, preview: string } | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<string | null>('concept_2');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isFaceLockEnabled, setIsFaceLockEnabled] = useState<boolean>(true);
  const [withFlowers, setWithFlowers] = useState<boolean>(false);
  const [numberOfImages, setNumberOfImages] = useState<NumberOfImages>(2);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [finalPrompt, setFinalPrompt] = useState<string>('');

  // Handlers
  const handleImageUpload = (file: File, previewUrl: string) => {
    setUploadedImage({ file, preview: previewUrl });
    setError(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleGenerate = useCallback(async () => {
    if (!uploadedImage) {
      setError('Vui lòng tải ảnh gốc lên.');
      return;
    }
    if (!selectedConcept) {
      setError('Vui lòng chọn một concept.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const conceptPrompt = CONCEPTS.find(c => c.key === selectedConcept)?.prompt || '';
      const fullPrompt = `${conceptPrompt}${customPrompt ? `, ${customPrompt}` : ''}.`;
      setFinalPrompt(fullPrompt);

      const imageBase64 = await fileToBase64(uploadedImage.file);
      
      const params = {
        prompt: fullPrompt,
        negativePrompt: 'blurry, grainy, deformed, distorted, ugly, disfigured, poorly drawn, extra limbs, bad anatomy, mutated, watermark, signature, text, multiple people',
        aspectRatio: '9:16' as const,
        imageBase64,
        mimeType: uploadedImage.file.type,
        numberOfImages: numberOfImages,
        isFaceLockEnabled: isFaceLockEnabled,
        withFlowers: withFlowers,
      };

      const results = await generatePortraits(params);
      setGeneratedImages(results);
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi không mong muốn.');
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, selectedConcept, customPrompt, isFaceLockEnabled, withFlowers, numberOfImages]);

  const isGenerateDisabled = isLoading || !uploadedImage || !selectedConcept;

  return (
    <div className="min-h-screen relative overflow-x-hidden pt-10 pb-20">
      <div className="vn-star-background">
        <Star className="star-element top-[10%] left-[5%] w-32 h-32 rotate-12 opacity-5" />
        <Star className="star-element top-[60%] right-[10%] w-48 h-48 -rotate-12 opacity-5" />
        <Star className="star-element bottom-[10%] left-[15%] w-20 h-20 rotate-45 opacity-5" />
      </div>

      <LoadingModal isOpen={isLoading} quotes={LOADING_QUOTES} />

      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 relative z-10"
      >
        <div className="flex items-center justify-center gap-4 mb-2">
           <Star className="w-10 h-10 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
           <h1 className="text-5xl md:text-7xl font-bold text-yellow-400 tracking-tighter uppercase drop-shadow-lg flex items-center justify-center gap-4">
             TÔI <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">❤️</span> VIỆT NAM
           </h1>
           <Star className="w-10 h-10 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
        </div>

        {/* Billboard Marquee Subtitle */}
        <div className="relative overflow-hidden w-full max-w-4xl mx-auto py-3 bg-red-900/40 border-y-2 border-yellow-500/20 mb-8 mt-4">
          <motion.div 
            className="whitespace-nowrap flex gap-16"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ 
              ease: "linear", 
              duration: 25, 
              repeat: Infinity 
            }}
          >
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-16 items-center flex-shrink-0">
                <span className="text-xs md:text-sm font-black text-yellow-400 uppercase tracking-[0.3em]">
                  ⭐ 100+ Concept Nghệ Thuật Độc Bản
                </span>
                <span className="text-xs md:text-sm font-black text-yellow-400 uppercase tracking-[0.3em]">
                  ⭐ Tôn Vinh Bản Sắc Di Sản Việt
                </span>
                <span className="text-xs md:text-sm font-black text-yellow-500 uppercase tracking-[0.3em]">
                  ⭐ Chạm Vào Tương Lai
                </span>
                <span className="text-xs md:text-sm font-black text-yellow-400 uppercase tracking-[0.3em]">
                  ⭐ Kiến Tạo Kiệt Tác
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 flex flex-col gap-6"
        >
          <div className="vn-card p-6 border-yellow-500/30">
            <ImageUploader 
              onImageUpload={handleImageUpload} 
              preview={uploadedImage?.preview || null} 
              isFaceLockEnabled={isFaceLockEnabled}
              onToggleFaceLock={setIsFaceLockEnabled}
              withFlowers={withFlowers}
              onToggleWithFlowers={setWithFlowers}
            />
          </div>

          <div className="vn-card p-6 border-yellow-500/30">
            <ConceptSelector selectedConcept={selectedConcept} onSelectConcept={setSelectedConcept} />
          </div>

          <div className="vn-card p-6 border-yellow-500/30">
            <CustomPromptInput customPrompt={customPrompt} onCustomPromptChange={setCustomPrompt} />
          </div>
          
          <div className="vn-card p-6 border-yellow-500/30">
            <h3 className="text-md font-semibold text-yellow-200 mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              Số lượng ảnh tạo ra
            </h3>
            <div className="grid grid-cols-4 gap-1.5 bg-red-950/40 p-1.5 rounded-2xl border border-yellow-500/10">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <button
                  key={num}
                  onClick={() => setNumberOfImages(num as NumberOfImages)}
                  className={`text-center text-sm font-bold py-3 rounded-xl transition-all duration-300 transform active:scale-90
                    ${numberOfImages === num
                      ? 'bg-yellow-400 text-red-900 shadow-lg scale-105'
                      : 'text-red-100 hover:bg-red-800/50'
                    }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-2"
          >
            {error && <p className="text-yellow-400 text-sm text-center mb-4 font-bold bg-red-900/40 py-2 rounded-lg">{error}</p>}
            <button
              onClick={handleGenerate}
              disabled={isGenerateDisabled}
              className={`w-full font-black py-5 px-4 rounded-2xl transition-all duration-500 text-xl uppercase tracking-widest shadow-2xl
                ${isGenerateDisabled 
                  ? 'bg-red-900/50 text-red-700 cursor-not-allowed border border-red-800' 
                  : 'bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 text-red-900 hover:shadow-yellow-500/40 border-b-4 border-yellow-600'
                }`}
            >
              {isLoading ? 'Đang tạo tuyệt tác...' : `Bắt đầu kiến tạo (${numberOfImages})`}
            </button>
          </motion.div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 flex flex-col gap-6"
        >
          <div className="vn-card p-4 min-h-[600px] border-yellow-500/20">
            <ResultGrid 
              isLoading={isLoading} 
              images={generatedImages} 
              prompt={finalPrompt}
              numberOfImages={numberOfImages}
            />
          </div>
          <div className="text-center mt-4">
             <motion.a 
                whileHover={{ scale: 1.05, y: -2 }}
                href="https://www.facebook.com/nguyenkimngan3883?mibextid=ZbWKwL" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm text-yellow-400 text-sm font-bold py-4 px-10 rounded-full border border-yellow-400/30 hover:bg-white/20 transition-all shadow-xl uppercase tracking-widest"
              >
                CẬP NHẬT THÊM ẢNH ĐẸP TÀI ĐÂY
                <Star className="w-4 h-4 fill-yellow-400" />
              </motion.a>
          </div>
        </motion.div>
      </main>

      <motion.footer 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-16 text-center pb-8 relative z-10"
      >
        <div className="h-px w-20 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent mx-auto mb-4" />
        <p className="font-artistic text-lg italic text-yellow-400/60 drop-shadow-sm">
          ©2026, Nguyễn Kim Ngân
        </p>
        <p className="text-red-200 text-[10px] mt-1 uppercase tracking-[0.4em] opacity-30 font-bold">
          Proudly Vietnamese
        </p>
      </motion.footer>
    </div>
  );
};

export default App;