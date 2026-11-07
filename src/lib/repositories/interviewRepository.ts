import { dbManager } from '../db/database';
import { InterviewSlot, InterviewResult } from '../models/types';

export class InterviewRepository {
  static findById(slotId: number): InterviewSlot | null {
    const db = dbManager.getData();
    return db.interview_slots.find(s => s.interview_slot_id === slotId) || null;
  }

  static findByAppAndRound(applicationId: number, roundNumber: number): InterviewSlot | null {
    const db = dbManager.getData();
    return db.interview_slots.find(
      s => s.application_id === applicationId && s.round_number === roundNumber
    ) || null;
  }

  static findByApplication(applicationId: number): InterviewSlot[] {
    const db = dbManager.getData();
    return db.interview_slots
      .filter(s => s.application_id === applicationId)
      .sort((a, b) => a.round_number - b.round_number);
  }

  static create(data: Omit<InterviewSlot, 'interview_slot_id' | 'created_at'>): InterviewSlot {
    const db = dbManager.getData();
    const newId = db.interview_slots.reduce((max, s) => Math.max(max, s.interview_slot_id), 0) + 1;
    const now = new Date().toISOString();

    const newSlot: InterviewSlot = {
      ...data,
      interview_slot_id: newId,
      created_at: now
    };

    db.interview_slots.push(newSlot);
    dbManager.saveData(db);
    return newSlot;
  }

  static updateResult(slotId: number, result: InterviewResult, notes?: string): InterviewSlot | null {
    const db = dbManager.getData();
    const slot = db.interview_slots.find(s => s.interview_slot_id === slotId);
    if (!slot) return null;

    slot.result = result;
    if (notes !== undefined) {
      slot.notes = notes;
    }
    dbManager.saveData(db);
    return slot;
  }
}
