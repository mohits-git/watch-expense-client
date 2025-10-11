import { FormState } from '@/shared/types';
import { AdvanceSummary, ExpensesSummary } from '../types';

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
} as const;
