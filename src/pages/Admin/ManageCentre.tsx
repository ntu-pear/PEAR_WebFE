import { useEffect, useMemo, useRef, useState } from "react";
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
} from "@/types/careCentre";
import WorkingHoursInput, {
  WorkingHours,
  WorkingHourDay,
  defaultWorkingHours,
} from "@/components/Form/WorkingHoursInput";
import { validateWorkingHours } from "@/lib/validation/time";
import { fetchAddress } from "@/api/geocode";

type FormValues = CreateCareCentre;

// ── helpers ──────────────────────────────────────────────────────────────────

const capitalize  = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const norm        = (s?: string | null) => (s ?? "").trim().toLowerCase();
const digitsOnly  = (s?: string | null) => (s ?? "").replace(/\D/g, "");

const toAlphaNumAddress = (s?: string | null) =>
  (s ?? "").toUpperCase().replace(/[^A-Z0-9\s/#,-]/g, "").replace(/\s+/g, " ").trimStart();

const toAlphaNum = (s?: string | null) =>
  (s ?? "").toUpperCase().replace(/[^A-Z0-9\s]/g, "").replace(/\s+/g, " ").trimStart();

// A day is closed when its object has no "open" key (stored as {}).
const isDayClosed = (d?: WorkingHourDay): boolean => !d || !("open" in d);

function toMinutes(t?: string): number | null {
  if (!t) return null;
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(t);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

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

// ── table display ─────────────────────────────────────────────────────────────

function formatWorkingHours(wh: WorkingHours) {
  const DAYS: { key: keyof WorkingHours; label: string }[] = [
    { key: "monday",    label: "Mon" },
    { key: "tuesday",   label: "Tue" },
    { key: "wednesday", label: "Wed" },
    { key: "thursday",  label: "Thu" },
    { key: "friday",    label: "Fri" },
    { key: "saturday",  label: "Sat" },
    { key: "sunday",    label: "Sun" },
  ];
  return (
    <div className="space-y-1 text-xs leading-5">
      {DAYS.map(({ key, label }) => {
        const v = wh[key];
        const display = !isDayClosed(v) && v?.open && v?.close
          ? `${v.open}–${v.close}`
          : "Closed";
        return (
          <div key={key} className="flex gap-2">
            <span className="w-8 shrink-0 font-medium text-foreground">{label}:</span>
            <span className="font-medium text-foreground">{display}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── component ─────────────────────────────────────────────────────────────────

export default function ManageCentre() {
  const { data = [], isFetching } = useCareCentres();
  const createMut = useCreateCareCentre();
  const updateMut = useUpdateCareCentre();
  const deleteMut = useDeleteCareCentre();

  const [open, setOpen]           = useState(false);
  const [editing, setEditing]     = useState<CareCentreResponse | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [whSubmitted, setWhSubmitted] = useState(false);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  const lastFetchedPostalRef    = useRef<string>("");
  const postalLookupTimeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    control, handleSubmit, reset, watch,
    setValue, setFocus, getValues, setError, clearErrors,
  } = useForm<FormValues>({ defaultValues: emptyForm() });

  const wh         = watch("working_hours");
  const postalCode = watch("postal_code");

  // ── uniqueness ──────────────────────────────────────────────────────────────

  const isUniqueField = (
    field: "name" | "address" | "postal_code" | "email" | "contact_no",
    value: string
  ): boolean => {
    const candidate =
      field === "postal_code" || field === "contact_no" ? digitsOnly(value) : norm(value);
    if (!candidate) return true;
    return !data.some((c) => {
      if (editing?.id != null && c.id === editing.id) return false;
      const existing =
        field === "postal_code" || field === "contact_no"
          ? digitsOnly((c as any)[field])
          : norm((c as any)[field]);
      return existing === candidate;
    });
  };

  // ── postal lookup ───────────────────────────────────────────────────────────

  const lookupAddressByPostalCode = async (rawPostalCode?: string) => {
    const cleaned = digitsOnly(rawPostalCode ?? getValues("postal_code"));
    if (!/^\d{6}$/.test(cleaned)) return;
    if (lastFetchedPostalRef.current === cleaned) return;
    try {
      setIsFetchingAddress(true);
      clearErrors("postal_code");
      const result = await fetchAddress(Number(cleaned));
      setValue("postal_code", cleaned, { shouldDirty: true, shouldValidate: true });
      setValue(
        "address",
        toAlphaNumAddress(result.fullAddress || result.streetAddress || ""),
        { shouldDirty: true, shouldValidate: true }
      );
      lastFetchedPostalRef.current = cleaned;
    } catch (error: any) {
      setError("postal_code", { type: "manual", message: "Unable to fetch address for this postal code" });
      toast.error(error?.response?.data?.detail ?? "Unable to fetch address for this postal code");
    } finally {
      setIsFetchingAddress(false);
    }
  };

  useEffect(() => {
    const cleaned = digitsOnly(postalCode);
    if (postalLookupTimeoutRef.current) clearTimeout(postalLookupTimeoutRef.current);
    if (!/^\d{6}$/.test(cleaned)) {
      if (lastFetchedPostalRef.current !== "") lastFetchedPostalRef.current = "";
      return;
    }
    postalLookupTimeoutRef.current = setTimeout(() => {
      if (digitsOnly(getValues("postal_code")) === cleaned) {
        void lookupAddressByPostalCode(cleaned);
      }
    }, 500);
    return () => { if (postalLookupTimeoutRef.current) clearTimeout(postalLookupTimeoutRef.current); };
  }, [postalCode]);

  // ── working hours validation ────────────────────────────────────────────────

  const validateAndGetWH = (): WorkingHours | null => {
    setWhSubmitted(true);
    const days: (keyof WorkingHours)[] = [
      "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
    ];

    const summary: string[] = [];

    days.forEach((day) => {
      const v = wh[day];

      // Closed days (stored as {}) are always valid — skip them.
      if (isDayClosed(v)) return;

      // Open day must have both times.
      if (!v?.open || !v?.close) {
        summary.push(`${capitalize(day)}: opening and closing times are required`);
        return;
      }

      // Range checks.
      const o = toMinutes(v.open);
      const c = toMinutes(v.close);
      if (o == null || c == null)  { summary.push(`${capitalize(day)}: invalid time format`); return; }
      if (o >= c)                  { summary.push(`${capitalize(day)}: closing time must be after opening time`); return; }
      if (o < 9 * 60)              { summary.push(`${capitalize(day)}: cannot open before 09:00`); }
      if (c > 17 * 60)             { summary.push(`${capitalize(day)}: cannot close after 17:00`); }
    });

    if (summary.length > 0) {
      setFormErrors(summary);
      return null;
    }

    setFormErrors([]);
    return wh as WorkingHours;
  };

  // ── CRUD ────────────────────────────────────────────────────────────────────

  const onCreate = async (values: FormValues) => {
    const validWH = validateAndGetWH();
    if (!validWH) return;
    try {
      await createMut.mutateAsync({ ...values, working_hours: validWH });
      toast.success("Care centre created");
      setOpen(false);
      reset(emptyForm());
      lastFetchedPostalRef.current = "";
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Failed to create care centre");
    }
  };

  const onUpdate = async (values: FormValues) => {
    if (!editing) return;
    const validWH = validateAndGetWH();
    if (!validWH) return;
    try {
      await updateMut.mutateAsync({ id: editing.id, ...values, working_hours: validWH });
      toast.success("Care centre updated");
      setOpen(false);
      setEditing(null);
      reset(emptyForm());
      lastFetchedPostalRef.current = "";
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Failed to update care centre");
    }
  };

  const startCreate = () => {
    reset(emptyForm());
    setEditing(null);
    setFormErrors([]);
    setWhSubmitted(false);
    lastFetchedPostalRef.current = "";
    setOpen(true);
  };

  const startEdit = (row: CareCentreResponse) => {
    reset({ ...row });
    setEditing(row);
    setFormErrors([]);
    setWhSubmitted(false);
    lastFetchedPostalRef.current = digitsOnly(row.postal_code);
    setOpen(true);
  };

  const remove = async (row: CareCentreResponse) => {
    if ((data?.length ?? 0) <= 1) { toast.error("You must have at least 1 care centre."); return; }
    if (!confirm(`Delete care centre "${row.name}"?`)) return;
    try {
      await deleteMut.mutateAsync(row.id);
      toast.success("Care centre deleted");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Failed to delete care centre");
    }
  };

  // ── columns ─────────────────────────────────────────────────────────────────

  const cols = useMemo(() => [
    { key: "name",            header: "Name" },
    { key: "country_code",    header: "Country" },
    { key: "address",         header: "Address",  render: (v: string) => <span className="whitespace-pre-wrap break-words">{v}</span> },
    { key: "postal_code",     header: "Postal",   render: (v: string) => <span className="tabular-nums">{v}</span> },
    { key: "contact_no",      header: "Contact" },
    { key: "email",           header: "Email" },
    { key: "no_of_devices_avail", header: "Devices", render: (v: number) => <span className="tabular-nums">{v}</span> },
    { key: "working_hours",   header: "Operating Hours", render: (wh: WorkingHours) => formatWorkingHours(wh) },
  ], []);

  const isBusy = isFetching || isFetchingAddress || createMut.isPending || updateMut.isPending;

  // ── render ───────────────────────────────────────────────────────────────────

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
                <Button size="sm" variant="outline"     onClick={() => startEdit(row)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(row)}>Delete</Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="w-[92vw] max-w-2xl max-h-[85vh] overflow-y-auto"
          onOpenAutoFocus={(e) => { e.preventDefault(); setTimeout(() => setFocus("name"), 0); }}
        >
          <DialogHeader>
            <DialogTitle>
              {editing ? `Edit Centre: ${editing.name}` : "Create Care Centre"}
            </DialogTitle>
          </DialogHeader>



          <form className="space-y-5" onSubmit={handleSubmit(editing ? onUpdate : onCreate)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Name */}
              <div>
                <label className="text-sm font-medium">Name</label>
                <Controller
                  name="name" control={control}
                  rules={{ required: "Name is required", validate: (v) => isUniqueField("name", v) || "Name already exists" }}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1">
                      <Input {...field} autoFocus value={field.value ?? ""}
                        onChange={(e) => field.onChange(toAlphaNum(e.target.value))} />
                      {fieldState.error && <p className="text-xs text-destructive">{fieldState.error.message}</p>}
                    </div>
                  )}
                />
              </div>

              {/* Country code */}
              <div>
                <label className="text-sm font-medium">Country Code (ISO3)</label>
                <Controller
                  name="country_code" control={control}
                  rules={{ required: true, validate: (v) => v?.length === 3 || "Use ISO3 code" }}
                  render={({ field }) => (
                    <Input {...field} maxLength={3} value={field.value ?? ""}
                      onChange={(e) => field.onChange((e.target.value ?? "").toUpperCase().replace(/[^A-Z]/g, ""))} />
                  )}
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Address</label>
                <Controller
                  name="address" control={control}
                  rules={{ required: "Address is required", validate: (v) => isUniqueField("address", v) || "Address already exists" }}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1">
                      <Input {...field} value={field.value ?? ""}
                        onChange={(e) => field.onChange(toAlphaNumAddress(e.target.value))} />
                      {fieldState.error && <p className="text-xs text-destructive">{fieldState.error.message}</p>}
                    </div>
                  )}
                />
              </div>

              {/* Postal code */}
              <div>
                <label className="text-sm font-medium">Postal Code</label>
                <Controller
                  name="postal_code" control={control}
                  rules={{
                    required: "Postal code is required",
                    validate: (v) => {
                      const d = digitsOnly(v);
                      if (!/^\d{6}$/.test(d)) return "Postal code must be exactly 6 digits";
                      return isUniqueField("postal_code", d) || "Postal code already exists";
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1">
                      <Input {...field} inputMode="numeric" value={field.value ?? ""}
                        onChange={(e) => {
                          const cleaned = digitsOnly(e.target.value).slice(0, 6);
                          field.onChange(cleaned);
                          if (cleaned !== lastFetchedPostalRef.current) clearErrors("postal_code");
                        }}
                        onBlur={() => void lookupAddressByPostalCode(field.value)}
                      />
                      {isFetchingAddress && <p className="text-xs text-muted-foreground">Fetching address…</p>}
                      {fieldState.error  && <p className="text-xs text-destructive">{fieldState.error.message}</p>}
                    </div>
                  )}
                />
              </div>

              {/* Contact */}
              <div>
                <label className="text-sm font-medium">Contact No</label>
                <Controller
                  name="contact_no" control={control}
                  rules={{
                    required: "Contact number is required",
                    validate: (v) => {
                      const d = digitsOnly(v);
                      if (d.length !== 8) return "Contact number must be exactly 8 digits";
                      return isUniqueField("contact_no", d) || "Contact number already exists";
                    },
                  }}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1">
                      <Input {...field} inputMode="numeric" />
                      {fieldState.error && <p className="text-xs text-destructive">{fieldState.error.message}</p>}
                    </div>
                  )}
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium">Email</label>
                <Controller
                  name="email" control={control}
                  rules={{
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email format" },
                    validate: (v) => isUniqueField("email", v) || "Email already exists",
                  }}
                  render={({ field, fieldState }) => (
                    <div className="space-y-1">
                      <Input type="email" {...field} />
                      {fieldState.error && <p className="text-xs text-destructive">{fieldState.error.message}</p>}
                    </div>
                  )}
                />
              </div>

              {/* Devices */}
              <div>
                <label className="text-sm font-medium">Devices Available</label>
                <Controller
                  name="no_of_devices_avail" control={control}
                  render={({ field }) => (
                    <Input type="number" min={0}
                      value={Number.isFinite(field.value as any) ? field.value : 0}
                      onChange={(e) => { const n = e.currentTarget.valueAsNumber; field.onChange(Number.isNaN(n) ? 0 : n); }}
                    />
                  )}
                />
              </div>
            </div>

            {/* Working hours */}
            <div className="space-y-2">
              <div className="text-sm font-semibold">Operating Days &amp; Hours</div>
              <WorkingHoursInput
                value={wh}
                onChange={(next) => setValue("working_hours", next, { shouldDirty: true })}
                showErrors={whSubmitted}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isBusy}>
                {editing ? "Save changes" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}