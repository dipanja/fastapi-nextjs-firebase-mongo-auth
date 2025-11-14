import Card from "@/components/ui/Card";

export const metadata = {
  title: "Dashboard | Auth App",
  description: "Your dashboard home page",
};

export default async function DashboardPage() {
  // Mock user data for now (replace with session data)
  const user = {
    email: "user@example.com",
    name: "User",
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome section */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Welcome, {user.email.split("@")[0]}! 👋
        </h1>
        <p className="text-gray-600">
          You have successfully logged in to your account.
        </p>
      </div>

      {/* Quick stats/info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1 - Account Info */}
        <Card variant="default">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Account Email
              </p>
              <p className="text-lg font-semibold text-gray-900">
                {user.email}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
        </Card>

        {/* Card 2 - Status */}
        <Card variant="default">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Account Status
              </p>
              <p className="text-lg font-semibold text-gray-900">Active</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>

        {/* Card 3 - Last Login (placeholder) */}
        <Card variant="default">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                Last Login
              </p>
              <p className="text-lg font-semibold text-gray-900">Today</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Main content section */}
      <Card variant="elevated">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Getting Started
            </h2>
            <p className="text-gray-600 mt-1">
              Here are some next steps you can take:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {/* Step 1 */}
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Update Your Profile
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Add your profile information and picture.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-semibold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Explore Features
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Check out the sidebar to explore all available features.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-semibold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Configure Settings
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Customize your preferences in the settings page.
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-orange-600 font-semibold">4</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Get Help</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Need help? Contact our support team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
