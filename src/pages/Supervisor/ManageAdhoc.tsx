import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Header from "@/components/Header";
import DataTable from "@/components/Table/DataTable";
import { mockAdhocActivityList } from "@/mocks/mockAdhocActivity";
import { Button } from "@/components/ui/button";

const ManageAdhoc: React.FC = () => {
  const handleInputChange = () => {};

  const columns = [
    { key: "updatedTime", header: "Last Updated" },
    { key: "patientId", header: "Patient Id" },
    { key: "startDate", header: "Start Date" },
    { key: "endDate", header: "End Date" },
    { key: "oldActivityTitle", header: "Old Activity" },
    { key: "oldActivityDescription", header: "Old Activity Description" },
    { key: "newActivityTitle", header: "New Activity" },
    { key: "newActivityDescription", header: "New Activity Description" },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col min-w-[1400px] max-w-[1400px] container mx-auto px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <Header onSearchChange={handleInputChange} />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Manage Adhoc</CardTitle>
              <CardDescription>
                Manage adhoc activities for patients
              </CardDescription>
            </CardHeader>
            <CardContent>
              {" "}
              <DataTable
                data={mockAdhocActivityList}
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
    </div>
  );
};

export default ManageAdhoc;
