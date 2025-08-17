import React from "react";
import { Spinner } from "phosphor-react";

export function AdminLoadingState() {
  return (
    <div 
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
        gap: "16px"
      }}
    >
      <Spinner size={48} className="animate-spin" style={{ color: "#3b82f6" }} />
      <div style={{ color: "#6b7280", fontSize: "16px" }}>
        Loading pending images...
      </div>
    </div>
  );
}