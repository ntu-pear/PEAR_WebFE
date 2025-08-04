import { mockActivityTemplates, mockExclusions, mockPatients, mockScheduledActivities } from "@/mocks/mockScheduledActivity";

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

export interface ScheduledActivity {
  id: string;
  activityTemplateId: string;
  patientId: string;
  startTime: string; // 'HH:mm'
  endTime: string; // 'HH:mm'
  date: string; // 'YYYY-MM-DD'
  isOverridden: boolean; // Manually adjusted by supervisor
  isExcluded: boolean; // Overridden by an exclusion
  exclusionReason?: string;
  notes?: string;
}

export interface ActivityExclusion {
  id: string;
  activityTemplateId: string;
  patientId: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
  reason?: string;
}

// TODO change when actual API is implemented
export const getPatients = async () => {
  return mockPatients;
}

// TODO change when actual API is implemented
export const getActivityTemplates = async () => {
  return mockActivityTemplates;
};

// TODO change when actual API is implemented
export const getScheduledActivities = async () => {
  return mockScheduledActivities;
};

// TODO change when actual API is implemented
export const addScheduledActivity = async (activity: ScheduledActivity): Promise<ScheduledActivity> => {
  // Simulate adding by pushing to the mock array
  const newActivity = { ...activity, id: String(mockScheduledActivities.length + 1) };
  mockScheduledActivities.push(newActivity);
  return newActivity;
};

// TODO change when actual API is implemented
export const updateScheduledActivity = async (activity: ScheduledActivity): Promise<ScheduledActivity> => {
  // Simulate update by finding and replacing the activity
  const index = mockScheduledActivities.findIndex(a => a.id === activity.id);
  if (index !== -1) {
    mockScheduledActivities[index] = activity;
  }

  return activity;
}

// TODO change when actual API is implemented
export const deleteScheduledActivity = async (activityId: string) => {
  // Simulate deletion by filtering out the activity
  const updatedActivities = mockScheduledActivities.filter(activity => activity.id !== activityId);
  return updatedActivities;
}

// TODO change when actual API is implemented
export const getActivityExclusions = async () => {
  return mockExclusions;
};

// TODO change when actual API is implemented
export const addActivityExclusion = async (exclusion: ActivityExclusion): Promise<ActivityExclusion> => {
  // Simulate adding by pushing to the mock array
  const newExclusion = { ...exclusion, id: String(mockExclusions.length + 1) };
  mockExclusions.push(newExclusion);
  return newExclusion;
}

// TODO change when actual API is implemented
export const updateActivityExclusion = async (exclusion: ActivityExclusion): Promise<ActivityExclusion> => {
  // Simulate update by finding and replacing the exclusion
  const index = mockExclusions.findIndex(e => e.id === exclusion.id);
  if (index !== -1) {
    mockExclusions[index] = exclusion;
  }

  return exclusion;
} 

// TODO change when actual API is implemented
export const deleteActivityExclusion = async (exclusionId: string) => {
  // Simulate deletion by filtering out the exclusion
  const updatedExclusions = mockExclusions.filter(exclusion => exclusion.id !== exclusionId);
  return updatedExclusions;
}

