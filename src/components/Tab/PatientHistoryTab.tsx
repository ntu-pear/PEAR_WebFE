import React, { useCallback, useEffect, useState } from "react";
import { format, isValid } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TabsContent } from "../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { FlagBadges } from "../logFlags/FlagBadge";
import { Button } from "../ui/button";
import ChangeDetails from "@/components/auditLogs/ChangeDetails";
import { useViewPatient } from "@/hooks/patient/useViewPatient";
import { fetchPatientHistory } from "@/api/logger/patientHistory";
import type { ViewLogsList } from "@/api/logger/logs";

const PAGE_SIZE = 20;

const formatTimestamp = (ts: unknown) => {
  if (ts === null || ts === undefined || ts === "") return "-";
  const d = new Date(ts as string);
  return isValid(d) ? format(d, "dd MMM yyyy, h:mm a") : "-";
};

const getActionBadgeColor = (method: string) => {
  switch (method.toLowerCase()) {
    case "create":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "update":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "delete":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-100";
  }
};

type ViewState = "loading" | "ok" | "unavailable" | "error";

const PatientHistoryTab: React.FC = () => {
  const { id } = useViewPatient();
  const [page, setPage] = useState(0);
  const [prevId, setPrevId] = useState(id);
  if (prevId !== id) {
    setPrevId(id);
    setPage(0);
  }
  const [state, setState] = useState<ViewState>("loading");
  const [history, setHistory] = useState<ViewLogsList | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const load = useCallback(
    async (isCancelled: () => boolean = () => false) => {
      if (!id) return;
      setState("loading");
      setExpanded({});
      try {
        const result = await fetchPatientHistory(id, page, PAGE_SIZE);
        if (isCancelled()) return;
        if (result.status === "unavailable") {
          setState("unavailable");
        } else {
          setHistory(result.data);
          setState("ok");
        }
      } catch {
        if (isCancelled()) return;
        setState("error");
      }
    },
    [id, page]
  );

  useEffect(() => {
    let cancelled = false;
    load(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [load]);

  const logs = history?.data ?? [];
  const totalPages = history?.totalPages ?? 0;

  return (
    <TabsContent value="history">
      <div className="my-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Change History</CardTitle>
          </CardHeader>
          <CardContent>
            {state === "loading" && (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            )}
            {state === "unavailable" && (
              <p className="py-4 text-sm text-muted-foreground">Change history is not available yet.</p>
            )}
            {state === "error" && (
              <div className="flex items-center gap-3 py-4 text-sm">
                <span>Couldn't load change history. Try again.</span>
                <Button variant="outline" size="sm" onClick={() => load()}>
                  Retry
                </Button>
              </div>
            )}
            {state === "ok" && (
              <>
                {logs.length === 0 && (
                  <p className="py-4 text-sm text-muted-foreground">
                    {totalPages > 1
                      ? "No changes on this page."
                      : "No changes have been recorded for this patient yet."}
                  </p>
                )}
                {logs.length > 0 && (
                <ul className="divide-y">
                  {logs.map((log, index) => (
                    <li key={log.id ?? index} className="py-3">
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            <span className="text-muted-foreground">
                              {formatTimestamp(log.timestamp)}
                            </span>
                            <span className="font-medium">{log.user_full_name || log.user}</span>
                            <Badge className={getActionBadgeColor(log.method)}>{log.method}</Badge>
                            <Badge variant="outline">{log.log_type || log.table || "-"}</Badge>
                            <FlagBadges flags={log.flags} />
                          </div>
                          <div className="text-sm break-words">{log.message}</div>
                        </div>
                        <button
                          type="button"
                          aria-expanded={!!expanded[index]}
                          aria-label={expanded[index] ? "Hide change details" : "Show change details"}
                          className="rounded p-1 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => setExpanded((prev) => ({ ...prev, [index]: !prev[index] }))}
                        >
                          {expanded[index] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                      {expanded[index] && (
                        <div className="mt-2">
                          <ChangeDetails
                            method={log.method}
                            originalData={log.original_data}
                            updatedData={log.updated_data}
                            entityId={log.entity_id}
                            entityName={log.entity_name}
                          />
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                )}
                {totalPages > 1 && (
                  <div className="flex items-center justify-end gap-2 pt-4">
                    <Button variant="outline" size="sm" disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>
                      Prev
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page + 1} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page + 1 >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
};

export default PatientHistoryTab;
