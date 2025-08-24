import React, { useState } from "react";
import { Box, Text, Heading, Flex } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  MagnifyingGlass,
  Target,
  CheckCircle,
  Eye,
  Activity,
  CircleNotch,
} from "phosphor-react";
import { useTasks, Task } from "@/shared/api/endpoints/tasks";

function TaskCard({ task, onSelect }: { 
  task: Task; 
  onSelect: (task: Task) => void;
}) {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const getTaskIcon = (taskName: string): React.ReactElement => {
    const lowerName = taskName.toLowerCase();
    if (lowerName.includes("open") || lowerName.includes("close")) {
      return <Target size={18} weight="duotone" />;
    }
    if (lowerName.includes("check") || lowerName.includes("look") || lowerName.includes("see")) {
      return <Eye size={18} weight="duotone" />;
    }
    if (lowerName.includes("count") || lowerName.includes("measure")) {
      return <Activity size={18} weight="duotone" />;
    }
    return <CheckCircle size={18} weight="duotone" />;
  };

  const taskIcon = getTaskIcon(task.name);

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(task)}
      style={{
        padding: "20px",
        borderRadius: "12px",
        backgroundColor: theme.colors.background.card,
        border: `1px solid ${isHovered ? theme.colors.interactive.primary + "40" : theme.colors.border.primary}`,
        cursor: "pointer",
        transition: "all 0.2s ease",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: isHovered
          ? `0 8px 25px rgba(0, 0, 0, 0.1), 0 0 0 1px ${theme.colors.interactive.primary}15`
          : `0 2px 4px rgba(0, 0, 0, 0.06)`,
      }}
    >
      <Flex direction="column" gap="3">
        {/* Header */}
        <Flex align="center" justify="between">
          <Flex align="center" gap="3">
            <Box
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                background: `${theme.colors.interactive.primary}12`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.colors.interactive.primary,
              }}
            >
              {taskIcon}
            </Box>
            <Text
              size="1"
              style={{
                color: theme.colors.text.tertiary,
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              #{task.id.toString().padStart(3, '0')}
            </Text>
          </Flex>
          
          <Flex
            align="center"
            gap="2"
            style={{
              color: theme.colors.interactive.primary,
              opacity: isHovered ? 1 : 0.6,
              transition: "opacity 0.2s ease",
            }}
          >
            <Text
              size="2"
              style={{
                fontWeight: 500,
                fontSize: "12px",
              }}
            >
              Start
            </Text>
            <ArrowRight size={14} weight="bold" />
          </Flex>
        </Flex>

        {/* Task Name */}
        <Box>
          <Text
            style={{
              color: theme.colors.text.primary,
              fontSize: "15px",
              lineHeight: 1.4,
              fontWeight: 500,
            }}
          >
            {task.name}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

export function SpaceSelection() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { id: datasetId } = useParams();
  const { data: tasks, isLoading, error } = useTasks({ size: 50 });
  const [searchQuery, setSearchQuery] = useState("");

  const handleTaskSelect = (task: Task) => {
    navigate(`/datasets/${datasetId}/first-person-capture?taskId=${task.id}`);
  };

  const filteredTasks = React.useMemo(() => {
    if (!tasks) return [];
    
    if (!searchQuery) return tasks;
    
    return tasks.filter(task =>
      task.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  if (error) {
    return (
      <Box style={{ 
        minHeight: "100vh",
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        padding: theme.spacing.semantic.layout.lg 
      }}>
        <Text style={{ color: theme.colors.status.error, fontSize: "16px" }}>
          Failed to load tasks. Please try again later.
        </Text>
      </Box>
    );
  }

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: `linear-gradient(to bottom, ${theme.colors.background.secondary}40, ${theme.colors.background.primary})`,
      }}
    >
      {/* Header */}
      <Box
        style={{
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          backgroundColor: theme.colors.background.card,
          padding: `${theme.spacing.semantic.layout.md} ${theme.spacing.semantic.container.md}`,
        }}
      >
        <Box
          style={{
            maxWidth: "1800px",
            margin: "0 auto",
          }}
        >
          <Flex align="center" justify="between">
            <Box>
              <Heading
                size="6"
                style={{
                  color: theme.colors.text.primary,
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                Select Task
              </Heading>
              <Text
                size="3"
                style={{
                  color: theme.colors.text.secondary,
                }}
              >
                Choose a robotics task to complete through first-person capture
              </Text>
            </Box>
            
            <Flex align="center" gap="4">
              <Text
                size="2"
                style={{
                  color: theme.colors.text.secondary,
                  fontWeight: 500,
                }}
              >
                {tasks?.length || 0} available tasks
              </Text>
            </Flex>
          </Flex>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        style={{
          maxWidth: "1800px",
          margin: "0 auto",
          padding: `${theme.spacing.semantic.layout.lg} ${theme.spacing.semantic.container.md}`,
        }}
      >
        {/* Search Bar */}
        <Box style={{ marginBottom: "32px" }}>
          <Box style={{ position: "relative", maxWidth: "500px" }}>
            <Box
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: theme.colors.text.tertiary,
                zIndex: 1,
              }}
            >
              <MagnifyingGlass size={18} weight="duotone" />
            </Box>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 44px",
                fontSize: "14px",
                borderRadius: "8px",
                border: `1px solid ${theme.colors.border.secondary}`,
                backgroundColor: theme.colors.background.card,
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                outline: "none",
                color: theme.colors.text.primary,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.colors.interactive.primary;
                e.target.style.boxShadow = `0 0 0 3px ${theme.colors.interactive.primary}15`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.colors.border.secondary;
                e.target.style.boxShadow = "none";
              }}
            />
          </Box>
        </Box>

        {/* Task Grid */}
        {isLoading ? (
          <Flex align="center" justify="center" style={{ minHeight: "400px" }}>
            <Flex align="center" gap="3">
              <CircleNotch size={20} color={theme.colors.interactive.primary} className="animate-spin" />
              <Text style={{ color: theme.colors.text.secondary }}>Loading tasks...</Text>
            </Flex>
          </Flex>
        ) : filteredTasks.length > 0 ? (
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "20px",
            }}
          >
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onSelect={handleTaskSelect}
              />
            ))}
          </Box>
        ) : (
          <Box
            style={{
              textAlign: "center",
              padding: "60px 20px",
              borderRadius: "12px",
              border: `1px dashed ${theme.colors.border.secondary}`,
              backgroundColor: `${theme.colors.background.secondary}30`,
            }}
          >
            <MagnifyingGlass 
              size={32} 
              color={theme.colors.text.tertiary} 
              weight="duotone" 
              style={{ marginBottom: "12px" }}
            />
            <Text
              size="3"
              style={{
                color: theme.colors.text.secondary,
                marginBottom: "4px",
                fontWeight: 500,
              }}
            >
              No tasks found
            </Text>
            <Text
              size="2"
              style={{
                color: theme.colors.text.tertiary,
              }}
            >
              Try a different search term
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}