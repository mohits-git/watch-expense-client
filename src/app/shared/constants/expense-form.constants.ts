export const EXPENSE_FORM_CONSTANTS = {
  FIELD_LABELS: {
    AMOUNT: 'Amount',
    PURPOSE: 'Purpose',
    DESCRIPTION: 'Description',
    BILLS: 'Bills',
    BILL_AMOUNT: 'Bill Amount',
    BILL_DESCRIPTION: 'Bill Description',
    ATTACHMENT: 'Attachment',
  },
  VALIDATION_MESSAGES: {
    AMOUNT_REQUIRED: 'Amount is required',
    AMOUNT_MIN: 'Amount must be greater than 0',
    PURPOSE_REQUIRED: 'Purpose is required',
    PURPOSE_MIN_LENGTH: 'Purpose must be at least 3 characters',
    BILLS_MIN_LENGTH: 'At least one bill is required',
  },
  PLACEHOLDERS: {
    AMOUNT: 'Enter amount',
    PURPOSE: 'Enter purpose of expense',
    DESCRIPTION: 'Enter additional description (optional)',
    BILL_AMOUNT: 'Enter bill amount',
    BILL_DESCRIPTION: 'Enter bill description (optional)',
  },
  BUTTONS: {
    ADD_BILL: 'Add Bill',
    REMOVE_BILL: 'Remove Bill',
    SUBMIT: 'Add Expense',
    CANCEL: 'Cancel',
  },
} as const;