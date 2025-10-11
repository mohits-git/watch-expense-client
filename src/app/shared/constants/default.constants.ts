import { FormState } from '@/shared/types';
import { AdvanceSummary, ExpensesSummary, UsersSummary, DepartmentsSummary, ProjectsSummary } from '../types';

export const DEFAULTS = {
  FORM_STATE: {
    loading: false,
    submitted: false,
  } as FormState,
  INPUT_TYPE: 'text',
  EXPENSE: {
    SUMMARY: {
      totalExpense: 0,
      pendingExpense: 0,
      reimbursedExpense: 0,
      rejectedExpense: 0,
    } as ExpensesSummary,
  } as const,
  ADVANCE_SUMMARY: {
    approved: 0,
    reconciled: 0,
    pendingReconciliation: 0,
    rejectedAdvance: 0,
  } as AdvanceSummary,
  ADMIN: {
    USERS_SUMMARY: {
      totalUsers: 0,
      activeUsers: 0,
      adminUsers: 0,
      employeeUsers: 0,
    } as UsersSummary,
    DEPARTMENTS_SUMMARY: {
      totalDepartments: 0,
      totalBudget: 0,
      averageBudget: 0,
    } as DepartmentsSummary,
    PROJECTS_SUMMARY: {
      totalProjects: 0,
      totalBudget: 0,
      averageBudget: 0,
      activeProjects: 0,
    } as ProjectsSummary,
  } as const,
} as const;
