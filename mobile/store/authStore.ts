import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";
import { ApiResponseType, UserType } from "@/types";

interface AuthData {
  user: UserType;
  token: string;
}
interface AuthState {
  user: UserType | null;
  token: string | null;
  isLoading: boolean;
  isCheckingAuth: boolean;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isCheckingAuth: true,

  register: async (username, email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const res: ApiResponseType<AuthData> = await response.json();
      if (!response.ok || !res.success)
        throw new Error(res.message || "Registration failed");

      if (!res.data) throw new Error("Invalid response format: missing data");

      const { user, token } = res.data;

      await AsyncStorage.multiSet([
        ["user", JSON.stringify(user)],
        ["token", token],
      ]);

      set({ user, token, isLoading: false });
      return { success: true };
    } catch (error: any) {
      console.error("Register error:", error);
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const res: ApiResponseType<AuthData> = await response.json();
      if (!response.ok || !res.success)
        throw new Error(res.message || "Login failed");

      if (!res.data) throw new Error("Invalid response format: missing data");

      const { user, token } = res.data;

      await AsyncStorage.multiSet([
        ["user", JSON.stringify(user)],
        ["token", token],
      ]);

      set({ user, token, isLoading: false });
      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const [tokenPair, userPair] = await AsyncStorage.multiGet([
        "token",
        "user",
      ]);

      const token = tokenPair?.[1] || null;
      const userJson = userPair?.[1];

      let user = null;

      if (userJson) {
        try {
          user = JSON.parse(userJson);
        } catch (parseError) {
          console.warn("Failed to parse user JSON:", parseError);
          await AsyncStorage.removeItem("user");
        }
      }

      if (token && user) {
        set({ token, user });
        console.log("Auth restored from storage");
      } else {
        set({ token: null, user: null });
        console.log("No valid auth found in storage");
      }
    } catch (error) {
      console.error("checkAuth failed:", error);
      set({ token: null, user: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.multiRemove(["token", "user"]);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      set({ token: null, user: null });
    }
  },
}));
