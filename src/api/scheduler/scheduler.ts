// Scheduler Service API functions
const SCHEDULER_BASE_URL = import.meta.env.VITE_SCHEDULER_SERVICE_URL;

export interface SchedulerResponse<T> {
  Status: string;
  Message: string;
  Data: T;
}

export interface WeeklyScheduleData {
  PatientID: number;
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

// Generate a new schedule
export const generateSchedule = async (): Promise<SchedulerResponse<string>> => {
  try {
    const response = await fetch(`${SCHEDULER_BASE_URL}schedule/generate/`, {
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
    const response = await fetch(`${SCHEDULER_BASE_URL}schedule/getSchedule/`, {
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

// Helper function to convert schedule data to calendar format
export const convertScheduleToCalendarFormat = (scheduleData: WeeklyScheduleData[]) => {
  const calendarSchedule: Array<{
    id: string;
    patientId: number;
    activityName: string;
    day: string;
    startTime: string;
    endTime: string;
    date: string;
    startDate: string;
    endDate: string;
  }> = [];
  
  // Time slots from 9 AM to 4 PM (8 hours = 8 slots to match API)
  const timeSlots = Array.from({ length: 8 }, (_, i) => {
    const hour = 9 + i;
    return `${hour.toString().padStart(2, '0')}:00`;
  });
  
  for (const patientSchedule of scheduleData) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    for (const day of days) {
      const daySchedule = patientSchedule[day as keyof WeeklyScheduleData] as string;
      const activities = parseScheduleString(daySchedule);
      
      // Create calendar events for each activity
      activities.forEach((activity, index) => {
        if (activity && index < timeSlots.length) {
          const startTime = timeSlots[index];
          const endTime = index + 1 < timeSlots.length ? timeSlots[index + 1] : '17:00'; // Last slot ends at 5 PM
          const eventDate = getDateForDayOfWeek(day, patientSchedule.StartDate);
          
          const calendarEvent = {
            id: `${patientSchedule.PatientID}-${day}-${index}`,
            patientId: patientSchedule.PatientID,
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
  console.log(`Date calculation: ${dayName} from StartDate ${startDateStr} (day ${startDayOfWeek}) -> ${result} (offset: ${offset})`);
  
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
