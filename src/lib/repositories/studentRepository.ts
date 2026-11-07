import { dbManager } from '../db/database';
import { Student } from '../models/types';

export class StudentRepository {
  static findById(studentId: number): Student | null {
    const db = dbManager.getData();
    return db.students.find(s => s.student_id === studentId) || null;
  }

  static findByEmail(email: string): Student | null {
    const db = dbManager.getData();
    return db.students.find(s => s.email.toLowerCase() === email.toLowerCase().trim()) || null;
  }

  static findByUsn(usn: string): Student | null {
    const db = dbManager.getData();
    return db.students.find(s => s.usn.toUpperCase() === usn.toUpperCase().trim()) || null;
  }

  static findAll(): Student[] {
    const db = dbManager.getData();
    return db.students;
  }

  static create(data: Omit<Student, 'student_id' | 'has_accepted_offer' | 'is_anonymized' | 'created_at' | 'updated_at'>): Student {
    const db = dbManager.getData();
    const newId = db.students.reduce((max, s) => Math.max(max, s.student_id), 0) + 1;
    const now = new Date().toISOString();
    
    const newStudent: Student = {
      ...data,
      student_id: newId,
      usn: data.usn.toUpperCase().trim(),
      email: data.email.toLowerCase().trim(),
      has_accepted_offer: false,
      is_anonymized: false,
      created_at: now,
      updated_at: now
    };

    db.students.push(newStudent);
    dbManager.saveData(db);
    return newStudent;
  }

  static update(studentId: number, data: Partial<Student>): Student | null {
    const db = dbManager.getData();
    const student = db.students.find(s => s.student_id === studentId);
    if (!student) return null;

    Object.assign(student, data, { updated_at: new Date().toISOString() });
    dbManager.saveData(db);
    return student;
  }

  static setHasAcceptedOffer(studentId: number, accepted: boolean = true): Student | null {
    return this.update(studentId, { has_accepted_offer: accepted });
  }
}
