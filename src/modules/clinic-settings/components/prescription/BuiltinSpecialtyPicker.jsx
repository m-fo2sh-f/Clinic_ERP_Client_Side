import React from 'react';
import { Palette, Check } from 'lucide-react';
import { BUILTIN_TEMPLATES, COLOR_PRESETS } from '../../constants/prescriptionConstants';

export default function BuiltinSpecialtyPicker({
  selectedTemplateId = 'egyptian_clinic',
  onSelectTemplate,
  selectedColor = '#991b1b',
  onSelectColor,
  disabled = false,
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5 animate-in fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 m-0">اختر القالب التخصصي المناسب لعيادتك</h3>
          <p className="text-xs text-slate-500 mt-0.5 m-0">
            تخطيطات هندسية طبية جاهزة تحاكي روشتات أكبر الاستشاريين والعيادات المصرية.
          </p>
        </div>
      </div>

      {/* Specialty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {BUILTIN_TEMPLATES.map((tmpl) => {
          const Icon = tmpl.icon;
          const isSelected = selectedTemplateId === tmpl.id;

          return (
            <button
              key={tmpl.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectTemplate(tmpl.id)}
              className={`text-right p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between text-xs space-y-3 disabled:opacity-60 disabled:cursor-not-allowed ${
                isSelected
                  ? `${tmpl.accent} ring-2 ring-clinic-600 shadow-xs font-semibold`
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 text-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-white text-clinic-700 shadow-2xs' : 'bg-slate-100 text-slate-600'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 border border-slate-200/60">
                    {tmpl.badge}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-xs m-0">{tmpl.title}</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-normal m-0">{tmpl.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Primary Color Palette */}
      <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Palette className="h-4 w-4 text-clinic-600" />
          <span>اللون المميز للهيدر والخطوط (Primary Color Theme):</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {COLOR_PRESETS.map((color) => {
            const isChosen = selectedColor?.toLowerCase() === color.hex.toLowerCase();
            return (
              <button
                key={color.hex}
                type="button"
                disabled={disabled}
                onClick={() => onSelectColor(color.hex)}
                title={color.name}
                className={`h-7 w-7 rounded-full flex items-center justify-center transition-all cursor-pointer border-2 disabled:opacity-50 ${
                  isChosen ? 'border-slate-800 scale-110 shadow-sm' : 'border-white hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
              >
                {isChosen && <Check className="h-3.5 w-3.5 text-white drop-shadow" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
