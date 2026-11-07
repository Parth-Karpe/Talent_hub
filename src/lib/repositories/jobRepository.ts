import { dbManager } from '../db/database';
import { JobListing, JobAllowedBranch, JobWithDetails, Branch } from '../models/types';

export class JobRepository {
  static findById(jobId: number): JobListing | null {
    const db = dbManager.getData();
    return db.job_listings.find(j => j.job_id === jobId) || null;
  }

  static getAllowedBranches(jobId: number): Branch[] {
    const db = dbManager.getData();
    return db.job_allowed_branches
      .filter(b => b.job_id === jobId)
      .map(b => b.branch);
  }

  static findWithDetails(jobId: number): JobWithDetails | null {
    const db = dbManager.getData();
    const job = db.job_listings.find(j => j.job_id === jobId);
    if (!job) return null;

    const company = db.companies.find(c => c.company_id === job.company_id);
    const branches = this.getAllowedBranches(job.job_id);

    return {
      ...job,
      company_name: company?.company_name || 'Unknown Company',
      allowed_branches: branches
    };
  }

  static findAllWithDetails(seasonId?: number): JobWithDetails[] {
    const db = dbManager.getData();
    let jobs = db.job_listings;
    if (seasonId) {
      jobs = jobs.filter(j => j.season_id === seasonId);
    }

    return jobs.map(job => {
      const company = db.companies.find(c => c.company_id === job.company_id);
      const branches = this.getAllowedBranches(job.job_id);
      return {
        ...job,
        company_name: company?.company_name || 'Unknown Company',
        allowed_branches: branches
      };
    });
  }

  static findByCompany(companyId: number): JobWithDetails[] {
    const db = dbManager.getData();
    const jobs = db.job_listings.filter(j => j.company_id === companyId);
    const company = db.companies.find(c => c.company_id === companyId);

    return jobs.map(job => ({
      ...job,
      company_name: company?.company_name || 'Unknown Company',
      allowed_branches: this.getAllowedBranches(job.job_id)
    }));
  }

  static create(
    jobData: Omit<JobListing, 'job_id' | 'created_at' | 'updated_at'>,
    allowedBranches: Branch[]
  ): JobWithDetails {
    const db = dbManager.getData();
    const newJobId = db.job_listings.reduce((max, j) => Math.max(max, j.job_id), 0) + 1;
    const now = new Date().toISOString();

    const newJob: JobListing = {
      ...jobData,
      job_id: newJobId,
      created_at: now,
      updated_at: now
    };

    db.job_listings.push(newJob);

    // Add branch whitelists if any specified
    let branchId = db.job_allowed_branches.reduce((max, b) => Math.max(max, b.job_allowed_branch_id), 0) + 1;
    for (const b of allowedBranches) {
      db.job_allowed_branches.push({
        job_allowed_branch_id: branchId++,
        job_id: newJobId,
        branch: b
      });
    }

    dbManager.saveData(db);
    return this.findWithDetails(newJobId)!;
  }
}
