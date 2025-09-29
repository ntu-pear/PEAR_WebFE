import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Filter, Plus } from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import CentreActivityExclusionForm, { CentreActivityExclusionFormValues } from "@/components/Form/ActivityExclusionForm";
import CentreActivityExclusionsTable from "@/components/Table/ActivityExclusionsTable";
import { useCentreActivityExclusions, type CentreActivityExclusionWithDetails } from "@/hooks/activity/useActivityExclusions";
import { useCentreActivityExclusionMutations } from "@/hooks/activity/useActivityExclusionMutations";

function confirmAction(message: string) {
  return window.confirm(message);
}

type StatusFilter = "all" | "scheduled" | "active" | "expired";

export default function ManageCentreActivityExclusions() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [creatingOpen, setCreatingOpen] = useState(false);
  const [editing, setEditing] = useState<CentreActivityExclusionWithDetails | null>(null);
  const [page, setPage] = useState(1);

  const { centreActivityExclusions, loading, error, refreshCentreActivityExclusions } = useCentreActivityExclusions();
  const { create, update, remove, isCreating, isUpdating } = useCentreActivityExclusionMutations();

  useEffect(() => {
    if (error) {
      toast.error(`Failed to load centre activity exclusions. ${error}`);
    }
  }, [error]);

  // Reset to first page whenever list or search/filter changes
  useEffect(() => setPage(1), [search, statusFilter, centreActivityExclusions]);

  const filteredData = useMemo(() => {
    let filtered = centreActivityExclusions;

    // Apply status filter
    if (statusFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter((exclusion) => {
        const start = new Date(exclusion.startDate);
        // Don't create end date if it's indefinite (including backend's 2999 marker)
        const end = exclusion.endDate && !exclusion.isIndefinite ? new Date(exclusion.endDate) : null;
        
        switch (statusFilter) {
          case "scheduled":
            return now < start;
          case "active":
            return exclusion.isIndefinite || (end && now <= end && now >= start);
          case "expired":
            return !exclusion.isIndefinite && end && now > end;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [centreActivityExclusions, statusFilter]);

  const statusCounts = useMemo(() => {
    const now = new Date();
    return centreActivityExclusions.reduce((counts, exclusion) => {
      const start = new Date(exclusion.startDate);
      // Don't create end date if it's indefinite (including backend's 2999 marker)
      const end = exclusion.endDate && !exclusion.isIndefinite ? new Date(exclusion.endDate) : null;
      
      if (now < start) {
        counts.scheduled++;
      } else if (exclusion.isIndefinite || (end && now <= end)) {
        counts.active++;
      } else if (end && now > end) {
        counts.expired++;
      }
      
      return counts;
    }, { scheduled: 0, active: 0, expired: 0 });
  }, [centreActivityExclusions]);

  const handleCreate = async (values: CentreActivityExclusionFormValues) => {
    try {
      await create(values);
      setCreatingOpen(false);
      refreshCentreActivityExclusions();
    } catch (error) {
      console.error("Error creating centre activity exclusion:", error);
    }
  };

  const handleUpdate = async (values: CentreActivityExclusionFormValues) => {
    if (!editing) return;
    
    try {
      await update({
        ...values,
        id: editing.id,
        is_deleted: false,
      });
      setEditing(null);
      refreshCentreActivityExclusions();
    } catch (error) {
      console.error("Error updating centre activity exclusion:", error);
    }
  };

  const handleDelete = async (row: CentreActivityExclusionWithDetails) => {
    const confirmed = confirmAction(
      `Are you sure you want to delete the centre activity exclusion for "${row.patientName}" from "${row.activityName}"?`
    );
    
    if (!confirmed) return;
    
    try {
      await remove(row.id);
      refreshCentreActivityExclusions();
    } catch (error) {
      console.error("Error deleting centre activity exclusion:", error);
    }
  };

  const handleEdit = (row: CentreActivityExclusionWithDetails) => {
    setEditing(row);
  };

  return (
    <div className="flex min-h-screen w-full flex-col container mx-auto px-0 sm:px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">

        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Centre Activity Exclusions</h1>
            <p className="text-muted-foreground">
              Control which centre activities patients are excluded from participating in.
            </p>
          </div>
          <Sheet open={creatingOpen} onOpenChange={setCreatingOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Centre Activity Exclusion
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>Create Centre Activity Exclusion</SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <CentreActivityExclusionForm
                  submitting={isCreating}
                  onSubmit={handleCreate}
                  onCancel={() => setCreatingOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Centre Activity Exclusions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{centreActivityExclusions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{statusCounts.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{statusCounts.scheduled}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{statusCounts.expired}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex-1 md:max-w-md">
            <Input
              placeholder="Search by centre activity, patient, or remarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Centre Activity Exclusions</CardTitle>
            <CardDescription>
              {filteredData.length} centre activity exclusion{filteredData.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading centre activity exclusions...</div>
              </div>
            ) : (
              <CentreActivityExclusionsTable
                data={filteredData}
                query={search}
                page={page}
                setPage={setPage}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>

        {/* Edit Sheet */}
        <Sheet open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Edit Centre Activity Exclusion</SheetTitle>
            </SheetHeader>
            {editing && (
              <div className="py-4">
                <CentreActivityExclusionForm
                  initial={{
                    id: editing.id,
                    centre_activity_id: editing.centreActivityId,
                    patient_id: editing.patientId,
                    exclusion_remarks: editing.exclusionRemarks,
                    start_date: editing.startDate,
                    end_date: editing.endDate,
                  }}
                  submitting={isUpdating}
                  onSubmit={handleUpdate}
                  onCancel={() => setEditing(null)}
                />
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}