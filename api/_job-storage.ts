import { JobStatus } from '../types';

interface Job {
    status: JobStatus;
    results: any | null;
}

// NOTE: This is an in-memory store.
// In a stateless serverless environment, this means a job's state is not guaranteed
// to persist across different function invocations if they are handled by different
// server instances. For a production application, a persistent external store like
// Redis, Firestore, or a database should be used to manage job state.
// However, for this demonstration, this approach is sufficient to show the architecture.
export const jobStorage = new Map<string, Job>();
