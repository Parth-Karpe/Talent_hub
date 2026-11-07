import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/db/database';

export async function POST() {
  try {
    const fresh = dbManager.reset();
    return NextResponse.json({ message: 'Database reset to initial demo state successfully', data: fresh });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to reset database' }, { status: 500 });
  }
}
