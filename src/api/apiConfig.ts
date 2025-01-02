import axios from 'axios';

const VITE_PATIENT_SERVICE_URL: string = import.meta.env
  .VITE_PATIENT_SERVICE_URL;

const VITE_GEOCODE_SERVICE_URL: string = import.meta.env
  .VITE_GEOCODE_SERVICE_URL;

// console.log('Patient Service URL:' + VITE_PATIENT_SERVICE_URL);

export const patientsAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/patients`,
});

export const socialHistoryAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/SocialHistory`,
});

export const vitalsAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/Vital`,
});

export const allergyAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_patient_allergy`,
});

export const guardianAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/Guardian`,
});

export const geocodeAPI = axios.create({
  baseURL: `${VITE_GEOCODE_SERVICE_URL}/geocode`,
});
