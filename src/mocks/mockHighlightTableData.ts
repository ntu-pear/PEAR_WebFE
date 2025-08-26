export const mockCaregiverNameList = [
  { id: 1, name: "Mary Tan", nric: "S1234567A", profilePicture: "" },
  { id: 2, name: "Ahmad Rahman", nric: "S2345678B", profilePicture: "" },
  { id: 3, name: "Sarah Ong", nric: "S3456789C", profilePicture: "" },
  { id: 4, name: "Ravi Nair", nric: "S4567890D", profilePicture: "" },
  { id: 5, name: "Emily Wong", nric: "S5678901E", profilePicture: "" },
  { id: 6, name: "Mohamed Hassan", nric: "S6789012F", profilePicture: "" },
];

export const mockHighlightDetails = {
  Prescription: {
    prescriptionListDesc: "Amoxicillin",
    dosage: "500mg",
    frequencyPerDay: 3,
    instruction: "Take with water",
    afterMeal: true,
    isChronic: false,
    startDate: "2025-08-01T00:00:00",
    endDate: "2025-08-10T00:00:00",
    prescriptionRemarks: "Complete full course",
  },
  Allergy: {
    allergyListDesc: "Peanuts",
    allergyReaction: "Anaphylaxis",
    allergyRemarks: "Carries epipen",
  },
  ActivityExclusion: {
    activityTitle: "Swimming",
    activityDesc: "Avoid strenuous swimming due to asthma",
    startDateTime: "2025-08-05T08:00:00",
    endDateTime: "2025-08-15T17:00:00",
    exclusionRemarks: "Reassess in 2 weeks",
  },
  Vital: {
    afterMeal: false,
    temperature: 37.8,
    systolicBP: 130,
    diastolicBP: 85,
    heartRate: 92,
    spO2: 96,
    bloodSugarlevel: 6.2,
    height: 1.72,
    weight: 68,
  },
  Problem: {
    problemLogListDesc: "Frequent headaches",
    problemLogRemarks: "Occurs mostly in the morning",
    authorName: "Dr. Tan Wei Ming",
  },
};
