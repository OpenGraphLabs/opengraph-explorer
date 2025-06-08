import React from 'react';
import { Box, Flex, Text } from '@/shared/ui/design-system/components';
import { useTheme } from '@/shared/ui/design-system';
import { 
  Info, 
  Warning, 
  CheckCircle, 
  XCircle,
  Tag,
  Target,
  Sparkle,
  Timer,
  Trophy
} from 'phosphor-react';
import { ChallengePhase } from '@/features/challenge';
import { usePhaseConstraints } from '../hooks/usePhaseConstraints';

interface PhaseConstraintsBannerProps {
  currentPhase: ChallengePhase;
  className?: string;
}

export function PhaseConstraintsBanner({ currentPhase, className }: PhaseConstraintsBannerProps) {
  const { theme } = useTheme();
  const { constraints, canAnnotate, allowedTools, disallowedTools } = usePhaseConstraints(currentPhase);

  const phaseConfig = {
    label: {
      icon: <Tag size={16} />,
      color: theme.colors.status.info,
      bgColor: `${theme.colors.status.info}10`,
      borderColor: `${theme.colors.status.info}30`,
    },
    bbox: {
      icon: <Target size={16} />,
      color: theme.colors.status.warning,
      bgColor: `${theme.colors.status.warning}10`,
      borderColor: `${theme.colors.status.warning}30`,
    },
    segmentation: {
      icon: <Sparkle size={16} />,
      color: theme.colors.status.success,
      bgColor: `${theme.colors.status.success}10`,
      borderColor: `${theme.colors.status.success}30`,
    },
    validation: {
      icon: <Timer size={16} />,
      color: theme.colors.interactive.accent,
      bgColor: `${theme.colors.interactive.accent}10`,
      borderColor: `${theme.colors.interactive.accent}30`,
    },
    completed: {
      icon: <Trophy size={16} />,
      color: theme.colors.interactive.primary,
      bgColor: `${theme.colors.interactive.primary}10`,
      borderColor: `${theme.colors.interactive.primary}30`,
    },
  };

  const config = phaseConfig[currentPhase];

  const toolNames = {
    label: 'Labels',
    bbox: 'Bounding Boxes',
    segmentation: 'Segmentation'
  };

  return (
    <Box
      className={className}
      style={{
        background: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        borderRadius: theme.borders.radius.md,
        padding: theme.spacing.semantic.component.md,
        marginBottom: theme.spacing.semantic.component.md,
      }}
    >
      <Flex align="center" gap="3">
        <Box style={{ color: config.color, flexShrink: 0 }}>
          {config.icon}
        </Box>
        
        <Box style={{ flex: 1 }}>
          <Flex align="center" gap="2" style={{ marginBottom: theme.spacing.semantic.component.xs }}>
            <Text
              size="2"
              style={{
                fontWeight: 600,
                color: config.color,
                textTransform: 'capitalize',
              }}
            >
              {currentPhase} Phase
            </Text>
            
            {canAnnotate ? (
              <CheckCircle size={14} style={{ color: theme.colors.status.success }} />
            ) : (
              <XCircle size={14} style={{ color: theme.colors.status.error }} />
            )}
          </Flex>
          
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              lineHeight: 1.4,
              marginBottom: theme.spacing.semantic.component.sm,
            }}
          >
            {constraints.description}
          </Text>

          {/* Available Tools */}
          {allowedTools.length > 0 && (
            <Flex align="center" gap="2" style={{ marginBottom: theme.spacing.semantic.component.xs }}>
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Available:
              </Text>
              <Flex gap="1">
                {allowedTools.map((tool, index) => (
                  <React.Fragment key={tool}>
                    <Text
                      size="1"
                      style={{
                        color: theme.colors.status.success,
                        fontWeight: 600,
                      }}
                    >
                      {toolNames[tool]}
                    </Text>
                    {index < allowedTools.length - 1 && (
                      <Text size="1" style={{ color: theme.colors.text.tertiary }}>
                        •
                      </Text>
                    )}
                  </React.Fragment>
                ))}
              </Flex>
            </Flex>
          )}

          {/* Disabled Tools */}
          {disallowedTools.length > 0 && (
            <Flex align="center" gap="2">
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                Coming Soon:
              </Text>
              <Flex gap="1">
                {disallowedTools.map((tool, index) => (
                  <React.Fragment key={tool}>
                    <Text
                      size="1"
                      style={{
                        color: theme.colors.text.tertiary,
                        fontWeight: 500,
                      }}
                    >
                      {toolNames[tool]}
                    </Text>
                    {index < disallowedTools.length - 1 && (
                      <Text size="1" style={{ color: theme.colors.text.tertiary }}>
                        •
                      </Text>
                    )}
                  </React.Fragment>
                ))}
              </Flex>
            </Flex>
          )}
        </Box>
      </Flex>
    </Box>
  );
} 