import { ActivityTemplate, ScheduledCentreActivity, ScheduledPatientActivity } from "@/api/scheduler/scheduler";

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
  { id: 's10', activityTemplateId: 'a1', date: '2025-08-01', startTime: '09:00', endTime: '10:00', notes:""},
  
  // Add current week activities for testing (August 18-24, 2025)
  { id: 'sc1', activityTemplateId: 'a1', date: '2025-08-18', startTime: '09:00', endTime: '10:00', notes:""},
  { id: 'sc2', activityTemplateId: 'a3', date: '2025-08-18', startTime: '12:00', endTime: '13:00', notes:""},
  { id: 'sc3', activityTemplateId: 'a2', date: '2025-08-18', startTime: '10:30', endTime: '11:30', notes:""},
  { id: 'sc4', activityTemplateId: 'a5', date: '2025-08-18', startTime: '14:00', endTime: '15:00', notes:""},
  { id: 'sc5', activityTemplateId: 'a6', date: '2025-08-19', startTime: '15:00', endTime: '17:00', notes:""},
  { id: 'sc6', activityTemplateId: 'a4', date: '2025-08-19', startTime: '09:30', endTime: '10:30', notes:""},
  { id: 'sc7', activityTemplateId: 'a1', date: '2025-08-20', startTime: '09:00', endTime: '10:00', notes:""},
  { id: 'sc8', activityTemplateId: 'a3', date: '2025-08-20', startTime: '12:00', endTime: '13:00', notes:""},
];

export const mockScheduledPatientActivities: ScheduledPatientActivity[] = [
  { id: 's1', activityTemplateId: 'a1', patientId: '1', date: '2025-07-28', startTime: '09:00', endTime: '10:00', isOverridden: false, isExcluded: false },
  { id: 's2', activityTemplateId: 'a3', patientId: '1', date: '2025-07-28', startTime: '12:00', endTime: '13:00', isOverridden: false, isExcluded: false },
  { id: 's3', activityTemplateId: 'a2', patientId: '2', date: '2025-07-28', startTime: '10:30', endTime: '11:30', isOverridden: false, isExcluded: false },
  { id: 's4', activityTemplateId: 'a6', patientId: '1', date: '2025-07-29', startTime: '14:00', endTime: '16:00', isOverridden: false, isExcluded: false },
  { id: 's5', activityTemplateId: 'a4', patientId: '2', date: '2025-07-29', startTime: '09:30', endTime: '10:30', isOverridden: false, isExcluded: false },
  { id: 's6', activityTemplateId: 'a1', patientId: '1', date: '2025-07-30', startTime: '09:00', endTime: '10:00', isOverridden: false, isExcluded: false },
  { id: 's7', activityTemplateId: 'a3', patientId: '1', date: '2025-07-30', startTime: '12:00', endTime: '13:00', isOverridden: false, isExcluded: false },
  { id: 's8', activityTemplateId: 'a2', patientId: '2', date: '2025-07-30', startTime: '10:30', endTime: '11:30', isOverridden: false, isExcluded: false },
  { id: 's9', activityTemplateId: 'a5', patientId: '1', date: '2025-08-01', startTime: '11:00', endTime: '12:00', isOverridden: true, notes: 'Supervisor adjusted time', isExcluded: false },
  { id: 's10', activityTemplateId: 'a1', patientId: '2', date: '2025-08-01', startTime: '09:00', endTime: '10:00', isOverridden: false, isExcluded: true, exclusionReason: 'Patient feeling unwell' }, // Example of excluded
  
  // Add current week activities for testing (August 18-24, 2025)
  { id: 's11', activityTemplateId: 'a1', patientId: '1', date: '2025-08-18', startTime: '09:00', endTime: '10:00', isOverridden: false, isExcluded: false },
  { id: 's12', activityTemplateId: 'a3', patientId: '1', date: '2025-08-18', startTime: '12:00', endTime: '13:00', isOverridden: false, isExcluded: false },
  { id: 's13', activityTemplateId: 'a2', patientId: '2', date: '2025-08-18', startTime: '10:30', endTime: '11:30', isOverridden: false, isExcluded: false },
  { id: 's14', activityTemplateId: 'a5', patientId: '2', date: '2025-08-18', startTime: '14:00', endTime: '15:00', isOverridden: false, isExcluded: false },
  { id: 's15', activityTemplateId: 'a6', patientId: '1', date: '2025-08-19', startTime: '15:00', endTime: '17:00', isOverridden: false, isExcluded: false },
  { id: 's16', activityTemplateId: 'a4', patientId: '2', date: '2025-08-19', startTime: '09:30', endTime: '10:30', isOverridden: false, isExcluded: false },
  { id: 's17', activityTemplateId: 'a1', patientId: '1', date: '2025-08-20', startTime: '09:00', endTime: '10:00', isOverridden: false, isExcluded: false },
  { id: 's18', activityTemplateId: 'a3', patientId: '2', date: '2025-08-20', startTime: '12:00', endTime: '13:00', isOverridden: false, isExcluded: false },
  { id: 's19', activityTemplateId: 'a2', patientId: '1', date: '2025-08-21', startTime: '10:30', endTime: '11:30', isOverridden: false, isExcluded: false },
  { id: 's20', activityTemplateId: 'a5', patientId: '2', date: '2025-08-21', startTime: '14:00', endTime: '15:00', isOverridden: false, isExcluded: false },
  
  // Add some activities that span multiple time slots for better testing
  { id: 's21', activityTemplateId: 'a6', patientId: '1', date: '2025-08-18', startTime: '16:30', endTime: '17:30', isOverridden: false, isExcluded: false }, // Within new time range
  { id: 's22', activityTemplateId: 'a4', patientId: '2', date: '2025-08-18', startTime: '09:15', endTime: '09:45', isOverridden: false, isExcluded: false }, // Within 9:00 slot
];
