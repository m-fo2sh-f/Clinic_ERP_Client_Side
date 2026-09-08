import React from 'react';
import { Users, Shield, MapPin, Loader2, ChevronRight, ChevronLeft, Mail } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Button from '../../../components/ui/Button';

export default function TenantUsersTable({ users, meta, page, setPage, isLoading }) {
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 className="h-8 w-8 text-clinic-600 animate-spin mb-3" />
          <span className="text-xs font-semibold">Loading clinic staff directory...</span>
        </CardContent>
      </Card>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-16 text-center text-slate-400">
          <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700 m-0">No Staff Members Found</p>
          <p className="text-xs text-slate-400 mt-1 m-0">
            No doctors or receptionists have been assigned to this clinic yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'clinic_owner':
        return 'warning';
      case 'doctor':
        return 'default';
      case 'receptionist':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const formatRoleName = (role) => {
    switch (role) {
      case 'clinic_owner':
        return 'Clinic Owner';
      case 'doctor':
        return 'Doctor';
      case 'receptionist':
        return 'Receptionist';
      default:
        return role.replace(/_/g, ' ');
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-5 bg-slate-50/50 border-b border-slate-200/80 flex items-center justify-between">
        <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Users className="h-5 w-5 text-clinic-600 shrink-0" />
          Clinic Staff Directory
        </CardTitle>
        <span className="text-xs font-semibold text-slate-500">
          Total Staff: <strong className="text-slate-800">{meta?.total ?? users.length}</strong>
        </span>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-6">Staff Member</th>
                <th className="py-3.5 px-6">Email Address</th>
                <th className="py-3.5 px-6">Assigned Roles</th>
                <th className="py-3.5 px-6">Assigned Branches</th>
                <th className="py-3.5 px-6">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-clinic-50 border border-clinic-200 text-clinic-700 font-bold flex items-center justify-center text-xs shrink-0 uppercase">
                        {user.name ? user.name.slice(0, 2) : 'US'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block text-sm">
                          {user.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {String(user.id).slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6 font-mono text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{user.email}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1.5">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((r, i) => (
                          <Badge
                            key={i}
                            variant={getRoleBadgeVariant(r)}
                            className="font-semibold text-[11px] gap-1 capitalize"
                          >
                            <Shield className="h-3 w-3" />
                            {formatRoleName(r)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No roles assigned</span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1.5">
                      {user.branches && user.branches.length > 0 ? (
                        user.branches.map((b, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700"
                          >
                            <MapPin className="h-3 w-3 text-slate-400" />
                            {b}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">All Branches / Unrestricted</span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { dateStyle: 'medium' }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Pagination Controls */}
      {meta && meta.last_page > 1 && (
        <CardFooter className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
          <div>
            Page <strong className="text-slate-800">{meta.current_page}</strong> of{' '}
            <strong className="text-slate-800">{meta.last_page}</strong> ({meta.total} staff members)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
              disabled={page >= meta.last_page}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
