import React, { useState, useEffect, useMemo, useCallback } from 'react';
import CalendarHeader from '@/components/Calendar/CalendarHeader';
import PatientScheduleSidebar from '@/components/Calendar/PatientScheduleSidebar';
import PatientDailyScheduleView from '@/components/Calendar/views/PatientDailyScheduleView';
import PatientWeeklyScheduleView from '@/components/Calendar/views/PatientWeeklyScheduleView';
import ActivityDetailsModal from '@/components/Calendar/modals/ActivityDetailsModal';
import { usePatientScheduleData } from '@/components/Calendar/hooks/usePatientScheduleData';
import { CalendarScheduleItem, useSchedulerService } from '@/hooks/scheduler/useSchedulerService';
import { ViewMode } from '@/components/Calendar/CalendarTypes';
import { exportScheduleToCSV } from '@/utils/csvExport';
import { toast } from 'sonner';
import { ScheduledPatientActivity } from '@/api/scheduler/scheduler';

// Patient Schedule View component
const PatientScheduleView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('patient-weekly');
  const [isActivityDetailsModalOpen, setIsActivityDetailsModalOpen] = useState(false);
  const [selectedActivityForDetails, setSelectedActivityForDetails] = useState<any>(null);
  
  // State for managing selected activities from schedule data
  const [selectedScheduleActivities, setSelectedScheduleActivities] = useState<string[]>([]);

  // hooks for patient schedule data
  const {
    searchTerm,
    setSearchTerm,
    getActivityTemplate,
    getPatientActivitiesForDate,
    getPatientActivitiesForTimeSlot,
  } = usePatientScheduleData();

  // hooks for scheduler service
  const {
    isLoading: isGeneratingSchedule,
    scheduleData,
    error: scheduleError,
    generateSchedule,
    getOrGenerateSchedule,
    getPatientScheduleForDate,
    getScheduleForTimeSlot,
  } = useSchedulerService();

  // Derive unique activities from scheduleData and auto-select all
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

  // Function to get patient name for CSV export
  const getPatientNameForExport = useCallback((calendarItem: CalendarScheduleItem) => {
    // Try to get the patient name from schedule data first
    const patientName = calendarItem.patientName;
    if (patientName) {
      return patientName;
    }

    return `Patient ID: ${calendarItem.patientId}`; // default fallback value
  }, [scheduleData]);

  // Function to get patient display name for activity details modal
  const getPatientDisplayNameFromActivity = useCallback((activity: ScheduledPatientActivity) => {
    // Try to get the patient name from schedule data first
    const patientName = activity.patientName;
    if (patientName) {
      return `${patientName} (ID: ${activity.patientId})`;
    }

    return `Patient ID: ${activity.patientId}`; // default fallback value
  }, [scheduleData]);

  // Auto-fetch/generate schedule when component mounts
  useEffect(() => {
    getOrGenerateSchedule();
  }, [getOrGenerateSchedule]); // Include the function in dependency array

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

  // Handle CSV export
  const handleExportSchedule = () => {
    try {
      // Generate filename with today's date
      const today = new Date();
      const todayFormatted = today.toISOString().split('T')[0]; // YYYY-MM-DD format
      const customFilename = `Patient_Schedule_Data_${todayFormatted}`;
      
      const result = exportScheduleToCSV(
        PATIENT_SCHEDULE_CSV_HEADERS,
        scheduleData,
        selectedScheduleActivities,
        getPatientNameForExport, // Use the export-specific function that returns just the patient name
        customFilename // Pass the custom filename
      );
      
      toast.success(
        `${result.recordsExported} activities for ${result.exportDate} exported successfully.`,
        {
          description: `File: ${result.filename}`,
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Export failed: ${errorMessage}.`);
    }
  };

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
        patientName: scheduleItem.patientName,
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
        patientName: scheduleItem.patientName,
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

  // Memoize patients list to prevent unnecessary API calls
  const patientsFromSchedule = useMemo(() => {
    if (scheduleData.length === 0) return [];
    
    return Array.from(new Set(scheduleData.map(item => item.patientId)))
      .map(patientId => {
        // Find the first schedule item for this patient to get the preferred name
        const scheduleItem = scheduleData.find(item => item.patientId === patientId);
        return {
          id: String(patientId),
          name: scheduleItem ? `${scheduleItem.patientName} (ID: ${patientId})` : `Patient ID: ${patientId}`,
          isActive: true
        };
      });
  }, [scheduleData]);

  // Handle view mode change - only allow patient view modes
  const handleViewModeChange = (newViewMode: ViewMode) => {
    if (newViewMode === 'patient-daily' || newViewMode === 'patient-weekly') {
      setViewMode(newViewMode);
    }
  };

  const renderCalendarView = () => {
    // Show loading state while generating schedule
    if (isGeneratingSchedule && scheduleData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading schedule...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
          </div>
        </div>
      );
    }

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
        showExportButton={scheduleData.length > 0 && selectedScheduleActivities.length > 0}
        onExportSchedule={handleExportSchedule}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <PatientScheduleSidebar
          activityTemplates={activitiesFromSchedule} // Use derived activities from scheduler response
          selectedActivities={selectedScheduleActivities} // Use schedule-based selected activities
          onActivityToggle={handleScheduleActivityToggle}
          // Scheduler props
          isGeneratingSchedule={isGeneratingSchedule}
          scheduleData={scheduleData}
          scheduleError={scheduleError}
          onGenerateSchedule={getOrGenerateSchedule}
          onRegenerateSchedule={generateSchedule}
        />

        {/* Main Calendar Content */}
        <main className="flex-1 min-w-0 p-4 bg-gray-100 relative overflow-auto">
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
          getPatientDisplayName={getPatientDisplayNameFromActivity}
        />
      )}
    </div>
  );
};

export default PatientScheduleView;

// CSV Headers for Patient Schedule Export
export const PATIENT_SCHEDULE_CSV_HEADERS = [
  'Patient ID',
  'Patient Preferred Name', 
  'Activity Name',
  'Date',
  'Day',
  'Start Time',
  'End Time',
  'Duration'
] as const;