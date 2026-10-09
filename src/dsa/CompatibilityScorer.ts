import { BloodGroup, Coordinates, DonorOrgan, Recipient, ScoreBreakdown } from '../types';

/**
 * Compatibility Scorer & Medical Eligibility Engine
 * 
 * Implements strict biomedical rules:
 * 1. Exact Organ Match (Heart -> Heart, Kidney -> Kidney, etc.)
 * 2. ABO Blood Group Compatibility Rules
 * 3. Shelf-life remaining (> 0 hours)
 * 4. Multi-Factor Scoring (0 - 100 points)
 */

export class CompatibilityScorer {
  /**
   * Check ABO Blood Group Compatibility
   * Donor -> Recipient
   */
  public static isBloodCompatible(donorBlood: BloodGroup, recipientBlood: BloodGroup): boolean {
    const compatibilityMatrix: Record<BloodGroup, BloodGroup[]> = {
      'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal donor
      'O+': ['O+', 'A+', 'B+', 'AB+'],
      'A-': ['A-', 'A+', 'AB-', 'AB+'],
      'A+': ['A+', 'AB+'],
      'B-': ['B-', 'B+', 'AB-', 'AB+'],
      'B+': ['B+', 'AB+'],
      'AB-': ['AB-', 'AB+'],
      'AB+': ['AB+'], // Universal recipient for AB+
    };

    const compatibleRecipients = compatibilityMatrix[donorBlood];
    return compatibleRecipients ? compatibleRecipients.includes(recipientBlood) : false;
  }

  /**
   * Calculate Remaining Cold-Ischemia Shelf Life in hours
   */
  public static getRemainingShelfLifeHours(organ: DonorOrgan, currentTime: Date = new Date()): number {
    const donationDate = new Date(organ.donationTime).getTime();
    const now = currentTime.getTime();
    const elapsedHours = (now - donationDate) / (1000 * 60 * 60);
    const remaining = organ.maxShelfLifeHours - elapsedHours;
    return Math.max(0, Number(remaining.toFixed(2)));
  }

  /**
   * Calculate Geographic Distance using Haversine Formula (in km)
   */
  public static calculateDistanceKm(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
    const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coord1.lat * Math.PI) / 180) *
        Math.cos((coord2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  }

  /**
   * Calculate HLA Antigenic Match (HLA-A, HLA-B, HLA-DR)
   * Score: 0 - 25 points
   */
  public static calculateHLAScore(organ: DonorOrgan, recipient: Recipient): { score: number; matches: string[] } {
    let matchCount = 0;
    const matches: string[] = [];

    if (organ.hlaMarkers.hlaA && recipient.hlaMarkers.hlaA && organ.hlaMarkers.hlaA === recipient.hlaMarkers.hlaA) {
      matchCount++;
      matches.push(`HLA-A (${organ.hlaMarkers.hlaA})`);
    }
    if (organ.hlaMarkers.hlaB && recipient.hlaMarkers.hlaB && organ.hlaMarkers.hlaB === recipient.hlaMarkers.hlaB) {
      matchCount++;
      matches.push(`HLA-B (${organ.hlaMarkers.hlaB})`);
    }
    if (organ.hlaMarkers.hlaDR && recipient.hlaMarkers.hlaDR && organ.hlaMarkers.hlaDR === recipient.hlaMarkers.hlaDR) {
      matchCount += 1.5; // DR locus has higher immunological significance
      matches.push(`HLA-DR (${organ.hlaMarkers.hlaDR})`);
    }

    // Normalized to 25 pts maximum
    // Maximum match count is 3.5
    const score = Math.min(25, Math.round((matchCount / 3.5) * 25));
    return { score, matches };
  }

  /**
   * Calculate Medical Urgency Score (5 to 30 points)
   */
  public static calculateUrgencyScore(urgency: Recipient['urgency']): number {
    switch (urgency) {
      case 'Status 1A (Critical)':
        return 30;
      case 'Status 1B (Urgent)':
        return 20;
      case 'Status 2 (Moderate)':
        return 10;
      case 'Status 3 (Stable)':
      default:
        return 5;
    }
  }

  /**
   * Calculate Waitlist Duration Score (0 to 10 points)
   * Patients waiting longer earn proportional priority
   */
  public static calculateWaitTimeScore(registrationDate: string, currentTime: Date = new Date()): { score: number; days: number } {
    const regTime = new Date(registrationDate).getTime();
    const now = currentTime.getTime();
    const daysWaiting = Math.max(1, Math.floor((now - regTime) / (1000 * 60 * 60 * 24)));
    
    // Scale: 365+ days = 10 pts, scaled logarithmically
    const score = Math.min(10, Math.round(Math.log10(daysWaiting + 1) * 3.8));
    return { score, days: daysWaiting };
  }

  /**
   * Calculate Ischemia Shelf-Life Expiry Score (0 to 15 points)
   * Organs closer to expiry get higher priority boost to prevent wastage
   */
  public static calculateShelfLifeScore(remainingHours: number, maxHours: number): number {
    if (remainingHours <= 0) return 0;
    const ratioRemaining = remainingHours / maxHours;
    
    // If under 25% shelf life left -> max urgency boost (+15 pts)
    if (ratioRemaining < 0.25) return 15;
    if (ratioRemaining < 0.5) return 11;
    if (ratioRemaining < 0.75) return 7;
    return 3;
  }

  /**
   * Calculate Distance Transport Score (0 to 10 points)
   * Shorter distance means quicker ischemic transport, saving cellular viability
   */
  public static calculateDistanceScore(distanceKm: number): number {
    if (distanceKm <= 50) return 10;
    if (distanceKm <= 200) return 8;
    if (distanceKm <= 500) return 6;
    if (distanceKm <= 1000) return 4;
    return 2;
  }

  /**
   * Calculate Age Match Score (0 to 5 points)
   */
  public static calculateAgeMatchScore(donorAge: number, recipientAge: number): number {
    const ageDiff = Math.abs(donorAge - recipientAge);
    if (ageDiff <= 10) return 5;
    if (ageDiff <= 25) return 3;
    return 1;
  }

  /**
   * Comprehensive Compatibility Evaluation
   * Returns null if biological criteria fail (organ mismatch, blood incompatibility, expired)
   */
  public static evaluatePair(
    organ: DonorOrgan, 
    recipient: Recipient, 
    currentTime: Date = new Date()
  ): { 
    isCompatible: boolean; 
    totalScore: number; 
    breakdown: ScoreBreakdown; 
    reasons: string[]; 
    distanceKm: number; 
    remainingShelfLife: number; 
  } | null {
    // 1. Hard Rule: Organ type must match exactly
    if (organ.organType !== recipient.organNeeded) {
      return null;
    }

    // 2. Hard Rule: Blood group compatibility
    if (!this.isBloodCompatible(organ.bloodGroup, recipient.bloodGroup)) {
      return null;
    }

    // 3. Hard Rule: Status validation
    if (organ.status !== 'Available' || recipient.status !== 'Waiting') {
      return null;
    }

    // 4. Hard Rule: Organ not expired
    const remainingShelfLife = this.getRemainingShelfLifeHours(organ, currentTime);
    if (remainingShelfLife <= 0) {
      return null;
    }

    // Calculate score components
    const bloodScore = 15; // Mandatory baseline for compatible ABO pair
    const hlaResult = this.calculateHLAScore(organ, recipient);
    const urgencyScore = this.calculateUrgencyScore(recipient.urgency);
    const waitTimeResult = this.calculateWaitTimeScore(recipient.registrationDate, currentTime);
    const shelfLifeScore = this.calculateShelfLifeScore(remainingShelfLife, organ.maxShelfLifeHours);
    const distanceKm = this.calculateDistanceKm(organ.coordinates, recipient.coordinates);
    const distanceScore = this.calculateDistanceScore(distanceKm);
    const ageMatchScore = this.calculateAgeMatchScore(organ.donorAge, recipient.age);

    // Sum total score (capped at 100)
    const rawTotal = 
      bloodScore + 
      hlaResult.score + 
      urgencyScore + 
      shelfLifeScore + 
      waitTimeResult.score + 
      distanceScore + 
      ageMatchScore;
    
    const totalScore = Math.min(100, Math.max(1, rawTotal));

    const breakdown: ScoreBreakdown = {
      bloodScore,
      hlaScore: hlaResult.score,
      urgencyScore,
      shelfLifeScore,
      waitTimeScore: waitTimeResult.score,
      distanceScore,
      ageMatchScore,
    };

    const reasons: string[] = [];
    reasons.push(`ABO Blood Compatibility verified (${organ.bloodGroup} → ${recipient.bloodGroup}).`);
    if (hlaResult.matches.length > 0) {
      reasons.push(`HLA Antigen Match: ${hlaResult.matches.join(', ')} (+${hlaResult.score} pts).`);
    } else {
      reasons.push(`Partial HLA marker compatibility evaluated (+${hlaResult.score} pts).`);
    }
    reasons.push(`Clinical Urgency [${recipient.urgency}] tier prioritized (+${urgencyScore} pts).`);
    if (shelfLifeScore >= 11) {
      reasons.push(`Critical Cold-Ischemia Alert: Organ has only ${remainingShelfLife}h remaining (+${shelfLifeScore} pts urgency boost).`);
    }
    reasons.push(`Waitlist Duration: ${waitTimeResult.days} days registered (+${waitTimeResult.score} pts).`);
    reasons.push(`Transit Logistics: ${distanceKm} km between ${organ.city} and ${recipient.city} (+${distanceScore} pts).`);

    return {
      isCompatible: true,
      totalScore,
      breakdown,
      reasons,
      distanceKm,
      remainingShelfLife,
    };
  }
}
