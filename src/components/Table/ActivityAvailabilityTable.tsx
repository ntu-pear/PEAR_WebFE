import { useMemo } from "react";
import type { CentreActivityAvailabilityRow } from "@/hooks/activities/useCentreActivityAvailabilities";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import dayjs from "dayjs";

type Props = {
  data: CentreActivityAvailabilityRow[];
  query: string;
  page: number;
  setPage: (n: number) => void;
  pageSize?: number; 
  onEdit: (row: CentreActivityAvailabilityRow) => void;
  onDelete: (row: CentreActivityAvailabilityRow) => void;
};

const DEFAULT_PAGE_SIZE = 5;

// Map of bitmask to day names
const DAYS_MAP = [
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 4 },
  { label: "Thu", value: 8 },
  { label: "Fri", value: 16 },
  { label: "Sat", value: 32 },
  { label: "Sun", value: 64 },
];

export default function AvailabilityTable({
    data,
    query,
    page,
    setPage,
    pageSize = DEFAULT_PAGE_SIZE,
    onEdit,
    onDelete
}: Props) {
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return data;
        return data.filter((r) =>
            r.id.toString().toLowerCase().includes(q)
        );
    }, [data, query]);

    const total = filtered.length;
    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const current = Math.min(page, pageCount);
    const startIndex = (current - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);
    const showingFrom = total === 0 ? 0 : startIndex + 1;
    const showingTo = Math.min(startIndex + items.length, total);

    const formatDays = (bitmask: number) => {
      if (!bitmask) return "-";
      if (bitmask === 127) return "Every day"; 
      return DAYS_MAP.filter(d => (bitmask & d.value) > 0)
                     .map(d => d.label)
                     .join(", ");
    };

    return(
        <div className="rounded-2xl border">
            <div className="px-2 pb-2">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead className="w-40">Start Date</TableHead>
                            <TableHead className="w-40">End Date</TableHead>
                            <TableHead className="w-40">Start Time</TableHead>
                            <TableHead className="w-40">End Time</TableHead>
                            <TableHead className="w-40">Days</TableHead> 
                            <TableHead className="w-40">Created Date</TableHead>
                            <TableHead className="w-40">Modified Date</TableHead>
                            <TableHead className="w-28">Deleted?</TableHead>
                            <TableHead className="w-96">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={10}>No availabilities scheduled.</TableCell>
                            </TableRow>
                        )}
                        {items.map((a) => (
                            <TableRow key={a.id}>
                                <TableCell className="font-medium">{a.id}</TableCell>
                                <TableCell>{a.start_date}</TableCell>
                                <TableCell>{a.end_date}</TableCell>
                                <TableCell>{a.start_time}</TableCell>
                                <TableCell>{a.end_time}</TableCell>
                                <TableCell>{formatDays(a.days_of_week)}</TableCell> {/* Render days */}
                                <TableCell>{dayjs(a.created_date).format("YYYY-MM-DD")}</TableCell>
                                <TableCell>{a.modified_date ? dayjs(a.modified_date).format("YYYY-MM-DD") : "-"}</TableCell>
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
    );
};
