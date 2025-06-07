import { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Tabs,
  Avatar,
} from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { PageHeader } from "@/shared/ui/design-system/components/PageHeader";
import { useTheme } from "@/shared/ui/design-system";
import { CalendarIcon, HeartIcon, DownloadIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import { useCurrentWallet } from "@mysten/dapp-kit";

export function Profile() {
  const { theme } = useTheme();
  const { isConnected, currentWallet } = useCurrentWallet();
  const [activeTab, setActiveTab] = useState("models");

  // If wallet is not connected, show a message
  if (!isConnected) {
    return (
      <Box
        style={{
          padding: theme.spacing.semantic.layout.md,
        }}
      >
        <PageHeader
          title="Profile"
          description="Manage your models, datasets, and account settings."
        />

        <Card
          style={{
            padding: theme.spacing.semantic.component.xl,
            textAlign: "center",
          }}
        >
          <Flex direction="column" align="center" gap={theme.spacing.semantic.component.lg}>
            <Box
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                background: theme.colors.background.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GitHubLogoIcon width={32} height={32} style={{ color: theme.colors.text.primary }} />
            </Box>
            <Heading
              size="4"
              style={{
                color: theme.colors.text.primary,
              }}
            >
              Connect Your Wallet
            </Heading>
            <Text
              style={{
                maxWidth: "400px",
                color: theme.colors.text.secondary,
                lineHeight: "1.6",
              }}
            >
              To view your profile, please connect your Sui wallet using the button in the top right
              corner.
            </Text>
          </Flex>
        </Card>
      </Box>
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
      createdAt: "2023-09-15T10:30:00Z",
    },
    {
      id: "2",
      name: "MobileNet-V2",
      description: "Lightweight model for image classification on edge devices.",
      task: "image-classification",
      downloads: 180,
      likes: 28,
      createdAt: "2023-10-20T14:45:00Z",
    },
  ];

  // Sample data for user activities
  const userActivities = [
    {
      id: "1",
      type: "upload",
      modelName: "BERT-Mini",
      date: "2023-09-15T10:30:00Z",
    },
    {
      id: "2",
      type: "like",
      modelName: "GPT-3 Mini",
      date: "2023-09-20T15:45:00Z",
    },
    {
      id: "3",
      type: "download",
      modelName: "ResNet-50",
      date: "2023-10-05T09:15:00Z",
    },
    {
      id: "4",
      type: "upload",
      modelName: "MobileNet-V2",
      date: "2023-10-20T14:45:00Z",
    },
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
      createdAt: "2023-05-15T10:30:00Z",
    },
    {
      id: "3",
      name: "ResNet-50",
      creator: "Microsoft",
      description: "A 50-layer residual neural network for image classification tasks.",
      task: "image-classification",
      downloads: 750,
      likes: 280,
      createdAt: "2023-04-10T09:15:00Z",
    },
  ];

  // Get task name from task ID
  const getTaskName = (taskId: string): string => {
    const taskMap: Record<string, string> = {
      "text-generation": "Text Generation",
      "image-classification": "Image Classification",
      "object-detection": "Object Detection",
      "text-to-image": "Text-to-Image",
      translation: "Translation",
    };
    return taskMap[taskId] || taskId;
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  // Get activity icon and text
  const getActivityInfo = (activity: any) => {
    switch (activity.type) {
      case "upload":
        return {
          icon: <UploadIcon style={{ color: theme.colors.status.success }} />,
          text: `Uploaded model "${activity.modelName}"`,
        };
      case "like":
        return {
          icon: <HeartIcon style={{ color: "#F06292" }} />,
          text: `Liked model "${activity.modelName}"`,
        };
      case "download":
        return {
          icon: <DownloadIcon style={{ color: theme.colors.status.info }} />,
          text: `Downloaded model "${activity.modelName}"`,
        };
      default:
        return {
          icon: null,
          text: `Interacted with "${activity.modelName}"`,
        };
    }
  };

  return (
    <Box
      style={{
        padding: theme.spacing.semantic.layout.md,
      }}
    >
      <PageHeader
        title="Profile"
        description="Manage your models, datasets, and account settings."
      />

      {/* Profile Header */}
      <Card
        style={{
          padding: theme.spacing.semantic.component.xl,
          marginBottom: theme.spacing.semantic.component.xl,
        }}
      >
        <Flex gap={theme.spacing.semantic.component.lg} align="start">
          <Avatar
            size="6"
            fallback={userAddress[0]}
            style={{
              background: theme.colors.interactive.primary,
              color: theme.colors.text.inverse,
              fontSize: "24px",
              fontWeight: "700",
            }}
          />

          <Box style={{ flex: 1 }}>
            <Heading
              size="6"
              style={{
                fontWeight: "700",
                color: theme.colors.text.primary,
              }}
            >
              {formatAddress(userAddress)}
            </Heading>

            <Flex
              align="center"
              gap={theme.spacing.semantic.component.sm}
              style={{
                marginTop: theme.spacing.semantic.component.xs,
              }}
            >
              <CalendarIcon style={{ color: theme.colors.text.secondary }} />
              <Text
                size="2"
                style={{
                  color: theme.colors.text.secondary,
                }}
              >
                Joined {formatDate(new Date().toISOString().slice(0, 10))}
              </Text>
            </Flex>

            <Flex
              style={{
                marginTop: theme.spacing.semantic.component.lg,
              }}
              gap={theme.spacing.semantic.component.md}
            >
              <Box>
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.secondary,
                  }}
                >
                  Models
                </Text>
                <Text
                  style={{
                    fontWeight: "600",
                    color: theme.colors.text.primary,
                  }}
                >
                  {userModels.length}
                </Text>
              </Box>
              <Box>
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.secondary,
                  }}
                >
                  Downloads
                </Text>
                <Text
                  style={{
                    fontWeight: "600",
                    color: theme.colors.text.primary,
                  }}
                >
                  {userModels.reduce((sum, model) => sum + model.downloads, 0)}
                </Text>
              </Box>
              <Box>
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.secondary,
                  }}
                >
                  Likes
                </Text>
                <Text
                  style={{
                    fontWeight: "600",
                    color: theme.colors.text.primary,
                  }}
                >
                  {userModels.reduce((sum, model) => sum + model.likes, 0)}
                </Text>
              </Box>
            </Flex>
          </Box>
        </Flex>
      </Card>

      {/* Tabs Navigation */}
      <Card>
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List
            style={{
              background: theme.colors.background.secondary,
              padding: theme.spacing.semantic.component.sm,
              borderBottom: `1px solid ${theme.colors.border.secondary}`,
            }}
          >
            <Tabs.Trigger
              value="models"
              style={{
                fontWeight: "600",
                color:
                  activeTab === "models"
                    ? theme.colors.interactive.primary
                    : theme.colors.text.secondary,
              }}
            >
              My Models
            </Tabs.Trigger>
            <Tabs.Trigger
              value="favorites"
              style={{
                fontWeight: "600",
                color:
                  activeTab === "favorites"
                    ? theme.colors.interactive.primary
                    : theme.colors.text.secondary,
              }}
            >
              Favorites
            </Tabs.Trigger>
            <Tabs.Trigger
              value="activity"
              style={{
                fontWeight: "600",
                color:
                  activeTab === "activity"
                    ? theme.colors.interactive.primary
                    : theme.colors.text.secondary,
              }}
            >
              Activity
            </Tabs.Trigger>
            <Tabs.Trigger
              value="settings"
              style={{
                fontWeight: "600",
                color:
                  activeTab === "settings"
                    ? theme.colors.interactive.primary
                    : theme.colors.text.secondary,
              }}
            >
              Settings
            </Tabs.Trigger>
          </Tabs.List>

          <Box
            style={{
              padding: theme.spacing.semantic.component.lg,
              background: theme.colors.background.primary,
            }}
          >
            {/* My Models Tab */}
            <Tabs.Content value="models">
              <Box>
                <Flex
                  justify="between"
                  align="center"
                  style={{
                    marginBottom: theme.spacing.semantic.component.lg,
                  }}
                >
                  <Heading
                    size="4"
                    style={{
                      color: theme.colors.text.primary,
                      fontWeight: "700",
                    }}
                  >
                    My Models
                  </Heading>
                  <Button
                    onClick={() => (window.location.href = "/upload")}
                    style={{
                      background: theme.colors.interactive.primary,
                      color: theme.colors.text.inverse,
                      borderRadius: theme.borders.radius.md,
                    }}
                  >
                    Upload New Model
                  </Button>
                </Flex>

                {userModels.length === 0 ? (
                  <Card
                    style={{
                      padding: theme.spacing.semantic.component.xl,
                      textAlign: "center",
                      background: theme.colors.background.secondary,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.text.secondary,
                      }}
                    >
                      You haven't uploaded any models yet.
                    </Text>
                  </Card>
                ) : (
                  <Flex direction="column" gap={theme.spacing.semantic.component.md}>
                    {userModels.map(model => (
                      <Card
                        key={model.id}
                        style={{
                          padding: theme.spacing.semantic.component.lg,
                          cursor: "pointer",
                          transition: theme.animations.transitions.all,
                        }}
                        onClick={() => (window.location.href = `/models/${model.id}`)}
                      >
                        <Flex direction="column" gap={theme.spacing.semantic.component.sm}>
                          <Heading
                            size="3"
                            style={{
                              color: theme.colors.text.primary,
                              fontWeight: "600",
                            }}
                          >
                            {model.name}
                          </Heading>
                          <Text
                            size="2"
                            style={{
                              color: theme.colors.text.secondary,
                              lineHeight: "1.5",
                            }}
                          >
                            {model.description}
                          </Text>

                          <Flex
                            style={{
                              marginTop: theme.spacing.semantic.component.sm,
                            }}
                            justify="between"
                            align="center"
                          >
                            <Box
                              style={{
                                background: theme.colors.background.accent,
                                padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                                borderRadius: theme.borders.radius.sm,
                              }}
                            >
                              <Text
                                size="1"
                                style={{
                                  color: theme.colors.text.primary,
                                }}
                              >
                                {getTaskName(model.task)}
                              </Text>
                            </Box>

                            <Flex gap={theme.spacing.semantic.component.md} align="center">
                              <Flex align="center" gap={theme.spacing.semantic.component.xs}>
                                <DownloadIcon
                                  style={{ color: theme.colors.status.info, width: 14, height: 14 }}
                                />
                                <Text
                                  size="1"
                                  style={{
                                    color: theme.colors.text.secondary,
                                  }}
                                >
                                  {model.downloads}
                                </Text>
                              </Flex>
                              <Flex align="center" gap={theme.spacing.semantic.component.xs}>
                                <HeartIcon style={{ color: "#F06292", width: 14, height: 14 }} />
                                <Text
                                  size="1"
                                  style={{
                                    color: theme.colors.text.secondary,
                                  }}
                                >
                                  {model.likes}
                                </Text>
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
                <Heading
                  size="4"
                  style={{
                    marginBottom: theme.spacing.semantic.component.lg,
                    color: theme.colors.text.primary,
                    fontWeight: "700",
                  }}
                >
                  Favorite Models
                </Heading>

                {favoriteModels.length === 0 ? (
                  <Card
                    style={{
                      padding: theme.spacing.semantic.component.xl,
                      textAlign: "center",
                      background: theme.colors.background.secondary,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.text.secondary,
                      }}
                    >
                      You haven't favorited any models yet.
                    </Text>
                  </Card>
                ) : (
                  <Flex direction="column" gap={theme.spacing.semantic.component.md}>
                    {favoriteModels.map(model => (
                      <Card
                        key={model.id}
                        style={{
                          padding: theme.spacing.semantic.component.lg,
                          cursor: "pointer",
                          transition: theme.animations.transitions.all,
                        }}
                        onClick={() => (window.location.href = `/models/${model.id}`)}
                      >
                        <Flex direction="column" gap={theme.spacing.semantic.component.sm}>
                          <Flex justify="between">
                            <Heading
                              size="3"
                              style={{
                                color: theme.colors.text.primary,
                                fontWeight: "600",
                              }}
                            >
                              {model.name}
                            </Heading>
                            <Button
                              style={{
                                color: "#F06292",
                                background: "transparent",
                                border: "none",
                                padding: "0",
                              }}
                            >
                              <HeartIcon style={{ color: "#F06292" }} />
                            </Button>
                          </Flex>

                          <Flex align="center" gap={theme.spacing.semantic.component.xs}>
                            <Avatar
                              size="1"
                              fallback={model.creator[0]}
                              style={{
                                background: theme.colors.interactive.primary,
                                color: theme.colors.text.inverse,
                              }}
                            />
                            <Text
                              size="1"
                              style={{
                                color: theme.colors.text.secondary,
                              }}
                            >
                              {model.creator}
                            </Text>
                          </Flex>

                          <Text
                            size="2"
                            style={{
                              color: theme.colors.text.secondary,
                              lineHeight: "1.5",
                            }}
                          >
                            {model.description}
                          </Text>

                          <Flex
                            style={{
                              marginTop: theme.spacing.semantic.component.sm,
                            }}
                            justify="between"
                            align="center"
                          >
                            <Box
                              style={{
                                background: theme.colors.background.accent,
                                padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                                borderRadius: theme.borders.radius.sm,
                              }}
                            >
                              <Text
                                size="1"
                                style={{
                                  color: theme.colors.text.primary,
                                }}
                              >
                                {getTaskName(model.task)}
                              </Text>
                            </Box>

                            <Flex gap={theme.spacing.semantic.component.md} align="center">
                              <Flex align="center" gap={theme.spacing.semantic.component.xs}>
                                <DownloadIcon
                                  style={{ color: theme.colors.status.info, width: 14, height: 14 }}
                                />
                                <Text
                                  size="1"
                                  style={{
                                    color: theme.colors.text.secondary,
                                  }}
                                >
                                  {model.downloads}
                                </Text>
                              </Flex>
                              <Flex align="center" gap={theme.spacing.semantic.component.xs}>
                                <HeartIcon style={{ color: "#F06292", width: 14, height: 14 }} />
                                <Text
                                  size="1"
                                  style={{
                                    color: theme.colors.text.secondary,
                                  }}
                                >
                                  {model.likes}
                                </Text>
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
                <Heading
                  size="4"
                  style={{
                    marginBottom: theme.spacing.semantic.component.lg,
                    color: theme.colors.text.primary,
                    fontWeight: "700",
                  }}
                >
                  Recent Activity
                </Heading>

                {userActivities.length === 0 ? (
                  <Card
                    style={{
                      padding: theme.spacing.semantic.component.xl,
                      textAlign: "center",
                      background: theme.colors.background.secondary,
                    }}
                  >
                    <Text
                      style={{
                        color: theme.colors.text.secondary,
                      }}
                    >
                      No recent activity.
                    </Text>
                  </Card>
                ) : (
                  <Card>
                    {userActivities.map((activity, index) => {
                      const { icon, text } = getActivityInfo(activity);
                      return (
                        <Flex
                          key={activity.id}
                          style={{
                            padding: theme.spacing.semantic.component.md,
                            borderBottom:
                              index < userActivities.length - 1
                                ? `1px solid ${theme.colors.border.secondary}`
                                : "none",
                            background:
                              index % 2 === 0
                                ? theme.colors.background.primary
                                : theme.colors.background.secondary,
                          }}
                          gap={theme.spacing.semantic.component.md}
                          align="center"
                        >
                          <Box
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              background: theme.colors.background.accent,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {icon}
                          </Box>
                          <Box style={{ flex: 1 }}>
                            <Text
                              style={{
                                color: theme.colors.text.primary,
                              }}
                            >
                              {text}
                            </Text>
                            <Text
                              size="1"
                              style={{
                                color: theme.colors.text.secondary,
                              }}
                            >
                              {formatDate(activity.date)}
                            </Text>
                          </Box>
                          <Button
                            style={{
                              borderRadius: theme.borders.radius.sm,
                              fontSize: "12px",
                              padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                            }}
                          >
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
                <Heading
                  size="4"
                  style={{
                    marginBottom: theme.spacing.semantic.component.lg,
                    color: theme.colors.text.primary,
                    fontWeight: "700",
                  }}
                >
                  Account Settings
                </Heading>
                <Card
                  style={{
                    padding: theme.spacing.semantic.component.xl,
                    textAlign: "center",
                    background: theme.colors.background.secondary,
                  }}
                >
                  <Text
                    style={{
                      color: theme.colors.text.secondary,
                    }}
                  >
                    Settings functionality coming soon.
                  </Text>
                </Card>
              </Box>
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Card>
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
