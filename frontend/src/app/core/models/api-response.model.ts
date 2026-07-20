export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
}

export interface ApiListResponse<T> {
  message?: string;
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
}