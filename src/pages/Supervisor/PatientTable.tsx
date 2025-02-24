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

import {
  mockCaregiverID,
  mockPatientTDList,
} from "@/mocks/mockPatientTableData";

import useDebounce from "@/hooks/useDebounce";
import AvatarModalWrapper from "@/components/AvatarModalWrapper";
import {
  fetchAllPatientTD,
  PatientTableData,
  PatientTableDataServer,
} from "@/api/patients/patients";

const PatientTable: React.FC = () => {
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
  const [tabValue, setTabValue] = useState("all");
  const debouncedActiveStatus = useDebounce(activeStatus, 300);
  const debouncedSearch = useDebounce(searchItem, 300);
  const debounceTabValue = useDebounce(tabValue, 300);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchTerm = e.target.value;
      setSearchItem(searchTerm);
    },
    []
  );

  const sortByName = (data: PatientTableData[], direction: "asc" | "desc") => {
    return [...data].sort((a, b) => {
      if (a.name < b.name) return direction === "asc" ? -1 : 1;
      if (a.name > b.name) return direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const handleFilter = async (pageNo: number) => {
    try {
      const fetchedPatientTDServer: PatientTableDataServer =
        import.meta.env.MODE === "development" ||
        import.meta.env.MODE === "production"
          ? await fetchAllPatientTD(pageNo)
          : mockPatientTDList;

      let filteredPatientTDList = fetchedPatientTDServer.patients.filter(
        (ptd: PatientTableData) =>
          ptd.name.toLowerCase().includes(searchItem.toLowerCase())
      );

      filteredPatientTDList = filteredPatientTDList.filter(
        (ptd: PatientTableData) =>
          activeStatus === "All" ? true : ptd.status === activeStatus
      );

      filteredPatientTDList = filteredPatientTDList.filter(
        (ptd: PatientTableData) =>
          tabValue === "my_patients" && mockCaregiverID !== null
            ? ptd.supervisorId === mockCaregiverID
            : true
      );

      const sortedPatientTDList = sortByName(filteredPatientTDList, "asc");

      setPatientTDServer({
        patients: sortedPatientTDList,
        pagination: fetchedPatientTDServer.pagination,
      });
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  useEffect(() => {
    handleFilter(patientTDServer.pagination.pageNo || 0);
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

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Searchbar searchItem={searchItem} onSearchChange={handleInputChange} />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs value={tabValue} onValueChange={setTabValue}>
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">All Patients</TabsTrigger>
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
            <TabsContent value="all">
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
                    viewMoreBaseLink={"/supervisor/view-patient"}
                    activeTab={"information"}
                    fetchData={handleFilter}
                  />
                </CardContent>
              </Card>
            </TabsContent>
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
    </div>
  );
};

export default PatientTable;
