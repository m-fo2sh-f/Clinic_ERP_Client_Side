import React from 'react';
import { Users, Shield, MapPin, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';

export default function TenantUsersTable({ users, meta, page, setPage, isLoading }) {
  if (isLoading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-3 bg-slate-900/40 rounded-2xl border border-slate-800">
        <Loader2 className="h-6 w-6 text-clinic-500 animate-spin" />
        <span className="text-xs text-slate-400">جاري تحميل الطاقم الطبي والإداري...</span>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800">
        <Users className="h-10 w-10 text-slate-600 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-300">لا يوجد موظفون مسجلون</p>
        <p className="text-xs text-slate-500 mt-1">لم يتم ربط أطباء أو موظفي استقبال بهذه العيادة بعد.</p>
      </div>
    );
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'clinic_owner':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'doctor':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'receptionist':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-700/60';
    }
  };

  const formatRoleName = (role) => {
    switch (role) {
      case 'clinic_owner':
        return 'مالك العيادة';
      case 'doctor':
        return 'طبيب كشف';
      case 'receptionist':
        return 'استقبال';
      default:
        return role;
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md shadow-xl">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="py-3.5 px-4">الموظف</th>
              <th className="py-3.5 px-4">البريد الإلكتروني</th>
              <th className="py-3.5 px-4">الأدوار بالعيادة (معزولة)</th>
              <th className="py-3.5 px-4">الفروع المعين بها</th>
              <th className="py-3.5 px-4">تاريخ الانضمام</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-800/40 transition-colors group">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-clinic-400 font-bold text-xs uppercase">
                      {user.name ? user.name.slice(0, 2) : 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-white group-hover:text-clinic-400 transition-colors">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-slate-500">ID: {user.id}</div>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4 text-slate-300 font-mono text-xs">
                  {user.email}
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1.5">
                    {user.roles && user.roles.length > 0 ? (
                      user.roles.map((r, i) => (
                        <span
                          key={i}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${getRoleBadge(r)}`}
                        >
                          <Shield className="h-3 w-3" />
                          {formatRoleName(r)}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">بدون أدوار معينة</span>
                    )}
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="flex flex-wrap gap-1.5">
                    {user.branches && user.branches.length > 0 ? (
                      user.branches.map((b, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-800 border border-slate-700 text-slate-300"
                        >
                          <MapPin className="h-3 w-3 text-slate-400" />
                          {b}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">كافة الفروع / غير مقيد</span>
                    )}
                  </div>
                </td>

                <td className="py-3.5 px-4 text-xs text-slate-400">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('ar-EG') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between px-2 pt-2 text-xs text-slate-400">
          <div>
            صفحة <span className="font-bold text-white">{meta.current_page}</span> من{' '}
            <span className="font-bold text-white">{meta.last_page}</span> (إجمالي {meta.total} مستخدم)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-all"
            >
              <ChevronRight className="h-4 w-4" />
              السابق
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page >= meta.last_page}
              className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium transition-all"
            >
              التالي
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
