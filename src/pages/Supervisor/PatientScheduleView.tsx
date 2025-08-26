import React, { useState } from 'react';
import CalendarHeader from '@/components/Calendar/CalendarHeader';
import PatientScheduleSidebar from '@/components/Calendar/PatientScheduleSidebar';
import PatientDailyScheduleView from '@/components/Calendar/views/PatientDailyScheduleView';
import PatientWeeklyScheduleView from '@/components/Calendar/views/PatientWeeklyScheduleView';
import ActivityDetailsModal from '@/components/Calendar/modals/ActivityDetailsModal';
import { usePatientScheduleData } from '@/components/Calendar/hooks/usePatientScheduleData';
import { ViewMode } from '@/components/Calendar/CalendarTypes';

// Patient Schedule View component
const PatientScheduleView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('patient-daily');
  const [isActivityDetailsModalOpen, setIsActivityDetailsModalOpen] = useState(false);
  const [selectedActivityForDetails, setSelectedActivityForDetails] = useState<any>(null);

  // hooks for patient schedule data
  const {
    activityTemplates,
    filteredPatients,
    selectedActivities,
    searchTerm,
    showInactivePatients,
    setSearchTerm,
    getActivityTemplate,
    getPatientActivitiesForDate,
    getPatientActivitiesForTimeSlot,
    handleActivityToggle,
    handlePatientStatusToggle,
  } = usePatientScheduleData();

  // Handle patient activity clicks
  const handlePatientActivityClick = (activity: any) => {
    setSelectedActivityForDetails(activity);
    setIsActivityDetailsModalOpen(true);
  };

  // Navigation functions
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const navigateDate = (amount: number, unit: ViewMode) => {
    const newDate = new Date(currentDate);
    
    switch (unit) {
      case 'day':
      case 'centre-daily':
      case 'patient-daily':
        newDate.setDate(newDate.getDate() + amount);
        break;
      case 'week':
      case 'centre-weekly':
      case 'patient-weekly':
        newDate.setDate(newDate.getDate() + (amount * 7));
        break;
      case 'month':
      case 'centre-monthly':
        newDate.setMonth(newDate.getMonth() + amount);
        break;
    }
    
    setCurrentDate(newDate);
  };

  // Handle view mode change - only allow patient view modes
  const handleViewModeChange = (newViewMode: ViewMode) => {
    if (newViewMode === 'patient-daily' || newViewMode === 'patient-weekly') {
      setViewMode(newViewMode);
    }
  };

  const renderCalendarView = () => {
    switch (viewMode) {
      case 'patient-daily':
        return (
          <PatientDailyScheduleView
            currentDate={currentDate}
            patients={filteredPatients}
            getPatientActivitiesForTimeSlot={getPatientActivitiesForTimeSlot}
            getActivityTemplate={getActivityTemplate}
            onActivityClick={handlePatientActivityClick}
          />
        );
      case 'patient-weekly':
        return (
          <PatientWeeklyScheduleView
            currentDate={currentDate}
            patients={filteredPatients}
            getPatientActivitiesForDate={getPatientActivitiesForDate}
            getActivityTemplate={getActivityTemplate}
            onActivityClick={handlePatientActivityClick}
          />
        );
      default:
        return (
          <PatientDailyScheduleView
            currentDate={currentDate}
            patients={filteredPatients}
            getPatientActivitiesForTimeSlot={getPatientActivitiesForTimeSlot}
            getActivityTemplate={getActivityTemplate}
            onActivityClick={handlePatientActivityClick}
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
        onViewModeChange={handleViewModeChange}
        onSearchChange={setSearchTerm}
        allowedViewModes={['patient-daily', 'patient-weekly']}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <PatientScheduleSidebar
          activityTemplates={activityTemplates}
          selectedActivities={selectedActivities}
          showInactivePatients={showInactivePatients}
          onActivityToggle={handleActivityToggle}
          onPatientStatusToggle={handlePatientStatusToggle}
        />

        {/* Main Calendar Content */}
        <main className="flex-1 p-4 bg-gray-100 overflow-hidden">
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
          handleEditActivity={() => {}} // No edit functionality for patient activities
          handleDeleteActivity={() => {}} // No delete functionality for patient activities
        />
      )}
    </div>
  );
};

export default PatientScheduleView;
