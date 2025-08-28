import React, { useState } from "react";
import { Box, Flex, Text, Heading } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useAuth } from "@/contexts/data/AuthContext";
import { useZkLogin } from "@/contexts/data/ZkLoginContext";
import { useProfilePageContext } from "@/contexts/ProfilePageContextProvider";
import {
  BarChartIcon,
  CalendarIcon,
  CheckCircledIcon,
  StarFilledIcon,
  TokensIcon,
} from "@radix-ui/react-icons";
import { ProfileActivityStats } from "./ProfileActivityStats";
import { ProfileApprovedImages } from "./ProfileApprovedImages";
import suiLogoUrl from "@/assets/logo/Sui_Symbol_Sea.png";
import openLogoUrl from "@/assets/logo/logo.png";
import usdcLogoUrl from "@/assets/logo/usdc_logo.png";

/**
 * Mobile-optimized layout for Profile page
 * Features: Single-column layout, touch-friendly interface, compact design
 */
export function ProfileLayoutMobile() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { suiAddress } = useZkLogin();
  const { userProfile: profile } = useProfilePageContext();
  const [targetToken, setTargetToken] = useState<"SUI" | "USDC">("SUI");
  const [exchangeAmount, setExchangeAmount] = useState("");

  const joinDate = profile ? new Date(profile.createdAt).toLocaleDateString() : "";
  const displayName =
    profile?.nickname || profile?.displayName || user?.name || user?.email?.split("@")[0] || "User";
  const profileImage = profile?.profileImageUrl || user?.picture;
  const userSuiAddress = profile?.suiAddress || suiAddress;
  const userGender = profile?.gender || "";
  const userAge = profile?.age || null;
  const userCountry = profile?.country || "";

  // Mock data for demo purposes
  const mockData = {
    accuracy: profile?.approvalRate || 0,
    contributionStreak: 14,
    rank: "Data Contributor",
    openBalance: profile?.totalPoints || 0,
    exchangeRates: {
      SUI: 0.00035, // 1 OPEN = 0.00035 SUI
      USDC: 0.0001, // 1 OPEN = 0.0001 USDC
    },
    tokens: {
      SUI: {
        symbol: "SUI",
        name: "Sui Token",
        logo: suiLogoUrl,
        usdValue: 1.2,
      },
      USDC: {
        symbol: "USDC",
        name: "USD Coin",
        logo: usdcLogoUrl,
        usdValue: 1.0,
      },
    },
  };

  const handleExchange = () => {
    if (!exchangeAmount || parseFloat(exchangeAmount) <= 0) return;
    if (parseFloat(exchangeAmount) > mockData.openBalance) {
      alert("Insufficient OPEN balance");
      return;
    }

    const outputAmount = parseFloat(exchangeAmount) * mockData.exchangeRates[targetToken];
    console.log(`Exchange ${exchangeAmount} OPEN to ${outputAmount.toFixed(4)} ${targetToken}`);
    alert(`Exchanging ${exchangeAmount} OPEN to ${outputAmount.toFixed(4)} ${targetToken}`);
  };

  const calculateOutputAmount = () => {
    if (!exchangeAmount || isNaN(parseFloat(exchangeAmount))) return "0.0000";
    const outputAmount = parseFloat(exchangeAmount) * mockData.exchangeRates[targetToken];
    return outputAmount.toFixed(4);
  };

  const isValidAmount = () => {
    if (!exchangeAmount) return false;
    const amount = parseFloat(exchangeAmount);
    return amount > 0 && amount <= mockData.openBalance;
  };

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: theme.colors.background.primary,
        padding: `${theme.spacing.semantic.layout.sm} ${theme.spacing.semantic.layout.sm}`,
        paddingTop: `max(env(safe-area-inset-top, 0px), ${theme.spacing.semantic.layout.sm})`,
        paddingBottom: `max(env(safe-area-inset-bottom, 0px), ${theme.spacing.semantic.layout.sm})`,
      }}
    >
      {/* Mobile Header Section - More compact */}
      <Box
        style={{
          background: theme.colors.background.card,
          borderRadius: theme.borders.radius.md,
          padding: theme.spacing.semantic.layout.md,
          marginBottom: theme.spacing.semantic.layout.sm,
          border: `1px solid ${theme.colors.border.primary}`,
          boxShadow: theme.shadows.semantic.card.low,
        }}
      >
        <Flex direction="column" align="center" gap="3">
          {/* Mobile Profile Avatar - Smaller */}
          <Box
            style={{
              position: "relative",
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              overflow: "hidden",
              border: `2px solid ${theme.colors.border.secondary}`,
              boxShadow: theme.shadows.semantic.card.low,
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
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "white",
                }}
              >
                {displayName.substring(0, 2).toUpperCase()}
              </Box>
            )}
          </Box>

          {/* Mobile Profile Info - Centered */}
          <Box style={{ textAlign: "center" }}>
            <Heading
              size="5"
              style={{
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.xs,
                letterSpacing: "-0.01em",
              }}
            >
              {displayName}
            </Heading>
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                fontWeight: 500,
                marginBottom: theme.spacing.semantic.component.sm,
              }}
            >
              {user?.email}
            </Text>

            {/* Status Badge */}
            <Box
              style={{
                background: `${theme.colors.status.success}15`,
                color: theme.colors.status.success,
                padding: `${theme.spacing.base[1]} ${theme.spacing.base[2]}`,
                borderRadius: theme.borders.radius.sm,
                fontSize: "11px",
                fontWeight: "600",
                border: `1px solid ${theme.colors.status.success}30`,
                display: "inline-block",
                marginBottom: theme.spacing.semantic.component.sm,
              }}
            >
              {mockData.rank}
            </Box>

            {/* User Info - Gender, Age, Country */}
            {(userGender || userAge || userCountry) && (
              <Flex
                justify="center"
                gap="2"
                wrap="wrap"
                style={{ marginBottom: theme.spacing.semantic.component.sm }}
              >
                {userGender && (
                  <Box
                    style={{
                      padding: `${theme.spacing.base[1]} ${theme.spacing.base[2]}`,
                      background: theme.colors.background.secondary,
                      borderRadius: theme.borders.radius.sm,
                      border: `1px solid ${theme.colors.border.subtle}`,
                    }}
                  >
                    <Text
                      as="p"
                      size="1"
                      style={{ color: theme.colors.text.secondary, fontWeight: 500 }}
                    >
                      👤 {userGender.charAt(0).toUpperCase() + userGender.slice(1).toLowerCase()}
                    </Text>
                  </Box>
                )}
                {userAge && (
                  <Box
                    style={{
                      padding: `${theme.spacing.base[1]} ${theme.spacing.base[2]}`,
                      background: theme.colors.background.secondary,
                      borderRadius: theme.borders.radius.sm,
                      border: `1px solid ${theme.colors.border.subtle}`,
                    }}
                  >
                    <Text
                      as="p"
                      size="1"
                      style={{ color: theme.colors.text.secondary, fontWeight: 500 }}
                    >
                      🎂 {userAge} years
                    </Text>
                  </Box>
                )}
                {userCountry && (
                  <Box
                    style={{
                      padding: `${theme.spacing.base[1]} ${theme.spacing.base[2]}`,
                      background: theme.colors.background.secondary,
                      borderRadius: theme.borders.radius.sm,
                      border: `1px solid ${theme.colors.border.subtle}`,
                    }}
                  >
                    <Text
                      as="p"
                      size="1"
                      style={{ color: theme.colors.text.secondary, fontWeight: 500 }}
                    >
                      🌍 {userCountry}
                    </Text>
                  </Box>
                )}
              </Flex>
            )}

            {/* Mobile Quick Stats - Horizontal */}
            <Flex justify="center" gap="4" wrap="wrap">
              <Flex align="center" gap="1">
                <Box
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: theme.colors.status.success,
                  }}
                />
                <Text size="1" style={{ color: theme.colors.text.secondary }}>
                  {mockData.contributionStreak} day streak
                </Text>
              </Flex>
              <Flex align="center" gap="1">
                <Box
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: theme.colors.status.info,
                  }}
                />
                <Text size="1" style={{ color: theme.colors.text.secondary }}>
                  {mockData.accuracy}% accuracy
                </Text>
              </Flex>
            </Flex>

            {/* Join Date */}
            <Flex align="center" justify="center" gap="1" style={{ marginTop: theme.spacing[2] }}>
              <CalendarIcon
                style={{
                  width: "12px",
                  height: "12px",
                  color: theme.colors.text.tertiary,
                }}
              />
              <Text size="1" style={{ color: theme.colors.text.secondary }}>
                Joined {joinDate}
              </Text>
            </Flex>
          </Box>
        </Flex>
      </Box>

      {/* Mobile Statistics - Single Column */}
      <Flex direction="column" gap="3">
        {/* OpenGraph Points & Contribution Stats */}
        <ProfileActivityStats />
        {/* Approved Images Gallery */}
        <ProfileApprovedImages />

        {/* OPEN Wallet & Withdrawal - Mobile */}
        <Box
          style={{
            background: theme.colors.background.card,
            borderRadius: theme.borders.radius.md,
            padding: theme.spacing.semantic.layout.md,
            border: `1px solid ${theme.colors.border.primary}`,
            boxShadow: theme.shadows.semantic.card.low,
          }}
        >
          {/* Header - Mobile */}
          <Flex
            align="center"
            gap="3"
            style={{ marginBottom: theme.spacing.semantic.component.lg }}
          >
            <Box
              style={{
                width: "40px",
                height: "40px",
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
                src={openLogoUrl}
                alt="OPEN"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "center",
                }}
              />
            </Box>
            <Box>
              <Heading size="3" style={{ color: theme.colors.text.primary }}>
                OPEN Wallet
              </Heading>
              <Text size="1" style={{ color: theme.colors.text.secondary }}>
                Withdraw your earned points
              </Text>
            </Box>
          </Flex>

          {/* OPEN Balance Display - Mobile */}
          <Box
            style={{
              padding: theme.spacing.semantic.component.lg,
              background: `linear-gradient(135deg, ${theme.colors.interactive.primary}08, ${theme.colors.interactive.accent}06)`,
              borderRadius: theme.borders.radius.md,
              border: `1px solid ${theme.colors.interactive.primary}20`,
              marginBottom: theme.spacing.semantic.component.lg,
            }}
          >
            <Flex align="center" justify="between" style={{ marginBottom: "8px" }}>
              <Text
                size="2"
                style={{
                  color: theme.colors.text.secondary,
                  fontWeight: 500,
                }}
              >
                OpenGraph Points
              </Text>
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                }}
              >
                Available for withdrawal
              </Text>
            </Flex>
            <Flex align="center" justify="between">
              <Text
                size="6"
                style={{
                  fontWeight: 800,
                  color: theme.colors.interactive.primary,
                }}
              >
                {mockData.openBalance.toLocaleString()}
              </Text>
            </Flex>
          </Box>

          {/* Withdrawal Form - Mobile */}
          <Box>
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.semantic.component.sm,
                fontWeight: 500,
              }}
            >
              Withdraw Amount
            </Text>

            <input
              type="number"
              placeholder={`Enter OPEN amount (Max: ${mockData.openBalance})`}
              value={exchangeAmount}
              onChange={e => setExchangeAmount(e.target.value)}
              max={mockData.openBalance}
              style={{
                width: "100%",
                minHeight: "44px", // Touch-friendly
                padding: theme.spacing.semantic.component.md,
                border: `1px solid ${
                  exchangeAmount && parseFloat(exchangeAmount) > mockData.openBalance
                    ? theme.colors.status.error
                    : theme.colors.border.primary
                }`,
                borderRadius: theme.borders.radius.sm,
                fontSize: "16px",
                background: theme.colors.background.primary,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.md,
                touchAction: "manipulation",
              }}
            />

            {/* Quick Amount Buttons - Mobile */}
            <Flex gap="2" style={{ marginBottom: theme.spacing.semantic.component.lg }}>
              {[25, 50, 75, 100].map(percentage => {
                const amount = Math.floor((mockData.openBalance * percentage) / 100);
                return (
                  <button
                    key={percentage}
                    onClick={() => setExchangeAmount(amount.toString())}
                    style={{
                      flex: 1,
                      minHeight: "36px",
                      padding: `${theme.spacing.base[1]} ${theme.spacing.base[2]}`,
                      background: theme.colors.background.secondary,
                      border: `1px solid ${theme.colors.border.secondary}`,
                      borderRadius: theme.borders.radius.sm,
                      color: theme.colors.text.secondary,
                      fontSize: "12px",
                      fontWeight: 500,
                      cursor: "pointer",
                      touchAction: "manipulation",
                    }}
                  >
                    {percentage}%
                  </button>
                );
              })}
            </Flex>

            {/* Target Token Selection - Mobile */}
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.semantic.component.sm,
                fontWeight: 500,
              }}
            >
              Convert to
            </Text>

            <Flex gap="3" style={{ marginBottom: theme.spacing.semantic.component.lg }}>
              {Object.entries(mockData.tokens).map(([tokenKey, token]) => (
                <button
                  key={tokenKey}
                  onClick={() => setTargetToken(tokenKey as "SUI" | "USDC")}
                  style={{
                    flex: 1,
                    minHeight: "48px",
                    padding: theme.spacing.semantic.component.md,
                    background:
                      targetToken === tokenKey
                        ? theme.colors.interactive.primary
                        : theme.colors.background.secondary,
                    border: `1px solid ${
                      targetToken === tokenKey
                        ? theme.colors.interactive.primary
                        : theme.colors.border.secondary
                    }`,
                    borderRadius: theme.borders.radius.sm,
                    color: targetToken === tokenKey ? "white" : theme.colors.text.primary,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: "4px",
                    touchAction: "manipulation",
                    transition: "all 150ms ease",
                  }}
                >
                  <img
                    src={token.logo}
                    alt={token.symbol}
                    style={{
                      width: "18px",
                      height: "18px",
                      objectFit: "contain",
                      objectPosition: "center",
                    }}
                  />
                  <Text
                    size="1"
                    style={{
                      color: targetToken === tokenKey ? "white" : theme.colors.text.primary,
                      fontWeight: 600,
                    }}
                  >
                    {token.symbol}
                  </Text>
                </button>
              ))}
            </Flex>

            {/* Output Display - Mobile */}
            <Box
              style={{
                padding: theme.spacing.semantic.component.lg,
                background: `linear-gradient(135deg, ${theme.colors.status.success}08, ${theme.colors.interactive.accent}06)`,
                borderRadius: theme.borders.radius.sm,
                border: `1px solid ${theme.colors.status.success}20`,
                marginBottom: theme.spacing.semantic.component.md,
              }}
            >
              <Text
                size="2"
                style={{
                  color: theme.colors.text.secondary,
                  marginBottom: "8px",
                }}
              >
                You will receive
              </Text>
              <Flex align="center" justify="between">
                <Text
                  size="4"
                  style={{
                    fontWeight: 700,
                    color: theme.colors.status.success,
                  }}
                >
                  {calculateOutputAmount()} {targetToken}
                </Text>
                <Text
                  size="2"
                  style={{
                    color: theme.colors.text.tertiary,
                  }}
                >
                  $
                  {(
                    parseFloat(calculateOutputAmount()) * mockData.tokens[targetToken].usdValue
                  ).toFixed(2)}
                </Text>
              </Flex>
            </Box>

            {/* Insufficient Balance Warning - Mobile */}
            {exchangeAmount && parseFloat(exchangeAmount) > mockData.openBalance && (
              <Box
                style={{
                  padding: theme.spacing.semantic.component.sm,
                  background: `${theme.colors.status.error}08`,
                  borderRadius: theme.borders.radius.sm,
                  border: `1px solid ${theme.colors.status.error}20`,
                  marginBottom: theme.spacing.semantic.component.md,
                }}
              >
                <Text
                  size="2"
                  style={{
                    color: theme.colors.status.error,
                    textAlign: "center",
                  }}
                >
                  Insufficient OPEN balance. Max: {mockData.openBalance.toLocaleString()}
                </Text>
              </Box>
            )}

            {/* Withdraw Button - Mobile */}
            <button
              onClick={handleExchange}
              disabled={!isValidAmount()}
              style={{
                width: "100%",
                minHeight: "48px", // Touch-friendly
                padding: theme.spacing.semantic.component.md,
                background: !isValidAmount()
                  ? theme.colors.background.secondary
                  : theme.colors.interactive.primary,
                border: `1px solid ${
                  !isValidAmount()
                    ? theme.colors.border.secondary
                    : theme.colors.interactive.primary
                }`,
                borderRadius: theme.borders.radius.sm,
                color: !isValidAmount() ? theme.colors.text.tertiary : "white",
                fontSize: "16px",
                fontWeight: 600,
                cursor: !isValidAmount() ? "not-allowed" : "pointer",
                touchAction: "manipulation",
                transition: "all 150ms ease",
              }}
            >
              Withdraw {targetToken}
            </button>

            {/* Exchange Rate Info - Mobile */}
            <Box
              style={{
                marginTop: theme.spacing.semantic.component.md,
                padding: theme.spacing.semantic.component.sm,
                background: `${theme.colors.interactive.primary}08`,
                borderRadius: theme.borders.radius.sm,
                border: `1px solid ${theme.colors.interactive.primary}20`,
              }}
            >
              <Text
                size="1"
                style={{
                  color: theme.colors.text.secondary,
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                Rate: 1 OPEN = {mockData.exchangeRates[targetToken]} {targetToken}
                <br />
                Network fees may apply
              </Text>
            </Box>
          </Box>
        </Box>
      </Flex>

      {/* Mobile-specific styles */}
      <style>
        {`
          /* Touch-friendly interactions */
          button {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
            touch-action: manipulation;
          }
          
          /* Improved scrolling on mobile */
          * {
            -webkit-overflow-scrolling: touch;
          }
          
          /* Mobile focus styles */
          button:focus {
            outline: 2px solid ${theme.colors.interactive.primary};
            outline-offset: 2px;
          }
        `}
      </style>
    </Box>
  );
}
