import { supervisorAPI, userAPI } from "../apiConfig";
import { patientAllocationAPI } from '../apiConfig';
import { retrieveAccessTokenFromCookie } from "../users/auth";

type Role = "DOCTOR" | "SUPERVISOR" | "CAREGIVER" | "GAME THERAPIST"

export interface Staff {
    "id": string,
    "role": Role,
    "nric_FullName": "string"
}

export interface Doctor {
    "id": string
    "nric_FullName": string
}

export interface Caregiver {
    "id": string
    "nric_FullName": string
}

export interface Supervisor {
    "id": string
    "nric_FullName": string
}

export interface GameTherapist {
    "id": string
    "nric_FullName": string
}

export const fetchAllStaff = async () => {
    try {
        const token = retrieveAccessTokenFromCookie();
        if (!token) throw new Error("No token found.");

        const response = await supervisorAPI.get("/get_active_staff", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return response.data
    }
    catch (error) {
        console.error("Get Active Staff", error);
        throw error;
    }
}

export const updateStaffAllocation = async (
    {
        patientId,
        allocationId,
        doctorId,
        gameTherapistId,
        supervisorId,
        caregiverId,
        guardianId,
        ModifiedById,
    }: {
        patientId: number,
        allocationId: number,
        doctorId: string,
        gameTherapistId: string,
        supervisorId: string,
        caregiverId: string,
        guardianId: number,
        ModifiedById: string
    }) => {
    try {
        const token = retrieveAccessTokenFromCookie();
        if (!token) throw new Error("No token found.");

        const payload = {
            patientId: patientId,
            guardianId,
            doctorId,
            gameTherapistId,
            supervisorId,
            caregiverId,
            modifiedDate: new Date().toISOString(),
            ModifiedById
        }

        console.log(payload)
        const response = await patientAllocationAPI.put(
            `/${allocationId}`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )
        console.log(response)
        console.log("Patient Staff Allocation Updated!");
        return response
    } catch (error) {
        console.error("Update Staff Allocation", error);
        throw error;
    }
}

export const retrieveStaffNRICName = async (id:string) => {
    try {
        const token = retrieveAccessTokenFromCookie();
        if (!token) throw new Error("No token found.");

        const response = await userAPI.get(`username/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return response.data
    }
    catch (error) {
        console.error("Get Active Staff", error);
        throw error;
    }
}