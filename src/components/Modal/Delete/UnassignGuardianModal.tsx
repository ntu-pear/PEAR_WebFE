import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchGuardianByPatientId,
  unassignGuardian,
  IGuardian,
  IUnassignGuardianResult,
} from "@/api/patients/guardian";
import { updatePrimaryGuardian } from "@/api/patients/patientAllocation";
import { extractErrorMessage } from "@/utils/errorMessage";
import BaseDeleteModal from "./BaseDeleteModal";

const UnassignGuardianModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { currentUser } = useAuth();
  const {
    patientId,
    guardianId,
    refreshGuardianData,
    allocationId,
    primaryGuardianId,
    refreshPatientData,
  } = activeModal.props as {
    patientId: number;
    guardianId: number;
    refreshGuardianData: () => void | Promise<void>;
    allocationId?: number;
    primaryGuardianId?: number;
    refreshPatientData?: () => void | Promise<void>;
  };

  const promoteSoleGuardian = async (remaining: IGuardian[]) => {
    const soleGuardianId = remaining[0].patient_guardian.id;
    if (soleGuardianId === primaryGuardianId) return;

    try {
      await updatePrimaryGuardian({
        allocationId: allocationId as number,
        patientId,
        guardianId: soleGuardianId,
        ModifiedById: String(currentUser?.userId),
      });
      toast.success("The remaining guardian is now the primary guardian.");
    } catch {
      toast.warning(
        "Guardian unassigned, but the primary guardian could not be updated. Set it manually from Edit."
      );
    }
  };

  const handleUnassignGuardian = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!guardianId || !patientId) return;

    let unassignError: unknown = null;
    let unassignResult: IUnassignGuardianResult | null = null;
    try {
      unassignResult = await unassignGuardian(patientId, guardianId);
    } catch (error) {
      unassignError = error;
    }

    closeModal();

    let remaining: IGuardian[] | null = null;
    try {
      remaining = await fetchGuardianByPatientId(patientId);
    } catch {
      remaining = null;
    }

    const wasRemoved =
      remaining !== null &&
      !remaining.some((g) => g.patient_guardian.id === guardianId);

    if (wasRemoved) {
      toast.success("Guardian unassigned from this patient.");
      if (unassignResult?.guardianSoftDeleted) {
        if (unassignResult.accountDeactivated === false) {
          toast.warning(
            "This guardian had no other patients, so their record was removed, but their login account could not be deactivated. Ask an admin to deactivate it."
          );
        } else {
          toast.info(
            unassignResult.accountDeactivated
              ? "This guardian had no other patients, so their record was removed and their login account deactivated."
              : "This guardian had no other patients, so their record was removed."
          );
        }
      }
    } else {
      toast.error(
        unassignError
          ? extractErrorMessage(unassignError, "Failed to unassign guardian.")
          : "Failed to unassign guardian."
      );
    }

    if (wasRemoved && remaining!.length === 1 && allocationId && currentUser?.userId) {
      await promoteSoleGuardian(remaining!);
    }

    await refreshPatientData?.();
    await refreshGuardianData?.();
  };

  return (
    <BaseDeleteModal
      modalRef={modalRef}
      onSubmit={handleUnassignGuardian}
      closeModal={closeModal}
      title="Remove this guardian from this patient?"
      description="This unassigns the guardian from this patient only. If this is their last patient, their guardian record is removed and their login account deactivated."
      confirmLabel="Unassign"
    />
  );
};

export default UnassignGuardianModal;
