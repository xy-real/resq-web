"use client";

import { useState, FormEvent } from "react";
import { User, Mail, Loader2, Check, Eye, EyeOff, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { signUp } from "@/lib/auth";
import { toast } from "sonner";

interface FormData {
  surname: string;
  firstName: string;
  middleInitial: string;
  nameExtension: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  surname?: string;
  firstName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function SignUpForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    surname: "",
    firstName: "",
    middleInitial: "",
    nameExtension: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.surname.trim()) {
      newErrors.surname = "Surname is required";
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

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
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      // Construct full name
      const fullName = [
        formData.surname,
        formData.firstName,
        formData.middleInitial,
        formData.nameExtension,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      // Sign up with Supabase
      const { user, error, message } = await signUp({
        email: formData.email,
        password: formData.password,
        name: fullName,
        isAdmin: true,
      });

      if (error) {
        // Handle specific error types
        if (error.message.includes("already registered")) {
          setErrors({ email: "This email is already registered" });
          toast.error("Email already exists", {
            description: "Please use a different email or sign in instead.",
          });
        } else {
          setErrors({ general: error.message });
          toast.error("Registration failed", {
            description: error.message,
          });
        }
        return;
      }

      // Success! (either with immediate login or email verification required)
      setIsSuccess(true);
      
      if (message) {
        // Email verification required
        toast.success("Registration successful!", {
          description: message,
          duration: 5000,
        });
      } else {
        // Immediate login (no email verification)
        toast.success("Registration successful!", {
          description: "You are now logged in.",
        });
      }

      // Redirect to sign in page after 2 seconds
      setTimeout(() => {
        router.push("/signin?registered=true");
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error);
      setErrors({
        general: "An unexpected error occurred. Please try again.",
      });
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
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
        {errors.general && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400 font-medium">{errors.general}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="surname"
              className="block text-sm font-semibold text-theme-text-secondary mb-2 font-inter"
            >
              Surname
              <span className="text-red-400 ml-1">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-theme-text-tertiary" />
              <input
                type="text"
                id="surname"
                value={formData.surname}
                onChange={(e) => handleInputChange("surname", e.target.value)}
                placeholder="e.g. Dela Cruz"
                className={cn(
                  "w-full pl-11 pr-4 py-3 rounded-lg text-base transition-all border-2",
                  errors.surname
                    ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                    : "focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20",
                )}
                style={{
                  backgroundColor: "rgb(var(--bg-primary))",
                  borderColor: errors.surname
                    ? undefined
                    : "rgb(var(--border-primary))",
                  color: "rgb(var(--text-primary))",
                }}
              />
            </div>
            {errors.surname && (
              <p className="mt-1.5 text-sm text-red-400 font-medium">
                {errors.surname}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-semibold text-theme-text-secondary mb-2 font-inter"
            >
              First Name
              <span className="text-red-400 ml-1">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              placeholder="e.g. Juan"
              className={cn(
                "w-full px-4 py-3 rounded-lg text-base transition-all border-2",
                errors.firstName
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20",
              )}
              style={{
                backgroundColor: "rgb(var(--bg-primary))",
                borderColor: errors.firstName
                  ? undefined
                  : "rgb(var(--border-primary))",
                color: "rgb(var(--text-primary))",
              }}
            />
            {errors.firstName && (
              <p className="mt-1.5 text-sm text-red-400 font-medium">
                {errors.firstName}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="middleInitial"
              className="block text-sm font-semibold text-theme-text-secondary mb-2 font-inter"
            >
              M.I. (Optional)
            </label>
            <input
              type="text"
              id="middleInitial"
              value={formData.middleInitial}
              onChange={(e) =>
                handleInputChange(
                  "middleInitial",
                  e.target.value.toUpperCase().slice(0, 1),
                )
              }
              placeholder="e.g. A"
              maxLength={1}
              className="w-full px-4 py-3 rounded-lg text-base transition-all border-2 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-semibold"
              style={{
                backgroundColor: "rgb(var(--bg-primary))",
                borderColor: "rgb(var(--border-primary))",
                color: "rgb(var(--text-primary))",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="nameExtension"
              className="block text-sm font-semibold text-theme-text-secondary mb-2 font-inter"
            >
              Extension (Optional)
            </label>
            <input
              type="text"
              id="nameExtension"
              value={formData.nameExtension}
              onChange={(e) =>
                handleInputChange("nameExtension", e.target.value)
              }
              placeholder="e.g. Jr., Sr., II, III"
              maxLength={10}
              className="w-full px-4 py-3 rounded-lg text-base transition-all border-2 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              style={{
                backgroundColor: "rgb(var(--bg-primary))",
                borderColor: "rgb(var(--border-primary))",
                color: "rgb(var(--text-primary))",
              }}
            />
          </div>
        </div>

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
              placeholder="e.g. admin@vsu.edu.ph"
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
              placeholder="••••••••"
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
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-base font-semibold text-theme-text-primary mb-2 font-inter"
          >
            Confirm Password
            <span className="text-red-400 ml-1">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-theme-text-tertiary" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              placeholder="••••••••"
              className={cn(
                "w-full pl-11 pr-12 py-3 rounded-lg text-base transition-all border-2",
                errors.confirmPassword
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20",
              )}
              style={{
                backgroundColor: "rgb(var(--bg-primary))",
                borderColor: errors.confirmPassword
                  ? undefined
                  : "rgb(var(--border-primary))",
                color: "rgb(var(--text-primary))",
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-theme-text-tertiary hover:text-theme-text-secondary transition-colors"
            >
              {showConfirmPassword ? (
                <Eye className="h-5 w-5" />
              ) : (
                <EyeOff className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-sm text-red-400 font-medium">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isSuccess}
          className={cn(
            "w-full py-3.5 rounded-lg font-bold text-lg transition-all",
            isSuccess
              ? "bg-emerald-500 text-white"
              : "bg-sky-500 hover:bg-sky-600 text-white disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Registering...
            </span>
          ) : isSuccess ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="h-5 w-5" />
              Registration Successful!
            </span>
          ) : (
            "Register Admin Account"
          )}
        </button>

        <p className="text-xs text-theme-text-tertiary text-center leading-relaxed">
          By registering, you agree to be an authorized administrator for VSU
          Disaster Response System.
        </p>
      </form>
    </div>
  );
}
