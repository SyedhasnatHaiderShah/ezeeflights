import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { CoverageLevel, InsuranceClaim, InsurancePlan, InsurancePlanType, InsurancePolicy } from './insurance.entity';

@Injectable()
export class InsuranceRepository {
  constructor(private readonly db: PostgresClient) {}

  getPlans(planType?: InsurancePlanType, coverageLevel?: CoverageLevel): Promise<InsurancePlan[]> {
    const params: unknown[] = [];
    const conditions = ['p.is_active = true'];
    if (planType) {
      params.push(planType);
      conditions.push(`p.plan_type = $${params.length}`);
    }
    if (coverageLevel) {
      params.push(coverageLevel);
      conditions.push(`p.coverage_level = $${params.length}`);
    }

    return this.db.query<InsurancePlan>(
      `SELECT p.id, p.provider_id as "providerId", pr.name as "providerName", p.name,
         p.plan_type as "planType", p.coverage_level as "coverageLevel", p.description,
         p.price_per_day::float as "pricePerDay", p.price_annual::float as "priceAnnual", p.currency,
         p.max_trip_duration_days as "maxTripDurationDays", p.coverage_details as "coverageDetails",
         p.adventure_sports_addon_price::float as "adventureSportsAddonPrice", p.age_limit_max as "ageLimitMax",
         p.is_active as "isActive", p.created_at as "createdAt"
       FROM insurance_plans p
       LEFT JOIN insurance_providers pr ON pr.id = p.provider_id
       WHERE ${conditions.join(' AND ')}
       ORDER BY p.coverage_level, p.name`,
      params,
    );
  }

  getPlanById(id: string): Promise<InsurancePlan | null> {
    return this.db.queryOne<InsurancePlan>(
      `SELECT p.id, p.provider_id as "providerId", pr.name as "providerName", p.name,
         p.plan_type as "planType", p.coverage_level as "coverageLevel", p.description,
         p.price_per_day::float as "pricePerDay", p.price_annual::float as "priceAnnual", p.currency,
         p.max_trip_duration_days as "maxTripDurationDays", p.coverage_details as "coverageDetails",
         p.adventure_sports_addon_price::float as "adventureSportsAddonPrice", p.age_limit_max as "ageLimitMax",
         p.is_active as "isActive", p.created_at as "createdAt"
       FROM insurance_plans p
       LEFT JOIN insurance_providers pr ON pr.id = p.provider_id
       WHERE p.id = $1 AND p.is_active = true
       LIMIT 1`,
      [id],
    );
  }

  createPolicy(params: {
    userId: string;
    planId: string;
    policyNumber: string;
    bookingId?: string;
    startDate: string;
    endDate: string;
    destinationCountries: string[];
    travelerDetails: unknown[];
    adventureSportsAddon: boolean;
    totalPremium: number;
    currency: string;
    paymentId: string;
    policyDocumentUrl: string;
    providerPolicyRef: string;
  }): Promise<InsurancePolicy | null> {
    return this.db.queryOne<InsurancePolicy>(
      `INSERT INTO insurance_policies (
         user_id, plan_id, booking_id, policy_number, start_date, end_date,
         destination_countries, traveler_details, adventure_sports_addon,
         total_premium, currency, payment_id, policy_document_url, provider_policy_ref
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, $10, $11, $12, $13, $14)
       RETURNING id, user_id as "userId", plan_id as "planId", policy_number as "policyNumber", status,
         start_date as "startDate", end_date as "endDate", destination_countries as "destinationCountries",
         traveler_details as "travelerDetails", adventure_sports_addon as "adventureSportsAddon",
         total_premium::float as "totalPremium", currency, payment_id as "paymentId",
         policy_document_url as "policyDocumentUrl", provider_policy_ref as "providerPolicyRef",
         cancelled_at as "cancelledAt", created_at as "createdAt"`,
      [
        params.userId,
        params.planId,
        params.bookingId ?? null,
        params.policyNumber,
        params.startDate,
        params.endDate,
        JSON.stringify(params.destinationCountries),
        JSON.stringify(params.travelerDetails),
        params.adventureSportsAddon,
        params.totalPremium,
        params.currency,
        params.paymentId,
        params.policyDocumentUrl,
        params.providerPolicyRef,
      ],
    );
  }

  getPoliciesByUser(userId: string): Promise<InsurancePolicy[]> {
    return this.db.query<InsurancePolicy>(
      `SELECT id, user_id as "userId", plan_id as "planId", policy_number as "policyNumber", status,
          start_date as "startDate", end_date as "endDate", destination_countries as "destinationCountries",
          traveler_details as "travelerDetails", adventure_sports_addon as "adventureSportsAddon",
          total_premium::float as "totalPremium", currency, payment_id as "paymentId",
          policy_document_url as "policyDocumentUrl", provider_policy_ref as "providerPolicyRef",
          cancelled_at as "cancelledAt", created_at as "createdAt"
       FROM insurance_policies
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );
  }

  getPolicyById(id: string, userId: string): Promise<InsurancePolicy | null> {
    return this.db.queryOne<InsurancePolicy>(
      `SELECT id, user_id as "userId", plan_id as "planId", policy_number as "policyNumber", status,
          start_date as "startDate", end_date as "endDate", destination_countries as "destinationCountries",
          traveler_details as "travelerDetails", adventure_sports_addon as "adventureSportsAddon",
          total_premium::float as "totalPremium", currency, payment_id as "paymentId",
          policy_document_url as "policyDocumentUrl", provider_policy_ref as "providerPolicyRef",
          cancelled_at as "cancelledAt", created_at as "createdAt"
       FROM insurance_policies
       WHERE id = $1 AND user_id = $2
       LIMIT 1`,
      [id, userId],
    );
  }

  cancelPolicy(id: string, userId: string): Promise<InsurancePolicy | null> {
    return this.db.queryOne<InsurancePolicy>(
      `UPDATE insurance_policies
       SET status = 'cancelled', cancelled_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id as "userId", plan_id as "planId", policy_number as "policyNumber", status,
          start_date as "startDate", end_date as "endDate", destination_countries as "destinationCountries",
          traveler_details as "travelerDetails", adventure_sports_addon as "adventureSportsAddon",
          total_premium::float as "totalPremium", currency, payment_id as "paymentId",
          policy_document_url as "policyDocumentUrl", provider_policy_ref as "providerPolicyRef",
          cancelled_at as "cancelledAt", created_at as "createdAt"`,
      [id, userId],
    );
  }

  createClaim(params: {
    policyId: string;
    userId: string;
    claimType: string;
    description: string;
    incidentDate: string;
    claimedAmount: number;
    currency: string;
    supportingDocuments: string[];
  }): Promise<InsuranceClaim | null> {
    return this.db.queryOne<InsuranceClaim>(
      `INSERT INTO insurance_claims (policy_id, user_id, claim_type, description, incident_date, claimed_amount, currency, supporting_documents)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
       RETURNING id, policy_id as "policyId", user_id as "userId", claim_type as "claimType", description,
         incident_date as "incidentDate", claimed_amount::float as "claimedAmount", currency, status,
         supporting_documents as "supportingDocuments", approved_amount::float as "approvedAmount",
         rejection_reason as "rejectionReason", processed_at as "processedAt", created_at as "createdAt", updated_at as "updatedAt"`,
      [
        params.policyId,
        params.userId,
        params.claimType,
        params.description,
        params.incidentDate,
        params.claimedAmount,
        params.currency,
        JSON.stringify(params.supportingDocuments),
      ],
    );
  }

  getClaimById(id: string, userId: string): Promise<InsuranceClaim | null> {
    return this.db.queryOne<InsuranceClaim>(
      `SELECT id, policy_id as "policyId", user_id as "userId", claim_type as "claimType", description,
         incident_date as "incidentDate", claimed_amount::float as "claimedAmount", currency, status,
         supporting_documents as "supportingDocuments", approved_amount::float as "approvedAmount",
         rejection_reason as "rejectionReason", processed_at as "processedAt", created_at as "createdAt", updated_at as "updatedAt"
       FROM insurance_claims
       WHERE id = $1 AND user_id = $2
       LIMIT 1`,
      [id, userId],
    );
  }
}
