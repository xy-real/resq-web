export default function AuthCallbackError() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-lg w-full space-y-6 text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-2xl font-bold text-red-500 dark:text-red-400">
          Authentication Error
        </h1>
        <div className="space-y-3 text-left">
          <p className="text-gray-700 dark:text-gray-300">
            There was a problem completing your authentication. This could be
            due to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 text-sm">
            <li>Google OAuth credentials not configured in Supabase</li>
            <li>Incorrect redirect URI configuration</li>
            <li>Database permission issues</li>
            <li>Network connectivity problems</li>
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <a
            href="/signin"
            className="inline-block py-3 px-6 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors"
          >
            Back to Sign In
          </a>
          <a
            href="/signup"
            className="inline-block py-3 px-6 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Create Account
          </a>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 pt-4">
          If this problem persists, please contact system administrator.
        </p>
      </div>
    </div>
  );
}
