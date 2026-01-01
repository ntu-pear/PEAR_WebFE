import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Searchbar from "@/components/Searchbar";
import { DataTableClient, DataTableColumns } from "@/components/Table/DataTable";
import { Button } from "@/components/ui/button";
import { listAdhocActivities, AdhocActivity } from "@/api/activities/adhoc";


const ManageAdhoc: React.FC = () => {
  const [adhocActivities, setAdhocActivities] = useState<AdhocActivity[]>([]);
  const [searchItem, setSearchItem] = useState("");
  const [loading, setLoading] = useState(true);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchItem(e.target.value);
    },
    []
  );

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const data = await listAdhocActivities(false,0,100);
      console.log("Fetched adhoc activities:", data);
      setAdhocActivities(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Error fetching adhoc activities:", error);
      setAdhocActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const filteredActivities = adhocActivities.filter((activity) =>
    activity.patientName?.toLowerCase().includes(searchItem.toLowerCase())
  );

  const columns: DataTableColumns<AdhocActivity> = [
    { key: "lastUpdated", header: "Last Updated" },
    { key: "patientName", header: "Patient Name" },
    { key: "startDate", header: "Start Date" },
    { key: "endDate", header: "End Date" },
    { key: "oldActivityTitle", header: "Old Activity" },
    { key: "oldActivityDescription", header: "Old Activity Description" },
    { key: "newActivityTitle", header: "New Activity" },
    { key: "newActivityDescription", header: "New Activity Description" },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Searchbar onSearchChange={handleInputChange} searchItem={searchItem} />
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Manage Adhoc</CardTitle>
              <CardDescription>Manage adhoc activities for patients</CardDescription>
            </CardHeader>

            <CardContent className="overflow-x-auto">
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : filteredActivities.length === 0 ? (
                <div className="text-sm text-muted-foreground">No activities found.</div>
              ) : (
                <DataTableClient
                  data={filteredActivities}
                  columns={columns}
                  viewMore={false}
                  renderActions={(item) => (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => console.log("Edit", item)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => console.log("Delete", item)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                />
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ManageAdhoc;

