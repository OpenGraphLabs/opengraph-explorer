import React, { useEffect, useState } from "react";
import { Box, Flex, Text, Heading } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useAuth } from "@/contexts/data/AuthContext";
import { useZkLogin } from "@/contexts/data/ZkLoginContext";
import { apiClient } from "@/shared/api/client";
import {
  BarChartIcon,
  PersonIcon,
  CalendarIcon,
  CheckCircledIcon,
  StarFilledIcon,
  TokensIcon,
} from "@radix-ui/react-icons";
import suiLogoUrl from "@/assets/logo/Sui_Symbol_Sea.png";

interface UserProfile {
  id: number;
  email: string;
  display_name: string | null;
  profile_image_url: string | null;
  sui_address: string | null;
  created_at: string;
  dataset_count: number;
  annotation_count: number;
}

export function Profile() {
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { suiAddress } = useZkLogin();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        // Use API client which automatically adds JWT token
        const response = await apiClient.getAxiosInstance().get("/api/v1/users/me/profile");
        setProfile(response.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          background: theme.colors.background.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Flex direction="column" align="center" gap="4">
          <Box
            style={{
              width: "40px",
              height: "40px",
              border: `3px solid ${theme.colors.border.secondary}`,
              borderTop: `3px solid ${theme.colors.interactive.primary}`,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <Text size="3" style={{ color: theme.colors.text.secondary }}>
            Loading profile...
          </Text>
        </Flex>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          background: theme.colors.background.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Box
          style={{
            textAlign: "center",
            maxWidth: "400px",
            padding: theme.spacing.semantic.layout.lg,
            background: theme.colors.background.card,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${theme.colors.border.primary}`,
          }}
        >
          <PersonIcon
            style={{
              width: "48px",
              height: "48px",
              color: theme.colors.text.tertiary,
              margin: "0 auto",
              marginBottom: theme.spacing.semantic.component.lg,
            }}
          />
          <Heading size="4" style={{ marginBottom: theme.spacing.semantic.component.md }}>
            Please sign in
          </Heading>
          <Text size="2" style={{ color: theme.colors.text.secondary }}>
            You need to be signed in to view your profile and annotation statistics.
          </Text>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          background: theme.colors.background.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Box
          style={{
            textAlign: "center",
            maxWidth: "400px",
            padding: theme.spacing.semantic.layout.lg,
            background: theme.colors.background.card,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${theme.colors.status.error}`,
          }}
        >
          <Text
            size="3"
            style={{
              color: theme.colors.status.error,
              marginBottom: theme.spacing.semantic.component.md,
            }}
          >
            Error loading profile
          </Text>
          <Text size="2" style={{ color: theme.colors.text.secondary }}>
            {error}
          </Text>
        </Box>
      </Box>
    );
  }

  const joinDate = profile ? new Date(profile.created_at).toLocaleDateString() : "";
  const displayName = profile?.display_name || user?.name || user?.email?.split("@")[0] || "User";
  const profileImage = profile?.profile_image_url || user?.picture;
  const userSuiAddress = profile?.sui_address || suiAddress;

  // Mock data for demo purposes
  const mockData = {
    totalAnnotations: profile?.annotation_count || 1247,
    datasetsCreated: profile?.dataset_count || 23,
    weeklyAnnotations: 89,
    accuracy: 94.2,
    totalRewards: 12.47,
    pendingRewards: 3.25,
    contributionStreak: 14,
    rank: "Advanced Contributor"
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
            {/* Profile Avatar - Improved aspect ratio and styling */}
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
                <Flex gap="4" wrap="wrap" style={{ marginTop: theme.spacing.semantic.component.md }}>
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

        {/* Statistics Grid */}
        <Flex gap="4" direction={{ initial: "column", lg: "row" }}>
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

          {/* SUI Wallet & Rewards */}
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
                  background: `${theme.colors.status.success}15`,
                  border: `1px solid ${theme.colors.status.success}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px",
                }}
              >
                <img
                  src={suiLogoUrl}
                  alt="Sui"
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
                  SUI Wallet & Rewards
                </Heading>
                <Text size="2" style={{ color: theme.colors.text.secondary }}>
                  Your earnings and wallet information
                </Text>
              </Box>
            </Flex>

            <Flex direction="column" gap="4">
              {/* Wallet Address */}
              {userSuiAddress ? (
                <Box>
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
                  }}
                >
                  <Text size="2" style={{ color: theme.colors.text.secondary }}>
                    Connect your SUI wallet to earn rewards
                  </Text>
                </Box>
              )}

              {/* Total Rewards */}
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
                    Total Earned
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
                    {mockData.totalRewards.toFixed(2)}
                  </Text>
                  <Text size="2" style={{ color: theme.colors.text.tertiary }}>
                    SUI
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
                    {mockData.pendingRewards.toFixed(2)}
                  </Text>
                  <Text size="2" style={{ color: theme.colors.text.tertiary }}>
                    SUI
                  </Text>
                </Flex>
              </Flex>

              {/* Reward Rate */}
              <Flex justify="between" align="center">
                <Text size="3" style={{ color: theme.colors.text.secondary }}>
                  Avg. per Annotation
                </Text>
                <Flex align="center" gap="2">
                  <Text
                    size="3"
                    style={{
                      color: theme.colors.status.info,
                      fontWeight: "600",
                    }}
                  >
                    {(mockData.totalRewards / mockData.totalAnnotations).toFixed(4)}
                  </Text>
                  <Text size="2" style={{ color: theme.colors.text.tertiary }}>
                    SUI
                  </Text>
                </Flex>
              </Flex>

              {/* Claim Button */}
              <button
                disabled={mockData.pendingRewards === 0}
                style={{
                  width: "100%",
                  padding: theme.spacing.semantic.component.md,
                  background: mockData.pendingRewards > 0 
                    ? theme.colors.interactive.primary 
                    : theme.colors.background.secondary,
                  border: `1px solid ${mockData.pendingRewards > 0 
                    ? theme.colors.interactive.primary 
                    : theme.colors.border.secondary}`,
                  borderRadius: theme.borders.radius.sm,
                  color: mockData.pendingRewards > 0 
                    ? "white" 
                    : theme.colors.text.tertiary,
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: mockData.pendingRewards > 0 ? "pointer" : "not-allowed",
                  marginTop: theme.spacing.semantic.component.sm,
                  transition: "all 150ms ease",
                }}
              >
                {mockData.pendingRewards > 0 
                  ? `Claim ${mockData.pendingRewards.toFixed(2)} SUI` 
                  : "No rewards to claim"}
              </button>
            </Flex>
          </Box>
        </Flex>
      </Box>

      {/* Keyframe animations */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
}
