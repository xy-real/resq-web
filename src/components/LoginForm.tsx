"use client";

import { useState, FormEvent } from "react";
import { Mail, Lock, Loader2, Check, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginForm() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // TODO: Replace with actual API call
      console.log("Login submitted:", formData);

      setIsSuccess(true);
      // Redirect after 1 second
      setTimeout(() => {
        // Redirect to dashboard or appropriate page
        window.location.href = "/admin/dashboard";
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
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

        {/* Security Notice */}
        <p className="text-xs text-theme-text-tertiary text-center leading-relaxed">
          Your credentials are encrypted and secure. By signing in, you agree to
          our terms of service.
        </p>
      </form>
    </div>
  );
}
