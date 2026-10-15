import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { VitalCheckTD, fetchVitals } from "@/api/patients/vital";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

interface VitalTrendsChartProps {
  patientId: string;
}

interface VitalPoint extends VitalCheckTD {
  timestamp: number;
}

type RangeOption = "30d" | "90d" | "all";

interface TooltipRow {
  color: string;
  name: string;
  value: number;
}

const MONTH_INDEX: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

const parseFormattedDate = (dateStr: string): number => {
  const [day, mon, year] = dateStr.split("-");
  const month = MONTH_INDEX[mon?.toUpperCase()];
  if (month === undefined || !day || !year) return NaN;
  return new Date(Number(year), month, Number(day)).getTime();
};

const getMonthTicks = (points: VitalPoint[]): number[] => {
  if (points.length === 0) return [];
  const start = dayjs(points[0].timestamp).startOf("month");
  const end = dayjs(points[points.length - 1].timestamp).startOf("month");
  const ticks: number[] = [];
  let cursor = start;
  while (cursor.isBefore(end) || cursor.isSame(end, "month")) {
    ticks.push(cursor.valueOf());
    cursor = cursor.add(1, "month");
  }
  if (ticks.length === 1) {
    ticks.push(start.add(1, "month").valueOf());
  }
  return ticks;
};

const ChartTooltip: React.FC<{
  active?: boolean;
  label?: number;
  payload?: { color: string; name: string; value: number }[];
  unit: string;
}> = ({ active, label, payload, unit }) => {
  if (!active || !payload || payload.length === 0 || label === undefined) return null;

  const rows: TooltipRow[] = payload.map((p) => ({
    color: p.color,
    name: p.name,
    value: p.value,
  }));

  return (
    <div className="rounded-md border border-border bg-popover p-3 text-sm shadow-md">
      <p className="mb-1 font-medium text-foreground">
        {dayjs(label).format("DD-MMM-YYYY")}
      </p>
      {rows.map((row) => (
        <div key={row.name} className="flex items-center gap-2">
          <span
            className="h-0.5 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: row.color }}
          />
          <span className="font-semibold text-foreground">
            {row.value} {unit}
          </span>
          <span className="text-muted-foreground">{row.name}</span>
        </div>
      ))}
    </div>
  );
};

const VitalTrendsChart: React.FC<VitalTrendsChartProps> = ({ patientId }) => {
  const [allVitals, setAllVitals] = useState<VitalPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<RangeOption>("30d");

  useEffect(() => {
    if (!patientId || isNaN(Number(patientId))) return;
    const load = async () => {
      setLoading(true);
      try {
        const result = await fetchVitals(Number(patientId), 0, 100);
        const withTimestamps: VitalPoint[] = result.vitals
          .map((v) => ({ ...v, timestamp: parseFormattedDate(v.date) }))
          .filter((v) => !isNaN(v.timestamp))
          .sort((a, b) => a.timestamp - b.timestamp);
        setAllVitals(withTimestamps);
      } catch {
        toast.error("Failed to load vital trends");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId]);

  const vitals = useMemo(() => {
    if (range === "all") return allVitals;
    const cutoff = dayjs()
      .subtract(range === "30d" ? 30 : 90, "day")
      .valueOf();
    return allVitals.filter((v) => v.timestamp >= cutoff);
  }, [allVitals, range]);

  const monthTicks = useMemo(() => getMonthTicks(vitals), [vitals]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading trends...</p>;
  }

  if (allVitals.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No vital records yet to chart.
      </p>
    );
  }

  const rangeToggle = (
    <Tabs value={range} onValueChange={(value) => setRange(value as RangeOption)}>
      <TabsList>
        <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
        <TabsTrigger value="90d">Last 90 Days</TabsTrigger>
        <TabsTrigger value="all">All Time</TabsTrigger>
      </TabsList>
    </Tabs>
  );

  if (vitals.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        {rangeToggle}
        <p className="text-sm text-muted-foreground">
          No vital records in this range.
        </p>
      </div>
    );
  }

  const domain: [number, number] = [monthTicks[0], monthTicks[monthTicks.length - 1]];

  return (
    <div className="flex flex-col gap-4">
      {rangeToggle}

      <div className="flex flex-col gap-8">
        <div>
          <h4 className="mb-2 text-sm font-medium text-foreground">
            Blood Pressure (mmHg)
          </h4>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={vitals} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={domain}
                ticks={monthTicks}
                tickFormatter={(value) => dayjs(value).format("MMM YYYY")}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<ChartTooltip unit="mmHg" />} />
              <Legend
                wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }}
              />
              <Line
                type="monotone"
                dataKey="systolicBP"
                name="Systolic"
                stroke="hsl(var(--vitals-systolic))"
                strokeWidth={2}
                dot={{ r: 4, fill: "hsl(var(--vitals-systolic))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                activeDot={{ r: 5, fill: "hsl(var(--vitals-systolic))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
              />
              <Line
                type="monotone"
                dataKey="diastolicBP"
                name="Diastolic"
                stroke="hsl(var(--vitals-diastolic))"
                strokeWidth={2}
                dot={{ r: 4, fill: "hsl(var(--vitals-diastolic))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                activeDot={{ r: 5, fill: "hsl(var(--vitals-diastolic))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium text-foreground">Weight (kg)</h4>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={vitals} margin={{ left: 0, right: 16, top: 8, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="timestamp"
                type="number"
                domain={domain}
                ticks={monthTicks}
                tickFormatter={(value) => dayjs(value).format("MMM YYYY")}
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<ChartTooltip unit="kg" />} />
              <Line
                type="monotone"
                dataKey="weight"
                name="Weight"
                stroke="hsl(var(--vitals-weight))"
                strokeWidth={2}
                dot={{ r: 4, fill: "hsl(var(--vitals-weight))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                activeDot={{ r: 5, fill: "hsl(var(--vitals-weight))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default VitalTrendsChart;
