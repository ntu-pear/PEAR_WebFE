import { useState, useCallback } from 'react';
import { generateAndGetSchedule, type WeeklyScheduleData } from '@/api/scheduler/scheduler';
import { toast } from 'sonner';

export interface CalendarScheduleItem {
  id: string;
  patientId: number;
  activityName: string;
  day: string;
  startTime: string;
  endTime: string;
  date: string;
  startDate: string;
  endDate: string;
}

export const useSchedulerService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [scheduleData, setScheduleData] = useState<CalendarScheduleItem[]>([]);
  const [rawScheduleData, setRawScheduleData] = useState<WeeklyScheduleData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const generateSchedule = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generateAndGetSchedule();
      
      if (result.success) {
        setScheduleData(result.data);
        setRawScheduleData(result.rawData);
        toast.success('Schedule generated successfully!');
        return result.data;
      } else {
        setError(result.message);
        toast.error(`Failed to generate schedule: ${result.message}`);
        return [];
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(`Error generating schedule: ${errorMessage}`);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSchedule = useCallback(() => {
    setScheduleData([]);
    setRawScheduleData([]);
    setError(null);
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
    clearSchedule,
    
    // Getters
    getPatientSchedule,
    getScheduleForDate,
    getPatientScheduleForDate,
    getScheduleForTimeSlot,
  };
};
