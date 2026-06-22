import React, { useEffect } from 'react';
import JobForm from './components/JobForm';
import JobList from './components/JobList';
import JobDetails from './components/JobDetails';
import { useJobStore } from './store/jobStore';
import './App.css';

function App() {
  const { 
    activeJobId, 
    jobs, 
    loading, 
    error,
    fetchJobs
  } = useJobStore();
  
  const activeJob = activeJobId ? jobs.find(job => job.id === activeJobId) : null;
  
  useEffect(() => {
    fetchJobs();
    // Poll for job updates every 5 seconds
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  return (
    <div className="container">
      <header className="header">
        <h1>URL Checker Service</h1>
        <p>Asynchronous URL checking service</p>
      </header>

      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}

      <div className="grid">
        <div className="grid-item">
          <div className="card">
            <h2>Create New Job</h2>
            <JobForm />
          </div>
        </div>

        <div className="grid-item">
          <div className="card">
            <h2>Job List</h2>
            <JobList />
          </div>
        </div>
      </div>

      {activeJob && (
        <div className="card">
          <h2>Job Details: {activeJob.id.substring(0, 8)}...</h2>
          <JobDetails job={activeJob} />
        </div>
      )}

      {loading && (
        <div className="loading">
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
}

export default App;