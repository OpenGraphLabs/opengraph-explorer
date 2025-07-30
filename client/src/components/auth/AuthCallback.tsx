import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "@/shared/ui/design-system/components";

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // This component is now used for server redirects
        // Check if we have error or success parameters from server
        const urlParams = new URLSearchParams(window.location.search);
        const errorMessage = urlParams.get("message");

        if (errorMessage) {
          throw new Error(decodeURIComponent(errorMessage));
        }

        // If no error, show loading while server processes OAuth
        // Server will redirect to /auth/success or /auth/error
        console.log("Waiting for server OAuth processing...");
      } catch (error) {
        console.error("Auth callback error:", error);
        setError(error instanceof Error ? error.message : "Authentication failed");
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
}
