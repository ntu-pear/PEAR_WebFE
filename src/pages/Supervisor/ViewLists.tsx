import React, { useEffect, useState } from "react";
import { Info, ListFilter } from "lucide-react";
import Searchbar from "@/components/Searchbar";
import useDebounce from "@/hooks/useDebounce";
import { fetchListItems, ListItem } from "@/api/patients/lists";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { mockListTypes } from "@/mocks/mockLists";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTableClient } from "@/components/Table/DataTable";

const ViewLists: React.FC = () => {
  const [listItems, setListItems] = useState<ListItem[]>([]);

  const [selectedType, setSelectedType] = useState<string>(
    mockListTypes[0].type
  );
  const [search, setSearch] = useState<string>("");
  const debouncedSelectedType = useDebounce(selectedType, 300);
  const debouncedSearch = useDebounce(search, 300);

  const fetchListItemsData = () => {
    fetchListItems(debouncedSelectedType).then((data) => {
      setListItems(
        data.filter((item) =>
          item.value.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
      );
    });
  };
  useEffect(() => {
    fetchListItemsData();
  }, [debouncedSelectedType, debouncedSearch]);

  const columns = [
    {
      key: "value",
      header: "Value",
      className: "truncate",
      render: (value: string, _listItem: ListItem) => (
        <span title={value}>{value}</span>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <div className="rounded-xl border bg-muted/40 p-4 flex gap-3 sm:ml-6">
          <div className="mt-0.5">
            <Info className="h-5 w-5" />
          </div>
          <div className="text-sm leading-5">
            <div className="font-medium">
              Need to add, edit, or delete a list item?
            </div>
            Please contact the
            <span className="font-semibold"> System Administrator </span>
            to request changes to this list.
          </div>
        </div>
        <div className="flex justify-between items-center">
          <Searchbar
            searchItem={search}
            onSearchChange={(e) => setSearch(e.target.value)}
          />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ListFilter className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  {selectedType}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={selectedType}
                onValueChange={setSelectedType}
              >
                {mockListTypes.map(({ type }) => (
                  <DropdownMenuRadioItem value={type}>
                    {type}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Card className="ml-4 sm:ml-6 px-4 py-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              View Lists
            </CardTitle>
            <CardDescription>Select a list to view its items.</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTableClient
              data={listItems}
              columns={columns}
              viewMore={false}
              hideActionsHeader={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewLists;
