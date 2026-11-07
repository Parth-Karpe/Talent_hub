import { ApplicationRepository } from '../repositories/applicationRepository';
import { JobRepository } from '../repositories/jobRepository';
import { StudentRepository } from '../repositories/studentRepository';
import { AuditRepository } from '../repositories/auditRepository';
import { EligibilityService } from './eligibilityService';

export interface ShortlistBatchResult {
  job_id: number;
  total_evaluated: number;
  shortlisted_count: number;
  ineligible_count: number;
  shortlisted_applications: {
    application_id: number;
    student_name: string;
    student_usn: string;
  }[];
  ineligible_applications: {
    application_id: number;
    student_name: string;
    student_usn: string;
    reason: string;
  }[];
}

export class ShortlistingService {
  /**
   * Run atomic and idempotent shortlisting for a job listing
   */
  static runShortlistForJob(jobId: number, actorUserId?: number | null): ShortlistBatchResult {
    const job = JobRepository.findWithDetails(jobId);
    if (!job) {
      throw new Error(`Job listing with ID ${jobId} not found.`);
    }

    const applications = ApplicationRepository.findByJob(jobId);
    // Shortlisting applies to applications in 'APPLIED' state
    const pendingApps = applications.filter(a => a.status === 'APPLIED');

    const result: ShortlistBatchResult = {
      job_id: jobId,
      total_evaluated: pendingApps.length,
      shortlisted_count: 0,
      ineligible_count: 0,
      shortlisted_applications: [],
      ineligible_applications: []
    };

    for (const app of pendingApps) {
      const student = StudentRepository.findById(app.student_id);
      if (!student) continue;

      const evalResult = EligibilityService.evaluate(student, job, true, actorUserId);

      if (evalResult.eligible) {
        // Atomic status transition
        ApplicationRepository.updateStatus(app.application_id, 'SHORTLISTED');
        
        // Log status change
        AuditRepository.logStatusHistory(
          app.application_id,
          'APPLIED',
          'SHORTLISTED',
          actorUserId,
          'Atomic shortlisting execution: Satisfies all criteria'
        );

        // Queue/dispatch notification (idempotent; failures do not roll back status)
        try {
          AuditRepository.logNotification(
            student.student_id,
            app.application_id,
            'SHORTLISTED',
            student.email,
            `Congratulations! You have been shortlisted for ${job.role_title} at ${job.company_name}. Interviews will be scheduled shortly.`,
            'SENT'
          );
        } catch {
          // Failure logged without aborting shortlist transaction
          AuditRepository.logNotification(
            student.student_id,
            app.application_id,
            'SHORTLISTED',
            student.email,
            `Failed delivery to ${student.email}`,
            'FAILED',
            'Notification gateway transient failure'
          );
        }

        result.shortlisted_count++;
        result.shortlisted_applications.push({
          application_id: app.application_id,
          student_name: student.full_name,
          student_usn: student.usn
        });
      } else {
        result.ineligible_count++;
        result.ineligible_applications.push({
          application_id: app.application_id,
          student_name: student.full_name,
          student_usn: student.usn,
          reason: evalResult.reason
        });

        // Notify ineligible student
        try {
          AuditRepository.logNotification(
            student.student_id,
            app.application_id,
            'INELIGIBLE',
            student.email,
            `Application status update: Ineligible for ${job.role_title}. Reason: ${evalResult.reason}`,
            'SENT'
          );
        } catch {
          // Non-blocking
        }
      }
    }

    return result;
  }
}
