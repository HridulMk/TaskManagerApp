import client from "@/api/client";
import { AuthTokens, LoginFormData, RegisterFormData, User, ChangePasswordData } from "@/types";

const AUTH = "/auth";

export const authEndpoints = {
  login: (data: LoginFormData) =>
    client.post<AuthTokens>(`${AUTH}/login/`, data),

  register: (data: RegisterFormData) =>
    client.post<User>(`${AUTH}/register/`, data),

  getProfile: () =>
    client.get<User>(`${AUTH}/profile/`),

  refreshToken: (refresh: string) =>
    client.post<Pick<AuthTokens, "access">>(`${AUTH}/refresh/`, { refresh }),

  changePassword: (data: ChangePasswordData) =>
    client.post<{ detail: string }>(`${AUTH}/change-password/`, data),
};
