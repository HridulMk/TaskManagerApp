// Client
export { default as apiClient } from "./client";

// Services — primary usage from pages
export { authService } from "./services/authService";
export { taskService } from "./services/taskService";

// Endpoints — raw HTTP, for advanced usage
export { authEndpoints } from "./endpoints/auth";
export { taskEndpoints } from "./endpoints/tasks";

// Error handling
export { ApiError, handleApiError } from "./utils";

// Types re-exported for convenience
export type {
  User,
  Task,
  TaskStats,
  TaskStatus,
  TaskPriority,
  TaskFilters,
  TaskFormData,
  AuthTokens,
  LoginFormData,
  RegisterFormData,
  ChangePasswordData,
} from "@/types";
