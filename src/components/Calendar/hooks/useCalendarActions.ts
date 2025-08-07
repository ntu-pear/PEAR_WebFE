import { useState, useCallback } from 'react';
import { addMonths, addWeeks, addDays } from 'date-fns';
import { toast } from 'sonner';
import { 
  addActivityExclusion, 
  addCentreActivity, 
  deleteCentreActivity,
  deleteActivityExclusion,
  updateActivityExclusion, 
  updateCentreActivity, 
  ActivityExclusion, 
  ScheduledPatientActivity,
  ScheduledCentreActivity
} from '@/api/activity/activity';
import { ViewMode } from '../CalendarTypes';

export const useCalendarActions = (
  currentDate: Date,
  setCurrentDate: (date: Date) => void,
  scheduledActivities: (ScheduledPatientActivity | ScheduledCentreActivity)[],
  setScheduledActivities: (activities: (ScheduledPatientActivity | ScheduledCentreActivity)[]) => void,
  activityExclusions: ActivityExclusion[],
  setActivityExclusions: (exclusions: ActivityExclusion[]) => void
) => {
  // Modal states
  const [isActivityDetailsModalOpen, setIsActivityDetailsModalOpen] = useState(false);
  const [selectedActivityForDetails, setSelectedActivityForDetails] = useState<ScheduledPatientActivity | ScheduledCentreActivity | null>(null);
  const [isAddEditActivityModalOpen, setIsAddEditActivityModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<ScheduledPatientActivity | ScheduledCentreActivity | null>(null);
  const [isExclusionManagementModalOpen, setIsExclusionManagementModalOpen] = useState(false);
  const [exclusionToManage, setExclusionToManage] = useState<ActivityExclusion | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  // Navigation handlers
  const goToToday = useCallback(() => setCurrentDate(new Date()), [setCurrentDate]);

  const navigateDate = useCallback((amount: number, unit: ViewMode) => {
    if (unit === 'month') setCurrentDate(addMonths(currentDate, amount));
    if (unit === 'week') setCurrentDate(addWeeks(currentDate, amount));
    if (unit === 'day') setCurrentDate(addDays(currentDate, amount));
  }, [currentDate, setCurrentDate]);

  // Activity interaction handlers
  const handleActivityClick = useCallback((activity: ScheduledPatientActivity | ScheduledCentreActivity) => {
    setSelectedActivityForDetails(activity);
    setIsActivityDetailsModalOpen(true);
  }, []);

  const handleAddActivity = useCallback(() => {
    setActivityToEdit(null);
    setIsAddEditActivityModalOpen(true);
  }, []);

  const handleEditActivity = useCallback((activity: ScheduledPatientActivity | ScheduledCentreActivity) => {
    setActivityToEdit(activity);
    setIsAddEditActivityModalOpen(true);
  }, []);

  const handleDeleteActivity = useCallback((activityId: string) => {
    const openConfirmation = (message: string, action: () => void) => {
      setConfirmMessage(message);
      setConfirmAction(() => action);
      setIsConfirmModalOpen(true);
    };

    openConfirmation("Are you sure you want to delete this scheduled activity?", async () => {
      await deleteCentreActivity(activityId);
      setScheduledActivities(scheduledActivities.filter(activity => activity.id !== activityId));
      setSelectedActivityForDetails(null);
      setIsActivityDetailsModalOpen(false);
      toast("Activity Deleted", { description: "The scheduled activity has been removed." });
    });
  }, [setScheduledActivities, scheduledActivities]);

  const handleSaveActivity = useCallback(async (activity: ScheduledPatientActivity | ScheduledCentreActivity) => {
    if (activity.id) {
      // Edit existing
      const updatedActivity = await updateCentreActivity(activity as ScheduledCentreActivity);
      // Update the specific activity in the array
      setScheduledActivities(scheduledActivities.map(a => a.id === updatedActivity.id ? updatedActivity : a));
      toast("Activity Updated", { description: "The scheduled activity has been updated." });
    } else {
      // Add new
      const newActivity = await addCentreActivity(activity as ScheduledCentreActivity);
      setScheduledActivities([...scheduledActivities, newActivity]);
      toast("Activity Added", { description: "A new activity has been scheduled." });
    }
    setIsAddEditActivityModalOpen(false);
  }, [scheduledActivities, setScheduledActivities]);

  const handleCreateExclusionFromActivity = useCallback((activity: ScheduledPatientActivity | ScheduledCentreActivity) => {
    // Only create exclusions for patient activities
    if ('patientId' in activity) {
      setExclusionToManage({
        id: '',
        activityTemplateId: activity.activityTemplateId,
        patientId: activity.patientId,
        startDate: activity.date,
        endDate: activity.date,
        reason: '',
      });
      setIsExclusionManagementModalOpen(true);
      setIsActivityDetailsModalOpen(false);
    }
  }, []);

  // Exclusion Management Handlers
  const handleSaveExclusion = useCallback(async (exclusion: ActivityExclusion) => {
    if (exclusion.id) {
      // Update existing exclusion
      await updateActivityExclusion(exclusion);
      setActivityExclusions(activityExclusions.map(e => e.id === exclusion.id ? exclusion : e));
      toast("Exclusion Updated", { description: "The exclusion has been updated." });
    } else {
      // Add new exclusion
      const newExclusion = await addActivityExclusion(exclusion);
      setActivityExclusions([...activityExclusions, newExclusion]);
      toast("Exclusion Added", { description: "A new exclusion has been added." });
    }
    setIsExclusionManagementModalOpen(false);
  }, [activityExclusions, setActivityExclusions]);

  const handleDeleteExclusion = useCallback((exclusionId: string) => {
    const openConfirmation = (message: string, action: () => void) => {
      setConfirmMessage(message);
      setConfirmAction(() => action);
      setIsConfirmModalOpen(true);
    };

    openConfirmation("Are you sure you want to delete this exclusion?", async () => {
      await deleteActivityExclusion(exclusionId);
      setActivityExclusions(activityExclusions.filter(e => e.id !== exclusionId));
      setIsExclusionManagementModalOpen(false);
      toast("Exclusion Deleted", { description: "The exclusion has been removed." });
    });
  }, [activityExclusions, setActivityExclusions]);

  const handleEditExclusion = useCallback((exclusion: ActivityExclusion) => {
    setExclusionToManage(exclusion);
    setIsExclusionManagementModalOpen(true);
  }, []);

  const handleManageExclusions = useCallback(() => {
    setExclusionToManage(null);
    setIsExclusionManagementModalOpen(true);
  }, []);

  return {
    // Modal states
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

    // Handlers
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
  };
};
