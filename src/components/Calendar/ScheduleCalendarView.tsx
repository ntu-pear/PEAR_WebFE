import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks, getHours, getMinutes, setHours, setMinutes, parse, parseISO, set } from 'date-fns';
import { de, enUS } from 'date-fns/locale'; // Import locale for date-fns

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { ActivityExclusion, ActivityTemplate, addActivityExclusion, addScheduledActivity, deleteScheduledActivity, getActivityExclusions, getActivityTemplates, getPatients, getScheduledActivities, Patient, ScheduledActivity, updateActivityExclusion, updateScheduledActivity } from '@/api/activity/activity';

// Time slot definitions for Week/Day view (7 AM to 7 PM)
const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => `${7 + i}:00`);

// Main ActivityCalendarView component
const ScheduleCalendarView: React.FC = () => {
  const [patientsData, setPatientsData] = useState<Patient[]>([]);
  const [activityTemplates, setActivityTemplates] = useState<ActivityTemplate[]>([]);
  const [scheduledActivities, setScheduledActivities] = useState<ScheduledActivity[]>([]);
  const [activityExclusions, setActivityExclusions] = useState<ActivityExclusion[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals state
  const [isActivityDetailsModalOpen, setIsActivityDetailsModalOpen] = useState(false);
  const [selectedActivityForDetails, setSelectedActivityForDetails] = useState<ScheduledActivity | null>(null);

  const [isAddEditActivityModalOpen, setIsAddEditActivityModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<ScheduledActivity | null>(null);

  const [isExclusionManagementModalOpen, setIsExclusionManagementModalOpen] = useState(false);
  const [exclusionToManage, setExclusionToManage] = useState<ActivityExclusion | null>(null);

  // Confirmation Dialog state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  const getPatient = (id: string) => patientsData.find(p => p.id === id);
  const getActivityTemplate = (id: string) => activityTemplates.find(a => a.id === id);
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
  // Memoize to prevent unnecessary re-renders
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
  }, [selectedPatients, selectedActivities, searchTerm, scheduledActivities, activityExclusions]); // Depend on mock data arrays to re-run memoization

  // Add this new memoized calculation after the existing useMemo for filteredScheduledActivities
  const calendarDays = useMemo(() => {
    const startMonth = startOfMonth(currentDate);
    const endMonth = endOfMonth(currentDate);
    const startDate = startOfWeek(startMonth, { locale: enUS });
    const endDate = endOfWeek(endMonth, { locale: enUS });
    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  }, [currentDate]);

  // Date navigation handlers
  const goToToday = useCallback(() => setCurrentDate(new Date()), []);
  const navigateDate = useCallback((amount: number, unit: 'month' | 'week' | 'day') => {
    if (unit === 'month') setCurrentDate(addMonths(currentDate, amount));
    if (unit === 'week') setCurrentDate(addWeeks(currentDate, amount));
    if (unit === 'day') setCurrentDate(addDays(currentDate, amount));
  }, [currentDate, viewMode]);

  // Patient/Activity filter handlers
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

  // Activity interaction handlers
  const handleActivityClick = useCallback((activity: ScheduledActivity) => {
    setSelectedActivityForDetails(activity);
    setIsActivityDetailsModalOpen(true);
  }, []);

  const handleAddActivity = useCallback(() => {
    setActivityToEdit(null); // Clear any existing activity for editing
    setIsAddEditActivityModalOpen(true);
  }, []);

  const handleEditActivity = useCallback((activity: ScheduledActivity) => {
    setActivityToEdit(activity);
    setIsAddEditActivityModalOpen(true);
  }, []);

  const handleDeleteActivity = useCallback((activityId: string) => {
    openConfirmation("Are you sure you want to delete this scheduled activity?", async () => {
      const updatedActivity = await deleteScheduledActivity(activityId);
      setScheduledActivities(updatedActivity);
      setSelectedActivityForDetails(null);
      setIsActivityDetailsModalOpen(false);
      toast("Activity Deleted", { description: "The scheduled activity has been removed." });
    });
  }, []);

  const handleSaveActivity = useCallback(async (activity: ScheduledActivity) => {
    if (activity.id) {
      // Edit existing
      const updatedActivity = await updateScheduledActivity(activity);
      setScheduledActivities([...scheduledActivities, updatedActivity]);
      toast("Activity Updated", { description: "The scheduled activity has been updated." });
    } else {
      // Add new
      const newActivity = await addScheduledActivity(activity);
      setScheduledActivities([...scheduledActivities, newActivity]);
      toast("Activity Added", { description: "A new activity has been scheduled." });
    }
    setIsAddEditActivityModalOpen(false);
  }, []);

  const handleCreateExclusionFromActivity = useCallback((activity: ScheduledActivity) => {
    setExclusionToManage({
      id: '', // New exclusion
      activityTemplateId: activity.activityTemplateId,
      patientId: activity.patientId,
      startDate: activity.date,
      endDate: activity.date,
      reason: '',
    });
    setIsExclusionManagementModalOpen(true);
    setIsActivityDetailsModalOpen(false); // Close details modal
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
  }, []);

  const handleDeleteExclusion = useCallback((exclusionId: string) => {
    openConfirmation("Are you sure you want to delete this exclusion?", async () => {
      await deleteScheduledActivity(exclusionId);
      setActivityExclusions(activityExclusions.filter(e => e.id !== exclusionId));
      setIsExclusionManagementModalOpen(false);
      toast("Exclusion Deleted", { description: "The exclusion has been removed." });
    });
  }, []);

  // Generic Confirmation Dialog handler
  const openConfirmation = useCallback((message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action); // Use a function to set the action
    setIsConfirmModalOpen(true);
  }, []);

  // Helper to render activity blocks for Week/Day view
  const renderActivityBlock = useCallback((activity: ScheduledActivity) => {
    const activityTemplate = getActivityTemplate(activity.activityTemplateId);
    const patient = getPatient(activity.patientId);

    if (!activityTemplate || !patient) return null;

    const start = parse(activity.startTime, 'HH:mm', new Date());
    const end = parse(activity.endTime, 'HH:mm', new Date());

    const startHour = getHours(start);
    const startMinute = getMinutes(start);
    const endHour = getHours(end);
    const endMinute = getMinutes(end);

    // Calculate position and height assuming 60px per hour
    const top = ((startHour - 7) * 60 + startMinute); // Pixels from top (7:00 AM is 0px)
    const height = ((endHour - startHour) * 60 + (endMinute - startMinute));

    const bgColor = activityTemplate.type === 'free_easy' ? 'bg-blue-400' : 'bg-orange-400';
    const textColor = 'text-white';
    const borderColor = activity.isOverridden ? 'border-dashed border-2 border-purple-600' : '';
    const excludedClass = activity.isExcluded ? 'opacity-50 line-through' : '';
    const rarelyScheduledClass = activityTemplate.isRarelyScheduled ? 'border-2 border-red-500' : '';

    return (
      <div
        key={activity.id}
        className={`absolute w-full rounded-md p-2 text-xs cursor-pointer shadow-md ${bgColor} ${textColor} ${borderColor} ${excludedClass} ${rarelyScheduledClass}`}
        style={{ top: `${top}px`, height: `${height}px` }}
        onClick={() => handleActivityClick(activity)}
      >
        <div className="font-semibold">{activityTemplate.name}</div>
        <div>{patient.name}</div>
        <div>{activity.startTime} - {activity.endTime}</div>
        {activity.isExcluded && <div className="text-xs italic">Excluded: {activity.exclusionReason}</div>}
        {activity.isOverridden && <div className="text-xs italic">Overridden</div>}
        {activityTemplate.isRarelyScheduled && <div className="text-xs italic">Rarely Scheduled!</div>}
      </div>
    );
  }, [handleActivityClick]);

  // Generic Modal Component (replaces Shadcn Dialog)
  const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; description?: string; children: React.ReactNode; footer?: React.ReactNode }> = ({ isOpen, onClose, title, description, children, footer }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-xl font-semibold">{title}</h3>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-md">
              <span className="sr-only">Close</span>
              <span className="text-xl">&times;</span> {/* Simple X icon */}
            </Button>
          </div>
          {description && <p className="text-sm text-gray-500 px-4 pt-2">{description}</p>}
          <div className="p-4">
            {children}
          </div>
          {footer && <div className="flex justify-end p-4 border-t">{footer}</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 font-sans antialiased">
      {/* Header Bar */}
      <header className="flex items-center justify-between p-4 bg-white shadow-sm border-b">
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={goToToday} className="rounded-md">Today</Button>
          <Button variant="ghost" size="icon" onClick={() => navigateDate(-1, viewMode)} className="rounded-md">&lt;</Button>
          <Button variant="ghost" size="icon" onClick={() => navigateDate(1, viewMode)} className="rounded-md">&gt;</Button>
          <h2 className="text-xl font-semibold">
            {viewMode === 'month' && format(currentDate, 'MMMM yyyy')}
            {viewMode === 'week' && `${format(startOfWeek(currentDate, { locale: enUS }), 'MMM dd')} - ${format(endOfWeek(currentDate, { locale: enUS }), 'MMM dd, yyyy')}`}
            {viewMode === 'day' && format(currentDate, 'EEEE, MMMM dd, yyyy')}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">🔍</span> {/* Simple search icon */}
            <Input
              placeholder="Search activities, patients..."
              className="pl-8 w-64 rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={viewMode} onValueChange={(value: 'month' | 'week' | 'day') => setViewMode(value)}>
            <SelectTrigger className="w-[120px] rounded-md">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" className="rounded-md">📅</Button> {/* CalendarDays icon */}
          <Button variant="ghost" size="icon" className="rounded-md">🖨️</Button> {/* Printer icon */}
          <Button variant="ghost" size="icon" className="rounded-md">⚙️</Button> {/* Settings icon */}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 p-4 bg-white border-r overflow-y-auto"> {/* Replaced ScrollArea */}
          <div className="h-full pr-4"> {/* Replaced ScrollArea content div */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center">👥 Patients</h3> {/* Users icon */}
              <div className="space-y-2">
                {patientsData.map(patient => (
                  <div key={patient.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`patient-${patient.id}`}
                      checked={selectedPatients.includes(patient.id)}
                      onChange={(e) => handlePatientToggle(patient.id, e.target.checked)}
                      disabled={!patient.isActive}
                      className="rounded text-blue-600 focus:ring-blue-500" // Tailwind for checkbox
                    />
                    <Label htmlFor={`patient-${patient.id}`} className={`cursor-pointer ${!patient.isActive ? 'text-gray-400' : ''}`}>
                      {patient.name} {patient.isActive ? '' : '(Inactive)'}
                    </Label>
                  </div>
                ))}
              </div>
              <Button variant="link" className="mt-2 p-0 h-auto text-sm" onClick={() => console.log('Navigate to Manage Patients')}>Manage Patients</Button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center">🏃 Activities</h3> {/* Activity icon */}
              <div className="space-y-2">
                {activityTemplates.map(activity => (
                  <div key={activity.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`activity-${activity.id}`}
                      checked={selectedActivities.includes(activity.id)}
                      onChange={(e) => handleActivityToggle(activity.id, e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500" // Tailwind for checkbox
                    />
                    <Label htmlFor={`activity-${activity.id}`} className="cursor-pointer">
                      {activity.name} {activity.isRarelyScheduled && <span className="text-red-500 text-xs font-medium">(Rare)</span>}
                    </Label>
                  </div>
                ))}
              </div>
              <Button variant="link" className="mt-2 p-0 h-auto text-sm" onClick={() => console.log('Navigate to Manage Activities')}>Manage Activities</Button>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center">🚫 Exclusions</h3> {/* X icon */}
              <ul className="text-sm text-gray-600 space-y-1">
                {activityExclusions.length > 0 ? (
                  activityExclusions.map(exclusion => {
                    const patient = getPatient(exclusion.patientId);
                    const activity = getActivityTemplate(exclusion.activityTemplateId);
                    return (
                      <li key={exclusion.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md border border-gray-200">
                        <span>
                          <span className="font-medium">{patient?.name}</span> - {activity?.name}
                          <br />
                          <span className="text-xs">{format(parseISO(exclusion.startDate), 'MMM dd')} - {format(parseISO(exclusion.endDate), 'MMM dd')}</span>
                          {exclusion.reason && <span className="text-xs italic block mt-0.5">Reason: {exclusion.reason}</span>}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">⋮</Button> {/* EllipsisVertical icon */}
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setExclusionToManage(exclusion); setIsExclusionManagementModalOpen(true); }}>
                              ✏️ Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteExclusion(exclusion.id)}>
                              🗑️ Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </li>
                    );
                  })
                ) : (
                  <p className="text-gray-500 italic">No active exclusions.</p>
                )}
              </ul>
              <Button variant="link" className="mt-2 p-0 h-auto text-sm" onClick={() => { setExclusionToManage(null); setIsExclusionManagementModalOpen(true); }}>Manage Exclusions</Button>
            </div>
          </div>
        </aside>

        {/* Main Calendar Content */}
        <main className="flex-1 p-4 bg-gray-100 overflow-auto relative">
          <Button
            className="fixed bottom-4 right-4 z-20 rounded-full h-14 w-14 text-lg shadow-xl bg-blue-600 hover:bg-blue-700 transition-colors"
            onClick={handleAddActivity}
          >
            +
          </Button>

          {viewMode === 'month' && (
            <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden min-h-[600px]">
              {/* Days of the week header */}
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium bg-white border-b border-gray-200">
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {calendarDays.map((dayDate, index) => {
                const dayActivities = filteredScheduledActivities.filter(activity =>
                  isSameDay(parseISO(activity.date), dayDate)
                );
                const isCurrentMonth = isSameMonth(dayDate, currentDate);
                const isToday = isSameDay(dayDate, new Date());

                return (
                  <div
                    key={index}
                    className={`relative p-2 h-32 border-r border-b border-gray-200 ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'} ${isToday ? 'border-2 border-blue-500' : ''}`}
                  >
                    <div className={`text-sm font-semibold ${isToday ? 'text-blue-600' : ''}`}>
                      {format(dayDate, 'd')}
                    </div>
                    <div className="flex flex-col space-y-1 mt-1 overflow-hidden h-[calc(100%-24px)]">
                      {dayActivities.slice(0, 2).map(activity => {
                        const activityTemplate = getActivityTemplate(activity.activityTemplateId);
                        const patient = getPatient(activity.patientId);
                        if (!activityTemplate || !patient) return null;

                        const bgColor = activityTemplate.type === 'free_easy' ? 'bg-blue-300' : 'bg-orange-300';
                        const rarelyScheduledClass = activityTemplate.isRarelyScheduled ? 'border border-red-500' : '';
                        const excludedClass = activity.isExcluded ? 'opacity-50 line-through' : '';

                        return (
                          <div
                            key={activity.id}
                            className={`rounded-sm px-1 py-0.5 text-xs truncate cursor-pointer ${bgColor} ${rarelyScheduledClass} ${excludedClass}`}
                            onClick={() => handleActivityClick(activity)}
                            title={`${activityTemplate.name} (${patient.name})`}
                          >
                            {activityTemplate.name} ({patient.name.split(' ')[0]})
                          </div>
                        );
                      })}
                      {dayActivities.length > 2 && (
                        <div
                          className="text-xs text-blue-600 cursor-pointer mt-1"
                          onClick={() => {
                            setCurrentDate(dayDate);
                            setViewMode('day');
                          }}
                        >
                          +{dayActivities.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {viewMode === 'week' && (
            <div className="grid grid-cols-8 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden min-h-[600px]">
              {/* Time header */}
              <div className="p-2 text-center text-sm font-medium bg-white border-b border-gray-200">Time</div>
              {/* Days of the week header */}
              {Array.from({ length: 7 }).map((_, i) => {
                const dayDate = addDays(startOfWeek(currentDate, { locale: enUS }), i);
                const isToday = isSameDay(dayDate, new Date());
                return (
                  <div key={i} className={`p-2 text-center text-sm font-medium bg-white border-b border-gray-200 ${isToday ? 'text-blue-600' : ''}`}>
                    {format(dayDate, 'EEE d')}
                  </div>
                );
              })}

              {/* Time slots and activities */}
              {TIME_SLOTS.map((time, timeIndex) => (
                <React.Fragment key={time}>
                  <div className="p-2 text-right text-xs bg-white border-r border-gray-200 h-[60px] flex items-center justify-end">
                    {time}
                  </div>
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const dayDate = addDays(startOfWeek(currentDate, { locale: enUS }), dayIndex);
                    const activitiesForThisDay = filteredScheduledActivities.filter(activity =>
                      isSameDay(parseISO(activity.date), dayDate)
                    );

                    return (
                      <div
                        key={`${time}-${dayIndex}`}
                        className="relative bg-white border-r border-b border-gray-200 h-[60px]"
                        // Conceptual: Drag-and-drop target for adding/moving activities
                        // onClick={() => handleAddActivity(dayDate, time)} // Click empty slot to add
                      >
                        {activitiesForThisDay.map(activity => {
                          const activityStartHour = getHours(parse(activity.startTime, 'HH:mm', dayDate));
                          // Only render the activity block if its start time matches the current slot's hour
                          if (activityStartHour === parseInt(time.split(':')[0])) {
                            return renderActivityBlock(activity);
                          }
                          return null;
                        })}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          )}

          {viewMode === 'day' && (
            <div className="grid grid-cols-2 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden min-h-[600px]">
              {/* Time header */}
              <div className="p-2 text-center text-sm font-medium bg-white border-b border-gray-200">Time</div>
              {/* Day header */}
              <div className="p-2 text-center text-sm font-medium bg-white border-b border-gray-200">
                {format(currentDate, 'EEEE, MMM dd')}
              </div>

              {/* Time slots and activities */}
              {TIME_SLOTS.map((time, timeIndex) => (
                <React.Fragment key={time}>
                  <div className="p-2 text-right text-xs bg-white border-r border-gray-200 h-[60px] flex items-center justify-end">
                    {time}
                  </div>
                  <div
                    className="relative bg-white border-b border-gray-200 h-[60px]"
                    // Conceptual: Drag-and-drop target for adding/moving activities
                    // onClick={() => handleAddActivity(currentDate, time)} // Click empty slot to add
                  >
                    {filteredScheduledActivities
                      .filter(activity => {
                        const activityStartHour = getHours(parse(activity.startTime, 'HH:mm', currentDate));
                        return isSameDay(parseISO(activity.date), currentDate) &&
                               activityStartHour === parseInt(time.split(':')[0]); // Only render in its starting slot
                      })
                      .map(renderActivityBlock)}
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Activity Details Modal */}
      {selectedActivityForDetails && (
        <Modal
          isOpen={isActivityDetailsModalOpen}
          onClose={() => setIsActivityDetailsModalOpen(false)}
          title={getActivityTemplate(selectedActivityForDetails.activityTemplateId)?.name || 'Activity Details'}
          description="Details of the scheduled activity."
          footer={
            <div className="flex justify-between w-full">
              <Button variant="outline" onClick={() => handleCreateExclusionFromActivity(selectedActivityForDetails)} className="rounded-md">
                🚫 Create Exclusion
              </Button>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => handleEditActivity(selectedActivityForDetails)} className="rounded-md">
                  ✏️ Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDeleteActivity(selectedActivityForDetails.id)} className="rounded-md">
                  🗑️ Delete
                </Button>
              </div>
            </div>
          }
        >
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">👥</span> {/* Users icon */}
              <Label className="text-base">Patient:</Label>
              <span className="text-base font-medium">{getPatient(selectedActivityForDetails.patientId)?.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">📅</span> {/* CalendarIcon */}
              <Label className="text-base">Date:</Label>
              <span className="text-base font-medium">{format(parseISO(selectedActivityForDetails.date), 'PPP')}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">⏰</span> {/* Clock icon */}
              <Label className="text-base">Time:</Label>
              <span className="text-base font-medium">{selectedActivityForDetails.startTime} - {selectedActivityForDetails.endTime}</span>
            </div>
            {selectedActivityForDetails.isOverridden && (
              <div className="flex items-center space-x-2 text-purple-600">
                <span className="text-purple-600">ℹ️</span> {/* Info icon */}
                <Label className="text-base">Status:</Label>
                <span className="text-base font-medium">Supervisor Overridden</span>
              </div>
            )}
            {selectedActivityForDetails.isExcluded && (
              <div className="flex items-center space-x-2 text-red-600">
                <span className="text-red-600">🚫</span> {/* X icon */}
                <Label className="text-base">Status:</Label>
                <span className="text-base font-medium">Excluded</span>
              </div>
            )}
            {selectedActivityForDetails.exclusionReason && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="exclusionReason" className="text-right">Exclusion Reason:</Label>
                <span id="exclusionReason" className="col-span-3">{selectedActivityForDetails.exclusionReason}</span>
              </div>
            )}
            {selectedActivityForDetails.notes && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">Notes:</Label>
                <span id="notes" className="col-span-3">{selectedActivityForDetails.notes}</span>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Add/Edit Activity Modal */}
      <Modal
        isOpen={isAddEditActivityModalOpen}
        onClose={() => setIsAddEditActivityModalOpen(false)}
        title={activityToEdit ? 'Edit Scheduled Activity' : 'Add New Scheduled Activity'}
        description={activityToEdit ? 'Modify the details of this activity.' : 'Schedule a new activity for a patient.'}
      >
        <AddEditActivityForm
          activity={activityToEdit}
          onSave={handleSaveActivity}
          onCancel={() => setIsAddEditActivityModalOpen(false)}
          patients={patientsData}
          activityTemplates={activityTemplates}
        />
      </Modal>

      {/* Exclusion Management Modal */}
      <Modal
        isOpen={isExclusionManagementModalOpen}
        onClose={() => setIsExclusionManagementModalOpen(false)}
        title={exclusionToManage?.id ? 'Edit Exclusion' : 'Create New Exclusion'}
        description="Manage periods when a patient is excluded from a specific activity."
      >
        <ExclusionForm
          exclusion={exclusionToManage}
          onSave={handleSaveExclusion}
          onCancel={() => setIsExclusionManagementModalOpen(false)}
          patients={patientsData}
          activityTemplates={activityTemplates}
        />
      </Modal>

      {/* Confirmation Dialog */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="⚠️ Confirm Action" // AlertTriangle icon
        description={confirmMessage}
        children={
          <div className="flex justify-end space-x-2 w-full">
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)} className="rounded-md">Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirmAction) {
                  confirmAction();
                }
                setIsConfirmModalOpen(false);
              }}
              className="rounded-md"
            >
              Confirm
            </Button>
          </div>
        }
      />
    </div>
  );
};

// Helper component for Add/Edit Activity Form
interface AddEditActivityFormProps {
  activity: ScheduledActivity | null;
  onSave: (activity: ScheduledActivity) => void;
  onCancel: () => void;
  patients: Patient[];
  activityTemplates: ActivityTemplate[];
}

const AddEditActivityForm: React.FC<AddEditActivityFormProps> = ({ activity, onSave, onCancel, patients, activityTemplates }) => {
  const [patientId, setPatientId] = useState(activity?.patientId || '');
  const [activityTemplateId, setActivityTemplateId] = useState(activity?.activityTemplateId || '');
  const [date, setDate] = useState(activity?.date || ''); // Changed to string for input type="date"
  const [startTime, setStartTime] = useState(activity?.startTime || '09:00');
  const [endTime, setEndTime] = useState(activity?.endTime || '10:00');
  const [notes, setNotes] = useState(activity?.notes || '');
  const [isOverridden, setIsOverridden] = useState(activity?.isOverridden || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !activityTemplateId || !date || !startTime || !endTime) {
      toast("Validation Error", { description: "Please fill all required fields.", duration: 3000 });
      return;
    }

    const newActivity: ScheduledActivity = {
      id: activity?.id || '', // Use existing ID or placeholder for new
      patientId,
      activityTemplateId,
      date: date, // Already in 'YYYY-MM-DD' format from input
      startTime,
      endTime,
      notes,
      isOverridden,
      isExcluded: false, // Will be determined by backend/exclusion logic
    };
    onSave(newActivity);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="patient" className="text-right">Patient</Label>
        <Select value={patientId} onValueChange={setPatientId}>
          <SelectTrigger className="col-span-3 rounded-md">
            <SelectValue placeholder="Select patient" />
          </SelectTrigger>
          <SelectContent>
            {patients.filter(p => p.isActive).map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="activity" className="text-right">Activity</Label>
        <Select value={activityTemplateId} onValueChange={setActivityTemplateId}>
          <SelectTrigger className="col-span-3 rounded-md">
            <SelectValue placeholder="Select activity" />
          </SelectTrigger>
          <SelectContent>
            {activityTemplates.map(a => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="date" className="text-right">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="col-span-3 rounded-md"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="startTime" className="text-right">Start Time</Label>
        <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="col-span-3 rounded-md" />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="endTime" className="text-right">End Time</Label>
        <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="col-span-3 rounded-md" />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="notes" className="text-right">Notes</Label>
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="col-span-3 rounded-md" />
      </div>

      <div className="flex items-center space-x-2 col-span-4 justify-end">
        <input
          type="checkbox"
          id="isOverridden"
          checked={isOverridden}
          onChange={(e) => setIsOverridden(e.target.checked)}
          className="rounded text-blue-600 focus:ring-blue-500" // Tailwind for checkbox
        />
        <Label htmlFor="isOverridden" className="cursor-pointer">Supervisor Overridden</Label>
      </div>

      <div className="col-span-4 flex justify-end space-x-2"> {/* Replaced DialogFooter */}
        <Button variant="outline" onClick={onCancel} className="rounded-md">Cancel</Button>
        <Button type="submit" className="rounded-md">Save Activity</Button>
      </div>
    </form>
  );
};

// Helper component for Exclusion Form
interface ExclusionFormProps {
  exclusion: ActivityExclusion | null;
  onSave: (exclusion: ActivityExclusion) => void;
  onCancel: () => void;
  patients: Patient[];
  activityTemplates: ActivityTemplate[];
}

const ExclusionForm: React.FC<ExclusionFormProps> = ({ exclusion, onSave, onCancel, patients, activityTemplates }) => {
  const [patientId, setPatientId] = useState(exclusion?.patientId || '');
  const [activityTemplateId, setActivityTemplateId] = useState(exclusion?.activityTemplateId || '');
  const [startDate, setStartDate] = useState(exclusion?.startDate || ''); // Changed to string for input type="date"
  const [endDate, setEndDate] = useState(exclusion?.endDate || ''); // Changed to string for input type="date"
  const [reason, setReason] = useState(exclusion?.reason || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !activityTemplateId || !startDate || !endDate) {
      toast("Validation Error", { description: "Please fill all required fields.", duration: 3000 });
      return;
    }

    const newExclusion: ActivityExclusion = {
      id: exclusion?.id || '',
      patientId,
      activityTemplateId,
      startDate: startDate, // Already in 'YYYY-MM-DD' format from input
      endDate: endDate,   // Already in 'YYYY-MM-DD' format from input
      reason,
    };
    onSave(newExclusion);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="patient" className="text-right">Patient</Label>
        <Select value={patientId} onValueChange={setPatientId}>
          <SelectTrigger className="col-span-3 rounded-md">
            <SelectValue placeholder="Select patient" />
          </SelectTrigger>
          <SelectContent>
            {patients.filter(p => p.isActive).map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="activity" className="text-right">Activity</Label>
        <Select value={activityTemplateId} onValueChange={setActivityTemplateId}>
          <SelectTrigger className="col-span-3 rounded-md">
            <SelectValue placeholder="Select activity" />
          </SelectTrigger>
          <SelectContent>
            {activityTemplates.map(a => (
              <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="startDate" className="text-right">Start Date</Label>
        <Input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="col-span-3 rounded-md"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="endDate" className="text-right">End Date</Label>
        <Input
          id="endDate"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="col-span-3 rounded-md"
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="reason" className="text-right">Reason</Label>
        <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} className="col-span-3 rounded-md" />
      </div>

      <div className="col-span-4 flex justify-end space-x-2"> {/* Replaced DialogFooter */}
        <Button variant="outline" onClick={onCancel} className="rounded-md">Cancel</Button>
        <Button type="submit" className="rounded-md">Save Exclusion</Button>
      </div>
    </form>
  );
};

export default ScheduleCalendarView;
