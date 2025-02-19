import axios from 'axios';

const VITE_PATIENT_SERVICE_URL: string = import.meta.env
  .VITE_PATIENT_SERVICE_URL;

const VITE_GEOCODE_SERVICE_URL: string = import.meta.env
  .VITE_GEOCODE_SERVICE_URL;

// console.log('Patient Service URL:' + VITE_PATIENT_SERVICE_URL);

export const VITE_USER_SERVICE_URL: string = import.meta.env
  .VITE_USER_SERVICE_URL;

// patient
export const patientsAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/patients`,
});

export const dementiaList = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/PatientAssignedDementiaList`,
});

export const getPatientAssignedDementia = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_assigned_dementias`,
});

export const mobilityListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/Mobility/List`,
});

export const patientMobilityAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/MobilityMapping/List`,
});

export const doctorNoteAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/DoctorNote`,
});

export const socialHistoryAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/SocialHistory`,
});

export const vitalAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/Vital`,
});

export const patientAllergyAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_patient_allergy`,
});

export const allergyTypeAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_allergy_types`,
});

export const allergyReactionTypeAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_allergy_reaction_types`,
});

export const createPatientAllergyAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/create_patient_allergy`,
});

export const deletePatientAllergyAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/delete_patient_allergy`,
});

export const prescriptionAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/Prescription`,
});

export const patientPrescriptionAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/Prescription/PatientPrescription`,
});

export const guardianAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/Guardian`,
});

//geocode
export const geocodeAPI = axios.create({
  baseURL: `${VITE_GEOCODE_SERVICE_URL}/geocode`,
});

//user
export const loginAPI = axios.create({
  baseURL: `${VITE_USER_SERVICE_URL}/login`,
});

export const verifyOTP = axios.create({
  baseURL: `${VITE_USER_SERVICE_URL}/verify-otp`,
});

export const requestOTP = axios.create({
  baseURL: `${VITE_USER_SERVICE_URL}/request-otp`,
});

export const logoutAPI = axios.create({
  baseURL: `${VITE_USER_SERVICE_URL}/logout`,
});

export const refreshTokenAPI = axios.create({
  baseURL: `${VITE_USER_SERVICE_URL}/refresh`,
});

export const getCurrentUserAPI = axios.create({
  baseURL: `${VITE_USER_SERVICE_URL}/current_user`,
});

export const userAPI = axios.create({
  baseURL: `${VITE_USER_SERVICE_URL}/user`,
});

export const roleAPI = axios.create({
  baseURL: `${VITE_USER_SERVICE_URL}/roles`,
});

export const adminAPI = axios.create({
  baseURL: `${VITE_USER_SERVICE_URL}/admin`,
});
export const usersAPI = axios.create({
  baseURL: `${VITE_USER_SERVICE_URL}/users`,
});
