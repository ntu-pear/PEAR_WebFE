import { TableRowData } from "@/components/Table/DataTable";
import { retrieveAccessTokenFromCookie } from "../users/auth";
import { routineAPI, routineExclusionAPI } from "../apiConfig";
import { formatDateString, formatTimeFromHHMMSS } from "@/utils/formatDate";
import dayjs from "dayjs";

export interface Routine {
    name: string,
    activity_id: number,
    patient_id: number,
    day_of_week: number,
    start_time: string,
    end_time: string,
    start_date: string,
    end_date: string,
    id: number,
    is_deleted: boolean,
    created_date: string,
    modified_date: string,
    created_by_id: string,
    modified_by_id: string
}

export interface RoutineExclusion {
    routine_id: number,
    start_date: string,
    end_date: string,
    remarks: string,
    id: number,
    is_deleted: boolean,
    created_date: string,
    modified_date: string,
    created_by_id: string,
    modified_by_id: string
}


export interface RoutinesTD extends TableRowData {
    activityId: number,
    name: string,
    day_of_week: string,
    time_slot: string,
    start_time: string,
    end_time: string,
    start_date: string,
    end_date: string,
}

export interface AddRoutine {
    name: string,
    activity_id: number,
    patient_id: number,
    day_of_week: number,
    start_time: string,
    end_time: string,
    start_date: string,
    end_date: string
}

export interface EditRoutine {
    name: string,
    activity_id: number,
    patient_id: number,
    day_of_week: number,
    start_time: string,
    end_time: string,
    start_date: string,
    end_date: string,
    id: number
}

export interface EditRoutineExclusion {
    routine_id: number,
    start_date: string,
    end_date: string,
    remarks: string,
    id: number
}

export interface AddRoutineExclusion {
    routine_id: number,
    start_date: string,
    end_date: string,
    remarks: string
}

export const fetchPatientRoutine = async (patientId: number, include_deleted?: boolean): Promise<RoutinesTD[]> => {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("No token found.");
    try {
        const routineRes = await routineAPI.get<Routine[]>(`/patient/${patientId}/`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                include_deleted: include_deleted ? include_deleted : false
            }
        })
        const routine = routineRes.data
        const routinesTD: RoutinesTD[] = routine.map(routine => {
            const timeSlot = `${formatTimeFromHHMMSS(routine.start_time)} - ${formatTimeFromHHMMSS(routine.end_time)}`;
            return {
                id: routine.id,
                activityId: routine.activity_id,
                name: routine.name,
                day_of_week: convertDayofWeek(routine.day_of_week),
                time_slot: timeSlot,
                start_time: formatTimeFromHHMMSS(routine.start_time),
                end_time: formatTimeFromHHMMSS(routine.end_time),
                start_date: formatDateString(routine.start_date),
                end_date: formatDateString(routine.end_date)
            }
        })
        return routinesTD.sort(
            (a,b)=>dayjs(b.start_date).valueOf()-dayjs(a.start_date).valueOf()
        )
    } catch (error) {
        console.error("GET Patient Routine", error);
        throw error;
    }
}

const convertDayofWeek = (day: number) => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    return days[day - 1]
}

export const fetchPatientRoutineExclusion = async (include_deleted: boolean, patientId: number): Promise<RoutineExclusion[]> => {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("No token found.");
    try {
        const routineExclusion = await routineExclusionAPI.get<RoutineExclusion[]>(`/patient/${patientId}/`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                include_deleted: include_deleted ? include_deleted : false
            }
        })
        return routineExclusion.data

    } catch (error) {
        console.error("GET Patient Routine Exclusion", error);
        throw error;
    }
}

export const deletePatientRoutine = async (id: number) => {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("No token found.");
    try {
        const response = await routineAPI.delete(`${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return response.data
    } catch (error) {
        console.error("DELETE Patient Routine", error);
        throw error;
    }
}

export const addPatientRoutine = async (routine: AddRoutine) => {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("No token found.");
    try {
        const response = await routineAPI.post("", routine, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        console.log(response)
    } catch (error) {
        console.error("POST Patient Routine", error);
        throw error;
    }
}

export const editPatientRoutine = async (routine: EditRoutine) => {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("No token found.");
    try {
        const response = await routineAPI.put("", routine, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        console.log(response)
    } catch (error) {
        console.error("PUT Patient Routine", error);
        throw error;
    }
}

export const fetchRoutineExclusion = async (routine_id: number, include_deleted?: boolean) => {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("No token found.");
    try {
        const routineExclusion = await routineExclusionAPI.get<RoutineExclusion[]>(`/routine/${routine_id}/`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                include_deleted: include_deleted ? include_deleted : false
            }
        })
        const formattedExclusions = routineExclusion.data.map((exclusion) => ({
            ...exclusion,
            start_date: formatDateString(exclusion.start_date),
            end_date: formatDateString(exclusion.end_date)
        }))
        return formattedExclusions.sort(
            (a,b)=>dayjs(b.start_date).valueOf()-dayjs(a.start_date).valueOf()
        )
    } catch (error) {
        console.error("GET Routine Exclusion", error);
        throw error;
    }
}
export const deleteRoutineExclusion = async (exclusion_id: number) => {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("No token found.");
    try {
        await routineExclusionAPI.delete(`/${exclusion_id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
    } catch (error) {
        console.error("DELETE Routine Exclusion", error);
        throw error;
    }
}

export const updateRoutineExclusion = async (routineExclusion: EditRoutineExclusion) => {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("No token found.");
    try {
        await routineExclusionAPI.put("", routineExclusion, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
    } catch (error) {
        console.error("PUT Routine Exclusion", error);
        throw error;
    }
}

export const addRoutineExclusion = async (routineExclusion: AddRoutineExclusion) => {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("No token found.");
    try {
        await routineExclusionAPI.post("", routineExclusion, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
    } catch (error) {
        console.error("POST Routine Exclusion", error);
        throw error;
    }
}