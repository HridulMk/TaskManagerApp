import Cookies from "js-cookie";
import { authEndpoints } from "@/api/endpoints/auth";
import { LoginFormData, RegisterFormData, User, AuthTokens, ChangePasswordData } from "@/types";
import { handleApiError } from "@/api/utils";

export const authService = {
  async login(data: LoginFormData): Promise<AuthTokens> {
    try {
      const res = await authEndpoints.login(data);
      Cookies.set("access", res.data.access, { expires: 1 });
      Cookies.set("refresh", res.data.refresh, { expires: 7 });
      return res.data;
    } catch (err) {
      throw handleApiError(err, "Login failed");
    }
  },

  async register(data: RegisterFormData): Promise<User> {
    try {
      const res = await authEndpoints.register(data);
      return res.data;
    } catch (err) {
      throw handleApiError(err, "Registration failed");
    }
  },

  async getProfile(): Promise<User> {
    try {
      const res = await authEndpoints.getProfile();
      return res.data;
    } catch (err) {
      throw handleApiError(err, "Failed to load profile");
    }
  },

  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      await authEndpoints.changePassword(data);
    } catch (err) {
      throw handleApiError(err, "Failed to change password");
    }
  },

  logout(): void {
    Cookies.remove("access");
    Cookies.remove("refresh");
  },

  isAuthenticated(): boolean {
    return !!Cookies.get("access");
  },
};
