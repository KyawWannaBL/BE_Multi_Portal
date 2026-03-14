import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, Loader2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PhotoCaptureProps {
  onCaptureComplete: (file: File, previewUrl: string) => void;
  isUploading?: boolean;
}

export default function PhotoCapture({ onCaptureComplete, isUploading = false }: PhotoCaptureProps) {
  const { lang } = useLanguage();
  const t = (en: string, my: string) => (lang === 'en' ? en : my);
  
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a local preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    // Pass the raw file back to the parent for Supabase storage upload
    onCaptureComplete(file, objectUrl);
  };

  const retakePhoto = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Hidden Native Camera Input */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {!preview ? (
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-48 border-2 border-dashed border-[#D4AF37]/50 hover:border-[#D4AF37] bg-[#D4AF37]/5 rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all group"
        >
          <div className="p-4 bg-[#D4AF37]/10 rounded-full group-hover:scale-110 transition-transform">
            <Camera className="h-8 w-8 text-[#D4AF37]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold tracking-widest text-[#D4AF37] uppercase">
              {t('Capture Evidence', 'ဓာတ်ပုံရိုက်ရန်')}
            </p>
            <p className="text-[10px] text-gray-500 mt-1 uppercase">
              {t('Tap to open camera', 'ကင်မရာဖွင့်ရန် နှိပ်ပါ')}
            </p>
          </div>
        </button>
      ) : (
        <div className="relative w-full h-64 rounded-[2rem] overflow-hidden border border-white/10 group">
          <img 
            src={preview} 
            alt="Evidence Preview" 
            className={`w-full h-full object-cover ${isUploading ? 'opacity-50 grayscale' : ''}`}
          />
          
          {/* Overlay Controls */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            {!isUploading && (
              <button 
                type="button"
                onClick={retakePhoto}
                className="px-6 py-3 bg-[#0A0F1C]/80 backdrop-blur-md border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-colors"
              >
                {t('Retake', 'ပြန်ရိုက်မည်')}
              </button>
            )}
          </div>

          {/* Upload Status Badge */}
          {isUploading && (
            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-[#D4AF37]/30 px-4 py-2 rounded-full flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-[#D4AF37] animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                {t('Uploading...', 'တင်နေပါသည်...')}
              </span>
            </div>
          )}

          {!isUploading && preview && (
            <div className="absolute top-4 right-4 bg-emerald-500/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
              <CheckCircle2 className="h-3 w-3 text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">
                {t('Secured', 'ရိုက်ကူးပြီး')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
