import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { DatabaseStatusModal } from '../common/DatabaseStatusModal';

interface AppLayoutProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  pendingLeaveCount?: number;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentTab,
  setCurrentTab,
  pendingLeaveCount = 0,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          pendingLeaveCount={pendingLeaveCount}
        />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="w-64 h-full bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              currentTab={currentTab}
              setCurrentTab={(t) => {
                setCurrentTab(t);
                setMobileOpen(false);
              }}
              collapsed={false}
              setCollapsed={() => {}}
              pendingLeaveCount={pendingLeaveCount}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenDbModal={() => setDbModalOpen(true)}
          onToggleMobileSidebar={() => setMobileOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Database & Architecture diagnostics modal */}
      <DatabaseStatusModal
        isOpen={dbModalOpen}
        onClose={() => setDbModalOpen(false)}
      />
    </div>
  );
};
