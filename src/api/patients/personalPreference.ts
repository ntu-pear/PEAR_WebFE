import { TableRowData } from "@/components/Table/DataTable"
import { retrieveAccessTokenFromCookie } from "../users/auth"
import { personalPreferenceAPI, personalPreferenceListAPI } from "../apiConfig"

export interface PersonalPreference {
    PatientID: number,
    PersonalPreferenceListID: number,
    IsLike: string | null,
    PreferenceRemarks: string,
    Id: number,
    IsDeleted: string,
    CreatedDate: string,
    ModifiedDate: string,
    CreatedByID: string,
    ModifiedByID: string,
    preference_name: string,
    preference_type: string
}

export interface ViewPersonalPreferenceList {
    data: PersonalPreference[],
    pageNo: number,
    pageSize: number,
    totalRecords: number,
    totalPages: number
}

export interface PersonalPreferenceTD extends TableRowData {
    PreferenceName: string
    PerferenceRemarks: string
    IsLike: string | null
    PersonalPreferenceListID: number
}

export interface PersonalPreferenceTDServer {
    personalPreference: PersonalPreferenceTD[];
    pagination: {
        pageNo: number;
        pageSize: number;
        totalRecords: number;
        totalPages: number;
    };
}

export interface Preference {
    PreferenceType: string,
    PreferenceName: string,
    Id: number,
    IsDeleted: string,
    CreatedDate: string,
    ModifiedDate: string,
    CreatedByID: string,
    ModifiedByID: string
}

export interface AddPersonalPreference {
    PatientID: number,
    PersonalPreferenceListID: number,
    IsLike: string | null,
    PreferenceRemarks: string
}

export interface EditPersonalPreference {
    id: number,
    PatientID: number,
    PersonalPreferenceListID: number,
    PreferenceName: string,
    IsLike: string | null,
    PreferenceRemarks: string
}

export interface EditPersonalPreferenceRequest {
    PatientID: number,
    PersonalPreferenceListID: number,
    IsLike: string | null,
    PreferenceRemarks: string
}

export const getPatientPersonalPreference = async (
    id: Number,
    pageNo: number = 0,
    pageSize: number = 5,
    preferenceType: "LikesDislikes" | "Habit" | "Hobby"
): Promise<PersonalPreferenceTDServer> => {
    const token = retrieveAccessTokenFromCookie()
    if (!token) {
        throw new Error("No token found.");
    }
    try {
        const response = await personalPreferenceAPI.get(`/by-patient-id/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                pageNo: pageNo,
                pageSize: pageSize,
                preferenceType: preferenceType
            }
        })
        const ViewPersonalPreferenceList: ViewPersonalPreferenceList = response.data
        const personalPreference = convertToPersonalPreferenceTD(ViewPersonalPreferenceList.data)

        return {
            personalPreference: personalPreference,
            pagination: {
                pageNo: ViewPersonalPreferenceList.pageNo,
                pageSize: ViewPersonalPreferenceList.pageSize,
                totalRecords: ViewPersonalPreferenceList.totalRecords,
                totalPages: ViewPersonalPreferenceList.totalPages
            }
        }
    } catch (error) {
        console.error("GET Patient Personal Preference", error);
        throw error;
    }

}

export const convertToPersonalPreferenceTD = (ViewPersonalPreferenceList: PersonalPreference[]): PersonalPreferenceTD[] => {
    return ViewPersonalPreferenceList.map((preference: PersonalPreference) => ({
        id: preference.Id,
        PersonalPreferenceListID: preference.PersonalPreferenceListID,
        PreferenceName: preference.preference_name,
        PerferenceRemarks: preference.PreferenceRemarks,
        IsLike: preference.IsLike
    })).sort((a, b) => a.PreferenceName.localeCompare(b.PreferenceName))
}

export const getPersonalPreferenceList = async (preferenceType: "LikesDislikes" | "Habit" | "Hobby"): Promise<Preference[]> => {
    const token = retrieveAccessTokenFromCookie()
    if (!token) {
        throw new Error("No token found.");
    }
    try {
        const response = await personalPreferenceListAPI.get("", {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                preferenceType: preferenceType
            }
        })
        return response.data.data
    } catch (error) {
        console.error(`Get Personal Preference List (${preferenceType})`, error);
        throw error;
    }
}

export const addPersonalPreferennce = async (newPreference: AddPersonalPreference) => {
    const token = retrieveAccessTokenFromCookie()
    if (!token) {
        throw new Error("No token found.");
    }
    try {
        console.log(newPreference)
        await personalPreferenceAPI.post("/add", newPreference, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
    } catch (error) {
        console.error(`POST Personal Preference`, error);
        throw error;
    }
}

export const RemovePersonalPreference = async (id: number) => {
    const token = retrieveAccessTokenFromCookie()
    if (!token) {
        throw new Error("No token found.");
    }
    try {
        await personalPreferenceAPI.delete(`/delete/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
    } catch (error) {
        console.error(`DELETE Personal Preference`, error);
        throw error;
    }
}

export const UpdatePersonalPreference = async (id:number, editPreference: EditPersonalPreferenceRequest) => {
    const token = retrieveAccessTokenFromCookie()
    if (!token) {
        throw new Error("No token found.");
    }
    try {
        await personalPreferenceAPI.put(`/update/${id}`,editPreference,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })
    } catch (error) {
        console.error(`PUT Personal Preference`, error);
        throw error;
    }
}