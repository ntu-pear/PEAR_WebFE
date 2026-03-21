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
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"allPatients" | "myPatients">("allPatients");

  const debouncedSearch = useDebounce(search, 300);
  const debouncedRole = useDebounce(role, 300);

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
        await fetchAllPatientTD(debouncedSearch, "1", pageNo);

      const filteredPatientTDList = fetchedPatientTDServer.patients.filter(
        (ptd: PatientTableData) =>
          debouncedRole === "myPatients" && mockCaregiverID !== null
            ? (ptd.caregiverId ?? 0) === mockCaregiverID
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
  }, [debouncedSearch, debouncedRole]);

  const [expandedPatientIds, setExpandedPatientIds] = useState<number[]>([]);

  const handleExpandPatient = async (patient: PatientTableData) => {
    const patientId = Number(patient.id);

    if (expandedPatientIds.includes(patientId)) {
      setExpandedPatientIds((prev) =>
        prev.filter((id) => id !== patientId)
      );
      return;
    }

    setExpandedPatientIds((prev) => [...prev, patientId]);
  };

  const roleOptions = [
    { key: "All Patients", value: "allPatients" },
    { key: "My Patients", value: "myPatients" },
  ];

  const getFilterLabel = <T extends string>(
    currentValue: T,
    options: { key: string; value: T }[]
  ): string => {
    const found = options.find((o) => o.value === currentValue);
    return found ? found.key : "";
  };

  const hasActiveFilters = role !== "allPatients" || search !== "";

  const clearFilters = () => {
    setRole("allPatients");
    setSearch("");
  };

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
    { key: "startDate", header: "Start Date", className: "hidden md:table-cell" },
    { key: "endDate", header: "End Date", className: "hidden md:table-cell" },
  ];

  const renderExpandedContent = (patient: PatientTableData) => (
    <MedicationTable patient={patient} openModal={openModal} />
  );

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">

      {/* SAME STRUCTURE AS CENTRE ACTIVITIES */}
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">

        {/* HEADER */}
        <div className="flex justify-between items-center">

          {/* SEARCH (LEFT) */}
          <div className="w-full md:max-w-md">
            <Searchbar
              searchItem={search}
              onSearchChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* FILTERS (RIGHT) */}
          <div className="flex space-x-2">

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-8 gap-1 ${
                    role !== "allPatients"
                      ? "border-primary text-primary"
                      : ""
                  }`}
                >
                  <ListFilter className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Role: {getFilterLabel(role, roleOptions)}
                  </span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={role} onValueChange={(value) => setRole(value as "allPatients" | "myPatients")}>
                  {roleOptions.map((opt) => (
                    <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                      {opt.key}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>

        {/* TABLE */}
        <main className="flex-1 items-start gap-4 p-4 sm:px-0 sm:py-0">
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
        </main>

      </div>

      {activeModal.name === "addMedication" && <AddMedicationModal />}
      {activeModal.name === "deleteMedication" && <DeleteMedicationModal />}
      {activeModal.name === "editMedication" && <EditMedicationModal />}
    </div>
  );
};

export default ManageMedication;