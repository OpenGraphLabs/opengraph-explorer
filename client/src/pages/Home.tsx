import { Box, Flex, Heading, Text, Card, Grid, Button } from "@radix-ui/themes";
import { RocketIcon, GitHubLogoIcon, Share1Icon } from "@radix-ui/react-icons";
import { Link } from "react-router-dom";
import styles from '../styles/Card.module.css';

export function Home() {
  return (
    <Box>
      {/* Hero Section */}
      <Flex direction="column" align="center" gap="5" py="8">
        <Heading size="9" align="center" style={{ fontWeight: 800, background: "linear-gradient(90deg, #FF5733 0%, #FFC300 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          The AI Community Building the Future
        </Heading>
        <Text size="5" align="center" style={{ maxWidth: "800px", color: "var(--gray-11)" }}>
          A fully on-chain machine learning model sharing and inference platform powered by Sui blockchain
        </Text>
        <Flex gap="4" mt="4">
          <Link to="/models">
            <Button size="3" style={{ background: "#FF5733", color: "white" }}>Explore Models</Button>
          </Link>
          <Link to="/upload">
            <Button size="3" variant="soft">Upload Model</Button>
          </Link>
        </Flex>
      </Flex>

      {/* Featured Models Section */}
      <Box py="8">
        <Flex justify="between" align="center" mb="4">
          <Heading size="6" style={{ fontWeight: 700 }}>Trending Models</Heading>
          <Link to="/models">
            <Button variant="ghost">View All</Button>
          </Link>
        </Flex>
        <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
          {featuredModels.map((model) => (
            <Link key={model.id} to={`/models/${model.id}`} style={{ textDecoration: "none" }}>
              <Card 
                className={styles.hoverCard}
                style={{ 
                  borderRadius: "12px", 
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                }}
              >
                <Flex direction="column" gap="2">
                  <Heading size="4">{model.name}</Heading>
                  <Text size="2" color="gray">{model.creator}</Text>
                  <Text size="2">{model.description}</Text>
                  <Flex gap="3" mt="2">
                    <Text size="1" color="gray">Downloads: {model.downloads}</Text>
                    <Text size="1" color="gray">Likes: {model.likes}</Text>
                  </Flex>
                </Flex>
              </Card>
            </Link>
          ))}
        </Grid>
      </Box>

      {/* How It Works Section */}
      <Box py="8" style={{ background: "var(--gray-2)", borderRadius: "16px", padding: "32px", marginTop: "24px" }}>
        <Heading size="6" mb="4" style={{ fontWeight: 700 }}>How It Works</Heading>
        <Grid columns={{ initial: "1", sm: "3" }} gap="4">
          <Card style={{ borderRadius: "12px", border: "none", background: "white" }}>
            <Flex direction="column" align="center" gap="2" p="3">
              <Box style={{ background: "#F2F3F5", borderRadius: "50%", width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <RocketIcon width="32" height="32" style={{ color: "#FF5733" }} />
              </Box>
              <Heading size="3">Upload Models</Heading>
              <Text align="center">Upload ML models to the Sui blockchain</Text>
            </Flex>
          </Card>
          <Card style={{ borderRadius: "12px", border: "none", background: "white" }}>
            <Flex direction="column" align="center" gap="2" p="3">
              <Box style={{ background: "#F2F3F5", borderRadius: "50%", width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Share1Icon width="32" height="32" style={{ color: "#FF5733" }} />
              </Box>
              <Heading size="3">Share Models</Heading>
              <Text align="center">Share and collaborate with the community</Text>
            </Flex>
          </Card>
          <Card style={{ borderRadius: "12px", border: "none", background: "white" }}>
            <Flex direction="column" align="center" gap="2" p="3">
              <Box style={{ background: "#F2F3F5", borderRadius: "50%", width: "64px", height: "64px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GitHubLogoIcon width="32" height="32" style={{ color: "#FF5733" }} />
              </Box>
              <Heading size="3">On-chain Inference</Heading>
              <Text align="center">Run model inference in a fully on-chain environment</Text>
            </Flex>
          </Card>
        </Grid>
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
    description: "A smaller version of GPT-3 suitable for text generation tasks.",
    downloads: 1200,
    likes: 450,
  },
  {
    id: "2",
    name: "BERT-Base",
    creator: "Google Research",
    description: "Bidirectional Encoder Representations from Transformers for natural language understanding.",
    downloads: 980,
    likes: 320,
  },
  {
    id: "3",
    name: "ResNet-50",
    creator: "Microsoft",
    description: "A 50-layer residual neural network for image classification tasks.",
    downloads: 750,
    likes: 280,
  },
]; 