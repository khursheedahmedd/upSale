import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, RelevanceStatus, ToggleResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const useRelevanceStatus = () => {
  return useQuery({
    queryKey: ['relevance-status'],
    queryFn: async () => {
      try {
        console.log('Fetching relevance status...');
        const result = await apiClient.getRelevanceStatus();
        console.log('Relevance status result:', result);
        return result;
      } catch (error) {
        console.error('Error in useRelevanceStatus:', error);
        throw error;
      }
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
};

export const useToggleRelevance = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (enabled: boolean) => {
      try {
        console.log('Toggling relevance check...');
        const result = await apiClient.toggleRelevanceCheck(enabled);
        console.log('Toggle result:', result);
        return result;
      } catch (error) {
        console.error('Error toggling relevance:', error);
        throw error;
      }
    },
    onSuccess: (data: ToggleResponse) => {
      // Update the cache with the new data
      queryClient.setQueryData(['relevance-status'], data);
      
      toast({
        title: 'Success',
        description: `Relevance check ${data.is_enabled_override ? 'enabled' : 'disabled'}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useRelevanceCheck = () => {
  const { data: status, isLoading, error, refetch } = useRelevanceStatus();
  const toggleMutation = useToggleRelevance();

  const toggleRelevance = async (enabled: boolean) => {
    try {
      await toggleMutation.mutateAsync(enabled);
      // Refetch to ensure we have the latest data
      await refetch();
    } catch (error) {
      // Error is already handled by the mutation
      console.error('Failed to toggle relevance check:', error);
    }
  };

  return {
    status,
    isLoading,
    error,
    toggleRelevance,
    isToggling: toggleMutation.isPending,
  };
}; 