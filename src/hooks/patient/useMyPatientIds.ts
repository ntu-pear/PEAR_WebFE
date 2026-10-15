import { useEffect, useState } from "react";
import {
  fetchSupervisorPatientTD,
  fetchDoctorPatientTD,
  fetchCaregiverPatientTD,
  PatientTableDataServer,
} from "@/api/patients/patients";
import { useAuth } from "@/hooks/useAuth";

const PAGE_SIZE = 100;

type ScopedFetch = (
  id: string,
  name: string | null,
  isActive: string | null,
  pageNo: number,
  pageSize: number
) => Promise<PatientTableDataServer>;

const FETCH_BY_ROLE: Record<string, ScopedFetch> = {
  SUPERVISOR: fetchSupervisorPatientTD,
  DOCTOR: fetchDoctorPatientTD,
  CAREGIVER: fetchCaregiverPatientTD,
};

export function useMyPatientIds() {
  const { currentUser } = useAuth();
  const [patientIds, setPatientIds] = useState<Set<number> | null>(null);
  const [loading, setLoading] = useState(false);

  const roleName = currentUser?.roleName;
  const userId = currentUser?.userId;

  useEffect(() => {
    const scopedFetch = roleName ? FETCH_BY_ROLE[roleName] : undefined;

    if (!scopedFetch || !userId) {
      setPatientIds(null);
      return;
    }

    let cancelled = false;

    const loadAllPages = async () => {
      setLoading(true);
      try {
        const ids = new Set<number>();
        let pageNo = 0;
        let totalPages = 1;

        while (pageNo < totalPages) {
          const res = await scopedFetch(String(userId), "", null, pageNo, PAGE_SIZE);
          res.patients.forEach((p) => ids.add(Number(p.id)));
          totalPages = res.pagination.totalPages || 1;
          pageNo += 1;
        }

        if (!cancelled) setPatientIds(ids);
      } catch (error) {
        console.error("Failed to load the current user's patients", error);
        if (!cancelled) setPatientIds(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadAllPages();

    return () => {
      cancelled = true;
    };
  }, [roleName, userId]);

  return { patientIds, loading };
}
