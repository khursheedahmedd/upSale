const API_BASE_URL = import.meta.env.VITE_APP_URL || "http://localhost:8001";

export interface RelevanceStatus {
  is_enabled_override: boolean;
  is_within_schedule: boolean;
  effective_status: boolean;
}

export interface ToggleRequest {
  enabled: boolean;
}

export interface ToggleResponse {
  is_enabled_override: boolean;
  is_within_schedule: boolean;
  effective_status: boolean;
}

export interface ProposalTemplate {
  content: string;
}

export interface JobProcessingResult {
  status: string;
  message: string;
  newest_job_datetime_processed_this_run?: string;
  last_processed_datetime_for_next_run?: string;
  batch_details?: any[];
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.baseUrl) {
      throw new Error('API base URL is not configured');
    }
    
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`Making API request to: ${url}`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`API response from ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Relevance Check APIs
  async getRelevanceStatus(): Promise<RelevanceStatus> {
    return this.request<RelevanceStatus>('/api/relevance/status');
  }

  async toggleRelevanceCheck(enabled: boolean): Promise<ToggleResponse> {
    return this.request<ToggleResponse>('/api/relevance/toggle', {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    });
  }

  // Proposal Template APIs
  async getProposalTemplate(): Promise<ProposalTemplate> {
    return this.request<ProposalTemplate>('/api/template/proposal-template');
  }

  async updateProposalTemplate(content: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/api/template/proposal-template', {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  // Manual Job Processing API
  async processNewJobsCron(): Promise<JobProcessingResult> {
    return this.request<JobProcessingResult>('/api/process_new_jobs_cron', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Debug logging
console.log('API Client initialized with base URL:', API_BASE_URL);
console.log('Environment variable VITE_APP_URL:', import.meta.env.VITE_APP_URL); 