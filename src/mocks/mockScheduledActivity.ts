import { ActivityExclusion, ActivityTemplate, Patient, ScheduledCentreActivity, ScheduledPatientActivity } from "@/api/activity/activity";

export const mockPatients: Patient[] = [
  { id: 'p1', name: 'John Doe', isActive: true },
  { id: 'p2', name: 'Jane Smith', isActive: true },
  { id: 'p3', name: 'Peter Jones', isActive: false },
];

export const mockActivityTemplates: ActivityTemplate[] = [
  { id: 'a1', name: 'Walking Exercise', type: 'routine', isRarelyScheduled: false },
  { id: 'a2', name: 'Arts & Crafts', type: 'routine', isRarelyScheduled: true }, // Example of rarely scheduled
  { id: 'a3', name: 'Lunch', type: 'routine', isRarelyScheduled: false },
  { id: 'a4', name: 'Story Time', type: 'routine', isRarelyScheduled: false },
  { id: 'a5', name: 'Music Therapy', type: 'routine', isRarelyScheduled: false },
  { id: 'a6', name: 'Free & Easy', type: 'free_easy', isRarelyScheduled: false },
];

export const mockScheduledCentreActivities: ScheduledCentreActivity[] = [
  { id: 's1', activityTemplateId: 'a1', date: '2025-07-28', startTime: '09:00', endTime: '10:00', notes:""},
  { id: 's2', activityTemplateId: 'a3', date: '2025-07-28', startTime: '12:00', endTime: '13:00', notes:""},
  { id: 's3', activityTemplateId: 'a2', date: '2025-07-28', startTime: '10:30', endTime: '11:30', notes:""},
  { id: 's4', activityTemplateId: 'a6', date: '2025-07-29', startTime: '14:00', endTime: '16:00', notes:""},
  { id: 's5', activityTemplateId: 'a4', date: '2025-07-29', startTime: '09:30', endTime: '10:30', notes:""},
  { id: 's6', activityTemplateId: 'a1', date: '2025-07-30', startTime: '09:00', endTime: '10:00', notes:""},
  { id: 's7', activityTemplateId: 'a3', date: '2025-07-30', startTime: '12:00', endTime: '13:00', notes:""},
  { id: 's8', activityTemplateId: 'a2', date: '2025-07-30', startTime: '10:30', endTime: '11:30', notes:""},
  { id: 's9', activityTemplateId: 'a5', date: '2025-08-01', startTime: '11:00', endTime: '12:00', notes:""},
  { id: 's1', activityTemplateId: 'a1', date: '2025-08-01', startTime: '09:00', endTime: '10:00', notes:""},
];

export const mockScheduledPatientActivities: ScheduledPatientActivity[] = [
  { id: 's1', activityTemplateId: 'a1', patientId: 'p1', date: '2025-07-28', startTime: '09:00', endTime: '10:00', isOverridden: false, isExcluded: false },
  { id: 's2', activityTemplateId: 'a3', patientId: 'p1', date: '2025-07-28', startTime: '12:00', endTime: '13:00', isOverridden: false, isExcluded: false },
  { id: 's3', activityTemplateId: 'a2', patientId: 'p2', date: '2025-07-28', startTime: '10:30', endTime: '11:30', isOverridden: false, isExcluded: false },
  { id: 's4', activityTemplateId: 'a6', patientId: 'p1', date: '2025-07-29', startTime: '14:00', endTime: '16:00', isOverridden: false, isExcluded: false },
  { id: 's5', activityTemplateId: 'a4', patientId: 'p2', date: '2025-07-29', startTime: '09:30', endTime: '10:30', isOverridden: false, isExcluded: false },
  { id: 's6', activityTemplateId: 'a1', patientId: 'p1', date: '2025-07-30', startTime: '09:00', endTime: '10:00', isOverridden: false, isExcluded: false },
  { id: 's7', activityTemplateId: 'a3', patientId: 'p1', date: '2025-07-30', startTime: '12:00', endTime: '13:00', isOverridden: false, isExcluded: false },
  { id: 's8', activityTemplateId: 'a2', patientId: 'p2', date: '2025-07-30', startTime: '10:30', endTime: '11:30', isOverridden: false, isExcluded: false },
  { id: 's9', activityTemplateId: 'a5', patientId: 'p1', date: '2025-08-01', startTime: '11:00', endTime: '12:00', isOverridden: true, notes: 'Supervisor adjusted time', isExcluded: false },
  { id: 's10', activityTemplateId: 'a1', patientId: 'p2', date: '2025-08-01', startTime: '09:00', endTime: '10:00', isOverridden: false, isExcluded: true, exclusionReason: 'Patient feeling unwell' }, // Example of excluded
];

export const mockExclusions: ActivityExclusion[] = [
  { id: 'e1', activityTemplateId: 'a1', patientId: 'p2', startDate: '2025-08-01', endDate: '2025-08-03', reason: 'Patient unwell' },
  { id: 'e2', activityTemplateId: 'a3', patientId: 'p1', startDate: '2025-08-05', endDate: '2025-08-05', reason: 'Doctor appointment' },
];
