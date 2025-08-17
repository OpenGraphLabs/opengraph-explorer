import { Box, Flex, Text, Avatar } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Circle } from "phosphor-react";
import { useProfilePageContext } from "@/contexts/ProfilePageContextProvider";

export function ProfileTopBar() {
  const { theme } = useTheme();
  const { userProfile, displayName } = useProfilePageContext();

  return (
    <Flex justify="between" align="center">
      <Flex align="center" gap="4">
        <Flex align="center" gap="2">
          <Avatar
            size="3"
            src={userProfile?.profileImageUrl || undefined}
            fallback={displayName.charAt(0).toUpperCase()}
            style={{
              background: theme.colors.interactive.primary,
              color: theme.colors.text.inverse,
              fontWeight: "600",
            }}
          />
          <Box>
            <Text
              size="3"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
              }}
            >
              {displayName}
            </Text>
            {userProfile?.email && userProfile?.displayName && (
              <Text
                size="1"
                style={{
                  color: theme.colors.text.secondary,
                  marginTop: "2px",
                }}
              >
                {userProfile.email}
              </Text>
            )}
          </Box>
        </Flex>
      </Flex>

      <Flex align="center" gap="2">
        <Circle size={6} weight="fill" style={{ color: theme.colors.status.success }} />
        <Text size="2" style={{ color: theme.colors.text.secondary }}>
          Active
        </Text>
      </Flex>
    </Flex>
  );
}
