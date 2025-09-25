import React, { useState, useEffect } from "react";
import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { Heart, HeartOff, Minus } from "lucide-react";
import { 
  createActivityPreference, 
  updateActivityPreference, 
  deleteActivityPreference,
  getAllCentreActivityPreferences 
} from "@/api/activity/activityPreference";
import { retrieveAccessTokenFromCookie } from "@/api/users/auth";
import { preferenceToInt } from "@/utils/activityConversions";

const EditActivityPreferenceModal: React.FC = () => {
  const { modalRef, closeModal, activeModal } = useModal();
  const [patientPreference, setPatientPreference] = useState<string>("");
  const [saving, setSaving] = useState(false);
  
  // Get the data passed to the modal
  const modalData = (activeModal as any).props || {};
  const { 
    activityName, 
    patientName, 
    currentPreference, 
    centreActivityId, 
    patientId,
    onUpdate 
  } = modalData;


  useEffect(() => {
    // Set initial preference value, default to NEUTRAL if no preference
    setPatientPreference(currentPreference || "NEUTRAL");
  }, [currentPreference]);

  const handleSavePreference = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      setSaving(true);
      console.log("Updating preference:", {
        centreActivityId,
        patientId,
        patientName,
        activityName,
        currentPreference,
        newPreference: patientPreference,
      });

      // Get the access token
      const token = retrieveAccessTokenFromCookie();
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      // First, get all preferences for this patient to find the existing preference ID
      const allPreferences = await getAllCentreActivityPreferences();
      const existingPreference = allPreferences.find(
        pref => pref.patient_id === patientId && 
                pref.centre_activity_id === centreActivityId && 
                !pref.is_deleted
      );

      if (patientPreference === "NEUTRAL") {
        // If setting to NEUTRAL and preference exists, delete it
        if (existingPreference) {
          await deleteActivityPreference(existingPreference.id);
          console.log("Preference deleted (set to NEUTRAL)");
        }
        // If no existing preference and setting to NEUTRAL, do nothing (already neutral by default)
      } else {
        // Convert preference to integer for API
        const preferenceValue = preferenceToInt(patientPreference as "LIKE" | "DISLIKE" | "NEUTRAL");
        
        if (existingPreference) {
          // Update existing preference
          await updateActivityPreference(existingPreference, preferenceValue);
          console.log("Preference updated");
        } else {
          // Create new preference
          await createActivityPreference(patientId, centreActivityId, preferenceValue);
          console.log("New preference created");
        }
      }
      
      closeModal();
      
      // Refresh the data
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error updating preference:", error);
      // TODO: Show error message to user
    } finally {
      setSaving(false);
    }
  };

  const preferenceOptions = [
    { value: "LIKE", label: "Like", icon: <Heart className="h-4 w-4 fill-current" />, color: "default" },
    { value: "DISLIKE", label: "Dislike", icon: <HeartOff className="h-4 w-4" />, color: "destructive" },
    { value: "NEUTRAL", label: "Neutral", icon: <Minus className="h-4 w-4" />, color: "secondary" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-6 rounded-md w-[500px] max-w-[90vw]">
        <h3 className="text-lg font-medium mb-4">
          Edit Activity Preference
        </h3>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-2">
          <div>
            <p className="text-sm font-medium text-gray-600">Patient:</p>
            <p className="text-base font-semibold text-gray-900">{patientName || "Unknown Patient"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Activity:</p>
            <p className="text-base font-semibold text-gray-900">{activityName || "Unknown Activity"}</p>
          </div>
        </div>

        <form onSubmit={handleSavePreference} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-3">
              Patient Preference <span className="text-red-600">*</span>
            </label>
            
            <div className="grid grid-cols-2 gap-2">
              {preferenceOptions.map((option) => (
                <div key={option.value}>
                  <input
                    type="radio"
                    id={`preference-${option.value}`}
                    name="patientPreference"
                    value={option.value}
                    checked={patientPreference === option.value}
                    onChange={(e) => setPatientPreference(e.target.value)}
                    className="sr-only"
                  />
                  <label
                    htmlFor={`preference-${option.value}`}
                    className={`
                      flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-all
                      ${
                        patientPreference === option.value
                          ? "border-primary bg-primary/10"
                          : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    {option.icon}
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditActivityPreferenceModal;