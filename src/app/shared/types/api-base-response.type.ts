export interface APIBaseResponse<T> {
  status: number;
  message: string;
  data: T;
}
