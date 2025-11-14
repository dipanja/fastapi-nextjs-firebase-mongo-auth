"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { LoginFormData, loginSchema } from "@/types/schemas";
import { FormErrors } from "@/types/forms";
import { FcGoogle } from "react-icons/fc";
import { loginWithEmail, loginWithGoogle } from "@/lib/authService";
import { useAuth } from "@/context/AuthContext";

export default function LoginForm() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = () => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error: any) {
      const newErrors: FormErrors = {};
      error.errors.forEach((err: any) => {
        const field = err.path[0] as keyof FormErrors;
        newErrors[field] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setGeneralError("");

    const result = await loginWithEmail(formData.email, formData.password);

    if (result.success) {
      await refreshUser();
      router.push("/dashboard");
    } else {
      setGeneralError(result.error || "Login failed");
    }

    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setGeneralError("");

    try {
      const result = await loginWithGoogle();

      if (result.success) {
        await refreshUser();
        router.push("/dashboard");
      } else {
        setGeneralError(result.error || "Google login failed");
      }
    } catch (error: any) {
      console.log(" Caught exception:", {
        message: error.message,
        code: error.code,
        fullError: error,
      });
      setGeneralError(error.message);
    }

    setIsGoogleLoading(false);
  };

  return (
    <form onSubmit={handleEmailLogin} className="space-y-4 sm:space-y-5">
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

      <Input
        label="Password"
        type="password"
        name="password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={handleInputChange}
        error={errors.password}
        showPasswordToggle
        disabled={isLoading}
        required
      />

      <Button
        type="submit"
        isLoading={isLoading}
        fullWidth
        variant="primary"
        disabled={isLoading || isGoogleLoading}
      >
        Login
      </Button>

      <div className="relative my-6 sm:my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        isLoading={isGoogleLoading}
        fullWidth
        variant="secondary"
        icon={<FcGoogle className="text-2xl" />}
        onClick={handleGoogleLogin}
        disabled={isLoading || isGoogleLoading}
      >
        Continue with Google
      </Button>

      <p className="text-center text-sm text-gray-600 mt-6">
        Don't have an account?{" "}
        <a
          href="/signup"
          className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Sign up
        </a>
      </p>
    </form>
  );
}
