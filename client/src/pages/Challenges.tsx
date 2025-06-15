import {
  Box,
  Flex,
  Text,
  Button,
  Grid,
  Spinner,
  Badge,
} from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { SidebarLayout } from "@/widgets/layout/AppLayout";
import {
  Trophy,
  UploadSimple,
  MagnifyingGlass,
  Circle,
  Sparkle,
  Lightning,
  ChartLineUp,
  Clock,
  Users,
  CurrencyDollar,
  Star,
  Lightning as Bolt,
  Fire,
  Target,
  CheckCircle,
  PlayCircle,
  Lock,
  TwitterLogo,
} from "phosphor-react";
import { useChallenges, Challenge, ChallengeStatus } from "@/features/challenge";
import {
  useMissions,
  CompactMissionStatus,
  CertificateModal,
  MissionCard,
  InlineVideoGuide,
  MissionSuccessAnimation,
} from "@/features/challenge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCurrentWallet } from "@mysten/dapp-kit";

// Import certificate hook
import { useCertificateData } from "@/features/challenge/hooks/useCertificateData";

// Challenge Status Badge Component
function ChallengeStatusBadge({ status }: { status: ChallengeStatus }) {
  const { theme } = useTheme();

  const statusConfig = {
    active: {
      color: theme.colors.status.success,
      bg: `${theme.colors.status.success}15`,
      text: "Active",
    },
    draft: {
      color: theme.colors.text.tertiary,
      bg: `${theme.colors.text.tertiary}15`,
      text: "Draft",
    },
    completed: {
      color: theme.colors.interactive.primary,
      bg: `${theme.colors.interactive.primary}15`,
      text: "Completed",
    },
    cancelled: {
      color: theme.colors.status.error,
      bg: `${theme.colors.status.error}15`,
      text: "Cancelled",
    },
    validating: {
      color: theme.colors.status.warning,
      bg: `${theme.colors.status.warning}15`,
      text: "Validating",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge
      style={{
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.color}30`,
        padding: "4px 8px",
        borderRadius: theme.borders.radius.full,
        fontSize: "11px",
        fontWeight: 600,
      }}
    >
      {config.text}
    </Badge>
  );
}

// Challenge Difficulty Badge
function DifficultyBadge({ difficulty }: { difficulty: Challenge["difficulty"] }) {
  const { theme } = useTheme();

  const difficultyConfig = {
    beginner: {
      color: theme.colors.status.success,
      icon: <Circle size={6} weight="fill" />,
      text: "Beginner",
    },
    intermediate: {
      color: theme.colors.status.warning,
      icon: <Star size={8} />,
      text: "Intermediate",
    },
    advanced: {
      color: theme.colors.status.error,
      icon: <Fire size={8} />,
      text: "Advanced",
    },
  };

  const config = difficultyConfig[difficulty];

  return (
    <Flex align="center" gap="1" style={{ color: config.color }}>
      {config.icon}
      <Text size="1" style={{ fontWeight: 600 }}>
        {config.text}
      </Text>
    </Flex>
  );
}

// Challenge Card Component
function ChallengeCard({ challenge, index }: { challenge: Challenge; index: number }) {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const daysLeft = Math.max(
    0,
    Math.ceil((challenge.timeline.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const progressPercentage =
    challenge.stats.totalParticipants > 0
      ? Math.min(
          100,
          (challenge.stats.completedAnnotations / (challenge.stats.totalParticipants * 100)) * 100
        )
      : 0;

  return (
    <Box
      className={`challenge-card challenge-card-${index}`}
      onClick={() => navigate(`/challenges/${challenge.id}/annotate`)}
      style={{
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borders.radius.lg,
        padding: theme.spacing.semantic.component.lg,
        cursor: "pointer",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = theme.shadows.semantic.card.high;
        e.currentTarget.style.borderColor = theme.colors.interactive.primary;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = theme.shadows.semantic.card.low;
        e.currentTarget.style.borderColor = theme.colors.border.primary;
      }}
    >
      {/* Header */}
      <Flex
        justify="between"
        align="start"
        style={{ marginBottom: theme.spacing.semantic.component.md }}
      >
        <Box style={{ flex: 1 }}>
          <Text
            as="div"
            size="3"
            style={{
              fontWeight: 700,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.semantic.component.xs,
              lineHeight: 1.3,
            }}
          >
            {challenge.title}
          </Text>
          <Text
            as="div"
            size="2"
            style={{
              color: theme.colors.text.secondary,
              lineHeight: 1.4,
              marginBottom: theme.spacing.semantic.component.sm,
            }}
          >
            {challenge.description.length > 120
              ? `${challenge.description.substring(0, 120)}...`
              : challenge.description}
          </Text>
        </Box>
        <ChallengeStatusBadge status={challenge.status} />
      </Flex>

      {/* Dataset Info */}
      <Flex
        align="center"
        gap="2"
        style={{
          marginBottom: theme.spacing.semantic.component.md,
          padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
          background: theme.colors.background.secondary,
          borderRadius: theme.borders.radius.md,
        }}
      >
        <Box
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: theme.colors.interactive.primary,
          }}
        />
        <Text size="2" style={{ color: theme.colors.text.secondary, fontWeight: 500 }}>
          Dataset: {challenge.datasetName}
        </Text>
      </Flex>

      {/* Stats Grid */}
      <Grid columns="2" gap="3" style={{ marginBottom: theme.spacing.semantic.component.lg }}>
        {/* Bounty */}
        <Flex direction="column" gap="1">
          <Flex align="center" gap="1">
            <CurrencyDollar size={12} style={{ color: theme.colors.status.success }} />
            <Text size="1" style={{ color: theme.colors.text.tertiary, fontWeight: 600 }}>
              BOUNTY
            </Text>
          </Flex>
          <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 700 }}>
            {challenge.bounty.totalAmount.toLocaleString()} {challenge.bounty.currency}
          </Text>
        </Flex>

        {/* Participants */}
        <Flex direction="column" gap="1">
          <Flex align="center" gap="1">
            <Users size={12} style={{ color: theme.colors.interactive.accent }} />
            <Text size="1" style={{ color: theme.colors.text.tertiary, fontWeight: 600 }}>
              PARTICIPANTS
            </Text>
          </Flex>
          <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 700 }}>
            {challenge.stats.totalParticipants}
            {challenge.requirements.maxParticipants && (
              <Text size="1" style={{ color: theme.colors.text.secondary }}>
                /{challenge.requirements.maxParticipants}
              </Text>
            )}
          </Text>
        </Flex>

        {/* Time Left */}
        <Flex direction="column" gap="1">
          <Flex align="center" gap="1">
            <Clock size={12} style={{ color: theme.colors.status.warning }} />
            <Text size="1" style={{ color: theme.colors.text.tertiary, fontWeight: 600 }}>
              TIME LEFT
            </Text>
          </Flex>
          <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 700 }}>
            {daysLeft > 0 ? `${daysLeft} days` : "Ended"}
          </Text>
        </Flex>

        {/* Progress */}
        <Flex direction="column" gap="1">
          <Flex align="center" gap="1">
            <Bolt size={12} style={{ color: theme.colors.interactive.primary }} />
            <Text size="1" style={{ color: theme.colors.text.tertiary, fontWeight: 600 }}>
              PROGRESS
            </Text>
          </Flex>
          <Flex align="center" gap="2">
            <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 700 }}>
              {Math.round(progressPercentage)}%
            </Text>
            <Box
              style={{
                flex: 1,
                height: "4px",
                background: theme.colors.background.secondary,
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <Box
                style={{
                  height: "100%",
                  width: `${progressPercentage}%`,
                  background: `linear-gradient(90deg, ${theme.colors.interactive.primary}, ${theme.colors.status.success})`,
                  transition: "width 0.3s ease",
                }}
              />
            </Box>
          </Flex>
        </Flex>
      </Grid>

      {/* Tags & Difficulty */}
      <Flex
        justify="between"
        align="center"
        style={{ marginBottom: theme.spacing.semantic.component.md }}
      >
        <Flex gap="1" style={{ flexWrap: "wrap" }}>
          {challenge.tags.slice(0, 3).map((tag, idx) => (
            <Badge
              key={idx}
              style={{
                background: `${theme.colors.interactive.primary}10`,
                color: theme.colors.interactive.primary,
                border: `1px solid ${theme.colors.interactive.primary}20`,
                padding: "2px 6px",
                borderRadius: theme.borders.radius.sm,
                fontSize: "10px",
                fontWeight: 500,
              }}
            >
              {tag}
            </Badge>
          ))}
          {challenge.tags.length > 3 && (
            <Badge
              style={{
                background: theme.colors.background.secondary,
                color: theme.colors.text.tertiary,
                padding: "2px 6px",
                borderRadius: theme.borders.radius.sm,
                fontSize: "10px",
              }}
            >
              +{challenge.tags.length - 3}
            </Badge>
          )}
        </Flex>
        <DifficultyBadge difficulty={challenge.difficulty} />
      </Flex>

      {/* Phase Indicator */}
      <Box
        style={{
          padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
          background: `${theme.colors.interactive.accent}10`,
          border: `1px solid ${theme.colors.interactive.accent}30`,
          borderRadius: theme.borders.radius.md,
          textAlign: "center",
        }}
      >
        <Text
          size="2"
          style={{
            color: theme.colors.interactive.accent,
            fontWeight: 600,
            textTransform: "capitalize",
          }}
        >
          Current: {challenge.currentPhase} Phase
        </Text>
      </Box>
    </Box>
  );
}

// Filter Component
function ChallengeFilters({
  filters,
  onUpdateFilter,
  availableTags,
  onToggleTag,
  onClearTags,
}: any) {
  const { theme } = useTheme();

  return (
    <Flex direction="column" gap="4">
      {/* Search */}
      <Box>
        <Text
          size="2"
          style={{
            fontWeight: 600,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.semantic.component.sm,
          }}
        >
          Search
        </Text>
        <input
          type="text"
          placeholder="Search challenges..."
          value={filters.searchQuery}
          onChange={e => onUpdateFilter("searchQuery", e.target.value)}
          style={{
            width: "100%",
            padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
            borderRadius: theme.borders.radius.md,
            border: `1px solid ${theme.colors.border.primary}`,
            background: theme.colors.background.primary,
            color: theme.colors.text.primary,
            fontSize: "13px",
            outline: "none",
          }}
        />
      </Box>

      {/* Status Filter */}
      <Box>
        <Text
          size="2"
          style={{
            fontWeight: 600,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.semantic.component.sm,
          }}
        >
          Status
        </Text>
        <select
          value={filters.status}
          onChange={e => onUpdateFilter("status", e.target.value)}
          style={{
            width: "100%",
            padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
            borderRadius: theme.borders.radius.md,
            border: `1px solid ${theme.colors.border.primary}`,
            background: theme.colors.background.primary,
            color: theme.colors.text.primary,
            fontSize: "13px",
            outline: "none",
          }}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="completed">Completed</option>
          <option value="validating">Validating</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </Box>

      {/* Difficulty Filter */}
      <Box>
        <Text
          size="2"
          style={{
            fontWeight: 600,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.semantic.component.sm,
          }}
        >
          Difficulty
        </Text>
        <select
          value={filters.difficulty}
          onChange={e => onUpdateFilter("difficulty", e.target.value)}
          style={{
            width: "100%",
            padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
            borderRadius: theme.borders.radius.md,
            border: `1px solid ${theme.colors.border.primary}`,
            background: theme.colors.background.primary,
            color: theme.colors.text.primary,
            fontSize: "13px",
            outline: "none",
          }}
        >
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </Box>

      {/* Tags */}
      {availableTags.length > 0 && (
        <Box>
          <Flex
            justify="between"
            align="center"
            style={{ marginBottom: theme.spacing.semantic.component.sm }}
          >
            <Text size="2" style={{ fontWeight: 600, color: theme.colors.text.primary }}>
              Tags
            </Text>
            {filters.tags.length > 0 && (
              <Button
                onClick={onClearTags}
                style={{
                  background: "transparent",
                  color: theme.colors.interactive.primary,
                  border: "none",
                  fontSize: "11px",
                  cursor: "pointer",
                  padding: "0",
                }}
              >
                Clear
              </Button>
            )}
          </Flex>
          <Flex direction="column" gap="1">
            {availableTags.slice(0, 10).map((tag: string) => (
              <Flex
                key={tag}
                align="center"
                gap="2"
                style={{
                  padding: `${theme.spacing.semantic.component.xs} 0`,
                  cursor: "pointer",
                }}
                onClick={() => onToggleTag(tag)}
              >
                <input
                  type="checkbox"
                  checked={filters.tags.includes(tag)}
                  onChange={() => onToggleTag(tag)}
                  style={{ cursor: "pointer" }}
                />
                <Text
                  size="2"
                  style={{
                    color: filters.tags.includes(tag)
                      ? theme.colors.text.primary
                      : theme.colors.text.secondary,
                    fontWeight: filters.tags.includes(tag) ? 600 : 400,
                  }}
                >
                  {tag}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Box>
      )}
    </Flex>
  );
}

export function Challenges() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { isConnected, currentWallet } = useCurrentWallet();

  const {
    filteredChallenges,
    loading,
    error,
    isLoaded,
    filters,
    getAllUniqueTags,
    toggleTag,
    clearTags,
    updateFilter,
    refetch,
  } = useChallenges();

  const {
    userProgress,
    loading: missionLoading,
    error: missionError,
    currentAnnotator,
    updateMission,
    getCurrentMission,
    getNextMission,
    canAccessMission,
    getMissionStatus,
    generateCertificate,
    syncProgressWithWallet,
    isAllCompleted,
  } = useMissions();

  // Certificate data hook for server-based certificate system
  const certificateData = useCertificateData();

  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMissionData, setSuccessMissionData] = useState<{
    title: string;
    completedCount: number;
    requiredCount: number;
  } | null>(null);
  const [walletSyncStatus, setWalletSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">(
    "idle"
  );

  // Show success animation when a mission is completed
  useEffect(() => {
    // This would be triggered by mission completion events
    // For now, we'll hook it to certificate completion
    if (isAllCompleted && userProgress && !userProgress.certificate) {
      const completedMissions = userProgress.missions.filter(m => m.status === "completed");
      const lastCompletedMission = completedMissions[completedMissions.length - 1];
      if (lastCompletedMission) {
        setSuccessMissionData({
          title: lastCompletedMission.name,
          completedCount: lastCompletedMission.total_items,
          requiredCount: lastCompletedMission.total_items,
        });
        setShowSuccessAnimation(true);
      }
    }
  }, [isAllCompleted, userProgress]);

  // Auto-generate certificate when all missions are completed
  useEffect(() => {
    if (isAllCompleted && userProgress && !userProgress.certificate) {
      // Delay certificate modal until after success animation
      const timer = setTimeout(() => {
        generateCertificate();
        setShowCertificateModal(true);
      }, 4500); // Show after success animation completes

      return () => clearTimeout(timer);
    }
  }, [isAllCompleted, userProgress?.certificate, generateCertificate]);

  // Sync progress with wallet when connected
  useEffect(() => {
    const syncWalletProgress = async () => {
      if (!isConnected || !currentWallet?.accounts[0]?.address || !userProgress) {
        setWalletSyncStatus("idle");
        return;
      }

      const walletAddress = currentWallet.accounts[0].address;

      // Check if we already synced this wallet
      if (walletSyncStatus === "synced" && userProgress.userId === walletAddress) {
        return;
      }

      setWalletSyncStatus("syncing");
      console.log(`🔗 Wallet connected: ${walletAddress}`);

      try {
        await syncProgressWithWallet(walletAddress);
        setWalletSyncStatus("synced");
      } catch (err) {
        console.error("Failed to sync wallet progress:", err);
        setWalletSyncStatus("error");
      }
    };

    syncWalletProgress();
  }, [
    isConnected,
    currentWallet?.accounts[0]?.address,
    userProgress,
    syncProgressWithWallet,
    walletSyncStatus,
  ]);

  // Get mission-related challenges
  const missionChallenges = filteredChallenges.filter(challenge =>
    userProgress?.missions.some(mission => mission.challengeId === challenge.id)
  );

  // Get current mission and its challenge
  const currentMission = getCurrentMission();
  const currentChallenge = currentMission
    ? filteredChallenges.find(c => c.id === currentMission.challengeId)
    : null;

  const handleMissionClick = (missionId: string) => {
    if (!userProgress) return;

    const mission = userProgress.missions.find(m => m.id === missionId);
    if (!mission) return;

    if (getMissionStatus(missionId) === "locked") {
      // Show locked message
      alert("Complete the previous step first!");
      return;
    }

    // Since we have inline videos, we can directly navigate to the challenge
    // or perform the mission action without opening a modal
    if (getMissionStatus(missionId) === "available") {
      // Navigate to the challenge page or start the mission directly
      const challenge = filteredChallenges.find(c => c.id === mission.challengeId);
      if (challenge) {
        navigate(`/challenges/${challenge.id}/annotate`);
      }
    }
  };

  if (loading || missionLoading) {
    return (
      <Box
        style={{
          background: theme.colors.background.primary,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Flex
          direction="column"
          align="center"
          gap="4"
          style={{
            background: theme.colors.background.card,
            padding: theme.spacing.semantic.layout.lg,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${theme.colors.border.primary}`,
            boxShadow: theme.shadows.semantic.card.low,
            maxWidth: "400px",
          }}
        >
          <Box
            style={{
              position: "relative",
              width: "48px",
              height: "48px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${theme.colors.interactive.primary}20, ${theme.colors.interactive.accent}20)`,
                animation: "pulse 2s infinite",
              }}
            />
            <Spinner />
          </Box>
          <Box style={{ textAlign: "center" }}>
            <Text
              size="4"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              Loading Challenges
            </Text>
          </Box>
        </Flex>
      </Box>
    );
  }

  if (error || missionError) {
    return (
      <Box
        style={{
          background: theme.colors.background.primary,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Flex
          direction="column"
          align="center"
          gap="4"
          style={{
            background: theme.colors.background.card,
            padding: theme.spacing.semantic.layout.lg,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${theme.colors.status.error}40`,
            boxShadow: theme.shadows.semantic.card.medium,
            maxWidth: "400px",
          }}
        >
          <Box
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: `${theme.colors.status.error}15`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Trophy size={24} style={{ color: theme.colors.status.error }} />
          </Box>
          <Box style={{ textAlign: "center" }}>
            <Text
              size="4"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              Challenge Registry Error
            </Text>
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: 1.5,
                marginBottom: theme.spacing.semantic.component.md,
              }}
            >
              {error || missionError}
            </Text>
            <Button
              onClick={refetch}
              style={{
                background: theme.colors.interactive.primary,
                color: theme.colors.text.inverse,
                border: "none",
                borderRadius: theme.borders.radius.sm,
                padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Retry
            </Button>
          </Box>
        </Flex>
      </Box>
    );
  }

  // Top Bar Component
  const topBar = (
    <Flex justify="between" align="center">
      <Flex align="center" gap="4">
        <Flex align="center" gap="2">
          <ChartLineUp size={18} style={{ color: theme.colors.interactive.primary }} />
          <Text
            size="3"
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
            }}
          >
            {filteredChallenges.length}{" "}
            {filteredChallenges.length === 1 ? "Challenge" : "Challenges"}
          </Text>
        </Flex>

        {/* Active Filters */}
        <Flex align="center" gap="2">
          {filters.status !== "all" && (
            <Badge
              style={{
                background: `${theme.colors.interactive.primary}15`,
                color: theme.colors.interactive.primary,
                border: `1px solid ${theme.colors.interactive.primary}30`,
                padding: "2px 8px",
                borderRadius: theme.borders.radius.full,
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              Status: {filters.status}
            </Badge>
          )}

          {filters.searchQuery && (
            <Badge
              style={{
                background: `${theme.colors.status.info}15`,
                color: theme.colors.status.info,
                border: `1px solid ${theme.colors.status.info}30`,
                padding: "2px 8px",
                borderRadius: theme.borders.radius.full,
                fontSize: "11px",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <MagnifyingGlass size={10} />"
              {filters.searchQuery.length > 20
                ? filters.searchQuery.substring(0, 20) + "..."
                : filters.searchQuery}
              "
            </Badge>
          )}

          {filters.tags.length > 0 && (
            <Badge
              style={{
                background: `${theme.colors.status.warning}15`,
                color: theme.colors.status.warning,
                border: `1px solid ${theme.colors.status.warning}30`,
                padding: "2px 8px",
                borderRadius: theme.borders.radius.full,
                fontSize: "11px",
                fontWeight: 500,
              }}
            >
              {filters.tags.length} {filters.tags.length === 1 ? "tag" : "tags"}
            </Badge>
          )}
        </Flex>
      </Flex>

      {/* TODO(Jerry): comment out sort for mission period */}
      {/* Sort */}
      {/* <Flex align="center" gap="2">
        <Text size="1" style={{ color: theme.colors.text.tertiary }}>
          Sort:
        </Text>
        <select
          value={filters.sortBy}
          onChange={e => updateFilter("sortBy", e.target.value as any)}
          style={{
            background: theme.colors.background.primary,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.sm,
            padding: `4px 8px`,
            fontSize: "12px",
            color: theme.colors.text.primary,
            outline: "none",
          }}
        >
          <option value="createdAt">Created Date</option>
          <option value="bounty">Bounty Amount</option>
          <option value="participants">Participants</option>
          <option value="deadline">Deadline</option>
        </select>
      </Flex> */}
    </Flex>
  );

  // Sidebar configuration
  const sidebarConfig = {
    section: {
      icon: <Trophy size={16} style={{ color: theme.colors.text.inverse }} />,
      title: "Challenge Hub",
      // actionButton: {
      //   text: "Create Challenge",
      //   icon: <UploadSimple size={14} weight="bold" />,
      //   href: "/challenges/create",
      // },
    },
    stats: [
      {
        icon: <Circle size={6} weight="fill" style={{ color: theme.colors.status.success }} />,
        text: `${filteredChallenges.filter(c => c.status === "active").length} Active`,
      },
      {
        icon: <Lightning size={10} style={{ color: theme.colors.interactive.accent }} />,
        text: "Blockchain Verified",
      },
      {
        icon: <Sparkle size={10} style={{ color: theme.colors.status.warning }} />,
        text: "Decentralized Rewards",
      },
    ],
    // TODO(Jerry): comment out filters for mission period
    // filters: (
    //   <ChallengeFilters
    //     filters={filters}
    //     availableTags={getAllUniqueTags()}
    //     onUpdateFilter={updateFilter}
    //     onToggleTag={toggleTag}
    //     onClearTags={clearTags}
    //   />
    // ),
    filters: <></>,
  };

  return (
    <SidebarLayout sidebar={sidebarConfig} topBar={topBar}>
      {/* Certificate Achievement Banner - Show when completed */}
      {certificateData.userProgress?.certificate &&
        certificateData.userProgress.missionScores &&
        certificateData.userProgress.missions &&
        certificateData.userProgress.missionScores.length > 0 &&
        certificateData.userProgress.missions.length > 0 &&
        certificateData.userProgress.overallStatus === "completed" && (
          <Box style={{ marginBottom: theme.spacing.semantic.layout.lg }}>
            <Box
              style={{
                background: `linear-gradient(135deg, ${theme.colors.status.success}10, #64ffda05)`,
                border: `2px solid ${theme.colors.status.success}30`,
                borderRadius: theme.borders.radius.lg,
                padding: theme.spacing.semantic.layout.lg,
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Animated background */}
              <Box
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `linear-gradient(90deg, transparent, ${theme.colors.status.success}05, transparent)`,
                  animation: "certificateShimmer 4s infinite",
                }}
              />

              <Box style={{ position: "relative", zIndex: 1 }}>
                <Flex
                  align="center"
                  justify="center"
                  gap="3"
                  style={{ marginBottom: theme.spacing.semantic.component.md }}
                >
                  <Box
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.status.success}, #1de9b6)`,
                      borderRadius: "50%",
                      padding: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 8px 24px ${theme.colors.status.success}40`,
                    }}
                  >
                    <Trophy size={32} weight="fill" style={{ color: "#ffffff" }} />
                  </Box>
                  <Box>
                    <Text
                      as="p"
                      size="4"
                      style={{
                        fontWeight: 800,
                        color: theme.colors.text.primary,
                        marginBottom: theme.spacing.semantic.component.xs,
                      }}
                    >
                      🎉 Congratulations!
                    </Text>
                    <Text
                      as="p"
                      size="2"
                      style={{
                        color: theme.colors.text.secondary,
                        fontWeight: 600,
                      }}
                    >
                      You've earned your OpenGraph Data Annotation Specialist Certificate
                    </Text>
                  </Box>
                </Flex>

                <Flex gap="3" justify="center">
                  <Button
                    onClick={() => setShowCertificateModal(true)}
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, #64ffda)`,
                      color: "#0f0f23",
                      border: "none",
                      borderRadius: theme.borders.radius.md,
                      padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
                      fontWeight: 700,
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 12px rgba(100, 255, 218, 0.3)",
                    }}
                  >
                    <Trophy size={16} weight="fill" />
                    View & Download Certificate
                  </Button>

                  <Button
                    onClick={() => {
                      const text = encodeURIComponent(
                        `🏆 Earned OpenGraph AI Data Certification!\n\n` +
                          `Score: ${certificateData.userProgress?.totalScore}/${certificateData.userProgress?.maxPossibleScore} • Completed ${certificateData.userProgress?.missionScores?.filter(ms => ms.score > 0).length}/${certificateData.userProgress?.missions?.length} missions\n\n` +
                          `Physical AI training on @SuiNetwork & @WalrusProtocol 🤖\n\n` +
                          `@OpenGraph_Labs #PhysicalAI #Web3AI\n\n`
                      );
                      const url = encodeURIComponent("https://explorer.opengraphlabs.xyz/challenges");
                      window.open(
                        `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
                        "_blank"
                      );
                    }}
                    style={{
                      background: "#1DA1F2",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: theme.borders.radius.md,
                      padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
                      fontWeight: 600,
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 12px rgba(29, 161, 242, 0.3)",
                    }}
                  >
                    <TwitterLogo size={16} />
                    Share on Twitter
                  </Button>
                </Flex>
              </Box>
            </Box>
          </Box>
        )}

      {/* Mission Cards Section - Show during mission period */}
      {userProgress && userProgress.overallStatus !== "completed" && (
        <Box style={{ marginBottom: theme.spacing.semantic.layout.lg }}>
          <Flex
            align="center"
            gap="2"
            style={{ marginBottom: theme.spacing.semantic.component.lg }}
          >
            <Trophy size={20} style={{ color: theme.colors.interactive.accent }} />
            <Text
              size="3"
              style={{
                fontWeight: 700,
                color: theme.colors.text.primary,
              }}
            >
              Annotation Challenges
            </Text>
            {isConnected && (
              <Badge
                style={{
                  background: `${theme.colors.status.success}15`,
                  color: theme.colors.status.success,
                  border: `1px solid ${theme.colors.status.success}30`,
                  padding: "2px 8px",
                  borderRadius: theme.borders.radius.full,
                  fontSize: "11px",
                  fontWeight: 600,
                  marginLeft: theme.spacing.semantic.component.sm,
                }}
              >
                🔗 Wallet Connected
              </Badge>
            )}
          </Flex>

          {/* Mission Cards with Inline Videos */}
          <Flex direction="column" gap="6">
            {userProgress?.missions.map((mission, index) => {
              const challenge = filteredChallenges.find(c => c.id === mission.challengeId);
              if (!challenge) return null;

              const missionStatus = getMissionStatus(mission.id);
              const isLocked = missionStatus === "locked";

              return (
                <Box key={mission.id}>
                  {/* Desktop Layout: Side by side */}
                  <Box className="desktop-mission-layout">
                    <Flex gap="6" align="start" style={{ width: "100%" }}>
                      {/* Mission Card */}
                      <Box style={{ flex: 1, maxWidth: "400px" }}>
                        <MissionCard
                          mission={mission}
                          challenge={challenge}
                          isActive={currentMission?.id === mission.id}
                          onClick={() => {
                            if (isLocked) {
                              alert("Complete the previous step first!");
                              return;
                            }
                            // Navigate directly to challenge page
                            navigate(`/challenges/${challenge.id}/annotate`);
                          }}
                        />
                      </Box>

                      {/* Inline Video Guide */}
                      <Box style={{ flex: "0 0 auto" }}>
                        <InlineVideoGuide
                          mission={mission}
                          width={450}
                          height={320}
                          autoplay={!isLocked}
                          isLocked={isLocked}
                        />
                      </Box>
                    </Flex>
                  </Box>

                  {/* Mobile Layout: Stacked */}
                  <Box className="mobile-mission-layout">
                    <Flex direction="column" gap="4">
                      {/* Inline Video Guide */}
                      <Box style={{ alignSelf: "center" }}>
                        <InlineVideoGuide
                          mission={mission}
                          width={380}
                          height={214}
                          autoplay={!isLocked}
                          isLocked={isLocked}
                        />
                      </Box>

                      {/* Mission Card */}
                      <MissionCard
                        mission={mission}
                        challenge={challenge}
                        isActive={currentMission?.id === mission.id}
                        onClick={() => {
                          if (isLocked) {
                            alert("Complete the previous step first!");
                            return;
                          }
                          // Navigate directly to challenge page
                          navigate(`/challenges/${challenge.id}/annotate`);
                        }}
                      />
                    </Flex>
                  </Box>
                </Box>
              );
            })}
          </Flex>
        </Box>
      )}

      {/* All Challenges Section - Commented out during mission period */}
      {/*<Box style={{ marginBottom: theme.spacing.semantic.layout.lg }}>*/}
      {/*  <Flex align="center" gap="2" style={{ marginBottom: theme.spacing.semantic.component.lg }}>*/}
      {/*    <Trophy size={20} style={{ color: theme.colors.interactive.accent }} />*/}
      {/*    <Text*/}
      {/*      size="3"*/}
      {/*      style={{*/}
      {/*        fontWeight: 700,*/}
      {/*        color: theme.colors.text.primary,*/}
      {/*      }}*/}
      {/*    >*/}
      {/*      All Available Challenges*/}
      {/*    </Text>*/}
      {/*  </Flex>*/}

      {/*  {filteredChallenges.length === 0 ? (*/}
      {/*    <Flex*/}
      {/*      direction="column"*/}
      {/*      align="center"*/}
      {/*      justify="center"*/}
      {/*      gap="4"*/}
      {/*      style={{*/}
      {/*        height: "60vh",*/}
      {/*        background: theme.colors.background.card,*/}
      {/*        borderRadius: theme.borders.radius.lg,*/}
      {/*        border: `1px solid ${theme.colors.border.primary}`,*/}
      {/*        padding: theme.spacing.semantic.layout.lg,*/}
      {/*      }}*/}
      {/*    >*/}
      {/*      <Box*/}
      {/*        style={{*/}
      {/*          width: "64px",*/}
      {/*          height: "64px",*/}
      {/*          borderRadius: "50%",*/}
      {/*          background: `${theme.colors.text.tertiary}10`,*/}
      {/*          display: "flex",*/}
      {/*          alignItems: "center",*/}
      {/*          justifyContent: "center",*/}
      {/*        }}*/}
      {/*      >*/}
      {/*        <Trophy size={28} style={{ color: theme.colors.text.tertiary }} />*/}
      {/*      </Box>*/}
      {/*      <Box style={{ textAlign: "center", maxWidth: "320px" }}>*/}
      {/*        <Text*/}
      {/*          size="4"*/}
      {/*          style={{*/}
      {/*            fontWeight: 600,*/}
      {/*            color: theme.colors.text.primary,*/}
      {/*            marginBottom: theme.spacing.semantic.component.xs,*/}
      {/*          }}*/}
      {/*        >*/}
      {/*          No Challenges Found*/}
      {/*        </Text>*/}
      {/*        <br />*/}
      {/*        <Text*/}
      {/*          size="2"*/}
      {/*          style={{*/}
      {/*            color: theme.colors.text.secondary,*/}
      {/*            lineHeight: 1.5,*/}
      {/*          }}*/}
      {/*        >*/}
      {/*          Try adjusting your filters or search terms*/}
      {/*        </Text>*/}
      {/*      </Box>*/}
      {/*    </Flex>*/}
      {/*  ) : (*/}
      {/*    <Grid*/}
      {/*      columns={{ initial: "1", sm: "1", md: "2" }}*/}
      {/*      gap="4"*/}
      {/*      style={{*/}
      {/*        gridTemplateColumns: "repeat(auto-fill, minmax(480px, 1fr))",*/}
      {/*      }}*/}
      {/*      className={isLoaded ? "pageLoaded" : ""}*/}
      {/*    >*/}
      {/*      {filteredChallenges.map((challenge, index) => (*/}
      {/*        <Box*/}
      {/*          key={challenge.id}*/}
      {/*          className={isLoaded ? "visible" : ""}*/}
      {/*          style={{*/}
      {/*            animationDelay: `${index * 0.1}s`,*/}
      {/*          }}*/}
      {/*        >*/}
      {/*          <ChallengeCard challenge={challenge} index={index} />*/}
      {/*        </Box>*/}
      {/*      ))}*/}
      {/*    </Grid>*/}
      {/*  )}*/}
      {/*</Box>*/}

      {/* Compact Mission Status - Fixed at bottom right */}
      {userProgress && (
        <CompactMissionStatus
          userProgress={userProgress}
          onMissionClick={handleMissionClick}
          onViewCertificate={() => setShowCertificateModal(true)}
        />
      )}

      {/* Mission Success Animation */}
      {successMissionData && (
        <MissionSuccessAnimation
          isVisible={showSuccessAnimation}
          missionTitle={successMissionData.title}
          completedCount={successMissionData.completedCount}
          requiredCount={successMissionData.requiredCount}
          onAnimationComplete={() => {
            setShowSuccessAnimation(false);
            setSuccessMissionData(null);
          }}
        />
      )}

      {/* Certificate Modal */}
      {certificateData.userProgress &&
        certificateData.userProgress.certificate &&
        certificateData.userProgress.missionScores &&
        certificateData.userProgress.missions &&
        certificateData.userProgress.missionScores.length > 0 &&
        certificateData.userProgress.missions.length > 0 && (
          <CertificateModal
            userProgress={certificateData.userProgress}
            isOpen={showCertificateModal}
            onClose={() => setShowCertificateModal(false)}
          />
        )}

      <style>
        {`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .pageLoaded {
          animation: fadeIn 0.6s ease forwards;
        }
        
        @keyframes fadeIn {
          from { 
            opacity: 0.8; 
            transform: translateY(10px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        .visible {
          animation: cardSlideIn 0.4s ease forwards;
        }
        
        @keyframes cardSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* Mission Layout Responsive Styles */
        .desktop-mission-layout {
          display: none;
        }
        
        .mobile-mission-layout {
          display: block;
        }
        
        @media (min-width: 768px) {
          .desktop-mission-layout {
            display: block;
          }
          
          .mobile-mission-layout {
            display: none;
          }
        }

        /* Certificate Banner Animation */
        @keyframes certificateShimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        `}
      </style>
    </SidebarLayout>
  );
}
