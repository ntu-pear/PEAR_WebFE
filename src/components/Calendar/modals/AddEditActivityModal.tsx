import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import {
  ScheduledCentreActivity,
  ActivityTemplate,
} from "@/api/activity/activity";

interface AddEditActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ScheduledCentreActivity | null;
  onSave: (activity: ScheduledCentreActivity) => void;
  activityTemplates: ActivityTemplate[];
}

const AddEditActivityModal: React.FC<AddEditActivityModalProps> = ({
  isOpen,
  onClose,
  activity,
  onSave,
  activityTemplates,
}) => {
  if (!isOpen) return null;
  
  const [activityTemplateId, setActivityTemplateId] = useState(
    activity?.activityTemplateId || ""
  );
  const [date, setDate] = useState(activity?.date || ""); // Changed to string for input type="date"
  const [startTime, setStartTime] = useState(activity?.startTime || "09:00");
  const [endTime, setEndTime] = useState(activity?.endTime || "10:00");
  const [notes, setNotes] = useState(activity?.notes || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityTemplateId || !date || !startTime || !endTime) {
      toast("Validation Error", {
        description: "Please fill all required fields.",
        duration: 3000,
      });
      return;
    }

    const newActivity: ScheduledCentreActivity = {
      id: activity?.id || "", // Use existing ID or placeholder for new
      activityTemplateId,
      date: date, // Already in 'YYYY-MM-DD' format from input
      startTime,
      endTime,
      notes,
    };
    onSave(newActivity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold">
            {activity
              ? "Edit Scheduled Activity"
              : "Add New Scheduled Activity"}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-md"
          >
            <span className="sr-only">Close</span>
            <span className="text-xl">&times;</span>
          </Button>
        </div>
        <div className="px-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
            <div className="items-center">
              <Label htmlFor="activity">Activity</Label>
              <Select
                value={activityTemplateId}
                onValueChange={setActivityTemplateId}
              >
                <SelectTrigger className="col-span-3 rounded-md">
                  <SelectValue placeholder="Select activity" />
                </SelectTrigger>
                <SelectContent>
                  {activityTemplates.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="items-center w-fit">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="col-span-3 rounded-md"
              />
            </div>

            <div className="items-center">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="col-span-3 rounded-md w-fit"
              />
            </div>

            <div className="items-center">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="col-span-3 rounded-md w-fit"
              />
            </div>

            <div className="items-center">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3 rounded-md"
              />
            </div>

            <div className="col-span-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-md"
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-md">
                Save Activity
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEditActivityModal;
