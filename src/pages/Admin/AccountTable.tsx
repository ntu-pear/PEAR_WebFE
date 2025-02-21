import React, { useCallback, useEffect, useState } from 'react';
import { ListFilter, File } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import Searchbar from '@/components/Searchbar';
import { DataTableServer } from '@/components/Table/DataTable';

import useDebounce from '@/hooks/useDebounce';
import AvatarModalWrapper from '@/components/AvatarModalWrapper';
import {
  fetchAllPatientTD,
  PatientTableData,
  PatientTableDataServer,
} from '@/api/patients/patients';

import {
  fetchUsers,
  AccountTableDataServer,
  User,
} from '@/api/admin/user';

import {
  AccountTableData,
  mockAccountTDList,
} from '@/mocks/mockAccountTableData';

const AccountTable: React.FC = () => {
  const [accountTDServer, setAccountTDServer] = useState<User[]>([{
    id: '',
    preferredName: '',
    nric_FullName: '',
    nric: '',
    nric_Address: '',
    nric_DateOfBirth: '',
    nric_Gender: 'F',
    roleName: '',
    contactNo: '',
    allowNotification: false,
    profilePicture: '',
    status: 'ACTIVE',
    email: '',
    emailConfirmed: false,
    verified: false,
    active: false,
    twoFactorEnabled: false,
    lockoutEnabled: false,
    lockoutReason: null,
    createdById: '',
    createdDate: '',
    modifiedById: '',
    modifiedDate: ''
  }]);

  const [activeStatus, setActiveStatus] = useState('All');
  const [searchItem, setSearchItem] = useState('');
  const [tabValue, setTabValue] = useState('all');
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

  const sortByName = (data: User[], direction: 'asc' | 'desc') => {
    return [...data].sort((a, b) => {
      if (a.nric_FullName < b.nric_FullName) return direction === 'asc' ? -1 : 1;
      if (a.nric_FullName > b.nric_FullName) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleFilter = async () => {
    try {
      const fetchedAccountTDServer: User[] =
        import.meta.env.MODE === 'development' ||
        import.meta.env.MODE === 'production'
          ? mockAccountTDList//await fetchAllPatientTD(pageNo)
          : mockAccountTDList;

      let filteredAccountTDList = fetchedAccountTDServer;

      const sortedAccountTDList = sortByName(filteredAccountTDList, 'asc');

      setAccountTDServer(sortedAccountTDList);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  useEffect(() => {
    handleFilter();
  }, [debouncedActiveStatus, debouncedSearch, debounceTabValue]);

  const columns: { key: keyof User; header: string }[] = [
    { key: 'id', header: 'ID' },
    { key: 'nric_FullName', header: 'Name' },
    { key: 'status', header: 'Status' },
    { key: 'email', header: 'Email' },
    { key: 'createdDate', header: 'Created Date' },
    { key: 'roleName', header: 'Role' },
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
                    data={accountTDServer}
                    pagination={{
                      pageNo: 0,
                      pageSize: 0,
                      totalRecords: 0,
                      totalPages: 0,
                    }}
                    columns={columns}
                    viewMore={true}
                    viewMoreBaseLink={'/supervisor/view-patient'}
                    activeTab={'information'}
                    fetchData={handleFilter}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            {/* <TabsContent value="my_patients">
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
                    viewMoreBaseLink={'/supervisor/view-patient'}
                    activeTab={'information'}
                    fetchData={handleFilter}
                  />
                </CardContent>
              </Card>
            </TabsContent> */}
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AccountTable;
