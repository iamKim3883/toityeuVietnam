import React, { useCallback, useState } from 'react';
import ImageCropperModal from './ImageCropperModal';
import { Upload, Star, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (file: File, previewUrl: string) => void;
  preview: string | null;
  isFaceLockEnabled: boolean;
  onToggleFaceLock: (enabled: boolean) => void;
  withFlowers: boolean;
  onToggleWithFlowers: (enabled: boolean) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, 
  preview, 
  isFaceLockEnabled, 
  onToggleFaceLock,
  withFlowers,
  onToggleWithFlowers
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<{file: File, url: string} | null>(null);

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Định dạng file không hợp lệ. Vui lòng chọn JPG, PNG, hoặc WebP.');
        return;
      }
      if (file.size > 15 * 1024 * 1024) { // 15MB
        alert('Dung lượng file quá lớn. Vui lòng chọn ảnh nhỏ hơn 15MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageToCrop({ file, url: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedFile: File, previewUrl: string) => {
    onImageUpload(croppedFile, previewUrl);
    setImageToCrop(null); // Close modal
  };

  const handleUseOriginal = () => {
      if (imageToCrop) {
        onImageUpload(imageToCrop.file, imageToCrop.url);
        setImageToCrop(null);
      }
  };


  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files);
  }, []);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e.target.files);
    e.target.value = ''; // Reset input to allow re-uploading the same file
  };
  
  const triggerFileInput = () => {
    document.getElementById('file-input')?.click();
  }

  return (
    <div className="text-white">
      {imageToCrop && (
        <ImageCropperModal
          isOpen={!!imageToCrop}
          onClose={() => setImageToCrop(null)}
          imgSrc={imageToCrop.url}
          onConfirm={handleCropComplete}
          onUseOriginal={handleUseOriginal}
        />
      )}
      <h2 className="text-lg font-bold mb-6 flex items-center gap-3 uppercase tracking-tighter text-yellow-400">
        <Star className="w-5 h-5 fill-yellow-400" />
        Gửi gắm chân dung
      </h2>
      <div 
        className={`relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl transition-all duration-500 overflow-hidden group 
          ${isDragging ? 'border-yellow-400 bg-yellow-400/10' : 'border-yellow-500/20 bg-red-950/20 hover:border-yellow-400/40'} 
          ${!preview ? 'cursor-pointer' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={!preview ? triggerFileInput : undefined}
      >
        <input 
          type="file" 
          id="file-input" 
          className="hidden" 
          accept="image/jpeg,image/png,image/webp"
          onChange={onFileInputChange}
        />
        {preview ? (
          <div className="flex flex-col items-center text-center w-full">
            <div className="relative mb-6">
              <img src={preview} alt="Xem trước" className="max-h-64 w-auto rounded-2xl object-contain shadow-2xl border border-yellow-500/30" />
              <button 
                onClick={triggerFileInput} 
                className="absolute -bottom-3 -right-3 p-3 bg-yellow-400 text-red-900 rounded-full shadow-xl hover:bg-yellow-300 transition-all hover:scale-110 border-2 border-red-900"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            <p className="text-yellow-200/60 text-xs font-bold uppercase tracking-widest">Ảnh đã sẵn sàng</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="bg-yellow-400/10 p-5 rounded-full mb-6 mx-auto group-hover:scale-110 transition-transform">
              <Upload className="h-10 w-10 text-yellow-400" />
            </div>
            <p className="mt-2 text-md font-bold text-yellow-200">
              Thả ảnh vào đây hoặc <span className="text-yellow-400 underline decoration-yellow-400/30">nhấn để chọn</span>
            </p>
            <p className="mt-4 text-xs text-yellow-100/40 uppercase tracking-widest leading-loose">
              JPG, PNG, WebP • Tối đa 15MB<br/>
              Khuyến nghị ảnh rõ mặt, đủ sáng
            </p>
          </div>
        )}
      </div>
      <div className="hidden">
        <input 
          type="checkbox" 
          checked={isFaceLockEnabled} 
          onChange={() => onToggleFaceLock(!isFaceLockEnabled)}
        />
        <input 
          type="checkbox" 
          checked={withFlowers} 
          onChange={() => onToggleWithFlowers(!withFlowers)}
        />
      </div>
    </div>
  );
};

export default ImageUploader;