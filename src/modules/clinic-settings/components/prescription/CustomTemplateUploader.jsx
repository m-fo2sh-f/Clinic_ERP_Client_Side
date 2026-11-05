import React, { useRef, useState } from 'react';
import { Upload, Trash2, Image as ImageIcon, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { ALLOWED_IMAGE_CONFIG } from '../../constants/prescriptionConstants';

export default function CustomTemplateUploader({
  imageUrl = null,
  onUpload,
  onDelete,
  validateFile,
  isUploading = false,
  isDeleting = false,
  disabled = false,
}) {
  const fileInputRef = useRef(null);
  const [localError, setLocalError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalError(null);

    // 1. Client-side validation
    const validationError = validateFile ? validateFile(file) : null;
    if (validationError) {
      setLocalError(validationError);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      await onUpload(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setLocalError(err?.message || 'فشل رفع الصورة إلى الخادم.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('هل تريد حذف صورة قالب الروشتة الحالية نهائياً من السيرفر؟')) {
      setLocalError(null);
      try {
        await onDelete();
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        setLocalError(err?.message || 'فشل حذف الصورة من السيرفر.');
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 animate-in fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 m-0">رفع صورة خلفية الروشتة الرسمية</h3>
          <p className="text-xs text-slate-500 mt-0.5 m-0">
            الصيغ المدعومة: JPG، PNG، WebP بحد أقصى {ALLOWED_IMAGE_CONFIG.maxSizeFormatted}. لا يُسمح بملفات SVG أو PDF.
          </p>
        </div>
      </div>

      {localError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{localError}</span>
        </div>
      )}

      {imageUrl ? (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div className="h-20 w-16 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs shrink-0 flex items-center justify-center p-1">
              <img
                src={imageUrl}
                alt="قالب الروشتة المخصص"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>الصورة مثبتة ومحفوظة بنجاح على السيرفر</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 m-0">
                يتم استخدام هذه الصورة كخلفية لجميع روشتات العيادة، وتطبع الأدوية داخل الهوامش بدقة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <input
              type="file"
              ref={fileInputRef}
              accept={ALLOWED_IMAGE_CONFIG.extensions.join(',')}
              onChange={handleFileChange}
              className="hidden"
              disabled={disabled || isUploading || isDeleting}
            />
            <button
              type="button"
              disabled={disabled || isUploading || isDeleting}
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-clinic-600" /> : <Upload className="h-4 w-4" />}
              <span>استبدال الصورة</span>
            </button>

            <button
              type="button"
              disabled={disabled || isUploading || isDeleting}
              onClick={handleDelete}
              className="px-3.5 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin text-red-600" /> : <Trash2 className="h-4 w-4" />}
              <span>حذف</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          className="p-8 border-2 border-dashed border-slate-300 hover:border-clinic-500 hover:bg-clinic-50/20 rounded-2xl text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3"
        >
          <input
            type="file"
            ref={fileInputRef}
            accept={ALLOWED_IMAGE_CONFIG.extensions.join(',')}
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled || isUploading}
          />
          <div className="h-12 w-12 rounded-full bg-clinic-50 text-clinic-600 flex items-center justify-center">
            {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImageIcon className="h-6 w-6" />}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 m-0">
              {isUploading ? 'جاري رفع وتثبيت الصورة على السيرفر...' : 'اضغط لاختيار صورة الروشتة أو اسحبها هنا'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 m-0">
              PNG أو JPG عالية الجودة مناسبة لمقاس A5 أو A4 (أقصى حجم {ALLOWED_IMAGE_CONFIG.maxSizeFormatted})
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
