import { DatabaseSchema } from '../models/types';

export const initialData: DatabaseSchema = {
  placement_seasons: [
    {
      season_id: 1,
      season_name: "2026–27 Campus Placement Season",
      start_date: "2026-08-01",
      end_date: "2027-05-31",
      is_active: true,
      created_at: "2026-08-01T00:00:00Z"
    }
  ],
  companies: [
    {
      company_id: 1,
      company_name: "ABC Technologies",
      created_at: "2026-08-10T10:00:00Z",
      updated_at: "2026-08-10T10:00:00Z"
    },
    {
      company_id: 2,
      company_name: "Google",
      created_at: "2026-08-12T10:00:00Z",
      updated_at: "2026-08-12T10:00:00Z"
    },
    {
      company_id: 3,
      company_name: "Infosys",
      created_at: "2026-08-15T10:00:00Z",
      updated_at: "2026-08-15T10:00:00Z"
    },
    {
      company_id: 4,
      company_name: "Microsoft",
      created_at: "2026-08-18T10:00:00Z",
      updated_at: "2026-08-18T10:00:00Z"
    }
  ],
  students: [
    {
      student_id: 1,
      usn: "1FE24BCI001",
      full_name: "Rahul Kumar",
      email: "rahul@college.edu",
      branch: "CSE",
      cgpa: 8.2,
      active_backlogs: 1,
      cleared_backlogs: 1,
      has_accepted_offer: false,
      is_anonymized: false,
      created_at: "2026-08-05T09:00:00Z",
      updated_at: "2026-08-05T09:00:00Z"
    },
    {
      student_id: 2,
      usn: "1FE24BCI002",
      full_name: "Priya Sharma",
      email: "priya@college.edu",
      branch: "ISE",
      cgpa: 8.9,
      active_backlogs: 0,
      cleared_backlogs: 0,
      has_accepted_offer: false,
      is_anonymized: false,
      created_at: "2026-08-05T09:15:00Z",
      updated_at: "2026-08-05T09:15:00Z"
    },
    {
      student_id: 3,
      usn: "1FE24BCI003",
      full_name: "Amit Patel",
      email: "amit@college.edu",
      branch: "ECE",
      cgpa: 6.8,
      active_backlogs: 0,
      cleared_backlogs: 0,
      has_accepted_offer: false,
      is_anonymized: false,
      created_at: "2026-08-05T09:30:00Z",
      updated_at: "2026-08-05T09:30:00Z"
    },
    {
      student_id: 4,
      usn: "1FE24BCI004",
      full_name: "Sneha Reddy",
      email: "sneha@college.edu",
      branch: "CSE",
      cgpa: 7.5,
      active_backlogs: 3,
      cleared_backlogs: 0,
      has_accepted_offer: false,
      is_anonymized: false,
      created_at: "2026-08-05T09:45:00Z",
      updated_at: "2026-08-05T09:45:00Z"
    },
    {
      student_id: 5,
      usn: "1FE24BCI005",
      full_name: "Vikram Singh",
      email: "vikram@college.edu",
      branch: "MECH",
      cgpa: 7.8,
      active_backlogs: 1,
      cleared_backlogs: 2,
      has_accepted_offer: false,
      is_anonymized: false,
      created_at: "2026-08-05T10:00:00Z",
      updated_at: "2026-08-05T10:00:00Z"
    },
    {
      student_id: 6,
      usn: "1FE24BCI006",
      full_name: "Ananya Roy",
      email: "ananya@college.edu",
      branch: "CSE",
      cgpa: 9.3,
      active_backlogs: 0,
      cleared_backlogs: 0,
      has_accepted_offer: true,
      is_anonymized: false,
      created_at: "2026-08-05T10:15:00Z",
      updated_at: "2026-09-01T12:00:00Z"
    },
    {
      student_id: 7,
      usn: "1FE24BCI007",
      full_name: "Rohan Joshi",
      email: "rohan@college.edu",
      branch: "CIVIL",
      cgpa: 7.2,
      active_backlogs: 0,
      cleared_backlogs: 0,
      has_accepted_offer: false,
      is_anonymized: false,
      created_at: "2026-08-05T10:30:00Z",
      updated_at: "2026-08-05T10:30:00Z"
    }
  ],
  users: [
    {
      user_id: 1,
      email: "rahul@college.edu",
      password_hash: "hash_rahul_123",
      role: "STUDENT",
      student_id: 1,
      company_id: null,
      is_active: true,
      created_at: "2026-08-05T09:00:00Z"
    },
    {
      user_id: 2,
      email: "recruiter@abctech.com",
      password_hash: "hash_abc_123",
      role: "COMPANY_REPRESENTATIVE",
      student_id: null,
      company_id: 1,
      is_active: true,
      created_at: "2026-08-10T10:00:00Z"
    },
    {
      user_id: 3,
      email: "coordinator@talenthub.edu",
      password_hash: "hash_coordinator_123",
      role: "PLACEMENT_COORDINATOR",
      student_id: null,
      company_id: null,
      is_active: true,
      created_at: "2026-08-01T00:00:00Z"
    },
    {
      user_id: 4,
      email: "priya@college.edu",
      password_hash: "hash_priya_123",
      role: "STUDENT",
      student_id: 2,
      company_id: null,
      is_active: true,
      created_at: "2026-08-05T09:15:00Z"
    }
  ],
  job_listings: [
    {
      job_id: 1,
      company_id: 1,
      season_id: 1,
      role_title: "Software Development Engineer (SDE-1)",
      min_cgpa: 7.0,
      max_backlogs: 2,
      drive_date: "2026-11-15T09:00:00Z",
      is_open: true,
      created_at: "2026-10-01T10:00:00Z",
      updated_at: "2026-10-01T10:00:00Z"
    },
    {
      job_id: 2,
      company_id: 3,
      season_id: 1,
      role_title: "Systems Engineer (Specialist)",
      min_cgpa: 6.0,
      max_backlogs: 3,
      drive_date: "2026-11-20T10:00:00Z",
      is_open: true,
      created_at: "2026-10-05T10:00:00Z",
      updated_at: "2026-10-05T10:00:00Z"
    },
    {
      job_id: 3,
      company_id: 2,
      season_id: 1,
      role_title: "Associate Software Engineer",
      min_cgpa: 8.5,
      max_backlogs: 0,
      drive_date: "2026-11-10T09:00:00Z",
      is_open: true,
      created_at: "2026-09-15T10:00:00Z",
      updated_at: "2026-09-15T10:00:00Z"
    },
    {
      job_id: 4,
      company_id: 4,
      season_id: 1,
      role_title: "Cloud Support Engineer",
      min_cgpa: 7.2,
      max_backlogs: 1,
      drive_date: "2026-11-28T09:00:00Z",
      is_open: true,
      created_at: "2026-10-10T10:00:00Z",
      updated_at: "2026-10-10T10:00:00Z"
    }
  ],
  job_allowed_branches: [
    // Job 1 (ABC Technologies): CSE, ISE, ECE
    { job_allowed_branch_id: 1, job_id: 1, branch: "CSE" },
    { job_allowed_branch_id: 2, job_id: 1, branch: "ISE" },
    { job_allowed_branch_id: 3, job_id: 1, branch: "ECE" },
    // Job 2 (Infosys): No rows in job_allowed_branches => OPEN TO ALL BRANCHES!
    // Job 3 (Google): CSE, ISE
    { job_allowed_branch_id: 4, job_id: 3, branch: "CSE" },
    { job_allowed_branch_id: 5, job_id: 3, branch: "ISE" },
    // Job 4 (Microsoft): CSE, ECE, ISE
    { job_allowed_branch_id: 6, job_id: 4, branch: "CSE" },
    { job_allowed_branch_id: 7, job_id: 4, branch: "ECE" },
    { job_allowed_branch_id: 8, job_id: 4, branch: "ISE" }
  ],
  applications: [
    {
      application_id: 1,
      student_id: 1, // Rahul
      job_id: 1,     // ABC Technologies SDE
      status: "APPLIED",
      applied_at: "2026-10-02T11:00:00Z",
      updated_at: "2026-10-02T11:00:00Z"
    },
    {
      application_id: 2,
      student_id: 2, // Priya
      job_id: 1,     // ABC Technologies SDE
      status: "SHORTLISTED",
      applied_at: "2026-10-02T11:30:00Z",
      updated_at: "2026-10-03T14:00:00Z"
    },
    {
      application_id: 3,
      student_id: 6, // Ananya
      job_id: 3,     // Google
      status: "ACCEPTED",
      applied_at: "2026-09-16T10:00:00Z",
      updated_at: "2026-09-25T16:00:00Z"
    }
  ],
  interview_slots: [
    {
      interview_slot_id: 1,
      application_id: 2,
      round_number: 1,
      scheduled_at: "2026-11-15T10:00:00Z",
      venue: "Tech Park Block B, Room 204",
      result: "PENDING",
      notes: "Technical coding and data structures round",
      created_at: "2026-10-03T15:00:00Z"
    },
    {
      interview_slot_id: 2,
      application_id: 3,
      round_number: 1,
      scheduled_at: "2026-09-20T10:00:00Z",
      venue: "Google Meet Link",
      result: "PASS",
      notes: "System design and problem solving",
      created_at: "2026-09-18T10:00:00Z"
    }
  ],
  offers: [
    {
      offer_id: 1,
      application_id: 3,
      package_lpa: 24.5,
      offer_letter_key: "OFFER-GOOG-2026-781923a1",
      is_accepted: true,
      issued_at: "2026-09-24T12:00:00Z",
      accepted_at: "2026-09-25T16:00:00Z"
    }
  ],
  student_consents: [
    {
      consent_id: 1,
      student_id: 1,
      purpose: "PLACEMENT_DATA_PROCESSING",
      is_granted: true,
      policy_version: "1.0",
      source: "student_portal",
      recorded_at: "2026-08-05T09:00:00Z"
    },
    {
      consent_id: 2,
      student_id: 2,
      purpose: "PLACEMENT_DATA_PROCESSING",
      is_granted: true,
      policy_version: "1.0",
      source: "student_portal",
      recorded_at: "2026-08-05T09:15:00Z"
    }
  ],
  eligibility_decisions: [
    {
      decision_id: 1,
      student_id: 1,
      job_id: 1,
      eligible: true,
      reason: "Eligible: CGPA 8.20 >= 7.00, active backlogs 1 <= 2, no accepted offer in season, and branch CSE is permitted.",
      checked_at: "2026-10-02T11:00:00Z",
      checked_by_user_id: 1,
      rule_version: "v1.0"
    },
    {
      decision_id: 2,
      student_id: 2,
      job_id: 1,
      eligible: true,
      reason: "Eligible: CGPA 8.90 >= 7.00, active backlogs 0 <= 2, no accepted offer in season, and branch ISE is permitted.",
      checked_at: "2026-10-02T11:30:00Z",
      checked_by_user_id: 2,
      rule_version: "v1.0"
    }
  ],
  application_status_history: [
    {
      status_history_id: 1,
      application_id: 1,
      old_status: null,
      new_status: "APPLIED",
      changed_at: "2026-10-02T11:00:00Z",
      changed_by_user_id: 1,
      reason: "Student submitted application",
      request_id: "req-app-001"
    },
    {
      status_history_id: 2,
      application_id: 2,
      old_status: null,
      new_status: "APPLIED",
      changed_at: "2026-10-02T11:30:00Z",
      changed_by_user_id: 4,
      reason: "Student submitted application",
      request_id: "req-app-002"
    },
    {
      status_history_id: 3,
      application_id: 2,
      old_status: "APPLIED",
      new_status: "SHORTLISTED",
      changed_at: "2026-10-03T14:00:00Z",
      changed_by_user_id: 2,
      reason: "Atomic shortlisting executed: met all eligibility criteria",
      request_id: "req-sl-001"
    },
    {
      status_history_id: 4,
      application_id: 3,
      old_status: "OFFERED",
      new_status: "ACCEPTED",
      changed_at: "2026-09-25T16:00:00Z",
      changed_by_user_id: null,
      reason: "Student accepted official employment offer",
      request_id: "req-acc-001"
    }
  ],
  notification_logs: [
    {
      notification_id: 1,
      student_id: 2,
      application_id: 2,
      notification_type: "SHORTLISTED",
      recipient_email: "priya@college.edu",
      message_summary: "Congratulations! You have been shortlisted for ABC Technologies - SDE-1.",
      delivery_status: "SENT",
      attempt_count: 1,
      last_error: null,
      created_at: "2026-10-03T14:00:00Z",
      sent_at: "2026-10-03T14:00:05Z"
    }
  ]
};
