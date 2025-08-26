import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
  Patient,
  ActivityExclusion,
  ActivityTemplate,
} from "@/api/scheduler/scheduler";
import { toast } from "sonner";

interface ExclusionManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  exclusion: ActivityExclusion | null;
  onSave: (exclusion: ActivityExclusion) => void;
  patients: Patient[];
  activityTemplates: ActivityTemplate[];
}

const ExclusionManagementModal: React.FC<ExclusionManagementModalProps> = ({
  isOpen,
  onClose,
  exclusion,
  onSave,
  patients,
  activityTemplates,
}) => {
  if (!isOpen) return null;
  const [patientId, setPatientId] = useState(exclusion?.patientId || "");
  const [activityTemplateId, setActivityTemplateId] = useState(
    exclusion?.activityTemplateId || ""
  );
  const [startDate, setStartDate] = useState(exclusion?.startDate || ""); // Changed to string for input type="date"
  const [endDate, setEndDate] = useState(exclusion?.endDate || ""); // Changed to string for input type="date"
  const [reason, setReason] = useState(exclusion?.reason || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || !activityTemplateId || !startDate || !endDate) {
      toast("Validation Error", {
        description: "Please fill all required fields.",
        duration: 3000,
      });
      return;
    }

    const newExclusion: ActivityExclusion = {
      id: exclusion?.id || "",
      patientId,
      activityTemplateId,
      startDate: startDate, // Already in 'YYYY-MM-DD' format from input
      endDate: endDate, // Already in 'YYYY-MM-DD' format from input
      reason,
    };
    onSave(newExclusion);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-xl font-semibold">
            {exclusion?.id ? "Edit Exclusion" : "Create New Exclusion"}
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
        <div className="p-4">
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="patient" className="text-right">
                Patient
              </Label>
              <Select value={patientId} onValueChange={setPatientId}>
                <SelectTrigger className="col-span-3 rounded-md">
                  <SelectValue placeholder="Select patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients
                    .filter((p) => p.isActive)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="activity" className="text-right">
                Activity
              </Label>
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

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="col-span-3 rounded-md"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="col-span-3 rounded-md"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
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
                Save Exclusion
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExclusionManagementModal;
