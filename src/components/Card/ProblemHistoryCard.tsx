import { useModal } from "@/hooks/useModal";
import { PlusCircle } from "lucide-react";
import { DataTableServer } from "../Table/DataTable";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { fetchPatientProblemLog, ProblemLogTD, ProblemLogTDServer } from "@/api/patients/problemLog";
import { useEffect, useState } from "react";
import { toast } from "sonner";


const ProblemHistoryCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const { id, patientAllocation } = useViewPatient()
  const [problemLogsList, setProblemLogsList] = useState<ProblemLogTDServer>({
    problem_log: [],
    pagination: {
      pageNo: 0,
      pageSize: 5,
      totalRecords: 0,
      totalPages: 0
    }
  })
  const problemLogColumns = [
    { key: "ProblemName", header: "Problem Name" },
    { key: "SourceOfInformation", header: "Source of Information" },
    { key: "ProblemRemarks", header: "Remarks" },
    { key: "DateOfDiagnosis", header: "Date of Diagnosis" }
  ];

  const fetchProblemLog = async (pageNo: number, pageSize: number) => {
    try {
      const problemLog = await fetchPatientProblemLog(Number(id), pageNo, pageSize)
      console.log(problemLog)
      setProblemLogsList(problemLog)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to fetch patient Problem Log. ${error}`)
      } else {
        toast.error("Failed to fetch patient Problem Log.")
      }
      console.error("Failed to fetch patient Problem Log")
    }
  }

  useEffect(() => {
    fetchProblemLog(problemLogsList.pagination.pageNo || 0, problemLogsList.pagination.pageSize || 10)
  }, [])

  const renderAction = (problemLog: ProblemLogTD) => {
    return (
      (currentUser?.roleName === "SUPERVISOR") && (
        <div className="flex space-x-2">
          <Button
            size="sm"
            className="mt-3"
            onClick={() =>
              openModal("editProblem", {
                problemLog: problemLog,
                refreshData: fetchProblemLog,
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
              openModal("deleteProblem", {
                problemLogId: problemLog.Id,
                refreshData: fetchProblemLog,
              })
            }
          >
            Delete
          </Button>
        </div>
      )
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Problem Log</span>
            {(currentUser?.roleName === "SUPERVISOR")&& (
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() => openModal("addProblem", { refreshData: fetchProblemLog })}
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
            data={problemLogsList.problem_log}
            pagination={problemLogsList.pagination}
            columns={problemLogColumns}
            viewMore={false}
            hideActionsHeader={currentUser?.roleName !== "SUPERVISOR" || patientAllocation?.guardianApplicationUserId !== currentUser?.userId}
            fetchData={fetchProblemLog}
            renderActions={renderAction}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default ProblemHistoryCard;
