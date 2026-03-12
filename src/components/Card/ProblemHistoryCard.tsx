import { useModal } from "@/hooks/useModal";
import { PlusCircle } from "lucide-react";
import { DataTableServer } from "../Table/DataTable";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { fetchPatientProblemLog, ProblemLogTD } from "@/api/patients/problemLog";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";


const ProblemHistoryCard: React.FC = () => {
  const { currentUser } = useAuth();
  const { openModal } = useModal();
  const { id, patientAllocation } = useViewPatient()
  const [problemLogsList, setProblemLogsList] = useState<ProblemLogTD[]>([])
  const [pageNo, setPageNo] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const problemLogColumns = [
    { key: "ProblemName", header: "Problem Name" },
    { key: "ProblemRemarks", header: "Remarks" },
    { key: "DateOfDiagnosis", header: "Date of Diagnosis" },
    { key: "SourceOfInformation", header: "Author" },
  ];

  const fetchProblemLog = async () => {
    try {
      const problemLog = await fetchPatientProblemLog(Number(id))
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

  const handleFetchData = (newPageNo: number, newPageSize: number) => {
    setPageNo(newPageNo)
    setPageSize(newPageSize)
  }

  useEffect(() => {
    fetchProblemLog()
  }, [id])

  const paginatedProblem = useMemo(() => {
    const start = pageNo * pageSize
    return problemLogsList.slice(start, start + pageSize)
  }, [problemLogsList, pageNo, pageSize])

  const pagination = useMemo(() => ({
    pageNo,
    pageSize,
    totalRecords: problemLogsList.length,
    totalPages: Math.ceil(problemLogsList.length / pageSize)
  }), [problemLogsList, pageNo, pageSize])


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
                refreshData: () => { fetchProblemLog() }
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
                refreshData: () => {
                  const isLastItemOnPage = paginatedProblem.length === 1 && pageNo > 0
                  if (isLastItemOnPage) setPageNo(p => p - 1)
                  fetchProblemLog()
                }
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
            {(currentUser?.roleName === "SUPERVISOR") && (
              <Button
                size="sm"
                className="h-8 w-24 gap-1"
                onClick={() => openModal("addProblem", {
                  refreshData: () => { fetchProblemLog() }
                })}
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
            data={paginatedProblem}
            pagination={pagination}
            columns={problemLogColumns}
            viewMore={false}
            hideActionsHeader={currentUser?.roleName !== "SUPERVISOR" || patientAllocation?.guardianApplicationUserId !== currentUser?.userId}
            fetchData={handleFetchData}
            renderActions={renderAction}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default ProblemHistoryCard;
