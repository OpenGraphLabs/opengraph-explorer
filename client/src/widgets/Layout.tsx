import React from "react";
import { Box } from "@radix-ui/themes";
import { Header } from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <Box
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 16px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      
      {/* Main Content */}
      <Box style={{ flex: 1, padding: "24px 0" }}>
        {children}
      </Box>
    </Box>
  );
} 