import React, { useEffect } from 'react';
import { useJobStore, Job } from '../store/jobStore';
import { format } from 'date-fns';

interface JobListProps {}

const JobList: React.FC<JobListProps> = () => {
  const { jobs, activeJobId, setActiveJob, fetchJobs } = useJobStore();

  useEffect(() => {
    // Fetch jobs on mount
    fetchJobs();
  }, [fetchJobs]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, HH:mm:ss');
    } catch {
      return dateString;
    }
  };

  const getStatusClass = (status: string) => {
    return status.toLowerCase().replace(' ', '_');
  };

  if (jobs.length === 0) {
    return (
      <div className="empty-state">
        <p>No jobs yet</p>
        <p>Create your first job by entering URLs above</p>
      </div>
    );
  }

  return (
    <div className="job-list">
      {jobs.map((job: Job) => (
        <div
          key={job.id}
          className={`job-item ${activeJobId === job.id ? 'active' : ''}`}
          onClick={() => setActiveJob(job.id)}
        >
          <div className="job-header">
            <div>
              <div className="job-id">ID: {job.id.substring(0, 12)}...</div>
              <div className={`job-status ${getStatusClass(job.status)}`}>
                {job.status}
              </div>
            </div>
            <div className="job-meta">
              <span>{formatDate(job.createdAt)}</span>
              <span>{job.urls.length} URLs</span>
            </div>
          </div>
          
          <div className="job-stats">
            <div className="stat success">
              <span>✓</span>
              <span>{job.stats.success} success</span>
            </div>
            <div className="stat error">
              <span>✗</span>
              <span>{job.stats.error} error</span>
            </div>
            <div className="stat pending">
              <span>⏳</span>
              <span>{job.stats.pending + job.stats.inProgress} pending</span>
            </div>
          </div>
          
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ 
                width: `${((job.stats.success + job.stats.error + job.stats.cancelled) / job.stats.total) * 100}%` 
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobList;