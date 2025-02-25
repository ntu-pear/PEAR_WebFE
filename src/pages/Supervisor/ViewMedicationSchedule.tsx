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

// Function to get today's date
const getFormattedDate = () => {
  const today = new Date();
  return today.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ViewMedicationSchedule: React.FC = () => {
  const handleInputChange = () => {};
  const today = getFormattedDate();

  const columns = [
    {
      key: "patient",
      header: "Patient",
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
      render: (value: any, item: PatientMedicationData) =>
        item.prescription && value ? value : <span>No Prescription</span>,
    },
    {
      key: "prescription.allocatedTime",
      header: "Allocated Time",
      render: (value: any, item: PatientMedicationData) =>
        item.prescription && value ? value : <span>No Allocated Time</span>,
    },
    {
      key: "prescription.status",
      header: "Status",
      render: (value: any, item: PatientMedicationData) =>
        item.prescription && value ? (
          <span style={{ color: "green" }}>Taken</span>
        ) : (
          <span style={{ color: "red" }}>Not Taken</span>
        ),
    },
    {
      key: "prescription.administredBy",
      header: "Administred By",
      render: (value: any, item: PatientMedicationData) =>
        item.prescription && value ? value : <span>No Allocated Time</span>,
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
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default ViewMedicationSchedule;
