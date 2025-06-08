import { useState, useEffect } from "react";
import { Grid, Flex, Text, Spinner, Box, Button } from "@radix-ui/themes";
import { MagnifyingGlassIcon, ExclamationTriangleIcon, ReloadIcon } from "@radix-ui/react-icons";
import { Link } from "react-router-dom";
import { Model } from "../types";
import { ModelCard } from "@/features/model";

interface ModelListProps {
  models: Model[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  onModelClick: (model: Model) => void;
}

export function ModelList({ models, loading, error, onRetry, onModelClick }: ModelListProps) {
  if (loading) {
    return (
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "300px",
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      >
        <Spinner
          size="3"
          style={{
            color: "#6b7280",
            marginBottom: "12px",
          }}
        />
        <Text
          style={{
            fontSize: "14px",
            color: "#6b7280",
            fontWeight: "500",
          }}
        >
          Loading models...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "300px",
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          padding: "32px 24px",
        }}
      >
        <Box
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "50%",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <ExclamationTriangleIcon width="24" height="24" style={{ color: "#dc2626" }} />
        </Box>

        <Text
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#111827",
            marginBottom: "6px",
          }}
        >
          Unable to Load Models
        </Text>

        <Text
          style={{
            fontSize: "13px",
            color: "#6b7280",
            textAlign: "center",
            marginBottom: "20px",
            maxWidth: "350px",
            lineHeight: "1.4",
          }}
        >
          {error || "There was an error loading the models. Please try again."}
        </Text>

        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              backgroundColor: "#111827",
              color: "white",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = "#1f2937";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = "#111827";
            }}
          >
            <ReloadIcon width="14" height="14" />
            Try Again
          </button>
        )}
      </Box>
    );
  }

  if (models.length === 0) {
    return (
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "300px",
          backgroundColor: "white",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          padding: "32px 24px",
        }}
      >
        <Box
          style={{
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "50%",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "16px",
          }}
        >
          <MagnifyingGlassIcon width="24" height="24" style={{ color: "#9ca3af" }} />
        </Box>

        <Text
          style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#111827",
            marginBottom: "6px",
          }}
        >
          No Models Found
        </Text>

        <Text
          style={{
            fontSize: "13px",
            color: "#6b7280",
            textAlign: "center",
            marginBottom: "20px",
            maxWidth: "350px",
            lineHeight: "1.4",
          }}
        >
          No models match your current search criteria. Try adjusting your filters or search terms.
        </Text>

        <Link
          to="/upload"
          style={{
            backgroundColor: "#111827",
            color: "white",
            textDecoration: "none",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.backgroundColor = "#1f2937";
          }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
            e.currentTarget.style.backgroundColor = "#111827";
          }}
        >
          Deploy Your First Model
        </Link>
      </Box>
    );
  }

  return (
    <Box>
      {/* 3-Column Grid Layout */}
      <Grid
        columns={{ initial: "1", sm: "2", md: "3" }}
        gap="16px"
        style={{
          marginBottom: "32px",
        }}
      >
        {models.map(model => (
          <ModelCard key={model.id} model={model} onClick={() => onModelClick(model)} />
        ))}
      </Grid>
    </Box>
  );
}
