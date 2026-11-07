import { dbManager } from '../db/database';
import { PlacementSummary, BranchStat, CompanyStat, Branch } from '../models/types';

export class ReportService {
  static getFullReport(): {
    summary: PlacementSummary;
    branch_breakdown: BranchStat[];
    company_breakdown: CompanyStat[];
    funnel: Record<string, number>;
  } {
    const db = dbManager.getData();

    const totalStudents = db.students.length;
    const placedStudents = db.students.filter(s => s.has_accepted_offer).length;
    const placementPercentage = totalStudents > 0 
      ? Math.round((placedStudents / totalStudents) * 1000) / 10 
      : 0;

    const acceptedOffers = db.offers.filter(o => o.is_accepted);
    const totalOffers = db.offers.length;
    
    const packages = acceptedOffers.map(o => Number(o.package_lpa));
    const avgPackage = packages.length > 0 
      ? Math.round((packages.reduce((a, b) => a + b, 0) / packages.length) * 10) / 10 
      : 0;
    const highestPackage = packages.length > 0 ? Math.max(...packages) : 0;

    const summary: PlacementSummary = {
      total_students: totalStudents,
      total_placed: placedStudents,
      placement_percentage: placementPercentage,
      total_jobs: db.job_listings.length,
      total_applications: db.applications.length,
      total_offers: totalOffers,
      total_accepted_offers: acceptedOffers.length,
      avg_package_lpa: avgPackage,
      highest_package_lpa: highestPackage
    };

    // Branch Breakdown
    const branches: Branch[] = ['CSE', 'ECE', 'ISE', 'MECH', 'CIVIL'];
    const branchBreakdown: BranchStat[] = branches.map(b => {
      const branchStudents = db.students.filter(s => s.branch === b);
      const branchPlaced = branchStudents.filter(s => s.has_accepted_offer);
      const rate = branchStudents.length > 0 
        ? Math.round((branchPlaced.length / branchStudents.length) * 1000) / 10 
        : 0;
      
      // Calculate branch avg package
      const branchStudentIds = branchPlaced.map(s => s.student_id);
      const branchApps = db.applications.filter(a => branchStudentIds.includes(a.student_id) && a.status === 'ACCEPTED');
      const branchAppIds = branchApps.map(a => a.application_id);
      const branchAcceptedOffers = db.offers.filter(o => branchAppIds.includes(o.application_id) && o.is_accepted);
      const bPackages = branchAcceptedOffers.map(o => Number(o.package_lpa));
      const bAvg = bPackages.length > 0 
        ? Math.round((bPackages.reduce((a, b) => a + b, 0) / bPackages.length) * 10) / 10 
        : 0;

      return {
        branch: b,
        total_students: branchStudents.length,
        placed_students: branchPlaced.length,
        placement_rate: rate,
        avg_package_lpa: bAvg
      };
    });

    // Company Breakdown
    const companyBreakdown: CompanyStat[] = db.companies.map(c => {
      const companyJobs = db.job_listings.filter(j => j.company_id === c.company_id);
      const jobIds = companyJobs.map(j => j.job_id);
      const companyApps = db.applications.filter(a => jobIds.includes(a.job_id));
      const appIds = companyApps.map(a => a.application_id);
      const shortlisted = companyApps.filter(a => ['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'OFFERED', 'ACCEPTED'].includes(a.status)).length;
      const cOffers = db.offers.filter(o => appIds.includes(o.application_id));
      const cAccepted = cOffers.filter(o => o.is_accepted);
      
      const cPackages = cOffers.map(o => Number(o.package_lpa));
      const cAvg = cPackages.length > 0 
        ? Math.round((cPackages.reduce((a, b) => a + b, 0) / cPackages.length) * 10) / 10 
        : 0;

      return {
        company_name: c.company_name,
        openings: companyJobs.length,
        applications: companyApps.length,
        shortlisted: shortlisted,
        offers_issued: cOffers.length,
        offers_accepted: cAccepted.length,
        avg_package_lpa: cAvg
      };
    });

    // Funnel breakdown
    const funnel: Record<string, number> = {
      APPLIED: db.applications.length,
      SHORTLISTED: db.applications.filter(a => ['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED', 'OFFERED', 'ACCEPTED'].includes(a.status)).length,
      INTERVIEW_SCHEDULED: db.applications.filter(a => ['INTERVIEW_SCHEDULED', 'INTERVIEWED', 'OFFERED', 'ACCEPTED'].includes(a.status)).length,
      INTERVIEWED: db.applications.filter(a => ['INTERVIEWED', 'OFFERED', 'ACCEPTED'].includes(a.status)).length,
      OFFERED: db.applications.filter(a => ['OFFERED', 'ACCEPTED'].includes(a.status)).length,
      ACCEPTED: db.applications.filter(a => a.status === 'ACCEPTED').length
    };

    return {
      summary,
      branch_breakdown: branchBreakdown,
      company_breakdown: companyBreakdown,
      funnel
    };
  }
}
