import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TabsContent } from "../ui/tabs";
import TabProps from "./types";
import { useModal } from "@/hooks/useModal";

const PhotoAlbumTab: React.FC<TabProps> = () => {
  const { openModal } = useModal();
  return (
    <>
      <TabsContent value="photo-album">
        <Card className="my-2">
          <CardHeader>
            <CardTitle className="text-lg">Photo Album</CardTitle>
          </CardHeader>
          <CardContent>
            {/* List of Photo Albums - List of Photos - Photo */}
            <Button
              size="sm"
              className="h-8 w-24 gap-1"
              onClick={() => openModal("")}
            >
              <PlusCircle className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add
              </span>
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

export default PhotoAlbumTab;
