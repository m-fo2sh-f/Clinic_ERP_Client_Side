import React, { useState } from 'react';
import { Pill } from 'lucide-react';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '../../../../components/ui/Dialog';
import Button from '../../../../components/ui/Button';
import DoctorDrugForm from './DoctorDrugForm';
import DoctorDrugTable from './DoctorDrugTable';
import {
  useDoctorDrugsQuery,
  useCreateDoctorDrugMutation,
  useDeleteDoctorDrugMutation,
  useToggleFavoriteMutation,
} from '../../hooks/useDoctorDrugsCatalog';

/**
 * Modal to manage doctor's personal prescribing catalog and default dosages.
 */
export default function DoctorDrugsModal({ isOpen, onClose }) {
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: drugs = [], isLoading } = useDoctorDrugsQuery();
  const createMutation = useCreateDoctorDrugMutation();
  const deleteMutation = useDeleteDoctorDrugMutation();
  const toggleFavoriteMutation = useToggleFavoriteMutation();

  const handleCreate = (payload) => {
    createMutation.mutate(payload, {
      onSuccess: () => {
        setShowAddForm(false);
      },
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا الدواء من جدولك الخاص؟')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleFavorite = (id) => {
    toggleFavoriteMutation.mutate(id);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3" dir="rtl">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-clinic-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-slate-900 m-0">
                جدول أدوية الطبيب الخاصة والأكثر وصفاً
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                أدويتك المفضلة التي تظهر في بداية الاقتراحات مع جرعاتها الافتراضية
              </DialogDescription>
            </div>
          </div>

          <Button
            type="button"
            variant={showAddForm ? 'outline' : 'default'}
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-xs gap-1"
          >
            {showAddForm ? 'إخفاء النموذج' : '➕ إضافة صنف جديد'}
          </Button>
        </div>
      </DialogHeader>
      <DialogClose onClick={onClose} />

      <div className="space-y-4 my-2 max-h-[70vh] overflow-y-auto pr-1" dir="rtl">
        {showAddForm && (
          <DoctorDrugForm
            onSubmit={handleCreate}
            isLoading={createMutation.isPending}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        <DoctorDrugTable
          drugs={drugs}
          isLoading={isLoading}
          onToggleFavorite={handleToggleFavorite}
          onDelete={handleDelete}
        />
      </div>
    </Dialog>
  );
}
