import { TableRowData } from "@/components/Table/DataTable"
import { retrieveAccessTokenFromCookie } from "../users/auth"
import { problemListAPI, problemLogAPI } from "../apiConfig"

export interface ProblemLog {
    PatientID: number,
    ProblemListID: number,
    DateOfDiagnosis: string,
    ProblemRemarks: string,
    SourceOfInformation: string,
    Id: number,
    IsDeleted: string,
    CreatedDate: string,
    ModifiedDate: string,
    CreatedByID: string,
    ModifiedByID: string,
    ProblemName: string
}

export interface ProblemLogTD extends TableRowData {
    Id: number,
    ProblemListID: number,
    DateOfDiagnosis: string,
    ProblemRemarks: string,
    SourceOfInformation: string
    ProblemName: string,
}

export interface ProblemLogTDServer {
    problem_log: ProblemLogTD[],
    pagination: {
        pageNo: number,
        pageSize: number,
        totalRecords: number,
        totalPages: number
    }
}

export interface ProblemList {
    ProblemName: string,
    Id: number,
    IsDeleted: string,
    CreatedDate: string,
    ModifiedDate: string,
    CreatedByID: string,
    ModifiedByID: string
}

export interface AddProblemLog {
    PatientID: number,
    ProblemListID: number,
    DateOfDiagnosis: string,
    ProblemRemarks: string,
    SourceOfInformation: string
}

export interface EditProblemLog {
    PatientID: number,
    ProblemListID: number,
    DateOfDiagnosis: string,
    ProblemRemarks: string,
    SourceOfInformation: string
}

export const fetchPatientProblemLog = async (
    id: number,
    pageNo: number = 0,
    pageSize: number = 5,
): Promise<ProblemLogTDServer> => {
    const token = retrieveAccessTokenFromCookie()
    if (!token) {
        throw new Error("No token found.");
    }
    try {
        const response = await problemLogAPI.get(`by-patient/${id}`, {
            params: {
                pageNo: pageNo | 0,
                pageSize: pageSize
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        const problemLog: ProblemLogTD[] = convertToProblemLogTD(response.data.data)
        return {
            problem_log: problemLog,
            pagination: {
                pageNo: response.data.pageNo,
                pageSize: response.data.pageSize,
                totalRecords: response.data.totalRecords,
                totalPages: response.data.totalPages
            }
        }
    } catch (error) {
        console.error("GET patient problem log", error);
        throw error;
    }
}

const convertToProblemLogTD = (problemLog: ProblemLog[]): ProblemLogTD[] => {
    return problemLog.map((problem) => ({
        id: problem.Id,
        Id: problem.Id,
        ProblemListID: problem.ProblemListID,
        DateOfDiagnosis: new Date(problem.DateOfDiagnosis).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }).toUpperCase(),
        ProblemRemarks: problem.ProblemRemarks,
        SourceOfInformation: problem.SourceOfInformation,
        ProblemName: problem.ProblemName,
    })).sort((a, b) => {
        const aDate = new Date(a.DateOfDiagnosis)
        const bDate = new Date(b.DateOfDiagnosis)
        return bDate.getTime() - aDate.getTime()
    })
}

export const getProblemList = async (): Promise<ProblemList[]> => {
    const token = retrieveAccessTokenFromCookie()
    if (!token) {
        throw new Error("No token found.");
    }
    try {
        const response = await problemListAPI.get("", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return response.data.data
    } catch (error) {
        console.error("GET problem list", error);
        throw error;
    }
}

export const addPatientProblemLog = async (newProblemLog: AddProblemLog) => {
    const token = retrieveAccessTokenFromCookie()
    if (!token) {
        throw new Error("No token found.");
    }
    try {
        await problemLogAPI.post("/add", newProblemLog, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
    } catch (error) {
        console.error("POST patient problem log", error);
        throw error;
    }

}

export const deleteProblemLog = async (id: number) => {
    const token = retrieveAccessTokenFromCookie()
    if (!token) {
        throw new Error("No token found.");
    }
    try {
        await problemLogAPI.delete(`/delete/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
    } catch (error) {
        console.error("DELETE patient problem log", error);
        throw error;
    }
}

export const editProblemLog = async (id: number, problemLog: EditProblemLog) => {
    const token = retrieveAccessTokenFromCookie()
    if (!token) {
        throw new Error("No token found.");
    }
    try {
        await problemLogAPI.put(`/update/${id}`,problemLog,{
            headers:{
                Authorization:`Bearer ${token}`
            }
        })
    } catch (error) {
        console.error("PUT patient problem log", error);
        throw error;
    }
}