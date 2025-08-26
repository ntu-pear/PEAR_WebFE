import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ListFilter, PlusCircle } from "lucide-react";
import { DataTableClient } from "@/components/Table/DataTable";
import { ActivityTableData, mockActivitiesList } from "@/mocks/mockActivities";
import { Button } from "@/components/ui/button";
import Searchbar from "@/components/Searchbar";
import { useModal } from "@/hooks/useModal";
import AddActivityModal from "@/components/Modal/Add/AddActivityModal";
import useDebounce from "@/hooks/useDebounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditActivityModal from "@/components/Modal/Edit/EditActivityModal";
import DeleteActivityModal from "@/components/Modal/Delete/DeleteActivityModal";

const ManageActivities: React.FC = () => {
  const { openModal, activeModal } = useModal();

  const [activities, setActivities] =
    useState<ActivityTableData[]>(mockActivitiesList);
  const booleanOptions = [
    { key: "All", value: "all" },
    { key: "Yes", value: "true" },
    { key: "No", value: "false" },
  ];

  const [search, setSearch] = useState<string>("");
  const [compulsory, setCompulsory] = useState<string>("all");
  const [fixed, setFixed] = useState<string>("all");
  const [group, setGroup] = useState<string>("all");
  const debouncedSearch = useDebounce(search, 300);
  const debouncedCompulsory = useDebounce(compulsory, 300);
  const debouncedFixed = useDebounce(fixed, 300);
  const debouncedGroup = useDebounce(group, 300);
  const fetchActivities = () => {
    let filteredActivities = mockActivitiesList.filter(
      ({ title, isCompulsory, isFixed, isGroup }) =>
        title.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
        (debouncedCompulsory === "all"
          ? true
          : isCompulsory.toString() === debouncedCompulsory) &&
        (debouncedFixed === "all"
          ? true
          : isFixed.toString() === debouncedFixed) &&
        (debouncedGroup === "all"
          ? true
          : isGroup.toString() === debouncedGroup)
    );

    setActivities(filteredActivities);
  };
  useEffect(() => {
    fetchActivities();
  }, [debouncedSearch, debouncedCompulsory, debouncedFixed, debouncedGroup]);

  const renderFilter = (
    title: string,
    value: string,
    setValue: (value: string) => void
  ) => (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <ListFilter className="h-4 w-4" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            {title}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={value} onValueChange={setValue}>
          {booleanOptions.map(({ key, value }) => (
            <DropdownMenuRadioItem value={value}>{key}</DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const columns = [
    { key: "title", header: "Title" },
    { key: "description", header: "Description" },
    {
      key: "isCompulsory",
      header: "Compulsory",
      render: (value: any) =>
        value ? (
          <span style={{ color: "green" }}>Yes</span>
        ) : (
          <span style={{ color: "red" }}>No</span>
        ),
    },
    {
      key: "isFixed",
      header: "Fixed",
      render: (value: any) =>
        value ? (
          <span style={{ color: "green" }}>Yes</span>
        ) : (
          <span style={{ color: "red" }}>No</span>
        ),
    },
    {
      key: "isGroup",
      header: "Group",
      render: (value: any) =>
        value ? (
          <span style={{ color: "green" }}>Yes</span>
        ) : (
          <span style={{ color: "red" }}>No</span>
        ),
    },
    {
      key: "fixedTimeSlots",
      header: "Fixed Time Slots",
      render: (value: any) => (value ? value : <span>NIL</span>),
    },
    {
      key: "startDate",
      header: "Start Date",
      className: "hidden md:table-cell",
    },
    { key: "endDate", header: "End Date", className: "hidden md:table-cell" },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <div className="flex justify-between items-center">
          <Searchbar
            searchItem={search}
            onSearchChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex space-x-2">
            {renderFilter("Compulsory", compulsory, setCompulsory)}
            {renderFilter("Fixed", fixed, setFixed)}
            {renderFilter("Group", group, setGroup)}
          </div>
        </div>

        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-end">
                <div className="space-y-1.5">
                  <CardTitle>Manage Activities</CardTitle>
                  <CardDescription>
                    Manage activities for patients
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  className="h-8 gap-1"
                  onClick={() => openModal("addActivity")}
                >
                  <PlusCircle className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Centre Activity
                  </span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className='className="overflow-x-auto"'>
              <DataTableClient
                data={activities}
                columns={columns}
                viewMore={false}
                renderActions={(item) => (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        openModal("editActivity", { activityId: item.id })
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        openModal("deleteActivity", { activityId: item.id })
                      }
                    >
                      Delete
                    </Button>
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </main>
      </div>
      {activeModal.name == "addActivity" && <AddActivityModal />}
      {activeModal.name == "editActivity" && <EditActivityModal />}
      {activeModal.name == "deleteActivity" && <DeleteActivityModal />}
    </div>
  );
};

export default ManageActivities;
