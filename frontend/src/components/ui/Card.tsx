interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated";
}

export default function Card({
  children,
  className,
  variant = "default",
}: CardProps) {
  // Base styles for all cards
  const baseStyles = "bg-white rounded-xl transition-all duration-200";

  // Variant styles
  const variantStyles = {
    default: "shadow-md hover:shadow-lg border border-gray-100",
    elevated: "shadow-xl border border-gray-200",
  };

  // Responsive padding (less on mobile, more on desktop)
  const paddingStyles = "p-6 sm:p-8";

  // Combine all styles
  const finalClassName = `${baseStyles} ${variantStyles[variant]} ${paddingStyles} ${className || ""}`;

  return <div className={finalClassName}>{children}</div>;
}
