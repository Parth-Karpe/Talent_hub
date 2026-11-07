import { dbManager } from '../db/database';
import { Application, ApplicationDetail, ApplicationStatus } from '../models/types';
import { JobRepository } from './jobRepository';

export class ApplicationRepository {
  static findById(applicationId: number): Application | null {
    const db = dbManager.getData();
    return db.applications.find(a => a.application_id === applicationId) || null;
  }

  static findByStudentAndJob(studentId: number, jobId: number): Application | null {
    const db = dbManager.getData();
    return db.applications.find(a => a.student_id === studentId && a.job_id === jobId) || null;
  }

  static findStudentApplicationsInCompanyAndSeason(
    studentId: number,
    companyId: number,
    seasonId: number
  ): Application[] {
    const db = dbManager.getData();
    // Find all job listings for this company in this season
    const targetJobIds = db.job_listings
      .filter(j => j.company_id === companyId && j.season_id === seasonId)
      .map(j => j.job_id);

    return db.applications.filter(
      a => a.student_id === studentId && targetJobIds.includes(a.job_id)
    );
  }

  static findByStudent(studentId: number): ApplicationDetail[] {
    const db = dbManager.getData();
    const apps = db.applications.filter(a => a.student_id === studentId);
    return apps.map(a => this.toDetail(a)).filter((d): d is ApplicationDetail => d !== null);
  }

  static findByJob(jobId: number): ApplicationDetail[] {
    const db = dbManager.getData();
    const apps = db.applications.filter(a => a.job_id === jobId);
    return apps.map(a => this.toDetail(a)).filter((d): d is ApplicationDetail => d !== null);
  }

  static findAllDetails(): ApplicationDetail[] {
    const db = dbManager.getData();
    return db.applications
      .map(a => this.toDetail(a))
      .filter((d): d is ApplicationDetail => d !== null);
  }

  static toDetail(app: Application): ApplicationDetail | null {
    const db = dbManager.getData();
    const student = db.students.find(s => s.student_id === app.student_id);
    const job = JobRepository.findWithDetails(app.job_id);
    if (!student || !job) return null;

    const interviews = db.interview_slots
      .filter(i => i.application_id === app.application_id)
      .sort((a, b) => a.round_number - b.round_number);

    const offer = db.offers.find(o => o.application_id === app.application_id) || null;

    return {
      ...app,
      student,
      job,
      interviews,
      offer
    };
  }

  static create(studentId: number, jobId: number): Application {
    const db = dbManager.getData();
    const newId = db.applications.reduce((max, a) => Math.max(max, a.application_id), 0) + 1;
    const now = new Date().toISOString();

    const newApp: Application = {
      application_id: newId,
      student_id: studentId,
      job_id: jobId,
      status: 'APPLIED',
      applied_at: now,
      updated_at: now
    };

    db.applications.push(newApp);
    dbManager.saveData(db);
    return newApp;
  }

  static updateStatus(applicationId: number, status: ApplicationStatus): Application | null {
    const db = dbManager.getData();
    const app = db.applications.find(a => a.application_id === applicationId);
    if (!app) return null;

    app.status = status;
    app.updated_at = new Date().toISOString();
    dbManager.saveData(db);
    return app;
  }
}
