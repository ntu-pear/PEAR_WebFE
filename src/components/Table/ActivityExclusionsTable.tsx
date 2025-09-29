import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import type { CentreActivityExclusionWithDetails } from "@/hooks/activity/useActivityExclusions";

type Props = {
  data: CentreActivityExclusionWithDetails[];
  query: string;
  page: number;
  setPage: (n: number) => void;
  pageSize?: number; 
  onEdit: (row: CentreActivityExclusionWithDetails) => void;
  onDelete: (row: CentreActivityExclusionWithDetails) => void;
};

const DEFAULT_PAGE_SIZE = 10;

export default function CentreActivityExclusionsTable({
  data,
  query,
  page,
  setPage,
  pageSize = DEFAULT_PAGE_SIZE,
  onEdit,
  onDelete,
}: Props) {
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) =>
      row.activityName.toLowerCase().includes(q) ||
      row.patientName.toLowerCase().includes(q) ||
      (row.exclusionRemarks && row.exclusionRemarks.toLowerCase().includes(q))
    );
  }, [data, query]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pageCount);
  const startIndex = (current - 1) * pageSize;
  const items = filtered.slice(startIndex, startIndex + pageSize);
  const showingFrom = total === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + items.length, total);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <div className="rounded-2xl border">
        <div className="px-2 pb-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    {query ? "No centre activity exclusions match your search." : "No centre activity exclusions found."}
                  </TableCell>
                </TableRow>
              ) : (
                items.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{row.activityName}</div>
                        {row.activityDescription && (
                          <div className="text-sm text-muted-foreground">
                            {row.activityDescription}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{row.patientName}</TableCell>
                    <TableCell>{formatDate(row.startDate)}</TableCell>
                    <TableCell>
                      {row.isIndefinite ? (
                        <Badge variant="secondary">Indefinite</Badge>
                      ) : row.endDate ? (
                        formatDate(row.endDate)
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const now = new Date();
                        const start = new Date(row.startDate);
                        // Don't create end date if it's indefinite or backend's 2999 marker
                        const end = row.endDate && !row.isIndefinite ? new Date(row.endDate) : null;
                        
                        if (now < start) {
                          return <Badge variant="outline">Scheduled</Badge>;
                        } else if (row.isIndefinite || (end && now <= end)) {
                          return <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
                        } else {
                          return <Badge variant="secondary">Expired</Badge>;
                        }
                      })()}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {row.exclusionRemarks && (
                        <div className="text-sm truncate" title={row.exclusionRemarks}>
                          {row.exclusionRemarks}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {row.canEdit && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(row)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit exclusion</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(row)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete exclusion</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {showingFrom}-{showingTo} of {total} centre activity exclusions
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(current - 1)}
              disabled={current <= 1}
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: pageCount }, (_, i) => i + 1)
                .filter(p => {
                  const distance = Math.abs(p - current);
                  return distance <= 1 || p === 1 || p === pageCount;
                })
                .map((p, i, arr) => (
                  <div key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={p === current ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  </div>
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(current + 1)}
              disabled={current >= pageCount}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}