import React, { useCallback, useEffect, useState } from "react";
import { ListFilter, File } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
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
import Searchbar from "@/components/Searchbar";
import { DataTableServer } from "@/components/Table/DataTable";

import useDebounce from "@/hooks/useDebounce";
import {
  AccountTableDataServer,
  fetchUsersByFields,
  User,
} from "@/api/admin/user";
import { Badge } from "@/components/ui/badge";

const AccountTable: React.FC = () => {
  const [accountTDServer, setAccountTDServer] =
    useState<AccountTableDataServer>({
      page: 0,
      page_size: 10,
      total: 0,
      users: [],
    });

  const [activeStatus, setActiveStatus] = useState("All");
  const [searchItem, setSearchItem] = useState("");
  const [tabValue, setTabValue] = useState("all");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const debouncedActiveStatus = useDebounce(activeStatus, 300);
  const debouncedSearch = useDebounce(searchItem, 300);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchTerm = e.target.value;
      setSearchItem(searchTerm);
    },
    []
  );

  const handleFilter = async (pageNo: number, pageSize: number, sortColumn?: string, sortDirection?: "asc" | "desc") => {
    try {
      const apiFilterJson = {
        nric_FullName: debouncedSearch,
        isDeleted: "",
      };

      // map the active field to actual values
      if (debouncedActiveStatus === "All") {
        apiFilterJson.isDeleted = "";
      } else if (debouncedActiveStatus === "Active") {
        apiFilterJson.isDeleted = "false";
      } else if (debouncedActiveStatus === "Inactive") {
        apiFilterJson.isDeleted = "true";
      }

      // remove items that is empty
      const filteredJsonList = Object.fromEntries(
        Object.entries(apiFilterJson).filter(([_, value]) => value !== "")
      );

      // Use provided sort parameters or current state
      const currentSortBy = sortColumn !== undefined ? sortColumn : sortBy;
      const currentSortDir = sortDirection !== undefined ? sortDirection : sortDir;

      const fetchedAccountTDServer: AccountTableDataServer =
        await fetchUsersByFields(pageNo, pageSize, filteredJsonList, currentSortBy, currentSortDir);

      //let filteredAccountTDList = fetchedAccountTDServer.users;

      //const sortedAccountTDList = sortByName(filteredAccountTDList, "asc");
      console.log("fetchedAccountTDServer", fetchedAccountTDServer);
      setAccountTDServer(fetchedAccountTDServer);
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Error fetching accounts: " + error.message);
      } else {
        toast.error("Error fetching accounts");
      }
    }
  };

  const handleSort = (column: string) => {
    const newSortDir = sortBy === column && sortDir === "asc" ? "desc" : "asc";
    setSortBy(column);
    setSortDir(newSortDir);
    handleFilter(accountTDServer.page, accountTDServer.page_size, column, newSortDir);
  };

  useEffect(() => {
    handleFilter(accountTDServer.page, accountTDServer.page_size);
  }, [debouncedActiveStatus, debouncedSearch]);

  const renderLoginTimeStamp = (loginTimeStamp: string | null) => {
    return loginTimeStamp ? loginTimeStamp : "-";
  };

  const columns: {
    key: keyof User;
    header: string;
    sortable?: boolean;
    render?: (value: any) => React.ReactNode;
  }[] = [
    { key: "id", header: "ID", sortable: true },
    { key: "nric_FullName", header: "Name", sortable: true },
    {
      key: "isDeleted",
      header: "Status",
      render: (value: boolean | undefined) => {
        const status =
          value === false ? "Active" : value === true ? "Inactive" : "";

        const variant =
          status === "Active"
            ? "default"
            : status === "Inactive"
              ? "secondary"
              : "outline";

        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    { key: "email", header: "Email", sortable: true },
    {
      key: "loginTimeStamp",
      header: "Last Login",
      sortable: true,
      render: renderLoginTimeStamp,
    },
    { key: "createdDate", header: "Created Date", sortable: true },
    { key: "roleName", header: "Role", sortable: true },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 sm:pr-14">
        <div className="flex items-center">
          <Searchbar
            searchItem={searchItem}
            onSearchChange={handleInputChange}
          />
          <div className="flex items-center gap-2 ml-auto sm:px-6">
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
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Tabs value={tabValue} onValueChange={setTabValue}>
            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Account</CardTitle>
                  <CardDescription>
                    Manage all accounts and view their details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTableServer
                    data={accountTDServer.users}
                    pagination={{
                      pageNo: accountTDServer.page,
                      pageSize: accountTDServer.page_size,
                      totalRecords: accountTDServer.total,
                      totalPages: Math.ceil(
                        accountTDServer.total / accountTDServer.page_size
                      ),
                    }}
                    columns={columns}
                    viewMore={true}
                    viewMoreBaseLink={"/admin/view-account"}
                    activeTab={""}
                    fetchData={handleFilter}
                    sortBy={sortBy}
                    sortDir={sortDir}
                    onSort={handleSort}
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

export default AccountTable;
