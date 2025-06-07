import React from "react";
import { Box } from "@/shared/ui/design-system/components";
import { Header } from "@/widgets/layout/AppLayout";
import { useTheme, fontFamilies } from "@/shared/ui/design-system";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { theme } = useTheme();

  return (
    <Box
      style={{
        minHeight: "100vh",
        backgroundColor: theme.colors.background.primary,
        color: theme.colors.text.primary,
        fontFamily: fontFamilies.sans.join(", "),
      }}
    >
      <Box
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: `0 ${theme.spacing.semantic.container.md}`,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />
        <Box
          style={{
            flex: 1,
            paddingTop: theme.spacing.semantic.layout.md,
            paddingBottom: theme.spacing.semantic.layout.lg,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
