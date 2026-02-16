import { personalPhotosAPI, photoAlbumListAPI } from "../apiConfig";
import { retrieveAccessTokenFromCookie } from "../users/auth"

export interface albumList {
    Value: string,
    IsDeleted: number,
    AlbumCategoryListID: number,
    CreatedDateTime: string,
    UpdatedDateTime: string,
    CreatedById: string,
    ModifiedById: string
}

export interface personalPhotos {
    PatientID: number,
    PhotoDetails: string,
    AlbumCategoryListID: number,
    PatientPhotoID: number,
    PhotoPath: string,
    IsDeleted: number,
    CreatedDateTime: string,
    UpdatedDateTime: string,
    CreatedById: string,
    ModifiedById: string
}

export interface editPersonalPhotos {
    photoId: number,
    photoDetails: string,
    AlbumCategoryListID: number,
    file: File | null
}

export interface addPersonalPhoto {
    PatientID: number,
    PhotoDetails: string,
    AlbumCategoryListID: number | null,
    file: File | null
}

export const getPhotoListAlbum = async (): Promise<albumList[]> => {
    const token = retrieveAccessTokenFromCookie()
    if (!token) {
        throw new Error("No token found.");
    }
    try {
        const response = await photoAlbumListAPI.get("/get_photo_list_albums", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return response.data
    } catch (error) {
        console.error("GET photo list albumn", error);
        throw error;
    }
}

export const getPatientPersonalPhotos = async (albumId: number, patientId: number): Promise<personalPhotos[]> => {
    const token = retrieveAccessTokenFromCookie()
    if (!token) {
        throw new Error("No token found.");
    }
    try {
        const response = await personalPhotosAPI<personalPhotos[]>(`by-patient-id/${patientId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        console.log("getPatientPersonalPhotos", response.data)
        console.log(albumId)
        return response.data.filter((picture) => picture.AlbumCategoryListID === albumId)

    } catch (error) {
        console.error("GET patient personal photos", error);
        throw error;
    }
}

export const updatePatientPersonalPhotos = async (photoRes: editPersonalPhotos) => {
    const token = retrieveAccessTokenFromCookie()
    if (!token) {
        throw new Error("No token found.");
    }
    try {
        const formData = new FormData()
        if (photoRes.file) {
            formData.append('file', photoRes.file)
        }
        await personalPhotosAPI.put(`/update/by-photo-id/${photoRes.photoId}`, formData, {
            params: {
                PhotoDetails: photoRes.photoDetails,
                AlbumCategoryListID: photoRes.AlbumCategoryListID
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
    } catch (error) {
        console.error("PUT patient personal photos", error);
        throw error;
    }
}

export const deletePatientPersonalPhoto = async (photoId: number) => {
    const token = retrieveAccessTokenFromCookie()
    if (!token) {
        throw new Error("No token found.");
    }
    try {
        await personalPhotosAPI.delete(`/delete/by-photo-id/${photoId}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
    } catch (error) {
        console.error("DELETE patient personal photos", error);
        throw error;
    }
}

export const addPatientPersonalPhoto = async (addPhoto: addPersonalPhoto) => {
    const token = retrieveAccessTokenFromCookie()
    if (!token) {
        throw new Error("No token found.");
    }
    try{
        const formData = new FormData()
        if(addPhoto.file){
            formData.append('file',addPhoto.file)
        }
        await personalPhotosAPI.post("upload",formData,{
            params:{
                PatientID: addPhoto.PatientID,
                PhotoDetails: addPhoto.PhotoDetails,
                AlbumCategoryListID : addPhoto.AlbumCategoryListID
            }, 
            headers:{
                Authorization:`Bearer ${token}`
            }
        })
    }catch (error) {
        console.error("POST patient personal photos", error);
        throw error;
    }
}