import { HighlightTableData } from "@/api/patients/highlight";

export const mockHighlightTableData: HighlightTableData[] = [
  {
    id: 1,
    patientId: 1,
    patientName: "Alice Lee",
    patientNric: "*****567A",
    patientProfilePicture:
      "https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Patient/Alice_Lee_Sxxxx567D/ProfilePicture/zsw7dyprsvn0bjmatofg.jpg",
    caregiverId: 1,
    caregiverName: "-",
    caregiverNric: "****",
    caregiverProfilePicture:
      "https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Patient/Alice_Lee_Sxxxx567D/ProfilePicture/zsw7dyprsvn0bjmatofg.jpg",
    highlights: [
      [
        { type: "newPrescription", id: "med001", value: "Paracetamol 500mg" },
        { type: "newPrescription", id: "med002", value: "Ibuprofen 200mg" },
      ],
      [{ type: "newActivityExclusion", id: "app001", value: "Dental Checkup" }],
    ],
  },
  {
    id: 2,
    patientId: 2,
    patientName: "John Tan",
    patientNric: "*****123B",
    patientProfilePicture:
      "https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Patient/John_Tan_Sxxxx123B/ProfilePicture/sample1.jpg",
    caregiverId: 2,
    caregiverName: "Mary Tan",
    caregiverNric: "*****987C",
    caregiverProfilePicture:
      "https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Caregiver/Mary_Tan_Sxxxx987C/ProfilePicture/sample2.jpg",
    highlights: [
      [
        { type: "newPrescription", id: "med003", value: "Aspirin 100mg" },
        { type: "newPrescription", id: "med004", value: "Amoxicillin 500mg" },
      ],
      [
        {
          type: "newActivityExclusion",
          id: "app002",
          value: "Eye Examination",
        },
        {
          type: "newActivityExclusion",
          id: "app003",
          value: "Physiotherapy Session",
        },
      ],
    ],
  },
  {
    id: 3,
    patientId: 3,
    patientName: "Siti Rahman",
    patientNric: "*****456D",
    patientProfilePicture:
      "https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Patient/Siti_Rahman_Sxxxx456D/ProfilePicture/sample3.jpg",
    caregiverId: 3,
    caregiverName: "Ahmad Rahman",
    caregiverNric: "*****654E",
    caregiverProfilePicture:
      "https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Caregiver/Ahmad_Rahman_Sxxxx654E/ProfilePicture/sample4.jpg",
    highlights: [
      [
        { type: "newPrescription", id: "med005", value: "Metformin 500mg" },
        { type: "newPrescription", id: "med006", value: "Lisinopril 10mg" },
      ],
      [
        {
          type: "newActivityExclusion",
          id: "app004",
          value: "Diabetes Consultation",
        },
        {
          type: "newActivityExclusion",
          id: "app005",
          value: "Cardiology Follow-up",
        },
      ],
    ],
  },
  {
    id: 4,
    patientId: 4,
    patientName: "Michael Ong",
    patientNric: "*****789F",
    patientProfilePicture:
      "https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Patient/Michael_Ong_Sxxxx789F/ProfilePicture/sample5.jpg",
    caregiverId: 4,
    caregiverName: "Sarah Ong",
    caregiverNric: "*****321G",
    caregiverProfilePicture:
      "https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Caregiver/Sarah_Ong_Sxxxx321G/ProfilePicture/sample6.jpg",
    highlights: [
      [
        { type: "newPrescription", id: "med007", value: "Losartan 50mg" },
        { type: "newPrescription", id: "med008", value: "Atorvastatin 20mg" },
      ],
      [
        {
          type: "newActivityExclusion",
          id: "app006",
          value: "Orthopedic Checkup",
        },
      ],
    ],
  },
  {
    id: 5,
    patientId: 5,
    patientName: "Priya Nair",
    patientNric: "*****012H",
    patientProfilePicture:
      "https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Patient/Priya_Nair_Sxxxx012H/ProfilePicture/sample7.jpg",
    caregiverId: 5,
    caregiverName: "Ravi Nair",
    caregiverNric: "*****345I",
    caregiverProfilePicture:
      "https://res.cloudinary.com/dbpearfyp/image/upload/v1640487405/Caregiver/Ravi_Nair_Sxxxx345I/ProfilePicture/sample8.jpg",
    highlights: [
      [
        { type: "newPrescription", id: "med009", value: "Levothyroxine 50mcg" },
        { type: "newPrescription", id: "med010", value: "Omeprazole 20mg" },
      ],
      [
        {
          type: "newActivityExclusion",
          id: "app007",
          value: "ENT Consultation",
        },
        {
          type: "newActivityExclusion",
          id: "app008",
          value: "General Checkup",
        },
      ],
    ],
  },
];

export const mockCaregiverNameList = [
  { id: 1, name: "Mary Tan" },
  { id: 2, name: "Ahmad Rahman" },
  { id: 3, name: "Sarah Ong" },
  { id: 4, name: "Ravi Nair" },
  { id: 5, name: "Emily Wong" },
  { id: 6, name: "Mohamed Hassan" },
];
