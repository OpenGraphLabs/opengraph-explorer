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
import {
  SUI_ADDRESS_DISPLAY_LENGTH,
  TASK_COLORS,
  TASK_NAMES,
  TASK_TYPES,
} from "../constants/suiConfig";

export function Models() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState("all");
  const [selectedSort, setSelectedSort] = useState("downloads");

  // Use custom hook to fetch model data
  const { models, loading, error, refetch } = useModels();

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
    <Box style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 28px" }}>
      <Heading size={{ initial: "7", md: "8" }} mb="6" style={{ fontWeight: 700 }}>
        Explore Models
      </Heading>

      {/* Search and Filter Section */}
      <Card
        style={{
          padding: "28px",
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          marginBottom: "36px",
          border: "1px solid var(--gray-4)",
        }}
      >
        <Flex direction="column" gap="5">
          <div
            className="rt-TextFieldRoot"
            style={{
              borderRadius: "8px",
              border: "1px solid var(--gray-5)",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
              overflow: "hidden",
            }}
          >
            <div className="rt-TextFieldSlot" style={{ padding: "0 14px" }}>
              <MagnifyingGlassIcon height="18" width="18" style={{ color: "var(--gray-9)" }} />
            </div>
            <input
              className="rt-TextFieldInput"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              style={{
                padding: "16px 18px",
                fontSize: "16px",
                width: "100%",
                border: "none",
                outline: "none",
                background: "transparent",
              }}
            />
          </div>

          <Flex gap="5" wrap="wrap">
            <Box style={{ minWidth: "200px", flex: 1 }}>
              <Text
                as="label"
                size="2"
                style={{ display: "block", marginBottom: "10px", fontWeight: 500 }}
              >
                Task Type
              </Text>
              <Select.Root value={selectedTask} onValueChange={setSelectedTask}>
                <Select.Trigger
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    padding: "12px 18px",
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
                style={{ display: "block", marginBottom: "10px", fontWeight: 500 }}
              >
                Sort By
              </Text>
              <Select.Root value={selectedSort} onValueChange={setSelectedSort}>
                <Select.Trigger
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    padding: "12px 18px",
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
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
          border: "1px solid var(--gray-4)",
        }}
      >
        <Tabs.List
          style={{
            background: "var(--gray-2)",
            padding: "14px 18px",
            borderBottom: "1px solid var(--gray-4)",
          }}
        >
          <Tabs.Trigger
            value="models"
            style={{ fontWeight: 600, fontSize: "16px", padding: "6px 12px" }}
          >
            Models
          </Tabs.Trigger>
          <Tabs.Trigger
            value="datasets"
            style={{ fontWeight: 600, fontSize: "16px", padding: "6px 12px" }}
          >
            Datasets
          </Tabs.Trigger>
          <Tabs.Trigger
            value="spaces"
            style={{ fontWeight: 600, fontSize: "16px", padding: "6px 12px" }}
          >
            Spaces
          </Tabs.Trigger>
        </Tabs.List>

        <Box py="6" px="5" style={{ background: "white" }}>
          <Tabs.Content value="models">
            {loading ? (
              <Flex direction="column" align="center" gap="4" py="9">
                <Spinner size="3" />
                <Text size="3" style={{ fontWeight: 500 }}>
                  Loading models...
                </Text>
              </Flex>
            ) : error ? (
              <Flex direction="column" align="center" gap="4" py="9">
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
                    marginTop: "14px",
                    borderRadius: "8px",
                    fontWeight: 500,
                    padding: "10px 16px",
                  }}
                >
                  Retry
                </Button>
              </Flex>
            ) : filteredModels.length > 0 ? (
              <>
                <Flex mb="5" justify="between" align="center">
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
                        padding: "10px 16px",
                      }}
                    >
                      Upload Model
                    </Button>
                  </Link>
                </Flex>

                <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="5">
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
                          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                          border: "1px solid var(--gray-4)",
                          overflow: "hidden",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        }}
                      >
                        <Flex
                          direction="column"
                          gap="4"
                          style={{ height: "100%", padding: "18px" }}
                        >
                          <Flex align="center" gap="3" mb="1">
                            <Avatar
                              size="2"
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${model.creator}`}
                              fallback={model.creator.charAt(0)}
                              radius="full"
                            />
                            <Text size="2" style={{ fontWeight: 500 }}>
                              {model.creator.length > SUI_ADDRESS_DISPLAY_LENGTH
                                ? model.creator.slice(0, SUI_ADDRESS_DISPLAY_LENGTH) + "..."
                                : model.creator}
                            </Text>
                          </Flex>

                          <Heading size="4" style={{ fontWeight: 600, lineHeight: 1.4 }}>
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
                              lineHeight: 1.5,
                              letterSpacing: "0.01em",
                            }}
                          >
                            {model.description}
                          </Text>

                          <Flex gap="3" mt="2" wrap="wrap">
                            <Badge
                              size="1"
                              variant="soft"
                              style={{
                                background: TASK_COLORS[model.task_type]?.bg || "var(--accent-3)",
                                color: TASK_COLORS[model.task_type]?.text || "var(--accent-11)",
                                padding: "4px 8px",
                              }}
                            >
                              {TASK_NAMES[model.task_type] || model.task_type}
                            </Badge>
                            {model.frameworks &&
                              model.frameworks.map((framework: string) => (
                                <Badge
                                  key={framework}
                                  size="1"
                                  variant="soft"
                                  style={{ padding: "4px 8px" }}
                                >
                                  {framework}
                                </Badge>
                              ))}
                          </Flex>

                          <Flex justify="between" align="center" mt="3">
                            <Flex gap="4" align="center">
                              <Flex gap="2" align="center">
                                <StarFilledIcon
                                  width="14"
                                  height="14"
                                  style={{ color: "#FFB800" }}
                                />
                                <Text size="1" style={{ fontWeight: 500 }}>
                                  {model.likes}
                                </Text>
                              </Flex>
                              <Flex gap="2" align="center">
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
                            <Flex align="center" gap="2">
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
              <Flex direction="column" align="center" gap="4" py="9">
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
                <Text
                  size="2"
                  color="gray"
                  align="center"
                  style={{ maxWidth: "400px", lineHeight: 1.5, letterSpacing: "0.01em" }}
                >
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
                    marginTop: "14px",
                    borderRadius: "8px",
                    fontWeight: 500,
                    padding: "10px 16px",
                  }}
                >
                  Reset Filters
                </Button>
              </Flex>
            )}
          </Tabs.Content>

          <Tabs.Content value="datasets">
            <Flex direction="column" align="center" gap="4" py="9">
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
              <Text
                size="2"
                color="gray"
                align="center"
                style={{ maxWidth: "400px", lineHeight: 1.5, letterSpacing: "0.01em" }}
              >
                Dataset support is currently under development. Stay tuned for updates!
              </Text>
            </Flex>
          </Tabs.Content>

          <Tabs.Content value="spaces">
            <Flex direction="column" align="center" gap="4" py="9">
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
              <Text
                size="2"
                color="gray"
                align="center"
                style={{ maxWidth: "400px", lineHeight: 1.5, letterSpacing: "0.01em" }}
              >
                Spaces functionality is currently under development. Stay tuned for updates!
              </Text>
            </Flex>
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Box>
  );
}
