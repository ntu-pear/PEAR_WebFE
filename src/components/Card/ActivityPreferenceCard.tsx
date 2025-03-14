import { useModal } from "@/hooks/useModal";
import { mockActivityPreferences } from "@/mocks/mockPatientDetails";
import { PlusCircle } from "lucide-react";
import { DataTableClient } from "../Table/DataTable";
import { CardHeader, CardTitle, CardContent, Card } from "../ui/card";
import { Button } from "../ui/button";

const ActivityPreferenceCard: React.FC = () => {
  const { openModal } = useModal();
  const activityPreferencesColumns = [
    { key: "activityName", header: "Activity Name" },
    { key: "activityDescription", header: "Activity Description" },
    { key: "likeOrDislike", header: "Like/Dislike" },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Activity Preferences</span>
            <Button
              size="sm"
              className="h-8 w-24 gap-1"
              onClick={() => openModal("addActivityPreference")}
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
            data={mockActivityPreferences}
            columns={activityPreferencesColumns}
            viewMore={false}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default ActivityPreferenceCard;
