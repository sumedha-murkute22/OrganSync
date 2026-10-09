import React from 'react';
import { useOrganSync } from '../context/OrganSyncContext';
import { TransportStage } from '../types';
import { OrganBadge } from '../components/common/OrganBadge';
import { BloodGroupBadge } from '../components/common/BloodGroupBadge';
import { 
  Truck, 
  Plane, 
  CheckCircle2, 
  ArrowRight, 
  Hospital, 
  Navigation, 
  GitMerge
} from 'lucide-react';

const STAGES: TransportStage[] = [
  'Match Accepted',
  'Transport Scheduled',
  'In Transit',
  'Transplant Ready',
  'Completed',
];

export const TransportQueuePage: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { transportQueue, advanceTransportStage } = useOrganSync();

  const activeQueue = transportQueue.filter(t => t.stage !== 'Completed');
  const completedQueue = transportQueue.filter(t => t.stage === 'Completed');

  const getStageBadgeColor = (stage: TransportStage) => {
    switch (stage) {
      case 'Match Accepted':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Transport Scheduled':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'In Transit':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Transplant Ready':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  const getCourierIcon = (courierType: string) => {
    if (courierType.includes('Air') || courierType.includes('Jet')) {
      return <Plane className="w-4 h-4 text-sky-600" />;
    }
    return <Truck className="w-4 h-4 text-amber-600" />;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <Truck className="w-7 h-7 text-amber-600" />
            <span>Transplant Logistics & Processing Queue</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            First-In First-Out (FIFO) queue managing surgical dispatch, courier telemetry, and theatre intake
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('matching')}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shadow-teal-600/20"
          >
            <GitMerge className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Accept New Matches</span>
          </button>
        </div>
      </div>

      {/* FIFO Architecture Banner */}
      <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-mono font-bold text-xs border border-amber-200">
            FIFO QUEUE • O(1) ENQUEUE / DEQUEUE
          </span>
          <span className="text-xs text-slate-700 font-bold">
            Sequential surgical room preparation & courier priority dispatch
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-slate-600">In Active Transit: <strong className="text-amber-700">{activeQueue.length}</strong></span>
          <span className="text-slate-600">Transplants Completed: <strong className="text-emerald-700">{completedQueue.length}</strong></span>
        </div>
      </div>

      {/* Kanban Pipeline Stages */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {STAGES.map((stageName, sIdx) => {
          const itemsInStage = transportQueue.filter(t => t.stage === stageName);

          return (
            <div
              key={stageName}
              className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-3 min-h-[300px]"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-[10px] font-mono font-bold flex items-center justify-center text-slate-700">
                    {sIdx + 1}
                  </span>
                  <span className="font-bold text-xs text-slate-900">{stageName}</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-teal-800">
                  {itemsInStage.length}
                </span>
              </div>

              {/* Stage Items List */}
              <div className="flex-1 space-y-2.5 overflow-y-auto">
                {itemsInStage.length === 0 ? (
                  <div className="text-center py-8 text-[11px] text-slate-400 italic">
                    Queue Empty
                  </div>
                ) : (
                  itemsInStage.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-amber-400 transition-all space-y-2 text-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <OrganBadge type={item.organType} size="sm" />
                        <span className="font-mono text-[10px] text-slate-500 font-bold">{item.id}</span>
                      </div>

                      <div className="text-[11px] font-bold text-slate-900">
                        {item.organId} ➔ {item.recipientId}
                      </div>

                      <div className="text-[10px] text-slate-600 flex items-center gap-1 truncate">
                        <Hospital className="w-3 h-3 text-teal-600 shrink-0" />
                        <span className="truncate">{item.sourceCity} ➔ {item.destinationCity}</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-200">
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          {getCourierIcon(item.courierType)}
                          <span className="truncate">{item.courierType.split(' ')[0]}</span>
                        </span>
                        <span className="font-mono font-bold text-teal-800">{item.distanceKm} km</span>
                      </div>

                      {stageName !== 'Completed' && (
                        <button
                          onClick={() => advanceTransportStage(item.id)}
                          className="w-full py-1.5 mt-1 rounded-lg text-[10px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>Advance Stage</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Transport Table */}
      {transportQueue.length > 0 && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Navigation className="w-4 h-4 text-teal-600" />
              <span>Full Surgical Transit Manifest</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono font-medium">
              Total Enqueued: {transportQueue.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-mono">
                  <th className="py-2.5 px-3">QUEUE ID</th>
                  <th className="py-2.5 px-3">ORGAN</th>
                  <th className="py-2.5 px-3">DISPATCH ROUTE</th>
                  <th className="py-2.5 px-3">DISTANCE / ETA</th>
                  <th className="py-2.5 px-3">COURIER VEHICLE</th>
                  <th className="py-2.5 px-3">CURRENT STAGE</th>
                  <th className="py-2.5 px-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {transportQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">{item.id}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <OrganBadge type={item.organType} size="sm" />
                        <BloodGroupBadge bloodGroup={item.bloodGroup} size="sm" />
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-900 font-bold">{item.sourceHospital} ({item.sourceCity})</div>
                      <div className="text-[11px] text-slate-500 font-medium">➔ {item.destinationHospital} ({item.destinationCity})</div>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <div className="text-slate-900 font-bold">{item.distanceKm} km</div>
                      <div className="text-[11px] text-teal-700 font-bold">ETA {item.estimatedArrival}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        {getCourierIcon(item.courierType)}
                        <span>{item.courierType}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${getStageBadgeColor(item.stage)}`}>
                        {item.stage}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {item.stage !== 'Completed' ? (
                        <button
                          onClick={() => advanceTransportStage(item.id)}
                          className="px-3 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 text-xs font-bold transition-colors"
                        >
                          Advance ➔
                        </button>
                      ) : (
                        <span className="text-emerald-700 text-xs font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Done
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
