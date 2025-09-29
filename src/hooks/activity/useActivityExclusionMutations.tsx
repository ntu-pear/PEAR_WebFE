import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createCentreActivityExclusion,
  updateCentreActivityExclusion,
  deleteCentreActivityExclusion,
  CentreActivityExclusionCreate,
  CentreActivityExclusionUpdate,
} from '@/api/activity/activityExclusion';
import { getCurrentUser } from '@/api/users/auth';

export const useCentreActivityExclusionMutations = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createCentreActivityExclusion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centre-activity-exclusions'] });
      toast.success('Centre activity exclusion created successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to create centre activity exclusion: ${error.message || 'Unknown error'}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCentreActivityExclusion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centre-activity-exclusions'] });
      toast.success('Centre activity exclusion updated successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to update centre activity exclusion: ${error.message || 'Unknown error'}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCentreActivityExclusion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['centre-activity-exclusions'] });
      toast.success('Centre activity exclusion deleted successfully');
    },
    onError: (error: any) => {
      toast.error(`Failed to delete centre activity exclusion: ${error.message || 'Unknown error'}`);
    },
  });

  const create = async (data: CentreActivityExclusionCreate) => {
    try {
      return await createMutation.mutateAsync(data);
    } catch (error) {
      console.error('Error creating centre activity exclusion:', error);
      throw error;
    }
  };

  const update = async (data: Omit<CentreActivityExclusionUpdate, 'modified_by_id'>) => {
    try {
      const currentUser = await getCurrentUser();
      const exclusionData: CentreActivityExclusionUpdate = {
        ...data,
        modified_by_id: currentUser.userId.toString(),
      };
      return await updateMutation.mutateAsync(exclusionData);
    } catch (error) {
      console.error('Error updating centre activity exclusion:', error);
      throw error;
    }
  };

  const remove = async (id: number) => {
    try {
      return await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting centre activity exclusion:', error);
      throw error;
    }
  };

  return {
    create,
    update,
    remove,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};