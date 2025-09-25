import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listCareCentres,
  getCareCentreById,
  createCareCentre,
  updateCareCentre,
  softDeleteCareCentre,
} from "@/api/careCentre";
import {
  CareCentreResponse,
  CreateCareCentre,
  UpdateCareCentre,
} from "@/types/careCentre";

const key = {
  all: ["care-centres"] as const,
  detail: (id: number) => [...key.all, id] as const,
};

export const useCareCentres = () =>
  useQuery<CareCentreResponse[]>({
    queryKey: key.all,
    queryFn: () => listCareCentres(),
  });

export const useCareCentre = (id: number) =>
  useQuery<CareCentreResponse>({ queryKey: key.detail(id), queryFn: () => getCareCentreById(id) });

export const useCreateCareCentre = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCareCentre) => createCareCentre(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: key.all }),
  });
};

export const useUpdateCareCentre = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateCareCentre) => updateCareCentre(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: key.all });
      qc.invalidateQueries({ queryKey: key.detail(data.id) });
    },
  });
};

export const useDeleteCareCentre = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => softDeleteCareCentre(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key.all }),
  });
};