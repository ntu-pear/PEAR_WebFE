import { useCallback, useEffect, useMemo, useState } from "react";
import Searchbar from "../Searchbar";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import useDebounce from "@/hooks/useDebounce";
import useGetPatientActivity from "@/hooks/activity/useGetPatientActivity";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import PatientActivitiesTable from "../Table/PatientActivitiesTable";

const ActivityRecCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { id } = useViewPatient();
  const [searchItem, setSearchItem] = useState<string>("");
  const debouncedSearch = useDebounce(searchItem, 300);
  const { data: patientActivities, error } = useGetPatientActivity(
    currentUser?.roleName,
    Number(id)
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchItem(e.target.value),
    []
  );

  const filteredActivities = useMemo(() => {
    if (!patientActivities) return [];
    if (!debouncedSearch) return patientActivities;

    return patientActivities.filter(({ name }) =>
      name.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [patientActivities, debouncedSearch]);

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
        <PatientActivitiesTable
          patientId={Number(id)}
          activities={filteredActivities}
        />
      </CardContent>
    </Card>
  );
};

export default ActivityRecCard;
