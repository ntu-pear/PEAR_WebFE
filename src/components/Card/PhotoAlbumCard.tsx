import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { useModal } from "@/hooks/useModal";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useAuth } from "@/hooks/useAuth";

const PhotoAlbumCard: React.FC = () => {
  const { openModal } = useModal();
  const { currentUser } = useAuth();
  const { patientAllocation } = useViewPatient();
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Photo Album</CardTitle>
        </CardHeader>
        <CardContent>
          {/* List of Photo Albums - List of Photos - Photo */}
          {
            (currentUser?.roleName === "SUPERVISOR" || patientAllocation?.guardianApplicationUserId === currentUser?.userId) && (
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
            )
          }
        </CardContent>
      </Card>
    </>
  );
};

export default PhotoAlbumCard;
