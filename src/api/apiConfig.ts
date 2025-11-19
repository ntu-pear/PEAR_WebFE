import axios from "axios";

export const VITE_ACTIVITY_SERVICE_URL: string = import.meta.env
  .VITE_ACTIVITY_SERVICE_URL;

export const VITE_PATIENT_SERVICE_URL: string = import.meta.env
  .VITE_PATIENT_SERVICE_URL;

const VITE_GEOCODE_SERVICE_URL: string = import.meta.env
  .VITE_GEOCODE_SERVICE_URL;

// console.log('Patient Service URL:' + VITE_PATIENT_SERVICE_URL);
const VITE_LOGGER_SERVICE_URL: string = import.meta.env.VITE_LOGGER_SERVICE_URL;

export const VITE_USER_SERVICE_URL: string = import.meta.env
  .VITE_USER_SERVICE_URL;

// activity service
export const activityAPI = axios.create({
  baseURL: `${VITE_ACTIVITY_SERVICE_URL}`,
});

export const activitiesAPI = axios.create({
  baseURL: `${VITE_ACTIVITY_SERVICE_URL}/activities`,
});

export const centreActivitiesAPI = axios.create({
  baseURL: `${VITE_ACTIVITY_SERVICE_URL}/centre_activities`,
});

export const centreActivityAvailabilitiesAPI = axios.create({
  baseURL: `${VITE_ACTIVITY_SERVICE_URL}/centre_activity_availabilities`,
});

export const careCentreAPI = axios.create({
  baseURL: `${VITE_ACTIVITY_SERVICE_URL}/care_centres`,
});

// patient
export const patientsAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/patients`,
});

export const patientGuardianAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/Guardian/GetPatientGuardianByGuardianId`
})

export const dementiaListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/PatientAssignedDementiaList`,
});

export const patientAssignedDementiaAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/PatientAssignedDementia`,
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

export const socialHistorySensitiveMappingAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/social_history_sensitive_mapping`,
});

export const dietListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_diet_types`,
});

export const createDietListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/create_diet_type`,
});

export const updateDietListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/update_diet_type`,
});

export const deleteDietListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/delete_diet_type`,
});

export const educationListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_education_types`,
});

export const createEducationListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/create_education_type`,
});

export const updateEducationListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/update_education_type`,
});

export const deleteEducationListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/delete_education_type`,
});

export const liveWithListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_livewith_types`,
});

export const createLiveWithListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/create_livewith_type`,
});

export const updateLiveWithListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/update_livewith_type`,
});

export const deleteLiveWithListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/delete_livewith_type`,
});

export const occupationListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_occupation_types`,
});

export const createOccupationListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/create_occupation_type`,
});

export const updateOccupationListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/update_occupation_type`,
});

export const deleteOccupationListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/delete_occupation_type`,
});

export const petListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_pet_types`,
});

export const createPetListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/create_pet_type`,
});

export const updatePetListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/update_pet_type`,
});

export const deletePetListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/delete_pet_type`,
});

export const religionListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_religion_types`,
});

export const createReligionListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/create_religion_type`,
});

export const updateReligionListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/update_religion_type`,
});

export const deleteReligionListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/delete_religion_type`,
});

export const vitalAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/Vital`,
});

export const LanguageListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/PatientListLanguage/`,
});

export const patientAllergyAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_patient_allergy`,
});

export const allergyTypeAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_allergy_types`,
});

export const createAllergyTypeAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/create_allergy_type`,
});

export const updateAllergyTypeAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/update_allergy_type`,
});

export const deleteAllergyTypeAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/delete_allergy_type`,
});

export const allergyReactionTypeAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/get_allergy_reaction_types`,
});

export const createAllergyReactionTypeAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/create_allergy_reaction_types`,
});

export const updateAllergyReactionTypeAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/update_allergy_reaction_type`,
});

export const deleteAllergyReactionTypeAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/delete_allergy_reaction_type`,
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

export const prescriptionListAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/PrescriptionList`,
});

export const medicationAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/Medication`,
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

export const createHighlightTypesAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/create_highlight_type`,
});

export const updateHighlightTypesAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/update_highlight_type`,
});

export const deleteHighlightTypesAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/delete_highlight_type`,
});

export const getPatientPrivacyLevelAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/privacy_level_patient`,
});

export const writePatientPrivacyLevelAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/privacy_levels`,
});

export const listsAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/List`,
});

export const listTypesAPI = axios.create({
  baseURL: `${VITE_PATIENT_SERVICE_URL}/GetAllListTypes`,
});

export const patientAllocationAPI = axios.create({
  baseURL : `${VITE_PATIENT_SERVICE_URL}/allocation`
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

export const roleNameAPI = axios.create({
  baseURL: `${VITE_USER_SERVICE_URL}/roles_name`,
});

export const adminAPI = axios.create({
  baseURL: `${VITE_USER_SERVICE_URL}/admin`,
});

export const getDoctorNameAPI = (roleName: string) =>
  axios.create({
    baseURL: `${VITE_USER_SERVICE_URL}/${roleName}/get_doctor`,
  });

export const loggerAPI = axios.create({
  baseURL: `${VITE_LOGGER_SERVICE_URL}/Logs`,
});
