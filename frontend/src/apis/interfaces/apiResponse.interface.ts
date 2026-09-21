/**
 * The backend's response envelope — every endpoint returns this shape.
 * `message` is the user-facing text; the frontend never invents its own.
 */
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}
