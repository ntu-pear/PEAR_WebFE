import { useEffect, useState } from "react";
import {
  fetchSupervisorPatientTD,
  fetchDoctorPatientTD,
  fetchCaregiverPatientTD,
  fetchGuardianPatients,
  PatientTableDataServer,
} from "@/api/patients/patients";
import { useAuth } from "@/hooks/useAuth";

const PAGE_SIZE = 100;

type PagedFetch = (
  id: string,
  name: string | null,
  isActive: string | null,
  pageNo: number,
  pageSize: number
) => Promise<PatientTableDataServer>;

const PAGED_FETCH_BY_ROLE: Record<string, PagedFetch> = {
  SUPERVISOR: fetchSupervisorPatientTD,
  DOCTOR: fetchDoctorPatientTD,
  CAREGIVER: fetchCaregiverPatientTD,
};

const collectPaged = async (fetchPage: PagedFetch, userId: string) => {
  const ids = new Set<number>();
  let pageNo = 0;
  let totalPages = 1;

  while (pageNo < totalPages) {
    const res = await fetchPage(userId, "", null, pageNo, PAGE_SIZE);
    res.patients.forEach((p) => ids.add(Number(p.id)));
    totalPages = res.pagination.totalPages || 1;
    pageNo += 1;
  }

  return ids;
};

const collectGuardian = async (userId: string) => {
  const res = await fetchGuardianPatients(userId);
  const rows = Array.isArray(res?.data) ? res.data : [];
  return new Set<number>(rows.map((p: { id: string | number }) => Number(p.id)));
};

export function useMyPatientIds() {
  const { currentUser } = useAuth();
  const [patientIds, setPatientIds] = useState<Set<number> | null>(null);
  const [loading, setLoading] = useState(false);

  const roleName = currentUser?.roleName;
  const userId = currentUser?.userId;

  useEffect(() => {
    const pagedFetch = roleName ? PAGED_FETCH_BY_ROLE[roleName] : undefined;
    const isGuardian = roleName === "GUARDIAN";

    if ((!pagedFetch && !isGuardian) || !userId) {
      setPatientIds(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const ids = isGuardian
          ? await collectGuardian(String(userId))
          : await collectPaged(pagedFetch!, String(userId));

        if (!cancelled) setPatientIds(ids);
      } catch (error) {
        console.error("Failed to load the current user's patients", error);
        if (!cancelled) setPatientIds(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [roleName, userId]);

  return { patientIds, loading };
}
