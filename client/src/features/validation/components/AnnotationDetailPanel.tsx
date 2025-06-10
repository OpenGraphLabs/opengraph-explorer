import { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Badge,
} from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import {
  X,
  CheckCircle,
  XCircle,
  Flag,
  User,
  Calendar,
  Tag,
  Target,
  Polygon,
  Star,
  Clock,
  Info,
  TrendUp,
  Eye,
} from "phosphor-react";
import { PendingAnnotation, ValidationAction } from '../types/validation';

interface AnnotationDetailPanelProps {
  annotation?: PendingAnnotation;
  validationActions: ValidationAction[];
  onValidate: (action: 'approve' | 'reject' | 'flag', reason?: string) => void;
  onClose: () => void;
}

export function AnnotationDetailPanel({
  annotation,
  validationActions,
  onValidate,
  onClose,
}: AnnotationDetailPanelProps) {
  const { theme } = useTheme();
  const [customReason, setCustomReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);

  if (!annotation) {
    return null;
  }

  const getQualityColor = (score: number) => {
    if (score >= 0.9) return theme.colors.status.success;
    if (score >= 0.7) return theme.colors.interactive.primary;
    if (score >= 0.5) return theme.colors.status.warning;
    return theme.colors.status.error;
  };

  const getAnnotationIcon = (type: string) => {
    switch (type) {
      case 'label': return <Tag size={16} />;
      case 'bbox': return <Target size={16} />;
      case 'segmentation': return <Polygon size={16} />;
      default: return <Tag size={16} />;
    }
  };

  const getAnnotationTypeColor = (type: string) => {
    switch (type) {
      case 'label': return theme.colors.status.info;
      case 'bbox': return theme.colors.status.warning;
      case 'segmentation': return theme.colors.status.success;
      default: return theme.colors.text.secondary;
    }
  };

  const handleValidation = (action: 'approve' | 'reject' | 'flag') => {
    if (action === 'reject' && !customReason.trim()) {
      setShowReasonInput(true);
      return;
    }
    
    onValidate(action, customReason || undefined);
    setCustomReason('');
    setShowReasonInput(false);
  };

  const getAnnotationContent = () => {
    const content = [];
    
    if (annotation.data.labels?.length) {
      content.push({
        type: 'Labels',
        items: annotation.data.labels.map(l => `${l.label} (${Math.round((l.confidence || 1) * 100)}%)`),
        color: theme.colors.status.info
      });
    }
    
    if (annotation.data.boundingBoxes?.length) {
      content.push({
        type: 'Bounding Boxes',
        items: annotation.data.boundingBoxes.map(b => 
          `${b.label}: ${b.width}×${b.height} at (${b.x}, ${b.y})`
        ),
        color: theme.colors.status.warning
      });
    }
    
    if (annotation.data.polygons?.length) {
      content.push({
        type: 'Polygons',
        items: annotation.data.polygons.map(p => 
          `${p.label}: ${p.points.length} points`
        ),
        color: theme.colors.status.success
      });
    }
    
    return content;
  };

  const lastValidation = validationActions[validationActions.length - 1];

  return (
    <Box
      style={{
        width: "320px",
        background: theme.colors.background.card,
        borderLeft: `1px solid ${theme.colors.border.primary}`,
        display: "flex",
        flexDirection: "column",
        maxHeight: "100%",
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Header */}
      <Box
        style={{
          padding: theme.spacing.semantic.component.md,
          borderBottom: `1px solid ${theme.colors.border.primary}`,
          background: `linear-gradient(135deg, ${theme.colors.background.tertiary}, ${theme.colors.background.card})`,
        }}
      >
        <Flex align="center" justify="between" style={{ marginBottom: theme.spacing.semantic.component.sm }}>
          <Flex align="center" gap="2">
            <Eye size={16} style={{ color: theme.colors.interactive.primary }} />
            <Text
              size="3"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
              }}
            >
              Annotation Details
            </Text>
          </Flex>
          
          <Button
            onClick={onClose}
            style={{
              background: "transparent",
              color: theme.colors.text.secondary,
              border: "none",
              borderRadius: theme.borders.radius.sm,
              padding: theme.spacing.semantic.component.xs,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={16} />
          </Button>
        </Flex>

        {/* Annotation Type Badge */}
        <Flex align="center" gap="2">
          <Box style={{ color: getAnnotationTypeColor(annotation.type) }}>
            {getAnnotationIcon(annotation.type)}
          </Box>
          <Badge
            style={{
              background: `${getAnnotationTypeColor(annotation.type)}20`,
              color: getAnnotationTypeColor(annotation.type),
              fontSize: "11px",
              fontWeight: 600,
              padding: "4px 8px",
              borderRadius: theme.borders.radius.full,
              textTransform: "capitalize",
            }}
          >
            {annotation.type === 'bbox' ? 'Bounding Box' : annotation.type} Annotation
          </Badge>
        </Flex>
      </Box>

      {/* Content */}
      <Box
        style={{
          flex: 1,
          overflow: "auto",
          padding: theme.spacing.semantic.component.md,
        }}
      >
        <Flex direction="column" gap="4">
          {/* Quality Score */}
          <Box>
            <Text
              size="2"
              style={{
                fontWeight: 600,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.semantic.component.xs,
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.semantic.component.xs,
              }}
            >
              <Star size={12} />
              Quality Score
            </Text>
            
            <Box
              style={{
                background: theme.colors.background.secondary,
                borderRadius: theme.borders.radius.md,
                padding: theme.spacing.semantic.component.md,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Flex align="center" justify="between" style={{ marginBottom: "8px" }}>
                <Text
                  size="4"
                  style={{
                    fontWeight: 700,
                    color: getQualityColor(annotation.qualityScore),
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {Math.round(annotation.qualityScore * 100)}%
                </Text>
                
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.tertiary,
                    fontWeight: 500,
                  }}
                >
                  {annotation.qualityScore >= 0.9 ? 'Excellent' :
                   annotation.qualityScore >= 0.7 ? 'Good' :
                   annotation.qualityScore >= 0.5 ? 'Fair' : 'Poor'}
                </Text>
              </Flex>
              
              <Box
                style={{
                  width: "100%",
                  height: "6px",
                  background: theme.colors.background.primary,
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <Box
                  style={{
                    height: "100%",
                    width: `${annotation.qualityScore * 100}%`,
                    background: `linear-gradient(90deg, ${getQualityColor(annotation.qualityScore)}, ${getQualityColor(annotation.qualityScore)}80)`,
                    borderRadius: "3px",
                    transition: "width 0.3s ease",
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Participant Info */}
          <Box>
            <Text
              size="2"
              style={{
                fontWeight: 600,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.semantic.component.xs,
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.semantic.component.xs,
              }}
            >
              <User size={12} />
              Participant
            </Text>
            
            <Box
              style={{
                background: theme.colors.background.secondary,
                borderRadius: theme.borders.radius.md,
                padding: theme.spacing.semantic.component.md,
              }}
            >
              <Text
                size="2"
                style={{
                  fontWeight: 500,
                  color: theme.colors.text.primary,
                  marginBottom: "4px",
                }}
              >
                {annotation.participantId}
              </Text>
              
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  fontSize: "10px",
                  fontFamily: "monospace",
                }}
              >
                {annotation.participantAddress}
              </Text>
              
              <Flex align="center" gap="2" style={{ marginTop: "8px" }}>
                <Calendar size={10} style={{ color: theme.colors.text.tertiary }} />
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.tertiary,
                    fontSize: "10px",
                  }}
                >
                  {annotation.submittedAt.toLocaleString()}
                </Text>
              </Flex>
            </Box>
          </Box>

          {/* Annotation Content */}
          <Box>
            <Text
              size="2"
              style={{
                fontWeight: 600,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.semantic.component.xs,
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.semantic.component.xs,
              }}
            >
              <Info size={12} />
              Content
            </Text>
            
            {getAnnotationContent().map((section, index) => (
              <Box
                key={index}
                style={{
                  background: theme.colors.background.secondary,
                  borderRadius: theme.borders.radius.md,
                  padding: theme.spacing.semantic.component.md,
                  marginBottom: theme.spacing.semantic.component.xs,
                  border: `1px solid ${section.color}20`,
                }}
              >
                <Text
                  size="2"
                  style={{
                    fontWeight: 600,
                    color: section.color,
                    marginBottom: "6px",
                  }}
                >
                  {section.type}
                </Text>
                
                {section.items.map((item, itemIndex) => (
                  <Text
                    key={itemIndex}
                    size="1"
                    style={{
                      color: theme.colors.text.primary,
                      display: "block",
                      marginBottom: "2px",
                      fontSize: "11px",
                    }}
                  >
                    • {item}
                  </Text>
                ))}
              </Box>
            ))}
          </Box>

          {/* Validation History */}
          {validationActions.length > 0 && (
            <Box>
              <Text
                size="2"
                style={{
                  fontWeight: 600,
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing.semantic.component.xs,
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.semantic.component.xs,
                }}
              >
                <Clock size={12} />
                Validation History
              </Text>
              
              {validationActions.map((validation, index) => (
                <Box
                  key={index}
                  style={{
                    background: theme.colors.background.secondary,
                    borderRadius: theme.borders.radius.md,
                    padding: theme.spacing.semantic.component.sm,
                    marginBottom: theme.spacing.semantic.component.xs,
                    border: `1px solid ${
                      validation.action === 'approve' ? theme.colors.status.success :
                      validation.action === 'reject' ? theme.colors.status.error :
                      theme.colors.status.warning
                    }30`,
                  }}
                >
                  <Flex align="center" gap="2" style={{ marginBottom: "4px" }}>
                    {validation.action === 'approve' && (
                      <CheckCircle size={12} style={{ color: theme.colors.status.success }} />
                    )}
                    {validation.action === 'reject' && (
                      <XCircle size={12} style={{ color: theme.colors.status.error }} />
                    )}
                    {validation.action === 'flag' && (
                      <Flag size={12} style={{ color: theme.colors.status.warning }} />
                    )}
                    
                    <Text
                      size="1"
                      style={{
                        fontWeight: 600,
                        color: theme.colors.text.primary,
                        textTransform: "capitalize",
                      }}
                    >
                      {validation.action}d
                    </Text>
                    
                    <Text
                      size="1"
                      style={{
                        color: theme.colors.text.tertiary,
                        fontSize: "10px",
                      }}
                    >
                      {validation.timestamp.toLocaleTimeString()}
                    </Text>
                  </Flex>
                  
                  {validation.reason && (
                    <Text
                      size="1"
                      style={{
                        color: theme.colors.text.secondary,
                        fontSize: "10px",
                        fontStyle: "italic",
                      }}
                    >
                      "{validation.reason}"
                    </Text>
                  )}
                </Box>
              ))}
            </Box>
          )}

          {/* Validation Progress */}
          <Box>
            <Text
              size="2"
              style={{
                fontWeight: 600,
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.semantic.component.xs,
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.semantic.component.xs,
              }}
            >
              <TrendUp size={12} />
              Validation Progress
            </Text>
            
            <Box
              style={{
                background: theme.colors.background.secondary,
                borderRadius: theme.borders.radius.md,
                padding: theme.spacing.semantic.component.md,
              }}
            >
              <Flex align="center" justify="between" style={{ marginBottom: "8px" }}>
                <Text
                  size="2"
                  style={{
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                  }}
                >
                  {annotation.validationCount} / {annotation.requiredValidations}
                </Text>
                
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.tertiary,
                  }}
                >
                  validations
                </Text>
              </Flex>
              
              <Box
                style={{
                  width: "100%",
                  height: "6px",
                  background: theme.colors.background.primary,
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <Box
                  style={{
                    height: "100%",
                    width: `${(annotation.validationCount / annotation.requiredValidations) * 100}%`,
                    background: `linear-gradient(90deg, ${theme.colors.interactive.primary}, ${theme.colors.status.success})`,
                    borderRadius: "3px",
                    transition: "width 0.3s ease",
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Flex>
      </Box>

      {/* Action Buttons */}
      <Box
        style={{
          padding: theme.spacing.semantic.component.md,
          borderTop: `1px solid ${theme.colors.border.primary}`,
          background: theme.colors.background.secondary,
        }}
      >
        <Flex direction="column" gap="3">
          {showReasonInput && (
            <Box>
              <Text
                size="1"
                style={{
                  color: theme.colors.text.secondary,
                  marginBottom: "4px",
                  fontWeight: 500,
                }}
              >
                Rejection reason:
              </Text>
              <input
                type="text"
                placeholder="Enter reason for rejection..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                style={{
                  width: "100%",
                  padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.md,
                  background: theme.colors.background.primary,
                  color: theme.colors.text.primary,
                  fontSize: "12px",
                  outline: "none",
                }}
                autoFocus
              />
            </Box>
          )}
          
          {!lastValidation ? (
            <Flex gap="2">
              <Button
                onClick={() => handleValidation('approve')}
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.status.success}, ${theme.colors.status.success}E0)`,
                  color: theme.colors.text.inverse,
                  border: "none",
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flex: 1,
                }}
              >
                <CheckCircle size={14} />
                Approve
              </Button>
              
              <Button
                onClick={() => handleValidation('reject')}
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.status.error}, ${theme.colors.status.error}E0)`,
                  color: theme.colors.text.inverse,
                  border: "none",
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flex: 1,
                }}
              >
                <XCircle size={14} />
                Reject
              </Button>
              
              <Button
                onClick={() => handleValidation('flag')}
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.status.warning}, ${theme.colors.status.warning}E0)`,
                  color: theme.colors.text.inverse,
                  border: "none",
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Flag size={14} />
                Flag
              </Button>
            </Flex>
          ) : (
            <Box
              style={{
                background: theme.colors.background.primary,
                borderRadius: theme.borders.radius.md,
                padding: theme.spacing.semantic.component.md,
                textAlign: "center",
              }}
            >
              <Text
                size="2"
                style={{
                  fontWeight: 600,
                  color: lastValidation.action === 'approve' ? theme.colors.status.success :
                        lastValidation.action === 'reject' ? theme.colors.status.error :
                        theme.colors.status.warning,
                }}
              >
                Already {lastValidation.action}d
              </Text>
              
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  marginTop: "4px",
                }}
              >
                You've already validated this annotation
              </Text>
            </Box>
          )}
        </Flex>
      </Box>
    </Box>
  );
} 