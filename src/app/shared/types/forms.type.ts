export interface FormState {
  loading: boolean;
  submitted: boolean;
}

export type LoginFormFields = 'email' | 'password'

export type AddNewExpenseFormFields = 'amount' | 'purpose' | 'description' | 'bills';
export type AddNewBillFormFields = 'amount' | 'description' | 'attachmentUrl';
