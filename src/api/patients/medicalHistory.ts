import { TableRowData } from "@/components/Table/DataTable";
import { medicalDiagnosisListAPI, medicalHistoryAPI } from "../apiConfig";
import { retrieveAccessTokenFromCookie } from "../users/auth";

export interface medicalHistory {
    PatientId: number;
    MedicalDiagnosisID: number;
    DateOfDiagnosis: string;
    Remarks: string;
    SourceOfInformation: string;
    IsDeleted: string
    Id: number;
    CreatedDate: string;
    ModifiedDate: string;
    CreatedByID: string;
    ModifiedByID: string;
    diagnosis_name: string;
}

export interface ViewMedicalHistoryList {
    data: medicalHistory[];
    pageNo: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
}

export interface MedicalHistoryTD extends TableRowData {
    diagnosis_name: string;
    source_of_information: string;
    remarks: string;
    date_of_diagnosis: string;
    diagnosis_id: number;
}

export interface MedicalHistoryTDServer {
    medicalHistory: MedicalHistoryTD[];
    pagination: {
        pageNo: number;
        pageSize: number;
        totalRecords: number;
        totalPages: number;
    };
}

export interface AddMedicalHistory {
    PatientID: number;
    MedicalDiagnosisID: number;
    DateOfDiagnosis: string;
    Remarks: string;
    SourceOfInformation: string;
    CreatedByID: string
    ModifiedByID: string
}

export interface Diagnosis {
    Id: number
    DiagnosisName: string
    IsDeleted: number,
    CreatedDate: string,
    ModifiedDate: string,
    CreatedByID: string,
    ModifiedByID: string
}

export const fetchMedicalHistory = async (
    id: Number,
    pageNo: number = 0,
    pageSize: number = 10,
): Promise<MedicalHistoryTDServer> => {
    const token = retrieveAccessTokenFromCookie()
    if (!token) {
        throw new Error("No token found.");
    }
    try {
        const response = await medicalHistoryAPI.get(`/by-patient/${id}`, {
            params: {
                pageNo,
                pageSize,
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        const pagination = {
            pageNo: response.data.pageNo,
            pageSize: response.data.pageSize,
            totalRecords: response.data.totalRecords,
            totalPages: response.data.totalPages
        }
        const history = convertToMedicalHistoryTD(response.data.data)
        return { medicalHistory: history, pagination }
    } catch (error) {
        console.error("GET patient medical history", error);
        throw error;
    }
}

export const convertToMedicalHistoryTD = (medicalHistoryList: medicalHistory[]): MedicalHistoryTD[] => {
    return medicalHistoryList.map(history => ({
        id: history.Id,
        diagnosis_name: history.diagnosis_name,
        source_of_information: history.SourceOfInformation,
        remarks: history.Remarks,
        date_of_diagnosis: new Date(history.DateOfDiagnosis).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }),
        diagnosis_id: history.MedicalDiagnosisID

    })).sort((a, b) => {
        const dateA = new Date(a.date_of_diagnosis)
        const dateB = new Date(b.date_of_diagnosis)
        return dateB.getTime() - dateA.getTime()
    }) //descending order
}

export const updateMedicalHistory = async (medicalHistory: MedicalHistoryTD, ModifiedByID: string) => {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    };
    const payload = {
        "MedicalDiagnosisID": medicalHistory.diagnosis_id,
        "DateOfDiagnosis": formatDate(medicalHistory.date_of_diagnosis),
        "Remarks": medicalHistory.remarks,
        "SourceOfInformation": medicalHistory.source_of_information,
        ModifiedByID
    }
    const token = retrieveAccessTokenFromCookie()
    if (!token) {
        throw new Error("No token found.");
    }
    try {
        await medicalHistoryAPI.put('/update/', payload, {
            params: {
                history_id: medicalHistory.id
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
    } catch (error) {
        console.error("PUT patient medical history", error);
        throw error;
    }
}

export const fetchDiagnosisList = async () => {
    const token = retrieveAccessTokenFromCookie()
    if (!token) {
        throw new Error("No token found.");
    }
    try {
        const response = await medicalDiagnosisListAPI.get('', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        console.log("Diagnosis API response:", response.data);

        console.log("fetchDiagnosisList", response)
        return response.data.data.filter(
            (d: Diagnosis)  => Number(d.IsDeleted) === 0
        );
    } catch (error) {
        console.error("GET Medical Diagnosis List", error);
        throw error;
    }
}

export const AddMedicalHistory = async (newHistory: AddMedicalHistory) => {
    const token = retrieveAccessTokenFromCookie()
    if (!token) {
        throw new Error("No token found.");
    }
    try {
        await medicalHistoryAPI.post('/add/', newHistory, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
    } catch (error) {
        console.error("POST Medical History", error);
        throw error;
    }
}

export const DeleteMedicalHistory = async (history_id: number) => {
    console.log(history_id)
    const token = retrieveAccessTokenFromCookie()
    if (!token) {
        throw new Error("No token found.");
    }
    try {
        await medicalHistoryAPI.delete(`/delete/`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: { history_id: history_id }
        })
    } catch (error) {
        console.error("DELETE Medical History", error);
        throw error;
    }
}