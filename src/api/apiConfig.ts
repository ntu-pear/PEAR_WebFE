import axios from 'axios';

const VITE_PATIENT_SERVICE_URL: string = import.meta.env.VITE_PATIENT_SERVICE;

const VITE_GEOCODE_SERVICE_URL: string = import.meta.env
  .VITE_GEOCODE_SERVICE_URL;

// console.log('Patient Service URL:' + VITE_PATIENT_SERVICE_URL);

export const patientsAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/patients`,
});

export const geocodeAPI = axios.create({
  baseURL: `${VITE_GEOCODE_SERVICE_URL}/geocode`,
});
