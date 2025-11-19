import { patientAllocationAPI } from '../apiConfig';
import { retrieveAccessTokenFromCookie } from "../users/auth";

export interface PatientAllocation {
    doctorId: string,
    gameTherapistId: string,
    supervisorId: string,
    caregiverId: string,
    guardianApplicationUserId: string
}

export const fetchPatientAllocationById = async (
    patient_id: number
): Promise<PatientAllocation> => {
    const token = retrieveAccessTokenFromCookie()
    if (!token) {
        throw new Error("No token founnd!")
    }
    try {
        const response = await patientAllocationAPI.get<PatientAllocation>(`/patient/${patient_id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const data = response.data
        const allocation: PatientAllocation = {
            doctorId: data.doctorId,
            gameTherapistId: data.gameTherapistId,
            supervisorId: data.supervisorId ,
            caregiverId: data.caregiverId,
            guardianApplicationUserId: data.guardianApplicationUserId
        }
        return allocation
    } catch (error) {
        console.error("GET get Patient Allocation", error)
        throw error
    }
}