export enum ServiceErrorType {
  Validation = 'validation',
  Network = 'network',
  Unauthorized = 'unauthorized',
  Unknown = 'unknown',
  NotFound = 'not-found',
  ServerError = 'server-error',
}

export enum OperationStatus {
  Success = 'success',
  Failure = 'failure',
  Pending = 'pending',
}