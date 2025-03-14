import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DataTableClient } from "../Table/DataTable";
import { mockHobby } from "@/mocks/mockPatientDetails";
import { PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import { personalPreferenceColumns } from "../Tab/PersonalPreferenceTab";
import { useModal } from "@/hooks/useModal";

const HobbyCard: React.FC = () => {
  const { openModal } = useModal();
  return (
    <>
      <Card className="my-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Hobbies</span>
            <Button
              size="sm"
              className="h-8 w-24 gap-1"
              onClick={() => openModal("addHobby")}
            >
              <PlusCircle className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add
              </span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTableClient
            data={mockHobby}
            columns={personalPreferenceColumns}
            viewMore={false}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default HobbyCard;
