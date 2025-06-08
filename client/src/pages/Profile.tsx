import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Avatar,
  Badge,
  Separator,
} from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import { SidebarLayout } from "@/widgets/layout/AppLayout";
import { User, Rocket, Gear, Circle, UploadSimple, Database, Lightning } from "phosphor-react";
import { useCurrentWallet } from "@mysten/dapp-kit";

export function Profile() {
  const { theme } = useTheme();
  const { isConnected, currentWallet } = useCurrentWallet();

  // If wallet is not connected, show a message
  if (!isConnected) {
    return (
      <Box
        style={{
          background: theme.colors.background.primary,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Flex
          direction="column"
          align="center"
          gap="4"
          style={{
            background: theme.colors.background.card,
            padding: theme.spacing.semantic.layout.lg,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${theme.colors.border.primary}`,
            boxShadow: theme.shadows.semantic.card.low,
            maxWidth: "400px",
          }}
        >
          <Box
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: `${theme.colors.interactive.primary}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={24} style={{ color: theme.colors.interactive.primary }} />
          </Box>
          <Heading
            size="4"
            style={{
              color: theme.colors.text.primary,
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            Connect Wallet
          </Heading>
          <Text
            style={{
              maxWidth: "320px",
              color: theme.colors.text.secondary,
              lineHeight: 1.5,
              textAlign: "center",
            }}
          >
            Connect your Sui wallet to access the OpenGraph platform.
          </Text>
          <Button
            style={{
              background: theme.colors.interactive.primary,
              color: theme.colors.text.inverse,
              borderRadius: theme.borders.radius.sm,
              fontWeight: 600,
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
            }}
          >
            Connect Wallet
          </Button>
        </Flex>
      </Box>
    );
  }

  // Format wallet address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  // Get user's wallet address
  const userAddress = currentWallet?.accounts[0]?.address || "";

  // Top Bar Component
  const topBar = (
    <Flex justify="between" align="center">
      <Flex align="center" gap="4">
        <Flex align="center" gap="2">
          <Avatar
            size="3"
            fallback={userAddress[2]?.toUpperCase()}
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
              {formatAddress(userAddress)}
            </Text>
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

  // Sidebar configuration
  const sidebarConfig = {
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

  return (
    <SidebarLayout sidebar={sidebarConfig} topBar={topBar}>
      <Flex direction="column" gap="4">
        {/* Account Overview */}
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

        {/* Quick Actions */}
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
              Quick Actions
            </Text>

            <Flex direction="column" gap="2">
              <Box
                style={{
                  background: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() => (window.location.href = "/models")}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.borderColor = theme.colors.border.brand;
                  e.currentTarget.style.background = `${theme.colors.interactive.primary}08`;
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.borderColor = theme.colors.border.primary;
                  e.currentTarget.style.background = theme.colors.background.secondary;
                }}
              >
                <Flex
                  align="center"
                  gap="3"
                  style={{
                    padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  }}
                >
                  <Rocket size={16} style={{ color: theme.colors.interactive.primary }} />
                  <Text
                    size="2"
                    style={{
                      color: theme.colors.text.primary,
                      fontWeight: 500,
                    }}
                  >
                    Browse AI Models
                  </Text>
                </Flex>
              </Box>

              <Box
                style={{
                  background: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() => (window.location.href = "/datasets")}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.borderColor = theme.colors.border.brand;
                  e.currentTarget.style.background = `${theme.colors.interactive.primary}08`;
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.borderColor = theme.colors.border.primary;
                  e.currentTarget.style.background = theme.colors.background.secondary;
                }}
              >
                <Flex
                  align="center"
                  gap="3"
                  style={{
                    padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  }}
                >
                  <Database size={16} style={{ color: theme.colors.status.info }} />
                  <Text
                    size="2"
                    style={{
                      color: theme.colors.text.primary,
                      fontWeight: 500,
                    }}
                  >
                    Browse Datasets
                  </Text>
                </Flex>
              </Box>

              <Box
                style={{
                  background: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() => (window.location.href = "/annotator")}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.borderColor = theme.colors.border.brand;
                  e.currentTarget.style.background = `${theme.colors.interactive.primary}08`;
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.borderColor = theme.colors.border.primary;
                  e.currentTarget.style.background = theme.colors.background.secondary;
                }}
              >
                <Flex
                  align="center"
                  gap="3"
                  style={{
                    padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  }}
                >
                  <Gear size={16} style={{ color: theme.colors.status.warning }} />
                  <Text
                    size="2"
                    style={{
                      color: theme.colors.text.primary,
                      fontWeight: 500,
                    }}
                  >
                    Data Annotator
                  </Text>
                </Flex>
              </Box>
            </Flex>
          </Flex>
        </Card>

        {/* Platform Status */}
        <Card
          style={{
            padding: theme.spacing.semantic.component.lg,
            background: theme.colors.background.card,
            border: `1px solid ${theme.colors.border.primary}`,
          }}
        >
          <Flex direction="column" gap="3" align="center">
            <Box
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: `${theme.colors.status.warning}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Lightning size={20} style={{ color: theme.colors.status.warning }} />
            </Box>

            <Box style={{ textAlign: "center" }}>
              <Text
                size="3"
                style={{
                  fontWeight: 600,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.semantic.component.xs,
                }}
              >
                Platform in Development
              </Text>
              <br />
              <Text
                size="2"
                style={{
                  color: theme.colors.text.secondary,
                  lineHeight: 1.5,
                  marginTop: theme.spacing.semantic.component.xs,
                }}
              >
                OpenGraph is currently in active development. More features will be available in the
                alpha release.
              </Text>
            </Box>
          </Flex>
        </Card>
      </Flex>
    </SidebarLayout>
  );
}
