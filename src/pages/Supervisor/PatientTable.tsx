import React from "react";
import { ListFilter, File, PlusCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DataTable, { TableRowData } from "@/components/Table/DataTable";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/Header/Header";

interface PatientTableData extends TableRowData {
  name: string;
  preferredName: string;
  nric: string;
  status: string;
  startDate: string;
  endDate: string;
  inactiveDate: string;
}

const PatientTable: React.FC = () => {
  const patients: PatientTableData[] = [
    {
      id: 1,
      name: "Alice Johnson",
      preferredName: "Alice",
      nric: "Sxxxx123A",
      status: "Active",
      startDate: "12 Jun 2024",
      endDate: "12 Dec 2024",
      inactiveDate: "",
    },
    {
      id: 2,
      name: "Bob Smith",
      preferredName: "Bob",
      nric: "Sxxxx456B",
      status: "Inactive",
      startDate: "01 Jul 2021",
      endDate: "01 Jan 2022",
      inactiveDate: "02 Jan 2022"
    },
    {
      id: 3,
      name: "Carol Lee",
      preferredName: "Carol",
      nric: "Sxxxx789C",
      status: "Inactive",
      startDate: "15 Aug 2022",
      endDate: "15 Feb 2023",
      inactiveDate: "16 Feb 2023"
    },
    {
      id: 4,
      name: "David Tan",
      preferredName: "David",
      nric: "Sxxxx012D",
      status: "Active",
      startDate: "22 Sep 2024",
      endDate: "22 Mar 2025",
      inactiveDate: ""
    },
    {
      id: 5,
      name: "Eva Wong",
      preferredName: "Eva",
      nric: "Sxxxx345E",
      status: "Active",
      startDate: "05 Oct 2024",
      endDate: "05 Apr 2025",
      inactiveDate: ""
    }
  ];

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (value: string, patient: PatientTableData) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={`https://api.dicebear.com/6.x/initials/svg?seed=${patient.name}`}
              alt={patient.name}
            />
            <AvatarFallback>
              {patient.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-muted-foreground">{patient.preferredName}</div>
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
    { key: "startDate", header: "Start Date" },
    { key: "endDate", header: "End Date" },
    { key: "inactiveDate", header: "Inactive Date" },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col ">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs defaultValue="all">
            <div className="flex items-center">
              <TabsList>
                <TabsTrigger value="all">All Patients</TabsTrigger>
                <TabsTrigger value="my_patients">My Patients</TabsTrigger>
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
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                      All
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Active
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Inactive</DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <File className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                  </span>
                </Button>
                <Button size="sm" className="h-8 gap-1">
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Patient
                  </span>
                </Button>
              </div>
            </div>
            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>Patients</CardTitle>
                  <CardDescription>
                    Manage your patients and view their details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable data={patients} columns={columns} />
                </CardContent>
                <CardFooter>
                  <div className="text-xs text-muted-foreground">
                    Showing <strong>1-{patients.length}</strong> of{" "}
                    <strong>{patients.length}</strong> patients
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default PatientTable;
