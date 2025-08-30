import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Box, Flex, Text, Avatar, Button } from "@/shared/ui/design-system/components";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useTheme } from "@/shared/ui/design-system";
import {
  HamburgerMenuIcon,
  GitHubLogoIcon,
  SunIcon,
  MoonIcon,
  ExitIcon,
  EnterIcon,
  PersonIcon,
  ChevronDownIcon,
  Cross2Icon,
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
          paddingLeft: isMobile ? theme.spacing.base[3] : theme.spacing.base[4],
          paddingRight: isMobile ? theme.spacing.base[3] : theme.spacing.base[4],
        }}
      >
        {/* Mobile Hamburger Menu - Left side for mobile */}
        {isMobile && (
          <Button
            variant="tertiary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              padding: theme.spacing.base[2],
              minHeight: "40px",
              minWidth: "40px",
              color: theme.colors.text.primary,
              border: `2px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.md,
              backgroundColor: isMobileMenuOpen ? theme.colors.background.secondary : "transparent",
              boxShadow: isMobileMenuOpen ? theme.shadows.semantic.card.medium : "none",
            }}
          >
            <HamburgerMenuIcon
              width="20"
              height="20"
              style={{ color: theme.colors.text.primary }}
            />
          </Button>
        )}

        {/* Logo and Navigation */}
        <Flex
          align="center"
          gap="6"
          style={{
            marginLeft: isMobile ? "0" : "0",
            flex: isMobile ? "1" : "0",
            justifyContent: isMobile ? "center" : "flex-start",
          }}
        >
          <Link to="/" style={{ textDecoration: "none" }}>
            <Flex
              align="center"
              gap="2"
              style={{
                height: "100%", // Take full height of header
                alignItems: "center", // Ensure perfect vertical centering
              }}
            >
              <img
                src={logoImage}
                alt="OpenGraph"
                style={{
                  width: "28px",
                  height: "28px",
                  objectFit: "contain",
                }}
              />
              {/* Show brand text - on mobile too for better visibility */}
              <Text
                size={isMobile ? "2" : "3"}
                style={{
                  color: theme.colors.text.primary,
                  fontWeight: theme.typography.h4.fontWeight,
                  letterSpacing: "-0.01em",
                  lineHeight: "1", // Prevent text from affecting vertical alignment
                }}
                as="span"
              >
                OpenGraph
              </Text>
            </Flex>
          </Link>

          {/* Desktop Navigation - Show only on non-mobile devices */}
          {!isMobile && (
            <Flex gap="1">
              <NavLink
                to="/earn"
                current={location.pathname === "/earn"}
                disabled={!isAuthenticated && requiresAuth("/earn")}
              >
                Earn
              </NavLink>
              {/*<NavLink*/}
              {/*  to="/datasets"*/}
              {/*  current={location.pathname === "/datasets"}*/}
              {/*  disabled={!isAuthenticated && requiresAuth("/datasets")}*/}
              {/*>*/}
              {/*  Dataset*/}
              {/*</NavLink>*/}
              <NavLink
                to="/tasks"
                current={location.pathname === "/tasks"}
                disabled={!isAuthenticated && requiresAuth("/tasks")}
              >
                Task
              </NavLink>
              <NavLink
                to="/leaderboard"
                current={location.pathname === "/leaderboard"}
                disabled={!isAuthenticated && requiresAuth("/leaderboard")}
              >
                Leaderboard
              </NavLink>
            </Flex>
          )}
        </Flex>

        {/* Right Side - Compact Actions */}
        <Flex justify="center" align="center" gap="2">
          {/* Desktop Only - Theme Toggle and Social Links */}
          {!isMobile && (
            <>
              {/* Theme Settings Group */}
              <Flex
                justify="center"
                align="center"
                gap="1"
                style={{
                  padding: "2px",
                  borderRadius: theme.borders.radius.sm,
                  backgroundColor: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.secondary}`,
                  minWidth: "30px", // Match external links group width
                }}
              >
                <div title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}>
                  <Button
                    variant="tertiary"
                    onClick={toggleTheme}
                    style={{
                      padding: theme.spacing.base[1],
                      minHeight: "28px",
                      minWidth: "28px",
                      color: theme.colors.text.secondary,
                      background: "transparent",
                      border: "none",
                      flex: 1, // Take full width of container
                      justifyContent: "center",
                    }}
                  >
                    {mode === "light" ? (
                      <MoonIcon width="14" height="14" />
                    ) : (
                      <SunIcon width="14" height="14" />
                    )}
                  </Button>
                </div>
              </Flex>

              {/* External Links Group */}
              <Flex
                align="center"
                gap="1"
                style={{
                  padding: "2px",
                  borderRadius: theme.borders.radius.sm,
                  backgroundColor: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.secondary}`,
                }}
              >
                {/* X (Twitter) Link */}
                <a
                  href="https://x.com/OpenGraph_Labs"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme.colors.text.secondary,
                    textDecoration: "none",
                    padding: theme.spacing.base[1],
                    minHeight: "28px",
                    minWidth: "28px",
                    borderRadius: theme.borders.radius.sm,
                    transition: theme.animations.transitions.colors,
                  }}
                  title="Follow us on X"
                  onMouseEnter={e => {
                    e.currentTarget.style.color = theme.colors.text.primary;
                    e.currentTarget.style.backgroundColor = theme.colors.background.primary;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = theme.colors.text.secondary;
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  {/* Custom X logo */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* GitHub Link */}
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
                    minHeight: "28px",
                    minWidth: "28px",
                    borderRadius: theme.borders.radius.sm,
                    transition: theme.animations.transitions.colors,
                  }}
                  title="View source on GitHub"
                  onMouseEnter={e => {
                    e.currentTarget.style.color = theme.colors.text.primary;
                    e.currentTarget.style.backgroundColor = theme.colors.background.primary;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = theme.colors.text.secondary;
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <GitHubLogoIcon width="14" height="14" />
                </a>
              </Flex>
            </>
          )}
          {/* Profile Dropdown */}
          {isAuthenticated && user ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  style={{
                    background: "transparent",
                    border: "none",
                    borderRadius: theme.borders.radius.md,
                    padding: theme.spacing.base[1],
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: isMobile ? "0" : theme.spacing.base[1],
                    transition: theme.animations.transitions.colors,
                    height: "32px",
                  }}
                >
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
                      width: "28px",
                      height: "28px",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: theme.colors.text.inverse,
                    }}
                  />
                  {!isMobile && (
                    <ChevronDownIcon
                      width="14"
                      height="14"
                      style={{ color: theme.colors.text.secondary }}
                    />
                  )}
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  style={{
                    backgroundColor: theme.colors.background.card,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borders.radius.md,
                    padding: theme.spacing.base[2],
                    boxShadow: theme.shadows.semantic.overlay.dropdown,
                    minWidth: "200px",
                    zIndex: 1000,
                  }}
                >
                  {/* User Info Header */}
                  <div
                    style={{
                      padding: theme.spacing.base[2],
                      borderBottom: `1px solid ${theme.colors.border.secondary}`,
                      marginBottom: theme.spacing.base[1],
                    }}
                  >
                    <Text
                      size="3"
                      style={{
                        color: theme.colors.text.primary,
                        fontWeight: 600,
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      {user.name || "User"}
                    </Text>
                    <Text
                      size="2"
                      style={{
                        color: theme.colors.text.secondary,
                        display: "block",
                      }}
                    >
                      {user.email}
                    </Text>
                  </div>

                  {/* Profile Link */}
                  <DropdownMenu.Item asChild>
                    <Link
                      to="/profile"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: theme.spacing.base[2],
                        padding: `${theme.spacing.base[2]} ${theme.spacing.base[2]}`,
                        textDecoration: "none",
                        color: theme.colors.text.primary,
                        borderRadius: theme.borders.radius.sm,
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: 500,
                        transition: theme.animations.transitions.colors,
                        marginBottom: "4px",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <PersonIcon width="16" height="16" />
                      Profile
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator
                    style={{
                      height: "1px",
                      backgroundColor: theme.colors.border.secondary,
                      margin: `${theme.spacing.base[1]} 0`,
                    }}
                  />

                  {/* Logout */}
                  <DropdownMenu.Item asChild>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: theme.spacing.base[2],
                        padding: `${theme.spacing.base[2]} ${theme.spacing.base[2]}`,
                        background: "transparent",
                        border: "none",
                        color: theme.colors.text.primary,
                        borderRadius: theme.borders.radius.sm,
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: 500,
                        transition: theme.animations.transitions.colors,
                        textAlign: "left",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      <ExitIcon width="16" height="16" />
                      Sign out
                    </button>
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
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
          <Flex direction="column" gap="3">
            {/* Navigation Links */}
            <Flex direction="column" gap="1">
              <Text
                size="2"
                style={{
                  color: theme.colors.text.tertiary,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  marginBottom: "8px",
                }}
              >
                Navigation
              </Text>
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
                to="/tasks"
                current={location.pathname === "/tasks"}
                onClick={() => setIsMobileMenuOpen(false)}
                disabled={!isAuthenticated && requiresAuth("/tasks")}
              >
                Task
              </MobileNavLink>
              <MobileNavLink
                to="/leaderboard"
                current={location.pathname === "/leaderboard"}
                onClick={() => setIsMobileMenuOpen(false)}
                disabled={!isAuthenticated && requiresAuth("/leaderboard")}
              >
                Leaderboard
              </MobileNavLink>
            </Flex>

            {/* Quick Actions Section */}
            <Flex
              direction="row"
              align="center"
              gap="3"
              justify="center"
              style={{
                paddingTop: theme.spacing.base[3],
                borderTop: `1px solid ${theme.colors.border.secondary}`,
              }}
            >
              {/* Theme Toggle */}
              <button
                onClick={() => {
                  toggleTheme();
                  setIsMobileMenuOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: `${theme.spacing.base[2]}`,
                  background: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.secondary}`,
                  color: theme.colors.text.primary,
                  borderRadius: theme.borders.radius.md,
                  cursor: "pointer",
                  transition: theme.animations.transitions.colors,
                  width: "44px",
                  height: "44px",
                }}
                title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = theme.colors.background.primary;
                  e.currentTarget.style.borderColor = theme.colors.border.primary;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
                  e.currentTarget.style.borderColor = theme.colors.border.secondary;
                }}
              >
                {mode === "light" ? (
                  <MoonIcon width="18" height="18" />
                ) : (
                  <SunIcon width="18" height="18" />
                )}
              </button>

              {/* X Link */}
              <a
                href="https://x.com/OpenGraph_Labs"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: `${theme.spacing.base[2]}`,
                  background: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.secondary}`,
                  textDecoration: "none",
                  color: theme.colors.text.primary,
                  borderRadius: theme.borders.radius.md,
                  cursor: "pointer",
                  transition: theme.animations.transitions.colors,
                  width: "44px",
                  height: "44px",
                }}
                title="Follow on X"
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = theme.colors.background.primary;
                  e.currentTarget.style.borderColor = theme.colors.border.primary;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
                  e.currentTarget.style.borderColor = theme.colors.border.secondary;
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* GitHub Link */}
              <a
                href="https://github.com/OpenGraphLabs/opengraph-explorer"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: `${theme.spacing.base[2]}`,
                  background: theme.colors.background.secondary,
                  border: `1px solid ${theme.colors.border.secondary}`,
                  textDecoration: "none",
                  color: theme.colors.text.primary,
                  borderRadius: theme.borders.radius.md,
                  cursor: "pointer",
                  transition: theme.animations.transitions.colors,
                  width: "44px",
                  height: "44px",
                }}
                title="View on GitHub"
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = theme.colors.background.primary;
                  e.currentTarget.style.borderColor = theme.colors.border.primary;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
                  e.currentTarget.style.borderColor = theme.colors.border.secondary;
                }}
              >
                <GitHubLogoIcon width="18" height="18" />
              </a>
            </Flex>
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
