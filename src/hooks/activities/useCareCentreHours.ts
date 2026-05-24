import { useEffect, useState } from "react";
import { listCareCentres, CareCentre } from "@/api/activities/careCentres";

export function useCareCentreHours() {
  const [centre, setCentre] = useState<CareCentre | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const centres = await listCareCentres();
        setCentre(centres.length > 0 ? centres[0] : null);
      } catch (e) {
        console.error("Failed to load care centres", e);
        setCentre(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { centre, loading };
}