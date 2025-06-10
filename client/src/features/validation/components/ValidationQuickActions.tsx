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
  CheckCircle,
  XCircle,
  Flag,
  ListChecks,
  Warning,
  Sparkle,
  Lightning,
} from "phosphor-react";
import { PendingAnnotation } from '../types/validation';

interface ValidationQuickActionsProps {
  selectedCount: number;
  currentImageAnnotations: PendingAnnotation[];
  onBulkValidation: (action: 'approve' | 'reject' | 'flag', reason?: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  className?: string;
}

export function ValidationQuickActions({
  selectedCount,
  currentImageAnnotations,
  onBulkValidation,
  onSelectAll,
  onClearSelection,
  className,
}: ValidationQuickActionsProps) {
  const { theme } = useTheme();
  const [showReasonInput, setShowReasonInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const highQualityCount = currentImageAnnotations.filter(a => a.qualityScore >= 0.8).length;
  const needsReviewCount = currentImageAnnotations.filter(a => a.qualityScore < 0.6).length;

  const handleQuickApprove = () => {
    onBulkValidation('approve');
  };

  const handleQuickReject = () => {
    if (showReasonInput && rejectionReason.trim()) {
      onBulkValidation('reject', rejectionReason);
      setRejectionReason('');
      setShowReasonInput(false);
    } else {
      setShowReasonInput(true);
    }
  };

  const handleQuickFlag = () => {
    onBulkValidation('flag', 'Flagged for additional review');
  };

  const handleSelectHighQuality = () => {
    // This would need to be implemented in the parent component
    // For now, we'll just select all
    onSelectAll();
  };

  if (currentImageAnnotations.length === 0) {
    return null;
  }

  return (
    <Box
      className={className}
      style={{
        background: `linear-gradient(135deg, ${theme.colors.background.card}, ${theme.colors.background.secondary})`,
        borderBottom: `1px solid ${theme.colors.border.primary}`,
        padding: theme.spacing.semantic.component.md,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <Flex direction="column" gap="3">
        {/* Quick Stats & Selection */}
        <Flex align="center" justify="between">
          <Flex align="center" gap="3">
            <Flex align="center" gap="2">
              <Lightning size={16} style={{ color: theme.colors.interactive.primary }} />
              <Text
                size="2"
                style={{
                  fontWeight: 600,
                  color: theme.colors.text.primary,
                }}
              >
                Quick Actions
              </Text>
            </Flex>
            
            <Flex align="center" gap="2">
              <Badge
                style={{
                  background: `${theme.colors.status.success}15`,
                  color: theme.colors.status.success,
                  fontSize: "10px",
                  fontWeight: 600,
                  padding: "3px 6px",
                  borderRadius: theme.borders.radius.full,
                  display: "flex",
                  alignItems: "center",
                  gap: "2px",
                }}
              >
                <Sparkle size={8} />
                {highQualityCount} High Quality
              </Badge>
              
              {needsReviewCount > 0 && (
                <Badge
                  style={{
                    background: `${theme.colors.status.warning}15`,
                    color: theme.colors.status.warning,
                    fontSize: "10px",
                    fontWeight: 600,
                    padding: "3px 6px",
                    borderRadius: theme.borders.radius.full,
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                  }}
                >
                  <Warning size={8} />
                  {needsReviewCount} Need Review
                </Badge>
              )}
            </Flex>
          </Flex>

          <Flex align="center" gap="2">
            {selectedCount > 0 ? (
              <Text
                size="1"
                style={{
                  color: theme.colors.text.secondary,
                  fontWeight: 500,
                }}
              >
                {selectedCount} selected
              </Text>
            ) : (
              <Button
                onClick={handleSelectHighQuality}
                style={{
                  background: "transparent",
                  color: theme.colors.text.secondary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  fontSize: "11px",
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <ListChecks size={12} />
                Select High Quality
              </Button>
            )}
          </Flex>
        </Flex>

        {/* Action Buttons */}
        {selectedCount > 0 && (
          <Flex direction="column" gap="2">
            <Flex gap="2">
              <Button
                onClick={handleQuickApprove}
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
                  boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.2s ease',
                }}

              >
                <CheckCircle size={14} weight="fill" />
                Approve {selectedCount}
              </Button>
              
              <Button
                onClick={handleQuickReject}
                style={{
                  background: showReasonInput 
                    ? `linear-gradient(135deg, ${theme.colors.status.warning}, ${theme.colors.status.warning}E0)`
                    : `linear-gradient(135deg, ${theme.colors.status.error}, ${theme.colors.status.error}E0)`,
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
                  boxShadow: showReasonInput 
                    ? '0 2px 6px rgba(245, 158, 11, 0.3)'
                    : '0 2px 6px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                <XCircle size={14} weight="fill" />
                {showReasonInput ? 'Submit Rejection' : `Reject ${selectedCount}`}
              </Button>
              
              <Button
                onClick={handleQuickFlag}
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
                  boxShadow: '0 2px 6px rgba(245, 158, 11, 0.3)',
                  transition: 'all 0.2s ease',
                }}
              >
                <Flag size={14} weight="fill" />
                Flag
              </Button>
            </Flex>

            {/* Rejection Reason Input */}
            {showReasonInput && (
              <Flex gap="2" align="center">
                <input
                  type="text"
                  placeholder="Enter rejection reason..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && rejectionReason.trim()) {
                      handleQuickReject();
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                    border: `2px solid ${theme.colors.status.warning}40`,
                    borderRadius: theme.borders.radius.md,
                    background: theme.colors.background.primary,
                    color: theme.colors.text.primary,
                    fontSize: "12px",
                    outline: "none",
                    transition: 'border-color 0.2s ease',
                  }}
                  autoFocus
                />
                <Button
                  onClick={() => {
                    setShowReasonInput(false);
                    setRejectionReason('');
                  }}
                  style={{
                    background: "transparent",
                    color: theme.colors.text.secondary,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borders.radius.md,
                    padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                    fontSize: "12px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </Button>
              </Flex>
            )}

            {/* Quick Actions Row */}
            <Flex gap="2">
              <Button
                onClick={onClearSelection}
                style={{
                  background: "transparent",
                  color: theme.colors.text.secondary,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  fontSize: "11px",
                  fontWeight: 500,
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                Clear Selection
              </Button>
              
              <Button
                onClick={onSelectAll}
                style={{
                  background: "transparent",
                  color: theme.colors.interactive.primary,
                  border: `1px solid ${theme.colors.interactive.primary}40`,
                  borderRadius: theme.borders.radius.sm,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  fontSize: "11px",
                  fontWeight: 500,
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                Select All
              </Button>
            </Flex>
          </Flex>
        )}
      </Flex>
    </Box>
  );
} 