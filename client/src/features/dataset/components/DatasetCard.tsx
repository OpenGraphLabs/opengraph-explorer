import { Link } from "react-router-dom";
import {
  Box,
  Card,
  Flex,
  Text,
  Badge,
} from "@radix-ui/themes";
import { 
  FileText,
  Shield,
  Clock,
  Archive,
  User
} from "phosphor-react";
import { DatasetObject } from "@/shared/api/graphql/datasetGraphQLService.ts";
import { formatDataSize, getDataTypeIcon, getDataTypeColor, truncateAddress } from "../utils";
import { useTheme } from "@/shared/ui/design-system";

interface DatasetCardProps {
  dataset: DatasetObject;
  index: number;
  isLoaded: boolean;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
};

export const DatasetCard = ({ dataset, index, isLoaded }: DatasetCardProps) => {
  const { theme } = useTheme();
  const dataTypeColorConfig = getDataTypeColor(dataset.dataType);
  const dataTypeColor = dataTypeColorConfig.text;

  return (
    <Box
      className={isLoaded ? "visible" : ""}
      style={{
        animationDelay: `${index * 0.05}s`,
        animationFillMode: "both",
      }}
    >
      <Link to={`/datasets/${dataset.id}`} style={{ textDecoration: "none" }}>
        <Card
          style={{
            padding: theme.spacing.semantic.component.md,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${theme.colors.border.primary}`,
            backgroundColor: theme.colors.background.card,
            height: "110px",
            display: "flex",
            flexDirection: "column",
            minHeight: "110px",
            transition: theme.animations.transitions.hover,
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = theme.shadows.semantic.card.medium;
            e.currentTarget.style.borderColor = `${theme.colors.interactive.primary}40`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = theme.shadows.semantic.card.low;
            e.currentTarget.style.borderColor = theme.colors.border.primary;
          }}
        >
          <Flex direction="column" gap="2" style={{ height: "100%" }}>
            {/* Header: Dataset Name + Type Badge */}
            <Flex justify="between" align="start" gap="2">
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Text
                  size="3"
                  weight="bold"
                  style={{
                    color: theme.colors.text.primary,
                    marginBottom: "2px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: "1.3",
                  }}
                >
                  {dataset.name}
                </Text>
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.secondary,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: "1.2",
                  }}
                >
                  by {truncateAddress(dataset.creator || "Unknown", 12)}
                </Text>
              </Box>

              <Badge
                size="1"
                style={{
                  backgroundColor: `${dataTypeColor}20`,
                  color: dataTypeColor,
                  border: `1px solid ${theme.colors.border.secondary}`,
                  borderRadius: theme.borders.radius.sm,
                  padding: "2px 6px",
                  fontSize: "10px",
                  fontWeight: "500",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {dataset.dataType.split("/")[0]}
              </Badge>
            </Flex>

            {/* Spacer */}
            <Box style={{ flex: 1 }} />

            {/* Footer: Stats */}
            <Flex justify="between" align="center" style={{ marginTop: "auto" }}>
              <Flex gap="3" align="center">
                <Flex align="center" gap="1">
                  <FileText 
                    width="11" 
                    height="11" 
                    style={{ color: theme.colors.text.tertiary }} 
                  />
                  <Text 
                    size="1" 
                    style={{ 
                      color: theme.colors.text.tertiary, 
                      fontWeight: "500",
                      fontSize: "10px"
                    }}
                  >
                    {formatNumber(dataset.dataCount || 0)}
                  </Text>
                </Flex>
                
                <Flex align="center" gap="1">
                  <Archive 
                    width="11" 
                    height="11" 
                    style={{ color: theme.colors.text.tertiary }} 
                  />
                  <Text 
                    size="1" 
                    style={{ 
                      color: theme.colors.text.tertiary, 
                      fontWeight: "500",
                      fontSize: "10px"
                    }}
                  >
                    {formatDataSize(dataset.dataSize)}
                  </Text>
                </Flex>
              </Flex>

              <Flex align="center" gap="1">
                <Shield 
                  width="11" 
                  height="11" 
                  style={{ color: theme.colors.status.success }} 
                />
                <Text 
                  size="1" 
                  style={{ 
                    color: theme.colors.text.muted, 
                    fontWeight: "500",
                    fontSize: "9px"
                  }}
                >
                  Verified
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      </Link>
    </Box>
  );
};
