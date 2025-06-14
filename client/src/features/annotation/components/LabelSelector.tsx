import { useState } from "react";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { CaretDown, Check, Palette } from "phosphor-react";
import { getLabelColor, getContrastTextColor } from "../utils/labelColors";

interface LabelSelectorProps {
  labels: string[];
  selectedLabel: string | null;
  onSelectLabel: (label: string) => void;
  maxVisibleLabels?: number;
  compact?: boolean;
}

export function LabelSelector({
  labels,
  selectedLabel,
  onSelectLabel,
  maxVisibleLabels = 4,
  compact = false,
}: LabelSelectorProps) {
  const { theme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  if (labels.length === 0) {
    return (
      <Box
        style={{
          padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
          background: `${theme.colors.status.warning}08`,
          border: `1px solid ${theme.colors.status.warning}30`,
          borderRadius: theme.borders.radius.md,
          display: "flex",
          alignItems: "center",
          gap: theme.spacing.semantic.component.xs,
        }}
      >
        <Palette size={16} style={{ color: theme.colors.status.warning }} />
        <Text size="2" style={{ color: theme.colors.status.warning, fontWeight: 500 }}>
          No labels available
        </Text>
      </Box>
    );
  }

  const visibleLabels = labels.slice(0, maxVisibleLabels);
  const hiddenLabels = labels.slice(maxVisibleLabels);

  if (compact && labels.length > 0) {
    // 매우 컴팩트한 Select 스타일 드롭다운
    return (
      <Box style={{ position: "relative", minWidth: "200px" }}>
        <Button
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            background: selectedLabel
              ? `${getLabelColor(selectedLabel)}12`
              : theme.colors.background.card,
            color: selectedLabel ? getLabelColor(selectedLabel) : theme.colors.text.secondary,
            border: `1px solid ${
              selectedLabel ? `${getLabelColor(selectedLabel)}80` : theme.colors.border.secondary
            }`,
            borderRadius: theme.borders.radius.md,
            padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: theme.spacing.semantic.component.sm,
            transition: "all 0.2s ease",
            width: "100%",
            position: "relative",
          }}
        >
          <Flex align="center" gap="2">
            {selectedLabel ? (
              <>
                <Box
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: getLabelColor(selectedLabel),
                    flexShrink: 0,
                  }}
                />
                <Text
                  size="2"
                  style={{
                    color: "inherit",
                    fontWeight: "inherit",
                    maxWidth: "120px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={selectedLabel}
                >
                  {selectedLabel}
                </Text>
              </>
            ) : (
              <>
                <Palette size={12} style={{ color: "inherit", opacity: 0.7 }} />
                <Text size="2" style={{ color: "inherit", fontStyle: "italic" }}>
                  Select label...
                </Text>
              </>
            )}
          </Flex>

          <CaretDown
            size={12}
            style={{
              color: "inherit",
              transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
              opacity: 0.7,
            }}
          />
        </Button>

        {showDropdown && (
          <Box
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 1000,
              background: theme.colors.background.card,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.md,
              boxShadow: theme.shadows.semantic.card.medium,
              maxHeight: "280px",
              overflowY: "auto",
              backdropFilter: "blur(12px)",
              marginTop: "4px",
            }}
          >
            {/* 검색창이 많은 라벨이 있을 때 유용할 수 있음 */}
            {labels.length > 10 && (
              <Box
                style={{
                  padding: theme.spacing.semantic.component.sm,
                  borderBottom: `1px solid ${theme.colors.border.secondary}`,
                  position: "sticky",
                  top: 0,
                  background: theme.colors.background.card,
                  zIndex: 1,
                }}
              >
                <input
                  type="text"
                  placeholder="Search labels..."
                  style={{
                    width: "100%",
                    padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                    border: `1px solid ${theme.colors.border.secondary}`,
                    borderRadius: theme.borders.radius.sm,
                    background: theme.colors.background.secondary,
                    color: theme.colors.text.primary,
                    fontSize: "11px",
                    outline: "none",
                  }}
                  onChange={_ => {
                    // TODO: 나중에 검색 기능 구현할 수 있음
                  }}
                />
              </Box>
            )}

            <Box style={{ padding: `${theme.spacing.semantic.component.xs} 0` }}>
              {labels.map(label => {
                const labelColor = getLabelColor(label);
                const isSelected = selectedLabel === label;

                return (
                  <Box
                    key={label}
                    onClick={() => {
                      onSelectLabel(label);
                      setShowDropdown(false);
                    }}
                    style={{
                      padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                      cursor: "pointer",
                      background: isSelected ? `${labelColor}10` : "transparent",
                      borderLeft: isSelected ? `3px solid ${labelColor}` : "3px solid transparent",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: theme.spacing.semantic.component.sm,
                    }}
                    onMouseEnter={e => {
                      if (!isSelected) {
                        e.currentTarget.style.background = `${labelColor}05`;
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    <Box
                      style={{
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        background: labelColor,
                        flexShrink: 0,
                        border: `1px solid ${labelColor}30`,
                        boxShadow: `0 0 0 1px ${theme.colors.background.card}`,
                      }}
                    />

                    <Text
                      size="2"
                      style={{
                        color: theme.colors.text.primary,
                        flex: 1,
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      {label}
                    </Text>

                    {isSelected && (
                      <Check
                        size={14}
                        style={{
                          color: labelColor,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>

            {labels.length > 5 && (
              <Box
                style={{
                  padding: theme.spacing.semantic.component.sm,
                  borderTop: `1px solid ${theme.colors.border.secondary}`,
                  background: `${theme.colors.background.secondary}50`,
                }}
              >
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.tertiary,
                    textAlign: "center",
                    fontStyle: "italic",
                  }}
                >
                  {labels.length} labels available
                </Text>
              </Box>
            )}
          </Box>
        )}
      </Box>
    );
  }

  // 기본 확장 모드 (compact가 false일 때)
  return (
    <Flex align="center" gap="2">
      <Text
        size="2"
        style={{
          color: theme.colors.text.secondary,
          fontWeight: 600,
          minWidth: "fit-content",
        }}
      >
        Select:
      </Text>

      <Flex gap="1" wrap="wrap">
        {visibleLabels.map(label => {
          const labelColor = getLabelColor(label);
          const textColor = getContrastTextColor(labelColor);
          const isSelected = selectedLabel === label;

          return (
            <Button
              key={label}
              onClick={() => onSelectLabel(label)}
              style={{
                background: isSelected ? labelColor : "transparent",
                color: isSelected ? textColor : labelColor,
                border: `1px solid ${labelColor}`,
                borderRadius: theme.borders.radius.md,
                padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.semantic.component.xs,
                position: "relative",
                boxShadow: isSelected ? `0 0 0 1px ${labelColor}40` : "none",
                transform: isSelected ? "scale(1.01)" : "scale(1)",
              }}
            >
              {/* Color indicator dot */}
              <Box
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: isSelected ? textColor : labelColor,
                  opacity: isSelected ? 0.8 : 1,
                }}
              />

              <Text
                size="2"
                style={{
                  color: "inherit",
                  fontWeight: "inherit",
                  maxWidth: "80px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={label}
              >
                {label}
              </Text>

              {isSelected && (
                <Check
                  size={12}
                  style={{
                    color: textColor,
                    opacity: 0.9,
                  }}
                />
              )}
            </Button>
          );
        })}

        {hiddenLabels.length > 0 && (
          <Box style={{ position: "relative" }}>
            <Button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                background: "transparent",
                color: theme.colors.text.secondary,
                border: `1px dashed ${theme.colors.border.secondary}`,
                borderRadius: theme.borders.radius.md,
                padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.semantic.component.xs,
                transition: "all 0.2s ease",
              }}
            >
              <Text size="2" style={{ color: "inherit" }}>
                +{hiddenLabels.length}
              </Text>
              <CaretDown
                size={10}
                style={{
                  color: "inherit",
                  transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                }}
              />
            </Button>

            {showDropdown && (
              <Box
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  zIndex: 1000,
                  background: theme.colors.background.card,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.md,
                  boxShadow: theme.shadows.semantic.card.medium,
                  padding: theme.spacing.semantic.component.sm,
                  minWidth: "160px",
                  maxHeight: "240px",
                  overflowY: "auto",
                  backdropFilter: "blur(8px)",
                }}
              >
                {hiddenLabels.map(label => {
                  const labelColor = getLabelColor(label);
                  const isSelected = selectedLabel === label;

                  return (
                    <Box
                      key={label}
                      onClick={() => {
                        onSelectLabel(label);
                        setShowDropdown(false);
                      }}
                      style={{
                        padding: theme.spacing.semantic.component.sm,
                        borderRadius: theme.borders.radius.sm,
                        cursor: "pointer",
                        background: isSelected ? `${labelColor}10` : "transparent",
                        border: isSelected ? `1px solid ${labelColor}30` : "1px solid transparent",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: theme.spacing.semantic.component.sm,
                        marginBottom: theme.spacing.semantic.component.xs,
                      }}
                    >
                      <Box
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: labelColor,
                          flexShrink: 0,
                        }}
                      />

                      <Text
                        size="2"
                        style={{
                          color: theme.colors.text.primary,
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={label}
                      >
                        {label}
                      </Text>

                      {isSelected && (
                        <Check
                          size={12}
                          style={{
                            color: labelColor,
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}
      </Flex>
    </Flex>
  );
}
