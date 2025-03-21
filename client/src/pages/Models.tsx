import { useState } from "react";
import { Box, Flex, Heading, Text, Card, Grid, Button, Select, Tabs, Avatar, Badge } from "@radix-ui/themes";
import { MagnifyingGlassIcon, StarFilledIcon, DownloadIcon, CodeIcon } from "@radix-ui/react-icons";
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
    <Box style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
      <Heading size={{ initial: "7", md: "8" }} mb="5" style={{ fontWeight: 700 }}>Explore Models</Heading>
      
      {/* Search and Filter Section */}
      <Card style={{ 
        padding: "24px", 
        borderRadius: "12px", 
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
        marginBottom: "32px",
        border: "1px solid var(--gray-4)"
      }}>
        <Flex direction="column" gap="4">
          <div className="rt-TextFieldRoot" style={{ 
            borderRadius: "8px", 
            border: "1px solid var(--gray-5)",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
            overflow: "hidden"
          }}>
            <div className="rt-TextFieldSlot" style={{ padding: "0 12px" }}>
              <MagnifyingGlassIcon height="18" width="18" style={{ color: "var(--gray-9)" }} />
            </div>
            <input 
              className="rt-TextFieldInput"
              placeholder="Search models..." 
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              style={{ 
                padding: "14px 16px", 
                fontSize: "16px", 
                width: "100%", 
                border: "none",
                outline: "none",
                background: "transparent"
              }}
            />
          </div>
        
          <Flex gap="4" wrap="wrap">
            <Box style={{ minWidth: "200px", flex: 1 }}>
              <Text as="label" size="2" style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                Task Type
              </Text>
              <Select.Root 
                value={selectedTask} 
                onValueChange={setSelectedTask}
              >
                <Select.Trigger style={{ 
                  width: "100%", 
                  borderRadius: "8px",
                  padding: "10px 16px",
                  border: "1px solid var(--gray-5)"
                }} />
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
            
            <Box style={{ minWidth: "200px", flex: 1 }}>
              <Text as="label" size="2" style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                Sort By
              </Text>
              <Select.Root 
                value={selectedSort} 
                onValueChange={setSelectedSort}
              >
                <Select.Trigger style={{ 
                  width: "100%", 
                  borderRadius: "8px",
                  padding: "10px 16px",
                  border: "1px solid var(--gray-5)"
                }} />
                <Select.Content>
                  <Select.Item value="downloads">Most Downloads</Select.Item>
                  <Select.Item value="likes">Most Likes</Select.Item>
                  <Select.Item value="newest">Newest First</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>
          </Flex>
        </Flex>
      </Card>
      
      {/* Model List */}
      <Tabs.Root defaultValue="models" style={{ 
        borderRadius: "12px", 
        overflow: "hidden", 
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        border: "1px solid var(--gray-4)"
      }}>
        <Tabs.List style={{ 
          background: "var(--gray-2)", 
          padding: "12px 16px", 
          borderBottom: "1px solid var(--gray-4)" 
        }}>
          <Tabs.Trigger value="models" style={{ fontWeight: 600, fontSize: "15px" }}>Models</Tabs.Trigger>
          <Tabs.Trigger value="datasets" style={{ fontWeight: 600, fontSize: "15px" }}>Datasets</Tabs.Trigger>
          <Tabs.Trigger value="spaces" style={{ fontWeight: 600, fontSize: "15px" }}>Spaces</Tabs.Trigger>
        </Tabs.List>
        
        <Box py="6" px="4" style={{ background: "white" }}>
          <Tabs.Content value="models">
            {filteredModels.length > 0 ? (
              <>
                <Flex mb="4" justify="between" align="center">
                  <Text size="3" style={{ fontWeight: 500 }}>
                    Showing {filteredModels.length} {filteredModels.length === 1 ? 'model' : 'models'}
                  </Text>
                  <Link to="/upload">
                    <Button size="2" style={{ 
                      background: "#FF5733", 
                      color: "white", 
                      borderRadius: "8px",
                      fontWeight: 500
                    }}>
                      Upload Model
                    </Button>
                  </Link>
                </Flex>
                
                <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
                  {filteredModels.map((model) => (
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
                              background: getTaskColor(model.task).bg, 
                              color: getTaskColor(model.task).text
                            }}>
                              {getTaskName(model.task)}
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
              </>
            ) : (
              <Flex direction="column" align="center" gap="3" py="8">
                <Box style={{ 
                  width: "80px", 
                  height: "80px", 
                  borderRadius: "50%", 
                  background: "var(--gray-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <MagnifyingGlassIcon width="32" height="32" style={{ color: "var(--gray-9)" }} />
                </Box>
                <Text size="4" style={{ fontWeight: 500 }}>No results found</Text>
                <Text size="2" color="gray" align="center" style={{ maxWidth: "400px" }}>
                  Try adjusting your search or filter settings to find what you're looking for.
                </Text>
                <Button 
                  onClick={() => {setSearchQuery(""); setSelectedTask("all");}} 
                  style={{ 
                    background: "#FF5733", 
                    color: "white",
                    marginTop: "12px",
                    borderRadius: "8px",
                    fontWeight: 500
                  }}
                >
                  Reset Filters
                </Button>
              </Flex>
            )}
          </Tabs.Content>
          
          <Tabs.Content value="datasets">
            <Flex direction="column" align="center" gap="3" py="8">
              <Box style={{ 
                width: "80px", 
                height: "80px", 
                borderRadius: "50%", 
                background: "var(--gray-3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <CodeIcon width="32" height="32" style={{ color: "var(--gray-9)" }} />
              </Box>
              <Text size="4" style={{ fontWeight: 500 }}>Coming Soon</Text>
              <Text size="2" color="gray" align="center" style={{ maxWidth: "400px" }}>
                Dataset support is currently under development. Stay tuned for updates!
              </Text>
            </Flex>
          </Tabs.Content>
          
          <Tabs.Content value="spaces">
            <Flex direction="column" align="center" gap="3" py="8">
              <Box style={{ 
                width: "80px", 
                height: "80px", 
                borderRadius: "50%", 
                background: "var(--gray-3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <CodeIcon width="32" height="32" style={{ color: "var(--gray-9)" }} />
              </Box>
              <Text size="4" style={{ fontWeight: 500 }}>Coming Soon</Text>
              <Text size="2" color="gray" align="center" style={{ maxWidth: "400px" }}>
                Spaces functionality is currently under development. Stay tuned for updates!
              </Text>
            </Flex>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Box>
  );
}

// Get task color for badge
function getTaskColor(taskId: string): { bg: string; text: string } {
  const colorMap: Record<string, { bg: string; text: string }> = {
    "text-generation": { bg: "#E0F2FE", text: "#0369A1" },
    "text-classification": { bg: "#E0F7FA", text: "#00838F" },
    "image-classification": { bg: "#E8F5E9", text: "#2E7D32" },
    "object-detection": { bg: "#FFF3E0", text: "#E65100" },
    "text-to-image": { bg: "#F3E8FD", text: "#7E22CE" },
    "translation": { bg: "#E8EAF6", text: "#3949AB" }
  };
  return colorMap[taskId] || { bg: "var(--accent-3)", text: "var(--accent-11)" };
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

// Sample data with added frameworks field
const allModels = [
  {
    id: "1",
    name: "GPT-3 Mini",
    creator: "OpenAI",
    description: "A smaller version of GPT-3 suitable for text generation tasks. Optimized for on-chain deployment with reduced parameters.",
    downloads: 1200,
    likes: 450,
    task: "text-generation",
    createdAt: "2023-05-15T10:30:00Z",
    frameworks: ["PyTorch", "SUI"]
  },
  {
    id: "2",
    name: "BERT-Base",
    creator: "Google Research",
    description: "Bidirectional Encoder Representations from Transformers for natural language understanding.",
    downloads: 980,
    likes: 320,
    task: "text-generation",
    createdAt: "2023-06-20T14:45:00Z",
    frameworks: ["TensorFlow", "SUI"]
  },
  {
    id: "3",
    name: "ResNet-50",
    creator: "Microsoft",
    description: "A 50-layer residual neural network for image classification tasks. Adapted for on-chain inference.",
    downloads: 750,
    likes: 280,
    task: "image-classification",
    createdAt: "2023-04-10T09:15:00Z",
    frameworks: ["PyTorch", "SUI"]
  },
  {
    id: "4",
    name: "YOLO v5",
    creator: "Ultralytics",
    description: "Fast and accurate model for real-time object detection. Optimized for efficient on-chain execution.",
    downloads: 1500,
    likes: 620,
    task: "object-detection",
    createdAt: "2023-07-05T16:20:00Z",
    frameworks: ["PyTorch", "SUI"]
  },
  {
    id: "5",
    name: "Stable Diffusion",
    creator: "Stability AI",
    description: "A model that generates high-quality images from text prompts. Adapted for blockchain deployment.",
    downloads: 2200,
    likes: 890,
    task: "text-to-image",
    createdAt: "2023-08-12T11:40:00Z",
    frameworks: ["PyTorch", "SUI"]
  },
  {
    id: "6",
    name: "T5-Base",
    creator: "Google Research",
    description: "Text-to-Text Transfer Transformer for various natural language processing tasks.",
    downloads: 680,
    likes: 240,
    task: "translation",
    createdAt: "2023-03-25T13:10:00Z",
    frameworks: ["TensorFlow", "SUI"]
  },
  {
    id: "7",
    name: "DistilBERT",
    creator: "Hugging Face",
    description: "A distilled version of BERT that retains 95% of performance with reduced size for efficient deployment.",
    downloads: 850,
    likes: 310,
    task: "text-classification",
    createdAt: "2023-05-01T11:20:00Z",
    frameworks: ["PyTorch", "SUI"]
  },
  {
    id: "8",
    name: "MobileNet v3",
    creator: "Google AI",
    description: "Lightweight convolutional neural network optimized for mobile and edge devices.",
    downloads: 620,
    likes: 195,
    task: "image-classification",
    createdAt: "2023-06-10T09:30:00Z",
    frameworks: ["TensorFlow", "SUI"]
  },
  {
    id: "9",
    name: "GPT-2 Small",
    creator: "OpenAI",
    description: "A smaller version of GPT-2 for text generation that balances performance and resource usage.",
    downloads: 980,
    likes: 420,
    task: "text-generation",
    createdAt: "2023-04-20T14:15:00Z",
    frameworks: ["PyTorch", "SUI"]
  }
]; 