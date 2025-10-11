import { FormArray, FormControl, FormGroup } from "@angular/forms";

export interface FormState {
  loading: boolean;
  submitted: boolean;
}

export type LoginFormFields = 'email' | 'password'

export type AddNewExpenseFormFields = 'amount' | 'purpose' | 'description' | 'bills';
export type AddNewBillFormFields = 'amount' | 'description' | 'attachmentUrl';

export interface LoginForm {
  email: string;
  password: string;
}

export interface NewExpenseForm {
  amount: FormControl<number>;
  purpose: FormControl<string>;
  description: FormControl<string | null>;
  bills: FormArray<FormGroup<NewBillForm>>;
}

export interface NewBillForm {
  amount: FormControl<number>;
  description: FormControl<string | null>;
  attachmentUrl: FormControl<string | null>;
}
