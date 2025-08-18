import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import ActivityDetailsModal from './modals/ActivityDetailsModal';
import AddEditActivityModal from './modals/AddEditActivityModal';
import ConfirmationDialog from './modals/ConfirmationDialog';
import CalendarHeader from './CalendarHeader';
import CalendarSidebar from './CalendarSidebar';
import PatientScheduleSidebar from './PatientScheduleSidebar';
import MonthView from './views/MonthView';
import WeekView from './views/WeekView';
import DayView from './views/DayView';
import PatientDailyScheduleView from './views/PatientDailyScheduleView';
import PatientWeeklyScheduleView from './views/PatientWeeklyScheduleView';
import { useCalendarData } from './hooks/useCalendarData';
import { usePatientScheduleData } from './hooks/usePatientScheduleData';
import { useCalendarActions } from './hooks/useCalendarActions';
import { ViewMode } from './CalendarTypes';

// Main Calendar View component
const ScheduleCalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

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

  // hooks for patient schedule data
  const {
    activityTemplates: patientActivityTemplates,
    filteredPatients,
    selectedActivities: patientSelectedActivities,
    searchTerm: patientSearchTerm,
    showInactivePatients,
    setSearchTerm: setPatientSearchTerm,
    getActivityTemplate: getPatientActivityTemplate,
    getPatientActivitiesForDate,
    getPatientActivitiesForTimeSlot,
    handleActivityToggle: handlePatientActivityToggle,
    handlePatientStatusToggle,
  } = usePatientScheduleData();

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

  // Handle patient activity clicks (for patient views)
  const handlePatientActivityClick = (activity: any) => {
    // For now, use the same modal as center activities
    // In a real implementation, you might want a separate modal for patient activities
    handleActivityClick(activity);
  };

  // Determine which search term and functions to use based on view mode
  const isPatientView = viewMode === 'patient-daily' || viewMode === 'patient-weekly';
  const currentSearchTerm = isPatientView ? patientSearchTerm : searchTerm;
  const currentSearchSetter = isPatientView ? setPatientSearchTerm : setSearchTerm;

  const renderCalendarView = () => {
    switch (viewMode) {
      case 'month':
        return (
          <MonthView
            currentDate={currentDate}
            filteredScheduledActivities={filteredScheduledActivities}
            getActivityTemplate={getActivityTemplate}
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
            onActivityClick={handleActivityClick}
          />
        );
      case 'day':
        return (
          <DayView
            currentDate={currentDate}
            filteredScheduledActivities={filteredScheduledActivities}
            getActivityTemplate={getActivityTemplate}
            onActivityClick={handleActivityClick}
          />
        );
      case 'patient-daily':
        return (
          <PatientDailyScheduleView
            currentDate={currentDate}
            patients={filteredPatients}
            getPatientActivitiesForTimeSlot={getPatientActivitiesForTimeSlot}
            getActivityTemplate={getPatientActivityTemplate}
            onActivityClick={handlePatientActivityClick}
          />
        );
      case 'patient-weekly':
        return (
          <PatientWeeklyScheduleView
            currentDate={currentDate}
            patients={filteredPatients}
            getPatientActivitiesForDate={getPatientActivitiesForDate}
            getActivityTemplate={getPatientActivityTemplate}
            onActivityClick={handlePatientActivityClick}
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
        searchTerm={currentSearchTerm}
        onGoToToday={goToToday}
        onNavigateDate={navigateDate}
        onViewModeChange={setViewMode}
        onSearchChange={currentSearchSetter}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        {isPatientView ? (
          <PatientScheduleSidebar
            activityTemplates={patientActivityTemplates}
            selectedActivities={patientSelectedActivities}
            showInactivePatients={showInactivePatients}
            onActivityToggle={handlePatientActivityToggle}
            onPatientStatusToggle={handlePatientStatusToggle}
          />
        ) : (
          <CalendarSidebar
            activityTemplates={activityTemplates}
            selectedActivities={selectedActivities}
            onActivityToggle={handleActivityToggle}
          />
        )}

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

export default ScheduleCalendarView;
