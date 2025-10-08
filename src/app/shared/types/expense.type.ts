export enum RequestStatus {
  Pending = "PENDING",
  Approved = "APPROVED",
  Reviewed = "REVIEWED",
  Rejected = "REJECTED",
}

export interface Expense {
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
  isReconcilled: boolean;
  bills: Bill[];
}

export interface Bill {
  id: string;
  expenseId: string;
  amount: number;
  description: string;
  attachmentUrl: string;
}
