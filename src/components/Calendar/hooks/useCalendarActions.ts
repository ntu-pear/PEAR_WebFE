import { useState, useCallback } from 'react';
import { addMonths, addWeeks, addDays } from 'date-fns';
import { toast } from 'sonner';
import { 
  addCentreActivity, 
  deleteCentreActivity,
  updateCentreActivity, 
  ScheduledCentreActivity
} from '@/api/activity/activity';
import { ViewMode } from '../CalendarTypes';

export const useCalendarActions = (
  currentDate: Date,
  setCurrentDate: (date: Date) => void,
  scheduledActivities: ScheduledCentreActivity[],
  setScheduledActivities: (activities: ScheduledCentreActivity[]) => void
) => {
  // Modal states
  const [isActivityDetailsModalOpen, setIsActivityDetailsModalOpen] = useState(false);
  const [selectedActivityForDetails, setSelectedActivityForDetails] = useState<ScheduledCentreActivity | null>(null);
  const [isAddEditActivityModalOpen, setIsAddEditActivityModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<ScheduledCentreActivity | null>(null);
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
  const handleActivityClick = useCallback((activity: ScheduledCentreActivity) => {
    setSelectedActivityForDetails(activity);
    setIsActivityDetailsModalOpen(true);
  }, []);

  const handleAddActivity = useCallback(() => {
    setActivityToEdit(null);
    setIsAddEditActivityModalOpen(true);
  }, []);

  const handleEditActivity = useCallback((activity: ScheduledCentreActivity) => {
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

  const handleSaveActivity = useCallback(async (activity: ScheduledCentreActivity) => {
    if (activity.id) {
      // Edit existing
      const updatedActivity = await updateCentreActivity(activity);
      // Update the specific activity in the array
      setScheduledActivities(scheduledActivities.map(a => a.id === updatedActivity.id ? updatedActivity : a));
      toast("Activity Updated", { description: "The scheduled activity has been updated." });
    } else {
      // Add new
      const newActivity = await addCentreActivity(activity);
      setScheduledActivities([...scheduledActivities, newActivity]);
      toast("Activity Added", { description: "A new activity has been scheduled." });
    }
    setIsAddEditActivityModalOpen(false);
  }, [scheduledActivities, setScheduledActivities]);

  return {
    // Modal states
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

    // Handlers
    goToToday,
    navigateDate,
    handleActivityClick,
    handleAddActivity,
    handleEditActivity,
    handleDeleteActivity,
    handleSaveActivity,
  };
};
