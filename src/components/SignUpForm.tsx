"use client";

import { useState, FormEvent } from "react";
import {
  User,
  Mail,
  Phone,
  IdCard,
  Loader2,
  Check,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface FormData {
  studentId: string;
  surname: string;
  firstName: string;
  middleInitial: string;
  nameExtension: string;
  email: string;
  contactNumber: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  studentId?: string;
  surname?: string;
  firstName?: string;
  email?: string;
  contactNumber?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignUpForm() {
  const [formData, setFormData] = useState<FormData>({
    studentId: "",
    surname: "",
    firstName: "",
    middleInitial: "",
    nameExtension: "",
    email: "",
    contactNumber: "",
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

    // Student ID validation (VSU-YYYY-XXX format)
    const studentIdRegex = /^VSU-\d{4}-\d{3}$/;
    if (!formData.studentId) {
      newErrors.studentId = "Student ID is required";
    } else if (!studentIdRegex.test(formData.studentId)) {
      newErrors.studentId = "Format: VSU-YYYY-XXX (e.g., VSU-2024-001)";
    }

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

    // Contact number validation (Philippines format)
    const phoneRegex = /^(09|\+639)\d{9}$/;
    if (!formData.contactNumber) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!phoneRegex.test(formData.contactNumber.replace(/[\s-]/g, ""))) {
      newErrors.contactNumber = "Format: 09XXXXXXXXX or +639XXXXXXXXX";
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

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // TODO: Replace with actual API call
      console.log("Form submitted:", formData);

      setIsSuccess(true);
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          studentId: "",
          surname: "",
          firstName: "",
          middleInitial: "",
          nameExtension: "",
          email: "",
          contactNumber: "",
          password: "",
          confirmPassword: "",
        });
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Submission error:", error);
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
        {/* Student ID */}
        <div>
          <label
            htmlFor="studentId"
            className="block text-base font-semibold text-theme-text-primary mb-2 font-inter"
          >
            Student ID
            <span className="text-red-400 ml-1">*</span>
          </label>
          <div className="relative">
            <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-theme-text-tertiary" />
            <input
              type="text"
              id="studentId"
              value={formData.studentId}
              onChange={(e) =>
                handleInputChange("studentId", e.target.value.toUpperCase())
              }
              placeholder="e.g. VSU-2024-001"
              className={cn(
                "w-full pl-11 pr-4 py-3 rounded-lg text-base transition-all border-2 font-mono",
                errors.studentId
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20",
              )}
              style={{
                backgroundColor: "rgb(var(--bg-primary))",
                borderColor: errors.studentId
                  ? undefined
                  : "rgb(var(--border-primary))",
                color: "rgb(var(--text-primary))",
              }}
            />
          </div>
          {errors.studentId && (
            <p className="mt-1.5 text-sm text-red-400 font-medium">
              {errors.studentId}
            </p>
          )}
        </div>

        {/* Name Section */}
        <div className="space-y-4">
          {/* Surname & First Name */}
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

          {/* Middle Initial & Extension */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="middleInitial"
                className="block text-sm font-semibold text-theme-text-secondary mb-2 font-inter"
              >
                M.I.
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
                className="w-full px-4 py-3 rounded-lg text-base transition-all border-2 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-inter"
                style={{
                  backgroundColor: "rgb(var(--bg-primary))",
                  borderColor: "rgb(var(--border-primary))",
                  color: "rgb(var(--text-primary))",
                }}
              />
            </div>
          </div>
        </div>

        {/* Contact Number */}
        <div>
          <label
            htmlFor="contactNumber"
            className="block text-base font-semibold text-theme-text-primary mb-2 font-inter"
          >
            Contact Number
            <span className="text-red-400 ml-1">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-theme-text-tertiary" />
            <input
              type="tel"
              id="contactNumber"
              value={formData.contactNumber}
              onChange={(e) =>
                handleInputChange("contactNumber", e.target.value)
              }
              placeholder="e.g. 09XX XXX XXXX"
              className={cn(
                "w-full pl-11 pr-4 py-3 rounded-lg text-base transition-all border-2 font-mono",
                errors.contactNumber
                  ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  : "focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20",
              )}
              style={{
                backgroundColor: "rgb(var(--bg-primary))",
                borderColor: errors.contactNumber
                  ? undefined
                  : "rgb(var(--border-primary))",
                color: "rgb(var(--text-primary))",
              }}
            />
          </div>
          {errors.contactNumber && (
            <p className="mt-1.5 text-sm text-red-400 font-medium">
              {errors.contactNumber}
            </p>
          )}
        </div>

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
        </div>

        {/* Confirm Password */}
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
              placeholder="e.g. ••••••••"
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
              Registering...
            </span>
          ) : isSuccess ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="h-5 w-5" />
              Registration Successful!
            </span>
          ) : (
            "Register"
          )}
        </button>

        {/* Privacy Notice */}
        <p className="text-xs text-theme-text-tertiary text-center leading-relaxed">
          By registering, you agree to receive emergency alerts and updates from
          VSU Disaster Response System. Your information will be kept
          confidential.
        </p>
      </form>
    </div>
  );
}
