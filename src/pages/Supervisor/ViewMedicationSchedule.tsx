import React from "react"; 
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTableClient } from "@/components/Table/DataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  mockPatientMedicationList,
  PatientMedicationData,
} from "@/mocks/mockPatientMedication";
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

// Function to get today's date
const getFormattedDate = () => {
  const today = new Date();
  return today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const handleEdit = (patient: PatientMedicationData) => {
  console.log("Editing row:", patient);
};

const handleAdministered = (item: PatientMedicationData) => {
  console.log("Administered clicked:", item);
};

const ViewMedicationSchedule: React.FC = () => {
  const handleInputChange = () => {};
  const today = getFormattedDate();

  const columns = [
    {
      key: "patient",
      header: "Patient",
      className: "min-w-[150px]", // Ensures enough width for name + avatar
      render: (value: string, patient: PatientMedicationData) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={`https://api.dicebear.com/6.x/initials/svg?seed=${patient.patientName}`}
              alt={patient.patientName}
            />
            <AvatarFallback>
              {patient.patientName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-primary">{patient.patientName}</div>
          </div>
        </div>
      ),
    },
    {
      key: "prescription.prescriptionName",
      header: "Prescription Name",
      className: "min-w-[150px]",
      render: (value: any, item: PatientMedicationData) =>
        item.prescription && value ? value : <span>-</span>,
    },
    {
      key: "prescription.status",
      header: "Status",
      className: "min-w-[60px]",
      render: (_: any, item: PatientMedicationData) =>
        item.prescription ? (
          item.prescription.status ? (
            <span className="text-green-600 font-medium">Taken</span>
          ) : (
            <span className="text-red-600 font-medium">Not Taken</span>
          )
        ) : (
          <span>-</span>
        ),
    },
    {
      key: "prescription.allocatedTime",
      header: "Allocated Time",
      className: "min-w-[140px]",
      render: (value: any, item: PatientMedicationData) =>
        item.prescription && value ? value : <span>-</span>,
    },
    {
      key: "prescription.administredBy",
      header: "Assigned Caregiver",
      className: "min-w-[140px]",
      render: (value: any, item: PatientMedicationData) =>
        item.prescription && value ? value : <span>-</span>,
    },
    {
      key: "prescription.allocatedTime",
      header: "Actual Administered Time",
      className: "min-w-[140px]",
      render: (value: any, item: PatientMedicationData) =>
        item.prescription && value ? value : <span>-</span>,
    },
    {
      key: "prescription.administredBy",
      header: "Administred By",
      className: "min-w-[140px]",
      render: (value: any, item: PatientMedicationData) =>
        item.prescription && value ? value : <span>-</span>,
    },
  ];

  const filteredData = mockPatientMedicationList.filter(
    (patient) => patient.prescription
  );

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Searchbar onSearchChange={handleInputChange} />
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
                // Actions column handled here
                renderActions={(item) => (
                  <div className="flex gap-2">
                    {/* EDIT BUTTON */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </Button>

                    {/* ADMINISTER BUTTON WITH CONFIRMATION */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white"
                          disabled={!!item.prescription?.status}
                        >
                          <Pill className="h-4 w-4" /> Administer
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Confirm Medication Administration
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to mark this medication as administered for{" "}
                            <strong>{item.patientName}</strong>?
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
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ViewMedicationSchedule;