import React from 'react';
import { Pill, Printer, Plus, Trash2, FileCheck, Loader2 } from 'lucide-react';
import Button from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

/**
 * PrescriptionSheet — digital Rx table with add/remove medication rows,
 * general advice, follow-up date, print, and Complete Examination actions.
 *
 * @param {Object}   props
 * @param {string}   props.branchName            – Branch name for Rx header
 * @param {Array}    props.medications            – Array of medication objects
 * @param {Function} props.onAddMedication        – Add empty medication row
 * @param {Function} props.onUpdateMedication     – (id, field, value) => void
 * @param {Function} props.onRemoveMedication     – (id) => void
 * @param {string}   props.generalAdvice          – General advice text
 * @param {Function} props.onGeneralAdviceChange  – (value) => void
 * @param {string}   props.followUpDate           – ISO date string
 * @param {Function} props.onFollowUpDateChange   – (value) => void
 * @param {boolean}  props.isPrescriptionSaved    – Whether the Rx has been saved
 * @param {boolean}  props.isSubmitting           – Whether the API call is in progress
 * @param {Function} props.onCompleteExamination  – Save / complete action
 */
export default function PrescriptionSheet({
  branchName,
  medications,
  onAddMedication,
  onUpdateMedication,
  onRemoveMedication,
  generalAdvice,
  onGeneralAdviceChange,
  followUpDate,
  onFollowUpDateChange,
  isPrescriptionSaved,
  isSubmitting,
  onCompleteExamination,
}) {
  const handlePrint = () => window.print();

  return (
    <Card className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
      <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between">
        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2 m-0">
          <Pill className="h-5 w-5 text-clinic-600" /> Digital Prescription
          Sheet
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="gap-1.5"
        >
          <Printer className="h-4 w-4" /> Print Rx
        </Button>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Printable Rx area */}
        <div
          id="printable-rx-sheet"
          className="bg-white border-2 border-slate-200 rounded-2xl p-8 space-y-6"
        >
          {/* Rx header */}
          <div className="border-b-2 border-clinic-600 pb-4 flex justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-clinic-800">
                {branchName}
              </h2>
            </div>
            <div className="text-right text-3xl font-black text-clinic-600">
              Rx
            </div>
          </div>

          {/* Medications */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase text-slate-700">
                Prescribed Medications
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddMedication}
                className="no-print text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add Row
              </Button>
            </div>

            {medications.length === 0 && (
              <p className="text-xs text-slate-400 italic py-2">
                No medications added yet. Click "Add Row" to prescribe.
              </p>
            )}

            {medications.map((med) => (
              <div
                key={med.id}
                className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-start"
              >
                <input
                  className="sm:col-span-1 px-3 py-1.5 text-xs bg-slate-50 border rounded-lg"
                  value={med.name}
                  onChange={(e) =>
                    onUpdateMedication(med.id, 'name', e.target.value)
                  }
                  placeholder="Drug Name"
                />
                <input
                  className="px-3 py-1.5 text-xs bg-slate-50 border rounded-lg"
                  value={med.dosage}
                  onChange={(e) =>
                    onUpdateMedication(med.id, 'dosage', e.target.value)
                  }
                  placeholder="Dosage"
                />
                <input
                  className="px-3 py-1.5 text-xs bg-slate-50 border rounded-lg"
                  value={med.frequency}
                  onChange={(e) =>
                    onUpdateMedication(med.id, 'frequency', e.target.value)
                  }
                  placeholder="Frequency"
                />
                <input
                  className="px-3 py-1.5 text-xs bg-slate-50 border rounded-lg"
                  value={med.duration}
                  onChange={(e) =>
                    onUpdateMedication(med.id, 'duration', e.target.value)
                  }
                  placeholder="Duration"
                />
                <input
                  className="px-3 py-1.5 text-xs bg-slate-50 border rounded-lg"
                  value={med.instructions}
                  onChange={(e) =>
                    onUpdateMedication(med.id, 'instructions', e.target.value)
                  }
                  placeholder="Instructions"
                />
                <button
                  onClick={() => onRemoveMedication(med.id)}
                  className="no-print text-red-500 hover:text-red-700 transition-colors self-center"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* General Advice */}
          <div className="pt-4 border-t space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-700">
              General Advice
            </label>
            <textarea
              rows={2}
              value={generalAdvice}
              onChange={(e) => onGeneralAdviceChange(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-clinic-500 no-print"
              placeholder="Enter general advice for the patient..."
            />
            {/* Print-only static version */}
            {generalAdvice && (
              <p className="hidden print:block text-xs text-slate-800 whitespace-pre-wrap">
                {generalAdvice}
              </p>
            )}
          </div>

          {/* Follow-up date */}
          <div className="pt-4 border-t space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-700">
              Follow-up Date
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => onFollowUpDateChange(e.target.value)}
              className="px-3 py-1.5 text-xs border rounded-lg bg-slate-50 font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Complete Examination CTA */}
        <div className="flex justify-end pt-4 border-t no-print">
          <Button
            variant="default"
            size="md"
            onClick={onCompleteExamination}
            disabled={isSubmitting || isPrescriptionSaved}
            className={`gap-2 ${
              isPrescriptionSaved
                ? 'bg-emerald-500 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : isPrescriptionSaved ? (
              <>
                <FileCheck className="h-4 w-4" /> Completed ✓
              </>
            ) : (
              <>
                <FileCheck className="h-4 w-4" /> Complete Examination
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
