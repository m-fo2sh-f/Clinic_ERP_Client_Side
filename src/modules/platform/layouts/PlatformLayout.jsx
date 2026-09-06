import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, Building2, LogOut, Activity, User, ExternalLink } from 'lucide-react';
import { useBranchContext } from '../../../context/BranchContext';

export default function PlatformLayout({ children }) {
  const { user, logout } = useBranchContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      to: '/platform',
      label: 'نظرة عامة ومؤشرات',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/platform/tenants',
      label: 'العيادات والمستأجرين',
      icon: Building2,
      end: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-clinic-500 selection:text-white" dir="rtl">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Platform Badge */}
          <div className="flex items-center gap-4">
            <Link to="/platform" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-clinic-500 flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="font-black text-base text-white tracking-tight block">
                  Healios <span className="text-clinic-400">Platform</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium block">Central SaaS Control</span>
              </div>
            </Link>

            {/* Platform Super Admin Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <ShieldCheck className="h-3.5 w-3.5" />
              Platform Super Admin
            </div>
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-clinic-600 text-white shadow-lg shadow-clinic-600/25'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center">
                {user?.name ? user.name.slice(0, 2) : 'SA'}
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-white leading-tight">{user?.name || 'Super Admin'}</div>
                <div className="text-[10px] text-slate-500 font-mono">Central Root</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="تسجيل الخروج"
              className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-600">
        Healios Central Platform ERP • Security Scoped & Audited Platform Administration
      </footer>
    </div>
  );
}
