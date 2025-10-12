export const ADVANCE_FORM_CONSTANTS = {
  FIELD_LABELS: {
    AMOUNT: 'Amount',
    REASON: 'Reason',
  },
  VALIDATION_MESSAGES: {
    AMOUNT_REQUIRED: 'Amount is required',
    AMOUNT_MIN: 'Amount must be greater than 0',
    REASON_REQUIRED: 'Reason is required',
    REASON_MIN_LENGTH: 'Reason must be at least 3 characters',
  },
  PLACEHOLDERS: {
    AMOUNT: 'Enter advance amount',
    REASON: 'Enter reason for advance',
  },
  BUTTONS: {
    SUBMIT: 'Request Advance',
    CANCEL: 'Cancel',
  },
} as const;