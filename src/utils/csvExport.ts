import { CalendarScheduleItem } from '@/hooks/scheduler/useSchedulerService';
import { format, startOfWeek, endOfWeek } from 'date-fns';

export interface ExportScheduleItem {
  patientId: number;
  patientName: string;
  activityName: string;
  date: string;
  day: string;
  startTime: string;
  endTime: string;
  duration: string;
}

/**
 * Converts schedule data to CSV format and triggers download
 * @param headers - Array of CSV header strings
 * @param scheduleData - Array of schedule items to export
 * @param selectedActivities - Array of selected activity names to filter by
 * @param getPatientName - Function to get patient display name by ID
 * @param filename - Optional custom filename (without extension)
 */
export const exportScheduleToCSV = (
  headers: readonly string[],
  scheduleData: CalendarScheduleItem[],
  selectedActivities: string[],
  getPatientName: (patientId: number) => string,
  filename?: string
) => {
  // Filter schedule data by selected activities
  const filteredData = scheduleData.filter(item => 
    selectedActivities.includes(item.activityName)
  );

  if (filteredData.length === 0) {
    throw new Error('No activities selected for export');
  }

  // Transform data for CSV export
  const exportData: ExportScheduleItem[] = filteredData.map(item => {
    // Calculate duration
    const startTime = new Date(`2000-01-01T${item.startTime}:00`);
    const endTime = new Date(`2000-01-01T${item.endTime}:00`);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const duration = `${durationHours}h ${durationMinutes}m`;

    return {
      patientId: item.patientId,
      patientName: getPatientName(item.patientId), // Use the provided function to get actual patient name
      activityName: item.activityName,
      date: item.date,
      day: item.day,
      startTime: item.startTime,
      endTime: item.endTime,
      duration: duration,
    };
  });

  // Convert data to CSV rows
  const csvRows = [
    headers.join(','),
    ...exportData.map(item => [
      item.patientId,
      `"${item.patientName}"`, // Wrap in quotes to handle commas
      `"${item.activityName}"`,
      item.date,
      item.day,
      item.startTime,
      item.endTime,
      item.duration
    ].join(','))
  ];

  const csvContent = csvRows.join('\n');

  // Generate filename with week range
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const defaultFilename = `patient-schedule-${format(weekStart, 'yyyy-MM-dd')}-to-${format(weekEnd, 'yyyy-MM-dd')}`;
  const finalFilename = filename || defaultFilename;

  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${finalFilename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);

  return {
    recordsExported: exportData.length,
    filename: `${finalFilename}.csv`,
    weekRange: `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd, yyyy')}`
  };
};
