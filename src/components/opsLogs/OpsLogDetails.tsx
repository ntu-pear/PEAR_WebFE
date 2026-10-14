import React from "react";
import type { OpsLog } from "@/api/logger/opsLogs";

type OpsLogDetailsProps = {
  log: OpsLog;
  onRequestIdClick?: (requestId: string) => void;
};

const show = (value: unknown): string =>
  value === null || value === undefined || value === "" ? "—" : String(value);

const OpsLogDetails: React.FC<OpsLogDetailsProps> = ({ log, onRequestIdClick }) => {
  const rows: Array<[string, unknown]> = [
    ["Service", log.service],
    ["Level", log.level],
    ["Logger", log.logger],
    ["User ID", log.user_id],
  ];
  if (log.ops_type === "request") {
    rows.push(["Method", log.method], ["Path", log.path], ["Query", log.query], ["Status", log.status], [
      "Duration (ms)",
      log.duration_ms,
    ]);
  } else if (log.ops_type === "auth") {
    rows.push(["Event", log.event], ["Reason", log.reason], ["Path", log.path], ["Status", log.status]);
  } else {
    rows.push(["Exception", log.exception_type], ["Path", log.path]);
  }
  const requestId = log.request_id;

  return (
    <div className="space-y-3 p-2 text-sm">
      <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1">
        {rows.map(([label, value]) => (
          <React.Fragment key={label}>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="break-all">{show(value)}</dd>
          </React.Fragment>
        ))}
        <dt className="text-muted-foreground">Request ID</dt>
        <dd className="break-all">
          {requestId && onRequestIdClick ? (
            <button
              type="button"
              className="text-primary underline underline-offset-2"
              onClick={() => onRequestIdClick(requestId)}
            >
              {requestId}
            </button>
          ) : (
            show(requestId)
          )}
        </dd>
      </dl>
      <p className="whitespace-pre-wrap break-words">{log.message}</p>
      {log.stack_trace && (
        <pre
          aria-label="Stack trace"
          className="max-h-96 overflow-auto whitespace-pre-wrap rounded bg-muted p-3 font-mono text-xs"
        >
          {log.stack_trace}
        </pre>
      )}
    </div>
  );
};

export default OpsLogDetails;
