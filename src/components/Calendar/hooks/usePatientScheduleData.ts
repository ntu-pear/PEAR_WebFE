import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ActivityTemplate, 
  Patient,
  ScheduledPatientActivity,
  getActivityTemplates,
  getPatients,
  getPatientActivities
} from '@/api/activity/activity';

export interface PatientScheduleData {
  patient: Patient;
  activities: ScheduledPatientActivity[];
}

export const usePatientScheduleData = () => {
  const [activityTemplates, setActivityTemplates] = useState<ActivityTemplate[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientActivities, setPatientActivities] = useState<ScheduledPatientActivity[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showInactivePatients, setShowInactivePatients] = useState<boolean>(false);

  const getActivityTemplate = useCallback((id: string) => activityTemplates.find(a => a.id === id), [activityTemplates]);
  const getPatient = useCallback((id: string) => patients.find(p => p.id === id), [patients]);

  useEffect(() => {
    // all this is mock data, can be removed once scheduler is implemented
    // const fetchData = async () => {
    //   try {
    //     // Fetch all required data
    //     const [templates, patientsData, activitiesData] = await Promise.all([
    //       getActivityTemplates(),
    //       getPatients(),
    //       getPatientActivities()
    //     ]);

    //     setActivityTemplates(templates);
    //     setSelectedActivities(templates.map((a: ActivityTemplate) => a.id));
    //     setPatients(patientsData);
    //     setPatientActivities(activitiesData);
    //   } catch (error) {
    //     console.error("Failed to fetch patient schedule data:", error);
    //   }
    // };

    // fetchData();
  }, []);

  // Filtered patients based on active status and search term
  const filteredPatients = useMemo(() => {
    return patients.filter(patient => {
      const matchesStatus = showInactivePatients || patient.isActive;
      const matchesSearch = searchTerm === '' ||
        patient.name.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [patients, showInactivePatients, searchTerm]);

  // Filtered patient activities based on selected activity types (search term should not filter activities)
  const filteredPatientActivities = useMemo(() => {
    return patientActivities.filter(activity => {
      const matchesActivityType = selectedActivities.includes(activity.activityTemplateId);
      
      return matchesActivityType && !activity.isExcluded;
    });
  }, [patientActivities, selectedActivities]);

  // Get patient schedule data combining patients with their activities
  const patientScheduleData = useMemo((): PatientScheduleData[] => {
    return filteredPatients.map(patient => ({
      patient,
      activities: filteredPatientActivities.filter(activity => activity.patientId === patient.id)
    }));
  }, [filteredPatients, filteredPatientActivities]);

  // Get activities for a specific patient and date
  const getPatientActivitiesForDate = useCallback((patientId: string, date: string) => {
    return filteredPatientActivities.filter(activity => 
      activity.patientId === patientId && activity.date === date
    );
  }, [filteredPatientActivities]);

  // Get activities for a specific patient, date, and time slot
  const getPatientActivitiesForTimeSlot = useCallback((patientId: string, date: string, timeSlot: string) => {
    return filteredPatientActivities.filter(activity => {
      if (activity.patientId !== patientId || activity.date !== date) return false;
      
      // Parse time slot (e.g., "10:00" -> hour: 10)
      const slotHour = parseInt(timeSlot.split(':')[0]);
      const slotStart = slotHour * 60; // Convert to minutes
      const slotEnd = slotStart + 60; // 1-hour slot
      
      // Parse activity start and end times
      const [activityStartHour, activityStartMinute] = activity.startTime.split(':').map(Number);
      const [activityEndHour, activityEndMinute] = activity.endTime.split(':').map(Number);
      
      const activityStart = activityStartHour * 60 + activityStartMinute; // Convert to minutes
      const activityEnd = activityEndHour * 60 + activityEndMinute; // Convert to minutes
      
      // Check if activity overlaps with the time slot
      // Activity overlaps if it starts before slot ends AND ends after slot starts
      return activityStart < slotEnd && activityEnd > slotStart;
    });
  }, [filteredPatientActivities]);

  // Filter handlers
  const handleActivityToggle = useCallback((activityId: string, checked: boolean) => {
    setSelectedActivities(prev =>
      checked ? [...prev, activityId] : prev.filter(id => id !== activityId)
    );
  }, []);

  const handlePatientStatusToggle = useCallback((showInactive: boolean) => {
    setShowInactivePatients(showInactive);
  }, []);

  return {
    // Data
    activityTemplates,
    patients,
    patientActivities,
    patientScheduleData,
    filteredPatients,
    filteredPatientActivities,
    selectedActivities,
    searchTerm,
    showInactivePatients,
    
    // Setters
    setActivityTemplates,
    setPatients,
    setPatientActivities,
    setSearchTerm,
    
    // Helpers
    getActivityTemplate,
    getPatient,
    getPatientActivitiesForDate,
    getPatientActivitiesForTimeSlot,
    
    // Handlers
    handleActivityToggle,
    handlePatientStatusToggle,
  };
};
