import { StudentRepository } from '../repositories/studentRepository';
import { JobRepository } from '../repositories/jobRepository';
import { ApplicationRepository } from '../repositories/applicationRepository';
import { AuditRepository } from '../repositories/auditRepository';
import { EligibilityService } from './eligibilityService';
import { ApplicationDetail } from '../models/types';

export class ApplicationService {
  static apply(studentId: number, jobId: number, actorUserId?: number | null): ApplicationDetail {
    const student = StudentRepository.findById(studentId);
    if (!student) {
      throw new Error(`Student with ID ${studentId} not found.`);
    }

    const job = JobRepository.findWithDetails(jobId);
    if (!job) {
      throw new Error(`Job listing with ID ${jobId} not found.`);
    }

    // 1. Check if job is open
    if (!job.is_open) {
      throw new Error(`This recruitment drive is closed. Applications are no longer accepted.`);
    }

    // 2. Check for duplicate application to the same job
    const existingJobApp = ApplicationRepository.findByStudentAndJob(studentId, jobId);
    if (existingJobApp) {
      throw new Error(`You have already submitted an application for this drive (Application ID #${existingJobApp.application_id}).`);
    }

    // 3. Business rule: Student cannot apply to the same company more than once in the same season
    const existingCompanyApps = ApplicationRepository.findStudentApplicationsInCompanyAndSeason(
      studentId,
      job.company_id,
      job.season_id
    );
    if (existingCompanyApps.length > 0) {
      throw new Error(`Placement Rule: You have already applied to ${job.company_name} during this placement season. A student cannot apply to the same company more than once in a single season.`);
    }

    // 4. Central eligibility evaluation
    const evalResult = EligibilityService.evaluate(student, job, true, actorUserId);
    if (!evalResult.eligible) {
      throw new Error(evalResult.reason);
    }

    // 5. Create application record
    const newApp = ApplicationRepository.create(studentId, jobId);

    // 6. Log status history
    AuditRepository.logStatusHistory(
      newApp.application_id,
      null,
      'APPLIED',
      actorUserId,
      'Student applied for drive'
    );

    // 7. Log notification
    AuditRepository.logNotification(
      studentId,
      newApp.application_id,
      'APPLICATION_SUBMITTED',
      student.email,
      `Your application for ${job.role_title} at ${job.company_name} has been received successfully.`
    );

    return ApplicationRepository.toDetail(newApp)!;
  }
}
