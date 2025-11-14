"use client";

import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showPasswordToggle?: boolean;
}

export default function Input({
  label,
  error,
  helperText,
  showPasswordToggle = false,
  type = "text",
  disabled,
  className,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Determine input type based on password visibility
  const inputType = showPasswordToggle && showPassword ? "text" : type;

  // Base input styles
  const baseInputStyles =
    "w-full px-4 py-3 sm:py-2.5 text-stone-800 sm:text-sm border rounded-lg transition-all duration-200";

  // Input state styles
  const stateStyles = error
    ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500 bg-red-50"
    : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white hover:border-gray-400";

  // Disabled styles
  const disabledStyles = disabled
    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
    : "";

  // Combine all input styles
  const finalInputClassName = `${baseInputStyles} ${stateStyles} ${disabledStyles} ${className || ""}`;

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Input container (for password toggle) */}
      <div className="relative">
        <input
          type={inputType}
          disabled={disabled}
          className={finalInputClassName}
          {...props}
        />

        {/* Password toggle button */}
        {showPasswordToggle && type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors sm:top-1/2"
            tabIndex={-1}
            disabled={disabled}
          >
            {showPassword ? (
              // Eye open icon
              <FaEye className="w-5 h-5" />
            ) : (
              // Eye closed icon
              <FaEyeSlash className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 mt-2 font-medium">{error}</p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p className="text-sm text-gray-500 mt-2">{helperText}</p>
      )}
    </div>
  );
}
