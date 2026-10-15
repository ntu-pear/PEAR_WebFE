import { useState, useCallback, useRef } from 'react';
import { generateAndGetSchedule, getSchedule, fetchPatientSchedule, convertScheduleToCalendarFormat, regenerateScheduleForSupervisor, type WeeklyScheduleData } from '@/api/scheduler/scheduler';
import { toast } from 'sonner';

export interface CalendarScheduleItem {
  id: string;
  patientId: number;
  patientName: string;
  activityName: string;
  day: string;
  startTime: string;
  endTime: string;
  date: string;
  startDate: string;
  endDate: string;
}

// Monday of the week as YYYY-MM-DD, same as the schedule's StartDate
export const weekStart = (date: Date): string => {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const useSchedulerService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState<CalendarScheduleItem[]>([]);
  const [rawScheduleData, setRawScheduleData] = useState<WeeklyScheduleData[]>([]);
  const [error, setError] = useState<string | null>(null);
  // other weeks already fetched, this week comes from getOrGenerateSchedule
  const loadedWeeks = useRef<Set<string>>(new Set());

  const generateSchedule = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the new supervisor regenerate endpoint that returns schedule directly
      const result = await regenerateScheduleForSupervisor();
      
      if (result.Status === "200" && result.Data) {
        // Convert to calendar format
        const calendarSchedule = convertScheduleToCalendarFormat(result.Data);
        loadedWeeks.current.clear();
        setScheduleData(calendarSchedule);
        setRawScheduleData(result.Data);
        toast.success('Schedule regenerated successfully.');
        return calendarSchedule;
      } else {
        setError(result.Message);
        toast.error(`Failed to regenerate schedule: ${result.Message}.`);
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Error regenerating schedule: ${errorMessage}.`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getOrGenerateSchedule = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First try to get existing schedule
      const scheduleResponse = await getSchedule();
      
      if (scheduleResponse.Status === "200" && scheduleResponse.Data && scheduleResponse.Data.length > 0) {
        // Schedule exists, convert and use it
        const calendarSchedule = convertScheduleToCalendarFormat(scheduleResponse.Data);
        loadedWeeks.current.clear();
        setScheduleData(calendarSchedule);
        setRawScheduleData(scheduleResponse.Data);
        toast.success('Existing schedule loaded successfully.');
        return calendarSchedule;
      } else {
        // No schedule exists, generate a new one
        const result = await generateAndGetSchedule();
        
        if (result.success) {
          loadedWeeks.current.clear();
          setScheduleData(result.data);
          setRawScheduleData(result.rawData);
          toast.success('New schedule generated successfully.');
          return result.data;
        } else {
          setError(result.message);
          toast.error(`Failed to generate schedule: ${result.message}.`);
          return [];
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Error loading/generating schedule: ${errorMessage}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load only the given patients' saved schedules, read only
  const loadPatientSchedules = useCallback(async (patientIds: number[], date?: string, onUnauthorized?: () => void) => {
    setIsLoading(true);
    setError(null);

    const rows: WeeklyScheduleData[] = [];
    const failures: number[] = [];

    try {
      await Promise.all(
        patientIds.map(async (patientId) => {
          try {
            const response = await fetchPatientSchedule(patientId, date);
            if (response.Status === "200" && Array.isArray(response.Data)) {
              rows.push(...response.Data);
            }
          } catch (error) {
            failures.push((error as { status?: number }).status ?? 0);
          }
        })
      );

      if (failures.includes(401)) {
        toast.error('Your session has expired. Please log in again.');
        onUnauthorized?.();
        return [];
      }

      const calendarSchedule = convertScheduleToCalendarFormat(rows);
      setScheduleData(calendarSchedule);
      setRawScheduleData(rows);

      if (failures.length > 0) {
        const reason = failures.includes(503)
          ? 'The scheduler could not check your access, please try again later.'
          : failures.includes(403)
            ? "You don't have access to one of these patients."
            : 'Please try again.';
        setError(reason);
        toast.error(`Could not load the schedule for ${failures.length} of ${patientIds.length} patients. ${reason}`);
      }

      return calendarSchedule;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Error loading schedule: ${errorMessage}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSchedule = useCallback(() => {
    loadedWeeks.current.clear();
    setScheduleData([]);
    setRawScheduleData([]);
    setError(null);
  }, []);

  // Adds another week's saved schedule, read only, never generates
  const loadWeek = useCallback(async (date: Date) => {
    const key = weekStart(date);
    if (key === weekStart(new Date()) || loadedWeeks.current.has(key)) return;
    loadedWeeks.current.add(key);

    try {
      const response = await getSchedule(key);
      // only rows for that week, an older scheduler ignores date and sends this week
      const rows = response.Status === "200" && Array.isArray(response.Data)
        ? response.Data.filter(row => String(row.StartDate).split('T')[0] === key)
        : [];
      if (rows.length === 0) return;

      setScheduleData(prev => [...prev, ...convertScheduleToCalendarFormat(rows)]);
      setRawScheduleData(prev => [...prev, ...rows]);
    } catch (error) {
      loadedWeeks.current.delete(key);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Error loading schedule for that week: ${errorMessage}`);
    }
  }, []);

  // Get schedule for a specific patient
  const getPatientSchedule = useCallback((patientId: number) => {
    return scheduleData.filter(item => item.patientId === patientId);
  }, [scheduleData]);

  // Get schedule for a specific date
  const getScheduleForDate = useCallback((date: string) => {
    // Convert input date to YYYY-MM-DD format for comparison
    const targetDate = new Date(date).toISOString().split('T')[0];
    return scheduleData.filter(item => {
      return item.date === targetDate;
    });
  }, [scheduleData]);

  // Get schedule for a specific patient and date
  const getPatientScheduleForDate = useCallback((patientId: number, date: string) => {
    // Convert input date to YYYY-MM-DD format for comparison
    const targetDate = new Date(date).toISOString().split('T')[0];
    return scheduleData.filter(item => {
      return item.patientId === patientId && item.date === targetDate;
    });
  }, [scheduleData]);

  // Get schedule for a specific time slot
  const getScheduleForTimeSlot = useCallback((date: string, timeSlot: string) => {
    // Convert input date to YYYY-MM-DD format for comparison
    const targetDate = new Date(date).toISOString().split('T')[0];
    return scheduleData.filter(item => {
      return item.date === targetDate && item.startTime === timeSlot;
    });
  }, [scheduleData]);

  return {
    // State
    isLoading,
    scheduleData,
    rawScheduleData,
    error,
    
    // Actions
    generateSchedule,
    getOrGenerateSchedule,
    loadPatientSchedules,
    clearSchedule,
    loadWeek,
    
    // Getters
    getPatientSchedule,
    getScheduleForDate,
    getPatientScheduleForDate,
    getScheduleForTimeSlot,
  };
};
