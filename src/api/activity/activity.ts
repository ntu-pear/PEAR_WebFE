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
export const getActivityExclusions = async () => {
  return mockExclusions;
};