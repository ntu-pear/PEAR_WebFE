import { useCallback, useEffect, useMemo, useState } from "react";
import Searchbar from "../Searchbar";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import useDebounce from "@/hooks/useDebounce";
import useGetPatientActivity, {
  PatientActivity,
} from "@/hooks/activity/useGetPatientActivity";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import PatientActivitiesTable from "../Table/PatientActivitiesTable";
import { Button } from "../ui/button";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { recommendationToInt } from "@/utils/activityConversions";
import {
  CreateActivityRecommendationPayload,
  UpdateActivityRecommendationPayload,
} from "@/api/activity/activityRecommendation";
import useAddActivityRecommendation from "@/hooks/activity/useAddActivityRecommendation";
import useUpdateActivityRecommendation from "@/hooks/activity/useUpdateActivityRecommendation";

const ActivityRecCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { id } = useViewPatient();
  const [searchItem, setSearchItem] = useState<string>("");
  const debouncedSearch = useDebounce(searchItem, 300);
  const [selectedActivities, setSelectedActivities] = useState<
    PatientActivity[]
  >([]);
  const { data: patientActivities, error } = useGetPatientActivity(
    currentUser?.roleName,
    Number(id)
  );
  const addActivityRecommendation = useAddActivityRecommendation();
  const editActivityRecommendation = useUpdateActivityRecommendation();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchItem(e.target.value),
    []
  );

  const filteredActivities = useMemo(() => {
    if (!patientActivities) return [];
    if (!debouncedSearch) return patientActivities;

    setSelectedActivities((prevSelected) =>
      prevSelected.filter(({ name }) =>
        name.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    );

    return patientActivities.filter(({ name }) =>
      name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [patientActivities, debouncedSearch]);

  const handleBulkUpdateActivityRecommendation = (
    recommendation: "RECOMMENDED" | "NOT_RECOMMENDED" | "NEUTRAL"
  ) => {
    selectedActivities.forEach((activity) => {
      if (activity.recommendationId) {
        const payload: UpdateActivityRecommendationPayload = {
          patientId: Number(id),
          centreActivityId: activity.id,
          doctorId: currentUser!.userId,
          recommendationId: activity.recommendationId,
          doctorRecommendation: recommendationToInt(recommendation),
          doctorRemarks: activity.doctorNotes,
        };

        editActivityRecommendation.mutate(payload, {
          onSuccess: () => {
            console.log(
              `Recommendation for ${activity.name} updated successfully`
            );
          },
        });
      } else {
        const payload: CreateActivityRecommendationPayload = {
          patientId: Number(id),
          centreActivityId: activity.id,
          doctorId: currentUser!.userId,
          doctorRecommendation: recommendationToInt(recommendation),
          doctorRemarks: "",
        };

        addActivityRecommendation.mutate(payload, {
          onSuccess: () => {
            console.log(
              `Recommendation for ${activity.name} added successfully`
            );
          },
        });
      }
    });

    setSelectedActivities([]);
  };

  useEffect(() => {
    if (error) toast.error("Failed to load activity recommendations.");
    console.log(error);
  }, [error]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pr-0">
        <CardTitle className="text-lg">Activity Recommendation</CardTitle>
        <Searchbar searchItem={searchItem} onSearchChange={handleInputChange} />
      </CardHeader>
      <CardContent>
        {selectedActivities.length > 0 && (
          <div className="flex items-center justify-between space-x-4 mb-4 bg-gray-100 p-4 rounded-md border border-gray-200">
            <span className="text-sm">
              <strong className="font-bold">{selectedActivities.length}</strong>{" "}
              of {filteredActivities.length} items selected
            </span>

            <div className="flex space-x-2">
              <Button
                onClick={() =>
                  handleBulkUpdateActivityRecommendation("RECOMMENDED")
                }
                variant="approve"
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                Recommended
              </Button>
              <Button
                onClick={() =>
                  handleBulkUpdateActivityRecommendation("NEUTRAL")
                }
                variant="outline"
              >
                Neutral
              </Button>
              <Button
                onClick={() =>
                  handleBulkUpdateActivityRecommendation("NOT_RECOMMENDED")
                }
                variant="reject"
              >
                <ThumbsDown className="mr-2 h-4 w-4" />
                Not Recommended
              </Button>
            </div>
          </div>
        )}
        <PatientActivitiesTable
          patientId={Number(id)}
          activities={filteredActivities}
          selectedActivities={selectedActivities}
          onSelectedActivitiesChange={setSelectedActivities}
        />
      </CardContent>
    </Card>
  );
};

export default ActivityRecCard;
