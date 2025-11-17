import React, { useState } from "react";
import { CardHeader, CardTitle, CardContent, Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { Calendar, Ban, Plus, Trash2, Edit } from "lucide-react";
import { DataTableClient } from "../Table/DataTable";
import { useCentreActivityExclusions } from "@/hooks/activity/useActivityExclusions";
import { useCentreActivityExclusionMutations } from "@/hooks/activity/useActivityExclusionMutations";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import CentreActivityExclusionForm, { CentreActivityExclusionFormValues } from "../Form/ActivityExclusionForm";
import BulkActivityExclusionForm, { BulkCentreActivityExclusionFormValues } from "../Form/BulkActivityExclusionForm";

interface ActivityExclusionCardProps {
  patientId: string;
}

const CentreActivityExclusionCard: React.FC<ActivityExclusionCardProps> = ({ patientId }) => {
  const { centreActivityExclusions, loading, error, refreshCentreActivityExclusions } = useCentreActivityExclusions();
  const { create, update, remove, isUpdating } = useCentreActivityExclusionMutations();
  const { currentUser } = useAuth();
  
  // Bulk selection state
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isAddExclusionOpen, setIsAddExclusionOpen] = useState(false);
  const [editingExclusion, setEditingExclusion] = useState<any>(null);
  const [isCreatingExclusions, setIsCreatingExclusions] = useState(false);

  // Helper function to format dates as DD/MMM/YYYY
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Filter data for this specific patient
  const filteredExclusions = centreActivityExclusions.filter((exclusion) => 
    exclusion.patientId.toString() === patientId
  );

  // Bulk selection handlers
  const handleSelectItem = (itemId: number, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(itemId);
    } else {
      newSelected.delete(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredExclusions.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedItems.size} exclusion(s)?`)) {
      return;
    }

    setIsBulkDeleting(true);
    try {
      const deletePromises = Array.from(selectedItems).map(id => remove(id));
      await Promise.all(deletePromises);
      
      toast.success(`Successfully deleted ${selectedItems.size} exclusion(s)`);
      setSelectedItems(new Set());
      refreshCentreActivityExclusions();
    } catch (error) {
      toast.error('Failed to delete exclusions');
      console.error('Error deleting exclusions:', error);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleCreateExclusion = async (values: BulkCentreActivityExclusionFormValues) => {
    setIsCreatingExclusions(true);
    try {
      console.log('Creating exclusions with values:', values);
      
      // Create exclusions for each selected activity
      const createPromises = values.centre_activity_ids.map(activityId =>
        create({
          centre_activity_id: activityId,
          patient_id: values.patient_id,
          exclusion_remarks: values.exclusion_remarks,
          start_date: values.start_date,
          end_date: values.end_date
        })
      );
      
      await Promise.all(createPromises);
      
      const count = values.centre_activity_ids.length;
      toast.success(`Successfully created ${count} exclusion${count === 1 ? '' : 's'}`);
      setIsAddExclusionOpen(false);
      refreshCentreActivityExclusions();
    } catch (error) {
      toast.error('Failed to create exclusions');
      console.error('Error creating exclusions:', error);
    } finally {
      setIsCreatingExclusions(false);
    }
  };

  const handleEditExclusion = (exclusion: any) => {
    setEditingExclusion(exclusion);
  };

  const handleUpdateExclusion = async (values: CentreActivityExclusionFormValues) => {
    if (!editingExclusion) return;
    
    try {
      console.log('Updating exclusion with values:', values);
      console.log('Editing exclusion:', editingExclusion);
      
      const updateData = {
        id: editingExclusion.id,
        centre_activity_id: values.centre_activity_id,
        patient_id: editingExclusion.patientId, // Keep existing patient, don't allow change
        exclusion_remarks: values.exclusion_remarks,
        start_date: values.start_date,
        end_date: values.end_date
      };
      
      console.log('Sending update data:', updateData);
      await update(updateData);
      
      console.log('Update successful, closing form and refreshing data');
      setEditingExclusion(null);
      refreshCentreActivityExclusions();
    } catch (error) {
      toast.error('Failed to update exclusion');
      console.error('Error updating exclusion:', error);
    }
  };

  const handleDeleteSingle = async (exclusion: any) => {
    if (!confirm('Are you sure you want to delete this exclusion?')) {
      return;
    }

    try {
      await remove(exclusion.id);
      toast.success('Activity exclusion deleted successfully');
      refreshCentreActivityExclusions();
    } catch (error) {
      toast.error('Failed to delete exclusion');
      console.error('Error deleting exclusion:', error);
    }
  };



  const renderExclusionStatus = (startDate: string, endDate?: string | null) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    const now = new Date();
    
    if (now < start) {
      return <Badge variant="pending">Pending</Badge>;
    } else if (!end) {
      return <Badge variant="approve">Active (Indefinite)</Badge>;
    } else if (now <= end) {
      return <Badge variant="approve">Active</Badge>;
    } else {
      return <Badge variant="reject">Expired</Badge>;
    }
  };

  const columns = [
    {
      key: "_select",
      header: (
        <Checkbox
          checked={selectedItems.size === filteredExclusions.length && filteredExclusions.length > 0}
          onCheckedChange={handleSelectAll}
          aria-label="Select all"
        />
      ),
      render: (_: any, item: any) => (
        <Checkbox
          checked={selectedItems.has(item.id)}
          onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
          aria-label={`Select ${item.activityName}`}
        />
      ),
      className: "w-12",
    },
    {
      key: "activityName" as keyof typeof centreActivityExclusions[0],
      header: "Centre Activity Name",
      className: "min-w-[200px]",
    },
    {
      key: "startDate" as keyof typeof centreActivityExclusions[0],
      header: "Start Date",
      className: "min-w-[120px]",
      render: (value: string) => {
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{formatDate(value)}</span>
          </div>
        );
      },
    },
    {
      key: "endDate" as keyof typeof centreActivityExclusions[0],
      header: "End Date",
      className: "min-w-[120px]",
      render: (value: string | null | undefined, item: any) => {
        if (!value || item.isIndefinite) {
          return (
            <Badge variant="outline" className="inline-flex items-center gap-1">
              <Ban className="h-3 w-3" />
              Indefinite
            </Badge>
          );
        }
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{formatDate(value)}</span>
          </div>
        );
      },
    },
    {
      key: "_status",
      header: "Status",
      className: "min-w-[120px]",
      render: (_: any, item: any) => renderExclusionStatus(item.startDate, item.endDate),
    },
    {
      key: "exclusionRemarks" as keyof typeof centreActivityExclusions[0],
      header: "Remarks",
      className: "min-w-[200px] max-w-[300px]",
      render: (value: string | null | undefined) => {
        const remarks = value || "No remarks";
        const isLongRemarks = remarks.length > 60;
        
        return (
          <div className="group relative">
            <div className={`${isLongRemarks ? 'line-clamp-2' : ''} text-sm leading-relaxed`}>
              {remarks}
            </div>
            {isLongRemarks && (
              <div className="absolute invisible group-hover:visible bg-black text-white text-xs p-2 rounded shadow-lg z-10 max-w-sm -top-2 left-0 transform -translate-y-full">
                {remarks}
                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "_actions",
      header: "Actions",
      className: "w-[100px]",
      render: (_: any, item: any) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditExclusion(item)}
            disabled={!currentUser || (currentUser.roleName !== "SUPERVISOR" && currentUser.roleName !== "PRIMARY_GUARDIAN")}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit exclusion</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteSingle(item)}
            disabled={!currentUser || (currentUser.roleName !== "SUPERVISOR" && currentUser.roleName !== "PRIMARY_GUARDIAN")}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete exclusion</span>
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Centre Activity Exclusions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Centre Activity Exclusions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Centre Activity Exclusions</CardTitle>
          <div className="flex items-center gap-3">
            {selectedItems.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {selectedItems.size} selected
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            )}
            <Sheet open={isAddExclusionOpen} onOpenChange={setIsAddExclusionOpen}>
              <SheetTrigger asChild>
                <Button
                  disabled={!currentUser || (currentUser.roleName !== "SUPERVISOR" && currentUser.roleName !== "PRIMARY_GUARDIAN")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Exclusions
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">

                <div className="mt-6 pb-6">
                  <BulkActivityExclusionForm
                    initial={{
                      patient_id: parseInt(patientId),
                      exclusion_remarks: "",
                      start_date: new Date().toISOString().split('T')[0],
                      end_date: null
                    }}
                    onSubmit={handleCreateExclusion}
                    onCancel={() => setIsAddExclusionOpen(false)}
                    excludedActivityIds={new Set(filteredExclusions.map(e => e.centreActivityId))}
                    submitting={isCreatingExclusions}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Edit Exclusion Sheet */}
            <Sheet open={!!editingExclusion} onOpenChange={(open) => !open && setEditingExclusion(null)}>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Edit Activity Exclusion</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  {editingExclusion && (
                    <CentreActivityExclusionForm
                      initial={{
                        id: editingExclusion.id,
                        centre_activity_id: editingExclusion.centreActivityId,
                        patient_id: editingExclusion.patientId,
                        exclusion_remarks: editingExclusion.exclusionRemarks,
                        start_date: editingExclusion.startDate,
                        end_date: editingExclusion.endDate
                      }}
                      isEditing={true}
                      onSubmit={handleUpdateExclusion}
                      onCancel={() => setEditingExclusion(null)}
                      submitting={isUpdating}
                    />
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTableClient
          data={filteredExclusions}
          columns={columns as any}
          viewMore={false}
          hideActionsHeader={true}
        />
        {filteredExclusions.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No activity exclusions found for this patient.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CentreActivityExclusionCard;
