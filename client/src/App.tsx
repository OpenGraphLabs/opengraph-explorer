import { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { Theme, Box, Flex, Text, Button, Avatar } from "@radix-ui/themes";
import { ConnectButton, useCurrentWallet } from "@mysten/dapp-kit";
import { Home } from "./pages/Home";
import { Models } from "./pages/Models";
import { ModelDetail } from "./pages/ModelDetail";
import { UploadModel } from "./pages/UploadModel";
import { Profile } from "./pages/Profile";
import { HamburgerMenuIcon, GitHubLogoIcon } from "@radix-ui/react-icons";

export default function App() {
  const location = useLocation();
  const { isConnected, currentWallet } = useCurrentWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <Theme appearance="light" accentColor="orange">
      <Box style={{ 
        maxWidth: "1200px", 
        margin: "0 auto", 
        padding: "0 16px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column"
      }}>
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
            zIndex: 100
          }}
        >
          {/* Logo and Navigation */}
          <Flex align="center" gap="6">
            <Link to="/" style={{ textDecoration: "none" }}>
              <Flex align="center" gap="2">
                <Box style={{ 
                  width: "32px", 
                  height: "32px", 
                  borderRadius: "8px", 
                  background: "#FF5733",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "18px"
                }}>
                  H
                </Box>
                <Text 
                  size="5" 
                  weight="bold" 
                  style={{ 
                    color: "#333",
                    display: "none"
                  }}
                  className="sm:block"
                >
                  HuggingFace 3.0
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
              <NavLink to="/upload" current={location.pathname === "/upload"}>
                Upload
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
                textDecoration: "none"
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
                padding: "8px 16px"
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
                    cursor: "pointer"
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
              padding: "16px"
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
                  background: location.pathname === "/" ? "#FFF4F0" : "transparent"
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
                  background: location.pathname === "/models" ? "#FFF4F0" : "transparent"
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Models
              </Link>
              <Link 
                to="/upload" 
                style={{ 
                  textDecoration: "none", 
                  padding: "8px 16px", 
                  borderRadius: "8px",
                  color: location.pathname === "/upload" ? "#FF5733" : "#333",
                  fontWeight: location.pathname === "/upload" ? "bold" : "normal",
                  background: location.pathname === "/upload" ? "#FFF4F0" : "transparent"
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Upload
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
                    background: location.pathname === "/profile" ? "#FFF4F0" : "transparent"
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
            marginTop: "auto"
          }}
        >
          <Text size="2" style={{ color: "#777" }}>
            © 2023 HuggingFace 3.0 - Powered by Sui Blockchain
          </Text>
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
function NavLink({ to, current, children }: { to: string; current: boolean; children: React.ReactNode }) {
  return (
    <Link 
      to={to} 
      style={{ 
        textDecoration: "none", 
        color: current ? "#FF5733" : "#333",
        fontWeight: current ? "bold" : "normal",
        position: "relative",
        padding: "4px 0"
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
            borderRadius: "2px"
          }} 
        />
      )}
    </Link>
  );
}
