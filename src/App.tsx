import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OrganSyncProvider, useOrganSync } from './context/OrganSyncContext';
import { TopNavbar } from './components/layout/TopNavbar';
import { Sidebar } from './components/layout/Sidebar';

// 12 Clinical Module Pages
import { OverviewDashboardPage } from './pages/OverviewDashboardPage';
import { AllocationCentrePage } from './pages/AllocationCentrePage';
import { DonorRegistryPage } from './pages/DonorRegistryPage';
import { OrganInventoryPage } from './pages/OrganInventoryPage';
import { RecipientRegistryPage } from './pages/RecipientRegistryPage';
import { MatchingCompatibilityPage } from './pages/MatchingCompatibilityPage';
import { TransportOperationsPage } from './pages/TransportOperationsPage';
import { TransplantSurgeryPage } from './pages/TransplantSurgeryPage';
import { FollowUpOutcomesPage } from './pages/FollowUpOutcomesPage';
import { ReportsAnalyticsPage } from './pages/ReportsAnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AdministrationPage } from './pages/AdministrationPage';

const MainLayout: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string>('overview');
  const { organs, recipients, transportQueue, resetToSampleData } = useOrganSync();
  const { canAccessModule } = useAuth();

  // Dynamic counts for sidebar badges
  const availableOrgans = organs.filter(o => o.status === 'Available').length;
  const waitingRecipients = recipients.filter(r => r.status === 'Waiting' || r.status === 'Active on Waiting List').length;
  const pendingAllocations = organs.filter(o => o.status === 'Allocation Decision Pending' || o.allocationCaseId).length || 2;
  const activeTransports = transportQueue.filter(t => t.stage !== 'Completed').length || 2;
  const unreadNotifications = 2;

  const handleSearchSelect = (type: string, id: string) => {
    switch (type.toLowerCase()) {
      case 'organ':
        setActiveModule('organs');
        break;
      case 'recipient':
        setActiveModule('recipients');
        break;
      case 'case':
        setActiveModule('allocation');
        break;
      case 'transport':
        setActiveModule('transport');
        break;
      case 'donor':
        setActiveModule('donors');
        break;
      default:
        setActiveModule('overview');
    }
  };

  const renderActiveModule = () => {
    // Check permission
    if (!canAccessModule(activeModule)) {
      return (
        <div className="bg-white border border-[#E4E7EC] rounded-lg p-12 text-center max-w-xl mx-auto my-12 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 text-[#C0392B] flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            !
          </div>
          <h2 className="text-lg font-bold text-[#172033]">Access Restricted</h2>
          <p className="text-xs text-[#667085] mt-2 leading-relaxed">
            Your current clinical clearance does not permit direct access to the <strong>{activeModule.toUpperCase()}</strong> module under hospital governance policy.
          </p>
          <p className="text-xs text-[#667085] mt-1">
            Please switch clinical personas via the top-right clearance menu to test role-specific workflows.
          </p>
          <button
            onClick={() => setActiveModule('overview')}
            className="mt-6 px-4 py-2 bg-[#2457A7] text-white rounded-md text-xs font-semibold hover:bg-[#1d478a] transition-colors"
          >
            Return to Command Overview
          </button>
        </div>
      );
    }

    switch (activeModule) {
      case 'overview':
        return <OverviewDashboardPage onNavigate={setActiveModule} />;
      case 'allocation':
        return (
          <AllocationCentrePage
            onNavigateToTransport={() => setActiveModule('transport')}
            onNavigateToSurgery={() => setActiveModule('surgery')}
          />
        );
      case 'donors':
        return <DonorRegistryPage />;
      case 'organs':
        return (
          <OrganInventoryPage
            onInitiateMatching={() => setActiveModule('matching')}
          />
        );
      case 'recipients':
        return <RecipientRegistryPage />;
      case 'matching':
        return (
          <MatchingCompatibilityPage
            onPrepareAllocationCase={() => setActiveModule('allocation')}
          />
        );
      case 'transport':
        return <TransportOperationsPage />;
      case 'surgery':
        return <TransplantSurgeryPage />;
      case 'outcomes':
        return <FollowUpOutcomesPage />;
      case 'reports':
        return <ReportsAnalyticsPage />;
      case 'notifications':
        return (
          <NotificationsPage
            onNavigateToCase={() => setActiveModule('allocation')}
          />
        );
      case 'admin':
        return <AdministrationPage />;
      default:
        return <OverviewDashboardPage onNavigate={setActiveModule} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#172033] flex flex-col font-sans">
      {/* Top Clinical Navigation Bar */}
      <TopNavbar
        onSearchSelect={handleSearchSelect}
        unreadCount={unreadNotifications}
        onNotificationsClick={() => setActiveModule('notifications')}
        onResetData={resetToSampleData}
      />

      {/* Main Workspace with Persistent Left Sidebar */}
      <div className="flex flex-1">
        <Sidebar
          activeModule={activeModule}
          setActiveModule={setActiveModule}
          counts={{
            availableOrgans,
            waitingRecipients,
            pendingAllocations,
            activeTransports,
            unreadNotifications,
          }}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {renderActiveModule()}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <OrganSyncProvider>
        <MainLayout />
      </OrganSyncProvider>
    </AuthProvider>
  );
}

export default App;
