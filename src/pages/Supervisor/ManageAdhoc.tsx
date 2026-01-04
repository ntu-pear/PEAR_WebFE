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
import { listAdhocActivities, AdhocActivity, updateAdhocActivity } from "@/api/activities/adhoc";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";


const ManageAdhoc: React.FC = () => {
  const [adhocActivities, setAdhocActivities] = useState<AdhocActivity[]>([]);
  const [searchItem, setSearchItem] = useState("");
  const [loading, setLoading] = useState(true);

  //edit button
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<AdhocActivity | null>(null);


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
                        onClick={() => {
                          setEditingActivity(item);
                          setEditModalOpen(true);
                        }}
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
      {/* -------------------------
          Add the Edit Modal here
         ------------------------- */}
      <EditAdhocModal
        activity={editingActivity}
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={async (updated) => {
          try {
            await updateAdhocActivity({
              id: updated.id,
              startDate: updated.startDate,
              endDate: updated.endDate,
              patientId: updated.patientId,
              oldActivityId: updated.oldActivityId,
              newActivityId: updated.newActivityId,
            });

            setAdhocActivities((prev) =>
              prev.map((a) => (a.id === updated.id ? updated : a))
            );
          } catch (err) {
            console.error("Failed to update activity:", err);
          }
        }}
      />
    </div>
    
    
  );
};

const EditAdhocModal: React.FC<{
  activity: AdhocActivity | null;
  open: boolean;
  onClose: () => void;
  onSave: (updated: AdhocActivity) => void;
}> = ({ activity, open, onClose, onSave }) => {
  const [selectedActivityId, setSelectedActivityId] = useState<number | undefined>(activity?.newActivityId);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [adhocList, setAdhocList] = useState<AdhocActivity[]>([]);

  // Helper to format dates for datetime-local input
  const formatForInput = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  useEffect(() => {
    if (activity) {
      setSelectedActivityId(activity.newActivityId);
      setStartDate(formatForInput(activity.startDate));
      setEndDate(formatForInput(activity.endDate));
    }
  }, [activity]);

  // Optionally, fetch all activities to populate the dropdown
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await listAdhocActivities(false, 0, 100); // or your API to fetch activities
        setAdhocList(data);
      } catch (err) {
        console.error("Failed to fetch activities for dropdown:", err);
      }
    };
    fetchAll();
  }, []);

  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Adhoc Activity</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Activity Selection Dropdown */}
          <div>
            <label className="text-sm font-medium">Replace Activity With</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(Number(e.target.value))}
            >
              {adhocList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.newActivityTitle || `Activity ${a.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="text-sm font-medium">Start Date</label>
            <Input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="text-sm font-medium">End Date</label>
            <Input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            onClick={() => {
              onSave({
                ...activity,
                newActivityId: selectedActivityId,
                startDate,
                endDate,
              });
              onClose();
            }}
          >
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default ManageAdhoc;

