import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Activity, 
  Building2, 
  Search, 
  Bell, 
  UserCheck, 
  RotateCcw, 
  ShieldCheck, 
  X,
  ChevronDown
} from 'lucide-react';
import { UserRole } from '../../types';

interface TopNavbarProps {
  onSearchSelect?: (type: string, id: string) => void;
  unreadCount?: number;
  onNotificationsClick?: () => void;
  onResetData?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onSearchSelect,
  unreadCount = 2,
  onNotificationsClick,
  onResetData,
}) => {
  const { 
    currentUser, 
    currentFacility, 
    availableRoles, 
    switchUserRole,
    isRoleSwitcherOpen,
    setRoleSwitcherOpen
  } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Synthetic index for global search
  const sampleSearchItems = [
    { type: 'Organ', id: 'ORG-H001', label: 'Heart (O+, 3.5h left) — Donor #801' },
    { type: 'Organ', id: 'ORG-K001', label: 'Kidney (O+, 26h left) — Donor #801' },
    { type: 'Recipient', id: 'REC-101', label: 'Arthur Pendelton (Status 1A Critical Heart)' },
    { type: 'Recipient', id: 'REC-102', label: 'Eleanor Vance (Status 1B Urgent Heart)' },
    { type: 'Donor', id: 'DNR-801', label: 'Deceased Donor (Seattle, WA)' },
    { type: 'Donor', id: 'DNR-803', label: 'Living Donor (Independent Assessment Passed)' },
    { type: 'Case', id: 'CASE-ALC-701', label: 'Heart Allocation Case — Awaiting Decision' },
    { type: 'Transport', id: 'TRN-501', label: 'MEDEVAC-ANGEL-44 (Seattle -> Portland)' },
  ];

  const searchResults = searchQuery.trim() === ''
    ? []
    : sampleSearchItems.filter(item =>
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <>
      <header className="h-16 w-full bg-white border-b border-[#E4E7EC] sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between shadow-xs">
        {/* Left: Brand Wordmark & Facility Badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2457A7] flex items-center justify-center text-white shadow-xs">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-[#172033] tracking-tight">
                  Organ<span className="text-[#2457A7]">Sync</span>
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider bg-[#EDF4FF] text-[#2457A7] border border-[#2457A7]/20 px-1.5 py-0.2 rounded font-bold">
                  Clinical Ops
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-[#667085] bg-[#F7F9FC] border border-[#E4E7EC] px-2.5 py-1 rounded-md">
            <Building2 className="w-3.5 h-3.5 text-[#2457A7]" />
            <span className="font-medium text-[#172033] truncate max-w-xs">{currentFacility}</span>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="relative flex-1 max-w-md mx-4 hidden sm:block">
          <div className="relative">
            <Search className="w-4 h-4 text-[#667085] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Organ ID, Recipient ID, Case ID, or Donor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F7F9FC] border border-[#E4E7EC] rounded-lg text-[#172033] placeholder-[#667085] focus:outline-none focus:border-[#2457A7] focus:bg-white transition-colors"
            />
          </div>

          {/* Search Results Dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-10 left-0 right-0 bg-white border border-[#E4E7EC] rounded-lg shadow-lg z-50 overflow-hidden py-1">
              <div className="text-[10px] font-semibold text-[#667085] px-3 py-1 bg-[#F7F9FC] uppercase">
                Matching Authorized Records
              </div>
              {searchResults.map((res) => (
                <button
                  key={res.id}
                  onClick={() => {
                    if (onSearchSelect) onSearchSelect(res.type, res.id);
                    setSearchQuery('');
                  }}
                  className="w-full px-3 py-2 text-left text-xs hover:bg-[#EDF4FF] flex items-center justify-between group"
                >
                  <div>
                    <span className="font-mono font-bold text-[#2457A7]">{res.id}</span>
                    <span className="ml-2 text-[#172033]">{res.label}</span>
                  </div>
                  <span className="text-[10px] text-[#667085] bg-slate-100 px-1.5 py-0.5 rounded">
                    {res.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Operational Actions & Persona Switcher */}
        <div className="flex items-center gap-3">
          {/* Notifications Trigger */}
          <button
            onClick={onNotificationsClick}
            className="relative p-2 rounded-lg text-[#667085] hover:text-[#172033] hover:bg-[#F7F9FC] transition-colors"
            title="Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#C0392B] text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Current User Role Pill & Quick Switcher */}
          <button
            onClick={() => setRoleSwitcherOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#E4E7EC] bg-[#F7F9FC] hover:bg-[#EDF4FF] hover:border-[#2457A7]/30 transition-all text-left"
            title="Click to Switch Demo Role / Persona"
          >
            <div className="w-6 h-6 rounded-full bg-[#2457A7] text-white flex items-center justify-center text-xs font-bold">
              {currentUser.fullName.split(' ')[1]?.[0] || 'D'}
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-bold text-[#172033] leading-none flex items-center gap-1">
                {currentUser.fullName.split(',')[0]}
                <ChevronDown className="w-3 h-3 text-[#667085]" />
              </div>
              <div className="text-[10px] text-[#2457A7] font-semibold leading-tight mt-0.5">
                {currentUser.role}
              </div>
            </div>
          </button>

          {/* Reset Demo Data Button */}
          {onResetData && (
            <button
              onClick={onResetData}
              className="p-2 text-[#667085] hover:text-[#2457A7] hover:bg-[#F7F9FC] rounded-lg transition-colors text-xs flex items-center gap-1"
              title="Reset to Initial Demonstration State"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Role Switcher Modal (Doctor-Accessible Testing) */}
      {isRoleSwitcherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E4E7EC] max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-[#E4E7EC] flex items-center justify-between bg-[#F7F9FC]">
              <div>
                <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#2457A7]" />
                  Authorized Clinical Persona Switcher
                </h3>
                <p className="text-[11px] text-[#667085] mt-0.5">
                  Select a clinical role to test authorized permissions, workflows, and view restrictions.
                </p>
              </div>
              <button
                onClick={() => setRoleSwitcherOpen(false)}
                className="text-[#667085] hover:text-[#172033] p-1 rounded-md hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {availableRoles.map((role) => {
                const isCurrent = currentUser.role === role;
                const descriptions: Record<UserRole, string> = {
                  'System Administrator': 'Full system oversight, role governance, policy configuration, audit trails.',
                  'Transplant Coordinator': 'Registers donors & organs, initiates C engine matching, prepares allocation cases, coordinates transport.',
                  'Transplant Surgeon': 'Reviews compatibility, authorizes clinical allocation decisions, records operative milestones and implantation.',
                  'Transplant Physician': 'Monitors waitlist status, assesses clinical readiness, records post-transplant graft outcomes and follow-up.',
                  'Transport Coordinator': 'Aviation & logistics dispatch, milestone checkpoint tracking, cold-chain temperature telemetry, delay alerts.',
                  'Clinical Auditor': 'Independent read-only governance, audit event log review with SHA-256 verification, regulatory reports.',
                };

                return (
                  <button
                    key={role}
                    onClick={() => {
                      switchUserRole(role);
                      setRoleSwitcherOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg border text-xs transition-all flex items-start justify-between gap-3 ${
                      isCurrent
                        ? 'border-[#2457A7] bg-[#EDF4FF] shadow-xs'
                        : 'border-[#E4E7EC] hover:bg-[#F7F9FC] hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#172033]">{role}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-[#2457A7] text-white px-1.5 py-0.2 rounded font-semibold">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#667085] mt-1 leading-relaxed">
                        {descriptions[role]}
                      </p>
                    </div>
                    <ShieldCheck className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isCurrent ? 'text-[#2457A7]' : 'text-slate-300'}`} />
                  </button>
                );
              })}
            </div>

            <div className="px-5 py-3 border-t border-[#E4E7EC] bg-[#F7F9FC] text-right">
              <button
                onClick={() => setRoleSwitcherOpen(false)}
                className="px-4 py-1.5 bg-[#2457A7] text-white text-xs font-semibold rounded-lg hover:bg-[#3978C5] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
