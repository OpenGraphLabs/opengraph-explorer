import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton, useCurrentWallet } from '@mysten/dapp-kit';
import { 
  Box, 
  Flex, 
  Text, 
  Avatar,
  Button
} from '@/shared/ui/design-system/components';
import { useTheme } from '@/shared/ui/design-system';
import { HamburgerMenuIcon, GitHubLogoIcon, SunIcon, MoonIcon } from '@radix-ui/react-icons';
import logoImage from '@/assets/logo/logo.png';

export function Header() {
  const location = useLocation();
  const { isConnected, currentWallet } = useCurrentWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { mode, toggleTheme, theme } = useTheme();

  return (
    <>
      {/* Header */}
      <Flex
        justify="between"
        align="center"
        py="4"
        style={{
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          position: 'sticky',
          top: 0,
          backgroundColor: theme.colors.background.primary,
          zIndex: 100,
        }}
      >
        {/* Logo and Navigation */}
        <Flex align="center" gap="6">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Flex align="center" gap="2">
              <img
                src={logoImage}
                alt="OpenGraph Logo"
                style={{
                  width: '40px',
                  height: '40px',
                  objectFit: 'contain',
                }}
              />
              <Text
                size="5"
                weight="bold"
                style={{
                  color: theme.colors.text.brand,
                }}
                className="sm:block"
              >
                OpenGraph
              </Text>
            </Flex>
          </Link>

          {/* Desktop Navigation */}
          <Flex gap="6" className="hidden md:flex">
            <NavLink to="/" current={location.pathname === "/"}>
              Home
            </NavLink>
            <NavLink to="/models" current={location.pathname === "/models"}>
              Models
            </NavLink>
            <NavLink to="/datasets" current={location.pathname === "/datasets"}>
              Datasets
            </NavLink>
            <NavLink to="/upload" current={location.pathname === "/upload"}>
              Upload Model
            </NavLink>
            <NavLink to="/annotator" current={location.pathname === "/annotator"}>
              Annotator
            </NavLink>
          </Flex>
        </Flex>

        {/* Right Side - Connect Button and Profile */}
        <Flex align="center" gap="4">
          {/* Mobile Menu Button */}
          <Box className="block md:hidden">
            <Button
              variant="tertiary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ padding: "8px" }}
            >
              <HamburgerMenuIcon width="20" height="20" />
            </Button>
          </Box>

          {/* Theme Toggle */}
          <Button
            variant="tertiary"
            onClick={toggleTheme}
            style={{
              padding: "8px",
              color: theme.colors.text.secondary,
            }}
          >
            {mode === "light" ? (
              <MoonIcon width="20" height="20" />
            ) : (
              <SunIcon width="20" height="20" />
            )}
          </Button>

          {/* GitHub Link */}
          <a
            href="https://github.com/yourusername/opengraph-explorer"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              color: theme.colors.text.secondary,
              textDecoration: "none",
            }}
          >
            <GitHubLogoIcon width="20" height="20" />
          </a>

          {/* Connect Button */}
          <ConnectButton
            connectText="Connect Wallet"
            style={{
              borderRadius: theme.borders.radius.md,
              background: isConnected ? theme.colors.background.card : theme.colors.interactive.primary,
              color: isConnected ? theme.colors.text.primary : theme.colors.text.inverse,
              border: isConnected ? `1px solid ${theme.colors.border.primary}` : "none",
              fontWeight: 500,
              padding: `${theme.spacing.base[2]} ${theme.spacing.base[4]}`,
            }}
          />

          {/* Profile Link (when connected) */}
          {isConnected && (
            <Link to="/profile" style={{ textDecoration: "none" }}>
              <Avatar
                size="2"
                fallback={currentWallet?.accounts[0]?.address[0] || "U"}
                style={{
                  background: theme.colors.interactive.primary,
                  cursor: "pointer",
                }}
              />
            </Link>
          )}
        </Flex>
      </Flex>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <Box
          style={{
            position: "fixed",
            top: "64px",
            left: 0,
            right: 0,
            backgroundColor: theme.colors.background.primary,
            borderBottom: `1px solid ${theme.colors.border.primary}`,
            zIndex: 99,
            padding: theme.spacing.base[4],
          }}
          className="block md:hidden"
        >
          <Flex direction="column" gap="3">
            <MobileNavLink
              to="/"
              current={location.pathname === "/"}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </MobileNavLink>
            <MobileNavLink
              to="/models"
              current={location.pathname === "/models"}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Models
            </MobileNavLink>
            <MobileNavLink
              to="/datasets"
              current={location.pathname === "/datasets"}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Datasets
            </MobileNavLink>
            <MobileNavLink
              to="/upload"
              current={location.pathname === "/upload"}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Upload Model
            </MobileNavLink>
            <MobileNavLink
              to="/annotator"
              current={location.pathname === "/annotator"}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Annotator
            </MobileNavLink>
          </Flex>
        </Box>
      )}
    </>
  );
}

// Navigation Link Components
function NavLink({
  to,
  current,
  children,
}: {
  to: string;
  current: boolean;
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        color: current ? theme.colors.text.brand : theme.colors.text.secondary,
        fontWeight: current ? "600" : "400",
        padding: `${theme.spacing.base[2]} ${theme.spacing.base[3]}`,
        borderRadius: theme.borders.radius.md,
        transition: theme.animations.transitions.colors,
        backgroundColor: current ? theme.colors.background.accent : "transparent",
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
}: {
  to: string;
  current: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  const { theme } = useTheme();
  
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        padding: `${theme.spacing.base[2]} ${theme.spacing.base[4]}`,
        borderRadius: theme.borders.radius.md,
        color: current ? theme.colors.text.brand : theme.colors.text.primary,
        fontWeight: current ? "600" : "400",
        backgroundColor: current ? theme.colors.background.accent : "transparent",
      }}
      onClick={onClick}
    >
      {children}
    </Link>
  );
} 