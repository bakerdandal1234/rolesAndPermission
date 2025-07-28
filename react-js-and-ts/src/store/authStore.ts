import { create } from 'zustand';
import axios from "../lib/axios";
import type { User } from "../types/auth";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginError: string | null;
  registerErrors: { [key: string]: string } | null;
  error: string | null;
  checkSession: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  verifyResetPasswordToken: (token: string) => Promise<boolean>;
  verifyEmail: (token: string) => Promise<boolean>;
  resendVerificationEmail: (email: string) => Promise<string>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,
  loginError: null,
  registerErrors: null,
  error: null,

  checkSession: async () => {
    try {
      set({ loading: true });
      const response = await axios.get("/me");
      set({ user: response.data.user, isAuthenticated: true, loading: false });
    } catch (error: any) {
      console.error("checkSession: Error during session check:", error);
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  register: async (email, password, name) => {
    try {
      set({ loading: true, registerErrors: null });
      const response = await axios.post("/signup", { email, password, name });
      set({ user: response.data.user, isAuthenticated: true, loading: false });
      return true;
    } catch (err: any) {
      const validationErrors = err.response?.data?.errors;
      const translatedErrors: { [key: string]: string } = {};

      if (Array.isArray(validationErrors)) {
        validationErrors.forEach((item: { path: string; msg: string }) => {
          translatedErrors[item.path] = item.msg;
        });
      } else {
        translatedErrors.general =
          err.response?.data?.message || "حدث خطأ أثناء التسجيل";
      }

      set({ registerErrors: translatedErrors, loading: false });
      return false;
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true, loginError: null });
      const response = await axios.post("/login", { email, password });
      set({ user: response.data.user, isAuthenticated: true, loading: false });
    } catch (err: any) {
      set({ loginError: err.response?.data?.message || "خطأ في البريد الإلكتروني أو كلمة المرور", loading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      set({ loading: true });
      await axios.post("/logout");
      set({ user: null, isAuthenticated: false, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "حدث خطأ أثناء تسجيل الخروج", loading: false });
      throw err;
    }
  },

  forgotPassword: async (email) => {
    try {
      set({ loading: true, error: null });
      await axios.post("/forgot-password", { email });
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "حدث خطأ أثناء إرسال بريد إعادة تعيين كلمة المرور", loading: false });
      throw err;
    }
  },

  resetPassword: async (token, password) => {
    try {
      set({ loading: true, error: null });
      await axios.post(`/reset-password/${token}`, { token, password });
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "حدث خطأ أثناء إعادة تعيين كلمة المرور", loading: false });
      throw err;
    }
  },

  verifyResetPasswordToken: async (token) => {
    try {
      set({ loading: true, error: null });
      await axios.get(`/verify-reset-token/${token}`);
      set({ loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || "حدث خطأ أثناء التحقق من رمز إعادة تعيين كلمة المرور", loading: false });
      return false;
    }
  },

  verifyEmail: async (token) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get(`/verify-email/${token}`);
      set({ user: response.data.user, loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.response?.data?.message || "حدث خطأ أثناء التحقق من البريد الإلكتروني", loading: false });
      return false;
    }
  },

  resendVerificationEmail: async (email) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post("/resend-verification-email", { email });
      set({ loading: false });
      return res.data.message;
    } catch (err: any) {
      set({ error: err.response?.data?.message || "حدث خطأ أثناء إعادة إرسال بريد التحقق", loading: false });
      throw err;
    }
  },
}));