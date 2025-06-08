import { Link } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  Grid,
  Button,
  Badge,
  type ModelData,
} from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import {
  RocketIcon,
  GitHubLogoIcon,
  Share1Icon,
  CodeIcon,
  CubeIcon,
  LayersIcon,
  Pencil1Icon,
} from "@radix-ui/react-icons";

export function Home() {
  const { theme } = useTheme();

  return (
    <Box
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: `0 ${theme.spacing.base[4]}`,
      }}
    >
      {/* Compact Hero Section */}
      <Box py="6" mb="4">
        <Flex direction="column" align="center" gap="3" mb="4">
          <Heading
            size="7"
            align="center"
            style={{
              fontWeight: theme.typography.h1.fontWeight,
              background: theme.gradients.primary,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              maxWidth: "900px",
              lineHeight: "1.2",
            }}
          >
            Verifiable ML Infrastructure
          </Heading>

          <Text
            size="3"
            align="center"
            style={{
              maxWidth: "700px",
              color: theme.colors.text.secondary,
              lineHeight: "1.4",
            }}
          >
            Onchain machine learning with complete transparency. Build, verify, and deploy ML models
            on Sui & Walrus.
          </Text>

          <Flex gap="3" mt="3">
            <Link to="/models">
              <Box
                style={{
                  display: "inline-block",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  const button = e.currentTarget.querySelector("button");
                  if (button) {
                    button.style.background = theme.colors.interactive.accent;
                    button.style.boxShadow = `0 4px 12px ${theme.colors.interactive.accent}35`;
                    button.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  const button = e.currentTarget.querySelector("button");
                  if (button) {
                    button.style.background = theme.colors.interactive.primary;
                    button.style.boxShadow = `0 2px 8px ${theme.colors.interactive.primary}25`;
                    button.style.transform = "translateY(0)";
                  }
                }}
              >
                <Button
                  variant="primary"
                  size="md"
                  style={{
                    fontSize: theme.typography.bodySmall.fontSize,
                    padding: `${theme.spacing.base[2]} ${theme.spacing.base[4]}`,
                    height: "40px",
                    background: theme.colors.interactive.primary,
                    color: theme.colors.text.inverse,
                    border: "none",
                    borderRadius: theme.borders.radius.sm,
                    boxShadow: `0 2px 8px ${theme.colors.interactive.primary}25`,
                    transition: "all 0.2s ease",
                    fontWeight: 600,
                  }}
                >
                  Explore Models
                </Button>
              </Box>
            </Link>
            <Link to="/upload">
              <Box
                style={{
                  display: "inline-block",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  const button = e.currentTarget.querySelector("button");
                  if (button) {
                    button.style.borderColor = theme.colors.interactive.primary;
                    button.style.background = `${theme.colors.interactive.primary}08`;
                    button.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  const button = e.currentTarget.querySelector("button");
                  if (button) {
                    button.style.borderColor = theme.colors.border.primary;
                    button.style.background = theme.colors.background.card;
                    button.style.transform = "translateY(0)";
                  }
                }}
              >
                <Button
                  variant="secondary"
                  size="md"
                  style={{
                    fontSize: theme.typography.bodySmall.fontSize,
                    padding: `${theme.spacing.base[2]} ${theme.spacing.base[4]}`,
                    height: "40px",
                    background: theme.colors.background.card,
                    color: theme.colors.text.primary,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borders.radius.sm,
                    transition: "all 0.2s ease",
                    fontWeight: 500,
                  }}
                >
                  Upload Model
                </Button>
              </Box>
            </Link>
          </Flex>
        </Flex>

        {/* Compact Stats Row */}
        <Flex justify="center" gap="8" py="3">
          <Flex direction="column" align="center" gap="1">
            <Text
              size="4"
              style={{
                fontWeight: theme.typography.h4.fontWeight,
                color: theme.colors.text.primary,
              }}
            >
              1,250+
            </Text>
            <Text
              size="1"
              style={{
                color: theme.colors.text.secondary,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Models
            </Text>
          </Flex>
          <Flex direction="column" align="center" gap="1">
            <Text
              size="4"
              style={{
                fontWeight: theme.typography.h4.fontWeight,
                color: theme.colors.text.primary,
              }}
            >
              340TB
            </Text>
            <Text
              size="1"
              style={{
                color: theme.colors.text.secondary,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              On-chain Data
            </Text>
          </Flex>
          <Flex direction="column" align="center" gap="1">
            <Text
              size="4"
              style={{
                fontWeight: theme.typography.h4.fontWeight,
                color: theme.colors.text.primary,
              }}
            >
              99.9%
            </Text>
            <Text
              size="1"
              style={{
                color: theme.colors.text.secondary,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Verifiable
            </Text>
          </Flex>
        </Flex>
      </Box>

      {/* Main Content Grid */}
      <Grid columns={{ initial: "1", lg: "4" }} gap="4" mb="6">
        {/* Featured Models - Takes 3 columns */}
        <Box style={{ gridColumn: "span 3" }}>
          <Flex justify="between" align="center" mb="3">
            <Heading
              size="4"
              style={{
                fontWeight: theme.typography.h3.fontWeight,
                color: theme.colors.text.primary,
              }}
            >
              Featured Models
            </Heading>
            <Link to="/models">
              <Button
                variant="tertiary"
                size="sm"
                style={{
                  fontSize: theme.typography.caption.fontSize,
                  color: theme.colors.text.secondary,
                  background: "transparent",
                  border: "none",
                }}
              >
                View All →
              </Button>
            </Link>
          </Flex>

          <Grid columns={{ initial: "1", sm: "2", lg: "3" }} gap="3">
            {featuredModels.slice(0, 6).map(model => (
              <Box
                key={model.id}
                style={{
                  background: theme.colors.background.card,
                  borderRadius: theme.borders.radius.md,
                  border: `1px solid ${theme.colors.border.primary}`,
                  padding: theme.spacing.base[3],
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: theme.shadows.semantic.card.low,
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.borderColor = theme.colors.interactive.primary;
                  e.currentTarget.style.boxShadow = theme.shadows.semantic.card.medium;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.borderColor = theme.colors.border.primary;
                  e.currentTarget.style.boxShadow = theme.shadows.semantic.card.low;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <Flex direction="column" gap="2">
                  <Text
                    size="2"
                    style={{
                      fontWeight: 600,
                      color: theme.colors.text.primary,
                      lineHeight: "1.3",
                    }}
                  >
                    {model.name}
                  </Text>
                  <Text
                    size="1"
                    style={{
                      color: theme.colors.text.secondary,
                      lineHeight: "1.4",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {model.description}
                  </Text>
                  <Flex justify="between" align="center" mt="1">
                    <Badge
                      style={{
                        background: `${theme.colors.interactive.accent}15`,
                        color: theme.colors.interactive.accent,
                        border: `1px solid ${theme.colors.interactive.accent}30`,
                        padding: "2px 6px",
                        borderRadius: theme.borders.radius.sm,
                        fontSize: "10px",
                        fontWeight: 500,
                      }}
                    >
                      {model.task}
                    </Badge>
                    <Flex align="center" gap="3">
                      <Text size="1" style={{ color: theme.colors.text.tertiary }}>
                        {model.downloads}↓
                      </Text>
                      <Text size="1" style={{ color: theme.colors.text.tertiary }}>
                        {model.likes}♡
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Box>
            ))}
          </Grid>
        </Box>

        {/* Infrastructure Info - Takes 1 column */}
        <Box>
          <Heading
            size="4"
            mb="3"
            style={{
              fontWeight: theme.typography.h3.fontWeight,
              color: theme.colors.text.primary,
            }}
          >
            Infrastructure
          </Heading>

          <Flex direction="column" gap="3">
            <Box
              style={{
                padding: theme.spacing.base[3],
                background: theme.colors.background.card,
                borderRadius: theme.borders.radius.md,
                border: `1px solid ${theme.colors.border.primary}`,
                boxShadow: theme.shadows.semantic.card.low,
              }}
            >
              <Flex align="center" gap="2" mb="2">
                <CubeIcon
                  width="16"
                  height="16"
                  style={{ color: theme.colors.interactive.primary }}
                />
                <Text
                  size="2"
                  style={{
                    fontWeight: theme.typography.label.fontWeight,
                    color: theme.colors.text.primary,
                  }}
                >
                  Sui Network
                </Text>
              </Flex>
              <Text
                size="1"
                style={{
                  color: theme.colors.text.secondary,
                  lineHeight: "1.4",
                }}
              >
                Object-native ML execution with immutable inference
              </Text>
            </Box>

            <Box
              style={{
                padding: theme.spacing.base[3],
                background: theme.colors.background.card,
                borderRadius: theme.borders.radius.md,
                border: `1px solid ${theme.colors.border.primary}`,
                boxShadow: theme.shadows.semantic.card.low,
              }}
            >
              <Flex align="center" gap="2" mb="2">
                <LayersIcon
                  width="16"
                  height="16"
                  style={{ color: theme.colors.interactive.accent }}
                />
                <Text
                  size="2"
                  style={{
                    fontWeight: theme.typography.label.fontWeight,
                    color: theme.colors.text.primary,
                  }}
                >
                  Walrus Storage
                </Text>
              </Flex>
              <Text
                size="1"
                style={{
                  color: theme.colors.text.secondary,
                  lineHeight: "1.4",
                }}
              >
                Decentralized dataset storage with cryptographic proofs
              </Text>
            </Box>

            <Box
              style={{
                padding: theme.spacing.base[3],
                background: theme.colors.background.card,
                borderRadius: theme.borders.radius.md,
                border: `1px solid ${theme.colors.border.primary}`,
                boxShadow: theme.shadows.semantic.card.low,
              }}
            >
              <Flex align="center" gap="2" mb="2">
                <RocketIcon width="16" height="16" style={{ color: theme.colors.status.success }} />
                <Text
                  size="2"
                  style={{
                    fontWeight: theme.typography.label.fontWeight,
                    color: theme.colors.text.primary,
                  }}
                >
                  RL Playground
                </Text>
              </Flex>
              <Text
                size="1"
                style={{
                  color: theme.colors.text.secondary,
                  lineHeight: "1.4",
                }}
              >
                Physics simulation for autonomous agents
              </Text>
            </Box>
          </Flex>
        </Box>
      </Grid>

      {/* Compact Features Section */}
      <Box py="5" mb="4">
        <Heading
          size="4"
          mb="4"
          align="center"
          style={{
            fontWeight: theme.typography.h3.fontWeight,
            color: theme.colors.text.primary,
          }}
        >
          Platform Capabilities
        </Heading>

        <Grid columns={{ initial: "1", sm: "2", lg: "4" }} gap="3">
          <Box
            style={{
              padding: theme.spacing.base[3],
              background: theme.colors.background.card,
              borderRadius: theme.borders.radius.md,
              border: `1px solid ${theme.colors.border.primary}`,
              textAlign: "center",
            }}
          >
            <RocketIcon
              width="20"
              height="20"
              style={{ color: theme.colors.interactive.primary, margin: "0 auto 8px" }}
            />
            <Text
              size="2"
              style={{
                fontWeight: theme.typography.label.fontWeight,
                color: theme.colors.text.primary,
                display: "block",
                marginBottom: "4px",
              }}
            >
              Model Verification
            </Text>
            <Text
              size="1"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: "1.3",
              }}
            >
              Cryptographic proofs for all inference operations
            </Text>
          </Box>

          <Box
            style={{
              padding: theme.spacing.base[3],
              background: theme.colors.background.card,
              borderRadius: theme.borders.radius.md,
              border: `1px solid ${theme.colors.border.primary}`,
              textAlign: "center",
            }}
          >
            <Share1Icon
              width="20"
              height="20"
              style={{ color: theme.colors.interactive.accent, margin: "0 auto 8px" }}
            />
            <Text
              size="2"
              style={{
                fontWeight: theme.typography.label.fontWeight,
                color: theme.colors.text.primary,
                display: "block",
                marginBottom: "4px",
              }}
            >
              Composable AI
            </Text>
            <Text
              size="1"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: "1.3",
              }}
            >
              Build upon existing models with object composition
            </Text>
          </Box>

          <Box
            style={{
              padding: theme.spacing.base[3],
              background: theme.colors.background.card,
              borderRadius: theme.borders.radius.md,
              border: `1px solid ${theme.colors.border.primary}`,
              textAlign: "center",
            }}
          >
            <CodeIcon
              width="20"
              height="20"
              style={{ color: theme.colors.status.success, margin: "0 auto 8px" }}
            />
            <Text
              size="2"
              style={{
                fontWeight: theme.typography.label.fontWeight,
                color: theme.colors.text.primary,
                display: "block",
                marginBottom: "4px",
              }}
            >
              Open Source
            </Text>
            <Text
              size="1"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: "1.3",
              }}
            >
              Full transparency with open infrastructure
            </Text>
          </Box>

          <Box
            style={{
              padding: theme.spacing.base[3],
              background: theme.colors.background.card,
              borderRadius: theme.borders.radius.md,
              border: `1px solid ${theme.colors.border.primary}`,
              textAlign: "center",
            }}
          >
            <GitHubLogoIcon
              width="20"
              height="20"
              style={{ color: theme.colors.text.secondary, margin: "0 auto 8px" }}
            />
            <Text
              size="2"
              style={{
                fontWeight: theme.typography.label.fontWeight,
                color: theme.colors.text.primary,
                display: "block",
                marginBottom: "4px",
              }}
            >
              Physical AI
            </Text>
            <Text
              size="1"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: "1.3",
              }}
            >
              Real-world robotics and autonomous systems
            </Text>
          </Box>
        </Grid>
      </Box>

      {/* Recent Activity & Quick Actions */}
      <Grid columns={{ initial: "1", md: "2" }} gap="4" mb="4">
        <Box>
          <Heading
            size="4"
            mb="3"
            style={{
              fontWeight: theme.typography.h3.fontWeight,
              color: theme.colors.text.primary,
            }}
          >
            Recent Activity
          </Heading>
          <Box
            style={{
              padding: theme.spacing.base[3],
              background: theme.colors.background.card,
              borderRadius: theme.borders.radius.md,
              border: `1px solid ${theme.colors.border.primary}`,
            }}
          >
            <Flex direction="column" gap="3">
              {[
                { action: "Model uploaded", model: "GPT-2 Nano", time: "2 hours ago" },
                { action: "Inference completed", model: "MNIST Classifier", time: "4 hours ago" },
                { action: "Dataset verified", model: "Physics Sim Data", time: "6 hours ago" },
              ].map((item, index) => (
                <Flex key={index} justify="between" align="center">
                  <Flex direction="column" gap="1">
                    <Text size="2" style={{ color: theme.colors.text.primary }}>
                      {item.action}
                    </Text>
                    <Text size="1" style={{ color: theme.colors.text.secondary }}>
                      {item.model}
                    </Text>
                  </Flex>
                  <Text size="1" style={{ color: theme.colors.text.tertiary }}>
                    {item.time}
                  </Text>
                </Flex>
              ))}
            </Flex>
          </Box>
        </Box>

        <Box>
          <Heading
            size="4"
            mb="3"
            style={{
              fontWeight: theme.typography.h3.fontWeight,
              color: theme.colors.text.primary,
            }}
          >
            Quick Actions
          </Heading>
          <Flex direction="column" gap="3">
            {[
              {
                href: "/models/upload",
                icon: "rocket",
                text: "Upload New Model",
              },
              {
                href: "/datasets",
                icon: "layers",
                text: "Browse Datasets",
              },
              {
                href: "/annotator",
                icon: "pencil",
                text: "Data Annotator",
              },
            ].map((action, index) => (
              <Link key={index} to={action.href} style={{ textDecoration: "none" }}>
                <Box
                  style={{
                    width: "100%",
                    padding: `${theme.spacing.base[2]} ${theme.spacing.base[3]}`,
                    height: "44px",
                    background: theme.colors.background.card,
                    color: theme.colors.text.primary,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borders.radius.sm,
                    transition: "all 0.2s ease",
                    fontSize: theme.typography.bodySmall.fontSize,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.borderColor = theme.colors.interactive.primary;
                    e.currentTarget.style.background = `${theme.colors.interactive.primary}08`;
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.borderColor = theme.colors.border.primary;
                    e.currentTarget.style.background = theme.colors.background.card;
                  }}
                >
                  <Flex align="center" gap="2">
                    <Box style={{ color: theme.colors.interactive.primary }}>
                      {action.icon === "rocket" && <RocketIcon />}
                      {action.icon === "layers" && <LayersIcon />}
                      {action.icon === "pencil" && <Pencil1Icon />}
                    </Box>
                    {action.text}
                  </Flex>
                </Box>
              </Link>
            ))}
          </Flex>
        </Box>
      </Grid>
    </Box>
  );
}

// Featured models data (matching ModelData interface)
const featuredModels: ModelData[] = [
  {
    id: "1",
    name: "MNIST Classifier",
    description: "Handwritten digit recognition with 99.2% accuracy",
    creator: "0x1234...5678",
    downloads: 1250,
    likes: 89,
    task: "Computer Vision",
    frameworks: ["TensorFlow", "SUI"],
  },
  {
    id: "2",
    name: "Sentiment Analyzer",
    description: "Advanced NLP model for sentiment classification",
    creator: "0xabcd...efgh",
    downloads: 892,
    likes: 67,
    task: "NLP",
    frameworks: ["PyTorch", "SUI"],
  },
  {
    id: "3",
    name: "Physics Simulator",
    description: "RL model for autonomous navigation",
    creator: "0x9876...1234",
    downloads: 456,
    likes: 123,
    task: "Reinforcement Learning",
    frameworks: ["Custom", "SUI"],
  },
  {
    id: "4",
    name: "GPT-2 Nano",
    description: "Lightweight text generation model",
    creator: "0x5678...9abc",
    downloads: 234,
    likes: 45,
    task: "Text Generation",
    frameworks: ["PyTorch", "SUI"],
  },
  {
    id: "5",
    name: "Vision Transformer",
    description: "Image classification with transformer architecture",
    creator: "0xdef0...1234",
    downloads: 678,
    likes: 91,
    task: "Computer Vision",
    frameworks: ["JAX", "SUI"],
  },
  {
    id: "6",
    name: "Audio Classifier",
    description: "Real-time audio event detection",
    creator: "0x2468...ace0",
    downloads: 345,
    likes: 56,
    task: "Audio Processing",
    frameworks: ["TensorFlow", "SUI"],
  },
];
