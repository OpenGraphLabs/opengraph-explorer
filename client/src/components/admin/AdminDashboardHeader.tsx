import React from "react";
import { useAdminDashboardContext } from "@/shared/providers/AdminDashboardProvider";
import { MagnifyingGlass, SignOut, CheckCircle, XCircle } from "phosphor-react";

export function AdminDashboardHeader() {
  const {
    handleLogout,
    totalImages,
    searchQuery,
    handleSearchChange,
    selectedImages,
    handleBulkApprove,
    handleBulkReject,
    handleSelectAll,
    handleDeselectAll,
    pendingImages,
    processingImages,
  } = useAdminDashboardContext();

  const hasSelectedImages = selectedImages.size > 0;
  const isProcessing = Array.from(selectedImages).some(id => processingImages.has(id));

  return (
    <div style={{ marginBottom: "24px" }}>
      {/* Title and Logout */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: "0 0 8px 0" }}>
            Admin Dashboard
          </h1>
          <p style={{ color: "#6b7280", margin: 0 }}>
            Review and approve pending images ({totalImages} total)
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            backgroundColor: "#f3f4f6",
            color: "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          <SignOut size={16} />
          Logout
        </button>
      </div>

      {/* Search and Bulk Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          padding: "16px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
          <MagnifyingGlass
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
            }}
          />
          <input
            type="text"
            placeholder="Search by filename..."
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            style={{
              width: "100%",
              paddingLeft: "40px",
              paddingRight: "12px",
              paddingTop: "10px",
              paddingBottom: "10px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
        </div>

        {/* Selection Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={
              selectedImages.size === pendingImages.length ? handleDeselectAll : handleSelectAll
            }
            style={{
              padding: "8px 12px",
              backgroundColor: "transparent",
              color: "#3b82f6",
              border: "1px solid #3b82f6",
              borderRadius: "4px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            {selectedImages.size === pendingImages.length ? "Deselect All" : "Select All"}
          </button>

          {hasSelectedImages && (
            <span style={{ fontSize: "14px", color: "#6b7280" }}>
              {selectedImages.size} selected
            </span>
          )}
        </div>

        {/* Bulk Actions */}
        {hasSelectedImages && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleBulkApprove}
              disabled={isProcessing}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "14px",
                cursor: isProcessing ? "not-allowed" : "pointer",
                opacity: isProcessing ? 0.6 : 1,
              }}
            >
              <CheckCircle size={16} />
              Approve ({selectedImages.size})
            </button>

            <button
              onClick={handleBulkReject}
              disabled={isProcessing}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "14px",
                cursor: isProcessing ? "not-allowed" : "pointer",
                opacity: isProcessing ? 0.6 : 1,
              }}
            >
              <XCircle size={16} />
              Reject ({selectedImages.size})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
