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
          maxWidth: "1400px",
          margin: "0 auto",
          padding: `0 ${theme.spacing.base[4]}`,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />
        <Box
          style={{
            flex: 1,
            paddingTop: theme.spacing.base[4],
            paddingBottom: theme.spacing.base[6],
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
