
// Form validation error types
export interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  acceptTerms?: string;
  general?: string;
}

// Component prop types
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showPasswordToggle?: boolean;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
  fullWidth?: boolean;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated";
