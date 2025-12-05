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

export interface UserForm {
  employeeId: FormControl<string>;
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  role: FormControl<string | { label: string; value: string } | null>;
  departmentId: FormControl<string | { id: string; name: string } | null>;
  projectId: FormControl<string | { id: string; name: string } | null>;
}
export type UserFormFields = keyof UserForm;

export interface DepartmentForm {
  name: FormControl<string>;
  budget: FormControl<number>;
}
export type DepartmentFormFields = keyof DepartmentForm;

export interface ProjectForm {
  name: FormControl<string>;
  description: FormControl<string>;
  budget: FormControl<number>;
  startDate: FormControl<Date | null>;
  endDate: FormControl<Date | null>;
  departmentId: FormControl<string | { id: string; name: string } | null>;
}
export type ProjectFormFields = keyof ProjectForm;


