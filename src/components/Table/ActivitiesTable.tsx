import { useMemo, useState, useEffect } from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ActivityRow } from "@/hooks/activities/useActivities";

type Props = {
  data: ActivityRow[];
  query: string;
  page: number;
  setPage: (n: number) => void;
  pageSize?: number; 
  onEdit: (row: ActivityRow) => void;
  onDelete: (row: ActivityRow) => void;
};

const DEFAULT_PAGE_SIZE = 5;

export default function ActivitiesTable({
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
    return data.filter((r) =>
      r.title.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q)
    );
  }, [data, query]);

  const [rowsInput, setRowsInput] = useState(pageSize);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [jumpPage, setJumpPage] = useState(page);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / rowsPerPage));
  const current = Math.min(page, pageCount);
  const startIndex = (current - 1) * rowsPerPage;
  const items = filtered.slice(startIndex, startIndex + rowsPerPage);
  const showingFrom = total === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + items.length, total);

  const goToPage = (p: number) => {
    if (p >= 1 && p <= pageCount) {
      setPage(p);
      setJumpPage(p);
    }
  };

  const handleJump = () => {
    const p = Math.max(1, Math.min(jumpPage, pageCount));
    goToPage(p);
  };

  const handleRowsChange = () => {
    const newSize = Math.max(1, rowsInput || 1);
    setRowsPerPage(newSize);
    setPage(1);
  };

  useEffect(() => {
    setJumpPage(page);
  }, [page]);

  return (
    <>
      <div className="rounded-2xl border">
        <div className="px-2 pb-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-40 whitespace-nowrap">Created Date</TableHead>
                <TableHead className="w-40 whitespace-nowrap">Modified Date</TableHead>
                <TableHead className="w-28">Deleted?</TableHead>
                <TableHead className="w-56">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>No activities found.</TableCell>
                </TableRow>
              )}
              {items.map((a) => (
                <TableRow key={a.id} className={a.is_deleted ? "opacity-60" : ""}>
                  <TableCell className="font-medium">{a.title}</TableCell>
                  <TableCell className="max-w-[420px] truncate">{a.description}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {dayjs(a.created_date).format("DD-MMM-YYYY")}
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    {dayjs(a.modified_date).format("DD-MMM-YYYY")}
                  </TableCell>
                  <TableCell>{a.is_deleted ? "Yes" : "No"}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => onEdit(a)} disabled={a.is_deleted}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(a)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* footer */}
        <div className="flex items-center justify-between px-6 py-3 text-sm text-muted-foreground">

          <div>
            {total === 0
              ? "Showing 0 of 0 records"
              : `Showing ${showingFrom}-${showingTo} of ${total} records`}
          </div>

          <div className="flex items-center gap-2">

            {/* rows per page */}
            <span>Rows</span>

            <input
              type="number"
              min={1}
              value={rowsInput}
              onChange={(e) => setRowsInput(Number(e.target.value))}
              className="w-16 text-center border rounded-md px-2 py-1 text-sm"
            />

            <Button
              size="sm"
              variant="outline"
              onClick={handleRowsChange}
            >
              Change
            </Button>

            {/* page jump */}
            <span>Page</span>

            <input
              type="number"
              min={1}
              max={pageCount}
              value={jumpPage}
              onChange={(e) => setJumpPage(Number(e.target.value))}
              className="w-16 text-center border rounded-md px-2 py-1 text-sm"
            />

            <span>of {pageCount}</span>

            <Button
              size="sm"
              variant="outline"
              onClick={handleJump}
            >
              Go
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={current <= 1}
              onClick={() => goToPage(current - 1)}
            >
              Prev
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={current >= pageCount}
              onClick={() => goToPage(current + 1)}
            >
              Next
            </Button>

          </div>

        </div>
      </div>
    </>
  );
}