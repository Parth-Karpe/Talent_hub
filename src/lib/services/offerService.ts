import { OfferRepository } from '../repositories/offerRepository';
import { ApplicationRepository } from '../repositories/applicationRepository';
import { StudentRepository } from '../repositories/studentRepository';
import { AuditRepository } from '../repositories/auditRepository';
import { JobRepository } from '../repositories/jobRepository';
import { Offer } from '../models/types';

export class OfferService {
  /**
   * Issue an offer for an interviewed application
   */
  static issueOffer(
    applicationId: number,
    packageLpa: number,
    actorUserId?: number | null
  ): Offer {
    const app = ApplicationRepository.findById(applicationId);
    if (!app) {
      throw new Error(`Application #${applicationId} not found.`);
    }

    if (app.status !== 'INTERVIEWED') {
      throw new Error(
        `Business Rule Violation: An offer can only be issued after the candidate has reached 'INTERVIEWED' status (current status: ${app.status}).`
      );
    }

    const existingOffer = OfferRepository.findByApplicationId(applicationId);
    if (existingOffer) {
      throw new Error(`An offer has already been issued for Application #${applicationId}. Only one offer per application is permitted.`);
    }

    const offer = OfferRepository.create(applicationId, packageLpa);
    
    // Progress status to OFFERED
    ApplicationRepository.updateStatus(applicationId, 'OFFERED');

    AuditRepository.logStatusHistory(
      applicationId,
      'INTERVIEWED',
      'OFFERED',
      actorUserId,
      `Offer issued with CTC package: ${packageLpa.toFixed(2)} LPA`
    );

    const student = StudentRepository.findById(app.student_id);
    const job = JobRepository.findWithDetails(app.job_id);
    if (student && job) {
      AuditRepository.logNotification(
        student.student_id,
        applicationId,
        'OFFER_ISSUED',
        student.email,
        `Congratulations! ${job.company_name} has extended you an employment offer of ${packageLpa.toFixed(2)} LPA for ${job.role_title}. Log in to view and accept your offer.`
      );
    }

    return offer;
  }

  /**
   * Atomic Offer Acceptance
   * Atomically updates:
   * 1. offers.is_accepted = true and offers.accepted_at = timestamp
   * 2. applications.status = ACCEPTED
   * 3. students.has_accepted_offer = true
   * Verifies authenticated student ownership.
   */
  static acceptOffer(
    offerId: number,
    authenticatedStudentId: number,
    actorUserId?: number | null
  ): { offer: Offer; student_name: string; package_lpa: number } {
    const offer = OfferRepository.findById(offerId);
    if (!offer) {
      throw new Error(`Offer #${offerId} not found.`);
    }

    if (offer.is_accepted) {
      throw new Error(`This offer has already been accepted.`);
    }

    const app = ApplicationRepository.findById(offer.application_id);
    if (!app) {
      throw new Error(`Associated application #${offer.application_id} not found.`);
    }

    // Security Authorization: Student must own the application
    if (app.student_id !== authenticatedStudentId) {
      throw new Error(`Security Violation: You are not authorized to accept an offer belonging to another student.`);
    }

    const student = StudentRepository.findById(app.student_id);
    if (!student) {
      throw new Error(`Student #${app.student_id} not found.`);
    }

    if (student.has_accepted_offer) {
      throw new Error(`Policy Violation: You have already accepted an offer this season and cannot accept another.`);
    }

    // --- ATOMIC TRANSACTION ---
    // 1. Mark offer accepted
    const updatedOffer = OfferRepository.markAccepted(offerId);

    // 2. Update application status to ACCEPTED
    ApplicationRepository.updateStatus(app.application_id, 'ACCEPTED');

    // 3. Mark student has_accepted_offer = true
    StudentRepository.setHasAcceptedOffer(student.student_id, true);

    // 4. Audit status history
    AuditRepository.logStatusHistory(
      app.application_id,
      'OFFERED',
      'ACCEPTED',
      actorUserId || authenticatedStudentId,
      `Student accepted offer #${offerId} (${offer.package_lpa} LPA)`
    );

    // 5. Audit notification log
    AuditRepository.logNotification(
      student.student_id,
      app.application_id,
      'OFFER_ACCEPTED',
      student.email,
      `Offer accepted successfully! TalentHub records you as officially placed at ${offer.package_lpa} LPA.`
    );

    return {
      offer: updatedOffer!,
      student_name: student.full_name,
      package_lpa: offer.package_lpa
    };
  }
}
