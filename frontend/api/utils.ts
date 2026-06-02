import { AxiosError } from "axios";

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string[]>;

  constructor(message: string, status: number, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }

  // Returns a flat, human-readable string of all field errors
  toDisplayMessage(): string {
    const fields = Object.values(this.fieldErrors).flat();
    return fields.length > 0 ? fields.join(" ") : this.message;
  }
}

type DjangoErrorResponse = Record<string, string | string[]> & {
  detail?: string;
  non_field_errors?: string[];
};

export function handleApiError(err: unknown, fallback: string): ApiError {
  const axiosErr = err as AxiosError<DjangoErrorResponse>;
  const status = axiosErr.response?.status ?? 0;
  const data = axiosErr.response?.data;

  if (data?.detail) {
    return new ApiError(data.detail, status);
  }

  const fieldErrors: Record<string, string[]> = {};
  if (data && typeof data === "object") {
    for (const [key, val] of Object.entries(data)) {
      if (key === "detail") continue;
      fieldErrors[key] = Array.isArray(val) ? val : [String(val)];
    }
  }

  return new ApiError(fallback, status, fieldErrors);
}
