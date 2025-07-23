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
import { User, Rocket, Gear, Circle, UploadSimple, Database, Lightning, ChartBar, Calendar, Target } from "phosphor-react";
import { useCurrentWallet } from "@mysten/dapp-kit";
import { useCurrentUserProfile } from "@/shared/hooks/useApiQuery";
import { useAuth } from "@/shared/hooks/useAuth";

export function Profile() {
  const { theme } = useTheme();
  const { isConnected, currentWallet } = useCurrentWallet();
  const { isDemoAuthenticated } = useAuth();
  
  // Check if user is authenticated (either via wallet or demo)
  const isAuthenticated = isConnected || isDemoAuthenticated;
  
  // Fetch user profile data
  const {
    data: userProfile,
    isLoading: profileLoading,
    error: profileError,
  } = useCurrentUserProfile({
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  } as any);

  // If not authenticated, show a message
  if (!isAuthenticated) {
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
            Authentication Required
          </Heading>
          <Text
            style={{
              maxWidth: "320px",
              color: theme.colors.text.secondary,
              lineHeight: 1.5,
              textAlign: "center",
            }}
          >
            Please sign in to view your profile information.
          </Text>
          <Button
            onClick={() => window.location.href = '/'}
            style={{
              background: theme.colors.interactive.primary,
              color: theme.colors.text.inverse,
              borderRadius: theme.borders.radius.sm,
              fontWeight: 600,
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
            }}
          >
            Go to Home
          </Button>
        </Flex>
      </Box>
    );
  }

  // Loading state
  if (profileLoading) {
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
              width: "24px",
              height: "24px",
              border: `2px solid ${theme.colors.border.primary}`,
              borderTopColor: theme.colors.interactive.primary,
              borderRadius: "50%",
              animation: 'spin 1s linear infinite',
            }}
          />
          <Text
            size="3"
            style={{
              color: theme.colors.text.primary,
              fontWeight: 600,
            }}
          >
            Loading Profile...
          </Text>
        </Flex>
      </Box>
    );
  }

  // // If wallet is not connected, show a message
  // if (!isConnected) {
  //   return (
  //     <Box
  //       style={{
  //         background: theme.colors.background.primary,
  //         minHeight: "100vh",
  //         display: "flex",
  //         alignItems: "center",
  //         justifyContent: "center",
  //         padding: theme.spacing.semantic.layout.lg,
  //       }}
  //     >
  //       <Flex
  //         direction="column"
  //         align="center"
  //         gap="4"
  //         style={{
  //           background: theme.colors.background.card,
  //           padding: theme.spacing.semantic.layout.lg,
  //           borderRadius: theme.borders.radius.lg,
  //           border: `1px solid ${theme.colors.border.primary}`,
  //           boxShadow: theme.shadows.semantic.card.low,
  //           maxWidth: "400px",
  //         }}
  //       >
  //         <Box
  //           style={{
  //             width: "48px",
  //             height: "48px",
  //             borderRadius: "50%",
  //             background: `${theme.colors.interactive.primary}15`,
  //             display: "flex",
  //             alignItems: "center",
  //             justifyContent: "center",
  //           }}
  //         >
  //           <User size={24} style={{ color: theme.colors.interactive.primary }} />
  //         </Box>
  //         <Heading
  //           size="4"
  //           style={{
  //             color: theme.colors.text.primary,
  //             fontWeight: 600,
  //             textAlign: "center",
  //           }}
  //         >
  //           Connect Wallet
  //         </Heading>
  //         <Text
  //           style={{
  //             maxWidth: "320px",
  //             color: theme.colors.text.secondary,
  //             lineHeight: 1.5,
  //             textAlign: "center",
  //           }}
  //         >
  //           Connect your Sui wallet to access the OpenGraph platform.
  //         </Text>
  //         <Button
  //           style={{
  //             background: theme.colors.interactive.primary,
  //             color: theme.colors.text.inverse,
  //             borderRadius: theme.borders.radius.sm,
  //             fontWeight: 600,
  //             padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
  //           }}
  //         >
  //           Connect Wallet
  //         </Button>
  //       </Flex>
  //     </Box>
  //   );
  // }

  // Format wallet address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  // Get user's wallet address (fallback to current wallet if profile doesn't have sui_address)
  const userAddress = userProfile?.sui_address || currentWallet?.accounts[0]?.address || "";
  
  // Format user's display name or email
  const displayName = userProfile?.display_name || userProfile?.email || formatAddress(userAddress);
  
  // Format profile creation date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Debug: Log profile data
  console.log('Profile Debug:', {
    isAuthenticated,
    isConnected,
    isDemoAuthenticated,
    userProfile,
    profileLoading,
    profileError,
  });

  // Top Bar Component
  const topBar = (
    <Flex justify="between" align="center">
      <Flex align="center" gap="4">
        <Flex align="center" gap="2">
          <Avatar
            size="3"
            src={userProfile?.profile_image_url || undefined}
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
            {userProfile?.email && userProfile?.display_name && (
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

              {userProfile?.display_name && (
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
                      {userProfile.display_name}
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
                  {userProfile?.created_at ? formatDate(userProfile.created_at) : 'Unknown'}
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

        {/* Activity Statistics */}
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
              Activity Statistics
            </Text>

            <Flex direction="column" gap="4">
              {/* Datasets Created */}
              <Card
                style={{
                  padding: theme.spacing.semantic.component.md,
                  background: `linear-gradient(135deg, ${theme.colors.interactive.primary}08, ${theme.colors.interactive.primary}04)`,
                  border: `1px solid ${theme.colors.interactive.primary}20`,
                  borderRadius: theme.borders.radius.md,
                }}
              >
                <Flex align="center" gap="3">
                  <Box
                    style={{
                      background: theme.colors.interactive.primary,
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Database size={18} style={{ color: theme.colors.text.inverse }} />
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Text
                      size="4"
                      style={{
                        fontWeight: 700,
                        color: theme.colors.text.primary,
                        marginBottom: "2px",
                      }}
                    >
                      {userProfile?.dataset_count || 0}
                    </Text>
                    <Text
                      size="2"
                      style={{
                        color: theme.colors.text.secondary,
                        fontWeight: 500,
                      }}
                    >
                      Datasets Created
                    </Text>
                  </Box>
                </Flex>
              </Card>

              {/* Annotations Created */}
              <Card
                style={{
                  padding: theme.spacing.semantic.component.md,
                  background: `linear-gradient(135deg, ${theme.colors.status.success}08, ${theme.colors.status.success}04)`,
                  border: `1px solid ${theme.colors.status.success}20`,
                  borderRadius: theme.borders.radius.md,
                }}
              >
                <Flex align="center" gap="3">
                  <Box
                    style={{
                      background: theme.colors.status.success,
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Target size={18} style={{ color: theme.colors.text.inverse }} />
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Text
                      size="4"
                      style={{
                        fontWeight: 700,
                        color: theme.colors.text.primary,
                        marginBottom: "2px",
                      }}
                    >
                      {userProfile?.annotation_count || 0}
                    </Text>
                    <Text
                      size="2"
                      style={{
                        color: theme.colors.text.secondary,
                        fontWeight: 500,
                      }}
                    >
                      Annotations Created
                    </Text>
                  </Box>
                </Flex>
              </Card>

              {/* Activity Summary */}
              <Box
                style={{
                  padding: theme.spacing.semantic.component.sm,
                  background: theme.colors.background.secondary,
                  borderRadius: theme.borders.radius.sm,
                  border: `1px solid ${theme.colors.border.subtle}20`,
                }}
              >
                <Flex align="center" gap="2" justify="center">
                  <ChartBar size={14} style={{ color: theme.colors.text.tertiary }} />
                  <Text
                    size="1"
                    style={{
                      color: theme.colors.text.secondary,
                      fontWeight: 500,
                    }}
                  >
                    Total Contributions: {(userProfile?.dataset_count || 0) + (userProfile?.annotation_count || 0)}
                  </Text>
                </Flex>
              </Box>
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

        {/* Error handling for profile data */}
        {profileError && (
          <Card
            style={{
              padding: theme.spacing.semantic.component.lg,
              background: theme.colors.background.card,
              border: `1px solid ${theme.colors.status.error}40`,
            }}
          >
            <Flex direction="column" gap="3" align="center">
              <Box
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: `${theme.colors.status.error}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <User size={20} style={{ color: theme.colors.status.error }} />
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
                  Unable to Load Profile Data
                </Text>
                <Text
                  size="2"
                  style={{
                    color: theme.colors.text.secondary,
                    lineHeight: 1.5,
                  }}
                >
                  There was an error loading your profile information. Some features may not work correctly.
                </Text>
              </Box>
            </Flex>
          </Card>
        )}

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

      {/* Global Styles */}
      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </SidebarLayout>
  );
}
