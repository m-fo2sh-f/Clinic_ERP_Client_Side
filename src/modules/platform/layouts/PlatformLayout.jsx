import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  Building2,
  LogOut,
  Activity,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useBranchContext } from '../../../context/BranchContext';

export default function PlatformLayout({ children }) {
  const { user, logout } = useBranchContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Close sidebar on pressing Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  const navItems = [
    {
      to: '/platform',
      label: 'Platform Overview',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/platform/tenants',
      label: 'Clinics & Tenants',
      icon: Building2,
      end: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
      {/* 
        Collapsible Push Sidebar:
        When open: Takes w-64 of physical layout space and pushes dashboard to the right.
        When closed: Collapses to w-0, giving dashboard 100% full width.
        No backdrop/overlay is used.
      */}
      <aside
        className={`bg-slate-900 text-white shrink-0 shadow-xl flex flex-col transition-all duration-300 ease-in-out overflow-hidden z-20 ${
          isSidebarOpen ? 'w-64 border-r border-slate-800' : 'w-0 border-r-0'
        }`}
        aria-hidden={!isSidebarOpen}
      >
        <div className="w-64 flex flex-col h-full min-h-screen">
          {/* Header with Brand & Close Button */}
          <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="bg-clinic-500 text-white p-1.5 rounded-lg shadow-sm">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight m-0 text-white leading-tight">Healios SaaS</h1>
                <p className="text-[10px] text-clinic-400 font-semibold uppercase tracking-wider m-0">
                  Super Admin Platform
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="إخفاء القائمة (Collapse)"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="flex-1 px-3.5 py-5 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-clinic-600 text-white shadow-md shadow-clinic-600/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Sidebar Footer Info */}
          <div className="p-4 border-t border-slate-850 bg-slate-950/40 text-xs text-slate-500 space-y-2 shrink-0">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-800/50 p-2 rounded-md border border-slate-800">
              <ShieldCheck className="h-3.5 w-3.5 text-clinic-400" />
              <span className="truncate">Central Platform Root</span>
            </div>
            <div className="text-center text-[10px] text-slate-500">
              v1.2.0-beta.1 (Multi-tenant)
            </div>
          </div>
        </div>
      </aside>

      {/* Main Dashboard Area: Pushed to the right when sidebar expands */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className={`p-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer border shadow-xs ${
                isSidebarOpen
                  ? 'bg-clinic-50 text-clinic-700 border-clinic-200'
                  : 'bg-slate-50/70 text-slate-700 hover:text-clinic-700 hover:bg-clinic-50/80 border-slate-200'
              }`}
              title={isSidebarOpen ? 'إخفاء القائمة الجانبية' : 'إظهار القائمة الجانبية'}
            >
              <Menu className="h-5 w-5 text-clinic-600" />
              <span className="text-xs font-bold hidden sm:inline">
                {isSidebarOpen ? 'إخفاء القائمة' : 'القائمة'}
              </span>
            </button>

            {/* Brand Logo & Name (Shown when sidebar is collapsed) */}
            {!isSidebarOpen && (
              <div className="flex items-center gap-2 animate-in fade-in duration-200">
                <div className="bg-clinic-500 text-white p-1.5 rounded-lg shadow-xs">
                  <Activity className="h-4.5 w-4.5" />
                </div>
                <span className="font-extrabold text-sm text-slate-800 tracking-tight hidden md:inline">
                  Healios Platform
                </span>
              </div>
            )}

            {/* Platform Context Indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-550 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-clinic-600" />
              <span className="text-slate-400">Context:</span>
              <span className="font-mono font-bold text-clinic-700 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                Central Super Admin
              </span>
            </div>
          </div>

          {/* Right Controls: User Profile */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 text-left transition-colors cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full bg-clinic-100 border border-clinic-250 flex items-center justify-center font-bold text-clinic-700 text-xs uppercase">
                  {user?.name ? user.name.slice(0, 2) : 'SA'}
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-bold text-slate-800 leading-none">{user?.name || 'Super Admin'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-none">Central Administrator</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Card Overlay */}
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 mt-2.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 animate-in fade-in duration-150">
                    <div className="border-b border-slate-100 pb-3 mb-3">
                      <p className="text-sm font-bold text-slate-900">{user?.name || 'Super Admin'}</p>
                      <p className="text-xs text-slate-400">{user?.email || 'admin@my-saas.test'}</p>
                      <p className="text-[10px] text-clinic-700 font-bold bg-clinic-50 border border-clinic-150 w-fit px-2 py-0.5 rounded mt-1.5 uppercase">
                        Super Admin
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-xs font-medium text-red-600 hover:bg-red-50 px-2 py-2 rounded-md flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout Session</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Container (Full width) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 w-full">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
