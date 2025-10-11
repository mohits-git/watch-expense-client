import { RequestStatus } from "./expense.type";

export interface Advance {
  id: string;
  userId: string;
  amount: number;
  purpose: string;
  status: RequestStatus;
  description: string;
  createdAt: number;
  updatedAt: number;
  approvedBy: string | null;
  approvedAt: number | null;
  reviewedBy: string | null;
  reviewedAt: number | null;
}

export interface AdvanceSummary {
  approved: number;
  reconciled: number;
  pendingReconciliation: number;
  rejectedAdvance: number;
}

export interface GetAdvanceAPIResponse {
  totalAdvances: number;
  advances: Advance[];
}

export interface CreateAdvanceAPIResponse {
  id: string;
}

export type AdvanceStatusFilter = RequestStatus | 'ALL';
