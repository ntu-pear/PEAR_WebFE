import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import ActivityDetailsModal from '@/components/Calendar/modals/ActivityDetailsModal';
import AddEditActivityModal from '@/components/Calendar/modals/AddEditActivityModal';
import ConfirmationDialog from '@/components/Calendar/modals/ConfirmationDialog';
import CalendarHeader from '@/components/Calendar/CalendarHeader';
import CalendarSidebar from '@/components/Calendar/CalendarSidebar';
import CentreMonthlyScheduleView from '@/components/Calendar/views/CentreMonthlyScheduleView';
import CentreWeeklyScheduleView from '@/components/Calendar/views/CentreWeeklyScheduleView';
import CentreDailyScheduleView from '@/components/Calendar/views/CentreDailyScheduleView';
import { useCalendarData } from '@/components/Calendar/hooks/useCalendarData';
import { useCalendarActions } from '@/components/Calendar/hooks/useCalendarActions';
import { ViewMode } from '@/components/Calendar/CalendarTypes';

// Care Center Schedule View component
const CentreScheduleView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('centre-monthly');

  // hooks for center activity data and actions
  const {
    activityTemplates,
    scheduledActivities,
    filteredScheduledActivities,
    selectedActivities,
    searchTerm,
    setScheduledActivities,
    setSearchTerm,
    getActivityTemplate,
    handleActivityToggle,
  } = useCalendarData();

  const {
    isActivityDetailsModalOpen,
    setIsActivityDetailsModalOpen,
    selectedActivityForDetails,
    isAddEditActivityModalOpen,
    setIsAddEditActivityModalOpen,
    activityToEdit,
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
  } = useCalendarActions(
    currentDate,
    setCurrentDate,
    scheduledActivities,
    setScheduledActivities
  );

  const renderCalendarView = () => {
    switch (viewMode) {
      case 'centre-monthly':
        return (
          <CentreMonthlyScheduleView
            currentDate={currentDate}
            filteredScheduledActivities={filteredScheduledActivities}
            getActivityTemplate={getActivityTemplate}
            onActivityClick={handleActivityClick}
            onDateClick={(selectedDate: Date) => {setCurrentDate(selectedDate); setViewMode('centre-daily');}}
            onViewModeChange={setViewMode}
          />
        );
      case 'centre-weekly':
        return (
          <CentreWeeklyScheduleView
            currentDate={currentDate}
            filteredScheduledActivities={filteredScheduledActivities}
            getActivityTemplate={getActivityTemplate}
            onActivityClick={handleActivityClick}
          />
        );
      case 'centre-daily':
        return (
          <CentreDailyScheduleView
            currentDate={currentDate}
            filteredScheduledActivities={filteredScheduledActivities}
            getActivityTemplate={getActivityTemplate}
            onActivityClick={handleActivityClick}
          />
        );
      default:
        return (
          <CentreMonthlyScheduleView
            currentDate={currentDate}
            filteredScheduledActivities={filteredScheduledActivities}
            getActivityTemplate={getActivityTemplate}
            onActivityClick={handleActivityClick}
            onDateClick={(selectedDate: Date) => {setCurrentDate(selectedDate); setViewMode('centre-daily');}}
            onViewModeChange={setViewMode}
          />
        );
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
        allowedViewModes={['centre-monthly', 'centre-weekly', 'centre-daily']}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <CalendarSidebar
          activityTemplates={activityTemplates}
          selectedActivities={selectedActivities}
          onActivityToggle={handleActivityToggle}
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

export default CentreScheduleView;
