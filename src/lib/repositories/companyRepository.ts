import { dbManager } from '../db/database';
import { Company } from '../models/types';

export class CompanyRepository {
  static findById(companyId: number): Company | null {
    const db = dbManager.getData();
    return db.companies.find(c => c.company_id === companyId) || null;
  }

  static findByName(companyName: string): Company | null {
    const db = dbManager.getData();
    return db.companies.find(c => c.company_name.toLowerCase() === companyName.toLowerCase().trim()) || null;
  }

  static findAll(): Company[] {
    const db = dbManager.getData();
    return db.companies;
  }

  static create(companyName: string): Company {
    const db = dbManager.getData();
    const newId = db.companies.reduce((max, c) => Math.max(max, c.company_id), 0) + 1;
    const now = new Date().toISOString();

    const newCompany: Company = {
      company_id: newId,
      company_name: companyName.trim(),
      created_at: now,
      updated_at: now
    };

    db.companies.push(newCompany);
    dbManager.saveData(db);
    return newCompany;
  }
}
