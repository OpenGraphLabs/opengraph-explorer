import { useState } from "react";
import { Box, Tabs } from "@radix-ui/themes";
import { motion } from "framer-motion";
import { ModelOverviewTab, ModelInferenceTab } from "../../../components/model";

interface ModelTabsProps {
  model: any; // TODO: Improve typing based on actual model interface
}

export function ModelTabs({ model }: ModelTabsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Tabs.Root
        value={activeTab}
        onValueChange={setActiveTab}
        style={{
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          background: "#FFFFFF",
          border: "1px solid #FFE8E2",
        }}
      >
        <Tabs.List
          style={{
            background: "#FFF4F2",
            padding: "10px 20px",
            borderBottom: "1px solid #FFE8E2",
          }}
        >
          <Tabs.Trigger
            value="overview"
            style={{
              cursor: "pointer",
              fontWeight: activeTab === "overview" ? 700 : 500,
              color: activeTab === "overview" ? "#FF5733" : "#666",
              transition: "all 0.3s ease",
              padding: "8px 16px",
            }}
          >
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger
            value="inference"
            style={{
              cursor: "pointer",
              fontWeight: activeTab === "inference" ? 700 : 500,
              color: activeTab === "inference" ? "#FF5733" : "#666",
              transition: "all 0.3s ease",
              padding: "8px 16px",
            }}
          >
            On-Chain Inference
          </Tabs.Trigger>
        </Tabs.List>

        <Box py="5" px="4" style={{ background: "white" }}>
          {/* Overview Tab */}
          <Tabs.Content value="overview">
            <ModelOverviewTab model={model} />
          </Tabs.Content>

          {/* Inference Tab */}
          <Tabs.Content value="inference">
            <ModelInferenceTab model={model} />
          </Tabs.Content>
        </Box>
      </Tabs.Root>
    </motion.div>
  );
} 