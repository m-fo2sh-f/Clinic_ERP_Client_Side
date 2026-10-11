import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  Activity,
  ChevronDown,
  Globe,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  Key,
} from 'lucide-react';
import Select from '../components/ui/Select';
import { useBranchContext } from '../context/BranchContext';
import { getUserRoles, getRoleDefaultRoute } from '../utils/roleUtils';

export default function DashboardLayout({ children }) {
  const { branches, selectedBranchId, selectBranch, activeBranch, user, logout } = useBranchContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = user || {
    name: 'User',
    roles: [],
    email: '',
  };

  const simulatedSubdomain = activeBranch
    ? activeBranch.clinicSubdomain || `${activeBranch.name.toLowerCase().replace(/\s+/g, '')}.my-saas.test`
    : 'maadi.my-saas.test';

  const isSolo = activeBranch?.clinic_mode === 'solo';
  const dashboardPath = getRoleDefaultRoute(currentUser, activeBranch);
  const userRolesDisplay = getUserRoles(currentUser).map((r) => r.replace('_', ' ')).join(', ') || 'User';

  const menuItems = [
    {
      name: isSolo ? 'Clinical Workspace' : 'Dashboard',
      icon: LayoutDashboard,
      href: dashboardPath,
      active: location.pathname === '/dashboard' || location.pathname === '/doctor',
    },
    {
      name: 'Patients Directory',
      icon: Users,
      href: '/patients',
      active: location.pathname === '/patients',
    },
    {
      name: 'Services & Pricing',
      icon: Settings,
      href: '/settings',
      active: location.pathname === '/settings',
    },
  ];

  // Optional: Shortcut to toggle sidebar with Alt + S or Esc to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-x-hidden">
      {/* 
        Collapsible Push Sidebar:
        When open: Takes w-64 of physical layout space and pushes the dashboard to the right.
        When closed: Collapses to w-0, giving the dashboard 100% of the screen width.
        No backdrop/overlay is used, so the dashboard remains fully visible and active!
      */}
      <aside
        className={`bg-slate-900 text-white shrink-0 shadow-xl flex flex-col transition-all duration-300 ease-in-out overflow-hidden z-20 ${
          isSidebarOpen ? 'w-64 border-r border-slate-800' : 'w-0 border-r-0'
        }`}
        aria-hidden={!isSidebarOpen}
      >
        {/* Fixed-width inner wrapper (w-64) keeps menu text & layout stable during expand/collapse */}
        <div className="w-64 flex flex-col h-full min-h-screen">
          {/* Brand Logo & Collapse Button */}
          <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="bg-clinic-500 text-white p-1.5 rounded-lg shadow-sm">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight m-0 text-white leading-tight">Healios SaaS</h1>
                <p className="text-[10px] text-clinic-400 font-semibold uppercase tracking-wider m-0">Clinic OS</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="إخفاء القائمة (Collapse Sidebar)"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="flex-1 px-3.5 py-5 space-y-1.5 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  item.active
                    ? 'bg-clinic-600 text-white shadow-md shadow-clinic-600/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Sidebar Footer Info */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-400 space-y-2 shrink-0">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 bg-slate-800/60 p-2.5 rounded-lg border border-slate-800">
              <div className="flex items-center gap-1.5 truncate">
                <Key className="h-3.5 w-3.5 text-clinic-400 shrink-0" />
                <span className="truncate">{activeBranch?.name}</span>
              </div>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                  isSolo ? 'bg-clinic-500/20 text-clinic-300' : 'bg-indigo-500/20 text-indigo-300'
                }`}
              >
                {isSolo ? 'Solo' : 'Polyclinic'}
              </span>
            </div>
            <div className="text-center text-[10px] text-slate-500">
              v1.2.0-beta.1 (Multi-tenant)
            </div>
          </div>
        </div>
      </aside>

      {/* Main Dashboard Area: Dynamically takes all remaining width and slides smoothly */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
        {/* Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Toggle Button for Push Sidebar */}
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className={`p-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer border shadow-xs ${
                isSidebarOpen
                  ? 'bg-clinic-50 text-clinic-700 border-clinic-200'
                  : 'bg-slate-50/70 text-slate-700 hover:text-clinic-700 hover:bg-clinic-50/80 border-slate-200'
              }`}
              title={isSidebarOpen ? 'إخفاء القائمة الجانبية (Collapse)' : 'إظهار القائمة الجانبية (Expand)'}
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
                  Healios SaaS
                </span>
              </div>
            )}

            {/* Tenant domain tracker */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-550 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5">
              <Globe className="h-3.5 w-3.5 text-clinic-500" />
              <span className="text-slate-400">Tenant Domain:</span>
              <span className="font-mono text-clinic-700 bg-white border border-slate-150 px-1.5 py-0.2 rounded">
                {simulatedSubdomain}
              </span>
            </div>
          </div>

          {/* Right Controls: Branch Switcher & User Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Branch Switcher Select Header */}
            <div className="w-40 sm:w-52">
              <Select
                value={selectedBranchId || ''}
                onChange={(e) => {
                  selectBranch(e.target.value);
                }}
                className="py-1.5 pl-2.5 pr-8 border-slate-200 bg-slate-50/50 hover:bg-white text-xs font-bold text-slate-700 cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-slate-400 hover:text-slate-650 rounded-lg hover:bg-slate-50 cursor-pointer">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>

            {/* User Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 text-left transition-colors cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full bg-clinic-100 border border-clinic-250 flex items-center justify-center font-bold text-clinic-700 text-xs">
                  {currentUser.name
                    ? currentUser.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()
                    : 'US'}
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-450 mt-0.5 leading-none capitalize">
                    {userRolesDisplay}
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Card Overlay */}
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 mt-2.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="border-b border-slate-100 pb-3 mb-3">
                      <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
                      <p className="text-xs text-slate-450">{currentUser.email}</p>
                      <p className="text-[10px] text-clinic-700 font-bold bg-clinic-50 w-fit px-2 py-0.5 rounded mt-1.5 uppercase">
                        {userRolesDisplay}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate('/settings');
                        }}
                        className="w-full text-left text-xs font-medium text-slate-600 hover:bg-slate-50 px-2 py-2 rounded-md flex items-center gap-2 cursor-pointer"
                      >
                        <User className="h-4 w-4" />
                        <span>My Profile Settings</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left text-xs font-medium text-red-650 hover:bg-red-50 px-2 py-2 rounded-md flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout Session</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Container: Always completely active and pushed smoothly */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
