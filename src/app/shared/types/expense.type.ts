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
  createdAt: string;
  updatedAt: string;
  approvedBy: string;
  approvedAt: Date;
  reviewedBy: string;
  reviewedAt: number;
  isReconcilled: boolean;
  bills: any[]; // TODO:
}
