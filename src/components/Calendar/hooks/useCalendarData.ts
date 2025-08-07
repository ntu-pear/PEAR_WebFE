import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ActivityExclusion, 
  ActivityTemplate, 
  getActivityExclusions, 
  getActivityTemplates, 
  getPatients, 
  getCentreActivities,
  getPatientActivities,
  Patient, 
  ScheduledPatientActivity,
  ScheduledCentreActivity
} from '@/api/activity/activity';
import { useAuth } from '@/hooks/useAuth';

export const useCalendarData = () => {
  const { currentUser } = useAuth();
  const isSupervisor = currentUser?.roleName === 'SUPERVISOR';
  
  const [patientsData, setPatientsData] = useState<Patient[]>([]);
  const [activityTemplates, setActivityTemplates] = useState<ActivityTemplate[]>([]);
  const [scheduledActivities, setScheduledActivities] = useState<(ScheduledPatientActivity | ScheduledCentreActivity)[]>([]);
  const [activityExclusions, setActivityExclusions] = useState<ActivityExclusion[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const getPatient = useCallback((id: string) => patientsData.find(p => p.id === id), [patientsData]);
  const getActivityTemplate = useCallback((id: string) => activityTemplates.find(a => a.id === id), [activityTemplates]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Always fetch activity templates
        const activityTemplates = await getActivityTemplates();
        setActivityTemplates(activityTemplates);
        setSelectedActivities(activityTemplates.map(a => a.id));

        if (isSupervisor) {
          // For supervisors: fetch only centre activities, no patients or exclusions
          const centreActivities = await getCentreActivities();
          setScheduledActivities(centreActivities);
          setPatientsData([]);
          setActivityExclusions([]);
          setSelectedPatients([]);
        } else {
          // For caregivers: fetch patients, patient activities, and exclusions
          const patients = await getPatients();
          setPatientsData(patients);
          setSelectedPatients(patients.filter(p => p.isActive).map(p => p.id));

          const patientActivities = await getPatientActivities();
          setScheduledActivities(patientActivities);

          const exclusions = await getActivityExclusions();
          setActivityExclusions(exclusions);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [isSupervisor]);

  // Filtered scheduled activities based on selected patients, activities, and search term
  const filteredScheduledActivities = useMemo(() => {
    return scheduledActivities.filter(activity => {
      const activityTemplate = getActivityTemplate(activity.activityTemplateId);

      if (isSupervisor) {
        // For supervisors: filter only by activity type and search term (activity name only)
        const matchesActivity = selectedActivities.includes(activity.activityTemplateId);
        const matchesSearch = searchTerm === '' ||
          activityTemplate?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.notes?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesActivity && matchesSearch;
      } else {
        // For caregivers: filter by patients, activities, and search term
        const patientActivity = activity as ScheduledPatientActivity;
        const patient = getPatient(patientActivity.patientId);

        // Check if the activity is covered by any exclusion
        const isCurrentlyExcluded = activityExclusions.some(ex =>
          ex.activityTemplateId === patientActivity.activityTemplateId &&
          ex.patientId === patientActivity.patientId &&
          patientActivity.date >= ex.startDate && patientActivity.date <= ex.endDate
        );

        // Update the activity's isExcluded status based on current exclusions
        patientActivity.isExcluded = isCurrentlyExcluded;

        const matchesPatient = selectedPatients.includes(patientActivity.patientId);
        const matchesActivity = selectedActivities.includes(patientActivity.activityTemplateId);
        const matchesSearch = searchTerm === '' ||
          patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activityTemplate?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patientActivity.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patientActivity.exclusionReason?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesPatient && matchesActivity && matchesSearch;
      }
    });
  }, [selectedPatients, selectedActivities, searchTerm, scheduledActivities, activityExclusions, getPatient, getActivityTemplate, isSupervisor]);

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
    isSupervisor,
    
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
