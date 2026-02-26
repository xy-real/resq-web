export default function AuthCallbackError() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4 text-center">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-2xl font-bold text-red-500">
          Authentication Error
        </h1>
        <p className="text-gray-600">
          There was a problem authenticating your account. Please try signing in
          again.
        </p>
        <a
          href="/signin"
          className="inline-block py-3 px-6 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors"
        >
          Back to Sign In
        </a>
      </div>
    </div>
  );
}
