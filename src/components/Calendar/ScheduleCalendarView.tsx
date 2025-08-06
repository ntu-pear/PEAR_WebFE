import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import ActivityDetailsModal from './modals/ActivityDetailsModal';
import AddEditActivityModal from './modals/AddEditActivityModal';
import ExclusionManagementModal from './modals/ExclusionManagementModal';
import ConfirmationDialog from './modals/ConfirmationDialog';
import CalendarHeader from './CalendarHeader';
import CalendarSidebar from './CalendarSidebar';
import MonthView from './views/MonthView';
import WeekView from './views/WeekView';
import DayView from './views/DayView';
import { useCalendarData } from './hooks/useCalendarData';
import { useCalendarActions } from './hooks/useCalendarActions';
import { ViewMode } from './CalendarTypes';

// Main Calendar View component
const ScheduleCalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  // hooks for data and actions
  const {
    patientsData,
    activityTemplates,
    scheduledActivities,
    activityExclusions,
    filteredScheduledActivities,
    selectedPatients,
    selectedActivities,
    searchTerm,
    setScheduledActivities,
    setActivityExclusions,
    setSearchTerm,
    getPatient,
    getActivityTemplate,
    handlePatientToggle,
    handleActivityToggle,
  } = useCalendarData();

  const {
    isActivityDetailsModalOpen,
    setIsActivityDetailsModalOpen,
    selectedActivityForDetails,
    isAddEditActivityModalOpen,
    setIsAddEditActivityModalOpen,
    activityToEdit,
    isExclusionManagementModalOpen,
    setIsExclusionManagementModalOpen,
    exclusionToManage,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    confirmAction,
    confirmMessage,
    goToToday,
    navigateDate,
    handleActivityClick,
    handleAddActivity,
    handleEditActivity,
    handleDeleteActivity,
    handleSaveActivity,
    handleCreateExclusionFromActivity,
    handleSaveExclusion,
    handleDeleteExclusion,
    handleEditExclusion,
    handleManageExclusions,
  } = useCalendarActions(
    currentDate,
    setCurrentDate,
    scheduledActivities,
    setScheduledActivities,
    activityExclusions,
    setActivityExclusions
  );

  const renderCalendarView = () => {
    switch (viewMode) {
      case 'month':
        return (
          <MonthView
            currentDate={currentDate}
            filteredScheduledActivities={filteredScheduledActivities}
            getActivityTemplate={getActivityTemplate}
            getPatient={getPatient}
            onActivityClick={handleActivityClick}
            onDateClick={(selectedDate: Date) => {setCurrentDate(selectedDate); setViewMode('day');}}
            onViewModeChange={setViewMode}
          />
        );
      case 'week':
        return (
          <WeekView
            currentDate={currentDate}
            filteredScheduledActivities={filteredScheduledActivities}
            getActivityTemplate={getActivityTemplate}
            getPatient={getPatient}
            onActivityClick={handleActivityClick}
          />
        );
      case 'day':
        return (
          <DayView
            currentDate={currentDate}
            filteredScheduledActivities={filteredScheduledActivities}
            getActivityTemplate={getActivityTemplate}
            getPatient={getPatient}
            onActivityClick={handleActivityClick}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans antialiased">
      {/* Header Bar */}
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        searchTerm={searchTerm}
        onGoToToday={goToToday}
        onNavigateDate={navigateDate}
        onViewModeChange={setViewMode}
        onSearchChange={setSearchTerm}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <CalendarSidebar
          patientsData={patientsData}
          activityTemplates={activityTemplates}
          activityExclusions={activityExclusions}
          selectedPatients={selectedPatients}
          selectedActivities={selectedActivities}
          getPatient={getPatient}
          getActivityTemplate={getActivityTemplate}
          onPatientToggle={handlePatientToggle}
          onActivityToggle={handleActivityToggle}
          onEditExclusion={handleEditExclusion}
          onDeleteExclusion={handleDeleteExclusion}
          onManageExclusions={handleManageExclusions}
        />

        {/* Main Calendar Content */}
        <main className="flex-1 p-4 bg-gray-100 overflow-hidden relative">
          <Button
            className="fixed bottom-4 right-4 z-20 rounded-full h-14 w-14 text-lg shadow-xl bg-blue-600 hover:bg-blue-700 transition-colors"
            onClick={handleAddActivity}
          >
            +
          </Button>

          {renderCalendarView()}
        </main>
      </div>

      {/* Activity Details Modal */}
      {selectedActivityForDetails && (
        <ActivityDetailsModal
          isOpen={isActivityDetailsModalOpen}
          onClose={() => setIsActivityDetailsModalOpen(false)}
          activity={selectedActivityForDetails}
          getActivityTemplate={getActivityTemplate}
          getPatient={getPatient}
          handleCreateExclusionFromActivity={handleCreateExclusionFromActivity}
          handleEditActivity={handleEditActivity}
          handleDeleteActivity={handleDeleteActivity}
        />
      )}

      {/* Add/Edit Activity Modal */}
      <AddEditActivityModal
        isOpen={isAddEditActivityModalOpen}
        onClose={() => setIsAddEditActivityModalOpen(false)}
        activity={activityToEdit}
        onSave={handleSaveActivity}
        patients={patientsData}
        activityTemplates={activityTemplates}
      />

      {/* Exclusion Management Modal */}
      <ExclusionManagementModal
        isOpen={isExclusionManagementModalOpen}
        onClose={() => setIsExclusionManagementModalOpen(false)}
        exclusion={exclusionToManage}
        onSave={handleSaveExclusion}
        patients={patientsData}
        activityTemplates={activityTemplates}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        message={confirmMessage}
        confirmAction={confirmAction}
      />
    </div>
  );
};

export default ScheduleCalendarView;
