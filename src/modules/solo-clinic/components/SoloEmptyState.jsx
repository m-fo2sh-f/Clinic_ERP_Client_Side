import React from 'react';
import { Stethoscope, UserPlus } from 'lucide-react';
import Button from '../../../components/ui/Button';

/**
 * SoloEmptyState — Single Responsibility Component
 * Renders the state when no active patient encounter is in progress.
 */
export default function SoloEmptyState({ onOpenWalkIn }) {
  return (
    <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center shadow-xs">
      <div className="w-16 h-16 bg-clinic-50 border border-clinic-100 text-clinic-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
        <Stethoscope className="h-8 w-8" />
      </div>
      <h2 className="text-lg font-bold text-slate-800 mb-1">جاهز لبدء كشف طبي جديد</h2>
      <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
        انقر على الزر بالأسفل للبحث عن مريض سابق بالاسم أو الهاتف، أو تسجيل مريض جديد وبدء الكشف فوراً.
      </p>
      <Button
        variant="primary"
        onClick={onOpenWalkIn}
        className="gap-2 text-sm py-3 px-6 shadow-md font-bold cursor-pointer"
      >
        <UserPlus className="h-4.5 w-4.5" />
        بدء كشف طبي (Walk-in)
      </Button>
    </div>
  );
}
