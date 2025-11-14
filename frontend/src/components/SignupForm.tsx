"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { signupSchema, SignupFormData } from "@/types/schemas";
import { FormErrors } from "@/types/forms";
import { FcGoogle } from "react-icons/fc";
import { signupWithEmail, loginWithGoogle } from "@/lib/authService";

export default function SignupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formData, setFormData] = useState<SignupFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState("");

  const passwordStrength = {
    hasMinLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
  };

  const passwordsMatch =
    formData.password === formData.confirmPassword &&
    formData.confirmPassword.length > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const isFormValid = () => {
    try {
      signupSchema.parse(formData);
      return true;
    } catch {
      return false;
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setGeneralError("");

    const result = await signupWithEmail(formData.email, formData.password);

    if (result.success) {
      router.push("/login");
    } else {
      setGeneralError(result.error || "Signup failed");
    }

    setIsLoading(false);
  };

  // const handleGoogleSignup = async () => {
  //   setIsGoogleLoading(true);
  //   setGeneralError("");
  //
  //   const result = await loginWithGoogle();
  //
  //   if (result.success) {
  //     router.push("/dashboard");
  //   } else {
  //     setGeneralError(result.error || "Google signup failed");
  //   }
  //
  //   setIsGoogleLoading(false);
  // };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    setGeneralError("");

    try {
      const result = await loginWithGoogle();

      if (result.success) {
        router.push("/dashboard");
      } else {
        setGeneralError(result.error || "Google signup failed");
      }
    } catch (error: any) {
      console.log("SignupForm: Caught exception:", {
        message: error.message,
        code: error.code,
        fullError: error,
      });
      setGeneralError(error.message || "Google signup failed");
    }

    setIsGoogleLoading(false);
  };

  return (
    <form onSubmit={handleEmailSignup} className="space-y-4 sm:space-y-5">
      {generalError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {generalError}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        name="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleInputChange}
        error={errors.email}
        disabled={isLoading}
        required
      />

      <div>
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          showPasswordToggle
          disabled={isLoading}
          required
        />

        {formData.password && (
          <div className="mt-3 space-y-2">
            <p className="text-xs font-medium text-gray-700">
              Password requirements:
            </p>
            <div className="space-y-1.5">
              <StrengthItem
                met={passwordStrength.hasMinLength}
                text="At least 8 characters"
              />
              <StrengthItem
                met={passwordStrength.hasUppercase}
                text="One uppercase letter (A-Z)"
              />
              <StrengthItem
                met={passwordStrength.hasLowercase}
                text="One lowercase letter (a-z)"
              />
              <StrengthItem
                met={passwordStrength.hasNumber}
                text="One number (0-9)"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={errors.confirmPassword}
          showPasswordToggle
          disabled={isLoading}
          required
        />

        {formData.confirmPassword && (
          <div className="mt-2">
            {passwordsMatch ? (
              <p className="text-sm text-green-600 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Passwords match
              </p>
            ) : (
              <p className="text-sm text-red-600">Passwords do not match</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 pt-2">
        <input
          type="checkbox"
          id="acceptTerms"
          name="acceptTerms"
          checked={formData.acceptTerms}
          onChange={handleInputChange}
          className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <label htmlFor="acceptTerms" className="text-sm text-gray-700">
          I agree to the{" "}
          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
            Terms and Conditions
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
            Privacy Policy
          </a>
        </label>
      </div>
      {errors.acceptTerms && (
        <p className="text-sm text-red-600 -mt-2">{errors.acceptTerms}</p>
      )}

      <Button
        type="submit"
        fullWidth
        variant="primary"
        disabled={!isFormValid() || isLoading}
        isLoading={isLoading}
      >
        Create Account
      </Button>

      <div className="relative my-6 sm:my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or sign up with</span>
        </div>
      </div>

      <Button
        type="button"
        fullWidth
        variant="secondary"
        icon={<FcGoogle className="text-2xl" />}
        onClick={handleGoogleSignup}
        disabled={isLoading || isGoogleLoading}
        isLoading={isGoogleLoading}
      >
        Sign up with Google
      </Button>

      <p className="text-center text-sm text-gray-600 mt-6">
        Already have an account?{" "}
        <a
          href="/login"
          className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Login
        </a>
      </p>
    </form>
  );
}

interface StrengthItemProps {
  met: boolean;
  text: string;
}

function StrengthItem({ met, text }: StrengthItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-3 h-3 rounded-full ${
          met ? "bg-green-500" : "bg-gray-300"
        }`}
      />
      <span className={`text-xs ${met ? "text-green-700" : "text-gray-600"}`}>
        {text}
      </span>
    </div>
  );
}
