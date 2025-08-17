import { Flex, Text, Badge, Separator } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import { useProfilePageContext } from "@/shared/providers/ProfilePageProvider";

export function ProfileAccountOverview() {
  const { theme } = useTheme();
  const { userProfile, userAddress, formatAddress, formatDate } = useProfilePageContext();

  return (
    <Card
      style={{
        padding: theme.spacing.semantic.component.lg,
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
      }}
    >
      <Flex direction="column" gap="4">
        <Text
          size="3"
          style={{
            fontWeight: 600,
            color: theme.colors.text.primary,
          }}
        >
          Account Overview
        </Text>

        <Flex direction="column" gap="3">
          {userProfile?.email && (
            <>
              <Flex justify="between" align="center">
                <Text size="2" style={{ color: theme.colors.text.secondary }}>
                  Email
                </Text>
                <Text
                  size="2"
                  style={{
                    color: theme.colors.text.primary,
                    fontWeight: 500,
                  }}
                >
                  {userProfile.email}
                </Text>
              </Flex>
              <Separator />
            </>
          )}

          {userProfile?.displayName && (
            <>
              <Flex justify="between" align="center">
                <Text size="2" style={{ color: theme.colors.text.secondary }}>
                  Display Name
                </Text>
                <Text
                  size="2"
                  style={{
                    color: theme.colors.text.primary,
                    fontWeight: 500,
                  }}
                >
                  {userProfile.displayName}
                </Text>
              </Flex>
              <Separator />
            </>
          )}

          <Flex justify="between" align="center">
            <Text size="2" style={{ color: theme.colors.text.secondary }}>
              Wallet Address
            </Text>
            <Text
              size="2"
              style={{
                fontFamily: "monospace",
                color: theme.colors.text.primary,
                fontWeight: 500,
              }}
            >
              {formatAddress(userAddress)}
            </Text>
          </Flex>

          <Separator />

          <Flex justify="between" align="center">
            <Text size="2" style={{ color: theme.colors.text.secondary }}>
              Member Since
            </Text>
            <Text
              size="2"
              style={{
                color: theme.colors.text.primary,
                fontWeight: 500,
              }}
            >
              {userProfile?.createdAt ? formatDate(userProfile.createdAt) : "Unknown"}
            </Text>
          </Flex>

          <Separator />

          <Flex justify="between" align="center">
            <Text size="2" style={{ color: theme.colors.text.secondary }}>
              Network
            </Text>
            <Badge
              style={{
                background: `${theme.colors.status.info}15`,
                color: theme.colors.status.info,
                border: `1px solid ${theme.colors.status.info}30`,
                padding: "2px 8px",
                borderRadius: theme.borders.radius.full,
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              Sui Testnet
            </Badge>
          </Flex>

          <Separator />

          <Flex justify="between" align="center">
            <Text size="2" style={{ color: theme.colors.text.secondary }}>
              Status
            </Text>
            <Badge
              style={{
                background: `${theme.colors.status.success}15`,
                color: theme.colors.status.success,
                border: `1px solid ${theme.colors.status.success}30`,
                padding: "2px 8px",
                borderRadius: theme.borders.radius.full,
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              Connected
            </Badge>
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}
