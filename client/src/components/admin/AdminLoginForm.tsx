import React, { useState } from "react";
import { useAdminDashboardContext } from "@/shared/providers/AdminDashboardProvider";

export function AdminLoginForm() {
  const { handleLogin } = useAdminDashboardContext();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);

    const result = await handleLogin(credentials);

    if (!result.success) {
      setError(result.error || "Login failed");
    }

    setIsLoggingIn(false);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "32px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <h2 style={{ marginBottom: "24px", textAlign: "center" }}>Admin Dashboard Login</h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label
              htmlFor="username"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
              }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={credentials.username}
              onChange={e => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={credentials.password}
              onChange={e => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                fontSize: "14px",
              }}
              required
            />
          </div>

          {error && (
            <div
              style={{
                color: "#ef4444",
                marginBottom: "16px",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: isLoggingIn ? "not-allowed" : "pointer",
              opacity: isLoggingIn ? 0.6 : 1,
            }}
          >
            {isLoggingIn ? "Logging in..." : "Login"}
          </button>
        </form>

        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            backgroundColor: "#f3f4f6",
            borderRadius: "4px",
            fontSize: "12px",
            color: "#6b7280",
          }}
        >
          <strong>OpenGraph Internal Use Only</strong>
          <br />
          This admin dashboard is for authorized OpenGraph staff only.
        </div>
      </div>
    </div>
  );
}
