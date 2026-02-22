import { TabsContent } from "../ui/tabs";
import PhotoAlbumCard from "../Card/PhotoAlbumCard";
import { useModal } from "@/hooks/useModal";
import EditPhotoModal from "../Modal/Edit/EditPhotoModal";
import DeletePhotoModal from "../Modal/Delete/DeletePhotoModal";
import AddPhotoModal from "../Modal/Add/AddPhotoModal";

const PhotoAlbumTab: React.FC = () => {
  const { activeModal } = useModal();

  return (
    <>
      <TabsContent value="photo-album">
        <div className="my-2">
          <PhotoAlbumCard />
        </div>
      </TabsContent>
      {activeModal.name==="editPhoto" && <EditPhotoModal/>}
      {activeModal.name === "deletePhoto" && <DeletePhotoModal/>}
      {activeModal.name === "addPhoto" && <AddPhotoModal/>}
    </>
  );
};

export default PhotoAlbumTab;
