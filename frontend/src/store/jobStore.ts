import { create } from 'zustand';
import axios from 'axios';

// Types
export enum JobStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed'
}

export enum UrlStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUCCESS = 'success',
  ERROR = 'error',
  CANCELLED = 'cancelled'
}

export interface UrlResult {
  url: string;
  status: UrlStatus;
  httpStatus?: number;
  errorMessage?: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
}

export interface Job {
  id: string;
  createdAt: string;
  status: JobStatus;
  urls: string[];
  results?: UrlResult[];
  stats: {
    total: number;
    success: number;
    error: number;
    pending: number;
    inProgress: number;
    cancelled: number;
  };
}

interface JobStore {
  jobs: Job[];
  activeJobId: string | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchJobs: () => Promise<void>;
  fetchJobDetails: (jobId: string) => Promise<Job | null>;
  createJob: (urls: string[]) => Promise<string | null>;
  cancelJob: (jobId: string) => Promise<boolean>;
  setActiveJob: (jobId: string | null) => void;
  clearError: () => void;
}

export const useJobStore = create<JobStore>((set, get) => ({
  jobs: [],
  activeJobId: null,
  loading: false,
  error: null,

  fetchJobs: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get('/api/jobs');
      const jobs = response.data;
      
      set({ jobs, loading: false });
      
      // If we have an active job, fetch its details
      const { activeJobId } = get();
      if (activeJobId && !jobs.find((job: Job) => job.id === activeJobId)) {
        set({ activeJobId: null });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch jobs',
        loading: false 
      });
    }
  },

  fetchJobDetails: async (jobId: string) => {
    try {
      const response = await axios.get(`/api/jobs/${jobId}`);
      const jobDetails = response.data;
      
      // Update the job in the list
      const { jobs } = get();
      if (Array.isArray(jobs)) {
        const updatedJobs = jobs.map(job => 
          job.id === jobId ? { ...job, ...jobDetails } : job
        );
        set({ jobs: updatedJobs });
      }
      
      return jobDetails;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch job details'
      });
      return null;
    }
  },

  createJob: async (urls: string[]) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post('/api/jobs', { urls });
      const { jobId } = response.data;
      
      // Fetch updated jobs list
      await get().fetchJobs();
      
      // Set the new job as active
      set({ activeJobId: jobId, loading: false });
      return jobId;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to create job',
        loading: false 
      });
      return null;
    }
  },

  cancelJob: async (jobId: string) => {
    try {
      set({ loading: true, error: null });
      await axios.delete(`/api/jobs/${jobId}`);
      
      // Fetch updated jobs list
      await get().fetchJobs();
      
      set({ loading: false });
      return true;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to cancel job',
        loading: false 
      });
      return false;
    }
  },

  setActiveJob: (jobId: string | null) => {
    set({ activeJobId: jobId });
    
    // If setting a job as active, fetch its details
    if (jobId) {
      get().fetchJobDetails(jobId);
    }
  },

  clearError: () => {
    set({ error: null });
  }
}));