import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Fingerprint } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import OpsLogDetails from "@/components/opsLogs/OpsLogDetails";
import { fetchRequestTrace, OpsLog } from "@/api/logger/opsLogs";
import { describeOpsLog } from "@/lib/opsLogs/formatOpsLog";

const formatTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : format(date, "dd/MM/yyyy HH:mm:ss.SSS");
};

const RequestTrace: React.FC = () => {
  const { requestId = "" } = useParams();
  const navigate = useNavigate();
  const [lines, setLines] = useState<OpsLog[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLines(null);
    setFailed(false);
    fetchRequestTrace(requestId)
      .then((result) => {
        if (!cancelled) setLines(result);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [requestId]);

  let body: React.ReactNode;
  if (failed) {
    body = <p className="text-muted-foreground">Could not load this request. Try again later.</p>;
  } else if (lines === null) {
    body = <p className="text-muted-foreground">Loading…</p>;
  } else if (lines.length === 0) {
    body = <p className="text-muted-foreground">No log lines carry this request ID.</p>;
  } else {
    body = (
      <ol className="space-y-4">
        {lines.map((line, index) => (
          <li key={`${line.timestamp}-${index}`} className="rounded border p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-mono">{formatTime(line.timestamp)}</span>
              <Badge variant="outline">{line.ops_type}</Badge>
              {line.service && <Badge variant="outline">{line.service}</Badge>}
              <span className="font-mono text-xs">{describeOpsLog(line)}</span>
            </div>
            <OpsLogDetails log={line} />
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="w-full p-6">
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Fingerprint className="h-6 w-6 text-primary" />
            <CardTitle className="break-all text-2xl">Request {requestId}</CardTitle>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </CardHeader>
        <CardContent>{body}</CardContent>
      </Card>
    </div>
  );
};

export default RequestTrace;