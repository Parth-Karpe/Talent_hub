import { NextResponse } from 'next/server';
import { ApplicationRepository } from '@/lib/repositories/applicationRepository';
import { ApplicationService } from '@/lib/services/applicationService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get('student_id');
    const jobIdParam = searchParams.get('job_id');

    let applications = [];
    if (studentIdParam) {
      applications = ApplicationRepository.findByStudent(parseInt(studentIdParam, 10));
    } else if (jobIdParam) {
      applications = ApplicationRepository.findByJob(parseInt(jobIdParam, 10));
    } else {
      applications = ApplicationRepository.findAllDetails();
    }

    return NextResponse.json({ applications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { student_id, job_id, actor_user_id } = body;

    if (!student_id || !job_id) {
      return NextResponse.json({ error: 'student_id and job_id are required' }, { status: 400 });
    }

    const application = ApplicationService.apply(
      parseInt(student_id, 10),
      parseInt(job_id, 10),
      actor_user_id ? parseInt(actor_user_id, 10) : null
    );

    return NextResponse.json({ application }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit application' }, { status: 400 });
  }
}
