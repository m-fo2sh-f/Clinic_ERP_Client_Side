import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Phone,
  Calendar,
  UserCheck,
  FileText,
  HeartPulse,
  Clock,
  Loader2,
  X,
  Stethoscope,
  BadgeCheck,
  ChevronRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useBranchContext } from '../../context/BranchContext';
import { usePatientsQuery, usePatientDetailQuery } from '../../hooks/usePatients';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '../../components/ui/Dialog';

export default function PatientsPage() {
  const { activeBranch } = useBranchContext();
  const branchId = activeBranch?.id;
  const branchName = activeBranch?.name || 'Active Branch';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // Fetch patient directory
  const { data: patients = [], isLoading, isError, refetch } = usePatientsQuery(branchId, searchQuery);

  // Fetch detailed record for selected patient
  const { data: patientDetail, isLoading: isDetailLoading } = usePatientDetailQuery(selectedPatientId);

  // Calculated totals
  const totalCompletedVisits = useMemo(() => {
    return patients.reduce((acc, p) => acc + (p.total_completed_count ?? p.completed_appointments_count ?? 0), 0);
  }, [patients]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ─── TOP ACTION BANNER ─── */}
      <div className="bg-white px-6 py-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 m-0 flex items-center gap-2">
            <Users className="h-6 w-6 text-clinic-600 shrink-0" />
            Patients Directory & Medical Profiles
          </h2>
          <p className="text-xs text-slate-550 mt-1 flex items-center gap-2 font-medium">
            <span>Branch Scoped:</span>
            <strong className="text-clinic-700 bg-clinic-50 border border-clinic-150 px-2.5 py-0.5 rounded text-[11px] font-bold">
              {branchName}
            </strong>
            {isLoading && <Loader2 className="h-3.5 w-3.5 text-clinic-600 animate-spin ml-1" />}
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2">
            <ShieldCheck className="h-4 w-4 text-clinic-600 shrink-0" />
            <span>Multi-Tenant Records Active</span>
          </div>
        </div>
      </div>

      {/* ─── STATS SUMMARY WIDGETS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3.5 bg-clinic-50 text-clinic-600 rounded-bl-xl">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Patients</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{patients.length}</p>
          <p className="text-xs text-slate-500 mt-1 font-medium">Recorded in active branch directory</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3.5 bg-emerald-50 text-emerald-600 rounded-bl-xl">
            <UserCheck className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Consultations</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{totalCompletedVisits}</p>
          <p className="text-xs text-emerald-600 font-medium">Finished clinical examinations</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3.5 bg-indigo-50 text-indigo-600 rounded-bl-xl">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Search Query</p>
          <p className="text-lg font-bold text-slate-800 mt-2 truncate">
            {searchQuery ? `"${searchQuery}"` : 'All Patients'}
          </p>
          <p className="text-xs text-slate-500 font-medium">Instant name & phone filter</p>
        </div>
      </div>

      {/* ─── MAIN PATIENT LIST & SEARCH SECTION ─── */}
      <Card className="shadow-sm">
        <CardHeader className="p-5 bg-slate-50/50 border-b border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-clinic-600 shrink-0" />
            Patient Directory List
          </CardTitle>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient name or phone..."
              className="w-full pl-10 pr-9 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-clinic-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 className="h-8 w-8 text-clinic-600 animate-spin mb-3" />
              <span className="text-xs font-semibold">Loading patients directory...</span>
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-red-500 font-bold">
              Failed to load patient records. Please try refreshing.
            </div>
          ) : patients.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-700 m-0">No Patients Found</p>
              <p className="text-xs text-slate-400 mt-1 m-0">
                {searchQuery ? `No matching records found for "${searchQuery}"` : 'No patients registered under this branch yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-6">Patient Name</th>
                    <th className="py-3.5 px-6">Phone Contact</th>
                    <th className="py-3.5 px-6">Gender / Age</th>
                    <th className="py-3.5 px-6 text-center">Completed Visits</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-clinic-50 border border-clinic-200 text-clinic-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {patient.name ? patient.name.substring(0, 2).toUpperCase() : 'PT'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-sm">{patient.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {patient.id.substring(0, 8)}...</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-mono text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{patient.phone || 'N/A'}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 capitalize">
                        {patient.gender || 'N/A'} {patient.age ? `• ${patient.age} yrs` : ''}
                      </td>

                      <td className="py-4 px-6 text-center">
                        {(() => {
                          const visitsCount = patient.total_completed_count ?? patient.completed_appointments_count ?? 0;
                          return (
                            <Badge
                              variant={visitsCount > 0 ? 'success' : 'secondary'}
                              className="font-bold text-xs px-2.5 py-0.5"
                            >
                              {visitsCount} Visits
                            </Badge>
                          );
                        })()}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPatientId(patient.id)}
                          className="font-semibold text-xs gap-1.5 hover:bg-clinic-50 hover:text-clinic-700 hover:border-clinic-300"
                        >
                          <Stethoscope className="h-3.5 w-3.5" />
                          <span>Medical Profile</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── MEDICAL PROFILE SLIDE-OVER / MODAL ─── */}
      <Dialog isOpen={!!selectedPatientId} onClose={() => setSelectedPatientId(null)}>
        <DialogHeader>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="h-12 w-12 rounded-full bg-clinic-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-extrabold text-slate-900 m-0">
                {patientDetail?.name || 'Patient Medical Profile'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Full clinical records & appointment history across branches
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogClose onClick={() => setSelectedPatientId(null)} />

        {isDetailLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="h-6 w-6 text-clinic-600 animate-spin mb-2" />
            <span className="text-xs font-semibold">Loading medical history...</span>
          </div>
        ) : patientDetail ? (
          <div className="space-y-6 mt-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Patient Meta Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Age
                </span>
                <span className="text-sm font-extrabold text-slate-800 mt-0.5 block">
                  {patientDetail.age ? `${patientDetail.age} yrs` : 'N/A'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                  <BadgeCheck className="h-3 w-3" /> Gender
                </span>
                <span className="text-sm font-extrabold text-slate-800 mt-0.5 block capitalize">
                  {patientDetail.gender || 'N/A'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Phone
                </span>
                <span className="text-sm font-extrabold text-slate-800 mt-0.5 block font-mono truncate">
                  {patientDetail.phone || 'N/A'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                  <UserCheck className="h-3 w-3 text-emerald-600" /> Finished Visits
                </span>
                <span className="text-sm font-extrabold text-slate-800 mt-0.5 block">
                  {patientDetail.completed_appointments_count ?? patientDetail.total_completed_count ?? 0}
                </span>
              </div>
            </div>

            {/* Medical History / Chronic Conditions */}
            {patientDetail.medical_history && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <span className="text-xs uppercase font-extrabold text-amber-800 flex items-center gap-1.5">
                  <HeartPulse className="h-4 w-4 text-amber-600 shrink-0" />
                  Medical History & Chronic Conditions
                </span>
                <p className="text-xs text-amber-950 font-medium m-0 leading-relaxed">
                  {patientDetail.medical_history}
                </p>
              </div>
            )}

            {/* Visit & Appointment History Timeline */}
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-clinic-600" />
                Appointment & Consultation History ({patientDetail.appointments?.length || 0})
              </h4>

              {!patientDetail.appointments?.length ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100 text-slate-400 text-xs">
                  No appointments recorded for this patient.
                </div>
              ) : (
                <div className="relative pl-5 border-l-2 border-slate-200 space-y-4 my-2">
                  {patientDetail.appointments.map((appt) => (
                    <div key={appt.id} className="relative">
                      <div className="absolute -left-[27px] top-1.5 h-3.5 w-3.5 rounded-full bg-clinic-600 border-2 border-white ring-2 ring-clinic-100" />
                      <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 space-y-1 hover:bg-white transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 capitalize">
                            {appt.type?.replace('_', ' ') || 'Consultation'}
                          </span>
                          <Badge
                            variant={
                              appt.status === 'completed'
                                ? 'success'
                                : appt.status === 'under_examination'
                                ? 'warning'
                                : appt.status === 'checked_in'
                                ? 'info'
                                : appt.status === 'canceled'
                                ? 'danger'
                                : 'secondary'
                            }
                            className="text-[10px] font-bold capitalize"
                          >
                            {appt.status?.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium m-0">
                          Scheduled: {appt.appointment_time || 'N/A'}
                        </p>
                        {appt.branch_name && (
                          <p className="text-[10px] text-slate-400 font-medium m-0">📍 Branch: {appt.branch_name}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}
