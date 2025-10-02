import React, { useState } from "react";
import { CardHeader, CardTitle, CardContent, Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Heart, HeartCrack, ThumbsUp, ThumbsDown, Users, X } from "lucide-react";
import { DataTableClient } from "../Table/DataTable";
import { usePatientActivityPreferences, PatientActivityPreferenceWithRecommendation } from "@/hooks/activity/usePatientActivityPreferences";
import { useAuth } from "@/hooks/useAuth";
import { updateActivityPreference, createActivityPreference } from "@/api/activity/activityPreference";
import { toast } from "sonner";

interface PatientActivityPreferenceCardProps {
  patientId: string;
}

const PatientActivityPreferenceCard: React.FC<PatientActivityPreferenceCardProps> = ({ 
  patientId
}) => {
  const { activityPreferences, loading, error, refreshPatientActivityPreferences } = usePatientActivityPreferences(patientId);
  const { currentUser } = useAuth();
  
  // Bulk selection state
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [bulkPreference, setBulkPreference] = useState<string>("");
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

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
      setSelectedItems(new Set(activityPreferences.map(item => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedItems.size === 0 || !bulkPreference || !currentUser?.userId) {
      toast.error("Please select items and preference to update");
      return;
    }

    setIsBulkUpdating(true);
    try {
      const selectedPreferences = activityPreferences.filter(item => 
        selectedItems.has(item.id)
      );

      // Convert preference string to number for API
      const preferenceValue = bulkPreference === "LIKE" ? 1 : 
                            bulkPreference === "DISLIKE" ? -1 : 0;

      console.log("Bulk updating preferences:", {
        selectedCount: selectedPreferences.length,
        preference: bulkPreference,
        preferenceValue,
        userId: currentUser.userId
      });

      // Update all selected preferences
      const updatePromises = selectedPreferences.map(async (pref) => {
        try {
          // Check if this preference has an existing database record
          const hasExistingPreference = pref.preferenceId !== undefined && pref.preferenceId !== null;
          
          if (hasExistingPreference) {
            // Update existing preference using the actual database ID
            const existingPreference = {
              id: pref.preferenceId!, // Use actual database ID
              centre_activity_id: pref.centreActivityId,
              patient_id: pref.patientId,
              is_like: pref.patientPreference === "LIKE" ? 1 : 
                      pref.patientPreference === "DISLIKE" ? -1 : 0,
              is_deleted: false,
              created_date: new Date().toISOString(),
              modified_date: null,
              created_by_id: currentUser.userId,
              modified_by_id: null
            };
            
            console.log("Updating existing preference:", {
              activityName: pref.activityName,
              preferenceId: pref.preferenceId,
              centreActivityId: pref.centreActivityId,
              currentValue: pref.patientPreference,
              newValue: bulkPreference
            });
            
            return updateActivityPreference(
              existingPreference,
              preferenceValue,
              currentUser.userId
            );
          } else {
            // Create new preference
            console.log("Creating new preference:", {
              activityName: pref.activityName,
              centreActivityId: pref.centreActivityId,
              patientId: pref.patientId,
              newValue: bulkPreference
            });
            
            return createActivityPreference(
              pref.patientId,
              pref.centreActivityId,
              preferenceValue,
              currentUser.userId
            );
          }
        } catch (error) {
          console.error(`Error updating preference for ${pref.activityName}:`, error);
          throw error;
        }
      });

      await Promise.all(updatePromises);

      toast.success(`Successfully updated ${selectedItems.size} activity preferences`);
      
      // Clear selections and refresh data
      setSelectedItems(new Set());
      setBulkPreference("");
      refreshPatientActivityPreferences();
    } catch (error) {
      console.error("Error bulk updating preferences:", error);
      toast.error("Failed to update activity preferences. Check console for details.");
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
        <Badge variant="destructive" className="inline-flex items-center gap-1 px-2 py-1 min-h-[28px] text-xs whitespace-nowrap">
          <HeartCrack className="h-3 w-3" />
          Dislike
        </Badge>
      );
    }
    if (preference === "NEUTRAL") {
      return <Badge variant="secondary" className="px-2 py-1 min-h-[28px] text-xs whitespace-nowrap">Neutral</Badge>;
    }
    return <Badge variant="outline" className="px-2 py-1 min-h-[28px] text-xs whitespace-nowrap">Neutral</Badge>;
  };

  const renderRecommendationBadge = (recommendation: string | null | undefined) => {
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
        <Badge variant="destructive" className="inline-flex items-center gap-1 px-2 py-1 min-h-[28px] text-xs whitespace-nowrap">
          <ThumbsDown className="h-3 w-3" />
          Not Recommended
        </Badge>
      );
    }
    return <Badge variant="outline" className="px-2 py-1 min-h-[28px] text-xs whitespace-nowrap">Not Set</Badge>;
  };

  const columns = [
    // Checkbox column for bulk selection (only for supervisors)
    ...(currentUser?.roleName === "SUPERVISOR" ? [{
      key: "select" as keyof typeof activityPreferences[0],
      header: "Select",
      className: "w-[70px]",
      render: (_: any, item: PatientActivityPreferenceWithRecommendation) => (
        <Checkbox
          checked={selectedItems.has(item.id)}
          onCheckedChange={(checked: boolean) => handleSelectItem(item.id, checked)}
          aria-label={`Select ${item.activityName}`}
        />
      ),
    }] : []),
    {
      key: "activityName" as keyof typeof activityPreferences[0],
      header: "Activity Name",
      className: "min-w-[200px]",
    },
    {
      key: "activityDescription" as keyof typeof activityPreferences[0],
      header: "Description",
      className: "min-w-[250px]",
      render: (value: string | null | undefined) => (
        <div className="text-sm text-muted-foreground">
          {value || "No description available"}
        </div>
      ),
    },
    {
      key: "patientPreference" as keyof typeof activityPreferences[0],
      header: "Patient Preference",
      headerClassName: "text-center",
      className: "w-[160px] text-center",
      render: (value: string | null | undefined) => (
        <div className="flex justify-center items-center w-full min-h-[40px]">
          {renderPreferenceBadge(value)}
        </div>
      ),
    },
    {
      key: "doctorRecommendation" as keyof typeof activityPreferences[0],
      header: "Doctor Recommendation", 
      headerClassName: "text-center",
      className: "w-[180px] text-center",
      render: (value: string | null | undefined) => (
        <div className="flex justify-center items-center w-full min-h-[40px]">
          {renderRecommendationBadge(value)}
        </div>
      ),
    },
    {
      key: "doctorNotes" as keyof typeof activityPreferences[0],
      header: "Doctor Notes",
      className: "min-w-[200px]",
      render: (value: string | null | undefined) => (
        <div className="text-sm text-muted-foreground">
          {value || "No notes provided"}
        </div>
      ),
    },
  ];

  // Handle individual preference update
  const handleSingleUpdate = async (item: PatientActivityPreferenceWithRecommendation, newPreference: "LIKE" | "NEUTRAL" | "DISLIKE") => {
    if (!currentUser?.userId) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const preferenceValue = newPreference === "LIKE" ? 1 : newPreference === "DISLIKE" ? -1 : 0;
      
      // Check if this preference has an existing database record
      const hasExistingPreference = item.preferenceId !== undefined && item.preferenceId !== null;
      
      if (hasExistingPreference) {
        // Update existing preference
        const existingPreference = {
          id: item.preferenceId!,
          centre_activity_id: item.centreActivityId,
          patient_id: item.patientId,
          is_like: item.patientPreference === "LIKE" ? 1 : 
                  item.patientPreference === "DISLIKE" ? -1 : 0,
          is_deleted: false,
          created_date: new Date().toISOString(),
          modified_date: null,
          created_by_id: currentUser.userId,
          modified_by_id: null
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

  // Define actions render function for supervisors
  const renderActions = currentUser?.roleName === "SUPERVISOR" ? (item: PatientActivityPreferenceWithRecommendation) => (
    <div className="flex justify-center gap-2">
      <Button
        variant={item.patientPreference === "LIKE" ? "default" : "outline"}
        size="default"
        onClick={() => handleSingleUpdate(item, "LIKE")}
        className={`px-4 py-2 min-w-[44px] min-h-[44px] ${item.patientPreference === "LIKE" ? "bg-green-500 hover:bg-green-600" : "hover:bg-green-50"}`}
        title="Set to Like"
      >
        <Heart className={`h-4 w-4 ${item.patientPreference === "LIKE" ? "fill-current text-white" : "text-green-500"}`} />
      </Button>
      <Button
        variant={item.patientPreference === "NEUTRAL" || !item.patientPreference ? "default" : "outline"}
        size="default"
        onClick={() => handleSingleUpdate(item, "NEUTRAL")}
        className={`px-4 py-2 min-w-[44px] min-h-[44px] ${item.patientPreference === "NEUTRAL" || !item.patientPreference ? "bg-gray-500 hover:bg-gray-600" : "hover:bg-gray-50"}`}
        title="Set to Neutral"
      >
        <span className={`h-4 w-4 rounded-full ${item.patientPreference === "NEUTRAL" || !item.patientPreference ? "bg-white" : "bg-gray-400"}`} />
      </Button>
      <Button
        variant={item.patientPreference === "DISLIKE" ? "destructive" : "outline"}
        size="default"
        onClick={() => handleSingleUpdate(item, "DISLIKE")}
        className={`px-4 py-2 min-w-[44px] min-h-[44px] ${item.patientPreference !== "DISLIKE" ? "hover:bg-red-50" : ""}`}
        title="Set to Dislike"
      >
        <HeartCrack className={`h-4 w-4 ${item.patientPreference === "DISLIKE" ? "text-white" : "text-red-500"}`} />
      </Button>
    </div>
  ) : undefined;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Preferences</CardTitle>
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
          <div className="text-red-500 text-center">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Activity Preferences
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          View and manage activity preferences and doctor recommendations for this patient.
          This shows all available centre activities with their current preference settings.
        </p>
      </CardHeader>
      <CardContent>
        {/* Bulk Selection Controls */}
        {currentUser?.roleName === "SUPERVISOR" && (
          <div className="mb-4 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedItems.size === activityPreferences.length && activityPreferences.length > 0}
                  onCheckedChange={(checked: boolean) => handleSelectAll(checked)}
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
                      {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
                    </span>
                  </div>
                  
                  <Select value={bulkPreference} onValueChange={setBulkPreference}>
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
          viewMore={false}
          renderActions={renderActions}
        />
      </CardContent>
    </Card>
  );
};

export default PatientActivityPreferenceCard;