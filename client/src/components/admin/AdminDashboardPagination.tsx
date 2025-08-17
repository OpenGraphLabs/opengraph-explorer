import React from "react";
import { useAdminDashboardContext } from "@/shared/providers/AdminDashboardProvider";
import { CaretLeft, CaretRight } from "phosphor-react";

export function AdminDashboardPagination() {
  const { 
    currentPage, 
    totalPages, 
    totalImages,
    handlePageChange,
    pendingImages
  } = useAdminDashboardContext();

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);
      
      if (currentPage > 4) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }
      
      // Show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = (currentPage - 1) * 25 + 1;
  const endItem = Math.min(currentPage * 25, totalImages);

  return (
    <div 
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }}
    >
      {/* Info */}
      <div style={{ color: "#6b7280", fontSize: "14px" }}>
        Showing {startItem}-{endItem} of {totalImages} images
      </div>

      {/* Pagination Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "8px 12px",
            backgroundColor: currentPage === 1 ? "#f3f4f6" : "white",
            color: currentPage === 1 ? "#9ca3af" : "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            cursor: currentPage === 1 ? "not-allowed" : "pointer",
            fontSize: "14px"
          }}
        >
          <CaretLeft size={16} />
          Previous
        </button>

        {/* Page Numbers */}
        <div style={{ display: "flex", gap: "4px" }}>
          {pageNumbers.map((page, index) => (
            page === '...' ? (
              <span 
                key={`ellipsis-${index}`}
                style={{
                  padding: "8px 4px",
                  color: "#9ca3af",
                  fontSize: "14px"
                }}
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageChange(page as number)}
                style={{
                  minWidth: "40px",
                  height: "40px",
                  padding: "0",
                  backgroundColor: currentPage === page ? "#3b82f6" : "white",
                  color: currentPage === page ? "white" : "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: currentPage === page ? "600" : "400"
                }}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            padding: "8px 12px",
            backgroundColor: currentPage === totalPages ? "#f3f4f6" : "white",
            color: currentPage === totalPages ? "#9ca3af" : "#374151",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            fontSize: "14px"
          }}
        >
          Next
          <CaretRight size={16} />
        </button>
      </div>
    </div>
  );
}