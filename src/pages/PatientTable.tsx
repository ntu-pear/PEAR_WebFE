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

// import { mockCaregiverID } from "@/mocks/mockPatientTableData";

import useDebounce from "@/hooks/useDebounce";
import AvatarModalWrapper from "@/components/AvatarModalWrapper";
import {
  fetchAllPatientTD,
  fetchDoctorPatientTD,
  fetchSupervisorPatientTD,
  PatientTableData,
  PatientTableDataServer,
} from "@/api/patients/patients";
import { useModal } from "@/hooks/useModal";
import DeletePatientModal from "@/components/Modal/Delete/DeletePatientModal";
import { useAuth } from "@/hooks/useAuth";
import { fetchGuardianPatients } from "@/api/patients/patients";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router";

const PatientTable: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const hasAccessToAllPatients: boolean = (() => {
    switch (currentUser?.roleName) {
      case "SUPERVISOR":
        return true;
      //temporary
      case "DOCTOR":
        return true;
      case "GUARDIAN":
        return false;
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
      case "GUARDIAN":
        return "/guardian/view-patient";
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

      const activeStatus = debouncedActiveStatus === "All" ? null : debouncedActiveStatus === "Active" ? "1" : "0"

      let fetchedPatientTDServer: PatientTableDataServer

      if (debounceTabValue === "all_patients") {
        fetchedPatientTDServer = await fetchAllPatientTD(
          debouncedSearch,
          activeStatus,
          pageNo
        );
      }
      else { //my_patient tab
        if (currentUser?.roleName === "SUPERVISOR") {
          const supervisor_id = String(currentUser.userId)
          fetchedPatientTDServer = await fetchSupervisorPatientTD(
            supervisor_id,
            debouncedSearch,
            activeStatus,
            pageNo
          );
        }
        else {
          const doctor_id = String(currentUser?.userId)
          fetchedPatientTDServer = await fetchDoctorPatientTD(
            doctor_id,
            debouncedSearch,
            activeStatus,
            pageNo
          );
        } 
      }

      setPatientTDServer({
        patients: fetchedPatientTDServer.patients,
        pagination: fetchedPatientTDServer.pagination,
      });
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const handleGuardianFetch = async () => {
    try {
      const guardianId = String(currentUser?.userId)
      const fetchedPatientList = await fetchGuardianPatients(guardianId)
      console.log("guardian fetchedPatientList",fetchedPatientList)
      setPatientTDServer({
        patients: fetchedPatientList.data,
        pagination:{
          pageNo:Number(fetchedPatientList.pageNo),
          pageSize: Number(fetchedPatientList.pageSize),
          totalPages: Number(fetchedPatientList.totalPages),
          totalRecords: Number(fetchedPatientList.totalRecords)
        }
      });

      console.log("From Guardian Patients: ", patientTDServer)
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  }

  const refreshData = () => {
    if (currentUser?.roleName === "GUARDIAN") {
      handleGuardianFetch()
    }
    else {
      handleFilter(patientTDServer.pagination.pageNo || 0);
    }
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

  useEffect(() => {
    if (currentUser?.roleName === "GUARDIAN" && patientTDServer.patients.length > 0 && (!tabValue || !patientTDServer.patients.some(p => p.id.toString() === tabValue))) {
      setTabValue(patientTDServer.patients[0].id.toString())
      console.log(currentUser.userId)
    }
  }, [patientTDServer.patients, currentUser, tabValue])

  if (currentUser?.roleName === "GUARDIAN") {
    return (
      <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <Tabs
            className="px-4 py-2"
            value={tabValue}
            onValueChange={setTabValue}
          >
            <TabsList>
              {patientTDServer.patients.map((patient) => (
                <TabsTrigger
                  key={patient.id}
                  value={patient.id.toString()}
                  className="flex items-center gap-2"
                >
                  <img src={patient.profilePicture} alt={patient.name} className="w-6 h-6 rounded-full"></img>
                  <span>{patient.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {
              patientTDServer.patients.map((patient) => (
                <TabsContent key={patient.id} value={patient.id.toString()} className="p-4">

                  <Card className="ml-4 mr-4 sm:ml-6 sm:mr-6 px-4 py-2">
                    <CardHeader className="flex gap-4">
                      <CardTitle className="">
                        <div className="flex justify-end">
                          <Button className="self-end"
                            onClick={() => { navigate(`${viewMoreBaseLink}/${patient.id}?tab=information`) }}>View More</Button>
                        </div>
                        <div className="flex justify-center">
                          <Avatar className="h-48 w-48">
                            <AvatarImage
                              src={patient?.profilePicture}
                              alt={patient?.name}
                            />
                            <AvatarFallback>
                              <p className="text-5xl">
                                {patient?.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </p>
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </CardTitle>
                      <CardDescription className="self-center text-center">
                        <h1 className="font-bold text-3xl text-gray-600">{patient.name}</h1>
                        <h1 className="font-bold text-xl text-gray-400">{patient.preferredName}</h1>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">

                      <div className="flex flex-col">
                        <h1 className="font-bold text-md">Name on NRIC:</h1>
                        <p>{patient?.name}</p>
                      </div>
                      <div className="flex flex-col">
                        <h1 className="font-bold text-md">Preferred Name:</h1>
                        <p >{patient?.preferredName}</p>
                      </div>
                      <div className="flex flex-col">
                        <h1 className="font-bold text-md">NRIC:</h1>
                        <p>{patient?.nric}</p>
                      </div>
                      <div className="flex flex-col">
                        <h1 className="font-bold text-md">Date Of Birth:</h1>
                        <p>{patient?.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : "N/A"}</p>
                      </div>
                      <div className="flex flex-col">
                        <h1 className="font-bold text-md">Gender:</h1>
                        <p>{patient?.gender === "M"  ? "Male" : "Female"}</p>
                      </div>
                      <div className="flex flex-col">
                        <h1 className="font-bold text-md">Address:</h1>
                        <p>{patient?.address}</p>
                      </div>
                      <div className="flex flex-col">
                        <h1 className="font-bold text-md">Temp Address:</h1>
                        <p>{patient?.tempAddress ? patient.tempAddress : "-"}</p>
                      </div>
                      <div className="flex flex-col">
                        <h1 className="font-bold text-md">Start Date:</h1>
                        <p>{patient?.startDate ? new Date(patient.startDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : "N/A"}</p>
                      </div>
                      <div className="flex flex-col">
                        <h1 className="font-bold text-md">End Date:</h1>
                        <p>{patient?.endDate ? new Date(patient.endDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : "N/A"}</p>
                      </div>
                      <div className="flex flex-col">
                        <h1 className="font-bold text-md">Home No:</h1>
                        <p>{patient?.homeNo ? patient.homeNo : "-"}</p>
                      </div>
                      <div className="flex flex-col">
                        <h1 className="font-bold text-md">Handphone No:</h1>
                        <p>{patient?.handphoneNo ? patient.handphoneNo : "-"}</p>
                      </div>
                    </CardContent>
                  </Card>

                </TabsContent>
              ))
            }
          </Tabs>
        </div>
      </div>
    )
  }
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
                    viewMoreBaseLink={viewMoreBaseLink}
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
