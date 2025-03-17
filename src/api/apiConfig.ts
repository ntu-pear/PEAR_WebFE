import axios from "axios";

const VITE_PATIENT_SERVICE_URL: string = import.meta.env
  .VITE_PATIENT_SERVICE_URL;

const VITE_GEOCODE_SERVICE_URL: string = import.meta.env
  .VITE_GEOCODE_SERVICE_URL;

// console.log('Patient Service URL:' + VITE_PATIENT_SERVICE_URL);
const VITE_LOGGER_SERVICE_URL: string = import.meta.env.VITE_LOGGER_SERVICE_URL;

export const VITE_USER_SERVICE_URL: string = import.meta.env
  .VITE_USER_SERVICE_URL;

// patient
export const patientsAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/patients`,
});

export const dementiaListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/PatientAssignedDementiaList`,
});

export const getPatientAssignedDementiaAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_assigned_dementias`,
});

export const createPatientAssignedDementiaAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/create_assigned_dementia`,
});

export const deletePatientAssignedDementiaAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/delete_assigned_dementia`,
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

export const dietListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_diet_types`,
});

export const educationListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_education_types`,
});

export const liveWithListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_livewith_types`,
});

export const occupationListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_occupation_types`,
});

export const petListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_pet_types`,
});

export const religionListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_religion_types`,
});

export const vitalAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/Vital`,
});

export const LanguageListPAI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/PatientListLanguage/`,
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

export const updatePatientAllergyAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/update_patient_allergy`,
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

export const highlightsAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_all_highlights`,
});

export const highlightTypesAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_highlight_types`,
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

export const getDoctorNameAPI = (roleName: string) =>
  axios.create({
    baseURL: `${VITE_USER_SERVICE_URL}/${roleName}/get_doctors`,
  });

export const loggerAPI = axios.create({
  baseURL: `${VITE_LOGGER_SERVICE_URL}/Logs`,
});
