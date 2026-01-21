import React, { useEffect, useState } from "react";
import { ListFilter, PlusCircle } from "lucide-react";
import Searchbar from "@/components/Searchbar";
import useDebounce from "@/hooks/useDebounce";
import { DataTableClient } from "@/components/Table/DataTable";
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
import {
  addListItem,
  deleteListItem,
  fetchListItems,
  ListItem,
  updateListItem,
} from "@/api/patients/lists";
import { useModal } from "@/hooks/useModal";
import { toast } from "sonner";
import AddListItemModal from "@/components/Modal/Add/AddListItemModal";
import EditListItemModal from "@/components/Modal/Edit/EditListItemModal";
import DeleteListItemModal from "@/components/Modal/Delete/DeleteListItemModal";

const ManageLists: React.FC = () => {
  const { activeModal, openModal } = useModal();

  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>(mockListTypes[0]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);
  const debouncedSelectedType = useDebounce(selectedType, 250);

  const fetchListItemsData = () => {
    fetchListItems(debouncedSelectedType).then((data) => {
      setListItems(
        data.filter(
          (item) =>
            !item.isDeleted || item.isDeleted === "0" &&
            item.value.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
      );
    });
  };

  useEffect(() => {
    fetchListItemsData();
  }, [debouncedSelectedType, debouncedSearch]);

  const handleAdd = async (type: string, value: string) => {
    await addListItem({ type, value })
      .then(() => {
        fetchListItemsData();
        toast.success("Successfully added item.");
      })
      .catch(() => toast.error("Failed to add item."));
  };

  const handleEdit = async (type: string, id: string, value: string) => {
    await updateListItem({ type, id, value })
      .then(() => {
        fetchListItemsData();
        toast.success("Successfully updated item.");
      })
      .catch(() => toast.error("Failed to update item."));
  };

  const handleDelete = async (type: string, id: string) => {
    await deleteListItem({ type, id })
      .then(() => {
        fetchListItemsData();
        toast.success("Successfully deleted item.");
      })
      .catch(() => toast.error("Failed to delete item."));
  };

  const columns = [
    {
      key: "value",
      header: "Value",
      className: "truncate w-full",
      render: (value: string, _listItem: ListItem) => (
        <span title={value}>{value}</span>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
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
                  List Type
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={selectedType}
                onValueChange={setSelectedType}
              >
                {mockListTypes.map((type) => (
                  <DropdownMenuRadioItem key={type} value={type}>
                    {type}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Card className="ml-4 sm:ml-6 px-4 py-2">
          <CardHeader>
            <div className="flex justify-between items-end">
              <div className="space-y-1.5">
                <CardTitle>Manage Lists</CardTitle>
                <CardDescription>
                  Select a list and add, edit, or delete its items.
                </CardDescription>
              </div>
              <Button
                size="sm"
                className="h-8 gap-1"
                onClick={() =>
                  openModal("addListItem", {
                    type: debouncedSelectedType,
                    onSave: handleAdd,
                    existingItems: listItems.map(({ value }) => value),
                  })
                }
              >
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Item
                </span>
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <DataTableClient<ListItem>
              data={listItems}
              columns={columns}
              viewMore={false}
              hideActionsHeader
              renderActions={(row) => (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      openModal("editListItem", {
                        type: debouncedSelectedType,
                        listItem: row,
                        onSave: handleEdit,
                        existingItems: listItems.map(({ value }) => value),
                      })
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() =>
                      openModal("deleteListItem", {
                        type: debouncedSelectedType,
                        listItem: row,
                        onDelete: handleDelete,
                      })
                    }
                  >
                    Delete
                  </Button>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {activeModal.name === "addListItem" && <AddListItemModal />}
      {activeModal.name === "editListItem" && <EditListItemModal />}
      {activeModal.name === "deleteListItem" && <DeleteListItemModal />}
    </div>
  );
};

export default ManageLists;
