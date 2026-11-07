import { NextResponse } from 'next/server';
import { InterviewRepository } from '@/lib/repositories/interviewRepository';
import { InterviewService } from '@/lib/services/interviewService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const appIdParam = searchParams.get('application_id');
    if (!appIdParam) {
      return NextResponse.json({ error: 'application_id is required' }, { status: 400 });
    }

    const slots = InterviewRepository.findByApplication(parseInt(appIdParam, 10));
    return NextResponse.json({ slots });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { application_id, round_number, scheduled_at, venue, notes, actor_user_id } = body;

    if (!application_id || !round_number || !scheduled_at || !venue) {
      return NextResponse.json({ error: 'Missing required interview slot fields' }, { status: 400 });
    }

    const slot = InterviewService.scheduleRound(
      parseInt(application_id, 10),
      parseInt(round_number, 10),
      scheduled_at,
      venue,
      notes,
      actor_user_id ? parseInt(actor_user_id, 10) : null
    );

    return NextResponse.json({ slot }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to schedule interview' }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { slot_id, result, notes, actor_user_id } = body;

    if (!slot_id || !result) {
      return NextResponse.json({ error: 'slot_id and result are required' }, { status: 400 });
    }

    const updatedSlot = InterviewService.recordResult(
      parseInt(slot_id, 10),
      result,
      notes,
      actor_user_id ? parseInt(actor_user_id, 10) : null
    );

    return NextResponse.json({ slot: updatedSlot });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update interview result' }, { status: 400 });
  }
}
