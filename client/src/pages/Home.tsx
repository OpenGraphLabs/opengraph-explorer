import { Link } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  Grid,
  Button,
  ModelCard,
  FeatureCard,
  type ModelData,
} from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { RocketIcon, GitHubLogoIcon, Share1Icon, CodeIcon, CubeIcon, LayersIcon } from "@radix-ui/react-icons";

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
            Onchain machine learning with complete transparency. Build, verify, and deploy ML models on Sui & Walrus.
          </Text>

          <Flex gap="3" mt="3">
            <Link to="/models">
              <Button
                variant="primary"
                size="md"
                style={{
                  fontSize: theme.typography.bodySmall.fontSize,
                  padding: `${theme.spacing.base[2]} ${theme.spacing.base[4]}`,
                  height: "36px",
                }}
              >
                Explore Models
              </Button>
            </Link>
            <Link to="/upload">
              <Button
                variant="secondary"
                size="md"
                style={{
                  fontSize: theme.typography.bodySmall.fontSize,
                  padding: `${theme.spacing.base[2]} ${theme.spacing.base[4]}`,
                  height: "36px",
                }}
              >
                Upload Model
              </Button>
            </Link>
          </Flex>
        </Flex>

        {/* Compact Stats Row */}
        <Flex justify="center" gap="8" py="3">
          <Flex direction="column" align="center" gap="1">
            <Text size="4" style={{ fontWeight: theme.typography.h4.fontWeight, color: theme.colors.text.primary }}>
              1,250+
            </Text>
            <Text size="1" style={{ color: theme.colors.text.secondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Models
            </Text>
          </Flex>
          <Flex direction="column" align="center" gap="1">
            <Text size="4" style={{ fontWeight: theme.typography.h4.fontWeight, color: theme.colors.text.primary }}>
              340TB
            </Text>
            <Text size="1" style={{ color: theme.colors.text.secondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              On-chain Data
            </Text>
          </Flex>
          <Flex direction="column" align="center" gap="1">
            <Text size="4" style={{ fontWeight: theme.typography.h4.fontWeight, color: theme.colors.text.primary }}>
              99.9%
            </Text>
            <Text size="1" style={{ color: theme.colors.text.secondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>
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
                }}
              >
                View All →
              </Button>
            </Link>
          </Flex>

          <Grid columns={{ initial: "1", sm: "2", lg: "3" }} gap="3">
            {featuredModels.map(model => (
              <ModelCard key={model.id} model={model} />
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
                <CubeIcon width="16" height="16" style={{ color: theme.colors.interactive.primary }} />
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
                <LayersIcon width="16" height="16" style={{ color: theme.colors.interactive.accent }} />
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
              background: theme.gradients.surface,
              borderRadius: theme.borders.radius.md,
              border: `1px solid ${theme.colors.border.subtle}`,
              textAlign: "center",
            }}
          >
            <RocketIcon width="20" height="20" style={{ color: theme.colors.interactive.primary, margin: "0 auto 8px" }} />
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
              background: theme.gradients.surface,
              borderRadius: theme.borders.radius.md,
              border: `1px solid ${theme.colors.border.subtle}`,
              textAlign: "center",
            }}
          >
            <Share1Icon width="20" height="20" style={{ color: theme.colors.interactive.accent, margin: "0 auto 8px" }} />
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
              background: theme.gradients.surface,
              borderRadius: theme.borders.radius.md,
              border: `1px solid ${theme.colors.border.subtle}`,
              textAlign: "center",
            }}
          >
            <CodeIcon width="20" height="20" style={{ color: theme.colors.status.success, margin: "0 auto 8px" }} />
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
              background: theme.gradients.surface,
              borderRadius: theme.borders.radius.md,
              border: `1px solid ${theme.colors.border.subtle}`,
              textAlign: "center",
            }}
          >
            <GitHubLogoIcon width="20" height="20" style={{ color: theme.colors.text.secondary, margin: "0 auto 8px" }} />
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
          <Flex direction="column" gap="2">
            <Link to="/upload" style={{ textDecoration: "none" }}>
              <Button
                variant="secondary"
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  padding: theme.spacing.base[3],
                  height: "auto",
                }}
              >
                <RocketIcon style={{ marginRight: "8px" }} />
                Upload New Model
              </Button>
            </Link>
            <Link to="/datasets" style={{ textDecoration: "none" }}>
              <Button
                variant="tertiary"
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  padding: theme.spacing.base[3],
                  height: "auto",
                }}
              >
                <LayersIcon style={{ marginRight: "8px" }} />
                Browse Datasets
              </Button>
            </Link>
            <Link to="/docs" style={{ textDecoration: "none" }}>
              <Button
                variant="tertiary"
                style={{
                  width: "100%",
                  justifyContent: "flex-start",
                  padding: theme.spacing.base[3],
                  height: "auto",
                }}
              >
                <CodeIcon style={{ marginRight: "8px" }} />
                API Documentation
              </Button>
            </Link>
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
