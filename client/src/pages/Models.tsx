import { useState } from "react";
import { Box, Flex, Heading, Text, Card, Grid, Button, Select, Tabs } from "@radix-ui/themes";
import { MagnifyingGlassIcon, SizeIcon, LayersIcon, CodeIcon } from "@radix-ui/react-icons";
import { Link } from "react-router-dom";
import styles from '../styles/Card.module.css';

export function Models() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState("all");
  const [selectedSort, setSelectedSort] = useState("downloads");

  // Filtered model list
  const filteredModels = allModels
    .filter(model => 
      (selectedTask === "all" || model.task === selectedTask) &&
      (searchQuery === "" || 
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (selectedSort === "downloads") return b.downloads - a.downloads;
      if (selectedSort === "likes") return b.likes - a.likes;
      if (selectedSort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

  return (
    <Box>
      <Heading size="8" mb="4" style={{ fontWeight: 700 }}>Explore Models</Heading>
      
      {/* Search and Filter Section */}
      <Flex direction="column" gap="4" mb="6">
        <div className="rt-TextFieldRoot" style={{ 
          borderRadius: "8px", 
          border: "1px solid var(--gray-5)",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
        }}>
          <div className="rt-TextFieldSlot">
            <MagnifyingGlassIcon height="16" width="16" />
          </div>
          <input 
            className="rt-TextFieldInput"
            placeholder="Search models..." 
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            style={{ padding: "12px 16px" }}
          />
        </div>
        
        <Flex gap="4" wrap="wrap">
          <Box style={{ minWidth: "200px" }}>
            <Select.Root 
              value={selectedTask} 
              onValueChange={setSelectedTask}
            >
              <Select.Trigger style={{ width: "100%", borderRadius: "8px" }} />
              <Select.Content>
                <Select.Item value="all">All Tasks</Select.Item>
                <Select.Item value="text-generation">Text Generation</Select.Item>
                <Select.Item value="text-classification">Text Classification</Select.Item>
                <Select.Item value="image-classification">Image Classification</Select.Item>
                <Select.Item value="object-detection">Object Detection</Select.Item>
                <Select.Item value="text-to-image">Text-to-Image</Select.Item>
                <Select.Item value="translation">Translation</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>
          
          <Box style={{ minWidth: "200px" }}>
            <Select.Root 
              value={selectedSort} 
              onValueChange={setSelectedSort}
            >
              <Select.Trigger style={{ width: "100%", borderRadius: "8px" }} />
              <Select.Content>
                <Select.Item value="downloads">Most Downloads</Select.Item>
                <Select.Item value="likes">Most Likes</Select.Item>
                <Select.Item value="newest">Newest First</Select.Item>
              </Select.Content>
            </Select.Root>
          </Box>
        </Flex>
      </Flex>
      
      {/* Model List */}
      <Tabs.Root defaultValue="models" style={{ 
        borderRadius: "12px", 
        overflow: "hidden", 
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" 
      }}>
        <Tabs.List style={{ 
          background: "var(--gray-2)", 
          padding: "8px", 
          borderBottom: "1px solid var(--gray-4)" 
        }}>
          <Tabs.Trigger value="models" style={{ fontWeight: 600 }}>Models</Tabs.Trigger>
          <Tabs.Trigger value="datasets" style={{ fontWeight: 600 }}>Datasets</Tabs.Trigger>
          <Tabs.Trigger value="spaces" style={{ fontWeight: 600 }}>Spaces</Tabs.Trigger>
        </Tabs.List>
        
        <Box py="4" px="3" style={{ background: "white" }}>
          <Tabs.Content value="models">
            <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
              {filteredModels.map((model) => (
                <Link key={model.id} to={`/models/${model.id}`} style={{ textDecoration: "none" }}>
                  <Card 
                    className={styles.hoverCard}
                    style={{ 
                      borderRadius: "12px", 
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
                    }}
                  >
                    <Flex direction="column" gap="2">
                      <Flex gap="2" align="center">
                        <Box style={{ 
                          background: model.task === "text-generation" ? "#E1F5FE" : 
                                      model.task === "image-classification" ? "#E8F5E9" : 
                                      "#FFF3E0", 
                          padding: "6px", 
                          borderRadius: "6px" 
                        }}>
                          {model.task === "text-generation" && <CodeIcon style={{ color: "#0288D1" }} />}
                          {model.task === "image-classification" && <SizeIcon style={{ color: "#388E3C" }} />}
                          {model.task === "object-detection" && <LayersIcon style={{ color: "#F57C00" }} />}
                        </Box>
                        <Heading size="3">{model.name}</Heading>
                      </Flex>
                      <Text size="2" color="gray">{model.creator}</Text>
                      <Text size="2">{model.description}</Text>
                      <Flex gap="3" mt="2">
                        <Text size="1" color="gray">Downloads: {model.downloads}</Text>
                        <Text size="1" color="gray">Likes: {model.likes}</Text>
                        <Text size="1" color="gray">Task: {getTaskName(model.task)}</Text>
                      </Flex>
                    </Flex>
                  </Card>
                </Link>
              ))}
            </Grid>
            
            {filteredModels.length === 0 && (
              <Flex direction="column" align="center" gap="3" py="8">
                <Text>No results found.</Text>
                <Button onClick={() => {setSearchQuery(""); setSelectedTask("all");}} style={{ background: "#FF5733", color: "white" }}>
                  Reset Filters
                </Button>
              </Flex>
            )}
          </Tabs.Content>
          
          <Tabs.Content value="datasets">
            <Flex direction="column" align="center" gap="3" py="8">
              <Text>Dataset functionality coming soon.</Text>
            </Flex>
          </Tabs.Content>
          
          <Tabs.Content value="spaces">
            <Flex direction="column" align="center" gap="3" py="8">
              <Text>Spaces functionality coming soon.</Text>
            </Flex>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Box>
  );
}

// Task name conversion function
function getTaskName(taskId: string): string {
  const taskMap: Record<string, string> = {
    "text-generation": "Text Generation",
    "text-classification": "Text Classification",
    "image-classification": "Image Classification",
    "object-detection": "Object Detection",
    "text-to-image": "Text-to-Image",
    "translation": "Translation"
  };
  return taskMap[taskId] || taskId;
}

// Sample data
const allModels = [
  {
    id: "1",
    name: "GPT-3 Mini",
    creator: "OpenAI",
    description: "A smaller version of GPT-3 suitable for text generation tasks.",
    downloads: 1200,
    likes: 450,
    task: "text-generation",
    createdAt: "2023-05-15T10:30:00Z"
  },
  {
    id: "2",
    name: "BERT-Base",
    creator: "Google Research",
    description: "Bidirectional Encoder Representations from Transformers for natural language understanding.",
    downloads: 980,
    likes: 320,
    task: "text-generation",
    createdAt: "2023-06-20T14:45:00Z"
  },
  {
    id: "3",
    name: "ResNet-50",
    creator: "Microsoft",
    description: "A 50-layer residual neural network for image classification tasks.",
    downloads: 750,
    likes: 280,
    task: "image-classification",
    createdAt: "2023-04-10T09:15:00Z"
  },
  {
    id: "4",
    name: "YOLO v5",
    creator: "Ultralytics",
    description: "Fast and accurate model for real-time object detection.",
    downloads: 1500,
    likes: 620,
    task: "object-detection",
    createdAt: "2023-07-05T16:20:00Z"
  },
  {
    id: "5",
    name: "Stable Diffusion",
    creator: "Stability AI",
    description: "A model that generates high-quality images from text prompts.",
    downloads: 2200,
    likes: 890,
    task: "text-to-image",
    createdAt: "2023-08-12T11:40:00Z"
  },
  {
    id: "6",
    name: "T5-Base",
    creator: "Google Research",
    description: "Text-to-Text Transfer Transformer for various natural language processing tasks.",
    downloads: 680,
    likes: 240,
    task: "translation",
    createdAt: "2023-03-25T13:10:00Z"
  },
  {
    id: "7",
    name: "DistilBERT Classifier",
    creator: "Hugging Face",
    description: "A lightweight text classification model for sentiment analysis and topic categorization.",
    downloads: 850,
    likes: 310,
    task: "text-classification",
    createdAt: "2023-05-30T08:20:00Z"
  }
]; 