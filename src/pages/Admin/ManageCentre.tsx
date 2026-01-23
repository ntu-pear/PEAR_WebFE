import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { DataTableClient } from "@/components/Table/DataTable";
import {
  useCareCentres,
  useCreateCareCentre,
  useUpdateCareCentre,
  useDeleteCareCentre,
} from "@/hooks/admin/useCareCentre";
import {
  CareCentreResponse,
  CreateCareCentre,
  UpdateCareCentre,
  WorkingHours,
} from "@/types/careCentre";
import WorkingHoursInput, { defaultWorkingHours } from "@/components/Form/WorkingHoursInput";
import { normalizeWorkingHours, validateWorkingHours } from "@/lib/validation/time";

type FormValues = CreateCareCentre;

const emptyForm = (): FormValues => ({
  name: "",
  country_code: "SGP",
  address: "",
  postal_code: "",
  contact_no: "",
  email: "",
  no_of_devices_avail: 0,
  working_hours: defaultWorkingHours(),
});

function formatWorkingHours(wh: WorkingHours) {
  const days: (keyof WorkingHours)[] = [
    "monday","tuesday","wednesday","thursday","friday","saturday","sunday",
  ];
  const label: Record<string, string> = {
    monday: "Mon", tuesday: "Tue", wednesday: "Wed",
    thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun",
  };

  return (
    <div className="space-y-1 text-xs leading-5">
      {days.map((d) => {
        const v = wh[d];
        const range = v?.open && v?.close ? `${v.open}–${v.close}` : "—";
        return (
          <div key={d} className="flex gap-2">
            <span className="w-8 shrink-0 font-medium text-foreground">{label[d]}:</span>
            <span className="font-medium text-foreground">{range}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ManageCentre() {
  const { data = [], isFetching } = useCareCentres();
  const createMut = useCreateCareCentre();
  const updateMut = useUpdateCareCentre();
  const deleteMut = useDeleteCareCentre();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CareCentreResponse | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const { control, handleSubmit, reset, watch, setValue, setFocus } =
    useForm<FormValues>({ defaultValues: emptyForm() });

  const wh = watch("working_hours");

  const validateAndGetWH = () => {
    const normalized = normalizeWorkingHours(wh as any);
    const workingHours: import("@/types/careCentre").WorkingHours = {
      monday: normalized.monday,
      tuesday: normalized.tuesday,
      wednesday: normalized.wednesday,
      thursday: normalized.thursday,
      friday: normalized.friday,
      saturday: normalized.saturday,
      sunday: normalized.sunday,
    };
    const { byDay, anyError } = validateWorkingHours(workingHours);
    if (!anyError) {
      setFormErrors([]);
      return workingHours;
    }
    const summary: string[] = [];
    Object.entries(byDay).forEach(([day, msgs]) => {
      msgs.forEach((m) => summary.push(`${capitalize(day)}: ${m}`));
    });
    setFormErrors(summary);
    return null;
  };

  const onCreate = async (values: FormValues) => {
    const validWH = validateAndGetWH();
    if (!validWH) return;
    try {
      await createMut.mutateAsync({ ...values, working_hours: validWH });
      toast.success("Care centre created");
      setOpen(false);
      reset(emptyForm());
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Failed to create care centre");
    }
  };

  const onUpdate = async (values: FormValues) => {
    if (!editing) return;
    const validWH = validateAndGetWH();
    if (!validWH) return;
    const payload: UpdateCareCentre = { id: editing.id, ...values, working_hours: validWH };
    try {
      await updateMut.mutateAsync(payload);
      toast.success("Care centre updated");
      setOpen(false);
      setEditing(null);
      reset(emptyForm());
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Failed to update care centre");
    }
  };

  const startCreate = () => {
    reset(emptyForm());
    setEditing(null);
    setFormErrors([]);
    setOpen(true);
  };

  const startEdit = (row: CareCentreResponse) => {
    reset({ ...row });
    setEditing(row);
    setFormErrors([]);
    setOpen(true);
  };

  const remove = async (row: CareCentreResponse) => {
    if (!confirm(`Delete care centre "${row.name}"?`)) return;
    try {
      await deleteMut.mutateAsync(row.id);
      toast.success("Care centre deleted");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Failed to delete care centre");
    }
  };

  const cols = useMemo(
    () => [
      { key: "name", header: "Name" },
      { key: "country_code", header: "Country" },
      { key: "address", header: "Address", render: (v: string) => <span className="whitespace-pre-wrap break-words">{v}</span> },
      { key: "postal_code", header: "Postal", render: (v: string) => <span className="tabular-nums">{v}</span> },
      { key: "contact_no", header: "Contact" },
      { key: "email", header: "Email" },
      {
        key: "no_of_devices_avail",
        header: "Devices",
        render: (v: number) => <span className="tabular-nums">{v}</span>,
      },
      {
        key: "working_hours",
        header: "Operating Hours",
        render: (wh: WorkingHours) => formatWorkingHours(wh),
      },
    ],
    []
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Care Centres</CardTitle>
          <Button onClick={startCreate}>Create</Button>
        </CardHeader>
        <CardContent>
          <DataTableClient<CareCentreResponse>
            data={data}
            columns={cols as any}
            viewMore={false}
            hideActionsHeader={false}
            renderActions={(row) => (
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => startEdit(row)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => remove(row)}>
                  Delete
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="w-[92vw] max-w-2xl max-h-[85vh] overflow-y-auto"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            setTimeout(() => setFocus("name"), 0);
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit Centre: ${editing.name}` : "Create Care Centre"}
            </DialogTitle>
          </DialogHeader>

          {formErrors.length > 0 && (
            <div className="rounded-md border border-destructive bg-destructive/10 text-destructive px-4 py-3 text-sm mb-3">
              <div className="font-medium mb-1">Please fix the following:</div>
              <ul className="list-disc pl-5 space-y-1">
                {formErrors.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(editing ? onUpdate : onCreate)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => <Input {...field} autoFocus />}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Country Code (ISO3)</label>
                <Controller
                  name="country_code"
                  control={control}
                  rules={{ required: true, validate: (v) => v?.length === 3 || "Use ISO3 code" }}
                  render={({ field }) => <Input maxLength={3} {...field} />}
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium">Address</label>
                <Controller
                  name="address"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => <Input {...field} />}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Postal Code</label>
                <Controller
                  name="postal_code"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => <Input {...field} />}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Contact No</label>
                <Controller
                  name="contact_no"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => <Input {...field} />}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <Controller
                  name="email"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => <Input type="email" {...field} />}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Devices Available</label>
                <Controller
                  name="no_of_devices_avail"
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min={0}
                      value={Number.isFinite(field.value as any) ? field.value : 0}
                      onChange={(e) => {
                        const n = e.currentTarget.valueAsNumber;
                        field.onChange(Number.isNaN(n) ? 0 : n);
                      }}
                    />
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Operating Days &amp; Hours</div>
              <WorkingHoursInput
                value={wh}
                onChange={(next) => setValue("working_hours", next, { shouldDirty: true })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isFetching || createMut.isPending || updateMut.isPending}
              >
                {editing ? "Save changes" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}