import { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
  Grid,
  Button,
  Select,
  Tabs,
  Avatar,
  Badge,
  Spinner,
} from "@radix-ui/themes";
import { MagnifyingGlassIcon, StarFilledIcon, DownloadIcon, CodeIcon } from "@radix-ui/react-icons";
import { Link } from "react-router-dom";
import styles from "../styles/Card.module.css";
import { useModels } from "../hooks/useModels";
import { TASK_COLORS, TASK_NAMES, TASK_TYPES } from "../constants/suiConfig";

export function Models() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState("all");
  const [selectedSort, setSelectedSort] = useState("downloads");

  // 커스텀 훅을 사용하여 모델 데이터 가져오기
  const { models, loading, error, refetch } = useModels();
  console.log("models: \n", models);

  // Filtered model list
  const filteredModels = models
    .filter(
      model =>
        (selectedTask === "all" || model.task_type === selectedTask) &&
        (searchQuery === "" ||
          model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          model.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (selectedSort === "downloads") return b.downloads - a.downloads;
      if (selectedSort === "likes") return b.likes - a.likes;
      if (selectedSort === "newest")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

  return (
    <Box style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
      <Heading size={{ initial: "7", md: "8" }} mb="5" style={{ fontWeight: 700 }}>
        Explore Models
      </Heading>

      {/* Search and Filter Section */}
      <Card
        style={{
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
          marginBottom: "32px",
          border: "1px solid var(--gray-4)",
        }}
      >
        <Flex direction="column" gap="4">
          <div
            className="rt-TextFieldRoot"
            style={{
              borderRadius: "8px",
              border: "1px solid var(--gray-5)",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
              overflow: "hidden",
            }}
          >
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
                background: "transparent",
              }}
            />
          </div>

          <Flex gap="4" wrap="wrap">
            <Box style={{ minWidth: "200px", flex: 1 }}>
              <Text
                as="label"
                size="2"
                style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
              >
                Task Type
              </Text>
              <Select.Root value={selectedTask} onValueChange={setSelectedTask}>
                <Select.Trigger
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    padding: "10px 16px",
                    border: "1px solid var(--gray-5)",
                  }}
                />
                <Select.Content>
                  <Select.Item value="all">All Tasks</Select.Item>
                  <Select.Item value={TASK_TYPES.TEXT_GENERATION}>Text Generation</Select.Item>
                  <Select.Item value={TASK_TYPES.TEXT_CLASSIFICATION}>
                    Text Classification
                  </Select.Item>
                  <Select.Item value={TASK_TYPES.IMAGE_CLASSIFICATION}>
                    Image Classification
                  </Select.Item>
                  <Select.Item value={TASK_TYPES.OBJECT_DETECTION}>Object Detection</Select.Item>
                  <Select.Item value={TASK_TYPES.TEXT_TO_IMAGE}>Text-to-Image</Select.Item>
                  <Select.Item value={TASK_TYPES.TRANSLATION}>Translation</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>

            <Box style={{ minWidth: "200px", flex: 1 }}>
              <Text
                as="label"
                size="2"
                style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}
              >
                Sort By
              </Text>
              <Select.Root value={selectedSort} onValueChange={setSelectedSort}>
                <Select.Trigger
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    padding: "10px 16px",
                    border: "1px solid var(--gray-5)",
                  }}
                />
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
      <Tabs.Root
        defaultValue="models"
        style={{
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          border: "1px solid var(--gray-4)",
        }}
      >
        <Tabs.List
          style={{
            background: "var(--gray-2)",
            padding: "12px 16px",
            borderBottom: "1px solid var(--gray-4)",
          }}
        >
          <Tabs.Trigger value="models" style={{ fontWeight: 600, fontSize: "15px" }}>
            Models
          </Tabs.Trigger>
          <Tabs.Trigger value="datasets" style={{ fontWeight: 600, fontSize: "15px" }}>
            Datasets
          </Tabs.Trigger>
          <Tabs.Trigger value="spaces" style={{ fontWeight: 600, fontSize: "15px" }}>
            Spaces
          </Tabs.Trigger>
        </Tabs.List>

        <Box py="6" px="4" style={{ background: "white" }}>
          <Tabs.Content value="models">
            {loading ? (
              <Flex direction="column" align="center" gap="3" py="8">
                <Spinner size="3" />
                <Text size="3" style={{ fontWeight: 500 }}>
                  Loading models...
                </Text>
              </Flex>
            ) : error ? (
              <Flex direction="column" align="center" gap="3" py="8">
                <Box
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "var(--gray-3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CodeIcon width="32" height="32" style={{ color: "var(--gray-9)" }} />
                </Box>
                <Text size="4" style={{ fontWeight: 500 }}>
                  Error Loading Models
                </Text>
                <Text size="2" color="gray" align="center" style={{ maxWidth: "400px" }}>
                  {error}
                </Text>
                <Button
                  onClick={() => refetch()}
                  style={{
                    background: "#FF5733",
                    color: "white",
                    marginTop: "12px",
                    borderRadius: "8px",
                    fontWeight: 500,
                  }}
                >
                  Retry
                </Button>
              </Flex>
            ) : filteredModels.length > 0 ? (
              <>
                <Flex mb="4" justify="between" align="center">
                  <Text size="3" style={{ fontWeight: 500 }}>
                    Showing {filteredModels.length}{" "}
                    {filteredModels.length === 1 ? "model" : "models"}
                  </Text>
                  <Link to="/upload">
                    <Button
                      size="2"
                      style={{
                        background: "#FF5733",
                        color: "white",
                        borderRadius: "8px",
                        fontWeight: 500,
                      }}
                    >
                      Upload Model
                    </Button>
                  </Link>
                </Flex>

                <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
                  {filteredModels.map(model => (
                    <Link
                      key={model.id}
                      to={`/models/${model.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <Card
                        className={styles.modelCard}
                        style={{
                          borderRadius: "12px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                          border: "1px solid var(--gray-4)",
                          overflow: "hidden",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
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
                            <Text size="2" style={{ fontWeight: 500 }}>
                              {model.creator}
                            </Text>
                          </Flex>

                          <Heading size="4" style={{ fontWeight: 600, lineHeight: 1.3 }}>
                            {model.name}
                          </Heading>

                          <Text
                            size="2"
                            style={{
                              color: "var(--gray-11)",
                              flex: 1,
                              display: "-webkit-box",
                              WebkitLineClamp: "2",
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {model.description}
                          </Text>

                          <Flex gap="2" mt="2" wrap="wrap">
                            <Badge
                              size="1"
                              variant="soft"
                              style={{
                                background: TASK_COLORS[model.task_type]?.bg || "var(--accent-3)",
                                color: TASK_COLORS[model.task_type]?.text || "var(--accent-11)",
                              }}
                            >
                              {TASK_NAMES[model.task_type] || model.task_type}
                            </Badge>
                            {model.frameworks &&
                              model.frameworks.map((framework: string) => (
                                <Badge key={framework} size="1" variant="soft">
                                  {framework}
                                </Badge>
                              ))}
                          </Flex>

                          <Flex justify="between" align="center" mt="2">
                            <Flex gap="3" align="center">
                              <Flex gap="1" align="center">
                                <StarFilledIcon
                                  width="14"
                                  height="14"
                                  style={{ color: "#FFB800" }}
                                />
                                <Text size="1" style={{ fontWeight: 500 }}>
                                  {model.likes}
                                </Text>
                              </Flex>
                              <Flex gap="1" align="center">
                                <DownloadIcon
                                  width="14"
                                  height="14"
                                  style={{ color: "var(--gray-9)" }}
                                />
                                <Text size="1" style={{ fontWeight: 500 }}>
                                  {model.downloads}
                                </Text>
                              </Flex>
                            </Flex>
                            <Flex align="center" gap="1">
                              <CodeIcon width="14" height="14" style={{ color: "var(--gray-9)" }} />
                              <Text size="1" style={{ fontWeight: 500 }}>
                                SUI
                              </Text>
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
                <Box
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "var(--gray-3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MagnifyingGlassIcon width="32" height="32" style={{ color: "var(--gray-9)" }} />
                </Box>
                <Text size="4" style={{ fontWeight: 500 }}>
                  No results found
                </Text>
                <Text size="2" color="gray" align="center" style={{ maxWidth: "400px" }}>
                  Try adjusting your search or filter settings to find what you're looking for.
                </Text>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedTask("all");
                  }}
                  style={{
                    background: "#FF5733",
                    color: "white",
                    marginTop: "12px",
                    borderRadius: "8px",
                    fontWeight: 500,
                  }}
                >
                  Reset Filters
                </Button>
              </Flex>
            )}
          </Tabs.Content>

          <Tabs.Content value="datasets">
            <Flex direction="column" align="center" gap="3" py="8">
              <Box
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "var(--gray-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CodeIcon width="32" height="32" style={{ color: "var(--gray-9)" }} />
              </Box>
              <Text size="4" style={{ fontWeight: 500 }}>
                Coming Soon
              </Text>
              <Text size="2" color="gray" align="center" style={{ maxWidth: "400px" }}>
                Dataset support is currently under development. Stay tuned for updates!
              </Text>
            </Flex>
          </Tabs.Content>

          <Tabs.Content value="spaces">
            <Flex direction="column" align="center" gap="3" py="8">
              <Box
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "var(--gray-3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CodeIcon width="32" height="32" style={{ color: "var(--gray-9)" }} />
              </Box>
              <Text size="4" style={{ fontWeight: 500 }}>
                Coming Soon
              </Text>
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
