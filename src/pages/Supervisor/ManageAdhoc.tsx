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
import { listActivities, Activity } from "@/api/activities/activities";
import {
  listCentreActivities,
  CentreActivity,
} from "@/api/activities/centreActivities"; 
import { formatDateTimeNoYear, formatDateTime } from "@/utils/formatDate";
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
  const [centreActivityList, setCentreActivityList] = useState<CentreActivity[]>([]);
  const [activityList, setActivityList] = useState<Activity[]>([]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchItem(e.target.value),
    []
  );

  // Fetch adhoc activities
  const fetchAdhoc = async () => {
    setLoading(true);
    try {
      const data = await listAdhocActivities(false, 0, 100);
      const formatted = data.map(a => {
        const oldCentre = a.oldActivityId
          ? centreActivityMap[a.oldActivityId]
          : undefined;

        const newCentre = a.newActivityId
          ? centreActivityMap[a.newActivityId]
          : undefined;

        return {
          ...a,
          startDate: formatDateTimeNoYear(a.startDate ?? null),
          endDate: formatDateTimeNoYear(a.endDate ?? null),
          lastUpdated: formatDateTimeNoYear(a.lastUpdated ?? null),

          oldActivityTitle: getCentreActivityDisplayName(oldCentre),
          oldActivityDescription: getCentreActivityDescription(oldCentre),

          newActivityTitle: getCentreActivityDisplayName(newCentre),
          newActivityDescription: getCentreActivityDescription(newCentre),
        };
      });
      setAdhocActivities(formatted);
    } catch (err) {
      console.error("Failed to fetch adhoc activities:", err);
      setAdhocActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const data = await listActivities({ include_deleted: false, limit: 1000 });
      setActivityList(data);
    } catch (err) {
      console.error("Failed to fetch activities", err);
      setActivityList([]);
    }
  };


  const fetchCentreActivities = async () => {
    try {
      const data = await listCentreActivities({ include_deleted: false, limit: 1000 });
      setCentreActivityList(data);
    } catch (err) {
      console.error("Failed to fetch centre activities", err);
      setCentreActivityList([]);
    }
  };

  const getCentreActivityDisplayName = (ca?: CentreActivity) => {
    if (!ca) return "UNKNOWN ACTIVITY";

    const activity = activityMap[ca.activity_id];
    return activity ? activity.title.toUpperCase() : "UNKNOWN ACTIVITY";
  };

  const getCentreActivityDescription = (ca?: CentreActivity) => {
    if (!ca) return "-";

    const activity = activityMap[ca.activity_id];
    return activity?.description ?? "-";
  };

  useEffect(() => {
    fetchCentreActivities();
    fetchActivities();
  }, []);

  useEffect(() => {
    if (centreActivityList.length > 0 && activityList.length > 0) {
      fetchAdhoc();
    }
  }, [centreActivityList, activityList]);

  const activityMap = React.useMemo(() => {
    const map: Record<number, Activity> = {};
    activityList.forEach(a => {
      map[a.id] = a;
    });
    return map;
  }, [activityList]);

  const centreActivityMap = React.useMemo(() => {
    const map: Record<number, CentreActivity> = {};
    centreActivityList.forEach(ca => {
      map[ca.id] = ca;
    });
    return map;
  }, [centreActivityList]);

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
    
    { key: "oldActivityTitle", header: "Original Activity" },
    { key: "oldActivityDescription", header: "Original Activity Description" },

    { key: "newActivityTitle", header: "Ad Hoc Activity" },
    { key: "newActivityDescription", header: "Ad Hoc Activity Description" },

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
        centreActivityList={centreActivityList}
        getDisplayName={getCentreActivityDisplayName}
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

            const oldActivity =
              typeof newOldActivityId === "number"
                ? centreActivityMap[newOldActivityId]
                : undefined;

            const newActivity =
              typeof newNewActivityId === "number"
                ? centreActivityMap[newNewActivityId]
                : undefined;

            setAdhocActivities(prev =>
              prev.map(a =>
                a.id === updated.id
                  ? {
                      ...a,
                      oldActivityId: newOldActivityId,
                      newActivityId: newNewActivityId,
                      
                      oldActivityTitle: getCentreActivityDisplayName(oldActivity),
                      oldActivityDescription: getCentreActivityDescription(oldActivity),

                      newActivityTitle: getCentreActivityDisplayName(newActivity),
                      newActivityDescription: getCentreActivityDescription(newActivity),
               
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
  centreActivityList: CentreActivity[];
  getDisplayName: (ca?: CentreActivity) => string;
}

const EditAdhocModal: React.FC<EditAdhocModalProps> = ({ activity, open, onClose, onSave, centreActivityList, getDisplayName }) => {
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
              {[...centreActivityList]
                .sort((a, b) =>
                  getDisplayName(a).localeCompare(getDisplayName(b))
                )
                .map((ca) => (
                  <option key={ca.id} value={ca.id}>
                    {getDisplayName(ca).toUpperCase()}
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
