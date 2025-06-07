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
import { RocketIcon, GitHubLogoIcon, Share1Icon, CodeIcon } from "@radix-ui/react-icons";

export function Home() {
  const { theme } = useTheme();

  return (
    <Box
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: `0 ${theme.spacing.semantic.container.md}`,
      }}
    >
      {/* Hero Section */}
      <Flex direction="column" align="center" gap="5" py={{ initial: "7", md: "9" }}>
        <Heading
          size={{ initial: "8", md: "9" }}
          align="center"
          style={{
            fontWeight: theme.typography.h1.fontWeight,
            background: theme.gradients.primary,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            maxWidth: "800px",
            lineHeight: theme.typography.h1.lineHeight,
          }}
        >
          The AI Community Building the Future
        </Heading>

        <Text
          size={{ initial: "3", md: "5" }}
          align="center"
          style={{
            maxWidth: "800px",
            color: theme.colors.text.secondary,
            lineHeight: theme.typography.bodyLarge.lineHeight,
          }}
        >
          A fully on-chain machine learning model sharing and inference platform powered by Sui
          blockchain
        </Text>

        <Flex gap="4" mt="5" wrap="wrap" justify="center">
          <Link to="/models">
            <Button
              variant="primary"
              size="lg"
              style={{
                fontSize: theme.typography.body.fontSize,
                fontWeight: theme.typography.label.fontWeight,
                padding: `${theme.spacing.base[3]} ${theme.spacing.base[6]}`,
                height: "48px",
                borderRadius: theme.borders.radius.md,
              }}
            >
              Explore Models
            </Button>
          </Link>
          <Link to="/upload">
            <Button
              variant="secondary"
              size="lg"
              style={{
                fontSize: theme.typography.body.fontSize,
                fontWeight: theme.typography.label.fontWeight,
                padding: `${theme.spacing.base[3]} ${theme.spacing.base[6]}`,
                height: "48px",
                borderRadius: theme.borders.radius.md,
              }}
            >
              Upload Model
            </Button>
          </Link>
        </Flex>
      </Flex>

      {/* Featured Models Section */}
      <Box py="8">
        <Flex justify="between" align="center" mb="5">
          <Heading
            size="6"
            style={{
              fontWeight: theme.typography.h2.fontWeight,
              color: theme.colors.text.primary,
            }}
          >
            Trending Models
          </Heading>
          <Link to="/models">
            <Button
              variant="tertiary"
              style={{
                fontWeight: theme.typography.label.fontWeight,
                color: theme.colors.text.secondary,
              }}
            >
              View All
            </Button>
          </Link>
        </Flex>

        <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
          {featuredModels.map(model => (
            <ModelCard key={model.id} model={model} />
          ))}
        </Grid>
      </Box>

      {/* How It Works Section */}
      <Box
        py="8"
        style={{
          background: theme.gradients.cool,
          borderRadius: theme.borders.radius.xl,
          padding: `${theme.spacing.semantic.section.md} ${theme.spacing.semantic.container.lg}`,
          marginTop: theme.spacing.semantic.layout.md,
          boxShadow: theme.shadows.semantic.card.medium,
        }}
      >
        <Heading
          size="6"
          mb="5"
          style={{
            fontWeight: theme.typography.h2.fontWeight,
            textAlign: "center",
            color: theme.colors.text.inverse,
          }}
        >
          How It Works
        </Heading>

        <Grid columns={{ initial: "1", sm: "3" }} gap="5">
          <FeatureCard
            icon={<RocketIcon />}
            title="Upload Models"
            description="Upload ML models to the Sui blockchain with full data ownership"
          />
          <FeatureCard
            icon={<Share1Icon />}
            title="Share Models"
            description="Share and collaborate with the community in a decentralized way"
          />
          <FeatureCard
            icon={<GitHubLogoIcon />}
            title="On-chain Inference"
            description="Run model inference in a fully on-chain environment with transparency"
          />
        </Grid>
      </Box>

      {/* Community Section */}
      <Box py="8" mt="6">
        <Flex direction="column" align="center" gap="5">
          <Heading
            size="6"
            style={{
              fontWeight: theme.typography.h2.fontWeight,
              color: theme.colors.text.primary,
            }}
          >
            Join The Community
          </Heading>

          <Text
            size="3"
            align="center"
            style={{
              maxWidth: "600px",
              color: theme.colors.text.secondary,
              lineHeight: theme.typography.body.lineHeight,
            }}
          >
            Connect with AI enthusiasts and researchers on Sui blockchain to collaborate, share
            models, and build the future of decentralized machine learning
          </Text>

          <Flex gap="4" mt="3" wrap="wrap" justify="center">
            <Button
              variant="secondary"
              size="md"
              style={{
                fontSize: theme.typography.bodySmall.fontSize,
                fontWeight: theme.typography.label.fontWeight,
                borderRadius: theme.borders.radius.md,
              }}
            >
              <GitHubLogoIcon width="18" height="18" />
              GitHub
            </Button>
            <Button
              variant="secondary"
              size="md"
              style={{
                fontSize: theme.typography.bodySmall.fontSize,
                fontWeight: theme.typography.label.fontWeight,
                borderRadius: theme.borders.radius.md,
              }}
            >
              <CodeIcon width="18" height="18" />
              Documentation
            </Button>
            <Button
              variant="secondary"
              size="md"
              style={{
                fontSize: theme.typography.bodySmall.fontSize,
                fontWeight: theme.typography.label.fontWeight,
                borderRadius: theme.borders.radius.md,
              }}
            >
              <Share1Icon width="18" height="18" />
              Discord
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}

// Sample data
const featuredModels: ModelData[] = [
  {
    id: "1",
    name: "GPT-3 Mini",
    creator: "OpenAI",
    description:
      "A smaller version of GPT-3 suitable for text generation tasks. Optimized for on-chain deployment with reduced parameters.",
    downloads: 1200,
    likes: 450,
    task: "Text Generation",
    frameworks: ["PyTorch", "SUI"],
  },
  {
    id: "2",
    name: "BERT-Base",
    creator: "Google Research",
    description:
      "Bidirectional Encoder Representations from Transformers for natural language understanding.",
    downloads: 980,
    likes: 320,
    task: "NLP",
    frameworks: ["TensorFlow", "SUI"],
  },
  {
    id: "3",
    name: "ResNet-50",
    creator: "Microsoft",
    description:
      "A 50-layer residual neural network for image classification tasks. Adapted for on-chain inference.",
    downloads: 750,
    likes: 280,
    task: "Computer Vision",
    frameworks: ["PyTorch", "SUI"],
  },
  {
    id: "4",
    name: "DistilBERT",
    creator: "Hugging Face",
    description:
      "A distilled version of BERT that retains 95% of performance with reduced size for efficient deployment.",
    downloads: 620,
    likes: 210,
    task: "NLP",
    frameworks: ["PyTorch", "SUI"],
  },
  {
    id: "5",
    name: "MobileNet v3",
    creator: "Google AI",
    description: "Lightweight convolutional neural network optimized for mobile and edge devices.",
    downloads: 540,
    likes: 190,
    task: "Computer Vision",
    frameworks: ["TensorFlow", "SUI"],
  },
  {
    id: "6",
    name: "T5-Small",
    creator: "Google Research",
    description:
      "Text-to-Text Transfer Transformer model with reduced parameters for on-chain implementation.",
    downloads: 480,
    likes: 175,
    task: "Text Generation",
    frameworks: ["PyTorch", "SUI"],
  },
];
