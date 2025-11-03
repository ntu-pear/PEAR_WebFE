import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Filter, Plus } from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCentreActivities } from "@/hooks/activities/useCentreActivities";
import { useCentreActivityAvailabilities, useCentreActivityAvailabilityMutations, type CentreActivityAvailabilityRow, toRows} from "@/hooks/activities/useCentreActivityAvailabilities";
import AvailabilityTable from "@/components/Table/ActivityAvailabilityTable";
import ActivityAvailabilityForm from "@/components/Form/ActivityAvailabilityForm";
import { CentreActivityAvailabilityFormValues } from "@/lib/validation/activityAvailability";
import dayjs from "dayjs";

function confirmAction(message: string) {
  return window.confirm(message);
}

export default function ManageActivityAvailabilities() {
    const [includeDeleted, setIncludeDeleted] = useState(false);
    const [search, setSearch] = useState("");
    const [creatingOpen, setCreatingOpen] = useState(false);
    const [editing, setEditing] = useState<CentreActivityAvailabilityRow | null>(null);
    const [page, setPage] = useState(1);
    const {centreActivityAvailabilities, loading, error, refreshCentreActivityAvailabilities} = useCentreActivityAvailabilities(true);
    const {create, update, remove} = useCentreActivityAvailabilityMutations();
    const {centreActivities} = useCentreActivities(false);
    const [selectedCentreActivityID, setselectedCentreActivityID] = useState("0");
    const todayDate = dayjs(new Date().toDateString().split('T')[0]).format("YYYY-MM-DD");

    useEffect(() => {
        if (error) toast.error(`Failed to load availabilities. ${error}`);
    }, [error]);

    useEffect(() => {
        setPage(1)
    }, [search, includeDeleted, centreActivityAvailabilities]);
    
    const selectedCentreActivity = useMemo(() => {
        let filtered = centreActivities;
        if (selectedCentreActivityID != "") {
            filtered = filtered.filter(ca => ca.id == parseInt(selectedCentreActivityID))
        }
        return filtered[0];
    }, [centreActivities, selectedCentreActivityID]);
        
    const filteredData = useMemo(() => {
        let filtered = centreActivityAvailabilities;

        if (selectedCentreActivityID != "") {
            setselectedCentreActivityID(selectedCentreActivityID);
            filtered = filtered.filter(caa => caa.centre_activity_id == parseInt(selectedCentreActivityID))
        }

        //Show or hide deleted from list
        if (!includeDeleted) {
            setIncludeDeleted(false);
            filtered = filtered.filter(caa => caa.is_deleted == false);
        }

        return toRows(filtered ?? []);
    }, [centreActivityAvailabilities, includeDeleted, selectedCentreActivityID]);

    const handleCreate = async (values: CentreActivityAvailabilityFormValues) => {
        try {
          await create.mutateAsync({
            centre_activity_id: values.centre_activity_id,
            start_time: values.start_time,
            end_time: values.end_time,
            is_everyday: values.is_everyday,
          });
          setCreatingOpen(false);
          refreshCentreActivityAvailabilities();
          toast.success("Centre Activity Availability created.");
        }
        catch (error: any) {
          console.error("Error creating centre activity:", error)
          toast.error(`Failed to create. ${error?.message ?? ""}`);
        }
    };

    const handleUpdate = async (values: CentreActivityAvailabilityFormValues) => {
        if (!editing) return;

        try {
            await update.mutateAsync({
                id: editing.id,
                centre_activity_id: values.centre_activity_id,
                start_time: values.start_time,
                end_time: values.end_time,
                is_deleted: values.is_deleted,
            });
            setEditing(null);
            refreshCentreActivityAvailabilities();
            toast.success("Centre Activity Availability updated.");
        }
        catch (error: any) {
            console.error("Error updating availability:", error)
            toast.error(`Failed to update. ${error?.message ?? ""}`);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
            {/* Header */}
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                <div className="flex justify-between items-center">
                    <div className="w-full md:max-w-md">
                        <Input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="h-11"
                        />
                    </div>
                    <div className="flex space-x-2">
                        <Button
                        type="button"
                        variant="outline"
                        className={`h-9 ${includeDeleted ? "border-primary" : ""}`}
                        onClick={() => setIncludeDeleted(v => !v)}
                        >
                        <Filter className="mr-2 h-4 w-4" />
                        {includeDeleted ? "Showing Deleted" : "Deleted Hidden"}
                        </Button>
                    </div>
                </div>

                <main className="flex-1 items-start gap-4 p-4 sm:px-0 sm:py-0">
                    <Card>
                    <CardHeader>
                        <div className="flex justify-between items-end">
                            <div className="space-y-1.5">
                                <CardTitle>Manage Centre Activity Availability</CardTitle>
                                <CardDescription>Manage availabity of centre activities</CardDescription>
                            </div>

                            {/* Create sheet */}
                            <Sheet open={creatingOpen} onOpenChange={setCreatingOpen}>
                                <SheetTrigger asChild>
                                    <Button className="h-10">
                                        <Plus className="mr-2 h-4 w-4"/>
                                        Add Availability
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="w-[680px] sm:w-[540px]">
                                    <SheetHeader><SheetTitle>Create Availability</SheetTitle></SheetHeader>
                                    <div className="h-[90vh] overflow-y-auto">
                                        <ActivityAvailabilityForm
                                            initial={{
                                                id: 0,
                                                centre_activity_id: 0,
                                                date: "",
                                                start_time: "",
                                                end_time: "",
                                                is_deleted: false,
                                                is_everyday: false,
                                                editing: false,
                                                selectedCentreActivityData: selectedCentreActivity
                                            }}
                                            submitting={create.isPending}
                                            onSubmit={handleCreate}
                                            onCancel={() => setCreatingOpen(false)}
                                        />
                                    </div>
                                </SheetContent>
                            </Sheet>
                        </div>
                    </CardHeader>

                    <CardContent className="overflow-x-auto">
                        <div className="p-1 flex">
                            <Label htmlFor="centre_activity_id" className="p-3">Select centre activity to schedule:</Label>
                            <select
                                id="centre_activity_id"
                                value={selectedCentreActivityID}         
                                onChange={(e) => {
                                    setselectedCentreActivityID(e.target.value);
                                }}
                                className="flex h-10 w-80 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
                            >
                                <option value="0" disabled>Select an centre activity to schedule</option>
                                {centreActivities.map((a) => (
                                    <option key={a.id} value={a.id.toString()}>
                                        {a.id}. {a.activity_title}
                                    </option>
                                ))}
                            </select>
                        </div>
                            
                        {loading ? (<div className="p-4 text-sm text-muted-foreground">Loading…</div>) : (
                            <div className="p-1">
                                <AvailabilityTable
                                    data={filteredData}
                                    query={search}
                                    page={page}
                                    setPage={setPage}
                                    onEdit={(row) => setEditing(row)}
                                    onDelete={(row) => {
                                        const msg = "Deleting this availability will remove it from patient schedules. Schedules may have to be regenerated. Do you wish to continue?";
                                        if (confirmAction(msg)) {
                                            remove.mutate(row.id, {
                                            onSuccess: () => {
                                                refreshCentreActivityAvailabilities();
                                                toast.success("Availability Deleted.");
                                            },
                                            onError: (err: any) => toast.error(`Failed to delete. ${err.message ?? ""}`),
                                            })
                                        }
                                    }}
                                />
                            </div>
                        )}

                        {/* Edit sheet */}
                        <Sheet open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
                            <SheetContent className="w-[480px] sm:w-[540px]">
                                <SheetHeader><SheetTitle>Edit Availability</SheetTitle></SheetHeader>
                                {editing && (
                                <div className="h-[90vh] overflow-y-auto">  
                                    <ActivityAvailabilityForm
                                        initial={{
                                            id: editing.id,
                                            centre_activity_id: editing.centre_activity_id,
                                            date: new Date(editing.start_time) < new Date() ? todayDate : dayjs(editing.start_time.split('T')[0]).format("YYYY-MM-DD"),
                                            start_time: editing.start_time,
                                            end_time: editing.end_time,
                                            is_deleted: editing.is_deleted,
                                            is_everyday: false,
                                            editing: true,
                                            selectedCentreActivityData: selectedCentreActivity
                                        }}
                                        onSubmit={handleUpdate}
                                        submitting={update.isPending}
                                        onCancel={() => setEditing(null)}
                                    />
                                </div>
                                )}
                            </SheetContent>
                        </Sheet>
                    </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
};