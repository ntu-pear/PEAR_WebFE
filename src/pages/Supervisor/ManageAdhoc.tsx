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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  listAdhocActivities,
  AdhocActivity,
  updateAdhocActivity,
  deleteAdhocActivity,
} from "@/api/activities/adhoc";
import { listActivities, Activity } from "@/api/activities/activities"; // master activity list
import { formatDateTime } from "@/utils/formatDate";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
const SG_TZ = "Asia/Singapore";

const ManageAdhoc: React.FC = () => {
  const [adhocActivities, setAdhocActivities] = useState<AdhocActivity[]>([]);
  const [searchItem, setSearchItem] = useState("");
  const [loading, setLoading] = useState(true);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<AdhocActivity | null>(null);

  const [activityList, setActivityList] = useState<Activity[]>([]); // full master list

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchItem(e.target.value),
    []
  );

  // Fetch adhoc activities
  const fetchAdhoc = async () => {
    setLoading(true);
    try {
      const data = await listAdhocActivities(false, 0, 100);
      const formatted = data.map(a => ({
        ...a,
        startDate: formatDateTime(a.startDate ?? null),
        endDate: formatDateTime(a.endDate ?? null),
        lastUpdated: formatDateTime(a.lastUpdated ?? null),
      }));
      setAdhocActivities(formatted);
    } catch (err) {
      console.error("Failed to fetch adhoc activities:", err);
      setAdhocActivities([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch master activity list
  const fetchMasterActivities = async () => {
    try {
      const data = await listActivities(); // [{id, title, description}]
      setActivityList(data);
    } catch (err) {
      console.error("Failed to fetch activity list:", err);
      setActivityList([]);
    }
  };

  useEffect(() => {
    fetchAdhoc();
    fetchMasterActivities();
  }, []);

  const filteredActivities = adhocActivities.filter(a =>
    a.patientName?.toLowerCase().includes(searchItem.toLowerCase())
  );

  const handleDelete = async (activity: AdhocActivity) => {
    if (!window.confirm(`Delete adhoc activity for ${activity.patientName}?`)) return;
    try {
      await deleteAdhocActivity(activity.id);
      setAdhocActivities(prev => prev.filter(a => a.id !== activity.id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete adhoc activity");
    }
  };

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
                        onClick={() => handleDelete(item)}
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

      {/* Edit Modal */}
      <EditAdhocModal
        activity={editingActivity}
        open={editModalOpen}
        activityList={activityList}
        onClose={() => setEditModalOpen(false)}
        onSave={async (updated) => {
          try {
            const startISO = dayjs.tz(updated.startDate, SG_TZ).format();
            const endISO = dayjs.tz(updated.endDate, SG_TZ).format();
            const modifiedISO = dayjs.tz(new Date(), SG_TZ).format();

            // Swap old/new if activity changed
            const isChanged = updated.newActivityId !== editingActivity?.newActivityId;
            const newOldActivityId = isChanged ? editingActivity!.newActivityId : updated.oldActivityId;
            const newNewActivityId = updated.newActivityId!;

            const payload = {
              id: updated.id,
              oldActivityId: newOldActivityId,
              newActivityId: newNewActivityId,
              patientId: updated.patientId,
              startDate: startISO,
              endDate: endISO,
              status: updated.status,
              isDeleted: updated.isDeleted,
              modifiedById: "system",
              modifiedDate: modifiedISO,
            };

            await updateAdhocActivity(payload);

            const oldActivity = activityList.find(a => a.id === newOldActivityId);
            const newActivity = activityList.find(a => a.id === newNewActivityId);

            setAdhocActivities(prev =>
              prev.map(a =>
                a.id === updated.id
                  ? {
                      ...a,
                      oldActivityId: newOldActivityId,
                      newActivityId: newNewActivityId,
                      oldActivityTitle: oldActivity?.title || a.oldActivityTitle,
                      oldActivityDescription: oldActivity?.description || a.oldActivityDescription,
                      newActivityTitle: newActivity?.title || a.newActivityTitle,
                      newActivityDescription: newActivity?.description || a.newActivityDescription,
                      startDate: formatDateTime(payload.startDate),
                      endDate: formatDateTime(payload.endDate),
                      status: payload.status,
                      isDeleted: payload.isDeleted,
                      modifiedById: payload.modifiedById,
                      lastUpdated: formatDateTime(payload.modifiedDate),
                    }
                  : a
              )
            );

            setEditModalOpen(false);
          } catch (err) {
            console.error(err);
            alert("Failed to update adhoc activity");
          }
        }}
      />
    </div>
  );
};

/* -------------------------
   Edit Modal Component
------------------------- */
interface EditAdhocModalProps {
  activity: AdhocActivity | null;
  open: boolean;
  onClose: () => void;
  onSave: (updated: AdhocActivity) => void;
  activityList: Activity[];
}

const EditAdhocModal: React.FC<EditAdhocModalProps> = ({ activity, open, onClose, onSave, activityList }) => {
  const [selectedActivityId, setSelectedActivityId] = useState<number | undefined>(activity?.newActivityId);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (!activity) return;

    setSelectedActivityId(activity.newActivityId);

    const startSG = dayjs(activity.startDate).tz(SG_TZ).format("YYYY-MM-DDTHH:mm");
    const endSG = dayjs(activity.endDate).tz(SG_TZ).format("YYYY-MM-DDTHH:mm");

    setStartDate(startSG);
    setEndDate(endSG);
  }, [activity]);

  if (!activity) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Adhoc Activity</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium">Replace Activity With</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={selectedActivityId ?? -1}
              onChange={(e) => setSelectedActivityId(Number(e.target.value))}
            >
              <option value={-1}>Keep Current</option>
              {activityList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Start Date</label>
            <Input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">End Date</label>
            <Input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="mt-4 flex space-x-2">
          <Button
            onClick={() => {
              if (!selectedActivityId && selectedActivityId !== 0) return alert("Select a new activity");
              const newId = selectedActivityId === -1 ? activity.newActivityId : selectedActivityId;
              onSave({ ...activity, newActivityId: newId, startDate, endDate });
            }}
          >
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageAdhoc;
