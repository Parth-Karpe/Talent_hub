import { dbManager } from '../db/database';
import {
  StudentConsent,
  EligibilityDecision,
  ApplicationStatusHistory,
  NotificationLog,
  ApplicationStatus,
  DeliveryStatus
} from '../models/types';

export class AuditRepository {
  // --- ELIGIBILITY DECISION AUDIT ---
  static logEligibilityDecision(
    studentId: number,
    jobId: number,
    eligible: boolean,
    reason: string,
    checkedByUserId?: number | null
  ): EligibilityDecision {
    const db = dbManager.getData();
    const newId = db.eligibility_decisions.reduce((max, d) => Math.max(max, d.decision_id), 0) + 1;
    const now = new Date().toISOString();

    const decision: EligibilityDecision = {
      decision_id: newId,
      student_id: studentId,
      job_id: jobId,
      eligible,
      reason,
      checked_at: now,
      checked_by_user_id: checkedByUserId || null,
      rule_version: 'v1.0'
    };

    db.eligibility_decisions.push(decision);
    dbManager.saveData(db);
    return decision;
  }

  static getEligibilityDecisions(studentId?: number, jobId?: number): EligibilityDecision[] {
    const db = dbManager.getData();
    let records = db.eligibility_decisions;
    if (studentId) records = records.filter(r => r.student_id === studentId);
    if (jobId) records = records.filter(r => r.job_id === jobId);
    return [...records].reverse();
  }

  // --- APPLICATION STATUS HISTORY AUDIT ---
  static logStatusHistory(
    applicationId: number,
    oldStatus: ApplicationStatus | null,
    newStatus: ApplicationStatus,
    changedByUserId?: number | null,
    reason?: string | null,
    requestId?: string | null
  ): ApplicationStatusHistory {
    const db = dbManager.getData();
    const newId = db.application_status_history.reduce((max, h) => Math.max(max, h.status_history_id), 0) + 1;
    const now = new Date().toISOString();

    const entry: ApplicationStatusHistory = {
      status_history_id: newId,
      application_id: applicationId,
      old_status: oldStatus,
      new_status: newStatus,
      changed_at: now,
      changed_by_user_id: changedByUserId || null,
      reason: reason || null,
      request_id: requestId || `req-${Date.now()}`
    };

    db.application_status_history.push(entry);
    dbManager.saveData(db);
    return entry;
  }

  static getStatusHistory(applicationId?: number): ApplicationStatusHistory[] {
    const db = dbManager.getData();
    let records = db.application_status_history;
    if (applicationId) records = records.filter(h => h.application_id === applicationId);
    return [...records].reverse();
  }

  // --- NOTIFICATION LOGS ---
  static logNotification(
    studentId: number,
    applicationId: number | null,
    notificationType: string,
    recipientEmail: string,
    messageSummary: string,
    deliveryStatus: DeliveryStatus = 'SENT',
    lastError?: string | null
  ): NotificationLog {
    const db = dbManager.getData();
    const newId = db.notification_logs.reduce((max, n) => Math.max(max, n.notification_id), 0) + 1;
    const now = new Date().toISOString();

    const log: NotificationLog = {
      notification_id: newId,
      student_id: studentId,
      application_id: applicationId,
      notification_type: notificationType,
      recipient_email: recipientEmail,
      message_summary: messageSummary,
      delivery_status: deliveryStatus,
      attempt_count: 1,
      last_error: lastError || null,
      created_at: now,
      sent_at: deliveryStatus === 'SENT' ? now : null
    };

    db.notification_logs.push(log);
    dbManager.saveData(db);
    return log;
  }

  static getNotificationLogs(studentId?: number): NotificationLog[] {
    const db = dbManager.getData();
    let records = db.notification_logs;
    if (studentId) records = records.filter(n => n.student_id === studentId);
    return [...records].reverse();
  }

  // --- STUDENT CONSENT ---
  static getConsent(studentId: number, purpose: string = 'PLACEMENT_DATA_PROCESSING'): StudentConsent | null {
    const db = dbManager.getData();
    const consents = db.student_consents
      .filter(c => c.student_id === studentId && c.purpose === purpose)
      .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());
    return consents[0] || null;
  }
}
