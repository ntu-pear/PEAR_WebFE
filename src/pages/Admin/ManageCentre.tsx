import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, Plus, Pencil, Trash2, RefreshCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
import { normalizeWorkingHours, validateWorkingHours } from "@/lib/validation/time";
import { fetchAddress } from "@/api/geocode";

type FormValues = CreateCareCentre;

// ── helpers ───────────────────────────────────────────────────────────────────

const capitalize        = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const norm              = (s?: string | null) => (s ?? "").trim().toLowerCase();
const digitsOnly        = (s?: string | null) => (s ?? "").replace(/\D/g, "");
const toAlphaNumAddress = (s?: string | null) =>
  (s ?? "").toUpperCase().replace(/[^A-Z0-9\s/#,-]/g, "").replace(/\s+/g, " ").trimStart();
const toAlphaNum        = (s?: string | null) =>
  (s ?? "").toUpperCase().replace(/[^A-Z0-9\s]/g, "").replace(/\s+/g, " ").trimStart();

// null open/close = closed day (matches lib normalizeWorkingHours output).
const isDayClosed = (d?: WorkingHourDay | null): boolean =>
  d?.open == null && d?.close == null;

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
            <span className="text-muted-foreground">{display}</span>
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

  const [open,         setOpen]         = useState(false);
  const [editing,      setEditing]      = useState<CareCentreResponse | null>(null);
  const [whSubmitted,  setWhSubmitted]  = useState(false);
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);

  const lastFetchedPostalRef   = useRef<string>("");
  const postalLookupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    control, handleSubmit, reset, watch,
    setValue, setFocus, getValues, setError, clearErrors,
  } = useForm<FormValues>({ defaultValues: emptyForm() });

  const wh         = watch("working_hours");
  const postalCode = watch("postal_code");

  // ── uniqueness ────────────────────────────────────────────────────────────

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

  // ── postal lookup ─────────────────────────────────────────────────────────

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
      if (digitsOnly(getValues("postal_code")) === cleaned) void lookupAddressByPostalCode(cleaned);
    }, 500);
    return () => { if (postalLookupTimeoutRef.current) clearTimeout(postalLookupTimeoutRef.current); };
  }, [postalCode]);

  // ── working-hours validation ──────────────────────────────────────────────
  // Uses the project lib: normalizeWorkingHours converts blank strings to null,
  // then validateWorkingHours checks presence, grid, range, and order.

  const validateAndGetWH = (): WorkingHours | null => {
    setWhSubmitted(true);

    // normalizeWorkingHours converts "" -> null, keeping real times intact.
    const normalized = normalizeWorkingHours(wh as any) as WorkingHours;

    const { byDay, anyError } = validateWorkingHours(normalized);

    if (!anyError) return normalized;

    // Surface per-day errors as toasts (inline errors handle the rest).
    Object.entries(byDay).forEach(([day, msgs]) => {
      msgs.forEach((m) => toast.error(`${capitalize(day)}: ${m}`));
    });

    return null;
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────

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
    setWhSubmitted(false);
    lastFetchedPostalRef.current = "";
    setOpen(true);
  };

  const startEdit = (row: CareCentreResponse) => {
    reset({ ...row });
    setEditing(row);
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

  // ── columns ───────────────────────────────────────────────────────────────

  const cols = useMemo(() => [
    {
      key: "name",
      header: "CENTRE",
      className: "font-bold text-foreground tracking-tight px-4",
    },
    {
      key: "country_code",
      header: "COUNTRY",
      className: "w-[100px] px-4",
      render: (v: string) => (
        <Badge variant="outline" className="border-primary/10 bg-secondary text-primary uppercase text-[9px] font-bold tracking-widest px-2 py-0">
          {v}
        </Badge>
      ),
    },
    {
      key: "address",
      header: "ADDRESS",
      className: "px-4",
      render: (v: string) => (
        <span className="text-[13px] text-muted-foreground font-medium whitespace-pre-wrap break-words max-w-[280px] block">{v}</span>
      ),
    },
    {
      key: "postal_code",
      header: "POSTAL",
      className: "w-[100px] px-4",
      render: (v: string) => <span className="font-mono text-[11px] tabular-nums">{v}</span>,
    },
    {
      key: "contact_no",
      header: "CONTACT",
      className: "w-[130px] px-4",
      render: (v: string) => <span className="font-mono text-[12px] tabular-nums">{v}</span>,
    },
    {
      key: "no_of_devices_avail",
      header: "DEVICES",
      className: "w-[90px] px-4",
      render: (v: number) => <span className="tabular-nums font-bold text-foreground">{v}</span>,
    },
    {
      key: "working_hours",
      header: "HOURS",
      className: "px-4",
      render: (wh: WorkingHours) => formatWorkingHours(wh),
    },
  ], []);

  const isBusy = isFetching || isFetchingAddress || createMut.isPending || updateMut.isPending;

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Page header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
          <div className="flex items-center gap-5">
            <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-xl shadow-primary/10">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">Care Centres</h1>
              <p className="text-muted-foreground text-sm font-medium tracking-wide">
                Manage facility locations, contact details, and operating hours.
              </p>
            </div>
          </div>
          <Button onClick={startCreate} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            New Centre
          </Button>
        </header>

        {/* Table card */}
        <Card className="border border-border shadow-sm bg-card overflow-hidden rounded-2xl">
          <div className="p-5 border-b border-border bg-muted/30 flex items-center gap-4">
            <div className="flex-1" />
            <Button
              variant="outline"
              size="icon"
              onClick={() => window.location.reload()}
              className="shrink-0 bg-background border-border text-muted-foreground hover:text-foreground"
            >
              <RefreshCcw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <DataTableClient<CareCentreResponse>
              data={data}
              columns={cols as any}
              viewMore={false}
              hideActionsHeader={false}
              renderActions={(row) => (
                <div className="flex gap-1.5 justify-end">
                  <Button
                    variant="ghost" size="sm"
                    className="text-muted-foreground hover:text-primary hover:bg-accent"
                    onClick={() => startEdit(row)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost" size="sm"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => remove(row)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              )}
            />
          </div>
        </Card>

        {/* Footer notice */}
        <footer className="flex items-center gap-3 px-5 py-4 bg-muted/40 rounded-2xl border border-border">
          <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest">
            Changes to care centres affect scheduling and device availability across the system.
          </p>
        </footer>

      </div>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="w-[92vw] max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl"
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
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Name</label>
                <Controller
                  name="name" control={control}
                  rules={{ required: "Name is required", validate: (v) => isUniqueField("name", v) || "Name already exists" }}
                  render={({ field, fieldState }) => (
                    <>
                      <Input {...field} autoFocus value={field.value ?? ""}
                        onChange={(e) => field.onChange(toAlphaNum(e.target.value))} />
                      {fieldState.error && <p className="text-xs text-destructive">{fieldState.error.message}</p>}
                    </>
                  )}
                />
              </div>

              {/* Country code */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Country Code (ISO3)</label>
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
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Address</label>
                <Controller
                  name="address" control={control}
                  rules={{ required: "Address is required", validate: (v) => isUniqueField("address", v) || "Address already exists" }}
                  render={({ field, fieldState }) => (
                    <>
                      <Input {...field} value={field.value ?? ""}
                        onChange={(e) => field.onChange(toAlphaNumAddress(e.target.value))} />
                      {fieldState.error && <p className="text-xs text-destructive">{fieldState.error.message}</p>}
                    </>
                  )}
                />
              </div>

              {/* Postal code */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Postal Code</label>
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
                    <>
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
                    </>
                  )}
                />
              </div>

              {/* Contact */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Contact No</label>
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
                    <>
                      <Input {...field} inputMode="numeric" />
                      {fieldState.error && <p className="text-xs text-destructive">{fieldState.error.message}</p>}
                    </>
                  )}
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Email</label>
                <Controller
                  name="email" control={control}
                  rules={{
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email format" },
                    validate: (v) => isUniqueField("email", v) || "Email already exists",
                  }}
                  render={({ field, fieldState }) => (
                    <>
                      <Input type="email" {...field} />
                      {fieldState.error && <p className="text-xs text-destructive">{fieldState.error.message}</p>}
                    </>
                  )}
                />
              </div>

              {/* Devices */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Devices Available</label>
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
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Operating Days &amp; Hours
              </p>
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