import {
  DoctorNoteTDServer,
  fetchDoctorNotes,
} from "@/api/patients/doctorNote";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DataTableServer } from "../Table/DataTable";
import { useAuth } from "@/hooks/useAuth";

const DoctorNotesCard: React.FC = () => {
  const { id } = useViewPatient();
  const { currentUser } = useAuth();

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
        pageNo
      );

      setDoctorNotes(fetchedDoctorNotes);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to fetch patient doctor notes");
    }
  };

  useEffect(() => {
    handleFetchDoctorNotes(doctorNotes.pagination.pageNo || 0);
  }, []);

  const doctorNotesColumns = [
    { key: "date", header: "Date" },
    { key: "doctorName", header: "Doctor's Name" },
    { key: "notes", header: "Notes" },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Doctor's Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTableServer
            data={doctorNotes.doctornotes}
            pagination={doctorNotes.pagination}
            fetchData={handleFetchDoctorNotes}
            columns={doctorNotesColumns}
            viewMore={false}
            hideActionsHeader={currentUser?.roleName !== "DOCTOR"}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default DoctorNotesCard;
