import React from 'react';
import { Flex, Box, Select, Badge } from '@radix-ui/themes';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { ModelFilters, TaskFilter } from '../types';
import { TASK_COLORS, TASK_NAMES, TASK_TYPES } from '@/shared/constants/suiConfig.ts';
import styles from '@/styles/Card.module.css';

interface ModelSearchFiltersProps {
  filters: ModelFilters;
  onSearchQueryChange: (query: string) => void;
  onTaskChange: (task: string) => void;
  onSortChange: (sort: string) => void;
  resultCount: number;
}

const taskFilters: TaskFilter[] = [
  { value: "all", label: "All Tasks", icon: "🔍 " },
  { value: TASK_TYPES.TEXT_GENERATION, label: TASK_NAMES[TASK_TYPES.TEXT_GENERATION], icon: "📝 " },
  { value: TASK_TYPES.TEXT_CLASSIFICATION, label: TASK_NAMES[TASK_TYPES.TEXT_CLASSIFICATION], icon: "🏷️ " },
  { value: TASK_TYPES.IMAGE_CLASSIFICATION, label: TASK_NAMES[TASK_TYPES.IMAGE_CLASSIFICATION], icon: "🖼️ " },
  { value: TASK_TYPES.OBJECT_DETECTION, label: TASK_NAMES[TASK_TYPES.OBJECT_DETECTION], icon: "🎯 " },
  { value: TASK_TYPES.TEXT_TO_IMAGE, label: TASK_NAMES[TASK_TYPES.TEXT_TO_IMAGE], icon: "🎨 " },
  { value: TASK_TYPES.TRANSLATION, label: TASK_NAMES[TASK_TYPES.TRANSLATION], icon: "🌐 " },
];

export function ModelSearchFilters({
  filters,
  onSearchQueryChange,
  onTaskChange,
  onSortChange,
  resultCount,
}: ModelSearchFiltersProps) {
  return (
    <>
      {/* Search and Filter Section */}
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
            <div className="rt-TextFieldSlot" style={{ marginRight: "10px" }}>
              <MagnifyingGlassIcon height="16" width="16" />
            </div>
            <input 
              className={`rt-TextFieldInput ${styles.searchField}`}
              placeholder="Search models by name or description..." 
              value={filters.searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchQueryChange(e.target.value)}
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
          <Select.Root value={filters.selectedTask} onValueChange={onTaskChange}>
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

      {/* Stats Summary */}
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
            <span style={{ fontWeight: "500" }}>
              {resultCount} {resultCount === 1 ? "model" : "models"} 
            </span>
            {filters.selectedTask !== "all" && (
              <Badge 
                variant="soft" 
                style={{ 
                  background: TASK_COLORS[filters.selectedTask]?.bg || "var(--accent-3)",
                  color: TASK_COLORS[filters.selectedTask]?.text || "var(--accent-11)",
                }}
              >
                {TASK_NAMES[filters.selectedTask] || filters.selectedTask}
              </Badge>
            )}
            {filters.searchQuery && (
              <Badge variant="soft" color="blue">
                "{filters.searchQuery}"
              </Badge>
            )}
          </Flex>
          
          <Flex align="center" gap="3">
            <Select.Root 
              value={filters.selectedSort}
              onValueChange={onSortChange}
            >
              <Select.Trigger
                style={{
                  padding: "8px 12px",
                  border: "1px solid var(--gray-5)",
                  borderRadius: "8px",
                  background: "white",
                  fontSize: "13px",
                  cursor: "pointer",
                  minWidth: "180px",
                }}
              >
                {filters.selectedSort === "downloads" && "Most Downloads"}
                {filters.selectedSort === "likes" && "Most Likes"}
                {filters.selectedSort === "newest" && "Newest First"}
              </Select.Trigger>
              <Select.Content position="popper">
                <Select.Group>
                  <Select.Label style={{ padding: "8px 22px", color: "var(--gray-9)", fontSize: "12px", fontWeight: 600 }}>
                    Sort by
                  </Select.Label>
                  <Select.Item value="downloads" style={{ padding: "8px 22px", cursor: "pointer" }}>
                    Most Downloads
                  </Select.Item>
                  <Select.Item value="likes" style={{ padding: "8px 22px", cursor: "pointer" }}>
                    Most Likes
                  </Select.Item>
                  <Select.Item value="newest" style={{ padding: "8px 22px", cursor: "pointer" }}>
                    Newest First
                  </Select.Item>
                </Select.Group>
              </Select.Content>
            </Select.Root>
          </Flex>
        </Flex>
      </Box>
    </>
  );
} 