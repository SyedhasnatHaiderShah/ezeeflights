import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { randomBytes } from 'crypto';
import { CalculatePremiumDto, PurchasePolicyDto, SubmitClaimDto } from './dto/insurance.dto';
import { CoverageLevel, InsuranceClaim, InsurancePlan, InsurancePlanType, InsurancePolicy, PremiumBreakdown } from './insurance.entity';
import { InsuranceRepository } from './insurance.repository';

@Injectable()
export class InsuranceService {
  constructor(private readonly repository: InsuranceRepository) {}

  getPlans(planType?: InsurancePlanType, coverageLevel?: CoverageLevel): Promise<InsurancePlan[]> {
    return this.repository.getPlans(planType, coverageLevel);
  }

  async getPlanById(id: string): Promise<InsurancePlan> {
    const plan = await this.repository.getPlanById(id);
    if (!plan) throw new NotFoundException('Insurance plan not found');
    return plan;
  }

  async calculatePremium(planId: string, startDate: string, endDate: string, travelers: unknown[], adventureSports = false): Promise<PremiumBreakdown> {
    const plan = await this.getPlanById(planId);
    const travelerCount = travelers.length;
    const tripDays = this.calculateTripDays(startDate, endDate);

    if (plan.planType === 'single_trip' && !plan.pricePerDay) {
      throw new BadRequestException('Single-trip plan is missing price_per_day');
    }
    if (plan.planType === 'annual_multi_trip' && !plan.priceAnnual) {
      throw new BadRequestException('Annual plan is missing price_annual');
    }

    const basePremium =
      plan.planType === 'single_trip'
        ? Number(((plan.pricePerDay ?? 0) * tripDays * travelerCount).toFixed(2))
        : Number(((plan.priceAnnual ?? 0) * travelerCount).toFixed(2));

    const adventureSportsPremium =
      adventureSports && plan.adventureSportsAddonPrice ? Number((plan.adventureSportsAddonPrice * travelerCount).toFixed(2)) : 0;

    return {
      planId,
      currency: plan.currency,
      travelers: travelerCount,
      tripDays,
      basePremium,
      adventureSportsPremium,
      totalPremium: Number((basePremium + adventureSportsPremium).toFixed(2)),
    };
  }

  async purchasePolicy(userId: string, dto: PurchasePolicyDto): Promise<InsurancePolicy> {
    const premium = await this.calculatePremium(dto.planId, dto.startDate, dto.endDate, dto.travelers, dto.adventureSports ?? false);
    const policyNumber = this.generatePolicyNumber();

    const paymentIntent = {
      id: `ins_pay_${randomBytes(8).toString('hex')}`,
      provider: dto.paymentProvider ?? 'mock-insurance-provider',
      status: 'created',
    };

    const policyPdfPath = await this.generatePolicyPdf({
      policyNumber,
      planId: dto.planId,
      startDate: dto.startDate,
      endDate: dto.endDate,
      travelerCount: dto.travelers.length,
      totalPremium: premium.totalPremium,
      currency: premium.currency,
      paymentId: paymentIntent.id,
    });

    const policy = await this.repository.createPolicy({
      userId,
      planId: dto.planId,
      bookingId: dto.bookingId,
      policyNumber,
      startDate: dto.startDate,
      endDate: dto.endDate,
      destinationCountries: dto.destinationCountries ?? [],
      travelerDetails: dto.travelers,
      adventureSportsAddon: dto.adventureSports ?? false,
      totalPremium: premium.totalPremium,
      currency: premium.currency,
      paymentId: paymentIntent.id,
      policyDocumentUrl: policyPdfPath,
      providerPolicyRef: `PROV-${randomBytes(6).toString('hex').toUpperCase()}`,
    });

    if (!policy) throw new BadRequestException('Failed to create insurance policy');
    return policy;
  }

  getMyPolicies(userId: string): Promise<InsurancePolicy[]> {
    return this.repository.getPoliciesByUser(userId);
  }

  async getPolicyById(id: string, userId: string): Promise<InsurancePolicy> {
    const policy = await this.repository.getPolicyById(id, userId);
    if (!policy) throw new NotFoundException('Policy not found');
    return policy;
  }

  async cancelPolicy(id: string, userId: string): Promise<InsurancePolicy> {
    const policy = await this.getPolicyById(id, userId);
    if (policy.status === 'cancelled') {
      throw new BadRequestException('Policy already cancelled');
    }

    const cancelled = await this.repository.cancelPolicy(id, userId);
    if (!cancelled) throw new NotFoundException('Policy not found');
    return cancelled;
  }

  async submitClaim(userId: string, dto: SubmitClaimDto): Promise<InsuranceClaim> {
    await this.getPolicyById(dto.policyId, userId);
    const claim = await this.repository.createClaim({
      policyId: dto.policyId,
      userId,
      claimType: dto.claimType,
      description: dto.description,
      incidentDate: dto.incidentDate,
      claimedAmount: dto.claimedAmount,
      currency: 'USD',
      supportingDocuments: dto.supportingDocuments ?? [],
    });
    if (!claim) throw new BadRequestException('Failed to submit claim');
    return claim;
  }

  async getClaimById(id: string, userId: string): Promise<InsuranceClaim> {
    const claim = await this.repository.getClaimById(id, userId);
    if (!claim) throw new NotFoundException('Claim not found');
    return claim;
  }

  async calculatePremiumFromDto(dto: CalculatePremiumDto): Promise<PremiumBreakdown> {
    return this.calculatePremium(dto.planId, dto.startDate, dto.endDate, dto.travelers, dto.adventureSports ?? false);
  }

  private generatePolicyNumber(): string {
    const year = new Date().getUTCFullYear();
    const suffix = randomBytes(8).toString('base64url').replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase();
    return `POL-${year}-${suffix}`;
  }

  private calculateTripDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Invalid travel dates');
    }

    const days = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
    if (days <= 0) throw new BadRequestException('End date must be on or after start date');
    return days;
  }

  private async generatePolicyPdf(data: {
    policyNumber: string;
    planId: string;
    startDate: string;
    endDate: string;
    travelerCount: number;
    totalPremium: number;
    currency: string;
    paymentId: string;
  }): Promise<string> {
    const storagePath = process.env.INSURANCE_DOCS_STORAGE_PATH ?? path.join(process.cwd(), 'tmp', 'insurance-policies');
    await fs.mkdir(storagePath, { recursive: true });

    const filePath = path.join(storagePath, `${data.policyNumber}.pdf`);
    const lines = [
      'Travel Insurance Policy',
      `Policy Number: ${data.policyNumber}`,
      `Plan Id: ${data.planId}`,
      `Start Date: ${data.startDate}`,
      `End Date: ${data.endDate}`,
      `Traveler Count: ${data.travelerCount}`,
      `Premium: ${data.totalPremium.toFixed(2)} ${data.currency}`,
      `Payment Id: ${data.paymentId}`,
    ];

    const safeText = lines.map((line) => line.replace(/[()\\]/g, '')).join('\n');
    const streamText = `BT /F1 11 Tf 50 780 Td 14 TL (${safeText.split('\n').join(') Tj T* (')}) Tj ET`;
    const objects = [
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
      '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
      `5 0 obj << /Length ${Buffer.byteLength(streamText, 'utf8')} >> stream\n${streamText}\nendstream endobj`,
    ];

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [0];
    for (const obj of objects) {
      offsets.push(Buffer.byteLength(pdf, 'utf8'));
      pdf += `${obj}\n`;
    }

    const xrefStart = Buffer.byteLength(pdf, 'utf8');
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i += 1) {
      pdf += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

    await fs.writeFile(filePath, Buffer.from(pdf, 'utf8'));
    return filePath;
  }
}
