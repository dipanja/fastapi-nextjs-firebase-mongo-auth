"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  children,
  variant = "primary",
  isLoading = false,
  fullWidth = false,
  icon,
  disabled,
  className,
  ...props
}: ButtonProps) {
  // Base styles for all buttons
  const baseStyles =
    "font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 h-12 sm:h-11";

  // Variant styles
  const variantStyles = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400",
    secondary:
      "bg-stone-300 text-gray-900 hover:bg-gray-300 active:bg-gray-400 disabled:bg-gray-100",
    danger:
      "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 disabled:bg-red-400",
  };

  // Width styles
  const widthStyles = fullWidth ? "w-full" : "w-full sm:w-auto px-8";

  // Disabled state
  const isDisabled = disabled || isLoading;

  // Combine all styles
  const finalClassName = `${baseStyles} ${variantStyles[variant]} ${widthStyles} ${
    isDisabled ? "cursor-not-allowed" : "cursor-pointer"
  } ${className || ""}`;

  return (
    <button disabled={isDisabled} className={finalClassName} {...props}>
      {/* Loading spinner */}
      {isLoading && (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {/* Icon */}
      {icon && !isLoading && <span>{icon}</span>}

      {/* Button text */}
      <span>{children}</span>
    </button>
  );
}
