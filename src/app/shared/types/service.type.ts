import type { ServiceErrorType } from '../enums/service.enum';
import type { Expense, GetExpenseAPIResponse } from './expense.type';
import type { Advance, GetAdvanceAPIResponse } from './advance.type';

export interface ServiceError {
  message: string;
  type: ServiceErrorType;
  statusCode?: number;
}

export interface ServiceOperationResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ServiceFetchResult<T = any> {
  data: T;
}

export interface ExpenseCreateResult extends ServiceOperationResult<Expense> {}
export interface AdvanceCreateResult extends ServiceOperationResult<Advance> {}

export interface ExpenseFetchResult
  extends ServiceFetchResult<GetExpenseAPIResponse> {}
export interface AdvanceFetchResult
  extends ServiceFetchResult<GetAdvanceAPIResponse> {}

export interface AuthError extends ServiceError {}
export interface LoginResult {
  success: boolean;
  error?: AuthError;
}
