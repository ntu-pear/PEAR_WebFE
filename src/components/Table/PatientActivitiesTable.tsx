import { PatientActivity } from "@/hooks/activity/useGetPatientActivity";
import { DataTableClient, DataTableColumns } from "./DataTable";
import PreferenceBadge from "../Activity/PreferenceBadge";
import RecommendationBadge from "../Activity/RecommendationBadge";
import { Button } from "../ui/button";
import { Edit } from "lucide-react";
import { useModal } from "@/hooks/useModal";
import { useAuth } from "@/hooks/useAuth";

type PatientActivitiesTableProps = {
  patientId: number;
  activities: PatientActivity[];
};

const PatientActivitiesTable = ({
  patientId,
  activities,
}: PatientActivitiesTableProps) => {
  const { currentUser } = useAuth();
  const { openModal } = useModal();

  const tableColumns: DataTableColumns<PatientActivity> = [
    {
      key: "name",
      header: "Name",
    },
    {
      key: "description",
      header: "Description",
    },
    {
      key: "patientPreference",
      header: "Patient Preference",
      className: "text-center",
      render: (preference) => <PreferenceBadge preference={preference} />,
    },
    {
      key: "doctorRecommendation",
      header: "Doctor Recommendation",
      className: "text-center",
      render: (recommendation) => (
        <RecommendationBadge recommendation={recommendation} />
      ),
    },
    {
      key: "doctorNotes",
      header: "Doctor Notes",
    },
  ];

  return (
    <DataTableClient
      data={activities}
      columns={tableColumns}
      viewMore={false}
      renderActions={(activity) => (
        <div className="flex flex-row space-x-2">
          {/* TBD: Link to edit preference */}
          {activity.canEdit && (
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          )}
          {activity.canRecommend && (
            <Button
              variant="default"
              size="sm"
              onClick={() =>
                activity.recommendationId
                  ? openModal("editActivityRecommendation", {
                      patientId: patientId,
                      centreActivityId: String(activity.id),
                      submitterId: currentUser?.userId,
                      activityName: activity.name,
                      recommendationId: String(activity.recommendationId),
                    })
                  : openModal("addActivityRecommendation", {
                      patientId: patientId,
                      centreActivityId: String(activity.id),
                      submitterId: currentUser?.userId,
                      activityName: activity.name,
                    })
              }
            >
              Recommend
            </Button>
          )}
        </div>
      )}
    />
  );
};

export default PatientActivitiesTable;
