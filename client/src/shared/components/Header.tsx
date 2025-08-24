import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Box, Flex, Text, Avatar, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import {
  HamburgerMenuIcon,
  GitHubLogoIcon,
  SunIcon,
  MoonIcon,
  ExitIcon,
  EnterIcon,
} from "@radix-ui/react-icons";
import { requiresAuth } from "@/shared/config/routePermissions";
import { useAuth } from "@/contexts/data/AuthContext";
import { useZkLogin } from "@/contexts/data/ZkLoginContext";
import { useMobile } from "@/shared/hooks";
import logoImage from "@/assets/logo/logo.png";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { clearSession } = useZkLogin();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { mode, toggleTheme, theme } = useTheme();
  const { isMobile, isTablet, breakpoint } = useMobile();

  const handleLogout = () => {
    // Clear auth contexts
    logout();
    clearSession();
    // Clear any other session data
    sessionStorage.removeItem("access_token");
    // Reload to show login screen
    window.location.reload();
  };

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
          <Link to="/" style={{ textDecoration: "none" }}>
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
              {/* Show brand text only on non-mobile devices */}
              {!isMobile && (
                <Text
                  size="3"
                  style={{
                    color: theme.colors.text.primary,
                    fontWeight: theme.typography.h4.fontWeight,
                    letterSpacing: "-0.01em",
                  }}
                >
                  OpenGraph
                </Text>
              )}
            </Flex>
          </Link>

          {/* Desktop Navigation - Show only on non-mobile devices */}
          {!isMobile && (
            <Flex gap="1">
              {/* Reduced gap */}
            {/* <NavLink
              to="/models"
              current={location.pathname === "/models"}
              disabled={!isConnected && requiresWallet("/models")}
            >
              Models
            </NavLink> */}
            <NavLink
              to="/earn"
              current={location.pathname === "/earn"}
              disabled={!isAuthenticated && requiresAuth("/earn")}
            >
              Earn
            </NavLink>
            <NavLink
              to="/datasets"
              current={location.pathname === "/datasets"}
              disabled={!isAuthenticated && requiresAuth("/datasets")}
            >
              Dataset
            </NavLink>
            </Flex>
          )}
        </Flex>

        {/* Right Side - Compact Actions */}
        <Flex align="center" gap="2">
          {" "}
          {/* Reduced gap */}
          {/* Mobile Menu Button - Show only on mobile */}
          {isMobile && (
            <Button
              variant="tertiary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                padding: theme.spacing.base[1],
                minHeight: "32px",
                minWidth: "32px",
                color: theme.colors.text.primary, // Ensure visibility in both themes
                border: `1px solid ${theme.colors.border.secondary}`,
              }}
            >
              <HamburgerMenuIcon 
                width="16" 
                height="16" 
                style={{ color: theme.colors.text.primary }}
              />
            </Button>
          )}
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
          {/* User Display */}
          {isAuthenticated && user ? (
            <Flex align="center" gap="2">
              {/* Profile Avatar Link */}
              <Link to="/profile" style={{ textDecoration: "none" }}>
                <Avatar
                  size="1"
                  src={user.picture}
                  fallback={
                    user.name?.substring(0, 2).toUpperCase() ||
                    user.email?.substring(0, 2).toUpperCase() ||
                    "U"
                  }
                  style={{
                    background: theme.colors.interactive.primary,
                    cursor: "pointer",
                    width: "32px",
                    height: "32px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: theme.colors.text.inverse,
                  }}
                />
              </Link>
              {/* User Info - Hide on mobile, show abbreviated on tablet */}
              {!isMobile && (
                <Text
                  size="2"
                  style={{
                    color: theme.colors.text.primary,
                    fontWeight: 500,
                    maxWidth: isTablet ? "80px" : "120px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user.name || user.email?.split("@")[0] || "User"}
                </Text>
              )}

              {/* Logout Button - Responsive */}
              <button
                onClick={handleLogout}
                style={{
                  background: "transparent",
                  border: `1px solid ${theme.colors.border.secondary}`,
                  borderRadius: theme.borders.radius.sm,
                  padding: isMobile 
                    ? `${theme.spacing.base[1]}`
                    : `${theme.spacing.base[1]} ${theme.spacing.base[2]}`,
                  fontSize: "13px",
                  fontWeight: 500,
                  color: theme.colors.text.secondary,
                  cursor: "pointer",
                  height: "32px",
                  minWidth: isMobile ? "32px" : "auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 150ms ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = theme.colors.border.primary;
                  e.currentTarget.style.color = theme.colors.text.primary;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = theme.colors.border.secondary;
                  e.currentTarget.style.color = theme.colors.text.secondary;
                }}
                title={isMobile ? "Sign out" : undefined}
              >
                <ExitIcon 
                  width="14" 
                  height="14" 
                  style={{ 
                    marginRight: isMobile ? "0" : "4px" 
                  }} 
                />
                {!isMobile && "Sign out"}
              </button>
            </Flex>
          ) : (
            <>
              {/* Login Button - Minimal and Professional */}
              <button
                onClick={() => navigate("/login")}
                style={{
                  background: theme.colors.interactive.primary,
                  border: "none",
                  borderRadius: theme.borders.radius.sm,
                  padding: `${theme.spacing.base[1]} ${theme.spacing.base[3]}`,
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "white",
                  cursor: "pointer",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  transition: "all 150ms ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.opacity = "0.9";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Sign in
                <EnterIcon width="14" height="14" style={{ marginLeft: "4px" }} />
              </button>
            </>
          )}
        </Flex>
      </Flex>

      {/* Mobile Navigation Menu - Show only on mobile */}
      {isMobile && isMobileMenuOpen && (
        <Box
          style={{
            position: "fixed",
            top: "56px", // Match header height
            left: 0,
            right: 0,
            backgroundColor: theme.colors.background.primary,
            borderBottom: `1px solid ${theme.colors.border.primary}`,
            zIndex: 99,
            padding: theme.spacing.base[3],
            boxShadow: theme.shadows.semantic.overlay.dropdown,
            backdropFilter: "blur(10px)",
          }}
        >
          <Flex direction="column" gap="1">
            <MobileNavLink
              to="/"
              current={location.pathname === "/"}
              onClick={() => setIsMobileMenuOpen(false)}
              disabled={false}
            >
              Home
            </MobileNavLink>
            <MobileNavLink
              to="/earn"
              current={location.pathname === "/earn"}
              onClick={() => setIsMobileMenuOpen(false)}
              disabled={!isAuthenticated && requiresAuth("/earn")}
            >
              Earn
            </MobileNavLink>
            <MobileNavLink
              to="/datasets"
              current={location.pathname === "/datasets"}
              onClick={() => setIsMobileMenuOpen(false)}
              disabled={!isAuthenticated && requiresAuth("/datasets")}
            >
              Dataset
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
