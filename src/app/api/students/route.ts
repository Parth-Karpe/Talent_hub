import { NextResponse } from 'next/server';
import { StudentRepository } from '@/lib/repositories/studentRepository';
import { JobRepository } from '@/lib/repositories/jobRepository';
import { EligibilityService } from '@/lib/services/eligibilityService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get('id');
    const checkJobIdParam = searchParams.get('check_job_id');

    if (studentIdParam) {
      const studentId = parseInt(studentIdParam, 10);
      const student = StudentRepository.findById(studentId);
      if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
      }

      if (checkJobIdParam) {
        const jobId = parseInt(checkJobIdParam, 10);
        const job = JobRepository.findWithDetails(jobId);
        if (!job) {
          return NextResponse.json({ error: 'Job listing not found' }, { status: 404 });
        }
        const eligibility = EligibilityService.evaluate(student, job, false);
        return NextResponse.json({ student, eligibility });
      }

      return NextResponse.json({ student });
    }

    const students = StudentRepository.findAll();
    return NextResponse.json({ students });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const student = StudentRepository.create(body);
    return NextResponse.json({ student }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create student' }, { status: 400 });
  }
}
