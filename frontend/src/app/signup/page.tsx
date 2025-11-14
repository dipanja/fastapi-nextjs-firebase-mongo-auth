import Card from "@/components/ui/Card";
import SignupForm from "@/components/SignupForm";

export const metadata = {
  title: "Sign Up | Auth App",
  description: "Create a new account",
};

export default function SignupPage() {
  return (
    <main className="min-h-screen flex  justify-center p-4 sm:p-6 bg-gray-50 pt-8 sm:pt-12">
      <div className="w-full max-w-sm">
        <Card variant="default">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">
              Sign up to get started with our application.
            </p>
          </div>

          <SignupForm />
        </Card>
      </div>
    </main>
  );
}
