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
import { DatePicker } from "antd";
import {
  listAdhocActivities,
  AdhocActivity,
  updateAdhocActivity,
  deleteAdhocActivity,
} from "@/api/activities/adhoc";
import { listActivities, Activity } from "@/api/activities/activities"; // master activity list
import { formatDateTime } from "@/utils/formatDate";
import dayjs from "dayjs";
import { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useNavigate } from "react-router-dom";

dayjs.extend(utc);
dayjs.extend(timezone);
const SG_TZ = "Asia/Singapore";

const formatApiDateTime = (value: string | Dayjs) =>
  dayjs(value).format("YYYY-MM-DDTHH:mm:ss.SSS") + "000";

const getModalDateTimeValue = (value?: string | null) => {
  if (!value) return "";

  const parsed = dayjs(value);
  if (!parsed.isValid()) return "";

  return parsed.tz(SG_TZ).format("YYYY-MM-DDTHH:mm");
};

const ManageAdhoc: React.FC = () => {
  const navigate = useNavigate();
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
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Manage Adhoc</CardTitle>
                  <CardDescription>Manage adhoc activities for patients</CardDescription>
                </div>
                <Button onClick={() => navigate("/supervisor/add-adhoc")}>
                  Add Adhoc
                </Button>
              </div>
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
        onClose={() => {
          setEditModalOpen(false);
          setEditingActivity(null);
        }}
        onSave={async (updated) => {
          try {
            const startISO = formatApiDateTime(updated.startDate);
            const endISO = formatApiDateTime(updated.endDate);
            const modifiedISO = formatApiDateTime(new Date().toISOString());

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
            setEditingActivity(null);
          } catch (err) {
            console.error(err);
            alert("Failed to update adhoc activity");
            setEditingActivity(prev => (prev ? { ...prev } : prev));
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
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const dateTimeFormat = "YYYY-MM-DD hh:mm:ss A";
  const [durationMinutes, setDurationMinutes] = useState(30);
  const pickerPopupClassName = "adhoc-datetime-picker-popup";
  const timePickerProps = {
    format: "hh:mm:ss A",
    use12Hours: true,
  };

  const resetForm = useCallback(() => {
    if (!activity) {
      setSelectedActivityId(undefined);
      setStartDate(null);
      setEndDate(null);
      setDurationMinutes(30);
      return;
    }

    setSelectedActivityId(activity.newActivityId);
    const startValue = getModalDateTimeValue(activity.startDate);
    const endValue = getModalDateTimeValue(activity.endDate);
    const nextStartDate = startValue ? dayjs(startValue) : null;
    const nextEndDate = endValue ? dayjs(endValue) : null;
    setStartDate(nextStartDate);
    setEndDate(nextEndDate);
    setDurationMinutes(
      nextStartDate && nextEndDate && nextEndDate.isAfter(nextStartDate)
        ? nextEndDate.diff(nextStartDate, "minute")
        : 30
    );
  }, [activity]);

  const handleStartDateChange = (value: Dayjs | null) => {
    setStartDate(value);
    setEndDate(value ? value.add(durationMinutes, "minute") : null);
  };

  const handleEndDateChange = (value: Dayjs | null) => {
    setEndDate(value);

    if (value && startDate && value.isAfter(startDate)) {
      setDurationMinutes(value.diff(startDate, "minute"));
    }
  };

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  if (!activity) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetForm();
          onClose();
        }
      }}
    >
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
            <DatePicker
              value={startDate}
              showTime={timePickerProps}
              format={dateTimeFormat}
              use12Hours
              className="w-full"
              onChange={handleStartDateChange}
              allowClear={false}
              popupClassName={pickerPopupClassName}
            />
          </div>

          <div>
            <label className="text-sm font-medium">End Date</label>
            <DatePicker
              value={endDate}
              showTime={timePickerProps}
              format={dateTimeFormat}
              use12Hours
              className="w-full"
              onChange={handleEndDateChange}
              allowClear={false}
              popupClassName={pickerPopupClassName}
            />
          </div>
        </div>

        <DialogFooter className="mt-4 flex space-x-2">
          <Button
            onClick={() => {
              if (!selectedActivityId && selectedActivityId !== 0) return alert("Select a new activity");
              if (!startDate || !endDate) return alert("Select both start and end dates");
              const newId = selectedActivityId === -1 ? activity.newActivityId : selectedActivityId;
              onSave({
                ...activity,
                newActivityId: newId,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
              });
            }}
          >
            Save
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManageAdhoc;
