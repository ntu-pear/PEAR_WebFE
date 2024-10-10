import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Header from "@/components/Header/Header";
import DataTable from "@/components/Table/DataTable";
import { mockActivitiesList, ActivitiesData } from "@/mocks/mockActivities";
import { Button } from "@/components/ui/button";

const ManageActivities: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal ref to detect outside clicks
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Function to open the modal
  const openModal = () => setIsModalOpen(true);

  // Function to close the modal
  const closeModal = () => setIsModalOpen(false);

  // Close the modal if clicking outside the modal content
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Form submitted!");
    closeModal(); 
  };

  const handleInputChange = () => { };

  const columns = [
    { key: "title", header: "Patient Id" },
    { key: "description", header: "Activity Description" },
    {
      key: "isCompulsory",
      header: "Compulsory",
      render: (value: any, item: ActivitiesData) =>
        item.isCompulsory ? (
          <span style={{ color: "green" }}>True</span>
        ) : (
          <span style={{ color: "red" }}>False</span>
        ),
    },
    {
      key: "isFixed",
      header: "Fixed",
      render: (value: any, item: ActivitiesData) =>
        item.isFixed ? (
          <span style={{ color: "green" }}>True</span>
        ) : (
          <span style={{ color: "red" }}>False</span>
        ),
    },
    {
      key: "isGroup",
      header: "Group",
      render: (value: any, item: ActivitiesData) =>
        item.isGroup ? (
          <span style={{ color: "green" }}>True</span>
        ) : (
          <span style={{ color: "red" }}>False</span>
        ),
    },
    {
      key: "fixedTimeSlots",
      header: "Fixed Time Slots",
      render: (value: any, item: ActivitiesData) =>
        item.fixedTimeSlots ? (
          item.fixedTimeSlots
        ) : (
          <span>NIL</span>
        ),
    },
    { key: "startDate", header: "Start Date" },
    { key: "endDate", header: "End Date" },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col min-w-[1400px] max-w-[1400px] container mx-auto px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header onSearchChange={handleInputChange} />

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0">
          <div className="ml-auto">
            <Button size="sm" className="h-8 gap-1" onClick={openModal}>
              <PlusCircle className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Centre Activity
              </span>
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Manage Activities</CardTitle>
              <CardDescription>
                Manage activities for patients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={mockActivitiesList}
                columns={columns}
                viewMore={false}
                renderActions={(item) => (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => console.log("Edit", item)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => console.log("Delete", item)}
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

      {/* Add Activity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div ref={modalRef} className="bg-background p-8 rounded-md w-[400px]">
            <h3 className="text-lg font-medium mb-5">Add Centre Activity</h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">
                  Activity Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Activity Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  className="mt-1 block w-full p-2 border rounded-md min-h-[100px] text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Fixed Time Slots <span className="text-red-600">*</span>
                </label>
                <textarea
                  className="mt-1 block w-full p-2 border rounded-md min-h-[100px] text-gray-900"
                  required
                />
              </div>

              <div className="flex space-x-4">
                <div>
                  <label className="block text-sm font-medium">
                    Start Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    End Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Is Compulsory? <span className="text-red-600">*</span>
                </label>
                <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Is Fixed? <span className="text-red-600">*</span>
                </label>
                <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Is Group? <span className="text-red-600">*</span>
                </label>
                <select className="mt-1 block w-full p-2 border rounded-md text-gray-900" required>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageActivities;
