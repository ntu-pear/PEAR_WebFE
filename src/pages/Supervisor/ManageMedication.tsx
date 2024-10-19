import React, { useState, useRef, useEffect } from "react";
import { ListFilter } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import DataTable from "@/components/Table/DataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header";
import { mockPatientMedicationList, PatientMedicationData } from "@/mocks/mockPatientMedication";

const ManageMedication: React.FC = () => {
  const [expandedPatient, setExpandedPatient] = useState<PatientMedicationData | null>(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ref for detecting clicks outside the modal
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Open the modal and set the expanded patient
  const openModal = (patient: PatientMedicationData) => {
    setExpandedPatient(patient);
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setExpandedPatient(null);
    setIsModalOpen(false);
  };

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  const columns = [
    {
      key: "patient",
      header: "Patient",
      render: (value: string, patient: PatientMedicationData) => (
        <div className="flex items-center gap-3 ">
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
    { key: "preferredName", header: "Preferred Name" },
    { key: "nric", header: "NRIC" },
    { key: "startDate", header: "Start Date" },
    { key: "endDate", header: "End Date" },
    { key: "patientStatusInActiveDate", header: "Inactive Date" },
  ];

   // Function to render medication details dynamically from the selected patient's data
   const renderMedicationDetails = (patient: PatientMedicationData) => {
    const prescription = patient.prescription;

    if (!prescription) {
      return <p className="mt-4 text-center">No existing medication</p>;
    }

    return (
      <div>
        <table className="w-full mt-2 border-t">
          <thead>
            <tr>
              <th className="text-left p-2">Medication Name</th>
              <th className="text-left p-2">Dosage</th>
              <th className="text-left p-2">Administered Time</th>
              <th className="text-left p-2">Administered By</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">{prescription.prescriptionName}</td>
              <td className="p-2">{prescription.dosage}</td>
              <td className="p-2">{prescription.allocatedTime}</td>
              <td className="p-2">{prescription.administredBy}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };
  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="activePatient">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="activePatient">Active Patients</TabsTrigger>
                <TabsTrigger value="inactivePatient">Inactive Patients</TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <ListFilter className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filter
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>All Patient</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>My Patient</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <TabsContent value="activePatient">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Patient Medication</CardTitle>
                  <CardDescription>
                    Manage medications for patients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={mockPatientMedicationList}
                    columns={columns}
                    viewMore={false}
                    renderActions={(item) => (
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => console.log("View Patient Details", item)}
                        >
                          View Patient Details
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => openModal(item)}
                        >
                          See Patient Medication(s)
                        </Button>
                      </div>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Patient Medication Details Modal */}
      {isModalOpen && expandedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            ref={modalRef}
            className="bg-white p-8 rounded-md w-full max-w-xl h-auto max-h-[80vh] overflow-y-auto relative"
          >
            <button
              onClick={closeModal}
              className="absolute top-5 right-10 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <h3 className="text-lg font-medium">
              Medication Details for {expandedPatient.patientName}
            </h3>
            {/* Medication Details */}
            {renderMedicationDetails(expandedPatient)}
            {/* Always show Create Medication button */}
            <div className="mt-4">
              <Button onClick={() => console.log("Create Medication")}>
                Create Medication
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMedication;
