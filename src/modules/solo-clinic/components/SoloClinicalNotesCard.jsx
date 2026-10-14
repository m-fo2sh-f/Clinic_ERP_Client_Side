import React from 'react';
import { Stethoscope } from 'lucide-react';

/**
 * SoloClinicalNotesCard — Single Responsibility Component
 * Handles Chief Complaint, Clinical Examination findings, and multi-tag diagnoses selector.
 */
export default function SoloClinicalNotesCard({
  chiefComplaint,
  onChiefComplaintChange,
  clinicalExamination,
  onClinicalExaminationChange,
  diagnoses = [],
  currentDiagnosisInput,
  onDiagnosisInputChange,
  onAddDiagnosis,
  onRemoveDiagnosis,
  disabled = false,
}) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
      {/* Title */}
      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
        <Stethoscope className="h-4 w-4 text-clinic-600" />
        الفحص السريري والتشخيص (Clinical Notes)
      </h3>

      {/* Chief Complaint */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          شكوى المريض الرئيسية (Chief Complaint)
        </label>
        <textarea
          rows={2}
          disabled={disabled}
          value={chiefComplaint}
          onChange={(e) => onChiefComplaintChange(e.target.value)}
          placeholder="اكتب شكوى المريض، الأعراض ومدتها..."
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500/20 focus:border-clinic-500 outline-none disabled:opacity-60"
        />
      </div>

      {/* Examination Findings */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          الفحص الطبي والملاحظات (Examination Findings)
        </label>
        <textarea
          rows={3}
          disabled={disabled}
          value={clinicalExamination}
          onChange={(e) => onClinicalExaminationChange(e.target.value)}
          placeholder="ملاحظات الفحص، أصوات الصدر، البطن، فحص الحلق..."
          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500/20 focus:border-clinic-500 outline-none disabled:opacity-60"
        />
      </div>

      {/* Structured Diagnoses Tag Chips */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          التشخيص (Diagnoses) - اضغط Enter للإضافة
        </label>
        <div className="border border-slate-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-clinic-500/20 focus-within:border-clinic-500 bg-white">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {diagnoses.map((tag) => (
              <span
                key={tag}
                className="bg-clinic-50 text-clinic-700 border border-clinic-200 text-xs px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 font-medium"
              >
                {tag}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onRemoveDiagnosis(tag)}
                  className="hover:text-red-500 text-clinic-500 font-bold cursor-pointer"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            disabled={disabled}
            value={currentDiagnosisInput}
            onChange={(e) => onDiagnosisInputChange(e.target.value)}
            onKeyDown={onAddDiagnosis}
            placeholder="اكتب التشخيص واضغط Enter (مثال: التهاب حاد في الحلق)..."
            className="w-full text-xs outline-none bg-transparent disabled:opacity-60"
          />
        </div>
      </div>
    </div>
  );
}
