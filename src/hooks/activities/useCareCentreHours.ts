import { useEffect, useState } from "react";
import { listCareCentres, CareCentre } from "@/api/activities/careCentres";

export function useCareCentreHours(centreName: string) {
  const [centre, setCentre] = useState<CareCentre | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const centres = await listCareCentres();
        const found = centres.find(
          c => c.name.toLowerCase() === centreName.toLowerCase()
        );
        setCentre(found ?? null);
      } catch (e) {
        console.error("Failed to load care centres", e);
        setCentre(null);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [centreName]);

  return { centre, loading };
}
