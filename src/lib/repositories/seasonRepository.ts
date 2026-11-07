import { dbManager } from '../db/database';
import { PlacementSeason } from '../models/types';

export class SeasonRepository {
  static getActiveSeason(): PlacementSeason | null {
    const db = dbManager.getData();
    return db.placement_seasons.find(s => s.is_active) || null;
  }

  static findById(seasonId: number): PlacementSeason | null {
    const db = dbManager.getData();
    return db.placement_seasons.find(s => s.season_id === seasonId) || null;
  }

  static findAll(): PlacementSeason[] {
    const db = dbManager.getData();
    return db.placement_seasons;
  }
}
