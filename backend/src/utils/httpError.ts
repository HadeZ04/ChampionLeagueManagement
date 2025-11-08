export class HttpError extends Error {
  status: number;

  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export const NotFoundError = (message = "Not Found"): HttpError => new HttpError(404, message);

export const UnauthorizedError = (message = "Unauthorized"): HttpError =>
  new HttpError(401, message);

export const ForbiddenError = (message = "Forbidden"): HttpError => new HttpError(403, message);

export const BadRequestError = (message = "Bad Request", details?: unknown): HttpError =>
  new HttpError(400, message, details);
