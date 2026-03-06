import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTableClient, DataTableColumns } from "@/components/Table/DataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Searchbar from "@/components/Searchbar";
import { Button } from "@/components/ui/button";
//import { Pencil } from "lucide-react";
import { CheckCircle, Clock, AlertTriangle, Pill } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  listMedicationSchedules,
  updateMedicationSchedule,
  MedicationScheduleItem,
} from "@/api/scheduler/medicalSchedule";
import { getUserDetails } from "@/api/users/user";

// Format today's date
const getFormattedDate = () => {
  const today = new Date();
  return today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Format time in 0000 style
const formatTimeHHMM = (time: string | undefined | null) => {
  if (!time || time === "null" || time === "undefined") return "-";

  if (time.includes("T")) {
    const date = new Date(time);

    if (isNaN(date.getTime())) return "-";

    return `${String(date.getHours()).padStart(2, "0")}${String(
      date.getMinutes()
    ).padStart(2, "0")}`;
  }

  return time;
};

const isLate = (allocatedTime: string | undefined) => {
  if (!allocatedTime) return false;

  const now = new Date();

  // convert "1330" -> hours/minutes
  const hours = parseInt(allocatedTime.slice(0, 2));
  const minutes = parseInt(allocatedTime.slice(2, 4));

  const allocated = new Date();
  allocated.setHours(hours);
  allocated.setMinutes(minutes);
  allocated.setSeconds(0);

  return now > allocated;
};

const ViewMedicationSchedule: React.FC = () => {
  const [data, setData] = useState<MedicationScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");

  // Edit modal state
  const [editItem, setEditItem] = useState<MedicationScheduleItem | null>(null);
  const [editAdministerTime, setEditAdministerTime] = useState("");
  const [editStatus, setEditStatus] = useState<"0" | "1">("0");
  const [editAdministeredBy, setEditAdministeredBy] = useState("");

  const today = getFormattedDate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const schedules = await listMedicationSchedules();
      setData(schedules);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadUser = async () => {
  try {
    const user = await getUserDetails();
    setCurrentUserId(user.id);
  } catch (err) {
    console.error("Failed to load user", err);
  }
};

  useEffect(() => {
    fetchData();
    loadUser();
  }, []);

  const handleAdministered = async (item: MedicationScheduleItem) => {
    try {
      await updateMedicationSchedule({
        ...item,
        status: "1",
        administeredBy: currentUserId, // replace later with logged in user
      });

      fetchData(); // refresh table
    } catch (error) {
      console.error(error);
    }
  };

  /*
  const handleEdit = (item: MedicationScheduleItem) => {
    setEditItem(item);
    setEditAdministerTime(String(item.administerTime));
    setEditStatus(item.status as "0" | "1");
    setEditAdministeredBy(item.administeredBy || "");
  };
  */

  const handleEditConfirm = async () => {
    if (!editItem) return;

    try {
      await updateMedicationSchedule({
        ...editItem,
        administerTime: editAdministerTime,
        status: editStatus,
        administeredBy: editAdministeredBy,
      });
      fetchData();
      setEditItem(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredData = data.filter((item) =>
    [
      item.patientName,
      item.prescriptionName,
      item.assignedTo,
      item.administeredBy
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const columns: DataTableColumns<MedicationScheduleItem> = [
    {
      key: "patientName",
      header: "Patient",
      render: (_value, item) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={item.profilePicture} alt={item.patientName} />
            <AvatarFallback>
              {item.patientName?.split(" ").map((n) => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{item.patientName}</div>
          </div>
        </div>
      ),
    },
    {
      key: "prescriptionName",
      header: "Prescription Name",
      render: (value) => value || <span>No Prescription</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (_value, item) => {
        if (item.status === "1") {
          return (
            <span className="flex items-center gap-2 text-green-600 font-medium">
              <CheckCircle className="h-4 w-4" />
              Taken
            </span>
          );
        }

        const late = isLate(String(item.administerTime));

        if (late) {
          return (
            <span className="flex items-center gap-2 text-red-600 font-medium">
              <AlertTriangle className="h-4 w-4" />
              Not Taken (Late)
            </span>
          );
        }

        return (
          <span className="flex items-center gap-2 text-yellow-600 font-medium">
            <Clock className="h-4 w-4" />
            Not Taken
          </span>
        );
      },
    },
    {
      key: "administerTime",
      header: "Allocated Time",
      render: (_value, item) => formatTimeHHMM(String(item.administerTime)),
    },
    {
      key: "assignedTo",
      header: "Caregiver",
      render: (_value, item) => item.assignedTo || "-",
    },
    {
      key: "actualAdministerTime",
      header: "Actual Administered Time",
      render: (_value, item) => formatTimeHHMM(String(item.actualAdministerTime)),
    },
    {
      key: "administeredBy",
      header: "Administered By",
      render: (value) => value || <span>-</span>,
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Searchbar
          onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
        />
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>View Medication Schedule</CardTitle>
              <CardDescription>
                Patients; Medication Schedule for Today <strong>{today}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <DataTableClient
                data={filteredData}
                columns={columns}
                viewMore={false}
                renderActions={(item: MedicationScheduleItem) => (
                  <div className="flex gap-2">
                    {/*
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                      */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                          disabled={item.status === "1"}
                        >
                          <Pill className="h-4 w-4" />
                          Administer
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Confirm Medication Administration
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to mark this medication as
                            administered for <strong>{item.patientName}</strong>?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleAdministered(item)}
                          >
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
                loading={loading}
              />

              {/* Edit Modal */}
              <AlertDialog
                open={!!editItem}
                onOpenChange={(open) => !open && setEditItem(null)}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Edit Medication</AlertDialogTitle>
                    <AlertDialogDescription>
                      Edit details for <strong>{editItem?.patientName}</strong>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="flex flex-col gap-2 py-2">
                    <label>
                      Allocated Time (0000):
                      <input
                        type="text"
                        value={editAdministerTime}
                        onChange={(e) => setEditAdministerTime(e.target.value)}
                        className="border p-1 rounded w-full"
                      />
                    </label>
                    <label>
                      Status:
                      <select
                        value={editStatus}
                        onChange={(e) =>
                          setEditStatus(e.target.value as "0" | "1")
                        }
                        className="border p-1 rounded w-full"
                      >
                        <option value="0">Not Taken</option>
                        <option value="1">Taken</option>
                      </select>
                    </label>
                    <label>
                      Administered By:
                      <input
                        type="text"
                        value={editAdministeredBy}
                        onChange={(e) =>
                          setEditAdministeredBy(e.target.value)
                        }
                        className="border p-1 rounded w-full"
                      />
                    </label>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setEditItem(null)}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleEditConfirm}>
                      Save
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ViewMedicationSchedule;