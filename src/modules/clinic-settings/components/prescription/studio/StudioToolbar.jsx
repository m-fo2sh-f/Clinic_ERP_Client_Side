import React from 'react';
import { Eye, Upload, Trash2, Magnet } from 'lucide-react';

export default function StudioToolbar({
  paperSize = 'A4',
  onPaperSizeChange,
  snapGrid = '5mm',
  onSnapGridChange,
  isSnapEnabled = true,
  onToggleSnap,
  showGuideImage = true,
  onToggleGuideImage,
  guideImageUrl = null,
  onUploadClick,
  onDeleteGuideImage,
  onOpenPreview,
  isUploading = false,
  isDeleting = false,
  disabled = false,
}) {
  const currentSnap = snapGrid || (isSnapEnabled ? '5mm' : 'off');

  const cycleSnap = () => {
    if (onSnapGridChange) {
      if (currentSnap === 'off') onSnapGridChange('5mm');
      else if (currentSnap === '5mm') onSnapGridChange('10mm');
      else onSnapGridChange('off');
    } else if (onToggleSnap) {
      onToggleSnap();
    }
  };

  return (
    <div className="bg-white px-5 py-3.5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-left" dir="ltr">
      {/* Paper Size Switcher (A4 default) */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onPaperSizeChange('A4')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            paperSize === 'A4'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          A4 (210×297 mm)
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onPaperSizeChange('A5')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            paperSize === 'A5'
              ? 'bg-white text-blue-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          A5 (148×210 mm)
        </button>
      </div>

      {/* Tools & Preview Actions */}
      <div className="flex items-center flex-wrap gap-2">
        {/* Snap to Grid Selector */}
        <button
          type="button"
          onClick={cycleSnap}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
            currentSnap !== 'off'
              ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
              : 'bg-slate-50 text-slate-600 border-slate-200'
          }`}
          title="Click to cycle snap: Off -> 5mm -> 10mm"
        >
          <Magnet className="h-3.5 w-3.5" />
          <span>Snap: {currentSnap !== 'off' ? currentSnap : 'Off'}</span>
        </button>

        {/* Guide Image Upload / Delete */}
        {guideImageUrl ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleGuideImage}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                showGuideImage ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}
            >
              {showGuideImage ? 'Hide Guide' : 'Show Guide'}
            </button>
            <button
              type="button"
              disabled={isDeleting || disabled}
              onClick={onDeleteGuideImage}
              title="Delete letterhead guide image"
              className="p-1.5 rounded-xl text-red-600 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={isUploading || disabled}
            onClick={onUploadClick}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Upload className="h-3.5 w-3.5 text-slate-500" />
            <span>{isUploading ? 'Uploading...' : 'Upload Guide'}</span>
          </button>
        )}

        {/* Quick Simulation Preview Button */}
        <button
          type="button"
          onClick={onOpenPreview}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
        >
          <Eye className="h-3.5 w-3.5 text-blue-300" />
          <span>Simulate Print</span>
        </button>
      </div>
    </div>
  );
}
