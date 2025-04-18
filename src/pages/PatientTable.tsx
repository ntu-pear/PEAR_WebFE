import React, { useCallback, useEffect, useState } from "react";
import { ListFilter, File } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Searchbar from "@/components/Searchbar";
import { DataTableServer } from "@/components/Table/DataTable";

import { mockCaregiverID } from "@/mocks/mockPatientTableData";

import useDebounce from "@/hooks/useDebounce";
import AvatarModalWrapper from "@/components/AvatarModalWrapper";
import {
  fetchAllPatientTD,
  PatientTableData,
  PatientTableDataServer,
} from "@/api/patients/patients";
import { useModal } from "@/hooks/useModal";
import DeletePatientModal from "@/components/Modal/Delete/DeletePatientModal";
import { useAuth } from "@/hooks/useAuth";

const PatientTable: React.FC = () => {
  const { currentUser } = useAuth();
  const hasAccessToAllPatients: boolean = (() => {
    switch (currentUser?.roleName) {
      case "SUPERVISOR":
        return true;
      //temporary
      case "DOCTOR":
        return true;
      default:
        return false;
    }
  })();

  const hasDelete: boolean = currentUser?.roleName === "SUPERVISOR";

  const viewMoreBaseLink: string = (() => {
    switch (currentUser?.roleName) {
      case "SUPERVISOR":
        return "/supervisor/view-patient";
      case "DOCTOR":
        return "/doctor/view-patient";
      default:
        return "";
    }
  })();

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
  const [activeStatus, setActiveStatus] = useState("All");
  const [searchItem, setSearchItem] = useState("");
  const [tabValue, setTabValue] = useState(
    hasAccessToAllPatients ? "all_patients" : "my_patients"
  );
  const debouncedActiveStatus = useDebounce(activeStatus, 300);
  const debouncedSearch = useDebounce(searchItem, 300);
  const debounceTabValue = useDebounce(tabValue, 300);
  const { activeModal, openModal } = useModal();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchTerm = e.target.value;
      setSearchItem(searchTerm);
    },
    []
  );

  const handleFilter = async (pageNo: number) => {
    try {
      const fetchedPatientTDServer: PatientTableDataServer =
        await fetchAllPatientTD(
          debouncedSearch,
          debouncedActiveStatus === "All"
            ? null
            : debouncedActiveStatus === "Active"
              ? "1"
              : "0",
          pageNo
        );

      const filteredPatientTDList = fetchedPatientTDServer.patients.filter(
        (ptd: PatientTableData) =>
          debounceTabValue === "my_patients" && mockCaregiverID !== null
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

  const refreshData = () => {
    handleFilter(patientTDServer.pagination.pageNo || 0);
  };

  // when debounced active, search or tab changes, run refreshData which calls handlefilter
  useEffect(() => {
    refreshData();
  }, [debouncedActiveStatus, debouncedSearch, debounceTabValue]);

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
      key: "status",
      header: "Status",
      render: (value: string) => (
        <Badge
          variant={
            value === "Active"
              ? "default"
              : value === "Inactive"
                ? "secondary"
                : "outline"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "startDate",
      header: "Start Date",
      className: "hidden md:table-cell",
    },
    { key: "endDate", header: "End Date", className: "hidden md:table-cell" },
    {
      key: "inactiveDate",
      header: "Inactive Date",
      className: "hidden md:table-cell",
    },
  ];

  const renderActions = (item: PatientTableData) =>
    hasDelete ? (
      <div className="ml-4 sm:ml-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={() =>
            openModal("deletePatient", {
              patientId: item.id,
              refreshData,
            })
          }
        >
          Delete
        </Button>
      </div>
    ) : null;

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Searchbar searchItem={searchItem} onSearchChange={handleInputChange} />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs
            value={tabValue}
            onValueChange={(val) => hasAccessToAllPatients && setTabValue(val)}
          >
            <div className="flex items-center">
              <TabsList>
                {hasAccessToAllPatients && (
                  <TabsTrigger value="all_patients">All Patients</TabsTrigger>
                )}
                <TabsTrigger value="my_patients">My Patients</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2 ml-auto">
                <div className="flex">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 gap-1">
                        <ListFilter className="h-4 w-4" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                          Filter
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup
                        value={activeStatus}
                        onValueChange={setActiveStatus}
                      >
                        <DropdownMenuRadioItem value="All">
                          All
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="Active">
                          Active
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="Inactive">
                          Inactive
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex">
                  <Button size="sm" variant="outline" className="h-8 gap-1">
                    <File className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Export
                    </span>
                  </Button>
                </div>
              </div>
            </div>
            {hasAccessToAllPatients && (
              <TabsContent value="all_patients">
                <Card>
                  <CardHeader>
                    <CardTitle>Manage Patients</CardTitle>
                    <CardDescription>
                      Manage all patients and view their details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTableServer
                      data={patientTDServer.patients}
                      pagination={patientTDServer.pagination}
                      columns={columns}
                      viewMore={true}
                      viewMoreBaseLink={viewMoreBaseLink}
                      activeTab={"information"}
                      fetchData={handleFilter}
                      renderActions={renderActions}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
            <TabsContent value="my_patients">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Patients</CardTitle>
                  <CardDescription>
                    Manage your patients and view their details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTableServer
                    data={patientTDServer.patients}
                    pagination={patientTDServer.pagination}
                    columns={columns}
                    viewMore={true}
                    viewMoreBaseLink={"viewMoreBaseLink"}
                    activeTab={"information"}
                    fetchData={handleFilter}
                    renderActions={renderActions}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      {hasDelete && activeModal.name === "deletePatient" && (
        <DeletePatientModal />
      )}
    </div>
  );
};

export default PatientTable;
