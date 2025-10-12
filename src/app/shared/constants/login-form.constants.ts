export const LOGIN_FORM_CONSTANTS = {
  FIELD_LABELS: {
    EMAIL: 'Email',
    PASSWORD: 'Password',
  },
  VALIDATION_MESSAGES: {
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_INVALID: 'Please enter a valid email address',
    PASSWORD_REQUIRED: 'Password is required',
    PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  },
  PLACEHOLDERS: {
    EMAIL: 'Enter your email address',
    PASSWORD: 'Enter your password',
  },
  BUTTONS: {
    LOGIN: 'Login',
    FORGOT_PASSWORD: 'Forgot Password?',
  },
} as const;