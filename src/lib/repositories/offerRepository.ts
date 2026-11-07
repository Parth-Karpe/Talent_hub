import { dbManager } from '../db/database';
import { Offer } from '../models/types';
import crypto from 'crypto';

export class OfferRepository {
  static findById(offerId: number): Offer | null {
    const db = dbManager.getData();
    return db.offers.find(o => o.offer_id === offerId) || null;
  }

  static findByApplicationId(applicationId: number): Offer | null {
    const db = dbManager.getData();
    return db.offers.find(o => o.application_id === applicationId) || null;
  }

  static findByStudentId(studentId: number): Offer[] {
    const db = dbManager.getData();
    const studentAppIds = db.applications
      .filter(a => a.student_id === studentId)
      .map(a => a.application_id);

    return db.offers.filter(o => studentAppIds.includes(o.application_id));
  }

  static create(applicationId: number, packageLpa: number): Offer {
    const db = dbManager.getData();
    
    // Check if an offer already exists for this application
    const existing = db.offers.find(o => o.application_id === applicationId);
    if (existing) {
      throw new Error(`An offer already exists for application ID ${applicationId}`);
    }

    const newId = db.offers.reduce((max, o) => Math.max(max, o.offer_id), 0) + 1;
    const now = new Date().toISOString();
    // Unpredictable private storage key, not a public URL
    const offerLetterKey = `OFFER-SECURE-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    const newOffer: Offer = {
      offer_id: newId,
      application_id: applicationId,
      package_lpa: packageLpa,
      offer_letter_key: offerLetterKey,
      is_accepted: false,
      issued_at: now,
      accepted_at: null
    };

    db.offers.push(newOffer);
    dbManager.saveData(db);
    return newOffer;
  }

  static markAccepted(offerId: number): Offer | null {
    const db = dbManager.getData();
    const offer = db.offers.find(o => o.offer_id === offerId);
    if (!offer) return null;

    offer.is_accepted = true;
    offer.accepted_at = new Date().toISOString();
    dbManager.saveData(db);
    return offer;
  }
}
