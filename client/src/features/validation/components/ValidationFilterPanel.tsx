import { useState } from "react";
import { Box, Flex, Text, Button, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Funnel, Star, Clock, User, Sliders, SortAscending, SortDescending } from "phosphor-react";
import { PendingAnnotation } from "../types/validation";
import { ChallengePhase } from "@/features/challenge";

interface ValidationFilterPanelProps {
  currentPhase: ChallengePhase;
  pendingAnnotations: PendingAnnotation[];
  onFilterChange: (filters: FilterOptions) => void;
}

interface FilterOptions {
  qualityRange: [number, number];
  participantFilter: string[];
  timeRange: "all" | "today" | "week" | "month";
  sortBy: "quality" | "timestamp" | "participant";
  sortOrder: "asc" | "desc";
}

export function ValidationFilterPanel({
  currentPhase,
  pendingAnnotations,
  onFilterChange,
}: ValidationFilterPanelProps) {
  const { theme } = useTheme();
  const [filters, setFilters] = useState<FilterOptions>({
    qualityRange: [0, 1],
    participantFilter: [],
    timeRange: "all",
    sortBy: "quality",
    sortOrder: "desc",
  });

  // Get unique participants
  const uniqueParticipants = Array.from(new Set(pendingAnnotations.map(a => a.participantId)));

  // Quality distribution
  const qualityDistribution = {
    excellent: pendingAnnotations.filter(a => a.qualityScore >= 0.9).length,
    good: pendingAnnotations.filter(a => a.qualityScore >= 0.7 && a.qualityScore < 0.9).length,
    fair: pendingAnnotations.filter(a => a.qualityScore >= 0.5 && a.qualityScore < 0.7).length,
    poor: pendingAnnotations.filter(a => a.qualityScore < 0.5).length,
  };

  const handleQualityRangeChange = (min: number, max: number) => {
    const newFilters = { ...filters, qualityRange: [min, max] as [number, number] };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleParticipantToggle = (participantId: string) => {
    const newParticipants = filters.participantFilter.includes(participantId)
      ? filters.participantFilter.filter(p => p !== participantId)
      : [...filters.participantFilter, participantId];

    const newFilters = { ...filters, participantFilter: newParticipants };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTimeRangeChange = (timeRange: FilterOptions["timeRange"]) => {
    const newFilters = { ...filters, timeRange };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSortChange = (
    sortBy: FilterOptions["sortBy"],
    sortOrder?: FilterOptions["sortOrder"]
  ) => {
    const newFilters = {
      ...filters,
      sortBy,
      sortOrder:
        sortOrder ||
        (filters.sortBy === sortBy ? (filters.sortOrder === "asc" ? "desc" : "asc") : "desc"),
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const resetFilters: FilterOptions = {
      qualityRange: [0, 1],
      participantFilter: [],
      timeRange: "all",
      sortBy: "quality",
      sortOrder: "desc",
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <Box
      style={{
        marginTop: theme.spacing.semantic.component.sm,
        padding: theme.spacing.semantic.component.md,
        background: theme.colors.background.secondary,
        borderRadius: theme.borders.radius.md,
        border: `1px solid ${theme.colors.border.primary}`,
      }}
    >
      <Flex direction="column" gap="3">
        {/* Header */}
        <Flex align="center" justify="between">
          <Flex align="center" gap="2">
            <Sliders size={14} style={{ color: theme.colors.interactive.primary }} />
            <Text
              size="2"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
              }}
            >
              Advanced Filters
            </Text>
          </Flex>

          <Button
            onClick={resetFilters}
            style={{
              background: "transparent",
              color: theme.colors.text.secondary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.sm,
              padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
              fontSize: "10px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reset
          </Button>
        </Flex>

        {/* Quality Score Filter */}
        <Box>
          <Text
            size="1"
            style={{
              color: theme.colors.text.secondary,
              fontWeight: 600,
              marginBottom: theme.spacing.semantic.component.xs,
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.semantic.component.xs,
            }}
          >
            <Star size={10} />
            Quality Score Range
          </Text>

          <Flex direction="column" gap="2">
            {/* Quality distribution */}
            <Flex align="center" gap="2" style={{ marginBottom: "8px" }}>
              <Badge
                style={{
                  background: `${theme.colors.status.success}15`,
                  color: theme.colors.status.success,
                  fontSize: "9px",
                  fontWeight: 600,
                  padding: "2px 4px",
                  borderRadius: theme.borders.radius.sm,
                }}
              >
                Excellent: {qualityDistribution.excellent}
              </Badge>
              <Badge
                style={{
                  background: `${theme.colors.interactive.primary}15`,
                  color: theme.colors.interactive.primary,
                  fontSize: "9px",
                  fontWeight: 600,
                  padding: "2px 4px",
                  borderRadius: theme.borders.radius.sm,
                }}
              >
                Good: {qualityDistribution.good}
              </Badge>
              <Badge
                style={{
                  background: `${theme.colors.status.warning}15`,
                  color: theme.colors.status.warning,
                  fontSize: "9px",
                  fontWeight: 600,
                  padding: "2px 4px",
                  borderRadius: theme.borders.radius.sm,
                }}
              >
                Fair: {qualityDistribution.fair}
              </Badge>
              <Badge
                style={{
                  background: `${theme.colors.status.error}15`,
                  color: theme.colors.status.error,
                  fontSize: "9px",
                  fontWeight: 600,
                  padding: "2px 4px",
                  borderRadius: theme.borders.radius.sm,
                }}
              >
                Poor: {qualityDistribution.poor}
              </Badge>
            </Flex>

            {/* Quality preset buttons */}
            <Flex gap="1">
              <Button
                onClick={() => handleQualityRangeChange(0.9, 1)}
                style={{
                  background:
                    filters.qualityRange[0] >= 0.9 ? theme.colors.status.success : "transparent",
                  color:
                    filters.qualityRange[0] >= 0.9
                      ? theme.colors.text.inverse
                      : theme.colors.status.success,
                  border: `1px solid ${theme.colors.status.success}`,
                  borderRadius: theme.borders.radius.sm,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  fontSize: "9px",
                  fontWeight: 600,
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                Excellent
              </Button>
              <Button
                onClick={() => handleQualityRangeChange(0.7, 1)}
                style={{
                  background:
                    filters.qualityRange[0] >= 0.7
                      ? theme.colors.interactive.primary
                      : "transparent",
                  color:
                    filters.qualityRange[0] >= 0.7
                      ? theme.colors.text.inverse
                      : theme.colors.interactive.primary,
                  border: `1px solid ${theme.colors.interactive.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  fontSize: "9px",
                  fontWeight: 600,
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                Good+
              </Button>
              <Button
                onClick={() => handleQualityRangeChange(0, 0.6)}
                style={{
                  background:
                    filters.qualityRange[1] <= 0.6 ? theme.colors.status.warning : "transparent",
                  color:
                    filters.qualityRange[1] <= 0.6
                      ? theme.colors.text.inverse
                      : theme.colors.status.warning,
                  border: `1px solid ${theme.colors.status.warning}`,
                  borderRadius: theme.borders.radius.sm,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  fontSize: "9px",
                  fontWeight: 600,
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                Need Review
              </Button>
            </Flex>
          </Flex>
        </Box>

        {/* Participant Filter */}
        <Box>
          <Text
            size="1"
            style={{
              color: theme.colors.text.secondary,
              fontWeight: 600,
              marginBottom: theme.spacing.semantic.component.xs,
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.semantic.component.xs,
            }}
          >
            <User size={10} />
            Participants ({uniqueParticipants.length})
          </Text>

          <Flex direction="column" gap="1" style={{ maxHeight: "120px", overflow: "auto" }}>
            {uniqueParticipants.map(participantId => {
              const isSelected = filters.participantFilter.includes(participantId);
              const count = pendingAnnotations.filter(
                a => a.participantId === participantId
              ).length;

              return (
                <Button
                  key={participantId}
                  onClick={() => handleParticipantToggle(participantId)}
                  style={{
                    background: isSelected ? theme.colors.interactive.primary : "transparent",
                    color: isSelected ? theme.colors.text.inverse : theme.colors.text.primary,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borders.radius.sm,
                    padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                    fontSize: "10px",
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    textAlign: "left",
                  }}
                >
                  <Text
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}
                  >
                    {participantId}
                  </Text>
                  <Badge
                    style={{
                      background: isSelected
                        ? theme.colors.background.card
                        : `${theme.colors.text.tertiary}15`,
                      color: isSelected ? theme.colors.text.secondary : theme.colors.text.tertiary,
                      fontSize: "8px",
                      fontWeight: 600,
                      padding: "2px 4px",
                      borderRadius: theme.borders.radius.full,
                      marginLeft: "4px",
                    }}
                  >
                    {count}
                  </Badge>
                </Button>
              );
            })}
          </Flex>
        </Box>

        {/* Time Range Filter */}
        <Box>
          <Text
            size="1"
            style={{
              color: theme.colors.text.secondary,
              fontWeight: 600,
              marginBottom: theme.spacing.semantic.component.xs,
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.semantic.component.xs,
            }}
          >
            <Clock size={10} />
            Time Range
          </Text>

          <Flex gap="1">
            {(["all", "today", "week", "month"] as const).map(timeRange => (
              <Button
                key={timeRange}
                onClick={() => handleTimeRangeChange(timeRange)}
                style={{
                  background:
                    filters.timeRange === timeRange
                      ? theme.colors.interactive.accent
                      : "transparent",
                  color:
                    filters.timeRange === timeRange
                      ? theme.colors.text.inverse
                      : theme.colors.text.secondary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  fontSize: "9px",
                  fontWeight: 600,
                  cursor: "pointer",
                  flex: 1,
                  textTransform: "capitalize",
                }}
              >
                {timeRange === "all" ? "All Time" : timeRange}
              </Button>
            ))}
          </Flex>
        </Box>

        {/* Sort Options */}
        <Box>
          <Text
            size="1"
            style={{
              color: theme.colors.text.secondary,
              fontWeight: 600,
              marginBottom: theme.spacing.semantic.component.xs,
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.semantic.component.xs,
            }}
          >
            <Funnel size={10} />
            Sort By
          </Text>

          <Flex gap="1">
            {(["quality", "timestamp", "participant"] as const).map(sortBy => (
              <Button
                key={sortBy}
                onClick={() => handleSortChange(sortBy)}
                style={{
                  background:
                    filters.sortBy === sortBy ? theme.colors.background.primary : "transparent",
                  color:
                    filters.sortBy === sortBy
                      ? theme.colors.text.primary
                      : theme.colors.text.secondary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  fontSize: "9px",
                  fontWeight: 600,
                  cursor: "pointer",
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "2px",
                }}
              >
                {sortBy === "quality" ? "Quality" : sortBy === "timestamp" ? "Time" : "Participant"}

                {filters.sortBy === sortBy && (
                  <Box style={{ marginLeft: "2px" }}>
                    {filters.sortOrder === "desc" ? (
                      <SortDescending size={8} />
                    ) : (
                      <SortAscending size={8} />
                    )}
                  </Box>
                )}
              </Button>
            ))}
          </Flex>
        </Box>

        {/* Summary */}
        <Box
          style={{
            background: theme.colors.background.primary,
            border: `1px solid ${theme.colors.interactive.primary}40`,
            borderRadius: theme.borders.radius.sm,
            padding: theme.spacing.semantic.component.sm,
          }}
        >
          <Text
            size="1"
            style={{
              color: theme.colors.text.secondary,
              fontWeight: 600,
              marginBottom: "4px",
            }}
          >
            Filter Summary:
          </Text>

          <Text
            size="1"
            style={{
              color: theme.colors.text.primary,
              fontSize: "9px",
            }}
          >
            Showing {pendingAnnotations.length} annotations for {currentPhase} phase
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}
