import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ActivityExclusion, 
  ActivityTemplate, 
  getActivityExclusions, 
  getActivityTemplates, 
  getPatients, 
  getScheduledActivities, 
  Patient, 
  ScheduledActivity 
} from '@/api/activity/activity';

export const useCalendarData = () => {
  const [patientsData, setPatientsData] = useState<Patient[]>([]);
  const [activityTemplates, setActivityTemplates] = useState<ActivityTemplate[]>([]);
  const [scheduledActivities, setScheduledActivities] = useState<ScheduledActivity[]>([]);
  const [activityExclusions, setActivityExclusions] = useState<ActivityExclusion[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const getPatient = useCallback((id: string) => patientsData.find(p => p.id === id), [patientsData]);
  const getActivityTemplate = useCallback((id: string) => activityTemplates.find(a => a.id === id), [activityTemplates]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patients = await getPatients();
        setPatientsData(patients);
        setSelectedPatients(patients.filter(p => p.isActive).map(p => p.id));

        const activityTemplates = await getActivityTemplates();
        setActivityTemplates(activityTemplates);
        setSelectedActivities(activityTemplates.map(a => a.id));

        const scheduledActivities = await getScheduledActivities();
        setScheduledActivities(scheduledActivities);

        const exclusions = await getActivityExclusions();
        setActivityExclusions(exclusions);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  // Filtered scheduled activities based on selected patients, activities, and search term
  const filteredScheduledActivities = useMemo(() => {
    return scheduledActivities.filter(activity => {
      const patient = getPatient(activity.patientId);
      const activityTemplate = getActivityTemplate(activity.activityTemplateId);

      // Check if the activity is covered by any exclusion
      const isCurrentlyExcluded = activityExclusions.some(ex =>
        ex.activityTemplateId === activity.activityTemplateId &&
        ex.patientId === activity.patientId &&
        activity.date >= ex.startDate && activity.date <= ex.endDate
      );

      // Update the activity's isExcluded status based on current exclusions
      activity.isExcluded = isCurrentlyExcluded;

      const matchesPatient = selectedPatients.includes(activity.patientId);
      const matchesActivity = selectedActivities.includes(activity.activityTemplateId);
      const matchesSearch = searchTerm === '' ||
        patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activityTemplate?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.exclusionReason?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesPatient && matchesActivity && matchesSearch;
    });
  }, [selectedPatients, selectedActivities, searchTerm, scheduledActivities, activityExclusions, getPatient, getActivityTemplate]);

  // Filter handlers
  const handlePatientToggle = useCallback((patientId: string, checked: boolean) => {
    setSelectedPatients(prev =>
      checked ? [...prev, patientId] : prev.filter(id => id !== patientId)
    );
  }, []);

  const handleActivityToggle = useCallback((activityId: string, checked: boolean) => {
    setSelectedActivities(prev =>
      checked ? [...prev, activityId] : prev.filter(id => id !== activityId)
    );
  }, []);

  return {
    // Data
    patientsData,
    activityTemplates,
    scheduledActivities,
    activityExclusions,
    filteredScheduledActivities,
    selectedPatients,
    selectedActivities,
    searchTerm,
    
    // Setters
    setPatientsData,
    setActivityTemplates,
    setScheduledActivities,
    setActivityExclusions,
    setSearchTerm,
    
    // Helpers
    getPatient,
    getActivityTemplate,
    
    // Handlers
    handlePatientToggle,
    handleActivityToggle,
  };
};
