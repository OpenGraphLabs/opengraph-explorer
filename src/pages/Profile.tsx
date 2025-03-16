import { useState } from "react";
import { Box, Flex, Heading, Text, Card, Tabs, Avatar, Button } from "@radix-ui/themes";
import { CalendarIcon, HeartIcon, DownloadIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import { useCurrentWallet } from "@mysten/dapp-kit";
import styles from '../styles/Card.module.css';

export function Profile() {
  const { isConnected, currentWallet } = useCurrentWallet();
  const [activeTab, setActiveTab] = useState("models");
  
  // If wallet is not connected, show a message
  if (!isConnected) {
    return (
      <Card style={{ 
        borderRadius: "12px", 
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        padding: "24px",
        border: "none"
      }}>
        <Flex direction="column" align="center" gap="4" py="6">
          <Box style={{ 
            width: "64px", 
            height: "64px", 
            borderRadius: "50%", 
            background: "#F5F5F5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <GitHubLogoIcon width={32} height={32} style={{ color: "#555" }} />
          </Box>
          <Heading size="4" style={{ color: "#333" }}>Connect Your Wallet</Heading>
          <Text align="center" style={{ maxWidth: "400px", color: "#555", lineHeight: "1.6" }}>
            To view your profile, please connect your Sui wallet using the button in the top right corner.
          </Text>
        </Flex>
      </Card>
    );
  }
  
  // Format wallet address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // Get user's wallet address
  const userAddress = currentWallet?.accounts[0]?.address || "";
  
  // Sample data for user models
  const userModels = [
    {
      id: "1",
      name: "BERT-Mini",
      description: "A smaller version of BERT for natural language understanding tasks.",
      task: "text-generation",
      downloads: 320,
      likes: 45,
      createdAt: "2023-09-15T10:30:00Z"
    },
    {
      id: "2",
      name: "MobileNet-V2",
      description: "Lightweight model for image classification on edge devices.",
      task: "image-classification",
      downloads: 180,
      likes: 28,
      createdAt: "2023-10-20T14:45:00Z"
    }
  ];
  
  // Sample data for user activities
  const userActivities = [
    {
      id: "1",
      type: "upload",
      modelName: "BERT-Mini",
      date: "2023-09-15T10:30:00Z"
    },
    {
      id: "2",
      type: "like",
      modelName: "GPT-3 Mini",
      date: "2023-09-20T15:45:00Z"
    },
    {
      id: "3",
      type: "download",
      modelName: "ResNet-50",
      date: "2023-10-05T09:15:00Z"
    },
    {
      id: "4",
      type: "upload",
      modelName: "MobileNet-V2",
      date: "2023-10-20T14:45:00Z"
    }
  ];
  
  // Sample data for favorite models
  const favoriteModels = [
    {
      id: "1",
      name: "GPT-3 Mini",
      creator: "OpenAI",
      description: "A smaller version of GPT-3 suitable for text generation tasks.",
      task: "text-generation",
      downloads: 1200,
      likes: 450,
      createdAt: "2023-05-15T10:30:00Z"
    },
    {
      id: "3",
      name: "ResNet-50",
      creator: "Microsoft",
      description: "A 50-layer residual neural network for image classification tasks.",
      task: "image-classification",
      downloads: 750,
      likes: 280,
      createdAt: "2023-04-10T09:15:00Z"
    }
  ];
  
  // Get task name from task ID
  const getTaskName = (taskId: string): string => {
    const taskMap: Record<string, string> = {
      "text-generation": "Text Generation",
      "image-classification": "Image Classification",
      "object-detection": "Object Detection",
      "text-to-image": "Text-to-Image",
      "translation": "Translation"
    };
    return taskMap[taskId] || taskId;
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  // Get activity icon and text
  const getActivityInfo = (activity: any) => {
    switch (activity.type) {
      case "upload":
        return {
          icon: <UploadIcon style={{ color: "#4CAF50" }} />,
          text: `Uploaded model "${activity.modelName}"`
        };
      case "like":
        return {
          icon: <HeartIcon style={{ color: "#F06292" }} />,
          text: `Liked model "${activity.modelName}"`
        };
      case "download":
        return {
          icon: <DownloadIcon style={{ color: "#2196F3" }} />,
          text: `Downloaded model "${activity.modelName}"`
        };
      default:
        return {
          icon: null,
          text: `Interacted with "${activity.modelName}"`
        };
    }
  };
  
  return (
    <Box>
      {/* Profile Header */}
      <Card style={{ 
        borderRadius: "12px", 
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        padding: "24px",
        marginBottom: "24px",
        border: "none"
      }}>
        <Flex gap="4" align="start">
          <Avatar 
            size="6" 
            fallback={userAddress[0]} 
            style={{ 
              background: "#FF5733",
              color: "white",
              fontSize: "24px",
              fontWeight: "bold"
            }} 
          />
          
          <Box style={{ flex: 1 }}>
            <Heading size="6" style={{ fontWeight: 700, color: "#333" }}>
              {formatAddress(userAddress)}
            </Heading>
            
            <Flex align="center" gap="2" mt="1">
              <CalendarIcon style={{ color: "#777" }} />
              <Text size="2" style={{ color: "#777" }}>
                Joined {formatDate(new Date().toISOString().slice(0, 10))}
              </Text>
            </Flex>
            
            <Flex mt="4" gap="3">
              <Box>
                <Text size="1" style={{ color: "#777" }}>Models</Text>
                <Text style={{ fontWeight: 600 }}>{userModels.length}</Text>
              </Box>
              <Box>
                <Text size="1" style={{ color: "#777" }}>Downloads</Text>
                <Text style={{ fontWeight: 600 }}>{userModels.reduce((sum, model) => sum + model.downloads, 0)}</Text>
              </Box>
              <Box>
                <Text size="1" style={{ color: "#777" }}>Likes</Text>
                <Text style={{ fontWeight: 600 }}>{userModels.reduce((sum, model) => sum + model.likes, 0)}</Text>
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Card>
      
      {/* Tabs Navigation */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} style={{ 
        borderRadius: "12px", 
        overflow: "hidden", 
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" 
      }}>
        <Tabs.List style={{ 
          background: "var(--gray-2)", 
          padding: "8px", 
          borderBottom: "1px solid var(--gray-4)" 
        }}>
          <Tabs.Trigger value="models" style={{ fontWeight: 600 }}>My Models</Tabs.Trigger>
          <Tabs.Trigger value="favorites" style={{ fontWeight: 600 }}>Favorites</Tabs.Trigger>
          <Tabs.Trigger value="activity" style={{ fontWeight: 600 }}>Activity</Tabs.Trigger>
          <Tabs.Trigger value="settings" style={{ fontWeight: 600 }}>Settings</Tabs.Trigger>
        </Tabs.List>
        
        <Box py="4" px="3" style={{ background: "white" }}>
          {/* My Models Tab */}
          <Tabs.Content value="models">
            <Box>
              <Flex justify="between" align="center" mb="4">
                <Heading size="4" style={{ color: "#333", fontWeight: 700 }}>My Models</Heading>
                <Button 
                  onClick={() => window.location.href = "/upload"}
                  style={{ 
                    background: "#FF5733", 
                    color: "white", 
                    borderRadius: "8px" 
                  }}
                >
                  Upload New Model
                </Button>
              </Flex>
              
              {userModels.length === 0 ? (
                <Card style={{ 
                  padding: "24px", 
                  textAlign: "center",
                  borderRadius: "8px",
                  background: "#F5F5F5",
                  border: "none"
                }}>
                  <Text>You haven't uploaded any models yet.</Text>
                </Card>
              ) : (
                <Flex direction="column" gap="3">
                  {userModels.map(model => (
                    <Card 
                      key={model.id} 
                      className={styles.modelCard}
                      onClick={() => window.location.href = `/models/${model.id}`}
                    >
                      <Flex direction="column" gap="2">
                        <Heading size="3" style={{ color: "#333", fontWeight: 600 }}>{model.name}</Heading>
                        <Text size="2" style={{ color: "#555", lineHeight: "1.5" }}>{model.description}</Text>
                        
                        <Flex mt="2" justify="between" align="center">
                          <Card style={{ 
                            background: "#F5F5F5", 
                            padding: "4px 8px", 
                            borderRadius: "4px",
                            border: "none"
                          }}>
                            <Text size="1" style={{ color: "#555" }}>{getTaskName(model.task)}</Text>
                          </Card>
                          
                          <Flex gap="3" align="center">
                            <Flex align="center" gap="1">
                              <DownloadIcon style={{ color: "#2196F3", width: 14, height: 14 }} />
                              <Text size="1" style={{ color: "#555" }}>{model.downloads}</Text>
                            </Flex>
                            <Flex align="center" gap="1">
                              <HeartIcon style={{ color: "#F06292", width: 14, height: 14 }} />
                              <Text size="1" style={{ color: "#555" }}>{model.likes}</Text>
                            </Flex>
                          </Flex>
                        </Flex>
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              )}
            </Box>
          </Tabs.Content>
          
          {/* Favorites Tab */}
          <Tabs.Content value="favorites">
            <Box>
              <Heading size="4" mb="4" style={{ color: "#333", fontWeight: 700 }}>Favorite Models</Heading>
              
              {favoriteModels.length === 0 ? (
                <Card style={{ 
                  padding: "24px", 
                  textAlign: "center",
                  borderRadius: "8px",
                  background: "#F5F5F5",
                  border: "none"
                }}>
                  <Text>You haven't favorited any models yet.</Text>
                </Card>
              ) : (
                <Flex direction="column" gap="3">
                  {favoriteModels.map(model => (
                    <Card 
                      key={model.id} 
                      className={styles.modelCard}
                      onClick={() => window.location.href = `/models/${model.id}`}
                    >
                      <Flex direction="column" gap="2">
                        <Flex justify="between">
                          <Heading size="3" style={{ color: "#333", fontWeight: 600 }}>{model.name}</Heading>
                          <Button variant="ghost" style={{ color: "#F06292" }}>
                            <HeartIcon style={{ color: "#F06292" }} />
                          </Button>
                        </Flex>
                        
                        <Flex align="center" gap="1">
                          <Avatar size="1" fallback={model.creator[0]} style={{ background: "#FF5733" }} />
                          <Text size="1" style={{ color: "#777" }}>{model.creator}</Text>
                        </Flex>
                        
                        <Text size="2" style={{ color: "#555", lineHeight: "1.5" }}>{model.description}</Text>
                        
                        <Flex mt="2" justify="between" align="center">
                          <Card style={{ 
                            background: "#F5F5F5", 
                            padding: "4px 8px", 
                            borderRadius: "4px",
                            border: "none"
                          }}>
                            <Text size="1" style={{ color: "#555" }}>{getTaskName(model.task)}</Text>
                          </Card>
                          
                          <Flex gap="3" align="center">
                            <Flex align="center" gap="1">
                              <DownloadIcon style={{ color: "#2196F3", width: 14, height: 14 }} />
                              <Text size="1" style={{ color: "#555" }}>{model.downloads}</Text>
                            </Flex>
                            <Flex align="center" gap="1">
                              <HeartIcon style={{ color: "#F06292", width: 14, height: 14 }} />
                              <Text size="1" style={{ color: "#555" }}>{model.likes}</Text>
                            </Flex>
                          </Flex>
                        </Flex>
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              )}
            </Box>
          </Tabs.Content>
          
          {/* Activity Tab */}
          <Tabs.Content value="activity">
            <Box>
              <Heading size="4" mb="4" style={{ color: "#333", fontWeight: 700 }}>Recent Activity</Heading>
              
              {userActivities.length === 0 ? (
                <Card style={{ 
                  padding: "24px", 
                  textAlign: "center",
                  borderRadius: "8px",
                  background: "#F5F5F5",
                  border: "none"
                }}>
                  <Text>No recent activity.</Text>
                </Card>
              ) : (
                <Card style={{ 
                  borderRadius: "8px", 
                  padding: "0",
                  border: "1px solid var(--gray-4)",
                  overflow: "hidden"
                }}>
                  {userActivities.map((activity, index) => {
                    const { icon, text } = getActivityInfo(activity);
                    return (
                      <Flex 
                        key={activity.id} 
                        p="3" 
                        gap="3" 
                        align="center"
                        style={{ 
                          borderBottom: index < userActivities.length - 1 ? "1px solid var(--gray-4)" : "none",
                          background: index % 2 === 0 ? "white" : "#F9F9F9"
                        }}
                      >
                        <Box style={{ 
                          width: "32px", 
                          height: "32px", 
                          borderRadius: "50%", 
                          background: "#F5F5F5",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          {icon}
                        </Box>
                        <Box style={{ flex: 1 }}>
                          <Text style={{ color: "#333" }}>{text}</Text>
                          <Text size="1" style={{ color: "#777" }}>{formatDate(activity.date)}</Text>
                        </Box>
                        <Button variant="soft" size="1" style={{ borderRadius: "4px" }}>
                          View
                        </Button>
                      </Flex>
                    );
                  })}
                </Card>
              )}
            </Box>
          </Tabs.Content>
          
          {/* Settings Tab */}
          <Tabs.Content value="settings">
            <Box>
              <Heading size="4" mb="4" style={{ color: "#333", fontWeight: 700 }}>Account Settings</Heading>
              <Card style={{ 
                padding: "24px", 
                textAlign: "center",
                borderRadius: "8px",
                background: "#F5F5F5",
                border: "none"
              }}>
                <Text>Settings functionality coming soon.</Text>
              </Card>
            </Box>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Box>
  );
}

// Upload icon component
function UploadIcon(props: any) {
  return (
    <svg 
      width="15" 
      height="15" 
      viewBox="0 0 15 15" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path 
        d="M7.5 1.5C7.5 1.22386 7.27614 1 7 1C6.72386 1 6.5 1.22386 6.5 1.5V10.2929L3.35355 7.14645C3.15829 6.95118 2.84171 6.95118 2.64645 7.14645C2.45118 7.34171 2.45118 7.65829 2.64645 7.85355L6.64645 11.8536C6.84171 12.0488 7.15829 12.0488 7.35355 11.8536L11.3536 7.85355C11.5488 7.65829 11.5488 7.34171 11.3536 7.14645C11.1583 6.95118 10.8417 6.95118 10.6464 7.14645L7.5 10.2929V1.5ZM2.5 13C2.22386 13 2 13.2239 2 13.5C2 13.7761 2.22386 14 2.5 14H12.5C12.7761 14 13 13.7761 13 13.5C13 13.2239 12.7761 13 12.5 13H2.5Z" 
        fill="currentColor" 
        fillRule="evenodd" 
        clipRule="evenodd"
      />
    </svg>
  );
} 