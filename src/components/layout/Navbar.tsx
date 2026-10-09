import React, { useState } from 'react';
import { useOrganSync } from '../../context/OrganSyncContext';
import { 
  Activity, 
  Layers, 
  GitMerge, 
  ListOrdered, 
  Truck, 
  BookOpen, 
  RotateCcw, 
  HeartHandshake, 
  Users, 
  Menu,
  X,
  LayoutDashboard
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { organs, recipients, matches, transportQueue, resetToSampleData } = useOrganSync();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const availableOrgansCount = organs.filter(o => o.status === 'Available').length;
  const waitingRecipientsCount = recipients.filter(r => r.status === 'Waiting').length;
  const criticalRecipientsCount = recipients.filter(r => r.status === 'Waiting' && r.urgency === 'Status 1A (Critical)').length;
  const activeTransportsCount = transportQueue.filter(t => t.stage !== 'Completed').length;

  const navItems = [
    { id: 'landing', label: 'Overview', icon: HeartHandshake },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'organs', label: 'Donors & Organs', icon: Activity, badge: availableOrgansCount, badgeColor: 'bg-teal-50 text-teal-700 border border-teal-200' },
    { id: 'recipients', label: 'Recipients', icon: Users, badge: waitingRecipientsCount, badgeColor: 'bg-sky-50 text-sky-700 border border-sky-200' },
    { id: 'matching', label: 'Match Engine', icon: GitMerge, badge: matches.length > 0 ? matches.length : undefined, badgeColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
    { id: 'graph', label: 'Compatibility Network', icon: Layers },
    { id: 'priority', label: 'Priority Queues', icon: ListOrdered, badge: criticalRecipientsCount > 0 ? `${criticalRecipientsCount} Critical` : undefined, badgeColor: 'bg-rose-50 text-rose-700 border border-rose-200' },
    { id: 'transport', label: 'Transit Queue', icon: Truck, badge: activeTransportsCount > 0 ? activeTransportsCount : undefined, badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200' },
    { id: 'algorithms', label: 'Clinical DSA Docs', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Main Nav Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Clinical Branding */}
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-sky-600 flex items-center justify-center text-white shadow-md shadow-teal-600/15 group-hover:scale-105 transition-transform">
              <Activity className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-xl text-slate-900 font-sans">
                  Organ<span className="text-teal-600">Sync</span>
                </span>
                <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded font-mono font-semibold">
                  Clinical Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
                Donor–Recipient Matching & Allocation System
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 border border-teal-200/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Match Engine Button & Reset Sample */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm('Reset all demo clinical data back to default sample records?')) {
                  resetToSampleData();
                }
              }}
              className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1.5 rounded-lg border border-slate-200"
              title="Reset records to default baseline"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Data</span>
            </button>

            <button
              onClick={() => setActiveTab('matching')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-sm shadow-teal-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <GitMerge className="w-3.5 h-3.5 text-white stroke-[2.5]" />
              <span>Match Engine</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 shadow-lg animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 border border-teal-200 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-200">
            <button
              onClick={() => {
                resetToSampleData();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Records to Sample Baseline</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
