import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ActivityTemplate, 
  getActivityTemplates,
  getCentreActivities,
  ScheduledCentreActivity
} from '@/api/activity/activity';

export const useCalendarData = () => {
  const [activityTemplates, setActivityTemplates] = useState<ActivityTemplate[]>([]);
  const [scheduledActivities, setScheduledActivities] = useState<ScheduledCentreActivity[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const getActivityTemplate = useCallback((id: string) => activityTemplates.find(a => a.id === id), [activityTemplates]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch activity templates and centre activities
        const activityTemplates = await getActivityTemplates();
        setActivityTemplates(activityTemplates);
        setSelectedActivities(activityTemplates.map((a: ActivityTemplate) => a.id));

        const centreActivities = await getCentreActivities();
        setScheduledActivities(centreActivities);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  // Filtered scheduled activities based on selected activities and search term
  const filteredScheduledActivities = useMemo(() => {
    return scheduledActivities.filter(activity => {
      const activityTemplate = getActivityTemplate(activity.activityTemplateId);

      // Filter by activity type and search term (activity name only)
      const matchesActivity = selectedActivities.includes(activity.activityTemplateId);
      const matchesSearch = searchTerm === '' ||
        activityTemplate?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.notes?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesActivity && matchesSearch;
    });
  }, [selectedActivities, searchTerm, scheduledActivities, getActivityTemplate]);

  // Filter handlers
  const handleActivityToggle = useCallback((activityId: string, checked: boolean) => {
    setSelectedActivities(prev =>
      checked ? [...prev, activityId] : prev.filter(id => id !== activityId)
    );
  }, []);

  return {
    // Data
    activityTemplates,
    scheduledActivities,
    filteredScheduledActivities,
    selectedActivities,
    searchTerm,
    
    // Setters
    setActivityTemplates,
    setScheduledActivities,
    setSearchTerm,
    
    // Helpers
    getActivityTemplate,
    
    // Handlers
    handleActivityToggle,
  };
};
