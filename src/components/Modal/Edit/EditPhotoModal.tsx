import { albumList, editPersonalPhotos, getPhotoListAlbum, personalPhotos, updatePatientPersonalPhotos } from "@/api/patients/photoAlbum"
import { useModal } from "@/hooks/useModal"
import { Upload } from "lucide-react"
import { Button } from "../../ui/button";
import React, { useEffect, useState } from "react"
import { toast } from "sonner";

const EditPhotoModal = () => {
    const { modalRef, activeModal, closeModal } = useModal()
    const { photo, refreshData } = activeModal.props as {
        photo: personalPhotos,
        refreshData: () => void
    }
    const [rowData, setRowData] = useState<editPersonalPhotos>({
        photoId: photo.PatientPhotoID,
        photoDetails: photo.PhotoDetails,
        AlbumCategoryListID: photo.AlbumCategoryListID,
        file: null
    })
    const [previewUrl, setPreviewUrl] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)
    const [photoListAlbum, setPhotoListAlbum] = useState<albumList[]>([])


    useEffect(() => {
        const convertUrlToFile = async () => {
            try {
                const response = await fetch(photo.PhotoPath)
                const blob = await response.blob()

                const filename = photo.PhotoPath.split('/').pop() || 'photo.jpg'
                const file = new File([blob], filename, { type: blob.type })
                setRowData((prev) => ({ ...prev, file }))
                setPreviewUrl(URL.createObjectURL(blob))
            } catch (error) {
                console.error('Error loading photo:', error)
                setPreviewUrl(photo.PhotoPath)
            } finally {
                setIsLoading(false)
            }
        }
        const fetchPhotoListAlbum = async () => {
            try {
                const list = await getPhotoListAlbum()
                setPhotoListAlbum(list)

            } catch (error) {
                if (error instanceof Error) {
                    toast.error(`Failed to fetch Photo List Album. ${error}`)
                } else {
                    toast.error("Failed to fetch Photo List Album")
                }
                console.error("Failed to fetch Photo List Album")
            }
        }
        fetchPhotoListAlbum()
        convertUrlToFile()
        return () => {
            if (previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [photo.PhotoPath])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB')
                return
            }
            if (previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl)
            }
            setRowData((prev) => ({ ...prev, file }))
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setIsLoading(true)
            await updatePatientPersonalPhotos(rowData)
            await refreshData()
            toast.success("Patient Personal Photo updated successfully.")
            closeModal()
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Failed to update patient personal photo. ${error.message}`);
            } else {
                toast.error(
                    "Failed to update patient personal photo. An unknown error occurred."
                );
            }
            console.error(error)
            console.log("Failed to update patient personal photo")
            closeModal();
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div ref={modalRef} className="bg-background p-8 rounded-md w-[600px]" onSubmit={handleSubmit}>
                <h3 className="text-lg font-medium mb-5">Edit Photo</h3>
                {
                    isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>

                    ) : (
                        <form className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium">
                                    Photo Detail<span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="photoDetails"
                                    value={rowData.photoDetails}
                                    onChange={(e) => { setRowData((prev) => ({ ...prev, photoDetails: e.target.value })) }}
                                    className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                                    required
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium">
                                    Album Category<span className="text-red-600">*</span>
                                </label>
                                <select
                                    className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                                    required
                                    onChange={(e)=>setRowData((prev)=>({...prev, AlbumCategoryListID: Number(e.target.value)}))}
                                >
                                    {photoListAlbum.map((album) => (
                                        <option key={album.AlbumCategoryListID} value={album.AlbumCategoryListID}>
                                            {album.Value}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium">
                                    Photo<span className="text-red-600">*</span>
                                </label>
                                {
                                    previewUrl && (
                                        <div className="relative mb-3 w-full h-64 border-2 rounded-lg overflow-hidden mt-2">
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )
                                }
                                <div className="flex items-center gap-3">
                                    <label className="flex-1 cursor-pointer">
                                        <div className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 transition-colors">
                                            <Upload className="h-5 w-5 text-gray-400" />
                                            <span className="text-sm text-gray-600">
                                                Change Photo
                                            </span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            required
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="col-span-2 mt-6 flex justify-end space-x-2">
                                <Button variant="outline" onClick={closeModal}>
                                    Cancel
                                </Button>
                                <Button type="submit">Update</Button>
                            </div>
                        </form>
                    )
                }
            </div>
        </div>
    )
}

export default EditPhotoModal