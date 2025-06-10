import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Button,
  Badge,
  Grid,
  Spinner,
} from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import {
  ArrowLeft,
  Trophy,
  Users,
  Clock,
  CurrencyDollar,
  Star,
  Fire,
  Circle,
  CheckCircle,
  Warning,
  Calendar,
  Tag,
  Database,
  ChartLineUp,
  Lightning,
  Sparkle,
  Play,
  Pause,
  Target,
  Medal,
  Coins,
  Timer,
} from "phosphor-react";
import {
  useChallenge,
  useParticipation,
  Challenge,
  ChallengeStatus,
  ChallengePhase,
  Participation,
} from "@/features/challenge";
import { format, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";

// Status Badge Component
function StatusBadge({ status }: { status: ChallengeStatus }) {
  const { theme } = useTheme();
  
  const statusConfig = {
    active: { 
      color: theme.colors.status.success, 
      bg: `${theme.colors.status.success}15`,
      text: 'Active',
      icon: <Play size={12} weight="fill" />
    },
    draft: { 
      color: theme.colors.text.tertiary, 
      bg: `${theme.colors.text.tertiary}15`,
      text: 'Draft',
      icon: <Pause size={12} />
    },
    completed: { 
      color: theme.colors.interactive.primary, 
      bg: `${theme.colors.interactive.primary}15`,
      text: 'Completed',
      icon: <CheckCircle size={12} weight="fill" />
    },
    cancelled: { 
      color: theme.colors.status.error, 
      bg: `${theme.colors.status.error}15`,
      text: 'Cancelled',
      icon: <Warning size={12} />
    },
    validating: { 
      color: theme.colors.status.warning, 
      bg: `${theme.colors.status.warning}15`,
      text: 'Validating',
      icon: <Timer size={12} />
    },
  };

  const config = statusConfig[status];

  return (
    <Badge
      style={{
        background: config.bg,
        color: config.color,
        border: `1px solid ${config.color}30`,
        padding: "6px 12px",
        borderRadius: theme.borders.radius.full,
        fontSize: "12px",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {config.icon}
      {config.text}
    </Badge>
  );
}

// Phase Badge Component
function PhaseBadge({ phase }: { phase: ChallengePhase }) {
  const { theme } = useTheme();
  
  const phaseConfig = {
    label: { 
      color: theme.colors.status.info, 
      text: 'Label Phase',
      icon: <Tag size={12} />
    },
    bbox: { 
      color: theme.colors.status.warning, 
      text: 'BBox Phase',
      icon: <Target size={12} />
    },
    segmentation: { 
      color: theme.colors.status.error, 
      text: 'Segmentation Phase',
      icon: <Sparkle size={12} />
    },
    validation: { 
      color: theme.colors.interactive.accent, 
      text: 'Validation Phase',
      icon: <CheckCircle size={12} />
    },
    completed: { 
      color: theme.colors.interactive.primary, 
      text: 'Completed',
      icon: <Medal size={12} weight="fill" />
    },
  };

  const config = phaseConfig[phase];

  return (
    <Badge
      style={{
        background: `${config.color}15`,
        color: config.color,
        border: `1px solid ${config.color}30`,
        padding: "6px 12px",
        borderRadius: theme.borders.radius.md,
        fontSize: "12px",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: "4px",
      }}
    >
      {config.icon}
      {config.text}
    </Badge>
  );
}

// Difficulty Badge Component
function DifficultyBadge({ difficulty }: { difficulty: Challenge['difficulty'] }) {
  const { theme } = useTheme();
  
  const difficultyConfig = {
    beginner: { 
      color: theme.colors.status.success, 
      icon: <Circle size={8} weight="fill" />,
      text: 'Beginner'
    },
    intermediate: { 
      color: theme.colors.status.warning, 
      icon: <Star size={10} />,
      text: 'Intermediate'
    },
    advanced: { 
      color: theme.colors.status.error, 
      icon: <Fire size={10} />,
      text: 'Advanced'
    },
  };

  const config = difficultyConfig[difficulty];

  return (
    <Flex align="center" gap="1" style={{ color: config.color }}>
      {config.icon}
      <Text size="2" style={{ fontWeight: 600 }}>
        {config.text}
      </Text>
    </Flex>
  );
}

// Time Remaining Component
function TimeRemaining({ endDate }: { endDate: Date }) {
  const { theme } = useTheme();
  const now = new Date();
  const timeLeft = endDate.getTime() - now.getTime();
  
  if (timeLeft <= 0) {
    return (
      <Text size="2" style={{ color: theme.colors.status.error, fontWeight: 600 }}>
        Ended
      </Text>
    );
  }

  const days = differenceInDays(endDate, now);
  const hours = differenceInHours(endDate, now) % 24;
  const minutes = differenceInMinutes(endDate, now) % 60;

  let timeDisplay = "";
  if (days > 0) {
    timeDisplay = `${days}d ${hours}h`;
  } else if (hours > 0) {
    timeDisplay = `${hours}h ${minutes}m`;
  } else {
    timeDisplay = `${minutes}m`;
  }

  return (
    <Text size="2" style={{ 
      color: days < 1 ? theme.colors.status.error : theme.colors.text.primary,
      fontWeight: 600 
    }}>
      {timeDisplay} left
    </Text>
  );
}

// Stats Card Component
function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color 
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}) {
  const { theme } = useTheme();

  return (
    <Box
      style={{
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borders.radius.lg,
        padding: theme.spacing.semantic.component.lg,
        textAlign: "center",
      }}
    >
      <Flex direction="column" align="center" gap="2">
        <Box
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: color,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Text
            as="div"
            size="4"
            style={{
              fontWeight: 700,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.semantic.component.xs,
            }}
          >
            {value}
          </Text>
          <Text
            as="div"
            size="1"
            style={{
              color: theme.colors.text.secondary,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              size="1"
              style={{
                color: theme.colors.text.tertiary,
                marginTop: theme.spacing.semantic.component.xs,
              }}
            >
              {subtitle}
            </Text>
          )}
        </Box>
      </Flex>
    </Box>
  );
}

// Timeline Component
function Timeline({ challenge }: { challenge: Challenge }) {
  const { theme } = useTheme();
  const now = new Date();

  const phases = [
    { key: 'label', name: 'Label Annotation', ...challenge.timeline.phases.label },
    { key: 'bbox', name: 'BBox Annotation', ...challenge.timeline.phases.bbox },
    { key: 'segmentation', name: 'Segmentation', ...challenge.timeline.phases.segmentation },
    { key: 'validation', name: 'Validation', ...challenge.timeline.phases.validation },
  ];

  return (
    <Box
      style={{
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borders.radius.lg,
        padding: theme.spacing.semantic.component.lg,
      }}
    >
      <Text
        size="3"
        style={{
          fontWeight: 700,
          color: theme.colors.text.primary,
          marginBottom: theme.spacing.semantic.component.lg,
        }}
      >
        Timeline
      </Text>
      
      <Flex direction="column" gap="4">
        {phases.map((phase, index) => {
          const isActive = now >= phase.start && now <= phase.end;
          const isCompleted = now > phase.end;
          const isFuture = now < phase.start;
          
          let statusColor = theme.colors.text.tertiary;
          let statusIcon = <Circle size={12} />;
          
          if (isActive) {
            statusColor = theme.colors.status.success as any;
            statusIcon = <Play size={12} weight="fill" />;
          } else if (isCompleted) {
            statusColor = theme.colors.interactive.primary as any;
            statusIcon = <CheckCircle size={12} weight="fill" />;
          }

          return (
            <Flex key={phase.key} align="center" gap="3">
              <Box
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  background: `${statusColor}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: statusColor,
                  border: `2px solid ${statusColor}30`,
                }}
              >
                {statusIcon}
              </Box>
              
              <Box style={{ flex: 1 }}>
                <Flex justify="between" align="center">
                  <Text
                    as="div"
                    size="2"
                    style={{
                      fontWeight: 600,
                      color: isActive ? theme.colors.text.primary : theme.colors.text.secondary,
                    }}
                  >
                    {phase.name}
                  </Text>
                  <Text
                    as="div"
                    size="1"
                    style={{
                      color: theme.colors.text.tertiary,
                      fontFamily: "monospace",
                    }}
                  >
                    {format(phase.start, 'MMM dd')} - {format(phase.end, 'MMM dd')}
                  </Text>
                </Flex>
                
                {isActive && (
                  <Box
                    style={{
                      marginTop: theme.spacing.semantic.component.xs,
                      height: "4px",
                      background: theme.colors.background.secondary,
                      borderRadius: "2px",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      style={{
                        height: "100%",
                        width: `${Math.min(100, ((now.getTime() - phase.start.getTime()) / (phase.end.getTime() - phase.start.getTime())) * 100)}%`,
                        background: `linear-gradient(90deg, ${theme.colors.status.success}, ${theme.colors.interactive.primary})`,
                        borderRadius: "2px",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </Box>
                )}
              </Box>
              
              {index < phases.length - 1 && (
                <Box
                  style={{
                    position: "absolute",
                    left: "11px",
                    top: "32px",
                    width: "2px",
                    height: "40px",
                    background: isCompleted ? statusColor : theme.colors.border.secondary,
                    opacity: 0.3,
                  }}
                />
              )}
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
}

// Validator Status Component
function ValidatorStatus({ 
  challenge, 
  navigate
}: {
  challenge: Challenge;
  navigate: (path: string) => void;
}) {
  const { theme } = useTheme();

  const canValidate = challenge.currentPhase === 'validation' || challenge.status === 'validating';

  return (
    <Box
      style={{
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.status.warning}30`,
        borderRadius: theme.borders.radius.lg,
        padding: theme.spacing.semantic.component.lg,
      }}
    >
      <Flex justify="between" align="center" style={{ marginBottom: theme.spacing.semantic.component.lg }}>
        <Text
          size="3"
          style={{
            fontWeight: 700,
            color: theme.colors.text.primary,
          }}
        >
          Validator Access
        </Text>
        <Badge
          style={{
            background: `${theme.colors.status.warning}15`,
            color: theme.colors.status.warning,
            border: `1px solid ${theme.colors.status.warning}30`,
            padding: "4px 8px",
            borderRadius: theme.borders.radius.full,
            fontSize: "11px",
            fontWeight: 600,
          }}
        >
          <CheckCircle size={12} />
          Validator
        </Badge>
      </Flex>

      <Text
        size="2"
        style={{
          color: theme.colors.text.secondary,
          lineHeight: 1.5,
          marginBottom: theme.spacing.semantic.component.lg,
        }}
      >
        You have validator privileges for this challenge. Review and approve annotation submissions to earn validation rewards.
      </Text>

      {/* Validation Stats */}
      <Box
        style={{
          background: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border.secondary}`,
          borderRadius: theme.borders.radius.md,
          padding: theme.spacing.semantic.component.md,
          marginBottom: theme.spacing.semantic.component.lg,
        }}
      >
        <Grid columns="2" gap="4">
          <Flex direction="column" gap="1">
            <Text size="1" style={{ color: theme.colors.text.tertiary, fontWeight: 600 }}>
              PENDING VALIDATIONS
            </Text>
            <Text size="3" style={{ color: theme.colors.text.primary, fontWeight: 700 }}>
              {challenge.stats.pendingValidations}
            </Text>
          </Flex>
          <Flex direction="column" gap="1">
            <Text size="1" style={{ color: theme.colors.text.tertiary, fontWeight: 600 }}>
              VALIDATION REWARD
            </Text>
            <Text size="3" style={{ color: theme.colors.status.success, fontWeight: 700 }}>
              {challenge.validators.validationRewards}%
            </Text>
          </Flex>
        </Grid>
      </Box>

      {/* Action Button */}
      <Button
        onClick={() => navigate(`/challenges/${challenge.id}/validate`)}
        disabled={!canValidate}
        style={{
          width: "100%",
          background: canValidate ? theme.colors.status.warning : theme.colors.interactive.disabled,
          color: theme.colors.text.inverse,
          border: "none",
          borderRadius: theme.borders.radius.md,
          padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
          fontWeight: 600,
          fontSize: "14px",
          cursor: canValidate ? "pointer" : "not-allowed",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: theme.spacing.semantic.component.sm,
        }}
      >
        <CheckCircle size={16} />
        {canValidate ? "Start Validation" : `Validation Available in ${challenge.currentPhase} Phase`}
      </Button>
    </Box>
  );
}

// Participation Status Component
function ParticipationStatus({ 
  challenge, 
  participation, 
  onJoin, 
  onLeave, 
  isJoining,
  navigate
}: {
  challenge: Challenge;
  participation: Participation | undefined;
  onJoin: () => void;
  onLeave: () => void;
  isJoining: boolean;
  navigate: (path: string) => void;
}) {
  const { theme } = useTheme();

  if (!participation) {
    const canJoin = challenge.status === 'active' && 
      (!challenge.requirements.maxParticipants || 
       challenge.stats.totalParticipants < challenge.requirements.maxParticipants);

    return (
      <Box
        style={{
          background: theme.colors.background.card,
          border: `1px solid ${theme.colors.border.primary}`,
          borderRadius: theme.borders.radius.lg,
          padding: theme.spacing.semantic.component.lg,
          textAlign: "center",
        }}
      >
        <Text
          as="div"
          size="3"
          style={{
            fontWeight: 700,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.semantic.component.md,
          }}
        >
          Join Challenge
        </Text>
        
        <Text
          as="div"
          size="2"
          style={{
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.semantic.component.lg,
            lineHeight: 1.5,
          }}
        >
          {canJoin 
            ? "Start earning rewards by contributing high-quality annotations to this challenge."
            : challenge.status !== 'active'
              ? "This challenge is not currently accepting participants."
              : "This challenge has reached its maximum number of participants."
          }
        </Text>

        <Button
          onClick={onJoin}
          disabled={!canJoin || isJoining}
          style={{
            background: canJoin ? theme.colors.interactive.primary : theme.colors.interactive.disabled,
            color: theme.colors.text.inverse,
            border: "none",
            borderRadius: theme.borders.radius.md,
            padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
            fontWeight: 600,
            fontSize: "14px",
            cursor: canJoin ? "pointer" : "not-allowed",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: theme.spacing.semantic.component.sm,
          }}
        >
          {isJoining ? (
            <>
              <Spinner />
              Joining...
            </>
          ) : (
            <>
              <Trophy size={16} />
              {canJoin ? "Join Challenge" : "Cannot Join"}
            </>
          )}
        </Button>
      </Box>
    );
  }

  // Show participation status
  const totalProgress = participation.progress.label.completed + 
    participation.progress.bbox.completed + 
    participation.progress.segmentation.completed;
  const totalPossible = participation.progress.label.total + 
    participation.progress.bbox.total + 
    participation.progress.segmentation.total;
  const overallProgress = totalPossible > 0 ? (totalProgress / totalPossible) * 100 : 0;

  return (
    <Box
      style={{
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.interactive.primary}30`,
        borderRadius: theme.borders.radius.lg,
        padding: theme.spacing.semantic.component.lg,
      }}
    >
      <Flex justify="between" align="center" style={{ marginBottom: theme.spacing.semantic.component.lg }}>
        <Text
          size="3"
          style={{
            fontWeight: 700,
            color: theme.colors.text.primary,
          }}
        >
          Your Participation
        </Text>
        <Badge
          style={{
            background: `${theme.colors.status.success}15`,
            color: theme.colors.status.success,
            border: `1px solid ${theme.colors.status.success}30`,
            padding: "4px 8px",
            borderRadius: theme.borders.radius.full,
            fontSize: "11px",
            fontWeight: 600,
          }}
        >
          Rank #{participation.ranking}
        </Badge>
      </Flex>

      {/* Progress Stats */}
      <Grid columns="3" gap="3" style={{ marginBottom: theme.spacing.semantic.component.lg }}>
        <Flex direction="column" gap="1">
          <Text size="1" style={{ color: theme.colors.text.tertiary, fontWeight: 600 }}>
            LABELS
          </Text>
          <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 700 }}>
            {participation.progress.label.completed}/{participation.progress.label.total}
          </Text>
        </Flex>
        <Flex direction="column" gap="1">
          <Text size="1" style={{ color: theme.colors.text.tertiary, fontWeight: 600 }}>
            BBOXES
          </Text>
          <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 700 }}>
            {participation.progress.bbox.completed}/{participation.progress.bbox.total}
          </Text>
        </Flex>
        <Flex direction="column" gap="1">
          <Text size="1" style={{ color: theme.colors.text.tertiary, fontWeight: 600 }}>
            SEGMENTS
          </Text>
          <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 700 }}>
            {participation.progress.segmentation.completed}/{participation.progress.segmentation.total}
          </Text>
        </Flex>
      </Grid>

      {/* Overall Progress */}
      <Box style={{ marginBottom: theme.spacing.semantic.component.lg }}>
        <Flex justify="between" align="center" style={{ marginBottom: theme.spacing.semantic.component.xs }}>
          <Text size="2" style={{ color: theme.colors.text.secondary, fontWeight: 600 }}>
            Overall Progress
          </Text>
          <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 700 }}>
            {Math.round(overallProgress)}%
          </Text>
        </Flex>
        <Box
          style={{
            height: "8px",
            background: theme.colors.background.secondary,
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <Box
            style={{
              height: "100%",
              width: `${overallProgress}%`,
              background: `linear-gradient(90deg, ${theme.colors.interactive.primary}, ${theme.colors.status.success})`,
              borderRadius: "4px",
              transition: "width 0.3s ease",
            }}
          />
        </Box>
      </Box>

      {/* Earnings */}
      <Box
        style={{
          background: theme.colors.background.secondary,
          border: `1px solid ${theme.colors.border.secondary}`,
          borderRadius: theme.borders.radius.md,
          padding: theme.spacing.semantic.component.md,
          marginBottom: theme.spacing.semantic.component.lg,
        }}
      >
        <Flex justify="between" align="center">
          <Flex direction="column" gap="1">
            <Text size="1" style={{ color: theme.colors.text.tertiary, fontWeight: 600 }}>
              PENDING EARNINGS
            </Text>
            <Text size="3" style={{ color: theme.colors.text.primary, fontWeight: 700 }}>
              {participation.earnings.pending.toFixed(2)} {challenge.bounty.currency}
            </Text>
          </Flex>
          <Flex direction="column" gap="1">
            <Text size="1" style={{ color: theme.colors.text.tertiary, fontWeight: 600 }}>
              QUALITY SCORE
            </Text>
            <Text size="3" style={{ color: theme.colors.status.success, fontWeight: 700 }}>
              {(participation.qualityScore * 100).toFixed(1)}%
            </Text>
          </Flex>
        </Flex>
      </Box>

      {/* Action Buttons */}
      <Flex direction="column" gap="2">
        <Text size="1" style={{ color: theme.colors.text.tertiary }}>
          Debug: Phase={challenge.currentPhase}, Status={challenge.status}
        </Text>
        
        <Flex gap="2">
          <Button
            onClick={() => navigate(`/challenges/${challenge.id}/annotate`)}
            style={{
              flex: 1,
              background: theme.colors.interactive.primary,
              color: theme.colors.text.inverse,
              border: "none",
              borderRadius: theme.borders.radius.md,
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Continue Annotating
          </Button>
          
          {/* Validation Button - Always show for testing */}
          {true && (
            <Button
              onClick={() => navigate(`/challenges/${challenge.id}/validate`)}
              style={{
                flex: 1,
                background: theme.colors.status.warning,
                color: theme.colors.text.inverse,
                border: "none",
                borderRadius: theme.borders.radius.md,
                padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: theme.spacing.semantic.component.xs,
              }}
            >
              <CheckCircle size={14} />
              Start Validation
            </Button>
          )}
          
          <Button
            onClick={onLeave}
            style={{
              background: "transparent",
              color: theme.colors.status.error,
              border: `1px solid ${theme.colors.status.error}`,
              borderRadius: theme.borders.radius.md,
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Leave
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
}

export function ChallengeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const { challenge, loading, error } = useChallenge(id || '');
  const { 
    participations, 
    isParticipating, 
    getChallengeParticipation,
    joinChallenge,
    leaveChallenge 
  } = useParticipation('user-1'); // Mock user ID
  console.log("challenge", challenge);
  
  const [isJoining, setIsJoining] = useState(false);

  const participation = getChallengeParticipation(id || '');
  
  // Check if current user is a validator for this challenge
  const currentUserId = 'user-1'; // Mock user ID
  const isValidator = challenge?.validators.allowedValidators.includes(currentUserId) || false;

  const handleJoinChallenge = async () => {
    if (!id) return;
    setIsJoining(true);
    const success = await joinChallenge(id);
    if (success) {
      // Refresh or show success message
    }
    setIsJoining(false);
  };

  const handleLeaveChallenge = async () => {
    if (!id) return;
    const success = await leaveChallenge(id);
    if (success) {
      // Refresh or show success message
    }
  };

  if (loading) {
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
          <Spinner />
          <Text
            size="3"
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
            }}
          >
            Loading Challenge...
          </Text>
        </Flex>
      </Box>
    );
  }

  if (error || !challenge) {
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
          <Trophy size={48} style={{ color: theme.colors.status.error }} />
          <Box style={{ textAlign: "center" }}>
            <Text
              size="4"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              Challenge Not Found
            </Text>
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: 1.5,
                marginBottom: theme.spacing.semantic.component.md,
              }}
            >
              {error || "The requested challenge could not be found."}
            </Text>
            <Button
              onClick={() => navigate('/challenges')}
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
              Back to Challenges
            </Button>
          </Box>
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      style={{
        background: theme.colors.background.primary,
        minHeight: "100vh",
        padding: theme.spacing.semantic.component.lg,
      }}
    >
      <Box
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Back Navigation */}
        <Flex align="center" gap="2" style={{ marginBottom: theme.spacing.semantic.component.lg }}>
          <Button
            onClick={() => navigate('/challenges')}
            style={{
              background: "transparent",
              color: theme.colors.text.secondary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.md,
              padding: theme.spacing.semantic.component.sm,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ArrowLeft size={16} />
          </Button>
          <Text size="2" style={{ color: theme.colors.text.secondary }}>
            Back to Challenges
          </Text>
        </Flex>

        {/* Header */}
        <Box
          style={{
            background: theme.colors.background.card,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.lg,
            padding: theme.spacing.semantic.component.xl,
            marginBottom: theme.spacing.semantic.component.lg,
          }}
        >
          <Flex justify="between" align="start" style={{ marginBottom: theme.spacing.semantic.component.lg }}>
            <Box style={{ flex: 1 }}>
              <Flex align="center" gap="3" style={{ marginBottom: theme.spacing.semantic.component.md }}>
                <StatusBadge status={challenge.status} />
                <PhaseBadge phase={challenge.currentPhase} />
                <DifficultyBadge difficulty={challenge.difficulty} />
              </Flex>
              
              <Text
                as="div"
                size="6"
                style={{
                  fontWeight: 700,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.semantic.component.sm,
                  lineHeight: 1.2,
                }}
              >
                {challenge.title}
              </Text>
              
              <Text
                as="div"
                size="3"
                style={{
                  color: theme.colors.text.secondary,
                  lineHeight: 1.5,
                  marginBottom: theme.spacing.semantic.component.md,
                }}
              >
                {challenge.description}
              </Text>

              {/* Dataset Link */}
              <Flex align="center" gap="2">
                <Database size={14} style={{ color: theme.colors.interactive.primary }} />
                <Link
                  to={`/datasets/${challenge.datasetId}`}
                  style={{
                    color: theme.colors.interactive.primary,
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  {challenge.datasetName}
                </Link>
              </Flex>
            </Box>
          </Flex>

          {/* Tags */}
          <Flex gap="2" style={{ flexWrap: "wrap" }}>
            {challenge.tags.map((tag, index) => (
              <Badge
                key={index}
                style={{
                  background: `${theme.colors.interactive.primary}10`,
                  color: theme.colors.interactive.primary,
                  border: `1px solid ${theme.colors.interactive.primary}20`,
                  padding: "4px 8px",
                  borderRadius: theme.borders.radius.sm,
                  fontSize: "11px",
                  fontWeight: 500,
                }}
              >
                {tag}
              </Badge>
            ))}
          </Flex>
        </Box>

        {/* Stats Overview */}
        <Grid 
          columns={{ initial: "2", md: "4" }} 
          gap="4" 
          style={{ marginBottom: theme.spacing.semantic.component.lg }}
        >
          <StatsCard
            title="Total Bounty"
            value={`${challenge.bounty.totalAmount.toLocaleString()} ${challenge.bounty.currency}`}
            icon={<Coins size={20} />}
            color={theme.colors.status.success}
          />
          <StatsCard
            title="Participants"
            value={challenge.stats.totalParticipants}
            subtitle={challenge.requirements.maxParticipants ? `/${challenge.requirements.maxParticipants} max` : undefined}
            icon={<Users size={20} />}
            color={theme.colors.interactive.accent}
          />
          <StatsCard
            title="Time Left"
            value="Active"
            icon={<Clock size={20} />}
            color={theme.colors.status.warning}
          />
          <StatsCard
            title="Avg Quality"
            value={`${(challenge.stats.averageQualityScore * 100).toFixed(1)}%`}
            icon={<Star size={20} />}
            color={theme.colors.interactive.primary}
          />
        </Grid>

        {/* Main Content Grid */}
        <Grid columns={{ initial: "1", lg: "2" }} gap="6">
          {/* Left Column */}
          <Flex direction="column" gap="6">
            <Timeline challenge={challenge} />
            
            {/* Bounty Distribution */}
            <Box
              style={{
                background: theme.colors.background.card,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.lg,
                padding: theme.spacing.semantic.component.lg,
              }}
            >
              <Text
                size="3"
                style={{
                  fontWeight: 700,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.semantic.component.lg,
                }}
              >
                Reward Distribution
              </Text>
              
              <Grid columns="3" gap="3">
                <Flex direction="column" gap="1">
                  <Text size="1" style={{ color: theme.colors.text.tertiary, fontWeight: 600 }}>
                    LABEL PHASE
                  </Text>
                  <Text size="3" style={{ color: theme.colors.text.primary, fontWeight: 700 }}>
                    {challenge.bounty.distribution.label}%
                  </Text>
                  <Text size="1" style={{ color: theme.colors.text.secondary }}>
                    {((challenge.bounty.totalAmount * challenge.bounty.distribution.label) / 100).toLocaleString()} {challenge.bounty.currency}
                  </Text>
                </Flex>
                <Flex direction="column" gap="1">
                  <Text size="1" style={{ color: theme.colors.text.tertiary, fontWeight: 600 }}>
                    BBOX PHASE
                  </Text>
                  <Text size="3" style={{ color: theme.colors.text.primary, fontWeight: 700 }}>
                    {challenge.bounty.distribution.bbox}%
                  </Text>
                  <Text size="1" style={{ color: theme.colors.text.secondary }}>
                    {((challenge.bounty.totalAmount * challenge.bounty.distribution.bbox) / 100).toLocaleString()} {challenge.bounty.currency}
                  </Text>
                </Flex>
                <Flex direction="column" gap="1">
                  <Text size="1" style={{ color: theme.colors.text.tertiary, fontWeight: 600 }}>
                    SEGMENTATION
                  </Text>
                  <Text size="3" style={{ color: theme.colors.text.primary, fontWeight: 700 }}>
                    {challenge.bounty.distribution.segmentation}%
                  </Text>
                  <Text size="1" style={{ color: theme.colors.text.secondary }}>
                    {((challenge.bounty.totalAmount * challenge.bounty.distribution.segmentation) / 100).toLocaleString()} {challenge.bounty.currency}
                  </Text>
                </Flex>
              </Grid>
              
              <Box
                style={{
                  marginTop: theme.spacing.semantic.component.lg,
                  padding: theme.spacing.semantic.component.md,
                  background: `${theme.colors.status.success}10`,
                  border: `1px solid ${theme.colors.status.success}30`,
                  borderRadius: theme.borders.radius.md,
                }}
              >
                <Flex align="center" gap="2">
                  <Sparkle size={14} style={{ color: theme.colors.status.success }} />
                  <Text size="2" style={{ color: theme.colors.status.success, fontWeight: 600 }}>
                    +{challenge.bounty.qualityBonus}% Quality Bonus
                  </Text>
                </Flex>
                <Text size="1" style={{ color: theme.colors.text.secondary, marginTop: theme.spacing.semantic.component.xs }}>
                  High-quality annotations receive additional rewards
                </Text>
              </Box>
            </Box>
          </Flex>

          {/* Right Column */}
          <Flex direction="column" gap="6">
            {/* Validator Status - Show if user is a validator */}
            {isValidator && (
              <ValidatorStatus
                challenge={challenge}
                navigate={navigate}
              />
            )}

            {/* Participation Status - Show if user is participating */}
            {participation && (
              <ParticipationStatus
                challenge={challenge}
                participation={participation}
                onJoin={handleJoinChallenge}
                onLeave={handleLeaveChallenge}
                isJoining={isJoining}
                navigate={navigate}
              />
            )}

            {/* Join Challenge Card - Show if user is not participating and not a validator */}
            {!participation && !isValidator && (
              <Box
                style={{
                  background: theme.colors.background.card,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.lg,
                  padding: theme.spacing.semantic.component.lg,
                }}
              >
                <Text
                  size="3"
                  style={{
                    fontWeight: 700,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing.semantic.component.md,
                  }}
                >
                  Join Challenge
                </Text>
                <Text
                  size="2"
                  style={{
                    color: theme.colors.text.secondary,
                    lineHeight: 1.5,
                    marginBottom: theme.spacing.semantic.component.lg,
                  }}
                >
                  Participate in this challenge to earn bounty rewards by providing high-quality annotations.
                </Text>
                <Button
                  onClick={handleJoinChallenge}
                  disabled={isJoining || challenge.status !== 'active'}
                  style={{
                    width: "100%",
                    background: challenge.status === 'active' ? theme.colors.status.success : theme.colors.interactive.disabled,
                    color: theme.colors.text.inverse,
                    border: "none",
                    borderRadius: theme.borders.radius.md,
                    padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
                    fontWeight: 600,
                    fontSize: "14px",
                    cursor: challenge.status === 'active' ? "pointer" : "not-allowed",
                  }}
                >
                  {isJoining ? "Joining..." : challenge.status === 'active' ? "Join Challenge" : "Challenge Not Active"}
                </Button>
              </Box>
            )}
            
            {/* Requirements */}
            <Box
              style={{
                background: theme.colors.background.card,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.lg,
                padding: theme.spacing.semantic.component.lg,
              }}
            >
              <Text
                size="3"
                style={{
                  fontWeight: 700,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.semantic.component.lg,
                }}
              >
                Requirements
              </Text>
              
              <Flex direction="column" gap="3">
                <Flex justify="between" align="center">
                  <Text size="2" style={{ color: theme.colors.text.secondary }}>
                    Minimum Quality Score
                  </Text>
                  <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 600 }}>
                    {(challenge.requirements.minQualityScore * 100).toFixed(0)}%
                  </Text>
                </Flex>
                
                <Flex justify="between" align="center">
                  <Text size="2" style={{ color: theme.colors.text.secondary }}>
                    Annotations per Image
                  </Text>
                  <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 600 }}>
                    {challenge.requirements.requiredAnnotationsPerImage}
                  </Text>
                </Flex>
                
                <Flex justify="between" align="center">
                  <Text size="2" style={{ color: theme.colors.text.secondary }}>
                    Validation Threshold
                  </Text>
                  <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 600 }}>
                    {challenge.requirements.validationThreshold} confirmations
                  </Text>
                </Flex>
                
                {challenge.requirements.maxParticipants && (
                  <Flex justify="between" align="center">
                    <Text size="2" style={{ color: theme.colors.text.secondary }}>
                      Maximum Participants
                    </Text>
                    <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 600 }}>
                      {challenge.requirements.maxParticipants}
                    </Text>
                  </Flex>
                )}
              </Flex>
            </Box>
          </Flex>
        </Grid>
      </Box>
    </Box>
  );
}