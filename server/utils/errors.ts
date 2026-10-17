export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const badRequest = (message: string) => new HttpError(400, message);
export const unauthorized = (message = "Unauthenticated") =>
  new HttpError(401, message);
export const forbidden = (message = "Permission denied") =>
  new HttpError(403, message);
export const notFound = (message = "Resource not found") =>
  new HttpError(404, message);
export const conflict = (message = "Resource already exists") =>
  new HttpError(409, message);
