import { Link, useNavigate } from "react-router-dom";
import { Box, Card, Flex, Text, Badge } from "@radix-ui/themes";
import { FileText, Shield, Archive, Palette } from "phosphor-react";
import { DatasetRead } from "@/shared/api/generated/models";
import { formatDataSize, getDataTypeColor, truncateAddress } from "../utils";
import { useTheme } from "@/shared/ui/design-system";
import { Button } from "@/shared/ui/design-system/components";

// Extended DatasetRead with image_count from server response
interface DatasetWithImageCount extends DatasetRead {
  image_count?: number;
}

interface DatasetCardProps {
  dataset: DatasetWithImageCount;
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
  const navigate = useNavigate();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleAnnotationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/datasets/${dataset.id}/annotate`);
  };

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
            padding: theme.spacing.semantic.component.lg,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${theme.colors.border.primary}`,
            backgroundColor: theme.colors.background.card,
            display: "flex",
            flexDirection: "column",
            minHeight: "220px",
            height: "auto",
            transition: theme.animations.transitions.hover,
            cursor: "pointer",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = theme.shadows.semantic.card.medium;
            e.currentTarget.style.borderColor = `${theme.colors.interactive.primary}40`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = theme.shadows.semantic.card.low;
            e.currentTarget.style.borderColor = theme.colors.border.primary;
          }}
        >
          <Flex direction="column" gap="4" style={{ height: "100%" }}>
            {/* Header: Dataset Name */}
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text
                size="4"
                weight="bold"
                style={{
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.semantic.component.xs,
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

              {/* Description */}
              {dataset.description && (
                <Text
                  size="2"
                  style={{
                    color: theme.colors.text.secondary,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: "1.4",
                    marginBottom: theme.spacing.semantic.component.sm,
                  }}
                >
                  {dataset.description}
                </Text>
              )}
            </Box>

            {/* Tags */}
            {dataset.tags && dataset.tags.length > 0 && (
              <Flex
                gap="1"
                wrap="wrap"
                style={{ marginBottom: theme.spacing.semantic.component.xs }}
              >
                {dataset.tags.slice(0, 3).map((tag, tagIndex) => (
                  <Badge
                    key={tagIndex}
                    size="1"
                    style={{
                      backgroundColor: `${theme.colors.interactive.primary}15`,
                      color: theme.colors.interactive.primary,
                      border: `1px solid ${theme.colors.interactive.primary}30`,
                      borderRadius: theme.borders.radius.sm,
                      padding: "2px 6px",
                      fontSize: "10px",
                      fontWeight: "500",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
                {dataset.tags.length > 3 && (
                  <Badge
                    size="1"
                    style={{
                      backgroundColor: `${theme.colors.text.tertiary}15`,
                      color: theme.colors.text.tertiary,
                      border: `1px solid ${theme.colors.text.tertiary}30`,
                      borderRadius: theme.borders.radius.sm,
                      padding: "2px 6px",
                      fontSize: "10px",
                      fontWeight: "500",
                    }}
                  >
                    +{dataset.tags.length - 3}
                  </Badge>
                )}
              </Flex>
            )}

            {/* Stats */}
            <Flex
              justify="between"
              align="center"
              style={{ marginBottom: theme.spacing.semantic.component.sm }}
            >
              <Flex gap="3" align="center">
                <Flex align="center" gap="1">
                  <FileText width="12" height="12" style={{ color: theme.colors.text.tertiary }} />
                  <Text
                    size="1"
                    style={{
                      color: theme.colors.text.tertiary,
                      fontWeight: "500",
                      fontSize: "11px",
                    }}
                  >
                    {formatNumber(dataset.image_count || 0)} images
                  </Text>
                </Flex>

                <Flex align="center" gap="1">
                  <Shield width="12" height="12" style={{ color: theme.colors.status.success }} />
                  <Text
                    size="1"
                    style={{
                      color: theme.colors.status.success,
                      fontWeight: "500",
                      fontSize: "11px",
                    }}
                  >
                    Verified
                  </Text>
                </Flex>
              </Flex>

              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  fontSize: "10px",
                }}
              >
                {formatDate(dataset.created_at)}
              </Text>
            </Flex>

            {/* Action Button */}
            <Button
              onClick={handleAnnotationClick}
              style={{
                width: "100%",
                background: theme.colors.interactive.primary,
                color: theme.colors.text.inverse,
                border: "none",
                borderRadius: theme.borders.radius.md,
                padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: theme.spacing.semantic.component.sm,
                marginTop: "auto",
                transition: theme.animations.transitions.all,
              }}
            >
              <Palette size={16} weight="fill" />
              Join Annotation
            </Button>
          </Flex>
        </Card>
      </Link>
    </Box>
  );
};
