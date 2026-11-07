export type Branch = 'CSE' | 'ECE' | 'ISE' | 'MECH' | 'CIVIL';

export type UserRole = 'STUDENT' | 'COMPANY_REPRESENTATIVE' | 'PLACEMENT_COORDINATOR';

export type ApplicationStatus = 
  | 'APPLIED'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'INTERVIEWED'
  | 'OFFERED'
  | 'ACCEPTED';

export type InterviewResult = 'PASS' | 'FAIL' | 'PENDING';

export type DeliveryStatus = 'PENDING' | 'SENT' | 'FAILED';

// 1. STUDENTS
export interface Student {
  student_id: number;
  usn: string;
  full_name: string;
  email: string;
  branch: Branch;
  cgpa: number;
  active_backlogs: number;
  cleared_backlogs: number;
  has_accepted_offer: boolean;
  is_anonymized: boolean;
  created_at: string;
  updated_at: string;
}

// 2. COMPANIES
export interface Company {
  company_id: number;
  company_name: string;
  created_at: string;
  updated_at: string;
}

// 3. PLACEMENT_SEASONS
export interface PlacementSeason {
  season_id: number;
  season_name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

// 4. USERS
export interface User {
  user_id: number;
  email: string;
  password_hash: string;
  role: UserRole;
  student_id: number | null;
  company_id: number | null;
  is_active: boolean;
  created_at: string;
}

// 5. JOB_LISTINGS
export interface JobListing {
  job_id: number;
  company_id: number;
  season_id: number;
  role_title: string;
  min_cgpa: number;
  max_backlogs: number;
  drive_date: string;
  is_open: boolean;
  created_at: string;
  updated_at: string;
}

// 6. JOB_ALLOWED_BRANCHES
export interface JobAllowedBranch {
  job_allowed_branch_id: number;
  job_id: number;
  branch: Branch;
}

// 7. APPLICATIONS
export interface Application {
  application_id: number;
  student_id: number;
  job_id: number;
  status: ApplicationStatus;
  applied_at: string;
  updated_at: string;
}

// 8. INTERVIEW_SLOTS
export interface InterviewSlot {
  interview_slot_id: number;
  application_id: number;
  round_number: number;
  scheduled_at: string;
  venue: string;
  result: InterviewResult | null;
  notes: string | null;
  created_at: string;
}

// 9. OFFERS
export interface Offer {
  offer_id: number;
  application_id: number;
  package_lpa: number;
  offer_letter_key: string;
  is_accepted: boolean;
  issued_at: string;
  accepted_at: string | null;
}

// 10. STUDENT_CONSENTS
export interface StudentConsent {
  consent_id: number;
  student_id: number;
  purpose: string;
  is_granted: boolean;
  policy_version: string;
  source: string;
  recorded_at: string;
}

// 11. ELIGIBILITY_DECISIONS
export interface EligibilityDecision {
  decision_id: number;
  student_id: number;
  job_id: number;
  eligible: boolean;
  reason: string;
  checked_at: string;
  checked_by_user_id: number | null;
  rule_version: string;
}

// 12. APPLICATION_STATUS_HISTORY
export interface ApplicationStatusHistory {
  status_history_id: number;
  application_id: number;
  old_status: ApplicationStatus | null;
  new_status: ApplicationStatus;
  changed_at: string;
  changed_by_user_id: number | null;
  reason: string | null;
  request_id: string | null;
}

// 13. NOTIFICATION_LOGS
export interface NotificationLog {
  notification_id: number;
  student_id: number;
  application_id: number | null;
  notification_type: string; // 'SHORTLISTED' | 'INELIGIBLE' | 'INTERVIEW_SCHEDULED' | 'OFFER_ISSUED' | 'OFFER_ACCEPTED'
  recipient_email: string;
  message_summary: string;
  delivery_status: DeliveryStatus;
  attempt_count: number;
  last_error: string | null;
  created_at: string;
  sent_at: string | null;
}

// Composite & View Types
export interface JobWithDetails extends JobListing {
  company_name: string;
  allowed_branches: Branch[];
}

export interface ApplicationDetail extends Application {
  student: Student;
  job: JobWithDetails;
  interviews: InterviewSlot[];
  offer: Offer | null;
}

export interface EligibilityResult {
  student_id: number;
  job_id: number;
  eligible: boolean;
  reason: string;
  breakdown: {
    cgpa_check: { pass: boolean; student_cgpa: number; min_cgpa: number };
    backlog_check: { pass: boolean; active_backlogs: number; max_backlogs: number };
    offer_check: { pass: boolean; has_accepted_offer: boolean };
    branch_check: { pass: boolean; student_branch: Branch; allowed_branches: Branch[] };
  };
}

export interface PlacementSummary {
  total_students: number;
  total_placed: number;
  placement_percentage: number;
  total_jobs: number;
  total_applications: number;
  total_offers: number;
  total_accepted_offers: number;
  avg_package_lpa: number;
  highest_package_lpa: number;
}

export interface BranchStat {
  branch: Branch;
  total_students: number;
  placed_students: number;
  placement_rate: number;
  avg_package_lpa: number;
}

export interface CompanyStat {
  company_name: string;
  openings: number;
  applications: number;
  shortlisted: number;
  offers_issued: number;
  offers_accepted: number;
  avg_package_lpa: number;
}

export interface DatabaseSchema {
  students: Student[];
  companies: Company[];
  placement_seasons: PlacementSeason[];
  users: User[];
  job_listings: JobListing[];
  job_allowed_branches: JobAllowedBranch[];
  applications: Application[];
  interview_slots: InterviewSlot[];
  offers: Offer[];
  student_consents: StudentConsent[];
  eligibility_decisions: EligibilityDecision[];
  application_status_history: ApplicationStatusHistory[];
  notification_logs: NotificationLog[];
}
