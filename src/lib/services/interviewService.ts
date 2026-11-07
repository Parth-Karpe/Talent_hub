import { ApplicationRepository } from '../repositories/applicationRepository';
import { InterviewRepository } from '../repositories/interviewRepository';
import { StudentRepository } from '../repositories/studentRepository';
import { AuditRepository } from '../repositories/auditRepository';
import { InterviewSlot, InterviewResult } from '../models/types';

export class InterviewService {
  static scheduleRound(
    applicationId: number,
    roundNumber: number,
    scheduledAt: string,
    venue: string,
    notes?: string,
    actorUserId?: number | null
  ): InterviewSlot {
    const app = ApplicationRepository.findById(applicationId);
    if (!app) {
      throw new Error(`Application #${applicationId} not found.`);
    }

    // Only SHORTLISTED, INTERVIEW_SCHEDULED, or INTERVIEWED applications can have rounds scheduled
    const allowedStatuses = ['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'INTERVIEWED'];
    if (!allowedStatuses.includes(app.status)) {
      throw new Error(
        `Invalid status transition: Only SHORTLISTED or ongoing interview applications can have interview rounds scheduled (current status: ${app.status}).`
      );
    }

    // Round number must be unique within this application
    const existingSlot = InterviewRepository.findByAppAndRound(applicationId, roundNumber);
    if (existingSlot) {
      throw new Error(`Round ${roundNumber} has already been scheduled for application #${applicationId}.`);
    }

    const slot = InterviewRepository.create({
      application_id: applicationId,
      round_number: roundNumber,
      scheduled_at: scheduledAt,
      venue,
      result: 'PENDING',
      notes: notes || null
    });

    const oldStatus = app.status;
    ApplicationRepository.updateStatus(applicationId, 'INTERVIEW_SCHEDULED');

    AuditRepository.logStatusHistory(
      applicationId,
      oldStatus,
      'INTERVIEW_SCHEDULED',
      actorUserId,
      `Scheduled Round ${roundNumber} at ${venue} for ${scheduledAt}`
    );

    const student = StudentRepository.findById(app.student_id);
    if (student) {
      AuditRepository.logNotification(
        student.student_id,
        applicationId,
        'INTERVIEW_SCHEDULED',
        student.email,
        `Interview Scheduled: Round ${roundNumber} on ${new Date(scheduledAt).toLocaleString()} at ${venue}.`
      );
    }

    return slot;
  }

  static recordResult(
    slotId: number,
    result: InterviewResult,
    notes?: string,
    actorUserId?: number | null
  ): InterviewSlot {
    const slot = InterviewRepository.findById(slotId);
    if (!slot) {
      throw new Error(`Interview slot #${slotId} not found.`);
    }

    const updatedSlot = InterviewRepository.updateResult(slotId, result, notes);

    // Update application to INTERVIEWED
    const app = ApplicationRepository.findById(slot.application_id);
    if (app && app.status === 'INTERVIEW_SCHEDULED') {
      ApplicationRepository.updateStatus(app.application_id, 'INTERVIEWED');
      AuditRepository.logStatusHistory(
        app.application_id,
        'INTERVIEW_SCHEDULED',
        'INTERVIEWED',
        actorUserId,
        `Interview Round ${slot.round_number} evaluation recorded: ${result}`
      );
    }

    return updatedSlot!;
  }
}
