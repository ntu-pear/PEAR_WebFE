import React, { useState, useEffect } from "react";
import { ListFilter, PlusCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DataTableServer } from "@/components/Table/DataTable";
import AvatarModalWrapper from "@/components/AvatarModalWrapper";
import Searchbar from "@/components/Searchbar";
import {
  fetchAllPatientTD,
  PatientTableData,
  PatientTableDataServer,
} from "@/api/patients/patients";
import useDebounce from "@/hooks/useDebounce";
import { mockCaregiverID } from "@/mocks/mockPatientTableData";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import {
  fetchPatientPrescription,
  PrescriptionTDServer,
} from "@/api/patients/prescription";
import { toast } from "sonner";
import AddPrescriptionModal from "@/components/Modal/Add/AddPrescriptionModal";
import DeletePrescriptionModal from "@/components/Modal/Delete/DeletePrescriptionModal";
import EditPrescriptionModal from "@/components/Modal/Edit/EditPrescriptionModal";

const ManageMedication: React.FC = () => {
  const { currentUser } = useAuth();
  const { activeModal, openModal } = useModal();

  // Filters
  const [search, setSearch] = useState<string>("");
  const [tab, setTab] = useState<string>("activePatients");
  const [role, setRole] = useState<string>("allPatients");

  const debouncedSearch = useDebounce(search, 300);
  const debouncedTab = useDebounce(tab, 300);
  const debouncedRole = useDebounce(role, 300);

  // Patients
  const [patientTDServer, setPatientTDServer] =
    useState<PatientTableDataServer>({
      patients: [],
      pagination: {
        pageNo: 0,
        pageSize: 0,
        totalRecords: 0,
        totalPages: 0,
      },
    });
  const handleFilter = async (pageNo: number) => {
    try {
      const fetchedPatientTDServer: PatientTableDataServer =
        await fetchAllPatientTD(
          debouncedSearch,
          debouncedTab === "activePatients" ? "1" : "0",
          pageNo
        );

      const filteredPatientTDList = fetchedPatientTDServer.patients.filter(
        (ptd: PatientTableData) =>
          debouncedRole === "myPatients" && mockCaregiverID !== null
            ? ptd.supervisorId === mockCaregiverID
            : true
      );

      setPatientTDServer({
        patients: filteredPatientTDList,
        pagination: fetchedPatientTDServer.pagination,
      });
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };
  useEffect(() => {
    handleFilter(patientTDServer.pagination.pageNo || 0);
  }, [debouncedSearch, debouncedTab, debouncedRole]);

  // Patient Medication
  const [expandedPatient, setExpandedPatient] =
    useState<PatientTableData | null>(null);
  const [patientMedication, setPatientMedication] =
    useState<PrescriptionTDServer>({
      prescriptions: [],
      pagination: {
        pageNo: 0,
        pageSize: 0,
        totalRecords: 0,
        totalPages: 0,
      },
    });
  const handleFetchMedication = async (pageNo: number, patientId?: number) => {
    const pid = patientId ?? expandedPatient?.id;
    if (!pid || Number.isNaN(pid)) return;

    try {
      const fetchedPrescription = await fetchPatientPrescription(
        Number(pid),
        pageNo
      );
      setPatientMedication(fetchedPrescription);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch prescription for patient");
    }
  };
  const refreshPatientMedication = () =>
    handleFetchMedication(patientMedication.pagination.pageNo || 0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openMedicationModal = (patient: PatientTableData) => {
    setExpandedPatient(patient);
    handleFetchMedication(0, Number(patient.id));
    setIsModalOpen(true);
  };
  const closeMedicationModal = () => {
    setExpandedPatient(null);
    setPatientMedication({
      prescriptions: [],
      pagination: {
        pageNo: 0,
        pageSize: 0,
        totalRecords: 0,
        totalPages: 0,
      },
    });
    setIsModalOpen(false);
  };

  // Patient Table
  const columns = [
    {
      key: "name",
      header: "Name",
      render: (value: string, patient: PatientTableData) => (
        <div className="flex items-center gap-3">
          <AvatarModalWrapper patient={patient} />
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-muted-foreground">
              {patient.preferredName}
            </div>
          </div>
        </div>
      ),
    },
    { key: "nric", header: "NRIC" },
    {
      key: "startDate",
      header: "Start Date",
      className: "hidden md:table-cell",
    },
    { key: "endDate", header: "End Date", className: "hidden md:table-cell" },
    ...(debouncedTab === "inactivePatients"
      ? [
          {
            key: "inactiveDate",
            header: "Inactive Date",
            className: "hidden md:table-cell",
          },
        ]
      : []),
  ];
  const renderActions = (item: PatientTableData) => (
    <div className="ml-4 sm:ml-2">
      <Button
        variant="destructive"
        size="sm"
        onClick={() => openMedicationModal(item)}
      >
        Show Medication
      </Button>
    </div>
  );

  // Medication Details Modal Table
  const prescriptionColumns = [
    { key: "drugName", header: "Drug Name", className: "truncate-column" },
    { key: "dosage", header: "Dosage", className: "truncate-column" },
    { key: "frequencyPerDay", header: "Frequency Per Day" },
    { key: "instruction", header: "Instruction", className: "truncate-column" },
    { key: "startDate", header: "Start Date" },
    { key: "endDate", header: "End Date" },
    { key: "afterMeal", header: "After Meal" },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Searchbar
          searchItem={search}
          onSearchChange={(e) => setSearch(e.target.value)}
        />
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs value={tab} onValueChange={setTab}>
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="activePatients">
                  Active Patients
                </TabsTrigger>
                <TabsTrigger value="inactivePatients">
                  Inactive Patients
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <ListFilter className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Role
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup
                      value={role}
                      onValueChange={setRole}
                    >
                      <DropdownMenuRadioItem value="allPatients">
                        All Patients
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="myPatients">
                        My Patients
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <TabsContent value="activePatients">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Patient Medication</CardTitle>
                  <CardDescription>
                    Manage medications for patients
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <DataTableServer
                    data={patientTDServer.patients}
                    pagination={patientTDServer.pagination}
                    columns={columns}
                    viewMore={true}
                    viewMoreBaseLink={"/supervisor/view-patient"}
                    activeTab={"information"}
                    fetchData={handleFilter}
                    renderActions={renderActions}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="inactivePatients">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Patient Medication</CardTitle>
                  <CardDescription>
                    Manage medications for patients
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <DataTableServer
                    data={patientTDServer.patients}
                    pagination={patientTDServer.pagination}
                    columns={columns}
                    viewMore={true}
                    viewMoreBaseLink={"/supervisor/view-patient"}
                    activeTab={"information"}
                    fetchData={handleFilter}
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
          <div className="bg-white p-8 rounded-md w-full max-w-[80vw] h-auto max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={closeMedicationModal}
              className="absolute top-5 right-10 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <div className="flex items-center justify-between mt-6">
              <h3 className="text-lg font-medium">
                Medication Details for {expandedPatient.preferredName}
              </h3>
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() =>
                  openModal("addPrescription", {
                    patientId: expandedPatient.id,
                    submitterId: currentUser?.userId,
                    refreshPrescriptionData: refreshPatientMedication,
                  })
                }
              >
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add
                </span>
              </Button>
            </div>
            <div className="mt-4">
              <DataTableServer
                data={patientMedication.prescriptions}
                pagination={patientMedication.pagination}
                fetchData={handleFetchMedication}
                columns={prescriptionColumns}
                viewMore={false}
                renderActions={(item) => (
                  <div className="flex flex-col">
                    <Button
                      variant="default"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        openModal("editPrescription", {
                          prescriptionId: String(item.id),
                          submitterId: currentUser?.userId,
                          refreshPrescriptionData: refreshPatientMedication,
                        });
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        openModal("deletePrescription", {
                          prescriptionId: String(item.id),
                          submitterId: currentUser?.userId,
                          refreshPrescriptionData: refreshPatientMedication,
                        });
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      )}

      {activeModal.name === "addPrescription" && <AddPrescriptionModal />}
      {activeModal.name === "deletePrescription" && <DeletePrescriptionModal />}
      {activeModal.name === "editPrescription" && <EditPrescriptionModal />}
    </div>
  );
};

export default ManageMedication;
