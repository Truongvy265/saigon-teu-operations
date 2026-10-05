import React, { useState } from 'react';
import { OpsProvider, useOps } from './context/OpsContext';
import { Navbar } from './components/Navbar';
import { RadarAlerts } from './components/RadarAlerts';
import { ShowManagement } from './components/ShowManagement';
import { ProjectPlanTimeline } from './components/ProjectPlanTimeline';
import { AdHocTasks } from './components/AdHocTasks';
import { ShowAttendance } from './components/ShowAttendance';
import { AnalyticsView } from './components/AnalyticsView';
import { FinanceDraft } from './components/FinanceDraft';
import { AdvanceSettlement } from './components/AdvanceSettlement';
import { PersonnelBarem } from './components/PersonnelBarem';
import { TaskModal } from './components/TaskModal';
import { ShowModal } from './components/ShowModal';
import { ShowTask, ShowInfo } from './types';

const MainContent: React.FC = () => {
  const { shows } = useOps();
  const [activeTab, setActiveTab] = useState<string>('radar');
  const [selectedShowId, setSelectedShowId] = useState<string>(shows[0]?.id || 'show-hn-19-20-12');
  
  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<ShowTask | null>(null);
  const [taskModalDefaultShowId, setTaskModalDefaultShowId] = useState<string | undefined>(undefined);

  const [isShowModalOpen, setIsShowModalOpen] = useState(false);
  const [showToEdit, setShowToEdit] = useState<ShowInfo | null>(null);

  // Handlers for seamless cross-module navigation
  const handleSelectShow = (showId: string) => {
    setSelectedShowId(showId);
    setActiveTab('project-plan');
  };

  const handleNavigateToAttendance = (showId: string) => {
    setSelectedShowId(showId);
    setActiveTab('attendance');
  };

  const handleNavigateToFinance = (showId: string) => {
    setSelectedShowId(showId);
    setActiveTab('finance');
  };

  const handleOpenNewTaskModal = (showId?: string) => {
    setTaskToEdit(null);
    setTaskModalDefaultShowId(showId || selectedShowId);
    setIsTaskModalOpen(true);
  };

  const handleOpenTaskDetail = (task: ShowTask) => {
    setTaskToEdit(task);
    setTaskModalDefaultShowId(task.showId);
    setIsTaskModalOpen(true);
  };

  const handleOpenNewShowModal = () => {
    setShowToEdit(null);
    setIsShowModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Universal Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewShowModal={handleOpenNewShowModal}
        onOpenNewTaskModal={() => handleOpenNewTaskModal()}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'radar' && (
          <RadarAlerts
            onSelectShow={handleSelectShow}
            onOpenTaskModal={handleOpenTaskDetail}
          />
        )}

        {activeTab === 'shows' && (
          <ShowManagement
            onOpenNewShowModal={handleOpenNewShowModal}
            onSelectShow={handleSelectShow}
            onNavigateToAttendance={handleNavigateToAttendance}
            onNavigateToFinance={handleNavigateToFinance}
          />
        )}

        {activeTab === 'project-plan' && (
          <ProjectPlanTimeline
            selectedShowId={selectedShowId}
            setSelectedShowId={setSelectedShowId}
            onOpenNewTaskModal={handleOpenNewTaskModal}
            onOpenTaskDetail={handleOpenTaskDetail}
          />
        )}

        {activeTab === 'ad-hoc' && (
          <AdHocTasks
            onOpenNewTaskModal={() => handleOpenNewTaskModal()}
            onOpenTaskDetail={handleOpenTaskDetail}
          />
        )}

        {activeTab === 'attendance' && (
          <ShowAttendance
            key={selectedShowId}
            initialShowId={selectedShowId}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView />
        )}

        {activeTab === 'finance' && (
          <FinanceDraft
            key={selectedShowId}
            initialShowId={selectedShowId}
          />
        )}

        {activeTab === 'advances' && (
          <AdvanceSettlement />
        )}

        {activeTab === 'barem' && (
          <PersonnelBarem />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500">
        <p>
          Hệ Thống Vận Hành Sự Kiện & Quản Trị Show © 2026 <strong>Saigon Tếu (SGT OP)</strong> • Tích hợp đồng bộ BAREM OP & 6 Bảng Tính
        </p>
      </footer>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        taskToEdit={taskToEdit}
        defaultShowId={taskModalDefaultShowId}
      />

      <ShowModal
        isOpen={isShowModalOpen}
        onClose={() => setIsShowModalOpen(false)}
        showToEdit={showToEdit}
      />
    </div>
  );
};

export default function App() {
  return (
    <OpsProvider>
      <MainContent />
    </OpsProvider>
  );
}
