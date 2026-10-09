import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  GitMerge, 
  HeartHandshake, 
  Layers, 
  Users, 
  CheckCircle2, 
  Truck, 
  Stethoscope, 
  ClipboardCheck, 
  BarChart3, 
  Bell, 
  ShieldCheck,
  Lock,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  counts?: {
    availableOrgans?: number;
    waitingRecipients?: number;
    pendingAllocations?: number;
    activeTransports?: number;
    unreadNotifications?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule, counts = {} }) => {
  const { canAccessModule, currentUser } = useAuth();

  const navigationModules = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: undefined },
    { id: 'allocation', label: 'Allocation Centre', icon: GitMerge, badge: counts.pendingAllocations ? `${counts.pendingAllocations} Pending` : undefined, badgeColor: 'bg-amber-50 text-amber-800 border-amber-200' },
    { id: 'donors', label: 'Donor Registry', icon: HeartHandshake, badge: undefined },
    { id: 'organs', label: 'Organ Inventory', icon: Layers, badge: counts.availableOrgans ? `${counts.availableOrgans} Available` : undefined, badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    { id: 'recipients', label: 'Recipient Registry', icon: Users, badge: counts.waitingRecipients ? `${counts.waitingRecipients} Waiting` : undefined, badgeColor: 'bg-blue-50 text-blue-800 border-blue-200' },
    { id: 'matching', label: 'Matching & Compatibility', icon: CheckCircle2, badge: undefined },
    { id: 'transport', label: 'Transport Operations', icon: Truck, badge: counts.activeTransports ? `${counts.activeTransports} Active` : undefined, badgeColor: 'bg-blue-50 text-blue-800 border-blue-200' },
    { id: 'surgery', label: 'Transplant Surgery', icon: Stethoscope, badge: undefined },
    { id: 'outcomes', label: 'Follow-up & Outcomes', icon: ClipboardCheck, badge: undefined },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, badge: undefined },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: counts.unreadNotifications ? `${counts.unreadNotifications}` : undefined, badgeColor: 'bg-rose-50 text-rose-800 border-rose-200' },
    { id: 'admin', label: 'Administration', icon: ShieldCheck, badge: undefined },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-[#E4E7EC] flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none">
      {/* Role Context Header */}
      <div className="p-4 border-b border-[#E4E7EC] bg-[#F7F9FC]">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#667085]">
          Active Clearance
        </div>
        <div className="text-xs font-bold text-[#172033] mt-0.5 truncate">
          {currentUser.role}
        </div>
        <div className="text-[11px] text-[#667085] truncate">
          {currentUser.department}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navigationModules.map((item) => {
          const Icon = item.icon;
          const isAllowed = canAccessModule(item.id);
          const isActive = activeModule === item.id;

          if (!isAllowed) {
            return (
              <div
                key={item.id}
                title={`Module restricted for ${currentUser.role}`}
                className="flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium text-slate-300 cursor-not-allowed opacity-60"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-300" />
                  <span>{item.label}</span>
                </div>
                <Lock className="w-3 h-3 text-slate-400" />
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                isActive
                  ? 'bg-[#EDF4FF] text-[#2457A7] font-semibold border-l-4 border-[#2457A7] pl-2'
                  : 'text-[#172033] hover:bg-[#F7F9FC] hover:text-[#2457A7]'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    isActive ? 'text-[#2457A7]' : 'text-[#667085]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold border ${
                    item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-3 border-t border-[#E4E7EC] bg-[#F7F9FC]">
        <div className="flex items-center justify-between text-[11px] text-[#667085]">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#16805D] inline-block animate-pulse"></span>
            C Core Engine: Online
          </span>
          <span className="font-mono text-[10px] text-slate-500">v2.4.0</span>
        </div>
      </div>
    </aside>
  );
};
