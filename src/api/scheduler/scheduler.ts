import { mockActivityTemplates, mockScheduledCentreActivities } from "@/mocks/mockScheduledActivity";
import { API_TIME_SLOTS } from "@/components/Calendar/CalendarTypes";

const SCHEDULER_BASE_URL = import.meta.env.VITE_SCHEDULER_SERVICE_URL;
export interface Patient {
  id: string;
  name: string;
  isActive: boolean;
}

export interface ActivityTemplate {
  id: string;
  name: string;
  type: 'routine' | 'free_easy';
  isRarelyScheduled: boolean; // Backend-determined
}

export interface ScheduledCentreActivity {
  id: string;
  activityTemplateId: string;
  startTime: string; // 'HH:mm'
  endTime: string; // 'HH:mm'
  date: string; // 'YYYY-MM-DD'
  notes?: string;
}

export interface ScheduledPatientActivity {
  id: string;
  activityTemplateId: string;
  patientId: string;
  patientName: string;
  startTime: string; // 'HH:mm'
  endTime: string; // 'HH:mm'
  date: string; // 'YYYY-MM-DD'
  isOverridden: boolean; // Manually adjusted by supervisor
  isExcluded: boolean; // Overridden by an exclusion
  exclusionReason?: string;
  notes?: string;
}

export interface SchedulerResponse<T> {
  Status: string;
  Message: string;
  Data: T;
}

export interface WeeklyScheduleData {
  PatientID: number;
  Name: string;
  Monday: string;
  Tuesday: string;
  Wednesday: string;
  Thursday: string;
  Friday: string;
  Saturday: string;
  Sunday: string;
  StartDate: string;
  EndDate: string;
}

export interface GenerateScheduleResponse {
  Status: string;
  Message: string;
  Data: string;
}

// for centre activity schedule view
export const getActivityTemplates = async () => {
  return mockActivityTemplates;
};

// for centre activity schedule view
export const getCentreActivities = async () => {
  return mockScheduledCentreActivities;
};

// for centre activity schedule view
export const addCentreActivity = async (activity: ScheduledCentreActivity): Promise<ScheduledCentreActivity> => {
  // Simulate adding by pushing to the mock array
  const newActivity = { ...activity, id: String(mockScheduledCentreActivities.length + 1) };
  return newActivity;
};

// for centre activity schedule view
export const updateCentreActivity = async (activity: ScheduledCentreActivity): Promise<ScheduledCentreActivity> => {
  // Simulate update by returning the updated activity - don't modify the mock array directly
  return activity;
}

// for centre activity schedule view
export const deleteCentreActivity = async (activityId: string) => {
  // Simulate deletion by filtering out the activity
  const updatedActivities = mockScheduledCentreActivities.filter(activity => activity.id !== activityId);
  return updatedActivities;
}

// Generate a new schedule
export const generateSchedule = async (): Promise<SchedulerResponse<string>> => {
  try {
    const response = await fetch(`${SCHEDULER_BASE_URL}/schedule/generate/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating schedule:', error);
    throw error;
  }
};

// Get the generated schedule
export const getSchedule = async (): Promise<SchedulerResponse<WeeklyScheduleData[]>> => {
  try {
    const response = await fetch(`${SCHEDULER_BASE_URL}/schedule/getSchedule/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting schedule:', error);
    throw error;
  }
};

// Helper function to parse schedule string into time slots
export const parseScheduleString = (scheduleString: string): string[] => {
  if (!scheduleString || scheduleString.trim() === '') {
    return [];
  }

  return scheduleString.split('--').map(activity => activity.trim()).filter(activity => activity.length > 0);
};

// Helper function to convert hour number to time string (e.g., 9 -> "09:00")
const hourToTimeString = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

// Helper function to convert schedule data to calendar format
export const convertScheduleToCalendarFormat = (scheduleData: WeeklyScheduleData[]) => {
  const calendarSchedule: Array<{
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
  }> = [];

  // Use the API time slots constant
  const timeSlots = API_TIME_SLOTS;

  for (const patientSchedule of scheduleData) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (const day of days) {
      const daySchedule = patientSchedule[day as keyof WeeklyScheduleData] as string;
      const activities = parseScheduleString(daySchedule);

      // Create calendar events for each activity
      activities.forEach((activity, index) => {
        if (activity && index < timeSlots.length - 1) { // -1 because last element is end hour, not a slot start
          const startHour = timeSlots[index];
          const endHour = timeSlots[index + 1];
          const startTime = hourToTimeString(startHour);
          const endTime = hourToTimeString(endHour);
          const eventDate = getDateForDayOfWeek(day, patientSchedule.StartDate);

          const calendarEvent = {
            id: `${patientSchedule.PatientID}-${day}-${index}`,
            patientId: patientSchedule.PatientID,
            patientName: patientSchedule.Name,
            activityName: activity,
            day: day,
            startTime: startTime,
            endTime: endTime,
            date: eventDate,
            startDate: patientSchedule.StartDate,
            endDate: patientSchedule.EndDate,
          };

          calendarSchedule.push(calendarEvent);
        }
      });
    }
  }

  return calendarSchedule;
};

// Helper function to get actual date for day of week based on the API's StartDate
const getDateForDayOfWeek = (dayName: string, startDateStr: string): string => {
  const startDate = new Date(startDateStr);

  // Determine what day of the week the StartDate is
  const startDayOfWeek = startDate.getDay();

  // Map day names to day numbers
  const dayMapping = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
  };

  const targetDay = dayMapping[dayName as keyof typeof dayMapping];

  // Calculate offset from the start date
  // If StartDate is Monday (1) and we want Tuesday (2), offset = 1
  // If StartDate is Monday (1) and we want Sunday (0), offset = 6 (next Sunday)
  let offset = targetDay - startDayOfWeek + 1;
  if (offset < 0) {
    offset += 7; // Handle wrap-around for previous days in the week
  }

  // Add the offset to get the target date
  const targetDate = new Date(startDate);
  targetDate.setDate(startDate.getDate() + offset);

  const result = targetDate.toISOString().split('T')[0];
  // console.log(`Date calculation: ${dayName} from StartDate ${startDateStr} (day ${startDayOfWeek}) -> ${result} (offset: ${offset})`);

  // Return in YYYY-MM-DD format for calendar compatibility
  return result;
};

// Combined function to generate and get schedule
export const generateAndGetSchedule = async () => {
  try {
    // First generate the schedule
    const generateResponse = await generateSchedule();

    if (generateResponse.Status !== "200") {
      throw new Error(`Failed to generate schedule: ${generateResponse.Message}`);
    }

    // Then get the generated schedule
    const scheduleResponse = await getSchedule();

    if (scheduleResponse.Status !== "200") {
      throw new Error(`Failed to get schedule: ${scheduleResponse.Message}`);
    }

    // Convert to calendar format
    const calendarSchedule = convertScheduleToCalendarFormat(scheduleResponse.Data);

    return {
      success: true,
      data: calendarSchedule,
      rawData: scheduleResponse.Data,
      message: scheduleResponse.Message,
    };
  } catch (error) {
    console.error('Error in generateAndGetSchedule:', error);
    return {
      success: false,
      data: [],
      rawData: [],
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// System test related interfaces
export interface SystemTestResult {
  testName: string;
  testResult: string;
  testRemarks: string[];
}

export interface SystemStatistic {
  statsName: string;
  statsResult: string[];
}

export interface SystemWarning {
  warningName: string;
  warningRemarks: string[];
}

export interface SystemTestData {
  SystemTest: SystemTestResult[];
  Statistics: SystemStatistic[];
  Warnings: SystemWarning[];
}

// Get system test results
export const getSystemTest = async (): Promise<SchedulerResponse<SystemTestData>> => {
  try {
    const response = await fetch(`${SCHEDULER_BASE_URL}/schedule/systemTest/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = JSON.stringify(errorData, null, 2);
      } catch {
        errorDetails = await response.text();
      }
      throw new Error(`HTTP error! status: ${response.status}\n\nResponse details:\n${errorDetails}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting system test results:', error);
    throw error;
  }
};
