import React, { useState } from "react";
import { Box, Flex, Text, Heading } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useAuth } from "@/contexts/data/AuthContext";
import { useZkLogin } from "@/contexts/data/ZkLoginContext";
import { useProfilePageContext } from "@/contexts/ProfilePageContextProvider";
import {
  BarChartIcon,
  PersonIcon,
  CalendarIcon,
  CheckCircledIcon,
  StarFilledIcon,
  TokensIcon,
} from "@radix-ui/react-icons";
import suiLogoUrl from "@/assets/logo/Sui_Symbol_Sea.png";
import openLogoUrl from "@/assets/logo/logo.png";
import usdcLogoUrl from "@/assets/logo/usdc_logo.png";

/**
 * Desktop-optimized layout for Profile page
 * Features: Two-column layout, detailed wallet interface, desktop interactions
 */
export function ProfileLayoutDesktop() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { suiAddress } = useZkLogin();
  const { userProfile: profile } = useProfilePageContext();
  const [selectedToken, setSelectedToken] = useState<"OPEN" | "SUI" | "USDC">("OPEN");

  const joinDate = profile ? new Date(profile.createdAt).toLocaleDateString() : "";
  const displayName = profile?.displayName || user?.name || user?.email?.split("@")[0] || "User";
  const profileImage = profile?.profileImageUrl || user?.picture;
  const userSuiAddress = profile?.suiAddress || suiAddress;

  // Mock data for demo purposes
  const mockData = {
    totalAnnotations: profile?.annotationCount || 0,
    datasetsCreated: profile?.datasetCount || 0,
    weeklyAnnotations: 0,
    accuracy: 94.2,
    contributionStreak: 14,
    rank: "Advanced Contributor",
    tokens: {
      OPEN: {
        balance: 2847.5,
        pending: 156.25,
        symbol: "OPEN",
        name: "OpenGraph Token",
        logo: openLogoUrl,
        primary: true,
      },
      SUI: {
        balance: 12.47,
        pending: 3.25,
        symbol: "SUI",
        name: "Sui Token",
        logo: suiLogoUrl,
        primary: false,
      },
      USDC: {
        balance: 28.9,
        pending: 4.5,
        symbol: "USDC",
        name: "USD Coin",
        logo: usdcLogoUrl,
        primary: false,
      },
    },
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: theme.colors.background.primary,
        padding: theme.spacing.semantic.layout.lg,
      }}
    >
      <Box
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header Section */}
        <Box
          style={{
            background: theme.colors.background.card,
            borderRadius: theme.borders.radius.lg,
            padding: theme.spacing.semantic.layout.lg,
            marginBottom: theme.spacing.semantic.layout.md,
            border: `1px solid ${theme.colors.border.primary}`,
            boxShadow: theme.shadows.semantic.overlay.dropdown,
          }}
        >
          <Flex gap="6" align="start" direction={{ initial: "column", sm: "row" }}>
            {/* Profile Avatar */}
            <Flex direction="column" align="center" gap="3">
              <Box
                style={{
                  position: "relative",
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: `3px solid ${theme.colors.border.secondary}`,
                  boxShadow: theme.shadows.semantic.overlay.dropdown,
                }}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={displayName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center",
                    }}
                  />
                ) : (
                  <Box
                    style={{
                      width: "100%",
                      height: "100%",
                      background: theme.colors.interactive.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "32px",
                      fontWeight: "700",
                      color: "white",
                    }}
                  >
                    {displayName.substring(0, 2).toUpperCase()}
                  </Box>
                )}
              </Box>

              {/* Status Badge */}
              <Box
                style={{
                  background: `${theme.colors.status.success}15`,
                  color: theme.colors.status.success,
                  padding: `${theme.spacing.base[1]} ${theme.spacing.base[2]}`,
                  borderRadius: theme.borders.radius.sm,
                  fontSize: "12px",
                  fontWeight: "600",
                  border: `1px solid ${theme.colors.status.success}30`,
                }}
              >
                {mockData.rank}
              </Box>
            </Flex>

            {/* Profile Info */}
            <Flex direction="column" gap="4" style={{ flex: 1 }}>
              <Box>
                <Heading
                  size="7"
                  style={{
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.semantic.component.sm,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {displayName}
                </Heading>
                <Text
                  size="3"
                  style={{
                    color: theme.colors.text.secondary,
                    fontWeight: 500,
                    marginBottom: theme.spacing.semantic.component.sm,
                  }}
                >
                  {user?.email}
                </Text>

                {/* Quick Stats */}
                <Flex
                  gap="4"
                  wrap="wrap"
                  style={{ marginTop: theme.spacing.semantic.component.md }}
                >
                  <Flex align="center" gap="2">
                    <Box
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: theme.colors.status.success,
                      }}
                    />
                    <Text size="2" style={{ color: theme.colors.text.secondary }}>
                      {mockData.contributionStreak} day streak
                    </Text>
                  </Flex>
                  <Flex align="center" gap="2">
                    <Box
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: theme.colors.status.info,
                      }}
                    />
                    <Text size="2" style={{ color: theme.colors.text.secondary }}>
                      {mockData.accuracy}% accuracy
                    </Text>
                  </Flex>
                </Flex>
              </Box>

              <Flex align="center" gap="2">
                <CalendarIcon
                  style={{
                    width: "16px",
                    height: "16px",
                    color: theme.colors.text.tertiary,
                  }}
                />
                <Text
                  size="2"
                  style={{
                    color: theme.colors.text.secondary,
                  }}
                >
                  Joined {joinDate}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Box>

        {/* Statistics Grid - Desktop two-column layout */}
        <Flex gap="4" direction="row">
          {/* Annotation Statistics */}
          <Box
            style={{
              flex: 1,
              background: theme.colors.background.card,
              borderRadius: theme.borders.radius.lg,
              padding: theme.spacing.semantic.layout.lg,
              border: `1px solid ${theme.colors.border.primary}`,
              boxShadow: theme.shadows.semantic.overlay.dropdown,
            }}
          >
            <Flex
              align="center"
              gap="3"
              style={{ marginBottom: theme.spacing.semantic.component.lg }}
            >
              <Box
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: `${theme.colors.status.info}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${theme.colors.status.info}30`,
                }}
              >
                <BarChartIcon
                  style={{
                    width: "24px",
                    height: "24px",
                    color: theme.colors.status.info,
                  }}
                />
              </Box>
              <Box>
                <Heading size="4" style={{ color: theme.colors.text.primary }}>
                  Annotation Activity
                </Heading>
                <Text size="2" style={{ color: theme.colors.text.secondary }}>
                  Your contribution to the platform
                </Text>
              </Box>
            </Flex>

            <Flex direction="column" gap="4">
              {/* Total Annotations */}
              <Flex justify="between" align="center">
                <Flex align="center" gap="2">
                  <CheckCircledIcon
                    style={{
                      width: "20px",
                      height: "20px",
                      color: theme.colors.status.success,
                    }}
                  />
                  <Text size="3" style={{ color: theme.colors.text.secondary }}>
                    Total Annotations
                  </Text>
                </Flex>
                <Text
                  size="5"
                  style={{
                    color: theme.colors.text.primary,
                    fontWeight: "700",
                  }}
                >
                  {mockData.totalAnnotations.toLocaleString()}
                </Text>
              </Flex>

              {/* Weekly Annotations */}
              <Flex justify="between" align="center">
                <Flex align="center" gap="2">
                  <Box
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: theme.colors.status.info,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: "10px", color: "white", fontWeight: "bold" }}>7</Text>
                  </Box>
                  <Text size="3" style={{ color: theme.colors.text.secondary }}>
                    This Week
                  </Text>
                </Flex>
                <Text
                  size="4"
                  style={{
                    color: theme.colors.status.info,
                    fontWeight: "700",
                  }}
                >
                  +{mockData.weeklyAnnotations}
                </Text>
              </Flex>

              {/* Datasets Created */}
              <Flex justify="between" align="center">
                <Flex align="center" gap="2">
                  <StarFilledIcon
                    style={{
                      width: "20px",
                      height: "20px",
                      color: theme.colors.status.warning,
                    }}
                  />
                  <Text size="3" style={{ color: theme.colors.text.secondary }}>
                    Datasets Created
                  </Text>
                </Flex>
                <Text
                  size="4"
                  style={{
                    color: theme.colors.text.primary,
                    fontWeight: "600",
                  }}
                >
                  {mockData.datasetsCreated}
                </Text>
              </Flex>

              {/* Progress Bar */}
              <Box style={{ marginTop: theme.spacing.semantic.component.md }}>
                <Flex
                  justify="between"
                  style={{ marginBottom: theme.spacing.semantic.component.sm }}
                >
                  <Text size="2" style={{ color: theme.colors.text.secondary }}>
                    Next Level Progress
                  </Text>
                  <Text
                    size="2"
                    style={{ color: theme.colors.interactive.primary, fontWeight: "600" }}
                  >
                    {Math.round((mockData.totalAnnotations % 500) / 5)}% to Expert
                  </Text>
                </Flex>
                <Box
                  style={{
                    width: "100%",
                    height: "8px",
                    background: theme.colors.background.secondary,
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    style={{
                      width: `${Math.round((mockData.totalAnnotations % 500) / 5)}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
                      transition: "width 0.3s ease",
                      borderRadius: "4px",
                    }}
                  />
                </Box>
              </Box>
            </Flex>
          </Box>

          {/* Multi-Token Wallet - Desktop version with detailed interface */}
          <Box
            style={{
              flex: 1,
              background: theme.colors.background.card,
              borderRadius: theme.borders.radius.lg,
              padding: theme.spacing.semantic.layout.lg,
              border: `1px solid ${theme.colors.border.primary}`,
              boxShadow: theme.shadows.semantic.overlay.dropdown,
            }}
          >
            {/* Header */}
            <Flex
              align="center"
              gap="3"
              style={{ marginBottom: theme.spacing.semantic.component.lg }}
            >
              <Box
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: `${theme.colors.interactive.primary}15`,
                  border: `1px solid ${theme.colors.interactive.primary}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px",
                }}
              >
                <img
                  src={mockData.tokens[selectedToken].logo}
                  alt={mockData.tokens[selectedToken].name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "center",
                  }}
                />
              </Box>
              <Box>
                <Heading size="4" style={{ color: theme.colors.text.primary }}>
                  OpenGraph Wallet
                </Heading>
                <Text size="2" style={{ color: theme.colors.text.secondary }}>
                  Multi-token rewards & earnings
                </Text>
              </Box>
            </Flex>

            {/* Token Selector */}
            <Box style={{ marginBottom: theme.spacing.semantic.component.lg }}>
              <Text
                size="2"
                style={{
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing.semantic.component.sm,
                }}
              >
                Select Token
              </Text>
              <Flex gap="2">
                {(Object.keys(mockData.tokens) as Array<keyof typeof mockData.tokens>).map(
                  tokenKey => {
                    const token = mockData.tokens[tokenKey];
                    const isSelected = selectedToken === tokenKey;

                    return (
                      <button
                        key={tokenKey}
                        onClick={() => setSelectedToken(tokenKey)}
                        style={{
                          flex: 1,
                          padding: theme.spacing.semantic.component.sm,
                          background: isSelected
                            ? theme.colors.interactive.primary
                            : theme.colors.background.secondary,
                          border: `1px solid ${
                            isSelected
                              ? theme.colors.interactive.primary
                              : theme.colors.border.secondary
                          }`,
                          borderRadius: theme.borders.radius.sm,
                          cursor: "pointer",
                          transition: "all 150ms ease",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: theme.spacing.base[1],
                        }}
                      >
                        <img
                          src={token.logo}
                          alt={token.symbol}
                          style={{
                            width: "20px",
                            height: "20px",
                            objectFit: "contain",
                          }}
                        />
                        <Text
                          size="2"
                          style={{
                            color: isSelected ? "white" : theme.colors.text.primary,
                            fontWeight: isSelected ? "600" : "500",
                          }}
                        >
                          {token.symbol}
                        </Text>
                      </button>
                    );
                  }
                )}
              </Flex>
            </Box>

            {/* Wallet Connection Status */}
            {userSuiAddress ? (
              <Box style={{ marginBottom: theme.spacing.semantic.component.lg }}>
                <Text
                  size="2"
                  style={{
                    color: theme.colors.text.secondary,
                    marginBottom: theme.spacing.semantic.component.sm,
                  }}
                >
                  Connected Wallet
                </Text>
                <Box
                  style={{
                    background: theme.colors.background.secondary,
                    borderRadius: theme.borders.radius.sm,
                    padding: theme.spacing.semantic.component.md,
                    border: `1px solid ${theme.colors.border.secondary}`,
                  }}
                >
                  <Text
                    size="2"
                    style={{
                      fontFamily: "monospace",
                      color: theme.colors.text.primary,
                      wordBreak: "break-all",
                      lineHeight: 1.4,
                      fontSize: "12px",
                    }}
                  >
                    {userSuiAddress}
                  </Text>
                </Box>
              </Box>
            ) : (
              <Box
                style={{
                  textAlign: "center",
                  padding: theme.spacing.semantic.component.lg,
                  background: `${theme.colors.status.info}08`,
                  borderRadius: theme.borders.radius.sm,
                  border: `1px dashed ${theme.colors.status.info}40`,
                  marginBottom: theme.spacing.semantic.component.lg,
                }}
              >
                <Text size="2" style={{ color: theme.colors.text.secondary }}>
                  Connect wallet to claim rewards
                </Text>
              </Box>
            )}

            {/* Token Balance Display */}
            <Flex direction="column" gap="4">
              {/* Current Balance */}
              <Flex justify="between" align="center">
                <Flex align="center" gap="2">
                  <TokensIcon
                    style={{
                      width: "20px",
                      height: "20px",
                      color: theme.colors.status.success,
                    }}
                  />
                  <Text size="3" style={{ color: theme.colors.text.secondary }}>
                    Available Balance
                  </Text>
                </Flex>
                <Flex align="center" gap="2">
                  <Text
                    size="5"
                    style={{
                      color: theme.colors.text.primary,
                      fontWeight: "700",
                    }}
                  >
                    {mockData.tokens[selectedToken].balance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                  <Text size="2" style={{ color: theme.colors.text.tertiary }}>
                    {mockData.tokens[selectedToken].symbol}
                  </Text>
                </Flex>
              </Flex>

              {/* Pending Rewards */}
              <Flex justify="between" align="center">
                <Text size="3" style={{ color: theme.colors.text.secondary }}>
                  Pending Rewards
                </Text>
                <Flex align="center" gap="2">
                  <Text
                    size="4"
                    style={{
                      color: theme.colors.status.warning,
                      fontWeight: "700",
                    }}
                  >
                    +{mockData.tokens[selectedToken].pending.toFixed(2)}
                  </Text>
                  <Text size="2" style={{ color: theme.colors.text.tertiary }}>
                    {mockData.tokens[selectedToken].symbol}
                  </Text>
                </Flex>
              </Flex>

              {/* Claim Button */}
              <button
                disabled={mockData.tokens[selectedToken].pending === 0}
                style={{
                  width: "100%",
                  padding: theme.spacing.semantic.component.md,
                  background:
                    mockData.tokens[selectedToken].pending > 0
                      ? theme.colors.interactive.primary
                      : theme.colors.background.secondary,
                  border: `1px solid ${
                    mockData.tokens[selectedToken].pending > 0
                      ? theme.colors.interactive.primary
                      : theme.colors.border.secondary
                  }`,
                  borderRadius: theme.borders.radius.sm,
                  color:
                    mockData.tokens[selectedToken].pending > 0
                      ? "white"
                      : theme.colors.text.tertiary,
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: mockData.tokens[selectedToken].pending > 0 ? "pointer" : "not-allowed",
                  marginTop: theme.spacing.semantic.component.sm,
                  transition: "all 150ms ease",
                }}
              >
                {mockData.tokens[selectedToken].pending > 0
                  ? `Claim ${mockData.tokens[selectedToken].pending.toFixed(2)} ${mockData.tokens[selectedToken].symbol}`
                  : "No rewards to claim"}
              </button>
            </Flex>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}