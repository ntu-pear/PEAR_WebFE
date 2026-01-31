import { TableRowData } from "@/components/Table/DataTable";
import { retrieveAccessTokenFromCookie } from "../users/auth";
import { routineAPI, routineExclusionAPI } from "../apiConfig";
import { formatDateString, formatTimeFromHHMMSS } from "@/utils/formatDate";

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

export interface RoutinewithExclusion extends Routine {
    exclusions?: RoutineExclusion[];
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
    exclusion?: RoutineExclusion[]
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

export const fetchPatientRoutine = async (patientId: number, include_deleted?: boolean): Promise<RoutinesTD[]> => {
    const token = retrieveAccessTokenFromCookie();
    if (!token) throw new Error("No token found.");
    try {
        const routineRes = await routineAPI.get<Routine[]>(`/patient/${patientId}/`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                include_deleted: include_deleted ? true : false
            }
        })
        const routine = routineRes.data
        let exclusion: RoutineExclusion[] = []
        try {
            exclusion = await fetchPatientRoutineExclusion(include_deleted ? include_deleted : false, patientId)
        } catch (error) {
            console.error("GET Patient Routine Exclusion", error);
            throw error;
        }
        const routinesTD: RoutinesTD[] = routine.map(routine => {
            const routineExclusion = exclusion.filter(ex => ex.routine_id === routine.id)
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
                end_date: formatDateString(routine.end_date),
                exclusions: routineExclusion
            }
        })
        return routinesTD
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
                include_deleted: include_deleted ? true : false
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