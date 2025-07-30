import { Box, Text } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { User, UploadSimple, Circle, Lightning } from "phosphor-react";

export function useProfileSidebarConfig() {
  const { theme } = useTheme();

  return {
    section: {
      icon: <User size={16} style={{ color: theme.colors.text.inverse }} />,
      title: "Profile",
      actionButton: {
        text: "Deploy Model",
        icon: <UploadSimple size={14} weight="bold" />,
        href: "/models/upload",
      },
    },
    stats: [
      {
        icon: <Circle size={6} weight="fill" style={{ color: theme.colors.status.success }} />,
        text: "Wallet Connected",
      },
      {
        icon: <Lightning size={10} style={{ color: theme.colors.interactive.accent }} />,
        text: "Sui Network",
      },
    ],
    filters: (
      <Box style={{ padding: theme.spacing.semantic.component.md }}>
        <Text
          size="2"
          style={{
            color: theme.colors.text.secondary,
            textAlign: "center",
          }}
        >
          Alpha Version Coming Soon
        </Text>
      </Box>
    ),
  };
}
