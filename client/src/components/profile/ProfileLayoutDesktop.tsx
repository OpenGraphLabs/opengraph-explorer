import React, { useState } from "react";
import { Box, Flex, Text, Heading } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useAuth } from "@/contexts/data/AuthContext";
import { useZkLogin } from "@/contexts/data/ZkLoginContext";
import { useProfilePageContext } from "@/contexts/ProfilePageContextProvider";
import { Trophy, User, CalendarBlank, Star, Wallet, ChartBar, ArrowsHorizontal, Coins } from "phosphor-react";
import { ProfileActivityStats } from "./ProfileActivityStats";
import { ProfileApprovedImages } from "./ProfileApprovedImages";
import suiLogoUrl from "@/assets/logo/Sui_Symbol_Sea.png";
import openLogoUrl from "@/assets/logo/logo.png";
import usdcLogoUrl from "@/assets/logo/usdc_logo.png";

/**
 * Desktop-optimized layout for Profile page
 * Features: Professional dashboard layout, currency exchange, data analytics focus
 */
export function ProfileLayoutDesktop() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { suiAddress } = useZkLogin();
  const { userProfile: profile } = useProfilePageContext();
  const [targetToken, setTargetToken] = useState<"SUI" | "USDC">("SUI");
  const [exchangeAmount, setExchangeAmount] = useState("");

  const joinDate = profile ? new Date(profile.createdAt).toLocaleDateString() : "";
  const displayName = profile?.displayName || user?.name || user?.email?.split("@")[0] || "User";
  const profileImage = profile?.profileImageUrl || user?.picture;
  const userSuiAddress = profile?.suiAddress || suiAddress;

  // Mock data for demo purposes
  const mockData = {
    accuracy: profile?.approvalRate || 0,
    contributionStreak: 14,
    rank: "Data Contributor",
    level: 8,
    nextLevelProgress: 65,
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
    
    // Exchange logic: Convert OPEN to target token
    const outputAmount = parseFloat(exchangeAmount) * mockData.exchangeRates[targetToken];
    console.log(`Exchange ${exchangeAmount} OPEN to ${outputAmount.toFixed(4)} ${targetToken}`);
    
    // Here would be the actual withdrawal/exchange logic
    alert(`Exchanging ${exchangeAmount} OPEN to ${outputAmount.toFixed(4)} ${targetToken}`);
  };

  const calculateOutputAmount = () => {
    if (!exchangeAmount || isNaN(parseFloat(exchangeAmount))) return "0.0000";
    const outputAmount = parseFloat(exchangeAmount) * mockData.exchangeRates[targetToken];
    return outputAmount.toFixed(4);
  };

  const getExchangeRate = () => {
    return mockData.exchangeRates[targetToken];
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
      }}
    >
      {/* Professional Header */}
      <Box
        style={{
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          backgroundColor: theme.colors.background.card,
        }}
      >
        <Box
          style={{
            maxWidth: "1800px",
            margin: "0 auto",
            padding: `${theme.spacing.semantic.layout.md} ${theme.spacing.semantic.container.md}`,
          }}
        >
          <Flex align="center" justify="between">
            <Flex align="center" gap="4">
              <Box
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: `2px solid ${theme.colors.border.secondary}`,
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
              
              <Box>
                <Heading
                  size="6"
                  style={{
                    color: theme.colors.text.primary,
                    marginBottom: "4px",
                    fontWeight: 600,
                  }}
                >
                  {displayName}
                </Heading>
                <Text
                  as="p"
                  size="3"
                  style={{
                    color: theme.colors.text.secondary,
                    marginBottom: "8px",
                  }}
                >
                  {user?.email}
                </Text>
                <Flex align="center" gap="4">
                  <Flex align="center" gap="2">
                    <CalendarBlank size={14} style={{ color: theme.colors.text.tertiary }} />
                    <Text as="p" size="2" style={{ color: theme.colors.text.secondary }}>
                      Joined {joinDate}
                    </Text>
                  </Flex>
                  <Flex align="center" gap="2">
                    <Box
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "#10b981",
                      }}
                    />
                    <Text as="p" size="2" style={{ color: theme.colors.text.secondary }}>
                      Level {mockData.level} Contributor
                    </Text>
                  </Flex>
                </Flex>
              </Box>
            </Flex>

            <Box>
              <Box
                style={{
                  background: `${theme.colors.status.success}08`,
                  color: theme.colors.status.success,
                  padding: `${theme.spacing.base[2]} ${theme.spacing.base[4]}`,
                  borderRadius: theme.borders.radius.md,
                  fontSize: "14px",
                  fontWeight: "600",
                  border: `1px solid ${theme.colors.status.success}20`,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Star size={16} weight="fill" />
                {mockData.rank}
              </Box>
            </Box>
          </Flex>
        </Box>
      </Box>

      {/* Main Dashboard Content */}
      <Box
        style={{
          maxWidth: "1800px",
          margin: "0 auto",
          padding: `${theme.spacing.semantic.layout.lg} ${theme.spacing.semantic.container.md}`,
        }}
      >
        <Flex gap="6" direction="row">
          {/* Left Column - Statistics */}
          <Box style={{ flex: "2" }}>
            {/* Statistics Cards */}
            <Box style={{ marginBottom: theme.spacing.semantic.layout.md }}>
              <Flex align="center" gap="3" style={{ marginBottom: theme.spacing.semantic.component.md }}>
                <ChartBar size={20} color={theme.colors.text.primary} />
                <Heading
                  size="4"
                  style={{
                    color: theme.colors.text.primary,
                    fontWeight: 600,
                  }}
                >
                  Contribution Analytics
                </Heading>
              </Flex>
              <ProfileActivityStats />
            </Box>

            {/* Approved Images Gallery */}
            <ProfileApprovedImages />
          </Box>

          {/* Right Column - Wallet & Exchange */}
          <Box style={{ flex: "1", minWidth: "360px" }}>
            {/* Wallet Balance */}
            <Box
              style={{
                background: theme.colors.background.card,
                borderRadius: theme.borders.radius.lg,
                padding: theme.spacing.semantic.component.xl,
                border: `1px solid ${theme.colors.border.primary}`,
                marginBottom: theme.spacing.semantic.component.lg,
              }}
            >
              <Flex align="center" gap="3" style={{ marginBottom: theme.spacing.semantic.component.lg }}>
                <Wallet size={20} color={theme.colors.text.primary} />
                <Heading
                  size="4"
                  style={{
                    color: theme.colors.text.primary,
                    fontWeight: 600,
                  }}
                >
                  Wallet Overview
                </Heading>
              </Flex>

              {/* OPEN Balance - Primary Display */}
              <Box
                style={{
                  padding: theme.spacing.semantic.component.lg,
                  background: `linear-gradient(135deg, ${theme.colors.interactive.primary}08, ${theme.colors.interactive.accent}06)`,
                  borderRadius: theme.borders.radius.md,
                  border: `1px solid ${theme.colors.interactive.primary}20`,
                  marginBottom: theme.spacing.semantic.component.md,
                }}
              >
                <Flex align="center" justify="between">
                  <Flex align="center" gap="4">
                    <img
                      src={openLogoUrl}
                      alt="OPEN"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                      }}
                    />
                    <Box>
                      <Text
                        as="p"
                        size="4"
                        style={{
                          fontWeight: 700,
                          color: theme.colors.text.primary,
                          marginBottom: "2px",
                        }}
                      >
                        OpenGraph Points
                      </Text>
                      <Text
                        as="p"
                        size="2"
                        style={{
                          color: theme.colors.text.secondary,
                        }}
                      >
                        Available for exchange
                      </Text>
                    </Box>
                  </Flex>
                  <Box style={{ textAlign: "right" }}>
                    <Text
                      as="p"
                      size="6"
                      style={{
                        fontWeight: 800,
                        color: theme.colors.interactive.primary,
                        marginBottom: "2px",
                      }}
                    >
                      {mockData.openBalance.toLocaleString()}
                    </Text>
                  </Box>
                </Flex>
              </Box>

              {/* Exchange Options */}
              <Text
                as="p"
                size="2"
                style={{
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing.semantic.component.sm,
                }}
              >
                Exchange to:
              </Text>
              <Flex gap="3">
                {Object.entries(mockData.tokens).map(([tokenKey, token]) => (
                  <Box
                    key={tokenKey}
                    style={{
                      flex: 1,
                      padding: theme.spacing.semantic.component.sm,
                      background: theme.colors.background.secondary,
                      borderRadius: theme.borders.radius.md,
                      border: `1px solid ${theme.colors.border.subtle}`,
                    }}
                  >
                    <Flex align="center" gap="2">
                      <img
                        src={token.logo}
                        alt={token.symbol}
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          objectFit: "contain",
                          objectPosition: "center",
                        }}
                      />
                      <Box>
                        <Text
                          as="p"
                          size="2"
                          style={{
                            fontWeight: 600,
                            color: theme.colors.text.primary,
                          }}
                        >
                          {token.symbol}
                        </Text>
                        {/*<Text*/}
                        {/*  as="p"*/}
                        {/*  size="1"*/}
                        {/*  style={{*/}
                        {/*    color: theme.colors.text.tertiary,*/}
                        {/*  }}*/}
                        {/*>*/}
                        {/*  1:{mockData.exchangeRates[tokenKey as keyof typeof mockData.exchangeRates]}*/}
                        {/*</Text>*/}
                      </Box>
                    </Flex>
                  </Box>
                ))}
              </Flex>
            </Box>

            {/* Token Withdrawal Exchange */}
            <Box
              style={{
                background: theme.colors.background.card,
                borderRadius: theme.borders.radius.lg,
                padding: theme.spacing.semantic.component.xl,
                border: `1px solid ${theme.colors.border.primary}`,
              }}
            >
              <Flex align="center" gap="3" style={{ marginBottom: theme.spacing.semantic.component.lg }}>
                <Coins size={20} color={theme.colors.text.primary} />
                <Heading
                  size="4"
                  style={{
                    color: theme.colors.text.primary,
                    fontWeight: 600,
                  }}
                >
                  Withdraw OPEN
                </Heading>
              </Flex>

              {/* Exchange Form */}
              <Box>
                {/* From Section - Fixed to OPEN */}
                <Text
                  as="p"
                  size="2"
                  style={{
                    color: theme.colors.text.secondary,
                    marginBottom: theme.spacing.semantic.component.sm,
                  }}
                >
                  From (OpenGraph Points)
                </Text>
                
                <Box
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: theme.spacing.semantic.component.md,
                    background: theme.colors.background.secondary,
                    borderRadius: theme.borders.radius.sm,
                    border: `1px solid ${theme.colors.border.primary}`,
                    marginBottom: theme.spacing.semantic.component.md,
                  }}
                >
                  <img 
                    src={openLogoUrl} 
                    alt="OPEN" 
                    style={{ 
                      width: "20px", 
                      height: "20px",
                      objectFit: "contain",
                      objectPosition: "center",
                    }} 
                  />
                  <Text
                    as="p"
                    size="3"
                    style={{
                      fontWeight: 600,
                      color: theme.colors.text.primary,
                    }}
                  >
                    OPEN
                  </Text>
                  <Text
                    as="p"
                    size="2"
                    style={{
                      color: theme.colors.text.tertiary,
                      marginLeft: "auto",
                    }}
                  >
                    Balance: {mockData.openBalance.toLocaleString()}
                  </Text>
                </Box>

                <input
                  type="number"
                  placeholder={`Enter OPEN amount (Max: ${mockData.openBalance})`}
                  value={exchangeAmount}
                  onChange={(e) => setExchangeAmount(e.target.value)}
                  max={mockData.openBalance}
                  style={{
                    width: "100%",
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
                  }}
                />

                {/* Quick Amount Buttons */}
                <Flex gap="2" style={{ marginBottom: theme.spacing.semantic.component.md }}>
                  {[25, 50, 75, 100].map((percentage) => {
                    const amount = Math.floor((mockData.openBalance * percentage) / 100);
                    return (
                      <button
                        key={percentage}
                        onClick={() => setExchangeAmount(amount.toString())}
                        style={{
                          flex: 1,
                          padding: `${theme.spacing.base[1]} ${theme.spacing.base[2]}`,
                          background: theme.colors.background.secondary,
                          border: `1px solid ${theme.colors.border.secondary}`,
                          borderRadius: theme.borders.radius.sm,
                          color: theme.colors.text.secondary,
                          fontSize: "12px",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        {percentage}%
                      </button>
                    );
                  })}
                </Flex>

                {/* To Section - Target Token Selection */}
                <Text
                  as="p"
                  size="2"
                  style={{
                    color: theme.colors.text.secondary,
                    marginBottom: theme.spacing.semantic.component.sm,
                  }}
                >
                  Convert to
                </Text>
                
                <Flex gap="3" style={{ marginBottom: theme.spacing.semantic.component.md }}>
                  {Object.entries(mockData.tokens).map(([tokenKey, token]) => (
                    <button
                      key={tokenKey}
                      onClick={() => setTargetToken(tokenKey as "SUI" | "USDC")}
                      style={{
                        flex: 1,
                        padding: theme.spacing.semantic.component.md,
                        background: targetToken === tokenKey 
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
                        gap: theme.spacing.base[2],
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
                      {token.symbol}
                    </button>
                  ))}
                </Flex>

                {/* Output Display */}
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
                    as="p"
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
                      as="p"
                      size="5"
                      style={{
                        fontWeight: 700,
                        color: theme.colors.status.success,
                      }}
                    >
                      {calculateOutputAmount()} {targetToken}
                    </Text>
                    <Text
                      as="p"
                      size="2"
                      style={{
                        color: theme.colors.text.tertiary,
                      }}
                    >
                      ≈ ${(parseFloat(calculateOutputAmount()) * mockData.tokens[targetToken].usdValue).toFixed(2)} USD
                    </Text>
                  </Flex>
                </Box>

                {/* Insufficient Balance Warning */}
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
                      as="p"
                      size="2"
                      style={{
                        color: theme.colors.status.error,
                        textAlign: "center",
                      }}
                    >
                      Insufficient OPEN balance. Maximum: {mockData.openBalance.toLocaleString()}
                    </Text>
                  </Box>
                )}

                <button
                  onClick={handleExchange}
                  disabled={!isValidAmount()}
                  style={{
                    width: "100%",
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
                    color: !isValidAmount()
                      ? theme.colors.text.tertiary
                      : "white",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: !isValidAmount()
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  Withdraw {targetToken}
                </button>
              </Box>

              {/* Exchange Rate Info */}
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
                  as="p"
                  size="1"
                  style={{
                    color: theme.colors.text.secondary,
                    textAlign: "center",
                  }}
                >
                  Exchange Rate: 1 OPEN = {getExchangeRate()} {targetToken} • Network fees may apply
                </Text>
              </Box>
            </Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}