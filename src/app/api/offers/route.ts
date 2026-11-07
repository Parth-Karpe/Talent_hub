import { NextResponse } from 'next/server';
import { OfferRepository } from '@/lib/repositories/offerRepository';
import { OfferService } from '@/lib/services/offerService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentIdParam = searchParams.get('student_id');
    const appIdParam = searchParams.get('application_id');

    if (studentIdParam) {
      const offers = OfferRepository.findByStudentId(parseInt(studentIdParam, 10));
      return NextResponse.json({ offers });
    }

    if (appIdParam) {
      const offer = OfferRepository.findByApplicationId(parseInt(appIdParam, 10));
      return NextResponse.json({ offer });
    }

    return NextResponse.json({ error: 'Specify student_id or application_id' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { application_id, package_lpa, actor_user_id } = body;

    if (!application_id || package_lpa === undefined) {
      return NextResponse.json({ error: 'application_id and package_lpa are required' }, { status: 400 });
    }

    const offer = OfferService.issueOffer(
      parseInt(application_id, 10),
      parseFloat(package_lpa),
      actor_user_id ? parseInt(actor_user_id, 10) : null
    );

    return NextResponse.json({ offer }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to issue offer' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { offer_id, student_id, actor_user_id } = body;

    if (!offer_id || !student_id) {
      return NextResponse.json({ error: 'offer_id and student_id are required' }, { status: 400 });
    }

    const acceptance = OfferService.acceptOffer(
      parseInt(offer_id, 10),
      parseInt(student_id, 10),
      actor_user_id ? parseInt(actor_user_id, 10) : null
    );

    return NextResponse.json({ success: true, ...acceptance });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to accept offer' }, { status: 400 });
  }
}
