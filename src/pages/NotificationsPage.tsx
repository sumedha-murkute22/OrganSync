import React, { useState } from 'react';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  Filter
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsPageProps {
  onNavigateToCase?: (caseId: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigateToCase }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'NOTIF-01',
      severity: 'Critical',
      title: 'Allocation Decision Awaiting Authorized Surgeon Approval',
      message: 'Case CASE-ALC-701: Heart donor ORG-H001 matched to Arthur Pendelton (Status 1A Critical). Surgical lead authorization required.',
      linkCaseId: 'CASE-ALC-701',
      timestamp: '15m ago',
      isRead: false,
    },
    {
      id: 'NOTIF-02',
      severity: 'Urgent',
      title: 'Transport Dispatch Coordination Scheduled',
      message: 'Flight MEDEVAC-ANGEL-44 scheduled for organ transfer Seattle -> Portland. Departure milestone approaching.',
      linkCaseId: 'TRN-501',
      timestamp: '25m ago',
      isRead: false,
    },
    {
      id: 'NOTIF-03',
      severity: 'Standard',
      title: 'Living Donor Independent Assessment Approved',
      message: 'Living donor DNR-803 completed independent donor advocate assessment and ethical review clearance.',
      timestamp: '2h ago',
      isRead: true,
    },
    {
      id: 'NOTIF-04',
      severity: 'Standard',
      title: 'Recipient Reassessment Overdue Notice',
      message: 'Candidate REC-104 requires 90-day waitlist serology update.',
      timestamp: '5h ago',
      isRead: true,
    },
  ]);

  const [filterSeverity, setFilterSeverity] = useState<string>('All');

  const filtered = filterSeverity === 'All'
    ? notifications
    : notifications.filter(n => n.severity.toLowerCase() === filterSeverity.toLowerCase());

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#E4E7EC] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172033] tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#2457A7]" />
            Operational Notifications & Critical Alerts
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Real-time event notifications triggered by organ offers, transport milestones, overdue assessments, and surgical readiness.
          </p>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center gap-1.5 text-xs">
          {['All', 'Critical', 'Urgent', 'Standard'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                filterSeverity === sev
                  ? 'bg-[#2457A7] text-white shadow-xs'
                  : 'bg-white border border-[#E4E7EC] text-[#667085] hover:bg-[#F7F9FC]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-[#E4E7EC] rounded-xl shadow-xs divide-y divide-[#E4E7EC] overflow-hidden">
        {filtered.map((n) => {
          const isCritical = n.severity === 'Critical';
          const isUrgent = n.severity === 'Urgent';

          return (
            <div
              key={n.id}
              className={`p-4 flex items-start justify-between gap-4 transition-colors ${
                !n.isRead ? 'bg-[#EDF4FF]/30' : 'hover:bg-[#F7F9FC]'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg mt-0.5 flex-shrink-0 ${
                  isCritical 
                    ? 'bg-rose-50 text-[#C0392B]' 
                    : isUrgent 
                    ? 'bg-amber-50 text-[#B7791F]' 
                    : 'bg-blue-50 text-[#2457A7]'
                }`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded border ${
                      isCritical
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : isUrgent
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}>
                      {n.severity}
                    </span>
                    <h3 className="text-xs font-bold text-[#172033]">{n.title}</h3>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#2457A7] inline-block"></span>
                    )}
                  </div>

                  <p className="text-xs text-[#667085] leading-relaxed max-w-3xl">
                    {n.message}
                  </p>

                  <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{n.timestamp}</span>
                    {n.linkCaseId && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-[#2457A7] font-semibold">{n.linkCaseId}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n.id)}
                    className="px-2.5 py-1 text-xs text-[#667085] hover:text-[#172033] border border-[#E4E7EC] rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Mark Read
                  </button>
                )}

                {n.linkCaseId && onNavigateToCase && (
                  <button
                    onClick={() => onNavigateToCase(n.linkCaseId!)}
                    className="px-3 py-1 bg-[#2457A7] text-white text-xs font-semibold rounded-lg hover:bg-[#3978C5] transition-colors flex items-center gap-1"
                  >
                    View Case <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
