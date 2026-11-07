import { NextResponse } from 'next/server';
import { ReportService } from '@/lib/services/reportService';
import { AuditRepository } from '@/lib/repositories/auditRepository';

export async function GET() {
  try {
    const report = ReportService.getFullReport();
    const eligibilityDecisions = AuditRepository.getEligibilityDecisions();
    const statusHistory = AuditRepository.getStatusHistory();
    const notificationLogs = AuditRepository.getNotificationLogs();

    return NextResponse.json({
      report,
      audits: {
        eligibility_decisions: eligibilityDecisions,
        status_history: statusHistory,
        notification_logs: notificationLogs
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
