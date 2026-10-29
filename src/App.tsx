import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { ManagerDashboard } from './pages/ManagerDashboard';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { EmployeesPage } from './pages/EmployeesPage';
import { AttendancePage } from './pages/AttendancePage';
import { LeavePage } from './pages/LeavePage';
import { DepartmentsPage } from './pages/DepartmentsPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { TrainingPage } from './pages/TrainingPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilePage } from './pages/ProfilePage';
import { api } from './services/api';

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);

  // Poll / load pending leaves for badge
  useEffect(() => {
    if (!user) return;
    const fetchPending = async () => {
      try {
        const leaves = await api.getLeaves('Pending');
        setPendingLeaveCount(leaves.length);
      } catch {
        // silent fail
      }
    };
    fetchPending();
    const interval = setInterval(fetchPending, 15000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">Initializing StaffSync HRMS...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        if (user.role === 'admin') {
          return (
            <AdminDashboard
              onNavigate={setCurrentTab}
              onOpenAddEmployee={() => setCurrentTab('employees')}
            />
          );
        }
        if (user.role === 'manager') {
          return <ManagerDashboard onNavigate={setCurrentTab} />;
        }
        return (
          <EmployeeDashboard
            onNavigate={setCurrentTab}
            onOpenApplyLeave={() => setCurrentTab('leaves')}
          />
        );

      case 'employees':
        return <EmployeesPage />;

      case 'attendance':
        return <AttendancePage />;

      case 'leaves':
        return <LeavePage />;

      case 'departments':
        return <DepartmentsPage />;

      case 'announcements':
        return <AnnouncementsPage />;

      case 'training':
        return <TrainingPage />;

      case 'analytics':
        return <AnalyticsPage />;

      case 'profile':
        return <ProfilePage />;

      default:
        return (
          <div className="bg-white rounded-2xl p-12 text-center text-slate-400">
            Page not found
          </div>
        );
    }
  };

  return (
    <AppLayout
      currentTab={currentTab}
      setCurrentTab={setCurrentTab}
      pendingLeaveCount={pendingLeaveCount}
    >
      {renderContent()}
    </AppLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
