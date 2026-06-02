import api from "./axios";
import Cookies from "js-cookie";
import { AuthTokens, LoginFormData, RegisterFormData, User } from "@/types";

export async function login(data: LoginFormData): Promise<AuthTokens> {
  const res = await api.post<AuthTokens>("/auth/login/", data);
  Cookies.set("access", res.data.access, { expires: 1 });
  Cookies.set("refresh", res.data.refresh, { expires: 7 });
  return res.data;
}

export async function register(data: RegisterFormData): Promise<User> {
  const res = await api.post<User>("/auth/register/", data);
  return res.data;
}

export async function getProfile(): Promise<User> {
  const res = await api.get<User>("/auth/profile/");
  return res.data;
}

export function logout() {
  Cookies.remove("access");
  Cookies.remove("refresh");
}
