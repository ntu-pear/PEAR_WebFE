import { TabsContent } from "../ui/tabs";
import PhotoAlbumCard from "../Card/PhotoAlbumCard";

const PhotoAlbumTab: React.FC = () => {
  return (
    <>
      <TabsContent value="photo-album">
        <div className="my-2">
          <PhotoAlbumCard />
        </div>
      </TabsContent>
    </>
  );
};

export default PhotoAlbumTab;
