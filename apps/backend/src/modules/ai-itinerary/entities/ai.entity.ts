export type AiGeneratedStatus = 'draft' | 'reviewed' | 'published' | 'rejected';

export interface AiGeneratedPackageEntity {
  id: string;
  inputPayload: Record<string, unknown>;
  generatedOutput: Record<string, unknown>;
  status: AiGeneratedStatus;
  createdBy: string;
  reviewerNotes?: string | null;
  convertedPackageId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AiGenerationLogEntity {
  id: string;
  requestPayload: Record<string, unknown>;
  responsePayload?: Record<string, unknown> | null;
  status: 'success' | 'failed';
  provider: string;
  model?: string | null;
  tokensUsed?: number | null;
  latencyMs?: number | null;
  estimatedCost?: number | null;
  errorMessage?: string | null;
  createdAt: string;
}
