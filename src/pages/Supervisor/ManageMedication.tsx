import React, { useState, useEffect } from "react";
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
import { useModal } from "@/hooks/useModal";
import MedicationTable from "@/components/Table/MedicationTable";
import AddMedicationModal from "@/components/Modal/Add/AddMedicationModal";
import DeleteMedicationModal from "@/components/Modal/Delete/DeleteMedicationModal";
import EditMedicationModal from "@/components/Modal/Edit/EditMedicationModal";

const ManageMedication: React.FC = () => {
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
  const [expandedPatientIds, setExpandedPatientIds] = useState<number[]>([]);

  const handleExpandPatient = async (patient: PatientTableData) => {
    const patientId = Number(patient.id);

    if (expandedPatientIds.includes(patientId)) {
      setExpandedPatientIds((prevIds) =>
        prevIds.filter((id) => id !== patientId)
      );

      return;
    }

    setExpandedPatientIds((prevIds) => prevIds.concat(patientId));
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

  const renderExpandedContent = (patient: PatientTableData) => (
    <MedicationTable patient={patient} openModal={openModal} />
  );

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
                    expandable={true}
                    renderExpandedContent={renderExpandedContent}
                    onExpand={handleExpandPatient}
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
                    expandable={true}
                    renderExpandedContent={renderExpandedContent}
                    onExpand={handleExpandPatient}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {activeModal.name === "addMedication" && <AddMedicationModal />}
      {activeModal.name === "deleteMedication" && <DeleteMedicationModal />}
      {activeModal.name === "editMedication" && <EditMedicationModal />}
    </div>
  );
};

export default ManageMedication;
