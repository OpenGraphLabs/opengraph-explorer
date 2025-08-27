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
  const [selectedToken, setSelectedToken] = useState<"OPEN" | "SUI" | "USDC">("OPEN");
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
    tokens: {
      OPEN: {
        balance: profile?.totalPoints || 0,
        symbol: "OPEN",
        name: "OpenGraph Points",
        logo: openLogoUrl,
        exchangeRate: 1, // 1 OPEN = 1 OPEN
        usdValue: 0.1,
      },
      SUI: {
        balance: 12.47,
        symbol: "SUI",
        name: "Sui Token",
        logo: suiLogoUrl,
        exchangeRate: 0.15, // 1 OPEN = 0.15 SUI
        usdValue: 1.2,
      },
      USDC: {
        balance: 28.9,
        symbol: "USDC",
        name: "USD Coin",
        logo: usdcLogoUrl,
        exchangeRate: 0.1, // 1 OPEN = 0.1 USDC
        usdValue: 1.0,
      },
    },
  };

  const handleExchange = () => {
    if (!exchangeAmount || parseFloat(exchangeAmount) <= 0) return;
    // Exchange logic would go here
    const targetToken = selectedToken === "OPEN" ? "SUI/USDC" : "OPEN";
    console.log(`Exchange ${exchangeAmount} ${selectedToken} to ${targetToken}`);
  };

  const getTargetToken = () => {
    if (selectedToken === "OPEN") return "SUI/USDC";
    return "OPEN";
  };

  const getExchangeRate = () => {
    return mockData.tokens[selectedToken].exchangeRate;
  };

  const calculateExchangeAmount = () => {
    if (!exchangeAmount || isNaN(parseFloat(exchangeAmount))) return "0.0000";
    
    if (selectedToken === "OPEN") {
      // Default to SUI for display
      return (parseFloat(exchangeAmount) * mockData.tokens.SUI.exchangeRate).toFixed(4);
    } else {
      // Convert back to OPEN
      return (parseFloat(exchangeAmount) / mockData.tokens[selectedToken].exchangeRate).toFixed(4);
    }
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

              {/* Token Balances */}
              <Flex direction="column" gap="4">
                {Object.entries(mockData.tokens).map(([tokenKey, token]) => (
                  <Box
                    key={tokenKey}
                    style={{
                      padding: theme.spacing.semantic.component.md,
                      background: theme.colors.background.secondary,
                      borderRadius: theme.borders.radius.md,
                      border: `1px solid ${theme.colors.border.subtle}`,
                    }}
                  >
                    <Flex align="center" justify="between">
                      <Flex align="center" gap="3">
                        <img
                          src={token.logo}
                          alt={token.symbol}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                          }}
                        />
                        <Box>
                          <Text
                            as="p"
                            size="3"
                            style={{
                              fontWeight: 600,
                              color: theme.colors.text.primary,
                            }}
                          >
                            {token.symbol}
                          </Text>
                          <Text
                            as="p"
                            size="1"
                            style={{
                              color: theme.colors.text.tertiary,
                            }}
                          >
                            {token.name}
                          </Text>
                        </Box>
                      </Flex>
                      <Box style={{ textAlign: "right" }}>
                        <Text
                          as="p"
                          size="4"
                          style={{
                            fontWeight: 700,
                            color: theme.colors.text.primary,
                          }}
                        >
                          {token.balance.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </Text>
                        <Text
                          as="p"
                          size="1"
                          style={{
                            color: theme.colors.text.tertiary,
                          }}
                        >
                          ${(token.balance * token.usdValue).toFixed(2)} USD
                        </Text>
                      </Box>
                    </Flex>
                  </Box>
                ))}
              </Flex>
            </Box>

            {/* Currency Exchange */}
            <Box
              style={{
                background: theme.colors.background.card,
                borderRadius: theme.borders.radius.lg,
                padding: theme.spacing.semantic.component.xl,
                border: `1px solid ${theme.colors.border.primary}`,
              }}
            >
              <Flex align="center" gap="3" style={{ marginBottom: theme.spacing.semantic.component.lg }}>
                <ArrowsHorizontal size={20} color={theme.colors.text.primary} />
                <Heading
                  size="4"
                  style={{
                    color: theme.colors.text.primary,
                    fontWeight: 600,
                  }}
                >
                  Token Exchange
                </Heading>
              </Flex>

              {/* Exchange Form */}
              <Box>
                <Text
                  as="p"
                  size="2"
                  style={{
                    color: theme.colors.text.secondary,
                    marginBottom: theme.spacing.semantic.component.sm,
                  }}
                >
                  From
                </Text>
                <Flex gap="2" style={{ marginBottom: theme.spacing.semantic.component.md }}>
                  <button
                    onClick={() => setSelectedToken("OPEN")}
                    style={{
                      flex: 1,
                      padding: theme.spacing.semantic.component.sm,
                      background: selectedToken === "OPEN" 
                        ? theme.colors.interactive.primary 
                        : theme.colors.background.secondary,
                      border: `1px solid ${
                        selectedToken === "OPEN"
                          ? theme.colors.interactive.primary
                          : theme.colors.border.secondary
                      }`,
                      borderRadius: theme.borders.radius.sm,
                      color: selectedToken === "OPEN" ? "white" : theme.colors.text.primary,
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: theme.spacing.base[1],
                    }}
                  >
                    <img src={openLogoUrl} alt="OPEN" style={{ width: "16px", height: "16px" }} />
                    OPEN
                  </button>
                  <button
                    onClick={() => setSelectedToken("SUI")}
                    style={{
                      flex: 1,
                      padding: theme.spacing.semantic.component.sm,
                      background: selectedToken === "SUI" 
                        ? theme.colors.interactive.primary 
                        : theme.colors.background.secondary,
                      border: `1px solid ${
                        selectedToken === "SUI"
                          ? theme.colors.interactive.primary
                          : theme.colors.border.secondary
                      }`,
                      borderRadius: theme.borders.radius.sm,
                      color: selectedToken === "SUI" ? "white" : theme.colors.text.primary,
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: theme.spacing.base[1],
                    }}
                  >
                    <img src={suiLogoUrl} alt="SUI" style={{ width: "16px", height: "16px" }} />
                    SUI
                  </button>
                  <button
                    onClick={() => setSelectedToken("USDC")}
                    style={{
                      flex: 1,
                      padding: theme.spacing.semantic.component.sm,
                      background: selectedToken === "USDC" 
                        ? theme.colors.interactive.primary 
                        : theme.colors.background.secondary,
                      border: `1px solid ${
                        selectedToken === "USDC"
                          ? theme.colors.interactive.primary
                          : theme.colors.border.secondary
                      }`,
                      borderRadius: theme.borders.radius.sm,
                      color: selectedToken === "USDC" ? "white" : theme.colors.text.primary,
                      fontWeight: 500,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: theme.spacing.base[1],
                    }}
                  >
                    <img src={usdcLogoUrl} alt="USDC" style={{ width: "16px", height: "16px" }} />
                    USDC
                  </button>
                </Flex>

                <input
                  type="number"
                  placeholder="0.00"
                  value={exchangeAmount}
                  onChange={(e) => setExchangeAmount(e.target.value)}
                  style={{
                    width: "100%",
                    padding: theme.spacing.semantic.component.md,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borders.radius.sm,
                    fontSize: "16px",
                    background: theme.colors.background.secondary,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.semantic.component.md,
                  }}
                />

                <Text
                  as="p"
                  size="2"
                  style={{
                    color: theme.colors.text.secondary,
                    marginBottom: theme.spacing.semantic.component.sm,
                  }}
                >
                  You will receive approximately
                </Text>

                <Box
                  style={{
                    padding: theme.spacing.semantic.component.md,
                    background: theme.colors.background.secondary,
                    borderRadius: theme.borders.radius.sm,
                    border: `1px solid ${theme.colors.border.subtle}`,
                    marginBottom: theme.spacing.semantic.component.md,
                  }}
                >
                  <Text
                    as="p"
                    size="3"
                    style={{
                      fontWeight: 600,
                      color: theme.colors.text.primary,
                    }}
                  >
                    {calculateExchangeAmount()}{" "}
                    {getTargetToken()}
                  </Text>
                </Box>

                <button
                  onClick={handleExchange}
                  disabled={!exchangeAmount || parseFloat(exchangeAmount) <= 0}
                  style={{
                    width: "100%",
                    padding: theme.spacing.semantic.component.md,
                    background: (!exchangeAmount || parseFloat(exchangeAmount) <= 0)
                      ? theme.colors.background.secondary
                      : theme.colors.interactive.primary,
                    border: `1px solid ${
                      (!exchangeAmount || parseFloat(exchangeAmount) <= 0)
                        ? theme.colors.border.secondary
                        : theme.colors.interactive.primary
                    }`,
                    borderRadius: theme.borders.radius.sm,
                    color: (!exchangeAmount || parseFloat(exchangeAmount) <= 0)
                      ? theme.colors.text.tertiary
                      : "white",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: (!exchangeAmount || parseFloat(exchangeAmount) <= 0)
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  Exchange Tokens
                </button>
              </Box>

              {/* Exchange Rate Info */}
              <Box
                style={{
                  marginTop: theme.spacing.semantic.component.md,
                  padding: theme.spacing.semantic.component.sm,
                  background: `${theme.colors.status.info}08`,
                  borderRadius: theme.borders.radius.sm,
                  border: `1px solid ${theme.colors.status.info}20`,
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
                  Exchange Rate: 1 {selectedToken} = {selectedToken === "OPEN" ? `${mockData.tokens.SUI.exchangeRate} SUI / ${mockData.tokens.USDC.exchangeRate} USDC` : `${(1 / getExchangeRate()).toFixed(2)} OPEN`}
                </Text>
              </Box>
            </Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}