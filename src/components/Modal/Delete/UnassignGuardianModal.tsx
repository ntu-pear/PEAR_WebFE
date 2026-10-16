import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useModal } from "@/hooks/useModal";
import { useAuth } from "@/hooks/useAuth";
import { fetchGuardianByPatientId, fetchGuardianPatientCount, unassignGuardian, IGuardian } from "@/api/patients/guardian";
import { updatePrimaryGuardian } from "@/api/patients/patientAllocation";
import { extractErrorMessage } from "@/utils/errorMessage";
import BaseDeleteModal from "./BaseDeleteModal";

const UnassignGuardianModal: React.FC = () => {
  const { modalRef, activeModal, closeModal } = useModal();
  const { currentUser } = useAuth();
  const {
    patientId,
    guardianId,
    guardianName,
    guardianNric,
    refreshGuardianData,
    allocationId,
    primaryGuardianId,
    refreshPatientData,
  } = activeModal.props as {
    patientId: number;
    guardianId: number;
    guardianName?: string;
    guardianNric?: string;
    refreshGuardianData: () => void | Promise<void>;
    allocationId?: number;
    primaryGuardianId?: number;
    refreshPatientData?: () => void | Promise<void>;
  };

  const displayName = guardianName?.trim() || "Guardian";
  const [patientCount, setPatientCount] = useState<number | null>(null);
  const [checkingPatients, setCheckingPatients] = useState(Boolean(guardianNric));

  useEffect(() => {
    if (!guardianNric) return;

    let cancelled = false;
    fetchGuardianPatientCount(guardianNric)
      .then((count) => {
        if (!cancelled) setPatientCount(count);
      })
      .finally(() => {
        if (!cancelled) setCheckingPatients(false);
      });

    return () => {
      cancelled = true;
    };
  }, [guardianNric]);

  const leavesGuardianWithNoPatients = patientCount !== null && patientCount <= 1;

  const description = leavesGuardianWithNoPatients ? (
    <>
      Unassigning {displayName} will leave them with no patient assignment, and they will be{" "}
      <strong>soft deleted</strong>.
    </>
  ) : null;

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
    try {
      await unassignGuardian(patientId, guardianId);
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
      toast.success(`${displayName} unassigned from this patient.`);
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
      title={`Confirm unassign ${displayName} from this patient?`}
      description={description}
      confirmLabel="Unassign"
      confirmDisabled={checkingPatients}
    />
  );
};

export default UnassignGuardianModal;
