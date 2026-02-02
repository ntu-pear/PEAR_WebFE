import {
  DoctorNoteTD,
  DoctorNoteTDServer,
  fetchDoctorNotes,
} from "@/api/patients/doctorNote";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DataTableServer } from "../Table/DataTable";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import { Button } from "../ui/button";
import { PlusCircle } from "lucide-react";

const DoctorNotesCard: React.FC = () => {
  const { id } = useViewPatient();
  const { currentUser } = useAuth();
  const { openModal } = useModal();

  const [doctorNotes, setDoctorNotes] = useState<DoctorNoteTDServer>({
    doctornotes: [],
    pagination: {
      pageNo: 0,
      pageSize: 0,
      totalRecords: 0,
      totalPages: 0,
    },
  });

  const handleFetchDoctorNotes = async (pageNo: number) => {
    if (!id || isNaN(Number(id))) return;
    try {
      const fetchedDoctorNotes: DoctorNoteTDServer = await fetchDoctorNotes(
        Number(id),
        currentUser?.roleName.toLowerCase() as string,
        pageNo
      );

      setDoctorNotes(fetchedDoctorNotes);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch patient doctor notes");
    }
  };

  useEffect(() => {
    refreshDoctorNotes();
  }, []);

  const refreshDoctorNotes = () => {
    handleFetchDoctorNotes(doctorNotes.pagination.pageNo || 0);
  };

  const doctorNotesColumns = [
    { key: "date", header: "Date" },
    { key: "doctorName", header: "Doctor's Name" },
    { key: "notes", header: "Notes" },
  ];

  const renderActions = (item: DoctorNoteTD) => {
    return (
      currentUser?.roleName === "DOCTOR" && (
        <div className="flex space-x-2 w-[75px] sm:w-[150px]">
          <Button
            size="sm"
            className="mt-3"
            onClick={() =>
              openModal("editDoctorNote", {
                noteId: item.id,
                patientId: id,
                submitterId: currentUser.userId,
                refreshData: refreshDoctorNotes,
              })
            }
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="mt-3"
            onClick={() =>
              openModal("deleteDoctorNote", {
                noteId: item.id,
                refreshData: refreshDoctorNotes,
              })
            }
          >
            Delete
          </Button>
        </div>
      )
    );
  };
  if (currentUser?.roleName === "GUARDIAN") {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Doctor's Notes</span>
            {currentUser?.roleName === "DOCTOR" && (
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() =>
                  openModal("addDoctorNote", {
                    patientId: id,
                    submitterId: currentUser?.userId,
                    refreshData: refreshDoctorNotes,
                  })
                }
              >
                <PlusCircle className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add
                </span>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTableServer
            data={doctorNotes.doctornotes}
            pagination={doctorNotes.pagination}
            fetchData={handleFetchDoctorNotes}
            columns={doctorNotesColumns}
            viewMore={false}
            renderActions={renderActions}
            hideActionsHeader={currentUser?.roleName !== "DOCTOR"}
            className={
              currentUser?.roleName === "DOCTOR"
                ? `
                  w-full max-w-full table-fixed overflow-x-auto overflow-y-hidden box-border p-6
                  [&_th:first-child]:w-[15%] [&_th:first-child]:
                  [&_td:first-child]:w-[15%] [&_td:first-child]:py-6
                  [&_th:nth-child(2)]:w-[15%] [&_th:nth-child(2)]:
                  [&_td:nth-child(2)]:w-[15%] [&_td:nth-child(2)]:py-6
                  [&_th:nth-child(3)]:w-[55%] [&_th:nth-child(3)]:
                  [&_td:nth-child(3)]:w-[55%] [&_td:nth-child(3)]:py-6
                  [&_th:last-child]:w-[auto]
                  [&_td:last-child]:flex [&_td:last-child]:justify-start [&_td:last-child]:items-center [&_td:last-child]:px-2 [&_td:last-child]:my-6 [&_td]:break-words [&_td]:whitespace-normal [&_td]:min-w-0 [&_td]:
                  [&_td]:max-h-[3rem] [&_td]:overflow-hidden
                `
                : `
                 [&_td:first-child]:py-6
                 [&_td:nth-child(2)]:py-6
                 [&_td:last-child]:py-6
                `
            }
          />
        </CardContent>
      </Card>
    </>
  );
};

export default DoctorNotesCard;
