import React, { useEffect, useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";

const ManageLists: React.FC = () => {
  const { activeModal, openModal } = useModal();

  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [selectedType, setSelectedType] = useState<string>(mockListTypes[0]);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 250);
  const debouncedSelectedType = useDebounce(selectedType, 250);

  type ListItemUpsert = {
    value: string;
    typeCode?: string;
    description?: string;
    isEnabled?: boolean;
  };

  const fetchListItemsData = () => {
    fetchListItems(debouncedSelectedType).then((data) => {
      setListItems(
        data.filter(
          (item) =>
            (!item.isDeleted || item.isDeleted === "0") &&
            item.value.toLowerCase().includes(debouncedSearch.toLowerCase())
        )
      );
    });
  };

  useEffect(() => {
    fetchListItemsData();
  }, [debouncedSelectedType, debouncedSearch]);

  const handleAdd = async (type: string, payload: ListItemUpsert) => {
    await addListItem({ type, ...payload })
      .then(() => {
        fetchListItemsData();
        toast.success("Successfully added item.");
      })
      .catch(() => toast.error("Failed to add item."));
  };

  const handleEdit = async (type: string, id: string, payload: ListItemUpsert) => {
    await updateListItem({ type, id, ...payload })
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

  const columns = useMemo(() => {
    if (debouncedSelectedType === "Highlight") {
      return [
        {
          key: "value",
          header: "Name",
          sortable: true,
        },
        {
          key: "typeCode",
          header: "Code",
          sortable: true,
        },
        {
          key: "description",
          header: "Description",
          sortable: false,
        },
        {
          key: "isEnabled",
          header: "Enabled",
          sortable: true,
          render: (v: boolean | undefined) => (v ? "Yes" : "No"),
        },
      ];
    }

    return [
      {
        key: "value",
        header: `Item`,
        className: "truncate w-full",
        sortable: true,
        render: (value: string) => <span title={value}>{value}</span>,
      },
    ];
  }, [debouncedSelectedType]);

  return (
    <div className="flex min-h-screen w-full flex-col mx-auto w-full max-w-5xl px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Searchbar
            searchItem={search}
            onSearchChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${debouncedSelectedType.toLowerCase()} items...`}
          />

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-sm font-medium text-muted-foreground">
              Active List:
            </span>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-4 w-4" />
                  <span>{selectedType}</span>
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
        </div>

        <Card className="ml-4 sm:ml-6 px-4 py-2">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CardTitle>Manage Lists</CardTitle>
                  <Badge
                    variant="secondary"
                    className="h-8 px-4 text-base font-semibold leading-none"
                  >
                    {debouncedSelectedType}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <CardDescription>
                    Viewing all values currently configured under the{" "}
                    <span className="font-medium text-foreground">
                      {debouncedSelectedType}
                    </span>{" "}
                    list.
                    <br />
                    Add, edit, or remove individual list items below.
                  </CardDescription>
                </div>
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
                <span className="whitespace-nowrap">
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
                        existingItems: listItems
                          .filter((i) => i.id !== row.id)
                          .map((i) => i.value),
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

      {activeModal.name === "addListItem" && <AddListItemModal />}
      {activeModal.name === "editListItem" && <EditListItemModal />}
      {activeModal.name === "deleteListItem" && <DeleteListItemModal />}
    </div>
  );
};

export default ManageLists;