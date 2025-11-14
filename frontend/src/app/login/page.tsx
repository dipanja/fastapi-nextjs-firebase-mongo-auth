import Card from "@/components/ui/Card";
import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Login | Auth App",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex  justify-center p-4 sm:p-6 bg-gray-50 pt-8 sm:pt-12">
      <div className="w-full max-w-sm">
        <Card variant="default">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Login</h1>
            <p className="text-gray-600">
              Welcome back! Please login to your account.
            </p>
          </div>

          <LoginForm />
        </Card>
      </div>
    </main>
  );
}
