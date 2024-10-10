import React from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import Header from "@/components/Header/Header";
import DataTable from "@/components/Table/DataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockPatientMedicationList, PatientMedicationData } from "@/mocks/mockPatientMedication";

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
    const handleInputChange = () => { };
    const today = getFormattedDate(); 

    const columns = [
        {
            key: "patient", header: "Patient",
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
            )
        },
        {
            key: "prescription",
            header: "Prescription Name",
            render: (value: any, item: PatientMedicationData) =>
                item.prescription && item.prescription.prescriptionName ? (
                    item.prescription.prescriptionName
                ) : (
                    <span>No Prescription</span>
                ),
        },
        {
            key: "allocatedTime",
            header: "Allocated Time",
            render: (value: any, item: PatientMedicationData) =>
                item.prescription && item.prescription.allocatedTime ? (
                    item.prescription.allocatedTime
                ) : (
                    <span>No Allocated Time</span>
                ),
        },
        {
            key: "status",
            header: "Status",
            render: (value: any, item: PatientMedicationData) =>
                item.prescription && item.prescription.status ? (
                    <span style={{ color: "green" }}>Taken</span>
                ) : (
                    <span style={{ color: "red" }}>Not Taken</span>
                ),
        },
        {
            key: "administredBy",
            header: "Administred By",
            render: (value: any, item: PatientMedicationData) =>
                item.prescription && item.prescription.administredBy ? (
                    item.prescription.administredBy
                ) : (
                    <span>No Allocated Time</span>
                ),
        },
    ];

    const filteredData = mockPatientMedicationList.filter(
        (patient) => patient.prescription
    );

    return (
        <div className="flex min-h-screen w-full flex-col min-w-[1400px] max-w-[1400px] container mx-auto px-4">
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <Header onSearchChange={handleInputChange} />
                <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>View Medication Schedule</CardTitle>
                            <CardDescription>
                                Patients; Medication Schedule for Today  <strong>{today}</strong>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {" "}
                            <DataTable
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
