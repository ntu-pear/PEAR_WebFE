import { useMemo, useState, useEffect } from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CentreActivityRow } from "@/hooks/activities/useCentreActivities";

type Props = {
  data: CentreActivityRow[];
  query: string;
  page: number;
  setPage: (n: number) => void;
  pageSize?: number; 
  onEdit: (row: CentreActivityRow) => void;
  onDelete: (row: CentreActivityRow) => void;
};

const DEFAULT_PAGE_SIZE = 5;

export default function CentreActivitiesTable({
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
      r.activity_title.toLowerCase().includes(q)
    );
  }, [data, query]);

  const [rowsInput, setRowsInput] = useState(pageSize);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / rowsPerPage));
  const current = Math.min(page, pageCount);
  const startIndex = (current - 1) * rowsPerPage;
  const items = filtered.slice(startIndex, startIndex + rowsPerPage);
  const showingFrom = total === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + items.length, total);
  const [jumpPage, setJumpPage] = useState(page);

  
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
    const newSize = Math.max(1, rowsInput);
    setRowsPerPage(newSize);
    setPage(1);
  };

  useEffect(() => {
    setJumpPage(page);
  }, [page]);

  const groupTimeSlots = (slots: string, duration: number) => {
    if (!slots) return [];

    const grouped: Record<string, string[]> = {};

    slots.split(",").forEach((slot) => {
      const [day, time] = slot.trim().split(" ");

      const start = dayjs(`01-01-2001 ${time}`);
      const end = start.add(duration, "minute");

      const formatted = `${start.format("HH:mm")} - ${end.format("HH:mm")}`;

      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(formatted);
    });

    return Object.entries(grouped);
  };

  return (
    <>
      <div className="rounded-2xl border">
        <div className="px-2 pb-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead className="w-28">Activity Title</TableHead>
                <TableHead>Compulsory?/Fixed?Group?</TableHead>
                <TableHead>Minimum People Required</TableHead>
                <TableHead>Minimum Duration</TableHead>
                <TableHead>Maximum Duration</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Fixed Time Slots</TableHead>
                <TableHead className="w-28">Deleted?</TableHead>
                <TableHead className="w-96">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11}>No centre activities found.</TableCell>
                </TableRow>
              )}
              {items.map((a) => (
                <TableRow key={a.id} >
                  <TableCell className="font-medium">{a.id}</TableCell>
                  <TableCell className="max-w-[420px] truncate">{a.activity_title}</TableCell>
                  <TableCell>{a.is_compulsory ? "Yes" : "No"}/{a.is_fixed ? "Yes" : "No"}/{a.is_group ? "Yes" : "No"}</TableCell>
                  <TableCell>{a.min_people_req ? a.min_people_req : "-"}</TableCell>
                  <TableCell>{a.min_duration} mins</TableCell>
                  <TableCell>{a.max_duration} mins</TableCell>
                  <TableCell>{dayjs(a.start_date).format("DD MMM YYYY")}</TableCell>
                  <TableCell>{dayjs(a.end_date).format("DD MMM YYYY")}</TableCell>
                  <TableCell>
                    {a.fixed_time_slots ? (
                      <div className="flex flex-col gap-1 text-sm">
                        {groupTimeSlots(a.fixed_time_slots, a.max_duration).map(([day, times]) => (
                          <div key={day} className="flex gap-2 whitespace-nowrap">
                            <span className="font-medium w-17">{day}</span>
                            <span className="text-muted-foreground">
                              {times.join(" ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{a.is_deleted ? "Yes" : "No"}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => onEdit(a)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(a)} disabled={a.is_deleted}>
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