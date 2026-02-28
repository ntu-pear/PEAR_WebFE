import { TableRowData } from "@/components/Table/DataTable"
import { retrieveAccessTokenFromCookie } from "../users/auth"
import { personalPreferenceAPI } from "../apiConfig"

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
}

export const convertToPersonalPreferenceTD= (ViewPersonalPreferenceList: PersonalPreference[]): PersonalPreferenceTD[] => {
    return ViewPersonalPreferenceList.map((preference: PersonalPreference) => ({
        id: preference.Id,
        PreferenceName: preference.preference_name,
        PerferenceRemarks: preference.PreferenceRemarks,
        IsLike: preference.IsLike
    })).sort((a, b) => a.PreferenceName.localeCompare(b.PreferenceName))
}