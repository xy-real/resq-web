"use client";

import { useState, FormEvent } from "react";
import { Mail, Lock, Loader2, Check, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { signIn, signInWithGoogle, isAdmin } from "@/lib/auth";
import { toast } from "sonner";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const { user, error } = await signIn({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        // Handle email not confirmed error
        if (error.message.toLowerCase().includes('email') && 
            (error.message.toLowerCase().includes('confirm') || 
             error.message.toLowerCase().includes('verified') ||
             error.message.toLowerCase().includes('verification'))) {
          setErrors({
            general: "Please verify your email address before signing in.",
          });
          toast.error("Email not verified", {
            description: "Check your inbox for the verification link.",
            duration: 5000,
          });
        } else {
          setErrors({
            general:
              error.message || "Invalid email or password. Please try again.",
          });
          toast.error("Sign in failed", {
            description: error.message || "Invalid email or password",
          });
        }
        return;
      }

      if (user) {
        setIsSuccess(true);
        toast.success("Welcome back!", {
          description: "Redirecting to your dashboard...",
        });

        // Check if user is admin and redirect accordingly
        const userIsAdmin = await isAdmin(user.id);

        setTimeout(() => {
          if (userIsAdmin) {
            router.push("/admin/dashboard");
          } else {
            router.push("/dashboard");
          }
        }, 1000);
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        general: "An unexpected error occurred. Please try again.",
      });
      toast.error("Something went wrong", {
        description: "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();

      if (error) {
        toast.error("Google sign in failed", {
          description: error.message,
        });
      }
      // User will be redirected by Supabase OAuth flow
    } catch (error) {
      console.error("Google sign in error:", error);
      toast.error("Something went wrong", {
        description: "Please try again later",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div
      className="rounded-xl ring-1 p-6 sm:p-8"
      style={{
        backgroundColor: "rgb(var(--bg-secondary))",
        borderColor: "rgb(var(--border-primary))",
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {errors.general && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400 font-medium">{errors.general}</p>
          </div>
        )}

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-base font-semibold text-theme-text-primary mb-2 font-inter"
          >
            Email Address
            <span className="text-red-400 ml-1">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-theme-text-tertiary" />
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="e.g. juan.delacruz@vsu.edu.ph"
              className={cn(
                "w-full pl-11 pr-4 py-3 rounded-lg text-base transition-all border-2",
                errors.email
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20",
              )}
              style={{
                backgroundColor: "rgb(var(--bg-primary))",
                borderColor: errors.email
                  ? undefined
                  : "rgb(var(--border-primary))",
                color: "rgb(var(--text-primary))",
              }}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-400 font-medium">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-base font-semibold text-theme-text-primary mb-2 font-inter"
          >
            Password
            <span className="text-red-400 ml-1">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-theme-text-tertiary" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="e.g. ••••••••"
              className={cn(
                "w-full pl-11 pr-12 py-3 rounded-lg text-base transition-all border-2",
                errors.password
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20",
              )}
              style={{
                backgroundColor: "rgb(var(--bg-primary))",
                borderColor: errors.password
                  ? undefined
                  : "rgb(var(--border-primary))",
                color: "rgb(var(--text-primary))",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-tertiary hover:text-theme-text-secondary transition-colors"
            >
              {showPassword ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeOff className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-sm text-red-400 font-medium">
              {errors.password}
            </p>
          )}
          <div className="mt-2 text-right">
            <a
              href="/forgot-password"
              className="text-sm text-sky-500 hover:text-sky-400 font-semibold transition-colors"
            >
              Forgot password?
            </a>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="remember"
            className="h-4 w-4 rounded border-2 text-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-colors"
            style={{
              borderColor: "rgb(var(--border-primary))",
            }}
          />
          <label
            htmlFor="remember"
            className="ml-2 text-sm text-theme-text-secondary font-inter"
          >
            Remember me
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className={cn(
            "w-full py-3.5 rounded-lg font-bold text-lg transition-all font-inter",
            isSuccess
              ? "bg-emerald-500 text-white"
              : "bg-sky-500 hover:bg-sky-600 text-white disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Signing in...
            </span>
          ) : isSuccess ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="h-5 w-5" />
              Success! Redirecting...
            </span>
          ) : (
            "Sign In"
          )}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div
              className="w-full border-t"
              style={{ borderColor: "rgb(var(--border-primary))" }}
            />
          </div>
          <div className="relative flex justify-center text-sm">
            <span
              className="px-2 text-theme-text-tertiary"
              style={{ backgroundColor: "rgb(var(--bg-secondary))" }}
            >
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading || isSubmitting || isSuccess}
          className="w-full py-3 rounded-lg font-semibold text-base transition-all flex items-center justify-center gap-3 border-2 hover:bg-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "rgb(var(--bg-primary))",
            borderColor: "rgb(var(--border-primary))",
            color: "rgb(var(--text-primary))",
          }}
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        {/* Security Notice */}
        <p className="text-xs text-theme-text-tertiary text-center leading-relaxed">
          Your credentials are encrypted and secure. By signing in, you agree to
          our terms of service.
        </p>
      </form>
    </div>
  );
}
