import React, { useRef } from "react";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { UserMissionProgress } from "../types/mission";
import { 
  Trophy, 
  Download, 
  TwitterLogo, 
  CheckCircle,
  Star,
  Sparkle
} from "phosphor-react";

interface CertificateModalProps {
  userProgress: UserMissionProgress;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  userProgress,
  isOpen,
  onClose
}) => {
  const { theme } = useTheme();
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !userProgress.certificate) return null;

  const downloadCertificate = () => {
    if (!certificateRef.current) return;

    // Create a canvas to capture the certificate
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 100);

    // Draw title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('OpenGraph Data Annotator', canvas.width / 2, 60);

    // Draw certificate content
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Completion', canvas.width / 2, 150);

    ctx.font = '16px Arial';
    ctx.fillText('This is to certify that', canvas.width / 2, 200);
    ctx.font = 'bold 20px Arial';
    ctx.fillText('User has successfully completed', canvas.width / 2, 230);
    ctx.font = '16px Arial';
    ctx.fillText('the OpenGraph Data Annotation Training Program', canvas.width / 2, 260);

    // Draw completion date
    ctx.font = '14px Arial';
    ctx.fillText(`Issued on: ${userProgress.certificate.issuedAt.toLocaleDateString()}`, canvas.width / 2, 320);

    // Draw achievements
    ctx.font = 'bold 16px Arial';
    ctx.fillText('Achievements:', canvas.width / 2, 380);
    ctx.font = '14px Arial';
    ctx.fillText('✓ Completed 10 Label Annotations', canvas.width / 2, 410);
    ctx.fillText('✓ Completed 3 Bounding Box Annotations', canvas.width / 2, 430);

    // Download the canvas as image
    const link = document.createElement('a');
    link.download = 'opengraph-certificate.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(
      `🎉 I just completed the OpenGraph Data Annotation Training Program and earned my certificate! 🏆\n\n` +
      `Ready to contribute to the future of AI data infrastructure! 🚀\n\n` +
      `#OpenGraph #DataAnnotation #AI #Blockchain #Web3`
    );
    const url = encodeURIComponent(userProgress.certificate.shareableUrl || 'https://opengraph.io');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  return (
    <Box
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: theme.spacing.semantic.layout.lg,
      }}
      onClick={onClose}
    >
      <Box
        ref={certificateRef}
        onClick={e => e.stopPropagation()}
        style={{
          background: theme.colors.background.card,
          borderRadius: theme.borders.radius.xl,
          padding: theme.spacing.semantic.layout.lg,
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          border: `1px solid ${theme.colors.border.primary}`,
          boxShadow: theme.shadows.semantic.card.high,
        }}
      >
        {/* Header */}
        <Flex
          direction="column"
          align="center"
          style={{
            background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
            borderRadius: theme.borders.radius.lg,
            padding: theme.spacing.semantic.layout.lg,
            marginBottom: theme.spacing.semantic.layout.lg,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background decoration */}
          <Box
            style={{
              position: "absolute",
              top: -20,
              right: -20,
              width: "100px",
              height: "100px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
            }}
          />
          <Box
            style={{
              position: "absolute",
              bottom: -30,
              left: -30,
              width: "80px",
              height: "80px",
              background: "rgba(255, 255, 255, 0.1)",
              borderRadius: "50%",
            }}
          />

          <Flex align="center" gap="3" style={{ marginBottom: theme.spacing.semantic.component.md }}>
            <Box
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trophy size={32} style={{ color: "#ffffff" }} />
            </Box>
            <Box>
              <Text
                size="4"
                style={{
                  fontWeight: 700,
                  color: "#ffffff",
                  marginBottom: theme.spacing.semantic.component.xs,
                }}
              >
                Congratulations!
              </Text>
              <Text
                size="2"
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  fontWeight: 500,
                }}
              >
                You've completed all missions
              </Text>
            </Box>
          </Flex>
        </Flex>

        {/* Certificate Content */}
        <Box style={{ textAlign: "center", marginBottom: theme.spacing.semantic.layout.lg }}>
          <Text
            size="3"
            style={{
              fontWeight: 700,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.semantic.component.md,
            }}
          >
            OpenGraph Data Annotator Certificate
          </Text>
          
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              lineHeight: 1.6,
              marginBottom: theme.spacing.semantic.component.lg,
            }}
          >
            This certificate is awarded for successfully completing the OpenGraph Data Annotation Training Program, 
            demonstrating proficiency in label and bounding box annotation techniques for AI/ML datasets.
          </Text>

          {/* Achievements */}
          <Box
            style={{
              background: theme.colors.background.secondary,
              borderRadius: theme.borders.radius.lg,
              padding: theme.spacing.semantic.component.lg,
              marginBottom: theme.spacing.semantic.component.lg,
            }}
          >
            <Text
              size="2"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.md,
              }}
            >
              Achievements Earned
            </Text>
            
            <Flex direction="column" gap="2">
              {userProgress.missions.map(mission => (
                <Flex key={mission.id} align="center" gap="2" justify="center">
                  <CheckCircle size={16} style={{ color: theme.colors.status.success }} />
                  <Text size="2" style={{ color: theme.colors.text.secondary }}>
                    {mission.title} ({mission.completedCount}/{mission.requiredCount})
                  </Text>
                </Flex>
              ))}
            </Flex>
          </Box>

          {/* Certificate Details */}
          <Flex justify="center" gap="4" style={{ marginBottom: theme.spacing.semantic.component.lg }}>
            <Box style={{ textAlign: "center" }}>
              <Text size="1" style={{ color: theme.colors.text.tertiary, fontWeight: 600 }}>
                ISSUED DATE
              </Text>
              <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 600 }}>
                {userProgress.certificate.issuedAt.toLocaleDateString()}
              </Text>
            </Box>
            <Box style={{ textAlign: "center" }}>
              <Text size="1" style={{ color: theme.colors.text.tertiary, fontWeight: 600 }}>
                CERTIFICATE ID
              </Text>
              <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 600 }}>
                {userProgress.certificate.id}
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Action Buttons */}
        <Flex gap="3" justify="center">
          <Button
            onClick={downloadCertificate}
            style={{
              background: theme.colors.interactive.primary,
              color: theme.colors.text.inverse,
              border: "none",
              borderRadius: theme.borders.radius.md,
              padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
              fontWeight: 600,
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Download size={16} />
            Download Certificate
          </Button>
          
          <Button
            onClick={shareOnTwitter}
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
            }}
          >
            <TwitterLogo size={16} />
            Share on Twitter
          </Button>
        </Flex>

        {/* Close Button */}
        <Flex justify="center" style={{ marginTop: theme.spacing.semantic.component.lg }}>
          <Button
            onClick={onClose}
            style={{
              background: "transparent",
              color: theme.colors.text.secondary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.md,
              padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
              fontWeight: 500,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Close
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}; 