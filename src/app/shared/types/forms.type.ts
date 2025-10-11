import { FormArray, FormControl, FormGroup } from "@angular/forms";

export interface FormState {
  loading: boolean;
  submitted: boolean;
}

export interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}
export type LoginFormFields = keyof LoginForm;

export interface NewExpenseForm {
  amount: FormControl<number>;
  purpose: FormControl<string>;
  description: FormControl<string | null>;
  bills: FormArray<FormGroup<NewBillForm>>;
}
export type AddNewExpenseFormFields = keyof NewExpenseForm;

export interface NewBillForm {
  amount: FormControl<number>;
  description: FormControl<string | null>;
  attachmentUrl: FormControl<string | null>;
}
export type AddNewBillFormFields = keyof NewBillForm;

export interface NewAdvanceForm {
  amount: FormControl<number>;
  purpose: FormControl<string>;
  description: FormControl<string | null>;
}
export type AddNewAdvanceFormFields = keyof NewAdvanceForm;
