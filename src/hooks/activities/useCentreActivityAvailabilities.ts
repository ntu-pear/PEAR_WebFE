import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'sonner';
import { useEffect, useState } from "react";
import { 
    listCentreActivityAvailabilities,
    createCentreActivityAvailability,
    updateCentreActivityAvailability,
    softDeleteCentreActivityAvailability,
    type CreateCentreActivityAvailabilityInput,
    type UpdateCentreActivityAvailabilityInput,
    CentreActivityAvailability,
 } from "@/api/activities/centreActivityAvailabilities";

export const useCentreActivityAvailabilities = (includeDeleted: boolean) => {
  const [centreActivityAvailabilities, setCentreActivityAvailabilities] = useState<CentreActivityAvailability[]>([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCentreActivityAvailabilities = async () => {
    try {
        setLoading(true);
        setError(null);

      const [availabilityData] = await Promise.all([
        listCentreActivityAvailabilities({ include_deleted: includeDeleted })
      ]);
      setCentreActivityAvailabilities(availabilityData);
    }
    catch(error) {
      console.error("Error fetching centre activity availabilities:", error);
      setError("Failed to fetch the centre activity's availablities");
    }
    finally {
      setLoading(false);
    }
  };

  const refreshCentreActivityAvailabilities = () => {
    fetchCentreActivityAvailabilities();
  };

  useEffect(() => {
    fetchCentreActivityAvailabilities();
  }, []);

  return { 
    centreActivityAvailabilities,
    loading, 
    error,
    refreshCentreActivityAvailabilities
  };
};


export function useCentreActivityAvailabilityMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["centreActivities"] });

  return {
    create: useMutation({
      mutationFn: (input: CreateCentreActivityAvailabilityInput) => createCentreActivityAvailability(input),
      onSuccess: invalidate,
      onError: (error: any) => {
        toast.error(`Failed to create centre activity: ${error.message || 'Unknown error'}`);
      },
    }),
    update: useMutation({
      mutationFn: (input: UpdateCentreActivityAvailabilityInput) => updateCentreActivityAvailability(input),
      onSuccess: invalidate,
      onError: (error: any) => {
        toast.error(`Failed to update centre activity: ${error.message || 'Unknown error'}`);
      },
    }),
    remove: useMutation({
      mutationFn: (id: number) => softDeleteCentreActivityAvailability(id),
      onSuccess: invalidate,
      onError: (error: any) => {
        toast.error(`Failed to delete centre activity: ${error.message || 'Unknown error'}`);
      },
    }),
  };
}

export type CentreActivityAvailabilityRow = {
    id: number;
    centre_activity_id: number;
    // is_fixed: boolean; //Commented temporarily, pendng scheduler service changes.
    start_time: string;
    end_time: string;
    created_by_id: string;
    created_date: string;
    modified_date: string;
    modified_by_id: string;
    is_deleted: boolean;
};

export function toRows(list: CentreActivityAvailability[]): CentreActivityAvailabilityRow[] {
  return list.map(a => ({
    id: a.id,
    centre_activity_id: a.centre_activity_id,
    start_time: a.start_time,
    end_time: a.end_time,
    is_deleted: a.is_deleted,
    created_by_id: a.created_by_id,
    created_date: a.created_date,
    modified_by_id: a.modified_by_id ?? "",
    modified_date: a.modified_date ?? "",
  }));
}