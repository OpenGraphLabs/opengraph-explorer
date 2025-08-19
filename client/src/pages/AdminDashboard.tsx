import React from "react";
import {
  AdminDashboardProvider,
  useAdminDashboardContext,
} from "@/shared/providers/AdminDashboardProvider";
import {
  AdminLoginForm,
  AdminDashboardHeader,
  AdminImageGrid,
  AdminDashboardPagination,
  AdminLoadingState,
  AdminErrorState,
} from "@/components/admin";

function AdminDashboardContent() {
  const { isAuthenticated, isLoading, error, pendingImages } = useAdminDashboardContext();

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <AdminLoginForm />;
  }

  // Show loading state
  if (isLoading) {
    return <AdminLoadingState />;
  }

  // Show error state
  if (error) {
    return <AdminErrorState error={error} />;
  }

  return (
    <div
      style={{
        padding: "24px",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      <AdminDashboardHeader />

      {pendingImages.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px",
            color: "#6b7280",
          }}
        >
          <h3>No pending images to review</h3>
          <p>All images have been processed.</p>
        </div>
      ) : (
        <>
          <AdminImageGrid />
          <AdminDashboardPagination />
        </>
      )}
    </div>
  );
}

export function AdminDashboard() {
  return (
    <AdminDashboardProvider>
      <AdminDashboardContent />
    </AdminDashboardProvider>
  );
}
