import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Grid,
  Button,
  Select,
  Spinner,
  Badge,
} from "@radix-ui/themes";
import {
  MagnifyingGlassIcon,
  DownloadIcon,
  StarFilledIcon,
  ChevronUpIcon,
  CodeIcon,
} from "@radix-ui/react-icons";
import { Link, useNavigate } from "react-router-dom";
import styles from "@/styles/Card.module.css";
import { useModels } from "@/shared/hooks/useModels";
import { ModelCard } from "@/features/model";
import {
  TASK_COLORS,
  TASK_NAMES,
  TASK_TYPES,
} from "@/shared/constants/suiConfig";

export function Models() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState("all");
  const [selectedSort, setSelectedSort] = useState("downloads");
  
  // New state for animation
  const [isLoaded, setIsLoaded] = useState(false);

  // Use custom hook to fetch model data
  const { models, loading, error, refetch } = useModels();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !error) {
      // Trigger animation after models load
      setTimeout(() => setIsLoaded(true), 100);
    }
  }, [loading, error]);

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

  // Task filter options with icons and colors
  const taskFilters = [
    { value: "all", label: "All Tasks", icon: "🔍 " },
    { value: TASK_TYPES.TEXT_GENERATION, label: TASK_NAMES[TASK_TYPES.TEXT_GENERATION], icon: "📝 " },
    { value: TASK_TYPES.TEXT_CLASSIFICATION, label: TASK_NAMES[TASK_TYPES.TEXT_CLASSIFICATION], icon: "🏷️ " },
    { value: TASK_TYPES.IMAGE_CLASSIFICATION, label: TASK_NAMES[TASK_TYPES.IMAGE_CLASSIFICATION], icon: "🖼️ " },
    { value: TASK_TYPES.OBJECT_DETECTION, label: TASK_NAMES[TASK_TYPES.OBJECT_DETECTION], icon: "🎯 " },
    { value: TASK_TYPES.TEXT_TO_IMAGE, label: TASK_NAMES[TASK_TYPES.TEXT_TO_IMAGE], icon: "🎨 " },
    { value: TASK_TYPES.TRANSLATION, label: TASK_NAMES[TASK_TYPES.TRANSLATION], icon: "🌐 " },
  ];

  return (
    <Box className={`${isLoaded ? styles.pageLoaded : ''}`} style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 28px", minHeight: "90vh" }}>
      <Flex gap="5" justify="between" align="baseline" mb="6">
        <div>
          <Heading 
            size={{ initial: "8", md: "9" }} 
            style={{ fontWeight: 800, letterSpacing: "-0.03em", background: "linear-gradient(90deg, #FF5733 0%, #E74C3C 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            mb="2"
          >
            Explore Models
          </Heading>
          <Text size="3" color="gray" style={{ maxWidth: "620px" }}>
            Discover AI models powered by Sui blockchain and ready for on-chain inference
          </Text>
        </div>
        <Link to="/upload">
          <Button 
            size="3"
            style={{
              background: "#FF5733",
              color: "white",
              borderRadius: "8px",
              fontWeight: 600,
              padding: "10px 18px",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(255, 87, 51, 0.25)",
              border: "none",
              transition: "all 0.2s ease",
            }}
            className={styles.uploadButton}
          >
            Upload Model
          </Button>
        </Link>
      </Flex>

      {/* Enhanced Search and Filter Section */}
      <Flex 
        direction={{ initial: "column", sm: "row" }} 
        gap="4" 
        mb="6" 
        style={{ 
          background: "white", 
          padding: "20px", 
          borderRadius: "16px", 
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)", 
          border: "1px solid var(--gray-4)"
        }}
      >
        <Box style={{ flex: 1 }}>
          <div className="rt-TextFieldRoot" style={{ width: "100%" }}>
            <div className="rt-TextFieldSlot" style={{ marginRight: "10px" }} >
              <MagnifyingGlassIcon height="16" width="16" />
            </div>
            <input 
              className={`rt-TextFieldInput ${styles.searchField}`}
              placeholder="Search models by name or description..." 
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              style={{ 
                backgroundColor: "var(--gray-1)",
                borderRadius: "8px",
                border: "1px solid var(--gray-4)",
                padding: "10px 16px",
                width: "100%",
              }}
            />
          </div>
        </Box>
        
        <Flex gap="3" align="center">
          <Select.Root value={selectedTask} onValueChange={setSelectedTask}>
            <Select.Trigger 
              placeholder="Task Type" 
              style={{ 
                minWidth: "160px", 
                backgroundColor: "var(--gray-1)",
                border: "1px solid var(--gray-4)",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            />
            <Select.Content position="popper">
              <Select.Group>
                {taskFilters.map(task => (
                  <Select.Item 
                    key={task.value} 
                    value={task.value}
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>{task.icon}</span>
                    {task.label}
                  </Select.Item>
                ))}
              </Select.Group>
            </Select.Content>
          </Select.Root>
        </Flex>
      </Flex>

      {/* Stats summary */}
      {!loading && !error && (
        <Box mb="6">
          <Flex 
            justify="between" 
            align="center" 
            style={{ 
              padding: "16px 20px", 
              borderRadius: "12px", 
              background: "var(--gray-1)", 
              border: "1px solid var(--gray-4)",
            }}
          >
            <Flex align="center" gap="2">
              <Text weight="medium">
                {filteredModels.length} {filteredModels.length === 1 ? "model" : "models"} 
              </Text>
              {selectedTask !== "all" && (
                <Badge 
                  variant="soft" 
                  style={{ 
                    background: TASK_COLORS[selectedTask]?.bg || "var(--accent-3)",
                    color: TASK_COLORS[selectedTask]?.text || "var(--accent-11)",
                  }}
                >
                  {TASK_NAMES[selectedTask] || selectedTask}
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="soft" color="blue">
                  "{searchQuery}"
                </Badge>
              )}
            </Flex>
            
            <Flex align="center" gap="3">
              <Select.Root 
                value={selectedSort}
                onValueChange={setSelectedSort}
              >
                <Select.Trigger
                  style={{
                    padding: "8px 12px",
                    border: "1px solid var(--gray-5)",
                    borderRadius: "8px",
                    background: "white",
                    fontSize: "13px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.2s ease",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                    cursor: "pointer",
                    minWidth: "180px",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Flex align="center" gap="2" style={{ overflow: "hidden" }}>
                    {selectedSort === "downloads" && <DownloadIcon style={{ flexShrink: 0 }} />}
                    {selectedSort === "likes" && <StarFilledIcon style={{ flexShrink: 0 }} />}
                    {selectedSort === "newest" && <ChevronUpIcon style={{ flexShrink: 0 }} />}
                    
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                      {selectedSort === "downloads" && "Most Downloads"}
                      {selectedSort === "likes" && "Most Likes"}
                      {selectedSort === "newest" && "Newest First"}
                    </span>
                  </Flex>
                </Select.Trigger>

                <Select.Content 
                  position="popper" 
                  style={{ 
                    zIndex: 999,
                    borderRadius: "8px", 
                    overflow: "hidden", 
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)", 
                    border: "1px solid var(--gray-4)",
                    background: "white",
                    animation: "slideDown 0.2s ease",
                  }}
                >
                  <Select.Group>
                    <Select.Label style={{ padding: "8px 22px", color: "var(--gray-9)", fontSize: "12px", fontWeight: 600 }}>
                      Sort by
                    </Select.Label>
                    
                    <Select.Item 
                      value="downloads" 
                      style={{ 
                        padding: "8px 22px", 
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "8px",
                        fontSize: "13px",
                        transition: "background 0.1s ease",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <DownloadIcon style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }} />
                      <span style={{ display: "inline-block", verticalAlign: "middle", marginLeft: "6px" }}>Most Downloads</span>
                    </Select.Item>
                    
                    <Select.Item 
                      value="likes" 
                      style={{ 
                        padding: "8px 22px", 
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "13px",
                        transition: "background 0.1s ease",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <StarFilledIcon style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }} />
                      <span style={{ display: "inline-block", verticalAlign: "middle", marginLeft: "6px" }}>Most Likes</span>
                    </Select.Item>
                    
                    <Select.Item 
                      value="newest" 
                      style={{ 
                        padding: "8px 22px", 
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "13px",
                        transition: "background 0.1s ease",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <ChevronUpIcon style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }} />
                      <span style={{ display: "inline-block", verticalAlign: "middle", marginLeft: "6px" }}>Newest First</span>
                    </Select.Item>
                  </Select.Group>
                </Select.Content>
              </Select.Root>
            </Flex>
          </Flex>
        </Box>
      )}

      {/* Model Grid with improved cards */}
      {loading ? (
        <Flex direction="column" align="center" gap="4" py="9" style={{ minHeight: "60vh", justifyContent: "center" }}>
          <Spinner size="3" className={styles.loadingPulse} />
          <Text size="3" style={{ fontWeight: 500 }}>
            Loading amazing models...
          </Text>
        </Flex>
      ) : error ? (
        <Flex 
          direction="column" 
          align="center" 
          gap="4" 
          py="9" 
          style={{ 
            minHeight: "60vh", 
            justifyContent: "center",
            background: "white",
            borderRadius: "16px",
            padding: "40px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
            border: "1px solid var(--gray-4)"
          }}
        >
          <Box
            className={styles.emptyState}
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
          <Text size="6" style={{ fontWeight: 600 }}>
            Error Loading Models
          </Text>
          <Text size="3" color="gray" align="center" style={{ maxWidth: "400px" }}>
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
              cursor: "pointer",
            }}
          >
            Retry
          </Button>
        </Flex>
      ) : filteredModels.length > 0 ? (
        <Grid 
          columns={{ initial: "1", sm: "2", lg: "3" }} 
          gap="5" 
          className={styles.modelGrid}
          style={{
            maxWidth: "100%",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          }}
        >
          {filteredModels.map((model, index) => (
            <div
              key={model.id}
              style={{ 
                animationDelay: `${index * 50}ms`,
                opacity: isLoaded ? 1 : 0,
                transform: isLoaded ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 0.5s ease, transform 0.5s ease",
                height: "100%",
              }}
            >
              <ModelCard
                model={model}
                onClick={() => navigate(`/models/${model.id}`)}
                onViewDetails={() => navigate(`/models/${model.id}`)}
              />
            </div>
          ))}
        </Grid>
      ) : (
        <Flex 
          direction="column" 
          align="center" 
          gap="4" 
          py="9"
          style={{ 
            minHeight: "60vh", 
            justifyContent: "center",
            background: "white",
            borderRadius: "16px",
            padding: "40px",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
            border: "1px solid var(--gray-4)"
          }}
        >
          <Box
            className={styles.emptyState}
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
          <Text size="6" style={{ fontWeight: 600 }}>
            No Models Found
          </Text>
          <Text
            size="3"
            color="gray"
            align="center"
            style={{ maxWidth: "400px", lineHeight: 1.6, letterSpacing: "0.01em" }}
          >
            No models match your search criteria. Try changing your search terms or filters.
          </Text>
          <Link to="/upload">
            <Button
              style={{
                background: "#FF5733",
                color: "white",
                marginTop: "14px",
                borderRadius: "8px",
                fontWeight: 500,
                padding: "10px 16px",
                cursor: "pointer",
              }}
            >
              Upload Model
            </Button>
          </Link>
        </Flex>
      )}
    </Box>
  );
}
