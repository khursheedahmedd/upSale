import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ProposalTemplate } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const useProposalTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch the proposal template
  const { data: template, isLoading, error } = useQuery({
    queryKey: ['proposal-template'],
    queryFn: async () => {
      try {
        console.log('Fetching proposal template...');
        const result = await apiClient.getProposalTemplate();
        console.log('Template fetched successfully:', result);
        return result;
      } catch (error) {
        console.error('Error fetching proposal template:', error);
        
        // If it's a 404 (template not found), return a default template
        if (error instanceof Error && error.message.includes('404')) {
          console.log('Template not found, returning default template');
          return {
            content: `# Proposal Template

## Introduction
[Your introduction here]

## About Our Company
[Company description]

## Relevant Experience
[Your relevant experience]

## Approach
[Your approach to the project]

## Timeline
[Project timeline]

## Budget
[Budget information]

## Conclusion
[Closing statement]`
          };
        }
        
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  // Save the proposal template
  const updateMutation = useMutation({
    mutationFn: async (content: string) => {
      try {
        console.log('Saving proposal template...');
        const result = await apiClient.updateProposalTemplate(content);
        console.log('Template saved successfully:', result);
        return result;
      } catch (error) {
        console.error('Error saving proposal template:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Refresh the template data
      queryClient.invalidateQueries({ queryKey: ['proposal-template'] });
      toast({
        title: 'Success',
        description: 'Proposal template saved successfully.',
      });
    },
    onError: (error: Error) => {
      console.error('Failed to save template:', error);
      toast({
        title: 'Error',
        description: `Failed to save template: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const saveTemplate = async (content: string) => {
    await updateMutation.mutateAsync(content);
  };

  return {
    template: template?.content || '',
    isLoading,
    error,
    saveTemplate,
    isSaving: updateMutation.isPending,
  };
}; 