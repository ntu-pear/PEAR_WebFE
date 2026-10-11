import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { computeChanges, fieldLabel, formatLogValue, isEmptyValue, isRedundantIdField, ChangeKind } from "@/lib/auditLogs/formatLog";

const LONG_VALUE = 200;

const KIND_BADGE: Record<ChangeKind, { label: string; className: string }> = {
  added: { label: "Added", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  removed: { label: "Removed", className: "bg-red-100 text-red-800 hover:bg-red-100" },
  modified: { label: "Modified", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
};

const ValueText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > LONG_VALUE;
  const shown = isLong && !expanded ? `${text.slice(0, LONG_VALUE)}…` : text;
  return (
    <span className={`break-words whitespace-pre-wrap ${className ?? ""}`}>
      <span>{shown}</span>
      {isLong && (
        <button
          type="button"
          className="ml-2 text-xs font-medium text-primary underline-offset-2 hover:underline"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </span>
  );
};

interface ChangeDetailsProps {
  method: string;
  originalData?: Record<string, unknown> | null;
  updatedData?: Record<string, unknown> | null;
  entityId?: string | number | null;
  entityName?: string | null;
}

const ChangeDetails: React.FC<ChangeDetailsProps> = ({ method, originalData, updatedData, entityId, entityName }) => {
  const action = method.toLowerCase();
  const snapshotSource = action === "create" ? updatedData : action === "delete" ? originalData : null;
  const snapshot = snapshotSource
    ? Object.entries(snapshotSource).filter(
        ([k, v]) => !isEmptyValue(v) && !isRedundantIdField(k, snapshotSource)
      )
    : [];
  const changes = snapshotSource ? [] : computeChanges(originalData, updatedData);
  const hasRows = snapshotSource ? snapshot.length > 0 : changes.length > 0;

  return (
    <div className="bg-muted/30 p-4">
      {(entityId || entityName) && (
        <div className="mb-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {entityId ? (
            <div>
              <span className="text-muted-foreground">Entity ID:</span> {entityId}
            </div>
          ) : null}
          {entityName ? (
            <div>
              <span className="text-muted-foreground">Entity Name:</span> {entityName}
            </div>
          ) : null}
        </div>
      )}

      <h5 className="mb-2 text-sm font-medium">Field Changes</h5>
      {!hasRows ? (
        <p className="text-sm text-muted-foreground">No field details recorded</p>
      ) : snapshotSource ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3">Field</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {snapshot.map(([key, value]) => (
              <TableRow key={key}>
                <TableCell className="font-medium">{fieldLabel(key)}</TableCell>
                <TableCell>
                  <ValueText text={formatLogValue(key, value)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">Field</TableHead>
              <TableHead>Old value</TableHead>
              <TableHead>New value</TableHead>
              <TableHead className="w-28">Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {changes.map((change) => (
              <TableRow key={change.field}>
                <TableCell className="font-medium">{change.label}</TableCell>
                <TableCell className="bg-red-50/50">
                  <ValueText
                    text={formatLogValue(change.field, change.oldValue)}
                    className={change.kind === "added" ? "text-muted-foreground" : "text-red-700 line-through"}
                  />
                </TableCell>
                <TableCell className="bg-green-50/50">
                  <ValueText
                    text={formatLogValue(change.field, change.newValue)}
                    className={change.kind === "removed" ? "text-muted-foreground" : "text-green-700"}
                  />
                </TableCell>
                <TableCell>
                  <Badge className={KIND_BADGE[change.kind].className}>{KIND_BADGE[change.kind].label}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default ChangeDetails;
