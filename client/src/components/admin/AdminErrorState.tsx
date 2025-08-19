import React from "react";
import { useAdminDashboardContext } from "@/shared/providers/AdminDashboardProvider";
import { Warning, ArrowClockwise } from "phosphor-react";

interface AdminErrorStateProps {
  error: any;
}

export function AdminErrorState({ error }: AdminErrorStateProps) {
  const { refetchPendingImages } = useAdminDashboardContext();

  const handleRetry = () => {
    refetchPendingImages();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        padding: "32px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "48px 32px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
          maxWidth: "500px",
        }}
      >
        <Warning size={64} style={{ color: "#ef4444", marginBottom: "24px" }} />

        <h2
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "16px",
            color: "#1f2937",
          }}
        >
          Failed to Load Images
        </h2>

        <p
          style={{
            color: "#6b7280",
            marginBottom: "24px",
            lineHeight: "1.5",
          }}
        >
          There was an error loading the pending images. This could be due to a network issue or
          server problem.
        </p>

        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "4px",
              padding: "12px",
              marginBottom: "24px",
              fontSize: "14px",
              color: "#dc2626",
              textAlign: "left",
            }}
          >
            <strong>Error details:</strong>
            <br />
            {error.message || error.toString()}
          </div>
        )}

        <button
          onClick={handleRetry}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: "500",
            cursor: "pointer",
            margin: "0 auto",
          }}
        >
          <ArrowClockwise size={16} />
          Try Again
        </button>
      </div>
    </div>
  );
}
