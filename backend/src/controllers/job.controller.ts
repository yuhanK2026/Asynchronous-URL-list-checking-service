import { Request, Response } from 'express';
import * as jobService from '../services/job.service';

export const createJob = async (req: Request, res: Response) => {
  try {
    const { urls } = req.body;
    
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'URLs array is required and must not be empty' });
    }

    const jobId = await jobService.createJob(urls);
    res.status(201).json({ jobId });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getJobs = (_req: Request, res: Response) => {
  try {
    const jobs = jobService.getAllJobs();
    res.json(jobs);
  } catch (error) {
    console.error('Error getting jobs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getJobById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = jobService.getJob(id);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error('Error getting job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const cancelJob = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = jobService.cancelJob(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Job not found or already completed' });
    }
    
    res.status(200).json({ message: 'Job cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling job:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};