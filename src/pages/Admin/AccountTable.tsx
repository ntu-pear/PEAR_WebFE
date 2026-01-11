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
  exportUsers,
} from "@/api/admin/user";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/utils/formatDate";

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
  const [totalRecords, setTotalRecords] = useState(0);
  const debouncedActiveStatus = useDebounce(activeStatus, 300);
  const debouncedSearch = useDebounce(searchItem, 300);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchTerm = e.target.value;
      setSearchItem(searchTerm);
    },
    []
  );

  // Client-side sorting function
const sortUsers = (users: User[], column: string, direction: "asc" | "desc") => {
  return [...users].sort((a, b) => {
    let aValue = a[column as keyof User];
    let bValue = b[column as keyof User];

    // Special handling for Status field (isDeleted)
    if (column === "isDeleted") {
      aValue = aValue === false ? "Active" : aValue === true ? "Inactive" : "";
      bValue = bValue === false ? "Active" : bValue === true ? "Inactive" : "";
    }

    // Special handling for date fields: push blanks to bottom, sort by actual time
    if (column === "loginTimeStamp" || column === "createdDate") {
      const toMillis = (v: unknown) => {
        if (v == null) return null;
        const s = String(v).trim();
        if (!s) return null;
        const t = Date.parse(s); // expects ISO; if your backend sends non-ISO, adjust parsing here
        return Number.isNaN(t) ? null : t;
      };

      const aMs = toMillis(aValue);
      const bMs = toMillis(bValue);

      const aMissing = aMs == null;
      const bMissing = bMs == null;

      // Always push missing to bottom regardless of direction
      if (aMissing && bMissing) return 0;
      if (aMissing) return 1;
      if (bMissing) return -1;

      // Both valid
      return direction === "asc" ? aMs - bMs : bMs - aMs;
    }

    // Default handling for other fields (string compare)
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === "asc" ? 1 : -1;
    if (bValue == null) return direction === "asc" ? -1 : 1;

    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();

    if (aStr < bStr) return direction === "asc" ? -1 : 1;
    if (aStr > bStr) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

  const handleFilter = async (pageNo: number, pageSize: number) => {
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

      // Backend should always sorts by name, client side will sort by current page locally
      const fetchedAccountTDServer: AccountTableDataServer =
        await fetchUsersByFields(pageNo, pageSize, filteredJsonList, "nric_FullName", "asc");

      console.log("fetchedAccountTDServer", fetchedAccountTDServer);
      
      // Apply client-side sorting if sortBy is set
      let sortedUsers = [...fetchedAccountTDServer.users];
      if (sortBy) {
        sortedUsers = sortUsers(sortedUsers, sortBy, sortDir);
      }
      
      setAccountTDServer({
        ...fetchedAccountTDServer,
        users: sortedUsers
      });

      // Update total records for "All" option
      setTotalRecords(fetchedAccountTDServer.total);
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
    
    // Sort only the current page data locally
    const sortedUsers = sortUsers(accountTDServer.users, column, newSortDir);
    setAccountTDServer({
      ...accountTDServer,
      users: sortedUsers
    });
  };

  const handlePageSizeChange = (newPageSize: number | string) => {
    // Handle "All" option by setting page size to total records
    const actualPageSize = newPageSize === "All" ? totalRecords : Number(newPageSize);
    
    // Reset to first page when changing page size
    const newAccountTDServer = {
      ...accountTDServer,
      page: 0,
      page_size: actualPageSize,
    };
    setAccountTDServer(newAccountTDServer);
    handleFilter(0, actualPageSize);
  };

  // Generate page size options including "All" option
  const getPageSizeOptions = () => {
    const baseOptions = [5, 10, 20, 50, 100];
    
    // Filter out options that are larger than total records
    const filteredOptions = baseOptions.filter(option => option < totalRecords);
    
    // Always include "All" option if there are records
    if (totalRecords > 0) {
      return [...filteredOptions, "All"];
    }
    
    return filteredOptions.length > 0 ? filteredOptions : [5, 10]; // Fallback options
  };

  const handleExport = async () => {
    let loadingToast;
    try {
      // Build the same filters used for the table
      const apiFilterJson = {
        nric_FullName: debouncedSearch,
        isDeleted: "",
      };

      // Map the active field to actual values (same logic as handleFilter)
      if (debouncedActiveStatus === "All") {
        apiFilterJson.isDeleted = "";
      } else if (debouncedActiveStatus === "Active") {
        apiFilterJson.isDeleted = "false";
      } else if (debouncedActiveStatus === "Inactive") {
        apiFilterJson.isDeleted = "true";
      }

      // Remove items that are empty (same logic as handleFilter)
      const filteredJsonList = Object.fromEntries(
        Object.entries(apiFilterJson).filter(([_, value]) => value !== "")
      );

      loadingToast = toast.loading("Exporting users...");
      await exportUsers(filteredJsonList);
      toast.dismiss(loadingToast);
      toast.success("Users exported successfully.");
    } catch (error) {
      if (loadingToast) toast.dismiss(loadingToast);
      toast.error("Failed to export users.");
      console.error("Export error:", error);
    }
  };

  useEffect(() => {
    handleFilter(accountTDServer.page, accountTDServer.page_size);
  }, [debouncedActiveStatus, debouncedSearch]);

  const renderLoginTimeStamp = (loginTimeStamp: string | null) => {
    return formatDateTime(loginTimeStamp);
  };

  const renderCreatedDate = (createdDate: string | null) => {
    return formatDateTime(createdDate);
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
      sortable: true,
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
    {
      key: "createdDate",
      header: "Created Date",
      sortable: true,
      render: renderCreatedDate,
    },
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
              <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
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
                    onPageSizeChange={handlePageSizeChange}
                    pageSizeOptions={getPageSizeOptions()}
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
