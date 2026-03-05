// src/pages/Supervisor/ViewMedicationSchedule.tsx
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
import { Pencil, Pill } from "lucide-react";
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

// Format today's date
const getFormattedDate = () => {
  const today = new Date();
  return today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ViewMedicationSchedule: React.FC = () => {
  const [data, setData] = useState<MedicationScheduleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const today = getFormattedDate();

  // Fetch medication schedules
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

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Administer button
  const handleAdministered = async (item: MedicationScheduleItem) => {
    try {
      await updateMedicationSchedule(item);
      fetchData(); // refresh table
    } catch (error) {
      console.error(error);
    }
  };

  // Handle Edit button
  const handleEdit = (item: MedicationScheduleItem) => {
    console.log("Editing row:", item);
    // Add your edit logic here
  };

  const filteredData = data.filter((item) =>
    item.prescriptionName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: DataTableColumns<MedicationScheduleItem> = [
    {
      key: "patientName",
      header: "Patient",
      render: (_value, item) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={`https://api.dicebear.com/6.x/initials/svg?seed=${item.patientName}`}
              alt={item.patientName}
            />
            <AvatarFallback>
              {item.patientName
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
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
      render: (_value, item) =>
        item.status === "1" ? (
          <span className="text-green-600 font-medium">Taken</span>
        ) : (
          <span className="text-red-600 font-medium">Not Taken</span>
        ),
    },
    {
      key: "administerTime",
      header: "Allocated Time",
      render: (value) => value || <span>No Allocated Time</span>,
    },
   {
      key: "actualAdministerTime",
      header: "Actual Administered Time",
      render: (_value, item) => {
        if (!item.actualAdministerTime) return <span>-</span>;
        const date = new Date(item.actualAdministerTime);
        // format HHmm
        const hh = date.getHours().toString().padStart(2, "0");
        const mm = date.getMinutes().toString().padStart(2, "0");
        return `${hh}${mm}`;
      },
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
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>

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
                loading={loading} // ✅ pass loading to DataTableClient
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ViewMedicationSchedule;