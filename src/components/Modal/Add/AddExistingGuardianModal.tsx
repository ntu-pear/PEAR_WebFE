import { useState } from "react";
import { toast } from "sonner";

import { useModal } from "@/hooks/useModal";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "../../ui/button";
import {
  fetchGuardianByNRIC,
  assignExistingGuardian,
  IGuardian,
  IGuardianAssignData,
} from "@/api/patients/guardian";
import { RELATIONSHIP_OPTIONS } from "@/utils/guardianValidation";
import { extractErrorMessage } from "@/utils/errorMessage";

const AddExistingGuardianModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { patientId, refreshGuardianData } = activeModal.props as {
    patientId: number;
    refreshGuardianData: () => void | Promise<void>;
  };
  const { currentUser } = useAuth();

  const [nric, setNric] = useState("");
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [foundGuardian, setFoundGuardian] = useState<IGuardian | null>(null);
  const [relationshipName, setRelationshipName] = useState("");
  const [assigning, setAssigning] = useState(false);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nric.trim()) return;

    setSearching(true);
    setSearched(false);
    setFoundGuardian(null);
    try {
      const result = await fetchGuardianByNRIC(nric.trim().toUpperCase());
      setFoundGuardian(result);
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to search for guardian."));
    } finally {
      setSearching(false);
      setSearched(true);
    }
  };

  const handleAssign = async () => {
    if (!foundGuardian || !relationshipName || !patientId || !currentUser?.userId) {
      toast.error("Select a relationship before assigning.");
      return;
    }

    const payload: IGuardianAssignData = {
      patientId,
      guardianId: foundGuardian.patient_guardian.id,
      relationshipName,
      CreatedById: String(currentUser.userId),
      ModifiedById: String(currentUser.userId),
    };

    setAssigning(true);
    try {
      await assignExistingGuardian(payload);
      toast.success("Guardian assigned successfully.");
      closeModal();
      await refreshGuardianData?.();
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to assign guardian."));
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div ref={modalRef} className="bg-background p-8 rounded-md w-[500px]">
        <h3 className="text-lg font-medium mb-5">Add Existing Guardian</h3>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <input
            type="text"
            value={nric}
            onChange={(e) => setNric(e.target.value)}
            placeholder="Guardian's NRIC"
            className="flex-1 p-2 border rounded-md text-gray-900"
            required
          />
          <Button type="submit" disabled={searching}>
            {searching ? "Searching..." : "Search"}
          </Button>
        </form>

        {searched && !foundGuardian && (
          <p className="text-sm text-gray-600 mb-4">
            No guardian found with this NRIC. Use "Add New Guardian" instead if
            this is a new guardian.
          </p>
        )}

        {foundGuardian && (
          <div className="space-y-4">
            <div className="rounded-md border p-3 text-sm space-y-1">
              <div>
                <span className="font-medium">Name: </span>
                {foundGuardian.patient_guardian.firstName}{" "}
                {foundGuardian.patient_guardian.lastName}
              </div>
              <div>
                <span className="font-medium">Contact: </span>
                {foundGuardian.patient_guardian.contactNo}
              </div>
              <div>
                <span className="font-medium">Email: </span>
                {foundGuardian.patient_guardian.email || "-"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Relationship to Patient
                <span className="text-red-600"> *</span>
              </label>
              <select
                value={relationshipName}
                onChange={(e) => setRelationshipName(e.target.value)}
                className="block w-full p-2 border rounded-md text-gray-900"
                required
              >
                <option value="">Please select an option</option>
                {RELATIONSHIP_OPTIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAssign}
            disabled={!foundGuardian || !relationshipName || assigning}
          >
            {assigning ? "Assigning..." : "Assign"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddExistingGuardianModal;
