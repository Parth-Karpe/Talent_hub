import { NextResponse } from 'next/server';
import { ShortlistingService } from '@/lib/services/shortlistingService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { job_id, actor_user_id } = body;

    if (!job_id) {
      return NextResponse.json({ error: 'job_id is required' }, { status: 400 });
    }

    const result = ShortlistingService.runShortlistForJob(
      parseInt(job_id, 10),
      actor_user_id ? parseInt(actor_user_id, 10) : null
    );

    return NextResponse.json({ result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Shortlisting execution failed' }, { status: 400 });
  }
}
