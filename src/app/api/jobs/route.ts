import { NextResponse } from 'next/server';
import { JobRepository } from '@/lib/repositories/jobRepository';
import { StudentRepository } from '@/lib/repositories/studentRepository';
import { EligibilityService } from '@/lib/services/eligibilityService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyIdParam = searchParams.get('company_id');
    const studentIdParam = searchParams.get('student_id');

    let jobs = companyIdParam
      ? JobRepository.findByCompany(parseInt(companyIdParam, 10))
      : JobRepository.findAllWithDetails();

    // If student_id is provided, attach pre-evaluated eligibility for each job!
    if (studentIdParam) {
      const studentId = parseInt(studentIdParam, 10);
      const student = StudentRepository.findById(studentId);
      if (student) {
        const enrichedJobs = jobs.map(job => {
          const evalResult = EligibilityService.evaluate(student, job, false);
          return {
            ...job,
            eligibility: evalResult
          };
        });
        return NextResponse.json({ jobs: enrichedJobs });
      }
    }

    return NextResponse.json({ jobs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company_id, season_id, role_title, min_cgpa, max_backlogs, drive_date, is_open, allowed_branches } = body;

    if (!company_id || !season_id || !role_title || min_cgpa === undefined) {
      return NextResponse.json({ error: 'Missing required job parameters' }, { status: 400 });
    }

    const job = JobRepository.create(
      {
        company_id: parseInt(company_id, 10),
        season_id: parseInt(season_id, 10),
        role_title,
        min_cgpa: parseFloat(min_cgpa),
        max_backlogs: parseInt(max_backlogs || 0, 10),
        drive_date: drive_date || new Date().toISOString(),
        is_open: is_open !== false
      },
      allowed_branches || []
    );

    return NextResponse.json({ job }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create job drive' }, { status: 400 });
  }
}
