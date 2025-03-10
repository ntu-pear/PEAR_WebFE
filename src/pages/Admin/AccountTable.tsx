import React, { useCallback, useEffect, useState } from "react";
import { ListFilter, File } from "lucide-react";
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
import { AccountTableDataServer, fetchUsers, fetchUsersByFields, User } from "@/api/admin/user";

import {
  mockAccountTDList,
} from "@/mocks/mockAccountTableData";

const AccountTable: React.FC = () => {
  const [accountTDServer, setAccountTDServer] = useState<AccountTableDataServer>({
    pageNo: 0,
    pageSize: 0,
    total: 0,
    data: []});

  const [activeStatus, setActiveStatus] = useState("All");
  const [searchItem, setSearchItem] = useState("");
  const [tabValue, setTabValue] = useState("all");
  const debouncedActiveStatus = useDebounce(activeStatus, 300);
  const debouncedSearch = useDebounce(searchItem, 300);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchTerm = e.target.value;
      setSearchItem(searchTerm);
    },
    []
  );

  const sortByName = (data: User[], direction: "asc" | "desc") => {
    return [...data].sort((a, b) => {
      if (a.nric_FullName < b.nric_FullName)
        return direction === "asc" ? -1 : 1;
      if (a.nric_FullName > b.nric_FullName)
        return direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const handleFilter = async (pageNo: number, pageSize: number) => {
    try {
      const fetchedAccountTDServer: AccountTableDataServer =
        import.meta.env.MODE === "development" ||
        import.meta.env.MODE === "production"
          ? await fetchUsersByFields(pageNo, pageSize, {})
          : mockAccountTDList;

      let filteredAccountTDList = fetchedAccountTDServer;

      const sortedAccountTDList = sortByName(filteredAccountTDList, "asc");

      setAccountTDServer(sortedAccountTDList);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  useEffect(() => {
    handleFilter(accountTDServer.pageNo, accountTDServer.pageSize);
  }, [debouncedActiveStatus, debouncedSearch]);

  const renderLoginTimeStamp = (loginTimeStamp: string | null) => {
    return loginTimeStamp ? loginTimeStamp : "-";
  };

  const columns: { key: keyof User ; header: string; render?: (value: any) => React.ReactNode }[] = [
    { key: "id", header: "ID" },
    { key: "nric_FullName", header: "Name" },
    { key: "status", header: "Status" },
    { key: "email", header: "Email" },
    { key: "loginTimeStamp", header: "Last Login", render: renderLoginTimeStamp },
    { key: "createdDate", header: "Created Date" },
    { key: "roleName", header: "Role" },
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
                    data={accountTDServer}
                    pagination={{
                      pageNo: 0,
                      pageSize: 0,
                      totalRecords: 0,
                      totalPages: 0,
                    }}
                    columns={columns}
                    viewMore={true}
                    viewMoreBaseLink={"/admin/view-account"}
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

export default AccountTable;
