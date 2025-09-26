import { useMemo } from "react";
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

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(page, pageCount);
  const startIndex = (current - 1) * pageSize;
  const items = filtered.slice(startIndex, startIndex + pageSize);
  const showingFrom = total === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + items.length, total);

  return (
    <>
      <div className="rounded-2xl border">
        <div className="px-2 pb-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-40">Created Date</TableHead>
                <TableHead className="w-40">Modified Date</TableHead>
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
                  <TableCell>{dayjs(a.created_date).format("YYYY-MM-DD")}</TableCell>
                  <TableCell>{dayjs(a.modified_date).format("YYYY-MM-DD")}</TableCell>
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
            {total === 0 ? "Showing 0 of 0 records" : `Showing ${showingFrom}-${showingTo} of ${total} records`}
          </div>
          <div className="space-x-2">
            <Button
              size="sm"
              variant="outline"
              disabled={current <= 1}
              onClick={() => setPage(Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={current >= pageCount}
              onClick={() => setPage(Math.min(pageCount, current + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}