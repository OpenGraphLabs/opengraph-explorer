import React, { useState } from "react";
import { useAdminDashboardContext } from "@/shared/providers/AdminDashboardProvider";
import { CheckCircle, XCircle, Calendar, Image as ImageIcon, Spinner } from "phosphor-react";

interface AdminImageCardProps {
  image: {
    id: number;
    file_name: string;
    image_url: string;
    width: number;
    height: number;
    created_at: string;
    task_id?: string;
  };
}

export function AdminImageCard({ image }: AdminImageCardProps) {
  const { 
    handleApproveImage, 
    handleRejectImage,
    handleImageSelect,
    selectedImages,
    processingImages
  } = useAdminDashboardContext();
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const isSelected = selectedImages.has(image.id);
  const isProcessing = processingImages.has(image.id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleApprove = async () => {
    await handleApproveImage(image.id);
  };

  const handleReject = async () => {
    await handleRejectImage(image.id);
  };

  const handleSelect = () => {
    handleImageSelect(image.id, !isSelected);
  };

  return (
    <div 
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: isSelected ? "0 0 0 2px #3b82f6" : "0 2px 4px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        transition: "all 0.2s ease",
        opacity: isProcessing ? 0.6 : 1,
        position: "relative"
      }}
    >
      {/* Selection Checkbox */}
      <div 
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          zIndex: 10
        }}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelect}
          disabled={isProcessing}
          style={{
            width: "18px",
            height: "18px",
            cursor: isProcessing ? "not-allowed" : "pointer"
          }}
        />
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div 
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 20,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "50%",
            padding: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <Spinner size={24} className="animate-spin" />
        </div>
      )}

      {/* Image */}
      <div 
        style={{
          position: "relative",
          aspectRatio: "16 / 9",
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer"
        }}
        onClick={() => setShowDetails(!showDetails)}
      >
        {!imageLoaded && !imageError && (
          <ImageIcon size={48} color="#9ca3af" />
        )}
        
        {imageError ? (
          <div style={{ textAlign: "center", color: "#6b7280" }}>
            <ImageIcon size={48} />
            <p style={{ margin: "8px 0 0 0", fontSize: "12px" }}>Failed to load</p>
          </div>
        ) : (
          <img
            src={image.image_url}
            alt={image.file_name}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: imageLoaded ? "block" : "none"
            }}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "16px" }}>
        {/* File Name */}
        <h3 
          style={{
            margin: "0 0 8px 0",
            fontSize: "16px",
            fontWeight: "600",
            wordBreak: "break-word"
          }}
        >
          {image.file_name}
        </h3>

        {/* Basic Info */}
        <div style={{ marginBottom: "12px", fontSize: "14px", color: "#6b7280" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
            <Calendar size={14} />
            {formatDate(image.created_at)}
          </div>
          <div>
            Dimensions: {image.width} × {image.height}
          </div>
          {image.task_id && (
            <div style={{ marginTop: "4px" }}>
              Task: {image.task_id}
            </div>
          )}
        </div>

        {/* Details (expandable) */}
        {showDetails && (
          <div 
            style={{
              padding: "12px",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px",
              marginBottom: "12px",
              fontSize: "12px",
              color: "#4b5563"
            }}
          >
            <div><strong>ID:</strong> {image.id}</div>
            <div><strong>URL:</strong> <span style={{ wordBreak: "break-all" }}>{image.image_url}</span></div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "10px",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: isProcessing ? "not-allowed" : "pointer",
              opacity: isProcessing ? 0.6 : 1
            }}
          >
            <CheckCircle size={16} />
            Approve
          </button>
          
          <button
            onClick={handleReject}
            disabled={isProcessing}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "10px",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: isProcessing ? "not-allowed" : "pointer",
              opacity: isProcessing ? 0.6 : 1
            }}
          >
            <XCircle size={16} />
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}