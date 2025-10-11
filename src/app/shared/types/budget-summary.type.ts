export interface UserBudgetAPIResponse {
  budget: number;
}

export interface BudgetSummary {
  allocatedBudget: number;
  usedBudget: number;
  remainingBudget: number;
  usagePercentage: number;
}
