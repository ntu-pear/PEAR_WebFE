import { addPatientPersonalPhoto, addPersonalPhoto, albumList, getPhotoListAlbum } from "@/api/patients/photoAlbum"
import { useViewPatient } from "@/hooks/patient/useViewPatient"
import { useModal } from "@/hooks/useModal"
import { Upload } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "../../ui/button";
import { toast } from "sonner"

const AddPhotoModal = () => {
    const { modalRef, activeModal, closeModal } = useModal()
    const { id } = useViewPatient()
    const { refreshData } = activeModal.props as {
        refreshData: () => void
    }
    const [isLoading, setIsLoading] = useState(true)
    const [previewUrl, setPreviewUrl] = useState("")
    const [addPhoto, setAddPhoto] = useState<addPersonalPhoto>({
        PatientID: Number(id),
        PhotoDetails: "",
        AlbumCategoryListID: null,
        file: null
    })
    const [photoListAlbum, setPhotoListAlbum] = useState<albumList[]>([])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 1 * 1024 * 1024) {
                toast.error("File size must be less than 1MB")
                return
            }
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
            setAddPhoto((prev) => ({ ...prev, file }))
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }

    }

    useEffect(() => {
        const fetchPhotoListAlbum = async () => {
            try {
                const list = await getPhotoListAlbum()
                setPhotoListAlbum(list)
                setAddPhoto((prev) => ({ ...prev, AlbumCategoryListID: list?.[0].AlbumCategoryListID }))
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
        setIsLoading(false)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!addPhoto.file) {
            toast.error("Photo is required")
            return
        }
        try {
            setIsLoading(true)
            console.log(addPhoto)
            await addPatientPersonalPhoto(addPhoto)
            await refreshData()
            toast.success("Patient Personal Photo added successfully.")
            closeModal()
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Failed to add patient personal photo. ${error.message}`);
            } else {
                toast.error(
                    "Failed to add patient personal photo. An unknown error occurred."
                );
            }
            console.error(error)
            console.log("Failed to add patient personal photo")
            closeModal();
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div ref={modalRef} className="bg-background p-8 rounded-md w-[600px]" >
                <h3 className="text-lg font-medium mb-5">Add Photo</h3>
                {
                    isLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            <p>Uploading Photo...</p>
                        </div>
                    ) : (
                        <form className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[70vh]" onSubmit={handleSubmit}>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium">
                                    Photo Detail<span className="text-red-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                                    value={addPhoto.PhotoDetails}
                                    onChange={(e) => setAddPhoto((prev) => ({ ...prev, PhotoDetails: e.target.value }))}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium">
                                    Album Category<span className="text-red-600">*</span>
                                </label>
                                <select
                                    className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                                    required
                                    onChange={(e) => setAddPhoto((prev) => ({ ...prev, AlbumCategoryListID: Number(e.target.value) }))}
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
                                                {previewUrl ? "Change Photo" : "Upload Photo"}
                                            </span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleFileChange(e)}
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="col-span-2 mt-6 flex justify-end space-x-2">
                                <Button variant="outline" onClick={closeModal}>
                                    Cancel
                                </Button>
                                <Button type="submit">Add</Button>
                            </div>
                        </form>
                    )
                }
            </div>
        </div>
    )
}

export default AddPhotoModal