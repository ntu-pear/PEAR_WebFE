import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { getAllCentreActivities, getAllActivities, CentreActivity } from "@/api/activity/activityPreference";
import { toast } from "sonner";
import { Search, X } from "lucide-react";

export interface BulkCentreActivityExclusionFormValues {
  centre_activity_ids: number[];
  patient_id: number;
  exclusion_remarks?: string;
  start_date: string;
  end_date?: string | null;
}

type Props = {
  initial?: {
    patient_id: number;
    exclusion_remarks?: string;
    start_date: string;
    end_date?: string | null;
  };
  submitting?: boolean;
  onSubmit: (values: BulkCentreActivityExclusionFormValues) => void | Promise<void>;
  onCancel?: () => void;
  excludedActivityIds?: Set<number>; // Activities already excluded for this patient
};

interface CentreActivityWithDetails extends CentreActivity {
  activity_title: string;
  activity_description?: string;
}

export default function BulkActivityExclusionForm({ 
  initial, 
  submitting, 
  onSubmit, 
  onCancel,
  excludedActivityIds = new Set()
}: Props) {
  const [selectedActivityIds, setSelectedActivityIds] = useState<Set<number>>(new Set());
  const [exclusionRemarks, setExclusionRemarks] = useState(initial?.exclusion_remarks ?? "");
  const [startDate, setStartDate] = useState(initial?.start_date ?? "");
  const [endDate, setEndDate] = useState(initial?.end_date ?? "");
  const [isIndefinite, setIsIndefinite] = useState(!initial?.end_date);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [centreActivities, setCentreActivities] = useState<CentreActivityWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedActivities = centreActivities.filter(activity => selectedActivityIds.has(activity.id));

  useEffect(() => {
    const fetchCentreActivities = async () => {
      try {
        setLoading(true);
        
        // Fetch both activities and centre activities in parallel
        const [activities, centreActivities] = await Promise.all([
          getAllActivities(),
          getAllCentreActivities()
        ]);

        // Create a map of centre activity id to activity details
        const combinedData: CentreActivityWithDetails[] = [];
        
        centreActivities.forEach(centreActivity => {
          const activity = activities.find(a => a.id === centreActivity.activity_id);
          if (activity && !activity.is_deleted && !centreActivity.is_deleted) {
            combinedData.push({
              ...centreActivity,
              activity_title: activity.title,
              activity_description: activity.description || undefined
            });
          }
        });

        // Sort by activity title
        combinedData.sort((a, b) => a.activity_title.localeCompare(b.activity_title));
        
        setCentreActivities(combinedData);
      } catch (error) {
        console.error("Error fetching centre activities:", error);
        toast.error("Failed to load activities");
      } finally {
        setLoading(false);
      }
    };

    fetchCentreActivities();
  }, []);

  // Filter activities based on search and exclude already excluded ones
  const filteredActivities = centreActivities.filter(activity => {
    const matchesSearch = activity.activity_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.activity_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.id.toString().includes(searchTerm);
    const notAlreadyExcluded = !excludedActivityIds.has(activity.id);
    return matchesSearch && notAlreadyExcluded;
  });

  const handleActivityToggle = (activityId: number, checked: boolean) => {
    const newSelected = new Set(selectedActivityIds);
    if (checked) {
      newSelected.add(activityId);
    } else {
      newSelected.delete(activityId);
    }
    setSelectedActivityIds(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const availableIds = filteredActivities.map(activity => activity.id);
      setSelectedActivityIds(new Set(availableIds));
    } else {
      setSelectedActivityIds(new Set());
    }
  };

  const handleRemoveSelected = (activityId: number) => {
    const newSelected = new Set(selectedActivityIds);
    newSelected.delete(activityId);
    setSelectedActivityIds(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedActivityIds.size === 0) {
      toast.error("Please select at least one activity to exclude");
      return;
    }

    if (!initial?.patient_id) {
      toast.error("Patient ID is required");
      return;
    }

    if (!exclusionRemarks.trim()) {
      toast.error("Exclusion remarks are required");
      return;
    }

    const values: BulkCentreActivityExclusionFormValues = {
      centre_activity_ids: Array.from(selectedActivityIds),
      patient_id: initial.patient_id,
      exclusion_remarks: exclusionRemarks.trim(), // now guaranteed to be non-empty
      start_date: startDate,
      end_date: isIndefinite ? null : endDate || null,
    };

    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Error submitting bulk exclusion:", error);
    }
  };


  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Activity Selection Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Select Activities to Exclude</Label>
          <div className="text-sm text-gray-500">
            {selectedActivityIds.size} selected
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Select All */}
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={selectedActivityIds.size === filteredActivities.length && filteredActivities.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <Label className="text-sm font-medium">
            Select all visible activities ({filteredActivities.length})
          </Label>
        </div>

        {/* Selected Activities Preview */}
        {selectedActivities.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Selected Activities:</Label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md bg-gray-50">
              {selectedActivities.map((activity) => (
                <Badge
                  key={activity.id}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {activity.activity_title}
                  <button
                    type="button"
                    onClick={() => handleRemoveSelected(activity.id)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Activity List */}
        <div className="border rounded-md max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading activities...</div>
          ) : filteredActivities.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? "No activities match your search" : "No activities available to exclude"}
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                >
                  <Checkbox
                    checked={selectedActivityIds.has(activity.id)}
                    onCheckedChange={(checked) => handleActivityToggle(activity.id, checked as boolean)}
                  />
                  <Label className="flex-1 text-sm cursor-pointer">
                    {activity.activity_title}
                    {activity.activity_description && (
                      <span className="text-gray-500 ml-2 text-xs">({activity.activity_description})</span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Date Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date">Start Date*</Label>
          <Input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-date">End Date</Label>
          <Input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isIndefinite}
          />
        </div>
      </div>

      {/* Indefinite Toggle */}
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={isIndefinite}
          onCheckedChange={(checked) => {
            setIsIndefinite(checked as boolean);
            if (checked) setEndDate("");
          }}
        />
        <Label>Indefinite exclusion</Label>
      </div>

      {/* Remarks */}
        <div className="space-y-2">
          <Label htmlFor="remarks">Exclusion Remarks*</Label>
          <Textarea
            id="remarks"
            placeholder="Enter reason for exclusion (required)"
            value={exclusionRemarks}
            onChange={(e) => setExclusionRemarks(e.target.value)}
            rows={3}
            required
          />
        </div>


      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t mt-6">
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={submitting || selectedActivityIds.size === 0}
            className="min-w-[120px]"
          >
            {submitting ? "Creating..." : `Create ${selectedActivityIds.size} Exclusion${selectedActivityIds.size === 1 ? '' : 's'}`}
          </Button>
        </div>
      </div>
    </form>
  );
}