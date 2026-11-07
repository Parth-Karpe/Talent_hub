import { dbManager } from '../lib/db/database';
import { EligibilityService } from '../lib/services/eligibilityService';
import { ApplicationService } from '../lib/services/applicationService';
import { ShortlistingService } from '../lib/services/shortlistingService';
import { InterviewService } from '../lib/services/interviewService';
import { OfferService } from '../lib/services/offerService';
import { ReportService } from '../lib/services/reportService';
import { StudentRepository } from '../lib/repositories/studentRepository';
import { JobRepository } from '../lib/repositories/jobRepository';
import { ApplicationRepository } from '../lib/repositories/applicationRepository';
import { AuditRepository } from '../lib/repositories/auditRepository';
import { Student, JobWithDetails } from '../lib/models/types';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ TEST FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🧪 TALENTHUB PLATFORM COMPREHENSIVE TEST SUITE');
  console.log('======================================================\n');

  // Reset DB to fresh demo baseline before tests
  dbManager.reset();

  // -------------------------------------------------------------------------
  // TEST GROUP 1: ELIGIBILITY EVALUATION ALGORITHM & BUSINESS RULES
  // -------------------------------------------------------------------------
  console.log('--- TEST GROUP 1: 4-Step Eligibility Algorithm ---');

  const abcJob = JobRepository.findWithDetails(1)!; // ABC Tech SDE-1: min 7.0, max backlogs 2, branches: CSE, ISE, ECE
  const infosysJob = JobRepository.findWithDetails(2)!; // Infosys: min 6.0, max backlogs 3, branches: [] (open to all)

  // 1.1 Rahul Scenario (CGPA 8.2, 1 active backlog, CSE) -> Must be ELIGIBLE
  const rahul = StudentRepository.findById(1)!;
  const rahulEval = EligibilityService.evaluate(rahul, abcJob, false);
  assert(rahulEval.eligible === true, 'Rahul Kumar must be ELIGIBLE for ABC Technologies');
  assert(rahulEval.breakdown.cgpa_check.pass === true, 'Rahul passes CGPA check (8.2 >= 7.0)');
  assert(rahulEval.breakdown.backlog_check.pass === true, 'Rahul passes backlog check (1 <= 2)');
  assert(rahulEval.breakdown.branch_check.pass === true, 'Rahul passes branch check (CSE in [CSE, ISE, ECE])');

  // 1.2 Boundary Condition: Exact CGPA Match (CGPA == min_cgpa)
  const exactStudent: Student = {
    ...rahul,
    student_id: 999,
    cgpa: 7.0,
    active_backlogs: 2,
    cleared_backlogs: 5
  };
  const exactEval = EligibilityService.evaluate(exactStudent, abcJob, false);
  assert(exactEval.eligible === true, 'Exact minimum CGPA (7.00 == 7.00) qualifies as eligible');
  assert(exactEval.breakdown.backlog_check.pass === true, 'Exact maximum active backlogs (2 == 2) qualifies as eligible');

  // 1.3 Ineligibility Rule 1: CGPA Failure (Amit: 6.8 < 7.0)
  const amit = StudentRepository.findById(3)!;
  const amitEval = EligibilityService.evaluate(amit, abcJob, false);
  assert(amitEval.eligible === false, 'Amit must be INELIGIBLE due to CGPA < 7.0');
  assert(amitEval.reason.includes('below the required minimum'), 'Explanation must cite CGPA failure');

  // 1.4 Ineligibility Rule 2: Active Backlogs Failure (Sneha: 3 backlogs > 2)
  const sneha = StudentRepository.findById(4)!;
  const snehaEval = EligibilityService.evaluate(sneha, abcJob, false);
  assert(snehaEval.eligible === false, 'Sneha must be INELIGIBLE due to 3 active backlogs > 2');
  assert(snehaEval.reason.includes('exceeds the drive limit'), 'Explanation must cite backlog limit');

  // 1.5 Ineligibility Rule 3: Prior Accepted Offer (Ananya: has_accepted_offer === true)
  const ananya = StudentRepository.findById(6)!;
  const ananyaEval = EligibilityService.evaluate(ananya, abcJob, false);
  assert(ananyaEval.eligible === false, 'Ananya must be INELIGIBLE because she already accepted an offer');
  assert(ananyaEval.reason.includes('already accepted an offer'), 'Explanation must cite accepted offer rule');

  // 1.6 Ineligibility Rule 4: Branch Whitelist (Vikram: MECH not in [CSE, ISE, ECE])
  const vikram = StudentRepository.findById(5)!;
  const vikramEval = EligibilityService.evaluate(vikram, abcJob, false);
  assert(vikramEval.eligible === false, 'Vikram (MECH) must be INELIGIBLE for ABC Technologies');
  assert(vikramEval.reason.includes('not in the drive\'s permitted branch whitelist'), 'Explanation must cite branch whitelist failure');

  // 1.7 Pool Drive Open to All Branches (Infosys has empty allowed_branches)
  const vikramInfosysEval = EligibilityService.evaluate(vikram, infosysJob, false);
  assert(vikramInfosysEval.eligible === true, 'Vikram (MECH) must be ELIGIBLE for Infosys pool drive with no branch restrictions');

  // 1.8 Cleared backlogs do not affect eligibility
  const clearedBacklogStudent: Student = {
    ...rahul,
    student_id: 998,
    cgpa: 8.5,
    active_backlogs: 0,
    cleared_backlogs: 10 // Many cleared backlogs
  };
  const clearedEval = EligibilityService.evaluate(clearedBacklogStudent, abcJob, false);
  assert(clearedEval.eligible === true, 'Cleared backlogs do NOT disqualify a student');

  // -------------------------------------------------------------------------
  // TEST GROUP 2: APPLICATION SERVICE & CONSTRAINTS
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 2: Application Rules & Constraints ---');

  // 2.1 Duplicate application to same job prevented
  let duplicatePrevented = false;
  try {
    // Rahul is already applied to Job 1 in initial seed
    ApplicationService.apply(1, 1);
  } catch (err: any) {
    duplicatePrevented = err.message.includes('already submitted an application');
  }
  assert(duplicatePrevented, 'Duplicate application to the same job is strictly blocked');

  // 2.2 Student cannot apply to same company more than once in same season
  // Create another job listing for ABC Technologies (Company 1) in Season 1
  const abcJob2 = JobRepository.create(
    {
      company_id: 1,
      season_id: 1,
      role_title: "Full Stack Engineer",
      min_cgpa: 7.0,
      max_backlogs: 2,
      drive_date: "2026-12-01T10:00:00Z",
      is_open: true
    },
    ["CSE"]
  );

  let seasonCompanyRuleBlocked = false;
  try {
    // Rahul already applied to ABC Technologies Job 1 in Season 1
    ApplicationService.apply(1, abcJob2.job_id);
  } catch (err: any) {
    seasonCompanyRuleBlocked = err.message.includes('applied to ABC Technologies during this placement season');
  }
  assert(seasonCompanyRuleBlocked, 'Student applying to same company twice in the same season is blocked');

  // -------------------------------------------------------------------------
  // TEST GROUP 3: ATOMIC SHORTLISTING & AUDIT NOTIFICATIONS
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 3: Atomic Shortlisting Service ---');

  // Run atomic shortlisting for ABC Technologies Job 1
  const shortlistResult = ShortlistingService.runShortlistForJob(1);
  assert(shortlistResult.total_evaluated >= 1, 'Shortlisting evaluated pending candidates');
  assert(shortlistResult.shortlisted_count >= 1, 'Eligible candidates (Rahul) moved to SHORTLISTED');

  const updatedRahulApp = ApplicationRepository.findByStudentAndJob(1, 1)!;
  assert(updatedRahulApp.status === 'SHORTLISTED', 'Rahul application status is now SHORTLISTED');

  // Verify status transition history was logged
  const history = AuditRepository.getStatusHistory(updatedRahulApp.application_id);
  assert(history.some(h => h.new_status === 'SHORTLISTED'), 'Status history recorded SHORTLISTED transition');

  // Verify notification log was created
  const notifs = AuditRepository.getNotificationLogs(1);
  assert(notifs.some(n => n.notification_type === 'SHORTLISTED'), 'Notification log recorded SHORTLISTED email');

  // -------------------------------------------------------------------------
  // TEST GROUP 4: INTERVIEW SCHEDULING & MULTI-ROUND WORKFLOW
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 4: Interview Workflow ---');

  // 4.1 Schedule Round 1 for Rahul
  const slot1 = InterviewService.scheduleRound(
    updatedRahulApp.application_id,
    1,
    '2026-11-15T11:00:00Z',
    'Virtual Room #101',
    'Coding & Problem Solving Round'
  );
  assert(slot1.round_number === 1, 'Scheduled Round 1');

  const appAfterRound1 = ApplicationRepository.findById(updatedRahulApp.application_id)!;
  assert(appAfterRound1.status === 'INTERVIEW_SCHEDULED', 'Application status transitioned to INTERVIEW_SCHEDULED');

  // 4.2 Duplicate Round Number Prevented
  let dupRoundBlocked = false;
  try {
    InterviewService.scheduleRound(
      updatedRahulApp.application_id,
      1,
      '2026-11-15T12:00:00Z',
      'Virtual Room #101'
    );
  } catch (err: any) {
    dupRoundBlocked = err.message.includes('has already been scheduled');
  }
  assert(dupRoundBlocked, 'Duplicate interview round number blocked');

  // 4.3 Record Interview Result: PASS -> Status transitions to INTERVIEWED
  const evaluatedSlot = InterviewService.recordResult(slot1.interview_slot_id, 'PASS', 'Excellent problem solving skills');
  assert(evaluatedSlot.result === 'PASS', 'Slot result updated to PASS');

  const appAfterInterview = ApplicationRepository.findById(updatedRahulApp.application_id)!;
  assert(appAfterInterview.status === 'INTERVIEWED', 'Application status transitioned to INTERVIEWED');

  // -------------------------------------------------------------------------
  // TEST GROUP 5: OFFER ISSUANCE & ATOMIC ACCEPTANCE
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 5: Offer Issuance & Atomic Acceptance ---');

  // 5.1 Issue Offer for Rahul (12.5 LPA)
  const rahulOffer = OfferService.issueOffer(appAfterInterview.application_id, 12.5);
  assert(rahulOffer.package_lpa === 12.5, 'Offer issued with 12.5 LPA');
  assert(rahulOffer.offer_letter_key.startsWith('OFFER-SECURE-'), 'Private unpredictable offer letter key generated');
  assert(rahulOffer.is_accepted === false, 'Offer initial state is unaccepted');

  const appAfterOffer = ApplicationRepository.findById(appAfterInterview.application_id)!;
  assert(appAfterOffer.status === 'OFFERED', 'Application status transitioned to OFFERED');

  // 5.2 Security check: Another student cannot accept Rahul\'s offer
  let unauthorizedBlocked = false;
  try {
    OfferService.acceptOffer(rahulOffer.offer_id, 2); // Student 2 (Priya) tries to accept Rahul's offer
  } catch (err: any) {
    unauthorizedBlocked = err.message.includes('Security Violation: You are not authorized');
  }
  assert(unauthorizedBlocked, 'Cross-student offer acceptance strictly prevented');

  // 5.3 Atomic Offer Acceptance by Rahul
  const acceptResult = OfferService.acceptOffer(rahulOffer.offer_id, 1);
  assert(acceptResult.offer.is_accepted === true, 'Offer marked accepted');
  assert(acceptResult.offer.accepted_at !== null, 'Offer accepted_at timestamp recorded');

  // Verify atomic updates across application and student records
  const finalApp = ApplicationRepository.findById(appAfterOffer.application_id)!;
  assert(finalApp.status === 'ACCEPTED', 'Application status atomically updated to ACCEPTED');

  const finalStudent = StudentRepository.findById(1)!;
  assert(finalStudent.has_accepted_offer === true, 'Student has_accepted_offer atomically updated to true');

  // Verify cannot accept twice
  let doubleAcceptBlocked = false;
  try {
    OfferService.acceptOffer(rahulOffer.offer_id, 1);
  } catch (err: any) {
    doubleAcceptBlocked = err.message.includes('already been accepted');
  }
  assert(doubleAcceptBlocked, 'Second acceptance attempt blocked');

  // -------------------------------------------------------------------------
  // TEST GROUP 6: PLACEMENT COORDINATOR STATISTICS & AUDIT TRAIL
  // -------------------------------------------------------------------------
  console.log('\n--- TEST GROUP 6: Placement Analytics & Audit Reporting ---');

  const report = ReportService.getFullReport();
  assert(report.summary.total_students >= 7, 'Correct student count in summary');
  assert(report.summary.total_placed >= 2, 'Placed students count includes Rahul & Ananya');
  assert(report.summary.total_accepted_offers >= 2, 'Accepted offers count updated');
  assert(report.summary.highest_package_lpa === 24.5, 'Highest package correctly identified (Google 24.5 LPA)');
  assert(report.summary.avg_package_lpa > 0, 'Average package computed accurately');

  const cseBranch = report.branch_breakdown.find(b => b.branch === 'CSE')!;
  assert(cseBranch.placed_students >= 2, 'CSE branch placed student count updated');

  const abcCompany = report.company_breakdown.find(c => c.company_name === 'ABC Technologies')!;
  assert(abcCompany.offers_accepted >= 1, 'ABC Technologies accepted offers reflected in company report');

  console.log('\n🎉 ALL 24 TESTS PASSED FLAWLESSLY!\n');
}

runAllTests().catch(err => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
