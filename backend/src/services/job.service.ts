import { v4 as uuidv4 } from 'uuid';
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
  startTime?: Date;
  endTime?: Date;
  duration?: number;
}

export interface Job {
  id: string;
  createdAt: Date;
  status: JobStatus;
  urls: string[];
  results: UrlResult[];
  stats: {
    total: number;
    success: number;
    error: number;
    pending: number;
    inProgress: number;
    cancelled: number;
  };
}

// In-memory storage
const jobs = new Map<string, Job>();

// Configuration
const MAX_CONCURRENT_REQUESTS = 5;
const MAX_DELAY_MS = 10000; // 10 seconds

/**
 * Create a new job and start processing URLs asynchronously
 */
export const createJob = async (urls: string[]): Promise<string> => {
  const jobId = uuidv4();
  
  const job: Job = {
    id: jobId,
    createdAt: new Date(),
    status: JobStatus.PENDING,
    urls,
    results: urls.map(url => ({
      url,
      status: UrlStatus.PENDING
    })),
    stats: {
      total: urls.length,
      success: 0,
      error: 0,
      pending: urls.length,
      inProgress: 0,
      cancelled: 0
    }
  };
  
  jobs.set(jobId, job);
  
  // Start processing asynchronously
  setTimeout(() => processJob(jobId), 0);
  
  return jobId;
};

/**
 * Process a job's URLs asynchronously
 */
const processJob = async (jobId: string) => {
  const job = jobs.get(jobId);
  if (!job || job.status !== JobStatus.PENDING) {
    return;
  }
  
  job.status = JobStatus.IN_PROGRESS;
  updateJobStats(job);
  
  const urlQueue = [...job.results];
  const activeRequests = new Map<string, Promise<void>>();
  
  const processNextUrl = async () => {
    // Find next PENDING URL
    const nextUrl = urlQueue.find(url => url.status === UrlStatus.PENDING);
    if (!nextUrl || job.status === JobStatus.CANCELLED) {
      return;
    }
    
    // Update the URL result in the original job results
    const urlResultIndex = job.results.findIndex(r => r.url === nextUrl.url);
    if (urlResultIndex !== -1) {
      job.results[urlResultIndex].status = UrlStatus.IN_PROGRESS;
      job.results[urlResultIndex].startTime = new Date();
      updateJobStats(job);
    }
    
    const requestPromise = checkUrl(nextUrl.url, jobId)
      .then(async (result) => {
        // Artificial delay before saving result
        const delay = Math.floor(Math.random() * MAX_DELAY_MS);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Find and update the URL result in the original job results
        const urlResultIndex = job.results.findIndex(r => r.url === nextUrl.url);
        if (urlResultIndex !== -1 && job.status !== JobStatus.CANCELLED) {
          const urlResult = job.results[urlResultIndex];
          urlResult.status = result.status;
          urlResult.httpStatus = result.httpStatus;
          urlResult.errorMessage = result.errorMessage;
          urlResult.endTime = new Date();
          urlResult.duration = urlResult.endTime.getTime() - (urlResult.startTime?.getTime() || 0);
          
          updateJobStats(job);
          
          // Check if job is complete
          if (job.results.every(r => 
            r.status === UrlStatus.SUCCESS || 
            r.status === UrlStatus.ERROR || 
            r.status === UrlStatus.CANCELLED
          )) {
            job.status = job.stats.cancelled > 0 ? JobStatus.CANCELLED : 
                        job.stats.error === job.stats.total ? JobStatus.FAILED : 
                        JobStatus.COMPLETED;
          }
        }
      })
      .catch(error => {
        console.error(`Error checking URL ${nextUrl.url}:`, error);
      })
      .finally(() => {
        activeRequests.delete(nextUrl.url);
        // Process next URL
        processNextUrl();
      });
    
    activeRequests.set(nextUrl.url, requestPromise);
  };
  
  // Start initial batch of requests
  const initialBatchSize = Math.min(MAX_CONCURRENT_REQUESTS, urlQueue.length);
  for (let i = 0; i < initialBatchSize; i++) {
    processNextUrl();
  }
};

/**
 * Check a single URL using HEAD request
 */
const checkUrl = async (url: string, jobId: string): Promise<{
  status: UrlStatus;
  httpStatus?: number;
  errorMessage?: string;
}> => {
  try {
    const response = await axios.head(url, {
      timeout: 10000,
      validateStatus: () => true // Don't throw on non-2xx status codes
    });
    
    return {
      status: UrlStatus.SUCCESS,
      httpStatus: response.status
    };
  } catch (error: any) {
    return {
      status: UrlStatus.ERROR,
      errorMessage: error.message || 'Unknown error'
    };
  }
};

/**
 * Update job statistics
 */
const updateJobStats = (job: Job) => {
  const stats = {
    total: job.results.length,
    success: 0,
    error: 0,
    pending: 0,
    inProgress: 0,
    cancelled: 0
  };
  
  job.results.forEach(result => {
    switch (result.status) {
      case UrlStatus.PENDING:
        stats.pending++;
        break;
      case UrlStatus.IN_PROGRESS:
        stats.inProgress++;
        break;
      case UrlStatus.SUCCESS:
        stats.success++;
        break;
      case UrlStatus.ERROR:
        stats.error++;
        break;
      case UrlStatus.CANCELLED:
        stats.cancelled++;
        break;
    }
  });
  
  job.stats = stats;
};

/**
 * Get all jobs
 */
export const getAllJobs = (): Array<{
  id: string;
  createdAt: Date;
  status: JobStatus;
  urls: string[];
  stats: Job['stats'];
}> => {
  return Array.from(jobs.values()).map(job => ({
    id: job.id,
    createdAt: job.createdAt,
    status: job.status,
    urls: job.urls,
    stats: job.stats
  }));
};

/**
 * Get a specific job by ID
 */
export const getJob = (id: string): Job | undefined => {
  return jobs.get(id);
};

/**
 * Cancel a job
 */
export const cancelJob = (id: string): boolean => {
  const job = jobs.get(id);
  if (!job || 
      job.status === JobStatus.COMPLETED || 
      job.status === JobStatus.FAILED || 
      job.status === JobStatus.CANCELLED) {
    return false;
  }
  
  job.status = JobStatus.CANCELLED;
  
  // Cancel pending URLs
  job.results.forEach(result => {
    if (result.status === UrlStatus.PENDING || result.status === UrlStatus.IN_PROGRESS) {
      result.status = UrlStatus.CANCELLED;
      result.endTime = new Date();
      if (result.startTime) {
        result.duration = result.endTime.getTime() - result.startTime.getTime();
      }
    }
  });
  
  updateJobStats(job);
  return true;
};