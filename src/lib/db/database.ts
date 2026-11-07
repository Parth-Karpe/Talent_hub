import fs from 'fs';
import path from 'path';
import { DatabaseSchema } from '../models/types';
import { initialData } from './seedData';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'talenthub_db.json');

class DatabaseManager {
  private db: DatabaseSchema | null = null;

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized(): void {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE)) {
      this.reset();
    } else {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.db = JSON.parse(raw);
      } catch {
        this.reset();
      }
    }
  }

  public getData(): DatabaseSchema {
    if (!this.db) {
      this.ensureInitialized();
    }
    return this.db!;
  }

  public saveData(data: DatabaseSchema): void {
    this.db = data;
    // Atomic write using temporary file to prevent corruption
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  public reset(): DatabaseSchema {
    // Deep clone initialData
    const fresh = JSON.parse(JSON.stringify(initialData)) as DatabaseSchema;
    this.saveData(fresh);
    return fresh;
  }
}

export const dbManager = new DatabaseManager();
