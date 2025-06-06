import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Flex, Text, Button, Avatar, Box } from "@radix-ui/themes";
import { ConnectButton, useCurrentWallet } from "@mysten/dapp-kit";
import { HamburgerMenuIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import logoImage from "../assets/logo/logo.png";

interface NavLinkProps {
  to: string;
  current: boolean;
  children: React.ReactNode;
}

function NavLink({ to, current, children }: NavLinkProps) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        color: current ? "#FF5733" : "#333",
        fontWeight: current ? "bold" : "normal",
        padding: "8px 12px",
        borderRadius: "6px",
        background: current ? "#FFF4F0" : "transparent",
        transition: "all 0.2s ease",
      }}
    >
      {children}
    </Link>
  );
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  currentPath: string;
}

function MobileMenu({ isOpen, onClose, isConnected, currentPath }: MobileMenuProps) {
  if (!isOpen) return null;

  const menuItems = [
    { to: "/", label: "Home" },
    { to: "/models", label: "Models" },
    { to: "/datasets", label: "Datasets" },
    { to: "/annotator", label: "Annotator" },
    { to: "/upload", label: "Upload Model" },
  ];

  return (
    <Box
      style={{
        position: "fixed",
        top: "64px",
        left: 0,
        right: 0,
        background: "white",
        borderBottom: "1px solid var(--gray-4)",
        zIndex: 99,
        padding: "16px",
      }}
      className="block md:hidden"
    >
      <Flex direction="column" gap="3">
        {menuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            style={{
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              color: currentPath === item.to ? "#FF5733" : "#333",
              fontWeight: currentPath === item.to ? "bold" : "normal",
              background: currentPath === item.to ? "#FFF4F0" : "transparent",
            }}
            onClick={onClose}
          >
            {item.label}
          </Link>
        ))}
        
        {isConnected && (
          <Link
            to="/profile"
            style={{
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              color: currentPath === "/profile" ? "#FF5733" : "#333",
              fontWeight: currentPath === "/profile" ? "bold" : "normal",
              background: currentPath === "/profile" ? "#FFF4F0" : "transparent",
            }}
            onClick={onClose}
          >
            Profile
          </Link>
        )}
      </Flex>
    </Box>
  );
}

export function Header() {
  const location = useLocation();
  const { isConnected, currentWallet } = useCurrentWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <Flex
        justify="between"
        align="center"
        py="4"
        style={{
          borderBottom: "1px solid var(--gray-4)",
          position: "sticky",
          top: 0,
          background: "white",
          zIndex: 100,
        }}
      >
        {/* Logo and Navigation */}
        <Flex align="center" gap="6">
          <Link to="/" style={{ textDecoration: "none" }}>
            <Flex align="center" gap="2">
              <img
                src={logoImage}
                alt="OpenGraph Logo"
                style={{
                  width: "40px",
                  height: "40px",
                  objectFit: "contain",
                }}
              />
              <Text
                size="5"
                weight="bold"
                style={{
                  color: "#FF5500",
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
              variant="ghost"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{ padding: "8px" }}
            >
              <HamburgerMenuIcon width="20" height="20" />
            </Button>
          </Box>

          {/* GitHub Link */}
          <a
            href="https://github.com/yourusername/huggingface-3.0"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              color: "#333",
              textDecoration: "none",
            }}
          >
            <GitHubLogoIcon width="20" height="20" />
          </a>

          {/* Connect Button */}
          <ConnectButton
            connectText="Connect Wallet"
            style={{
              borderRadius: "8px",
              background: isConnected ? "white" : "#FF5733",
              color: isConnected ? "#333" : "white",
              border: isConnected ? "1px solid var(--gray-5)" : "none",
              fontWeight: 500,
              padding: "8px 16px",
            }}
          />

          {/* Profile Link (when connected) */}
          {isConnected && (
            <Link to="/profile" style={{ textDecoration: "none" }}>
              <Avatar
                size="2"
                fallback={currentWallet?.accounts[0]?.address[0] || "U"}
                style={{
                  background: "#FF5733",
                  cursor: "pointer",
                }}
              />
            </Link>
          )}
        </Flex>
      </Flex>

      {/* Mobile Navigation Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isConnected={isConnected}
        currentPath={location.pathname}
      />
    </>
  );
} 