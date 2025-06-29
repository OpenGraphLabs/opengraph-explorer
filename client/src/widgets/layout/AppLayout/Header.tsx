import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ConnectButton, useCurrentWallet } from "@mysten/dapp-kit";
import { Box, Flex, Text, Avatar, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { HamburgerMenuIcon, GitHubLogoIcon, SunIcon, MoonIcon } from "@radix-ui/react-icons";
import { requiresWallet } from "@/shared/config/routePermissions";
import logoImage from "@/assets/logo/logo.png";

export function Header() {
  const location = useLocation();
  const { isConnected, currentWallet } = useCurrentWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { mode, toggleTheme, theme } = useTheme();

  return (
    <>
      {/* Compact Professional Header */}
      <Flex
        justify="between"
        align="center"
        py="2" // Much smaller vertical padding
        style={{
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          position: "sticky",
          top: 0,
          backgroundColor: theme.colors.background.primary,
          zIndex: 100,
          height: "56px", // Fixed compact height
        }}
      >
        {/* Logo and Navigation */}
        <Flex align="center" gap="6">
          <Link to="/challenges" style={{ textDecoration: "none" }}>
            <Flex align="center" gap="2">
              <img
                src={logoImage}
                alt="OpenGraph"
                style={{
                  width: "28px", // Smaller logo
                  height: "28px",
                  objectFit: "contain",
                }}
              />
              <Text
                size="3" // Smaller brand text
                style={{
                  color: theme.colors.text.primary,
                  fontWeight: theme.typography.h4.fontWeight,
                  letterSpacing: "-0.01em",
                }}
                className="sm:block"
              >
                OpenGraph
              </Text>
            </Flex>
          </Link>

          {/* Compact Desktop Navigation */}
          <Flex gap="1" className="hidden md:flex">
            {" "}
            {/* Reduced gap */}
            <NavLink
              to="/models"
              current={location.pathname === "/models"}
              disabled={!isConnected && requiresWallet("/models")}
            >
              Models
            </NavLink>
            <NavLink
              to="/datasets"
              current={location.pathname === "/datasets"}
              disabled={!isConnected && requiresWallet("/datasets")}
            >
              Datasets
            </NavLink>
            <NavLink
              to="/challenges"
              current={location.pathname.startsWith("/challenges")}
              disabled={false}
            >
              Challenges
            </NavLink>
            <NavLink
              to="/annotator"
              current={location.pathname === "/annotator"}
              disabled={!isConnected && requiresWallet("/annotator")}
            >
              Annotator
            </NavLink>
          </Flex>
        </Flex>

        {/* Right Side - Compact Actions */}
        <Flex align="center" gap="2">
          {" "}
          {/* Reduced gap */}
          {/* Mobile Menu Button - RadixUI responsive display */}
          <Box
            display={{ initial: "block", md: "none" }}
            style={{
              padding: theme.spacing.base[1], // Smaller padding
              minHeight: "32px",
              minWidth: "32px",
            }}
          >
            <Button
              variant="tertiary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                padding: theme.spacing.base[1],
                minHeight: "32px",
                minWidth: "32px",
              }}
            >
              <HamburgerMenuIcon width="16" height="16" />
            </Button>
          </Box>
          {/* Compact Theme Toggle */}
          <Button
            variant="tertiary"
            onClick={toggleTheme}
            style={{
              padding: theme.spacing.base[1],
              minHeight: "32px",
              minWidth: "32px",
              color: theme.colors.text.secondary,
            }}
          >
            {mode === "light" ? (
              <MoonIcon width="16" height="16" />
            ) : (
              <SunIcon width="16" height="16" />
            )}
          </Button>
          {/* Compact GitHub Link */}
          <a
            href="https://github.com/OpenGraphLabs/opengraph-explorer"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.colors.text.secondary,
              textDecoration: "none",
              padding: theme.spacing.base[1],
              minHeight: "32px",
              minWidth: "32px",
              borderRadius: theme.borders.radius.sm,
              transition: theme.animations.transitions.colors,
            }}
          >
            <GitHubLogoIcon width="16" height="16" />
          </a>
          {/* Compact Connect Button */}
          <ConnectButton
            connectText="Connect"
            data-testid="connect-button"
            style={{
              borderRadius: theme.borders.radius.sm,
              background: isConnected
                ? theme.colors.background.card
                : theme.colors.interactive.primary,
              color: isConnected ? theme.colors.text.primary : theme.colors.text.inverse,
              border: isConnected ? `1px solid ${theme.colors.border.primary}` : "none",
              fontWeight: theme.typography.label.fontWeight,
              padding: `${theme.spacing.base[1]} ${theme.spacing.base[3]}`, // Compact padding
              fontSize: theme.typography.bodySmall.fontSize,
              height: "32px",
            }}
          />
          {/* Compact Profile (when connected) */}
          {isConnected && (
            <Link to="/profile" style={{ textDecoration: "none" }}>
              <Avatar
                size="1" // Smaller avatar
                fallback={currentWallet?.accounts[0]?.address.slice(0, 2) || "0x"}
                style={{
                  background: theme.colors.interactive.primary,
                  cursor: "pointer",
                  width: "32px",
                  height: "32px",
                  fontSize: "12px",
                }}
              />
            </Link>
          )}
        </Flex>
      </Flex>

      {/* Compact Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <Box
          style={{
            position: "fixed",
            top: "56px", // Match header height
            left: 0,
            right: 0,
            backgroundColor: theme.colors.background.primary,
            borderBottom: `1px solid ${theme.colors.border.primary}`,
            zIndex: 99,
            padding: theme.spacing.base[3], // Smaller padding
            boxShadow: theme.shadows.semantic.overlay.dropdown,
          }}
          className="block md:hidden"
        >
          <Flex direction="column" gap="1">
            {" "}
            {/* Reduced gap */}
            <MobileNavLink
              to="/"
              current={location.pathname === "/"}
              onClick={() => setIsMobileMenuOpen(false)}
              disabled={false}
            >
              Home
            </MobileNavLink>
            <MobileNavLink
              to="/models"
              current={location.pathname === "/models"}
              onClick={() => setIsMobileMenuOpen(false)}
              disabled={!isConnected && requiresWallet("/models")}
            >
              Models
            </MobileNavLink>
            <MobileNavLink
              to="/datasets"
              current={location.pathname === "/datasets"}
              onClick={() => setIsMobileMenuOpen(false)}
              disabled={!isConnected && requiresWallet("/datasets")}
            >
              Datasets
            </MobileNavLink>
            <MobileNavLink
              to="/challenges"
              current={location.pathname.startsWith("/challenges")}
              onClick={() => setIsMobileMenuOpen(false)}
              disabled={false}
            >
              Challenges
            </MobileNavLink>
            <MobileNavLink
              to="/models/upload"
              current={location.pathname === "/models/upload"}
              onClick={() => setIsMobileMenuOpen(false)}
              disabled={!isConnected && requiresWallet("/models/upload")}
            >
              Upload Model
            </MobileNavLink>
            <MobileNavLink
              to="/annotator"
              current={location.pathname === "/annotator"}
              onClick={() => setIsMobileMenuOpen(false)}
              disabled={!isConnected && requiresWallet("/annotator")}
            >
              Annotator
            </MobileNavLink>
          </Flex>
        </Box>
      )}
    </>
  );
}

// Compact Navigation Link Components
function NavLink({
  to,
  current,
  children,
  disabled = false,
}: {
  to: string;
  current: boolean;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const { theme } = useTheme();

  if (disabled) {
    return (
      <Text
        style={{
          color: theme.colors.text.tertiary,
          fontWeight: theme.typography.body.fontWeight,
          padding: `${theme.spacing.base[1]} ${theme.spacing.base[2]}`,
          borderRadius: theme.borders.radius.sm,
          fontSize: theme.typography.bodySmall.fontSize,
          height: "32px",
          display: "flex",
          alignItems: "center",
          minWidth: "fit-content",
          cursor: "not-allowed",
          opacity: 0.5,
        }}
      >
        {children}
      </Text>
    );
  }

  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        color: current ? theme.colors.text.primary : theme.colors.text.secondary,
        fontWeight: current ? theme.typography.label.fontWeight : theme.typography.body.fontWeight,
        padding: `${theme.spacing.base[1]} ${theme.spacing.base[2]}`, // Much smaller padding
        borderRadius: theme.borders.radius.sm,
        transition: theme.animations.transitions.colors,
        backgroundColor: current ? theme.colors.background.secondary : "transparent",
        fontSize: theme.typography.bodySmall.fontSize,
        height: "32px",
        display: "flex",
        alignItems: "center",
        minWidth: "fit-content",
      }}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  to,
  current,
  children,
  onClick,
  disabled = false,
}: {
  to: string;
  current: boolean;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  const { theme } = useTheme();

  if (disabled) {
    return (
      <Text
        style={{
          padding: `${theme.spacing.base[2]} ${theme.spacing.base[3]}`,
          borderRadius: theme.borders.radius.sm,
          color: theme.colors.text.tertiary,
          fontWeight: theme.typography.body.fontWeight,
          fontSize: theme.typography.bodySmall.fontSize,
          display: "block",
          opacity: 0.5,
          cursor: "not-allowed",
        }}
      >
        {children}
      </Text>
    );
  }

  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        padding: `${theme.spacing.base[2]} ${theme.spacing.base[3]}`, // Compact mobile padding
        borderRadius: theme.borders.radius.sm,
        color: current ? theme.colors.text.primary : theme.colors.text.secondary,
        fontWeight: current ? theme.typography.label.fontWeight : theme.typography.body.fontWeight,
        backgroundColor: current ? theme.colors.background.secondary : "transparent",
        fontSize: theme.typography.bodySmall.fontSize,
        display: "block",
        transition: theme.animations.transitions.colors,
      }}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
