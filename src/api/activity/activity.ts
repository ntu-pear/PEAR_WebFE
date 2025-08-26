import { mockActivityTemplates, mockPatients, mockScheduledCentreActivities, mockScheduledPatientActivities } from "@/mocks/mockScheduledActivity";

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
  startTime: string; // 'HH:mm'
  endTime: string; // 'HH:mm'
  date: string; // 'YYYY-MM-DD'
  isOverridden: boolean; // Manually adjusted by supervisor
  isExcluded: boolean; // Overridden by an exclusion
  exclusionReason?: string;
  notes?: string;
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
export const getCentreActivities = async () => {
  return mockScheduledCentreActivities;
};

// TODO change when actual API is implemented
export const getPatientActivities = async () => {
  return mockScheduledPatientActivities;
};

// TODO change when actual API is implemented
export const addCentreActivity = async (activity: ScheduledCentreActivity): Promise<ScheduledCentreActivity> => {
  // Simulate adding by pushing to the mock array
  const newActivity = { ...activity, id: String(mockScheduledCentreActivities.length + 1) };
  return newActivity;
};

// TODO change when actual API is implemented
export const updateCentreActivity = async (activity: ScheduledCentreActivity): Promise<ScheduledCentreActivity> => {
  // Simulate update by returning the updated activity - don't modify the mock array directly
  return activity;
}

// TODO change when actual API is implemented
export const deleteCentreActivity = async (activityId: string) => {
  // Simulate deletion by filtering out the activity
  const updatedActivities = mockScheduledCentreActivities.filter(activity => activity.id !== activityId);
  return updatedActivities;
}

