import React, { useState } from 'react';
import { useJobStore } from '../store/jobStore';

const JobForm: React.FC = () => {
  const [urlsText, setUrlsText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createJob } = useJobStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const urls = urlsText
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    if (urls.length === 0) {
      alert('Please enter at least one URL');
      return;
    }
    
    setIsSubmitting(true);
    await createJob(urls);
    setIsSubmitting(false);
    setUrlsText('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="urls">Enter URLs (one per line):</label>
        <textarea
          id="urls"
          value={urlsText}
          onChange={(e) => setUrlsText(e.target.value)}
          placeholder="https://example.com&#10;https://google.com&#10;https://github.com"
          disabled={isSubmitting}
        />
      </div>
      
      <button 
        type="submit" 
        className="button"
        disabled={isSubmitting || !urlsText.trim()}
      >
        {isSubmitting ? 'Creating Job...' : 'Start Checking URLs'}
      </button>
      
      <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
        <p>Each URL will be checked with a HEAD request. Processing includes random delays (0-10 seconds).</p>
      </div>
    </form>
  );
};

export default JobForm;