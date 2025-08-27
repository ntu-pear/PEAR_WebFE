import React, { useState, useEffect, useMemo, useCallback } from 'react';
import CalendarHeader from '@/components/Calendar/CalendarHeader';
import PatientScheduleSidebar from '@/components/Calendar/PatientScheduleSidebar';
import PatientDailyScheduleView from '@/components/Calendar/views/PatientDailyScheduleView';
import PatientWeeklyScheduleView from '@/components/Calendar/views/PatientWeeklyScheduleView';
import ActivityDetailsModal from '@/components/Calendar/modals/ActivityDetailsModal';
import { usePatientScheduleData } from '@/components/Calendar/hooks/usePatientScheduleData';
import { useSchedulerService } from '@/hooks/scheduler/useSchedulerService';
import { ViewMode } from '@/components/Calendar/CalendarTypes';

// Patient Schedule View component
const PatientScheduleView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('patient-weekly');
  const [isActivityDetailsModalOpen, setIsActivityDetailsModalOpen] = useState(false);
  const [selectedActivityForDetails, setSelectedActivityForDetails] = useState<any>(null);
  
  // State for managing selected activities from schedule data
  const [selectedScheduleActivities, setSelectedScheduleActivities] = useState<string[]>([]);

  // hooks for patient schedule data (only need some parts)
  const {
    searchTerm,
    showInactivePatients,
    setSearchTerm,
    getActivityTemplate,
    getPatientActivitiesForDate,
    getPatientActivitiesForTimeSlot,
    handlePatientStatusToggle,
  } = usePatientScheduleData();

  // hooks for scheduler service
  const {
    isLoading: isGeneratingSchedule,
    scheduleData,
    error: scheduleError,
    generateSchedule,
    clearSchedule,
    getPatientScheduleForDate,
    getScheduleForTimeSlot,
  } = useSchedulerService();

  // Derive unique activities from scheduleData and auto-select them
  const activitiesFromSchedule = useMemo(() => {
    if (!Array.isArray(scheduleData)) return [];
    const activityMap = new Map();
    scheduleData.forEach((item) => {
      if (!activityMap.has(item.activityName)) {
        activityMap.set(item.activityName, {
          id: item.activityName,
          name: item.activityName,
          type: item.activityName === 'Free and Easy' ? 'free_easy' : 'routine',
        });
      }
    });
    return Array.from(activityMap.values());
  }, [scheduleData]);

  // Auto-select all activities when schedule data changes
  useEffect(() => {
    if (activitiesFromSchedule.length > 0) {
      setSelectedScheduleActivities(activitiesFromSchedule.map(activity => activity.id));
    } else {
      setSelectedScheduleActivities([]);
    }
  }, [activitiesFromSchedule]);

  // Handler for activity toggle
  const handleScheduleActivityToggle = useCallback((activityId: string, checked: boolean) => {
    setSelectedScheduleActivities(prev =>
      checked ? [...prev, activityId] : prev.filter(id => id !== activityId)
    );
  }, []);

  // Handle patient activity clicks
  const handlePatientActivityClick = (activity: any) => {
    setSelectedActivityForDetails(activity);
    setIsActivityDetailsModalOpen(true);
  };

  // Enhanced function to get patient activities including generated schedule
  const getEnhancedPatientActivitiesForTimeSlot = (patientId: string, date: string, timeSlot: string) => {
    // Get original patient activities for this time slot
    const originalActivities = getPatientActivitiesForTimeSlot(patientId, date, timeSlot);
    
    // Convert string patient ID to number for matching with scheduler API
    // Patient IDs are now numeric strings like '1', '2' etc.
    const numericPatientId = parseInt(patientId);
    
    // Get generated schedule activities for this time slot
    const scheduledActivities = getScheduleForTimeSlot(date, timeSlot)
      .filter(scheduleItem => 
        scheduleItem.patientId === numericPatientId &&
        selectedScheduleActivities.includes(scheduleItem.activityName) // Filter by selected activities
      )
      .map(scheduleItem => ({
        id: scheduleItem.id,
        patientId: patientId, // Keep the original string format for calendar
        activityTemplateId: `generated-${scheduleItem.id}`, // Use unique ID to identify each generated activity
        startTime: scheduleItem.startTime,
        endTime: scheduleItem.endTime,
        date: scheduleItem.date, // Already in YYYY-MM-DD format from scheduler
        isOverridden: false,
        isExcluded: false,
        notes: '', // Remove the notes field with the activity name
        generatedActivity: scheduleItem.activityName, // Custom field for generated activities
        isGenerated: true, // Flag to identify generated activities
      }));
    
    return [...originalActivities, ...scheduledActivities];
  };

  // Enhanced function to get patient activities for date including generated schedule
  const getEnhancedPatientActivitiesForDate = (patientId: string, date: string) => {
    // Get original patient activities
    const originalActivities = getPatientActivitiesForDate(patientId, date);
    
    // Convert string patient ID to number for matching with scheduler API
    // Patient IDs are now numeric strings like '1', '2' etc.
    const numericPatientId = parseInt(patientId);
    
    // Get generated schedule activities for this date
    const scheduledActivities = getPatientScheduleForDate(numericPatientId, date)
      .filter(scheduleItem => 
        selectedScheduleActivities.includes(scheduleItem.activityName) // Filter by selected activities
      )
      .map(scheduleItem => ({
        id: scheduleItem.id,
        patientId: patientId, // Keep the original string format for calendar
        activityTemplateId: `generated-${scheduleItem.id}`, // Use unique ID to identify each generated activity
        startTime: scheduleItem.startTime,
        endTime: scheduleItem.endTime,
        date: scheduleItem.date, // Already in YYYY-MM-DD format from scheduler
        isOverridden: false,
        isExcluded: false,
        notes: '', // Remove the notes field with the activity name
        generatedActivity: scheduleItem.activityName, // Custom field for generated activities
        isGenerated: true, // Flag to identify generated activities
      }));
    
    return [...originalActivities, ...scheduledActivities];
  };

  // Enhanced activity template function to handle generated activities
  const getEnhancedActivityTemplate = (id: string) => {
    // Check if it's a generated activity
    if (id.startsWith('generated-')) {
      // Extract the schedule item ID
      const scheduleItemId = id.replace('generated-', '');
      
      // Find the corresponding schedule item to get the actual activity name
      const scheduleItem = scheduleData.find(item => item.id === scheduleItemId);
      
      if (scheduleItem) {
        // Determine activity type based on name
        const activityType: 'free_easy' | 'routine' = scheduleItem.activityName.toLowerCase().includes('free and easy') ? 'free_easy' : 'routine';
        
        return {
          id: id,
          name: scheduleItem.activityName, // Use the actual activity name from the scheduler
          type: activityType,
          isRarelyScheduled: false,
        };
      }
      
      // Fallback if schedule item not found
      return {
        id: id,
        name: 'Generated Activity',
        type: 'routine' as const,
        isRarelyScheduled: false,
      };
    }
    return getActivityTemplate(id);
  };

  // Navigation functions
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const navigateDate = (amount: number, unit: ViewMode) => {
    const newDate = new Date(currentDate);
    
    switch (unit) {
      case 'centre-daily':
      case 'patient-daily':
        newDate.setDate(newDate.getDate() + amount);
        break;
      case 'centre-weekly':
      case 'patient-weekly':
        newDate.setDate(newDate.getDate() + (amount * 7));
        break;
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
    // Get unique patients from schedule data, not from mock patients
    const patientsFromSchedule = scheduleData.length > 0 
      ? Array.from(new Set(scheduleData.map(item => item.patientId)))
          .map(patientId => ({
            id: String(patientId),
            name: String(patientId), // Use ID as name as requested
            isActive: true
          }))
      : [];
    
    // Apply search filter to patients
    const filteredPatientsFromSchedule = patientsFromSchedule.filter(patient =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    switch (viewMode) {
      case 'patient-daily':
        return (
          <PatientDailyScheduleView
            currentDate={currentDate}
            patients={filteredPatientsFromSchedule}
            getPatientActivitiesForTimeSlot={getEnhancedPatientActivitiesForTimeSlot}
            getActivityTemplate={getEnhancedActivityTemplate}
            onActivityClick={handlePatientActivityClick}
          />
        );
      case 'patient-weekly':
        return (
          <PatientWeeklyScheduleView
            currentDate={currentDate}
            patients={filteredPatientsFromSchedule}
            getPatientActivitiesForDate={getEnhancedPatientActivitiesForDate}
            getActivityTemplate={getEnhancedActivityTemplate}
            onActivityClick={handlePatientActivityClick}
          />
        );
      default:
        return (
          <PatientDailyScheduleView
            currentDate={currentDate}
            patients={filteredPatientsFromSchedule}
            getPatientActivitiesForTimeSlot={getEnhancedPatientActivitiesForTimeSlot}
            getActivityTemplate={getEnhancedActivityTemplate}
            onActivityClick={handlePatientActivityClick}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen">
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

      <div className="flex flex-1 overflow-y-auto">
        {/* Left Sidebar */}
        <PatientScheduleSidebar
          activityTemplates={activitiesFromSchedule} // Use derived activities from schedule
          selectedActivities={selectedScheduleActivities} // Use schedule-based selected activities
          showInactivePatients={showInactivePatients}
          onActivityToggle={handleScheduleActivityToggle} // Use new handler
          onPatientStatusToggle={handlePatientStatusToggle}
          // Scheduler props
          isGeneratingSchedule={isGeneratingSchedule}
          scheduleData={scheduleData}
          scheduleError={scheduleError}
          onGenerateSchedule={generateSchedule}
          onClearSchedule={clearSchedule}
        />

        {/* Main Calendar Content */}
        <main className="flex-1 p-4 bg-gray-100 relative">
          {renderCalendarView()}
        </main>
      </div>

      {/* Activity Details Modal */}
      {selectedActivityForDetails && (
        <ActivityDetailsModal
          isOpen={isActivityDetailsModalOpen}
          onClose={() => setIsActivityDetailsModalOpen(false)}
          activity={selectedActivityForDetails}
          getActivityTemplate={getEnhancedActivityTemplate}
        />
      )}
    </div>
  );
};

export default PatientScheduleView;
