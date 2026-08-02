import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  Activity, 
  ChevronDown, 
  Globe, 
  User, 
  LogOut, 
  Bell,
  Menu,
  X,
  Key
} from 'lucide-react';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import { useBranchContext } from '../context/BranchContext';

export default function DashboardLayout({ children }) {
  const { branches, selectedBranchId, selectBranch, activeBranch, user, logout } = useBranchContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const currentUser = user || {
    name: 'Sarah Connor',
    role: 'Clinic Receptionist',
    email: 'sarah.c@my-saas.com',
    token: 'sanctum_session_active'
  };

  const simulatedSubdomain = activeBranch ? (activeBranch.clinicSubdomain || `${activeBranch.name.toLowerCase().replace(/\s+/g, '')}.my-saas.test`) : 'maadi.my-saas.test';

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '#', active: true },
    { name: 'Patients Directory', icon: Users, href: '#', active: false },
    { name: 'Billing & Invoice', icon: CreditCard, href: '#', active: false },
    { name: 'Clinic Settings', icon: Settings, href: '#', active: false },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shrink-0 shadow-lg relative z-20">
        {/* Brand Logo */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center gap-2.5">
          <div className="bg-clinic-500 text-white p-1.5 rounded-lg">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight m-0 text-white">Healios SaaS</h1>
            <p className="text-[10px] text-clinic-400 font-semibold uppercase tracking-wider">Clinic OS</p>
          </div>
        </div>

        {/* Sidebar Menu Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                item.active 
                  ? 'bg-clinic-600 text-white shadow-md shadow-clinic-600/10' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.name}</span>
            </a>
          ))}
        </nav>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-slate-850 bg-slate-950/40 text-xs text-slate-500 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-800/50 p-2 rounded-md border border-slate-800">
            <Key className="h-3.5 w-3.5 text-clinic-400" />
            <span className="truncate">Active Branch: {activeBranch?.name}</span>
          </div>
          <div className="text-center text-[10px] text-slate-650">
            v1.2.0-beta.1 (Multi-tenant)
          </div>
        </div>
      </aside>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-slate-900 text-white shadow-xl">
            <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-clinic-400" />
                <span className="font-bold text-white">Healios SaaS</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1.5">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                    item.active 
                      ? 'bg-clinic-600 text-white' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.name}</span>
                </a>
              ))}
            </nav>
            <div className="p-4 border-t border-slate-800 text-[10px] font-mono text-slate-450 bg-slate-950/20">
              Branch: {activeBranch?.name}
            </div>
          </aside>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-105 active:bg-slate-200 cursor-pointer"
            >
              <Menu className="h-5.5 w-5.5" />
            </button>

            {/* Tenant domain tracker */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-550 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5">
              <Globe className="h-3.5 w-3.5 text-clinic-500" />
              <span className="text-slate-400">Tenant Domain:</span>
              <span className="font-mono text-clinic-700 bg-white border border-slate-150 px-1.5 py-0.2 rounded">
                {simulatedSubdomain}
              </span>
            </div>
          </div>

          {/* Right Controls: Branch Switcher & User Profile */}
          <div className="flex items-center gap-4">
            {/* Branch Switcher Select Header */}
            <div className="w-44 sm:w-52">
              <Select 
                value={selectedBranchId || ''} 
                onChange={(e) => {
                  selectBranch(e.target.value);
                }}
                className="py-1.5 pl-2.5 pr-8 border-slate-200 bg-slate-50/50 hover:bg-white text-xs font-bold text-slate-700 cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
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
                  {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'US'}
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-450 mt-0.5 leading-none">{currentUser.role || (currentUser.roles?.[0] || 'User')}</p>
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
                        {currentUser.role || (currentUser.roles?.[0] || 'User')}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <button className="w-full text-left text-xs font-medium text-slate-600 hover:bg-slate-50 px-2 py-2 rounded-md flex items-center gap-2 cursor-pointer">
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

        {/* Content container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
