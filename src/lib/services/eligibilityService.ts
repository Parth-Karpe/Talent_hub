import { Student, JobWithDetails, EligibilityResult } from '../models/types';
import { AuditRepository } from '../repositories/auditRepository';

export class EligibilityService {
  /**
   * Central Eligibility Evaluator
   * Follows the exact 4-step order specified in TalentHub Requirements:
   * (1) student.cgpa >= job.min_cgpa (exact minimum qualifies)
   * (2) student.active_backlogs <= job.max_backlogs (cleared backlogs do not affect eligibility)
   * (3) student.has_accepted_offer === false (no accepted offer in the season)
   * (4) job.allowed_branches is empty (open to all) OR includes student.branch
   */
  static evaluate(
    student: Student,
    job: JobWithDetails,
    recordDecision: boolean = true,
    checkedByUserId?: number | null
  ): EligibilityResult {
    // Rule 1: CGPA check
    const studentCgpa = Number(student.cgpa);
    const minCgpa = Number(job.min_cgpa);
    const cgpaPass = studentCgpa >= minCgpa;

    // Rule 2: Active Backlogs check (cleared backlogs do not count)
    const activeBacklogs = Number(student.active_backlogs);
    const maxBacklogs = Number(job.max_backlogs);
    const backlogPass = activeBacklogs <= maxBacklogs;

    // Rule 3: Season Accepted Offer check
    const offerPass = !student.has_accepted_offer;

    // Rule 4: Branch whitelist check (empty = open to all branches)
    const allowedBranches = job.allowed_branches || [];
    const branchPass = allowedBranches.length === 0 || allowedBranches.includes(student.branch);

    const eligible = cgpaPass && backlogPass && offerPass && branchPass;

    // Construct human-readable explanation identifying exact pass confirmation or first failing rule
    let reason = '';
    if (!cgpaPass) {
      reason = `Ineligible: Student CGPA (${studentCgpa.toFixed(2)}) is below the required minimum (${minCgpa.toFixed(2)}).`;
    } else if (!backlogPass) {
      reason = `Ineligible: Student has ${activeBacklogs} active backlog(s), which exceeds the drive limit of ${maxBacklogs}. (Cleared backlogs: ${student.cleared_backlogs} do not count).`;
    } else if (!offerPass) {
      reason = `Ineligible: Student has already accepted an offer in this placement season. Under placement policy, students with an accepted offer cannot apply for further drives.`;
    } else if (!branchPass) {
      reason = `Ineligible: Student branch '${student.branch}' is not in the drive's permitted branch whitelist [${allowedBranches.join(', ')}].`;
    } else {
      reason = `Eligible: Meets all criteria — CGPA (${studentCgpa.toFixed(2)} >= ${minCgpa.toFixed(2)}), active backlogs (${activeBacklogs} <= ${maxBacklogs}), no prior accepted offer, and branch '${student.branch}' is approved.`;
    }

    const result: EligibilityResult = {
      student_id: student.student_id,
      job_id: job.job_id,
      eligible,
      reason,
      breakdown: {
        cgpa_check: { pass: cgpaPass, student_cgpa: studentCgpa, min_cgpa: minCgpa },
        backlog_check: { pass: backlogPass, active_backlogs: activeBacklogs, max_backlogs: maxBacklogs },
        offer_check: { pass: offerPass, has_accepted_offer: student.has_accepted_offer },
        branch_check: { pass: branchPass, student_branch: student.branch, allowed_branches: allowedBranches }
      }
    };

    if (recordDecision) {
      AuditRepository.logEligibilityDecision(
        student.student_id,
        job.job_id,
        eligible,
        reason,
        checkedByUserId
      );
    }

    return result;
  }
}
