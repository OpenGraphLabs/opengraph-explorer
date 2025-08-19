import React from "react";
import { useAdminDashboardContext } from "@/shared/providers/AdminDashboardProvider";
import { AdminImageCard } from "./AdminImageCard";

export function AdminImageGrid() {
  const { pendingImages } = useAdminDashboardContext();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "20px",
        marginBottom: "32px",
      }}
    >
      {pendingImages.map(image => (
        <AdminImageCard key={image.id} image={image} />
      ))}
    </div>
  );
}
