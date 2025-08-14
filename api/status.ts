import type { VercelRequest, VercelResponse } from '@vercel/node';
import { jobStorage } from './_job-storage';

export default function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { jobId } = req.query;

    if (!jobId || typeof jobId !== 'string') {
        return res.status(400).json({ error: 'Job ID is required.' });
    }

    const job = jobStorage.get(jobId);

    if (!job) {
        return res.status(404).json({ error: 'Job not found.' });
    }
    
    // If the job is complete, send the results along with the status
    if (job.status.status === 'COMPLETED') {
        res.status(200).json({ status: job.status, results: job.results });
        // Optional: Clean up completed jobs after they are fetched once
        // jobStorage.delete(jobId);
    } else {
        // Otherwise, just send the current status
        res.status(200).json({ status: job.status });
    }
}
