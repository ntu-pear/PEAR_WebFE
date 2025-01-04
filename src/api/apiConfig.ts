import axios from 'axios';

const VITE_PATIENT_SERVICE_URL: string = import.meta.env
  .VITE_PATIENT_SERVICE_URL;

const VITE_GEOCODE_SERVICE_URL: string = import.meta.env
  .VITE_GEOCODE_SERVICE_URL;

// console.log('Patient Service URL:' + VITE_PATIENT_SERVICE_URL);

export const patientsAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/patients`,
});

export const mobilityAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/Mobility`,
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

export const guardianAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/Guardian`,
});

export const geocodeAPI = axios.create({
  baseURL: `${VITE_GEOCODE_SERVICE_URL}/geocode`,
});
