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
import {
  listCentreActivityAvailabilities,
  availabilityCoversTime,
  CentreActivityAvailability,
} from "@/api/activities/centreActivityAvailabilities";
import { formatDateTimeNoYear, formatDateTime } from "@/utils/formatDate";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { DatePicker } from "antd";

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
          startDate: a.startDate,        
          endDate: a.endDate,              
          lastUpdated: a.lastUpdated,     

          startDateDisplay: formatDateTimeNoYear(a.startDate),
          endDateDisplay: formatDateTimeNoYear(a.endDate),
          lastUpdatedDisplay: formatDateTimeNoYear(a.lastUpdated ?? null),
          //lastUpdated: formatDateTimeNoYear(a.lastUpdated ?? null),

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

  useEffect(() => {
    listCentreActivityAvailabilities({ include_deleted: false, limit: 1000 })
      .catch(err => console.error("Failed to load availabilities", err));
  }, []);


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
    { key: "startDateDisplay", header: "Start Date" },
    { key: "endDateDisplay", header: "End Date" },

    
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
            const startISO = dayjs(updated.startDate)
              .tz(SG_TZ)
              .format("YYYY-MM-DDTHH:mm:ss");

            const endISO = dayjs(updated.endDate)
              .tz(SG_TZ)
              .format("YYYY-MM-DDTHH:mm:ss");
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
               
                      startDate: payload.startDate,
                      endDate: payload.endDate,

                      startDateDisplay: formatDateTimeNoYear(payload.startDate),
                      endDateDisplay: formatDateTimeNoYear(payload.endDate),
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
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [availabilities, setAvailabilities] =
    useState<CentreActivityAvailability[]>([]);

  useEffect(() => {
    if (!activity) return;

    setSelectedActivityId(activity.newActivityId);

    const startSG = dayjs.utc(activity.startDate).tz(SG_TZ);
    const endSG = dayjs.utc(activity.endDate).tz(SG_TZ);

    setStartDate(startSG);
    setEndDate(endSG);
  }, [activity]);


  useEffect(() => {
    listCentreActivityAvailabilities({ include_deleted: false, limit: 1000 })
      .then(setAvailabilities)
      .catch(err =>
        console.error("Failed to load availabilities", err)
      );
  }, []);

  const validReplacementIds = React.useMemo(() => {
    if (!startDate || !endDate) return [];

    const selectedDate = startDate.format("YYYY-MM-DD");

    return availabilities
      .filter(a => {
        if (selectedDate < a.start_date || selectedDate > a.end_date) {
          return false;
        }

        return availabilityCoversTime(a, startDate, endDate);
      })
      .map(a => a.centre_activity_id);
  }, [availabilities, startDate, endDate]);

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
              {centreActivityList
                .filter(ca => validReplacementIds.includes(ca.id))
                .sort((a, b) =>
                  getDisplayName(a).localeCompare(getDisplayName(b))
                )
                .map(ca => (
                  <option key={ca.id} value={ca.id}>
                    {getDisplayName(ca).toUpperCase()}
                  </option>
                ))}


            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Start Date</label>
            <DatePicker
              value={startDate}
                onChange={(value) => {
                  if (!value) return;
                  setStartDate(value.second(0));
                  setSelectedActivityId(undefined); 
                }}

              showTime={{ use12Hours: true, format: "h:mm A" }}
              format="DD-MMM-YYYY h:mm A"
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium">End Date</label>
            <DatePicker
              value={endDate}
              
              onChange={(value) => {
                  if (!value) return;
                  setEndDate(value.second(0));
                  setSelectedActivityId(undefined); 
                }}

              showTime={{ use12Hours: true, format: "h:mm A" }}
              format="DD-MMM-YYYY h:mm A"
              className="w-full"
            />
          </div>
        </div>

        <DialogFooter className="mt-4 flex space-x-2">
          <Button
            onClick={() => {
              if (!startDate || !endDate) {
                alert("Please select valid start and end dates");
                return;
              }

              const newId =
                selectedActivityId === -1
                  ? activity.newActivityId
                  : selectedActivityId;

              onSave({
                ...activity,
                newActivityId: newId,
                startDate: startDate.tz(SG_TZ).toISOString(),
                endDate: endDate.tz(SG_TZ).toISOString(),
              });
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
