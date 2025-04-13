import { apiRequest } from "./queryClient";
import { z } from "zod";

// User model
export interface User {
  id: number;
  username: string;
  balance: number;
  vipLevel: number;
  email?: string;
  oauthProvider?: string;
  oauthId?: string;
  createdAt: string;
}

// Login credentials validation schema
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Registration validation schema
export const registerSchema = loginSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"], 
});

// Login function
export const login = async (username: string, password: string): Promise<User> => {
  const response = await apiRequest("POST", "/api/auth/login", { username, password });
  return response.json();
};

// Register function
export const register = async (username: string, password: string): Promise<User> => {
  const response = await apiRequest("POST", "/api/auth/register", { username, password });
  return response.json();
};

// Logout function
export const logout = async (): Promise<void> => {
  await apiRequest("POST", "/api/auth/logout");
};

// Get current user function
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await apiRequest("GET", "/api/auth/me");
    return response.json();
  } catch (error) {
    return null;
  }
};

// Get user initials
export function getUserInitials(username: string): string {
  if (!username) return "?";
  return username.substring(0, 2).toUpperCase();
}

// Get VIP level display
export function getVipLevelDisplay(level: number): string {
  return `VIP Level ${level}`;
}
