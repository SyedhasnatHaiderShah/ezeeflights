import { Injectable, NotFoundException } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { AiGeneratedPackageEntity, AiGeneratedStatus } from './entities/ai.entity';

@Injectable()
export class AiRepository {
  constructor(private readonly db: PostgresClient) {}

  createGeneratedPackage(inputPayload: Record<string, unknown>, generatedOutput: Record<string, unknown>, createdBy: string) {
    return this.db.queryOne<AiGeneratedPackageEntity>(
      `INSERT INTO ai_generated_packages (input_payload, generated_output, created_by)
       VALUES ($1::jsonb, $2::jsonb, $3)
       RETURNING id,
         input_payload as "inputPayload",
         generated_output as "generatedOutput",
         status,
         created_by as "createdBy",
         reviewer_notes as "reviewerNotes",
         converted_package_id as "convertedPackageId",
         created_at as "createdAt",
         updated_at as "updatedAt"`,
      [JSON.stringify(inputPayload), JSON.stringify(generatedOutput), createdBy],
    );
  }

  async listGeneratedPackages() {
    return this.db.query<AiGeneratedPackageEntity>(
      `SELECT id, input_payload as "inputPayload", generated_output as "generatedOutput", status,
          created_by as "createdBy", reviewer_notes as "reviewerNotes", converted_package_id as "convertedPackageId",
          created_at as "createdAt", updated_at as "updatedAt"
       FROM ai_generated_packages ORDER BY created_at DESC`,
    );
  }

  async getGeneratedPackageById(id: string) {
    const row = await this.db.queryOne<AiGeneratedPackageEntity>(
      `SELECT id, input_payload as "inputPayload", generated_output as "generatedOutput", status,
          created_by as "createdBy", reviewer_notes as "reviewerNotes", converted_package_id as "convertedPackageId",
          created_at as "createdAt", updated_at as "updatedAt"
       FROM ai_generated_packages WHERE id = $1 LIMIT 1`,
      [id],
    );

    if (!row) throw new NotFoundException('AI generated package not found');
    return row;
  }

  async updateGeneratedStatus(id: string, status: AiGeneratedStatus, reviewerNotes?: string) {
    const row = await this.db.queryOne<AiGeneratedPackageEntity>(
      `UPDATE ai_generated_packages
       SET status = $2,
           reviewer_notes = COALESCE($3, reviewer_notes),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, input_payload as "inputPayload", generated_output as "generatedOutput", status,
          created_by as "createdBy", reviewer_notes as "reviewerNotes", converted_package_id as "convertedPackageId",
          created_at as "createdAt", updated_at as "updatedAt"`,
      [id, status, reviewerNotes ?? null],
    );
    if (!row) throw new NotFoundException('AI generated package not found');
    return row;
  }

  async markConverted(id: string, packageId: string) {
    await this.db.query(
      `UPDATE ai_generated_packages
       SET status = 'published', converted_package_id = $2, updated_at = NOW()
       WHERE id = $1`,
      [id, packageId],
    );
  }

  createGenerationLog(payload: {
    requestPayload: Record<string, unknown>;
    responsePayload?: Record<string, unknown>;
    status: 'success' | 'failed';
    provider: string;
    model?: string;
    tokensUsed?: number;
    latencyMs?: number;
    estimatedCost?: number;
    errorMessage?: string;
  }) {
    return this.db.query(
      `INSERT INTO ai_generation_logs (request_payload, response_payload, status, provider, model, tokens_used, latency_ms, estimated_cost, error_message)
       VALUES ($1::jsonb,$2::jsonb,$3,$4,$5,$6,$7,$8,$9)`,
      [
        JSON.stringify(payload.requestPayload),
        payload.responsePayload ? JSON.stringify(payload.responsePayload) : null,
        payload.status,
        payload.provider,
        payload.model ?? null,
        payload.tokensUsed ?? null,
        payload.latencyMs ?? null,
        payload.estimatedCost ?? null,
        payload.errorMessage ?? null,
      ],
    );
  }

  async setPackageAiFlag(packageId: string, isAiGenerated = true) {
    await this.db.query(`UPDATE packages SET is_ai_generated = $2 WHERE id = $1`, [packageId, isAiGenerated]);
  }

  findHotelSuggestions(city: string, limit = 3) {
    return this.db.query<{ id: string; name: string; nightlyRate: number }>(
      `SELECT id, name, nightly_rate::float8 as "nightlyRate"
       FROM hotels
       WHERE city ILIKE $1
       ORDER BY nightly_rate ASC
       LIMIT $2`,
      [`%${city}%`, limit],
    );
  }

  getUserBehaviorProfile(userId: string) {
    return this.db.queryOne<{ totalBookings: string; avgSpend: string; preferredCurrency: string }>(
      `SELECT COUNT(*)::text as "totalBookings", COALESCE(AVG(total_amount),0)::text as "avgSpend", MIN(currency) as "preferredCurrency"
       FROM bookings
       WHERE user_id = $1`,
      [userId],
    );
  }
}
