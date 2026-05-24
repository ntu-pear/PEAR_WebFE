import React, { useState } from "react";
import { CardHeader, CardTitle, CardContent, Card } from "../ui/card";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "../ui/context-menu";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Heart,
  HeartCrack,
  ThumbsUp,
  ThumbsDown,
  Users,
  X,
} from "lucide-react";
import { DataTableClient, DataTableColumns } from "../Table/DataTable";
import {
  usePatientActivityPreferences,
  PatientActivityPreferenceWithRecommendation,
} from "@/hooks/activity/usePatientActivityPreferences";
import { useCentreActivityExclusions } from "@/hooks/activity/useActivityExclusions"; 
import {
  useCentreActivityExclusionMutations,
} from "@/hooks/activity/useActivityExclusionMutations";
import { useAuth } from "@/hooks/useAuth";
import {
  updateActivityPreference,
  createActivityPreference,
} from "@/api/activity/activityPreference";
import BulkActivityExclusionForm from "../Form/BulkActivityExclusionForm";
import CentreActivityExclusionForm from "../Form/ActivityExclusionForm";
import { formatDate } from "@/utils/formatDate"
import { toast } from "sonner";

interface PatientActivityPreferenceCardProps {
  patientId: string;
}

const PatientActivityPreferenceCard: React.FC<
  PatientActivityPreferenceCardProps
> = ({ patientId }) => {
  const {
    activityPreferences,
    loading,
    error,
    refreshPatientActivityPreferences,
  } = usePatientActivityPreferences(patientId);
  const { 
    centreActivityExclusions,
    refreshCentreActivityExclusions,
  } = useCentreActivityExclusions();
  const { currentUser } = useAuth();

  // Bulk selection state
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [bulkPreference, setBulkPreference] = useState<string>("");
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const { create, update, remove, isUpdating } =
    useCentreActivityExclusionMutations();

  const [isAddExclusionOpen, setIsAddExclusionOpen] = useState(false);
  const [editingExclusion, setEditingExclusion] = useState<any>(null);

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
      setSelectedItems(new Set(activityPreferences.map((item) => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleDeleteExclusion = async (exclusion: any) => {
    if (!confirm("Delete this exclusion?")) return;

    await remove(exclusion.id);

    toast.success("Exclusion deleted");

    
    refreshCentreActivityExclusions();
  };

  const handleCreateExclusion = async (values: any) => {
    await Promise.all(
      values.centre_activity_ids.map((id: number) =>
        create({
          centre_activity_id: id,
          patient_id: values.patient_id,
          exclusion_remarks: values.exclusion_remarks,
          start_date: values.start_date,
          end_date: values.end_date,
        })
      )
    );

    toast.success("Exclusion(s) created");
    setIsAddExclusionOpen(false);

    refreshCentreActivityExclusions();
  };

  const handleUpdateExclusion = async (values: any) => {
    await update({
      id: editingExclusion.id,
      centre_activity_id: values.centre_activity_id,
      patient_id: editingExclusion.patientId,
      exclusion_remarks: values.exclusion_remarks,
      start_date: values.start_date,
      end_date: values.end_date,
    });

    toast.success("Exclusion updated");
    setEditingExclusion(null);
    await Promise.resolve();

    refreshCentreActivityExclusions();
  };

  const handleBulkUpdate = async () => {
    if (selectedItems.size === 0 || !bulkPreference || !currentUser?.userId) {
      toast.error("Please select items and preference to update");
      return;
    }

    setIsBulkUpdating(true);
    try {
      const selectedPreferences = activityPreferences.filter((item) =>
        selectedItems.has(item.id)
      );

      const preferenceValue =
        bulkPreference === "LIKE" ? 1 : bulkPreference === "DISLIKE" ? -1 : 0;

      const updatePromises = selectedPreferences.map(async (pref) => {
        try {
          const hasExistingPreference =
            pref.preferenceId !== undefined && pref.preferenceId !== null;

          if (hasExistingPreference) {
            const existingPreference = {
              id: pref.preferenceId!,
              centre_activity_id: pref.centreActivityId,
              patient_id: pref.patientId,
              is_like:
                pref.patientPreference === "LIKE"
                  ? 1
                  : pref.patientPreference === "DISLIKE"
                  ? -1
                  : 0,
              is_deleted: false,
              created_date: new Date().toISOString(),
              modified_date: null,
              created_by_id: currentUser.userId,
              modified_by_id: null,
            };
            return updateActivityPreference(
              existingPreference,
              preferenceValue,
              currentUser.userId
            );
          } else {
            return createActivityPreference(
              pref.patientId,
              pref.centreActivityId,
              preferenceValue,
              currentUser.userId
            );
          }
        } catch (error) {
          console.error(
            `Error updating preference for ${pref.activityName}:`,
            error
          );
          throw error;
        }
      });

      await Promise.all(updatePromises);
      toast.success(
        `Successfully updated ${selectedItems.size} activity preferences`
      );
      setSelectedItems(new Set());
      setBulkPreference("");
      refreshPatientActivityPreferences();
    } catch (error) {
      console.error("Error bulk updating preferences:", error);
      toast.error(
        "Failed to update activity preferences. Check console for details."
      );
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
    setBulkPreference("");
  };

  const renderPreferenceBadge = (preference: string | null | undefined) => {
    if (preference === "LIKE") {
      return (
        <Badge className="bg-green-500 text-white inline-flex items-center gap-1 px-2 py-1 min-h-[28px] text-xs whitespace-nowrap">
          <Heart className="h-3 w-3 fill-current" />
          Like
        </Badge>
      );
    }
    if (preference === "DISLIKE") {
      return (
        <Badge
          variant="destructive"
          className="inline-flex items-center gap-1 px-2 py-1 min-h-[28px] text-xs whitespace-nowrap"
        >
          <HeartCrack className="h-3 w-3" />
          Dislike
        </Badge>
      );
    }
    return (
      <Badge
        variant="secondary"
        className="px-2 py-1 min-h-[28px] text-xs whitespace-nowrap"
      >
        Neutral
      </Badge>
    );
  };

  const renderRecommendationBadge = (
    recommendation: string | null | undefined
  ) => {
    if (recommendation === "RECOMMENDED") {
      return (
        <Badge className="bg-blue-500 text-white inline-flex items-center gap-1 px-2 py-1 min-h-[28px] text-xs whitespace-nowrap">
          <ThumbsUp className="h-3 w-3 fill-current" />
          Recommended
        </Badge>
      );
    }
    if (recommendation === "NOT_RECOMMENDED") {
      return (
        <Badge
          variant="destructive"
          className="inline-flex items-center gap-1 px-2 py-1 min-h-[28px] text-xs whitespace-nowrap"
        >
          <ThumbsDown className="h-3 w-3" />
          Not Recommended
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="px-2 py-1 min-h-[28px] text-xs whitespace-nowrap"
      >
        Not Set
      </Badge>
    );
  };

  const renderExclusionStatus = (activityId: number) => {
  const exclusion = centreActivityExclusions.find(
    (e) => e.centreActivityId === activityId
  );

  if (!exclusion) {
    return (
      <Badge className="bg-gray-300 text-gray-700 text-xs">
        No
      </Badge>
    );
  }

  const now = new Date();
  const isActive =
    new Date(exclusion.startDate) <= now &&
    (!exclusion.endDate || new Date(exclusion.endDate) >= now);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="relative group inline-flex justify-center cursor-context-menu">
          {/* STATUS BADGE */}
          <Badge
            className={`text-xs ${
              isActive ? "bg-red-500 text-white" : "bg-gray-400 text-white"
            }`}
          >
            {isActive ? "Yes" : "Inactive"}
          </Badge>

          {/* TOOLTIP */}
          <div className="absolute invisible group-hover:visible z-50 bg-black text-white text-xs p-2 rounded w-56 -top-2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none">
            <div><b>Start:</b> {formatDate(exclusion.startDate)}</div>
            <div>
              <b>End:</b>{" "}
              {exclusion.endDate ? formatDate(exclusion.endDate) : "Indefinite"}
            </div>
            <div>
              <b>Remarks:</b> {exclusion.exclusionRemarks || "-"}
            </div>
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem
          onSelect={(e: Event) => {
            e.preventDefault();  
            setEditingExclusion(exclusion);
          }}
        >
          ✏️ Edit Exclusion
        </ContextMenuItem>

        <ContextMenuItem
          className="text-destructive"
          onSelect={(e: Event) => {
            e.preventDefault();
            handleDeleteExclusion(exclusion);
          }}
        >
          🗑 Delete Exclusion
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

  const columns: DataTableColumns<PatientActivityPreferenceWithRecommendation> =
    [
      ...(currentUser?.roleName === "SUPERVISOR"
        ? [
            {
              key: "select" as keyof (typeof activityPreferences)[0],
              header: "Select",
              className: "w-[70px]",
              render: (_: any, item: PatientActivityPreferenceWithRecommendation) => (
                <Checkbox
                  checked={selectedItems.has(item.id)}
                  onCheckedChange={(checked: boolean) =>
                    handleSelectItem(item.id, checked)
                  }
                  aria-label={`Select ${item.activityName}`}
                />
              ),

            },
          ]
        : []),
      {
        key: "activityName",
        header: "Activity Name",
        className: "min-w-[200px]",
        render: (_value, item) => {
          if (!item.activityDescription) {
            return (
              <span className="text-sm text-gray-900 uppercase">
                {item.activityName}
              </span>
            );
          }

          return (
            <div className="relative group cursor-help">
              <span className="text-sm text-gray-900 uppercase">
                {item.activityName}
              </span>

              {/* Tooltip */}
              <div
                className="
                  absolute
                  invisible
                  group-hover:visible
                  z-50
                  bg-black
                  text-white
                  text-xs
                  p-2
                  rounded
                  shadow-lg
                  max-w-xs
                  -top-2
                  left-1/2
                  -translate-x-1/2
                  -translate-y-full
                  whitespace-normal
                "
              >
                {item.activityDescription}
              </div>
            </div>
          );
        },
      },
            {
              key: "patientPreference" as keyof (typeof activityPreferences)[0],
              header: "Patient Preference",
              className: "w-[160px] text-center",
              
      render: (value, item) => {
        const options: Array<"LIKE" | "NEUTRAL" | "DISLIKE"> =
          item.patientPreference === "LIKE"
            ? ["NEUTRAL", "DISLIKE"]
            : item.patientPreference === "DISLIKE"
            ? ["LIKE", "NEUTRAL"]
            : ["LIKE", "DISLIKE"];

        return (
          <ContextMenu>
            <ContextMenuTrigger className="flex justify-center items-center w-full min-h-[40px] cursor-context-menu">
              {renderPreferenceBadge(String(value))}
            </ContextMenuTrigger>

            <ContextMenuContent>
              {options.map((option) => (
                <ContextMenuItem
                  key={option}
                  onSelect={() => handleSingleUpdate(item, option)}
                >
                  {option === "LIKE" && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Heart className="h-4 w-4" />
                      Like
                    </div>
                  )}

                  {option === "NEUTRAL" && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="h-3 w-3 rounded-full bg-gray-400" />
                      Neutral
                    </div>
                  )}

                  {option === "DISLIKE" && (
                    <div className="flex items-center gap-2 text-red-600">
                      <HeartCrack className="h-4 w-4" />
                      Dislike
                    </div>
                  )}
                </ContextMenuItem>
              ))}
            </ContextMenuContent>
          </ContextMenu>
        );
      }

      },
      {
        key: "exclusionStatus" as keyof (typeof activityPreferences)[0],
        header: "Exclusion",
        className: "w-[100px] text-center",
        render: (_unused: any, item) => renderExclusionStatus(item.centreActivityId),
      },
      {
        key: "doctorRecommendation" as keyof (typeof activityPreferences)[0],
        header: "Doctor Recommendations",
        className: "w-[180px] text-center",
        render: (value) => (
          <div className="flex justify-center items-center w-full min-h-[40px]">
            {renderRecommendationBadge(String(value))}
          </div>
        ),
      },
      {
        key: "doctorNotes" as keyof (typeof activityPreferences)[0],
        header: "Doctor's Reasons",
        className: "min-w-[200px]",
        render: (value, item) => {
          if (!item.doctorRecommendation || !item.doctorNotes) {
            return null; // returns empty cell
          }
          return (
            <div className="relative group cursor-help text-sm text-muted-foreground">
              <span>View Notes</span>
              <div className="absolute invisible group-hover:visible z-50 bg-black text-white text-xs p-2 rounded shadow-lg max-w-xs -top-2 left-0 transform -translate-y-full">
                {value || "No notes"}
                <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
              </div>
            </div>
          );
        },
      },

    ];

  // Handle individual preference update
  const handleSingleUpdate = async (
    item: PatientActivityPreferenceWithRecommendation,
    newPreference: "LIKE" | "NEUTRAL" | "DISLIKE"
  ) => {
    if (!currentUser?.userId) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const preferenceValue =
        newPreference === "LIKE" ? 1 : newPreference === "DISLIKE" ? -1 : 0;

      // Check if this preference has an existing database record
      const hasExistingPreference =
        item.preferenceId !== undefined && item.preferenceId !== null;

      if (hasExistingPreference) {
        // Update existing preference
        const existingPreference = {
          id: item.preferenceId!,
          centre_activity_id: item.centreActivityId,
          patient_id: item.patientId,
          is_like:
            item.patientPreference === "LIKE"
              ? 1
              : item.patientPreference === "DISLIKE"
                ? -1
                : 0,
          is_deleted: false,
          created_date: new Date().toISOString(),
          modified_date: null,
          created_by_id: currentUser.userId,
          modified_by_id: null,
        };

        await updateActivityPreference(
          existingPreference,
          preferenceValue,
          currentUser.userId
        );
      } else {
        // Create new preference
        await createActivityPreference(
          item.patientId,
          item.centreActivityId,
          preferenceValue,
          currentUser.userId
        );
      }

      toast.success(`Updated "${item.activityName}" to ${newPreference}`);
      refreshPatientActivityPreferences();
    } catch (error) {
      console.error("Error updating preference:", error);
      toast.error("Failed to update preference");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Preferences</CardTitle>
          <div className="flex justify-between items-center">
            <CardTitle>Activity Preferences</CardTitle>
          </div>
          
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            Loading activity preferences...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-center">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Activity Preferences</CardTitle>
            <p className="text-sm text-muted-foreground">
              View and manage activity preferences and doctor recommendations for
                this patient. This shows all available centre activities with their
                current preference settings.
            </p>
          </div>

          <Sheet open={isAddExclusionOpen} onOpenChange={setIsAddExclusionOpen}>
            <SheetTrigger asChild>
              <Button>Add Activity Exclusion</Button>
            </SheetTrigger>

            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add Activity Exclusion</SheetTitle>
              </SheetHeader>

              <BulkActivityExclusionForm
                initial={{
                  patient_id: parseInt(patientId),
                  exclusion_remarks: "",
                  start_date: new Date().toISOString().split("T")[0],
                  end_date: null,
                }}
                onSubmit={handleCreateExclusion}
                onCancel={() => setIsAddExclusionOpen(false)}
                excludedActivityIds={
                  new Set(
                    centreActivityExclusions.map((e) => e.centreActivityId)
                  )
                }
              />
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>
      <CardContent>
        {/* Bulk Selection Controls */}
        {currentUser?.roleName === "SUPERVISOR" && (
          <div className="mb-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={
                    selectedItems.size === activityPreferences.length &&
                    activityPreferences.length > 0
                  }
                  onCheckedChange={(checked: boolean) =>
                    handleSelectAll(checked)
                  }
                  aria-label="Select all"
                />
                <span className="text-sm font-medium">
                  Select All ({selectedItems.size}/{activityPreferences.length})
                </span>
              </div>

              {selectedItems.size > 0 && (
                <>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">
                      {selectedItems.size} item
                      {selectedItems.size > 1 ? "s" : ""} selected
                    </span>
                  </div>

                  <Select
                    value={bulkPreference}
                    onValueChange={setBulkPreference}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Set preference to..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LIKE">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4 text-green-500" />
                          Like
                        </div>
                      </SelectItem>
                      <SelectItem value="NEUTRAL">
                        <div className="flex items-center gap-2">
                          <span className="h-4 w-4 rounded-full bg-gray-400" />
                          Neutral
                        </div>
                      </SelectItem>
                      <SelectItem value="DISLIKE">
                        <div className="flex items-center gap-2">
                          <HeartCrack className="h-4 w-4 text-red-500" />
                          Dislike
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleBulkUpdate}
                    disabled={!bulkPreference || isBulkUpdating}
                    className="flex items-center gap-2"
                  >
                    {isBulkUpdating ? "Updating..." : "Update Selected"}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={clearSelection}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        <DataTableClient
          data={activityPreferences}
          columns={columns}
          itemsPerPage={50} 
          viewMore={false}
          hideActionsHeader={true}
          renderActions={undefined}
        />
      </CardContent>
      <Sheet
        open={!!editingExclusion}
        modal={false}
        onOpenChange={(open) => {
          if (!open) setEditingExclusion(null);
        }}
      >
        <SheetContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          
          <SheetHeader>
            <SheetTitle>Edit Exclusion</SheetTitle>
          </SheetHeader>

          {editingExclusion && (
            <CentreActivityExclusionForm
              initial={{
                id: editingExclusion?.id,
                centre_activity_id: editingExclusion?.centreActivityId,
                patient_id: editingExclusion?.patientId,
                exclusion_remarks: editingExclusion?.exclusionRemarks || "",
                start_date: editingExclusion?.startDate,
                end_date: editingExclusion?.endDate || null,
              }}
              isEditing
              onSubmit={handleUpdateExclusion}
              onCancel={() => setEditingExclusion(null)}
              submitting={isUpdating}
            />
          )}
        </SheetContent>
      </Sheet>
    </Card>
  );
};

export default PatientActivityPreferenceCard;
