import { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Theme, Box, Flex, Text, Button, Avatar } from "@radix-ui/themes";
import { ConnectButton, useCurrentWallet } from "@mysten/dapp-kit";
import { Home } from "@/pages/Home";
import { Models } from "@/pages/Models";
import { ModelDetail } from "@/pages/ModelDetail";
import { UploadModel } from "@/pages/UploadModel";
import { UploadDataset } from "@/pages/UploadDataset";
import { Profile } from "@/pages/Profile";
import { Datasets } from "@/pages/Datasets";
import { Annotator } from "@/pages/Annotator";
import { HamburgerMenuIcon, GitHubLogoIcon, SunIcon, MoonIcon } from "@radix-ui/react-icons";
import logoImage from "@/assets/logo/logo.png";
import { DatasetDetail } from "@/pages/DatasetDetail";
import { useTheme, useThemeColors } from "@/shared/ui/theme";

export default function App() {
  const location = useLocation();
  const { isConnected, currentWallet } = useCurrentWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { mode, toggleTheme } = useTheme();
  const colors = useThemeColors();

  return (
    <Theme appearance="light" accentColor="orange">
      <Box
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 16px",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
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
                    color: colors.text.brand,
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

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              onClick={toggleTheme}
              style={{ 
                padding: "8px",
                background: "transparent",
                color: colors.text.secondary 
              }}
            >
              {mode === 'light' ? (
                <MoonIcon width="20" height="20" />
              ) : (
                <SunIcon width="20" height="20" />
              )}
            </Button>

            {/* GitHub Link */}
            <a
              href="https://github.com/yourusername/huggingface-3.0"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                color: colors.text.secondary,
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
                background: isConnected ? colors.background.card : colors.interactive.primary,
                color: isConnected ? colors.text.primary : colors.text.inverse,
                border: isConnected ? `1px solid ${colors.border.primary}` : "none",
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
                    background: colors.interactive.primary,
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
              background: "white",
              borderBottom: "1px solid var(--gray-4)",
              zIndex: 99,
              padding: "16px",
            }}
            className="block md:hidden"
          >
            <Flex direction="column" gap="3">
              <Link
                to="/"
                style={{
                  textDecoration: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  color: location.pathname === "/" ? "#FF5733" : "#333",
                  fontWeight: location.pathname === "/" ? "bold" : "normal",
                  background: location.pathname === "/" ? "#FFF4F0" : "transparent",
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/models"
                style={{
                  textDecoration: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  color: location.pathname === "/models" ? "#FF5733" : "#333",
                  fontWeight: location.pathname === "/models" ? "bold" : "normal",
                  background: location.pathname === "/models" ? "#FFF4F0" : "transparent",
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Models
              </Link>
              <Link
                to="/datasets"
                style={{
                  textDecoration: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  color: location.pathname === "/datasets" ? "#FF5733" : "#333",
                  fontWeight: location.pathname === "/datasets" ? "bold" : "normal",
                  background: location.pathname === "/datasets" ? "#FFF4F0" : "transparent",
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Datasets
              </Link>
              <Link
                to="/annotator"
                style={{
                  textDecoration: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  color: location.pathname === "/annotator" ? "#FF5733" : "#333",
                  fontWeight: location.pathname === "/annotator" ? "bold" : "normal",
                  background: location.pathname === "/annotator" ? "#FFF4F0" : "transparent",
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Annotator
              </Link>
              <Link
                to="/upload"
                style={{
                  textDecoration: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  color: location.pathname === "/upload" ? "#FF5733" : "#333",
                  fontWeight: location.pathname === "/upload" ? "bold" : "normal",
                  background: location.pathname === "/upload" ? "#FFF4F0" : "transparent",
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Upload Model
              </Link>
              {isConnected && (
                <Link
                  to="/profile"
                  style={{
                    textDecoration: "none",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    color: location.pathname === "/profile" ? "#FF5733" : "#333",
                    fontWeight: location.pathname === "/profile" ? "bold" : "normal",
                    background: location.pathname === "/profile" ? "#FFF4F0" : "transparent",
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
              )}
            </Flex>
          </Box>
        )}

        {/* Main Content */}
        <Box py="6" style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/models" element={<Models />} />
            <Route path="/models/:id" element={<ModelDetail />} />
            <Route path="/upload" element={<UploadModel />} />
            <Route path="/datasets" element={<Datasets />} />
            <Route path="/datasets/upload" element={<UploadDataset />} />
            <Route path="/datasets/:id" element={<DatasetDetail />} />
            <Route path="/annotator" element={<Annotator />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Box>

        {/* Footer */}
        <Flex
          justify="between"
          align="center"
          py="4"
          style={{
            borderTop: "1px solid var(--gray-4)",
            marginTop: "auto",
            padding: "20px 0",
          }}
        >
          <Flex align="center" gap="2">
            <img
              src={logoImage}
              alt="OpenGraph Logo"
              style={{
                width: "24px",
                height: "24px",
                objectFit: "contain",
              }}
            />
            <Text size="2" style={{ color: "#777" }}>
              © {new Date().getFullYear()} OpenGraph - Powered by Sui Blockchain
            </Text>
          </Flex>
          <Flex gap="4">
            <a href="#" style={{ textDecoration: "none", color: "#777", fontSize: "14px" }}>
              Terms
            </a>
            <a href="#" style={{ textDecoration: "none", color: "#777", fontSize: "14px" }}>
              Privacy
            </a>
            <a href="#" style={{ textDecoration: "none", color: "#777", fontSize: "14px" }}>
              Contact
            </a>
          </Flex>
        </Flex>
      </Box>
    </Theme>
  );
}

// Navigation Link Component
function NavLink({
  to,
  current,
  children,
}: {
  to: string;
  current: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        color: current ? "#FF5733" : "#333",
        fontWeight: current ? "bold" : "normal",
        position: "relative",
        padding: "4px 0",
      }}
    >
      {children}
      {current && (
        <Box
          style={{
            position: "absolute",
            bottom: "-4px",
            left: 0,
            right: 0,
            height: "2px",
            background: "#FF5733",
            borderRadius: "2px",
          }}
        />
      )}
    </Link>
  );
}
