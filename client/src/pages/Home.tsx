import { Box, Flex, Heading, Text, Card, Grid, Button, Avatar, Badge } from "@radix-ui/themes";
import { RocketIcon, GitHubLogoIcon, Share1Icon, StarFilledIcon, DownloadIcon, CodeIcon } from "@radix-ui/react-icons";
import { Link } from "react-router-dom";
import styles from '../styles/Card.module.css';

export function Home() {
  return (
    <Box style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
      {/* Hero Section */}
      <Flex direction="column" align="center" gap="5" py={{ initial: "7", md: "9" }}>
        <Heading size={{ initial: "8", md: "9" }} align="center" style={{ 
          fontWeight: 800, 
          background: "linear-gradient(90deg, #FF5733 0%, #FFC300 100%)", 
          WebkitBackgroundClip: "text", 
          WebkitTextFillColor: "transparent",
          maxWidth: "800px",
          lineHeight: "1.2"
        }}>
          The AI Community Building the Future
        </Heading>
        <Text size={{ initial: "3", md: "5" }} align="center" style={{ maxWidth: "800px", color: "var(--gray-11)" }}>
          A fully on-chain machine learning model sharing and inference platform powered by Sui blockchain
        </Text>
        <Flex gap="4" mt="5" wrap="wrap" justify="center">
          <Link to="/models">
            <Button size="3" style={{ 
              background: "#FF5733", 
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              padding: "0 24px",
              height: "48px",
              borderRadius: "8px"
            }}>
              Explore Models
            </Button>
          </Link>
          <Link to="/upload">
            <Button size="3" variant="soft" style={{
              fontSize: "16px",
              fontWeight: "600",
              padding: "0 24px",
              height: "48px",
              borderRadius: "8px"
            }}>
              Upload Model
            </Button>
          </Link>
        </Flex>
      </Flex>

      {/* Featured Models Section */}
      <Box py="8">
        <Flex justify="between" align="center" mb="5">
          <Heading size="6" style={{ fontWeight: 700 }}>Trending Models</Heading>
          <Link to="/models">
            <Button variant="ghost" style={{ fontWeight: 500 }}>View All</Button>
          </Link>
        </Flex>
        <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
          {featuredModels.map((model) => (
            <Link key={model.id} to={`/models/${model.id}`} style={{ textDecoration: "none" }}>
              <Card 
                className={styles.modelCard}
                style={{ 
                  borderRadius: "12px", 
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                  border: "1px solid var(--gray-4)",
                  overflow: "hidden",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column"
                }}
              >
                <Flex direction="column" gap="3" style={{ height: "100%" }}>
                  <Flex align="center" gap="2" mb="1">
                    <Avatar
                      size="2"
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${model.creator}`}
                      fallback={model.creator.charAt(0)}
                      radius="full"
                    />
                    <Text size="2" style={{ fontWeight: 500 }}>{model.creator}</Text>
                  </Flex>
                  
                  <Heading size="4" style={{ fontWeight: 600, lineHeight: 1.3 }}>{model.name}</Heading>
                  
                  <Text size="2" style={{ 
                    color: "var(--gray-11)", 
                    flex: 1,
                    display: "-webkit-box",
                    WebkitLineClamp: "2",
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {model.description}
                  </Text>
                  
                  <Flex gap="2" mt="2" wrap="wrap">
                    <Badge size="1" variant="soft" style={{ 
                      background: "var(--accent-3)", 
                      color: "var(--accent-11)" 
                    }}>
                      {model.task || "Text Generation"}
                    </Badge>
                    {model.frameworks && model.frameworks.map(framework => (
                      <Badge key={framework} size="1" variant="soft">
                        {framework}
                      </Badge>
                    ))}
                  </Flex>
                  
                  <Flex justify="between" align="center" mt="2">
                    <Flex gap="3" align="center">
                      <Flex gap="1" align="center">
                        <StarFilledIcon width="14" height="14" style={{ color: "#FFB800" }} />
                        <Text size="1" style={{ fontWeight: 500 }}>{model.likes}</Text>
                      </Flex>
                      <Flex gap="1" align="center">
                        <DownloadIcon width="14" height="14" style={{ color: "var(--gray-9)" }} />
                        <Text size="1" style={{ fontWeight: 500 }}>{model.downloads}</Text>
                      </Flex>
                    </Flex>
                    <Flex align="center" gap="1">
                      <CodeIcon width="14" height="14" style={{ color: "var(--gray-9)" }} />
                      <Text size="1" style={{ fontWeight: 500 }}>SUI</Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Card>
            </Link>
          ))}
        </Grid>
      </Box>

      {/* How It Works Section */}
      <Box py="8" style={{ 
        background: "linear-gradient(180deg, var(--gray-1) 0%, var(--gray-3) 100%)", 
        borderRadius: "16px", 
        padding: "40px 32px", 
        marginTop: "24px",
        boxShadow: "0 6px 24px rgba(0, 0, 0, 0.05)"
      }}>
        <Heading size="6" mb="5" style={{ fontWeight: 700, textAlign: "center" }}>How It Works</Heading>
        <Grid columns={{ initial: "1", sm: "3" }} gap="5">
          <Card style={{ 
            borderRadius: "12px", 
            border: "none", 
            background: "white",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06)",
            height: "100%"
          }}>
            <Flex direction="column" align="center" gap="3" p="4">
              <Box style={{ 
                background: "linear-gradient(135deg, #FFE5DC 0%, #FFCEBF 100%)", 
                borderRadius: "50%", 
                width: "72px", 
                height: "72px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
                <RocketIcon width="32" height="32" style={{ color: "#FF5733" }} />
              </Box>
              <Heading size="3" style={{ fontWeight: 600, textAlign: "center" }}>Upload Models</Heading>
              <Text align="center" style={{ color: "var(--gray-11)" }}>
                Upload ML models to the Sui blockchain with full data ownership
              </Text>
            </Flex>
          </Card>
          <Card style={{ 
            borderRadius: "12px", 
            border: "none", 
            background: "white",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06)",
            height: "100%"
          }}>
            <Flex direction="column" align="center" gap="3" p="4">
              <Box style={{ 
                background: "linear-gradient(135deg, #FFE5DC 0%, #FFCEBF 100%)", 
                borderRadius: "50%", 
                width: "72px", 
                height: "72px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
                <Share1Icon width="32" height="32" style={{ color: "#FF5733" }} />
              </Box>
              <Heading size="3" style={{ fontWeight: 600, textAlign: "center" }}>Share Models</Heading>
              <Text align="center" style={{ color: "var(--gray-11)" }}>
                Share and collaborate with the community in a decentralized way
              </Text>
            </Flex>
          </Card>
          <Card style={{ 
            borderRadius: "12px", 
            border: "none", 
            background: "white",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06)",
            height: "100%"
          }}>
            <Flex direction="column" align="center" gap="3" p="4">
              <Box style={{ 
                background: "linear-gradient(135deg, #FFE5DC 0%, #FFCEBF 100%)", 
                borderRadius: "50%", 
                width: "72px", 
                height: "72px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center" 
              }}>
                <GitHubLogoIcon width="32" height="32" style={{ color: "#FF5733" }} />
              </Box>
              <Heading size="3" style={{ fontWeight: 600, textAlign: "center" }}>On-chain Inference</Heading>
              <Text align="center" style={{ color: "var(--gray-11)" }}>
                Run model inference in a fully on-chain environment with transparency
              </Text>
            </Flex>
          </Card>
        </Grid>
      </Box>
      
      {/* Community Section */}
      <Box py="8" mt="6">
        <Flex direction="column" align="center" gap="5">
          <Heading size="6" style={{ fontWeight: 700 }}>Join The Community</Heading>
          <Text size="3" align="center" style={{ maxWidth: "600px", color: "var(--gray-11)" }}>
            Connect with AI enthusiasts and researchers on Sui blockchain to collaborate, 
            share models, and build the future of decentralized machine learning
          </Text>
          <Flex gap="4" mt="3" wrap="wrap" justify="center">
            <Button size="3" variant="soft" style={{
              fontSize: "15px",
              fontWeight: "500",
              borderRadius: "8px"
            }}>
              <GitHubLogoIcon width="18" height="18" />
              GitHub
            </Button>
            <Button size="3" variant="soft" style={{
              fontSize: "15px",
              fontWeight: "500",
              borderRadius: "8px"
            }}>
              <CodeIcon width="18" height="18" />
              Documentation
            </Button>
            <Button size="3" variant="soft" style={{
              fontSize: "15px",
              fontWeight: "500",
              borderRadius: "8px"
            }}>
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
const featuredModels = [
  {
    id: "1",
    name: "GPT-3 Mini",
    creator: "OpenAI",
    description: "A smaller version of GPT-3 suitable for text generation tasks. Optimized for on-chain deployment with reduced parameters.",
    downloads: 1200,
    likes: 450,
    task: "Text Generation",
    frameworks: ["PyTorch", "SUI"]
  },
  {
    id: "2",
    name: "BERT-Base",
    creator: "Google Research",
    description: "Bidirectional Encoder Representations from Transformers for natural language understanding.",
    downloads: 980,
    likes: 320,
    task: "NLP",
    frameworks: ["TensorFlow", "SUI"]
  },
  {
    id: "3",
    name: "ResNet-50",
    creator: "Microsoft",
    description: "A 50-layer residual neural network for image classification tasks. Adapted for on-chain inference.",
    downloads: 750,
    likes: 280,
    task: "Computer Vision",
    frameworks: ["PyTorch", "SUI"]
  },
  {
    id: "4",
    name: "DistilBERT",
    creator: "Hugging Face",
    description: "A distilled version of BERT that retains 95% of performance with reduced size for efficient deployment.",
    downloads: 620,
    likes: 210,
    task: "NLP",
    frameworks: ["PyTorch", "SUI"]
  },
  {
    id: "5",
    name: "MobileNet v3",
    creator: "Google AI",
    description: "Lightweight convolutional neural network optimized for mobile and edge devices.",
    downloads: 540,
    likes: 190,
    task: "Computer Vision",
    frameworks: ["TensorFlow", "SUI"]
  },
  {
    id: "6",
    name: "T5-Small",
    creator: "Google Research",
    description: "Text-to-Text Transfer Transformer model with reduced parameters for on-chain implementation.",
    downloads: 480,
    likes: 175,
    task: "Text Generation",
    frameworks: ["PyTorch", "SUI"]
  }
]; 