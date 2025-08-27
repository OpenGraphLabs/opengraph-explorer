import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMobile } from "@/shared/hooks";
import { useTasks, Task } from "@/shared/api/endpoints/tasks";
import { TaskSelectionDesktop, TaskSelectionMobile } from "@/components/task-selection";

export function TaskSelection() {
  const { isMobile } = useMobile();
  const navigate = useNavigate();
  const { id: datasetId } = useParams();
  const { data: tasks, isLoading, error } = useTasks({ limit: 50 });
  const [searchQuery, setSearchQuery] = useState("");

  const handleTaskSelect = (task: Task) => {
    navigate(`/datasets/${datasetId}/first-person-capture?taskId=${task.id}`);
  };

  const filteredTasks = React.useMemo(() => {
    if (!tasks) return [];

    if (!searchQuery) return tasks;

    return tasks.filter(task => task.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [tasks, searchQuery]);

  const commonProps = {
    tasks,
    isLoading,
    error,
    searchQuery,
    filteredTasks,
    onSearchChange: setSearchQuery,
    onTaskSelect: handleTaskSelect,
  };

  if (isMobile) {
    return <TaskSelectionMobile {...commonProps} />;
  }

  return <TaskSelectionDesktop {...commonProps} />;
}
