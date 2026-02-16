import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { useModal } from "@/hooks/useModal";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { albumList, getPatientPersonalPhotos, getPhotoListAlbum, personalPhotos } from "@/api/patients/photoAlbum";
import { toast } from "sonner";

const PhotoAlbumCard: React.FC = () => {
  const { openModal } = useModal();
  const { currentUser } = useAuth();
  const { id } = useViewPatient()
  const { patientAllocation } = useViewPatient();
  const [photoListAlbum, setPhotoListAlbum] = useState<albumList[]>([])
  const [curView, setCurView] = useState<number | null>(null)
  const [photos, setPhotos] = useState<personalPhotos[]>([])

  useEffect(() => {
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
  }, [])


  const fetchPatientPersonalPhotos = async () => {
    try {
      const photoList = await getPatientPersonalPhotos(Number(curView), Number(id))
      setPhotos(photoList)
    } catch (error) {
      toast.error("Failed to fetch patient personal photos")
    }
  }

  useEffect(() => {
    if (photoListAlbum.length > 0) {
      if (!curView) {
        setCurView(photoListAlbum?.[0].AlbumCategoryListID)
      }
      fetchPatientPersonalPhotos()
    }
  }, [curView, photoListAlbum])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Photo Album</CardTitle>
        </CardHeader>
        <CardContent>
          {
            (currentUser?.roleName === "SUPERVISOR" || patientAllocation?.guardianApplicationUserId === currentUser?.userId) && (
              <div className="flex items-center justify-between">
                <select className="mt-1 block p-2 border rounded-md text-gray-900" onChange={(e) => setCurView(Number(e.target.value))}>
                  {
                    photoListAlbum.map((item) => (
                      <option key={item.AlbumCategoryListID} value={item.AlbumCategoryListID}>{item.Value}</option>
                    ))
                  }
                </select>
                <Button
                  size="sm"
                  className="h-8 w-24 gap-1"
                  onClick={() => openModal("addPhoto", {
                    refreshData: fetchPatientPersonalPhotos
                  })}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add
                  </span>
                </Button>
              </div>
            )
          }
          {
            photos.length === 0 ? (
              <p className="text-md text-gray-500 mt-4 text-center">No Photos Available in this Album</p>
            ) : (
              <div className="grid gird-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
                {
                  photos.map((photo) => (
                    <div key={photo.PatientPhotoID} className="group relative overflow-hidden rounded-lg transition-all hover:shadow-md cursor-pointer"
                      onClick={() => openModal("editPhoto", {
                        photo: photo,
                        refreshData: fetchPatientPersonalPhotos
                      })}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(
                            "deletePhoto", {
                            photoId: photo.PatientPhotoID,
                            refreshData: fetchPatientPersonalPhotos
                          }
                          )
                        }}
                        className="absolute top-2 right-2 z-10 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>


                      <div className="aspect-square overflow-hidden">
                        <img
                          src={photo.PhotoPath}
                          alt={photo.PhotoDetails}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      </div>
                      <div className="p-2 text-sm text-gray-900 text-center ">
                        {photo.PhotoDetails}
                      </div>
                    </div>
                  ))
                }
              </div>
            )
          }
        </CardContent>
      </Card>
    </>
  );
};

export default PhotoAlbumCard;
