import React, { useState, useEffect } from "react";
import { useModal } from "@/hooks/useModal";
import { Button } from "../../ui/button";
import { Heart, HeartOff, Minus } from "lucide-react";

const EditActivityPreferenceModal: React.FC = () => {
  const { modalRef, closeModal, activeModal } = useModal();
  const [patientPreference, setPatientPreference] = useState<string>("");
  
  // Get the data passed to the modal
  const modalData = (activeModal as any).data || {};
  const { activityName, currentPreference, activityId, patientId } = modalData;

  useEffect(() => {
    // Set initial preference value
    setPatientPreference(currentPreference || "");
  }, [currentPreference]);

  const handleSavePreference = async (event: React.FormEvent) => {
    event.preventDefault();
    
    try {
      // TODO: Call API to update patient preference
      console.log("Updating preference:", {
        activityId,
        patientId,
        newPreference: patientPreference,
      });

      // Here you would call the API:
      // await updatePatientPreference(activityId, patientId, patientPreference);
      
      console.log("Patient Activity Preference Updated!");
      closeModal();
      
      // Refresh the data (you might want to pass a refresh function)
      if (modalData.onSave) {
        modalData.onSave();
      }
    } catch (error) {
      console.error("Error updating preference:", error);
    }
  };

  const handleRemovePreference = async () => {
    try {
      // TODO: Call API to remove patient preference
      console.log("Removing preference for activity:", activityId);
      
      // Here you would call the API:
      // await removePatientPreference(activityId, patientId);
      
      console.log("Patient Activity Preference Removed!");
      closeModal();
      
      if (modalData.onSave) {
        modalData.onSave();
      }
    } catch (error) {
      console.error("Error removing preference:", error);
    }
  };

  const preferenceOptions = [
    { value: "", label: "Not Set", icon: <Minus className="h-4 w-4" />, color: "outline" },
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
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700">Activity:</p>
          <p className="text-base font-semibold">{activityName}</p>
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

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemovePreference}
              className="flex items-center gap-2"
            >
              Remove Preference
            </Button>
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditActivityPreferenceModal;