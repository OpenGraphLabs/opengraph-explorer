import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Flex,
  Heading,
  Text,
  Tabs,
  Button,
  Avatar,
} from "@radix-ui/themes";
import {
  HeartIcon,
  DownloadIcon,
  Share1Icon,
} from "@radix-ui/react-icons";
import { useModelById } from "../hooks/useModels";
import { 
  ModelOverviewTab, 
  ModelFilesTab, 
  ModelDataTab, 
  ModelInferenceTab 
} from "../components/model";

export function ModelDetail() {
  const { id } = useParams<{ id: string }>();
  const { model, loading, error } = useModelById(id || "");
  const [activeTab, setActiveTab] = useState("overview");

  // 데이터 로딩 중이면 로딩 상태 표시
  if (loading) {
    return (
      <Flex direction="column" align="center" gap="3" py="8">
        <Text>모델 데이터를 불러오는 중입니다...</Text>
      </Flex>
    );
  }

  // 오류가 발생했거나 모델이 없는 경우
  if (error || !model) {
    return (
      <Flex direction="column" align="center" gap="3" py="8">
        <Text>{error || "모델을 찾을 수 없습니다."}</Text>
      </Flex>
    );
  }

  return (
    <Box>
      {/* Model Header */}
      <Flex direction="column" gap="4" mb="6">
        <Flex justify="between" align="start">
          <Box>
            <Heading size="8" style={{ fontWeight: 700 }}>
              {model.name}
            </Heading>
            <Flex align="center" gap="2" mt="1">
              <Avatar size="2" fallback={model.creator[0]} style={{ background: "#FF5733" }} />
              <Text size="2">{model.creator}</Text>
            </Flex>
          </Box>

          <Flex gap="2">
            <Button variant="soft" style={{ borderRadius: "8px" }}>
              <HeartIcon style={{ color: "#F06292" }} />
              <Text>{model.likes}</Text>
            </Button>
            <Button variant="soft" style={{ borderRadius: "8px" }}>
              <DownloadIcon style={{ color: "#4CAF50" }} />
              <Text>{model.downloads}</Text>
            </Button>
            <Button variant="soft" style={{ borderRadius: "8px" }}>
              <Share1Icon style={{ color: "#2196F3" }} />
            </Button>
          </Flex>
        </Flex>

        <Text style={{ fontSize: "16px", lineHeight: "1.6" }}>{model.description}</Text>

        <ModelMetadataCards model={model} />
      </Flex>

      {/* Tab Navigation */}
      <Tabs.Root
        value={activeTab}
        onValueChange={setActiveTab}
        style={{
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Tabs.List
          style={{
            background: "var(--gray-2)",
            padding: "8px",
            borderBottom: "1px solid var(--gray-4)",
          }}
        >
          <Tabs.Trigger value="overview" style={{ fontWeight: 600 }}>
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger value="inference" style={{ fontWeight: 600 }}>
            Inference
          </Tabs.Trigger>
          <Tabs.Trigger value="files" style={{ fontWeight: 600 }}>
            Files
          </Tabs.Trigger>
          <Tabs.Trigger value="model-data" style={{ fontWeight: 600 }}>
            Model Data
          </Tabs.Trigger>
        </Tabs.List>

        <Box py="4" px="3" style={{ background: "white" }}>
          {/* Overview Tab */}
          <Tabs.Content value="overview">
            <ModelOverviewTab model={model} />
          </Tabs.Content>

          {/* Inference Tab */}
          <Tabs.Content value="inference">
            <ModelInferenceTab model={model} />
          </Tabs.Content>

          {/* Files Tab */}
          <Tabs.Content value="files">
            <ModelFilesTab model={model} />
          </Tabs.Content>

          {/* Model Data Tab */}
          <Tabs.Content value="model-data">
            <ModelDataTab model={model} />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </Box>
  );
}

// 모델 메타데이터 카드 컴포넌트
interface ModelMetadataCardsProps {
  model: {
    task_type: string;
  };
}

function ModelMetadataCards({ model }: ModelMetadataCardsProps) {
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

  return (
    <Flex gap="3">
      <Box style={{ borderRadius: "8px", background: "#F5F5F5", border: "none", padding: "8px 12px" }}>
        <Flex align="center" gap="2">
          <Text size="2" style={{ fontWeight: 500 }}>
            Task: {getTaskName(model.task_type)}
          </Text>
        </Flex>
      </Box>
      <Box style={{ borderRadius: "8px", background: "#F5F5F5", border: "none", padding: "8px 12px" }}>
        <Flex align="center" gap="2">
          <Text size="2" style={{ fontWeight: 500 }}>
            License: MIT
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
}
