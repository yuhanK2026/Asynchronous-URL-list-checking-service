import React, { useEffect, useState } from 'react';
import { useJobStore, Job, JobStatus } from '../store/jobStore';
import { format } from 'date-fns';

interface JobDetailsProps {
  job: Job;
}

const JobDetails: React.FC<JobDetailsProps> = ({ job }) => {
  const { cancelJob, fetchJobDetails } = useJobStore();
  const [isPolling, setIsPolling] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isPolling && job && !isFinalStatus(job.status)) {
      intervalId = setInterval(() => {
        fetchJobDetails(job.id);
      }, 2000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [job?.id, isPolling, job?.status, fetchJobDetails]);

  const isFinalStatus = (status: JobStatus) => {
    return status === JobStatus.COMPLETED || 
           status === JobStatus.FAILED || 
           status === JobStatus.CANCELLED;
  };

  const handleCancelJob = async () => {
    if (!window.confirm('Are you sure you want to cancel this job?')) {
      return;
    }
    
    setIsCancelling(true);
    await cancelJob(job.id);
    setIsCancelling(false);
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '-';
    return `${duration}ms`;
  };

  const getUrlStatusClass = (status: string) => {
    return status.toLowerCase().replace(' ', '_');
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return '-';
    try {
      return format(new Date(timeString), 'HH:mm:ss.SSS');
    } catch {
      return timeString;
    }
  };

  if (!job.results) {
    return (
      <div className="loading">
        <p>Loading job details...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="controls">
        <button
          className="button button-danger"
          onClick={handleCancelJob}
          disabled={isFinalStatus(job.status) || isCancelling}
        >
          {isCancelling ? 'Cancelling...' : 'Cancel Job'}
        </button>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input
            type="checkbox"
            checked={isPolling}
            onChange={(e) => setIsPolling(e.target.checked)}
            disabled={isFinalStatus(job.status)}
          />
          Auto-refresh
        </label>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <div className="job-stats" style={{ justifyContent: 'flex-start', gap: '20px' }}>
          <div className="stat">
            <span>Total:</span>
            <span>{job.stats.total}</span>
          </div>
          <div className="stat success">
            <span>✓</span>
            <span>{job.stats.success}</span>
          </div>
          <div className="stat error">
            <span>✗</span>
            <span>{job.stats.error}</span>
          </div>
          <div className="stat">
            <span>Pending:</span>
            <span>{job.stats.pending + job.stats.inProgress}</span>
          </div>
          <div className="stat">
            <span>Cancelled:</span>
            <span>{job.stats.cancelled}</span>
          </div>
        </div>
        
        <div className="progress-bar" style={{ marginTop: '10px' }}>
          <div 
            className="progress-fill" 
            style={{ 
              width: `${((job.stats.success + job.stats.error + job.stats.cancelled) / job.stats.total) * 100}%` 
            }}
          />
        </div>
      </div>
      
      <div className="url-list">
        <h3 style={{ margin: '20px 0 10px 0' }}>URL Results:</h3>
        {job.results.map((result, index) => (
          <div key={`${result.url}-${index}`} className="url-item">
            <div className={`url-status ${getUrlStatusClass(result.status)}`} />
            <div className="url-details">
              <div className="url-text" title={result.url}>
                {result.url}
              </div>
              <div className="url-meta">
                <span>Status: {result.status}</span>
                {result.httpStatus && <span>HTTP: {result.httpStatus}</span>}
                {result.duration && <span>Duration: {formatDuration(result.duration)}</span>}
                <span>Start: {formatTime(result.startTime)}</span>
                <span>End: {formatTime(result.endTime)}</span>
              </div>
              {result.errorMessage && (
                <div style={{ fontSize: '12px', color: '#dc3545', marginTop: '3px' }}>
                  Error: {result.errorMessage}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobDetails;