import React, { useRef, useState } from "react";
import { Box, Flex, Text, Button, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { UserMissionProgress } from "../types/mission";
import { 
  Trophy, 
  Download, 
  TwitterLogo, 
  CheckCircle,
  Star,
  Sparkle,
  Lightning,
  Database,
  Globe,
  Shield,
  Confetti
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
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !userProgress.certificate) return null;

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);

    try {
      // Create high-quality certificate image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set high-resolution canvas
      const scale = 2;
      canvas.width = 1200 * scale;
      canvas.height = 800 * scale;
      ctx.scale(scale, scale);

      // Background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 1200, 800);
      bgGradient.addColorStop(0, '#0f0f23');
      bgGradient.addColorStop(0.3, '#1a1a2e');
      bgGradient.addColorStop(0.7, '#16213e');
      bgGradient.addColorStop(1, '#0f3460');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 1200, 800);

      // Grid pattern overlay
      ctx.strokeStyle = 'rgba(100, 255, 218, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 1200; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 800);
        ctx.stroke();
      }
      for (let i = 0; i < 800; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(1200, i);
        ctx.stroke();
      }

      // Header section
      const headerGradient = ctx.createLinearGradient(0, 0, 1200, 200);
      headerGradient.addColorStop(0, '#64ffda');
      headerGradient.addColorStop(1, '#1de9b6');
      ctx.fillStyle = headerGradient;
      ctx.fillRect(0, 0, 1200, 200);

      // OpenGraph logo area
      ctx.fillStyle = '#0f0f23';
      ctx.font = 'bold 42px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OPENGRAPH', 600, 60);
      
      ctx.font = '18px "Inter", sans-serif';
      ctx.fillText('PHYSICAL AI DATA INFRASTRUCTURE', 600, 90);

      // Decorative elements
      ctx.fillStyle = 'rgba(15, 15, 35, 0.3)';
      ctx.beginPath();
      ctx.arc(100, 100, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(1100, 100, 25, 0, Math.PI * 2);
      ctx.fill();

      // Certificate title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CERTIFICATE OF ACHIEVEMENT', 600, 280);

      // Subtitle
      ctx.font = '24px "Inter", sans-serif';
      ctx.fillStyle = '#64ffda';
      ctx.fillText('Data Annotation Specialist', 600, 320);

      // Main content
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px "Inter", sans-serif';
      ctx.fillText('This is to certify that', 600, 380);

      ctx.font = 'bold 28px "Inter", sans-serif';
      ctx.fillText('ANNOTATION SPECIALIST', 600, 420);

      ctx.font = '18px "Inter", sans-serif';
      ctx.fillText('has successfully completed the comprehensive', 600, 460);
      ctx.fillText('OpenGraph Physical AI Data Annotation Program', 600, 485);

      // Achievements section
      ctx.fillStyle = '#64ffda';
      ctx.font = 'bold 16px "Inter", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('✓ Mastered Sea Animal Classification (10 annotations)', 200, 550);
      ctx.fillText('✓ Completed Urban Traffic Bounding Box Detection (3 annotations)', 200, 580);
      ctx.fillText('✓ Demonstrated proficiency in AI dataset preparation', 200, 610);
      ctx.fillText('✓ Contributed to Physical AI training data quality', 200, 640);

      // Technology badges
      ctx.fillStyle = 'rgba(100, 255, 218, 0.2)';
      ctx.fillRect(850, 530, 300, 120);
      ctx.strokeStyle = '#64ffda';
      ctx.lineWidth = 2;
      ctx.strokeRect(850, 530, 300, 120);

      ctx.fillStyle = '#64ffda';
      ctx.font = 'bold 14px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('POWERED BY', 1000, 555);
      ctx.font = 'bold 16px "Inter", sans-serif';
      ctx.fillText('SUI BLOCKCHAIN', 1000, 580);
      ctx.fillText('WALRUS STORAGE', 1000, 605);
      ctx.fillText('DECENTRALIZED AI', 1000, 630);

      // Footer
      ctx.fillStyle = '#888888';
      ctx.font = '14px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Certificate ID: ${userProgress.certificate.id}`, 600, 720);
      ctx.fillText(`Issued: ${userProgress.certificate.issuedAt.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, 600, 745);

      // Signature line
      ctx.strokeStyle = '#64ffda';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(450, 770);
      ctx.lineTo(750, 770);
      ctx.stroke();
      
      ctx.fillStyle = '#64ffda';
      ctx.font = '12px "Inter", sans-serif';
      ctx.fillText('OpenGraph Foundation', 600, 785);

      // Download the certificate
      const link = document.createElement('a');
      link.download = `opengraph-certificate-${userProgress.certificate.id}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('Failed to generate certificate:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(
      `🎯 Just earned my OpenGraph Data Annotation Specialist Certificate! 🏆\n\n` +
      `🤖 Mastered AI dataset preparation for Physical AI systems\n` +
      `🔗 Powered by Sui blockchain & Walrus decentralized storage\n` +
      `🌐 Contributing to the future of real-world AI applications\n\n` +
      `Ready to shape the next generation of Physical AI! 🚀\n\n` +
      `#OpenGraph #PhysicalAI #DataAnnotation #SuiBlockchain #WalrusStorage #Web3AI #MachineLearning #DecentralizedAI`
    );
    const url = encodeURIComponent(userProgress.certificate.shareableUrl || 'https://opengraph.io/certificate');
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
        background: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: theme.spacing.semantic.layout.lg,
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      {/* Celebration Animation */}
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {/* Animated sparkles */}
        {[...Array(20)].map((_, i) => (
          <Box
            key={i}
            style={{
              position: "absolute",
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: "4px",
              height: "4px",
              background: "#64ffda",
              borderRadius: "50%",
              animation: `sparkle 3s infinite ${Math.random() * 2}s`,
              boxShadow: "0 0 6px #64ffda",
            }}
          />
        ))}
      </Box>

      <Box
        ref={certificateRef}
        onClick={e => e.stopPropagation()}
        style={{
          background: theme.colors.background.card,
          borderRadius: theme.borders.radius.xl,
          padding: theme.spacing.semantic.layout.lg,
          maxWidth: "700px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          border: `1px solid ${theme.colors.border.primary}`,
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.3)",
          position: "relative",
        }}
      >
        {/* Header */}
        <Flex
          direction="column"
          align="center"
          style={{
            background: `linear-gradient(135deg, #0f0f23 0%, #1a1a2e 30%, #16213e 70%, #0f3460 100%)`,
            borderRadius: theme.borders.radius.lg,
            padding: theme.spacing.semantic.layout.lg,
            marginBottom: theme.spacing.semantic.layout.lg,
            position: "relative",
            overflow: "hidden",
            border: "2px solid #64ffda",
          }}
        >
          {/* Grid pattern overlay */}
          <Box
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              backgroundImage: `
                linear-gradient(#64ffda 1px, transparent 1px),
                linear-gradient(90deg, #64ffda 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
          />

          {/* Decorative elements */}
          <Box
            style={{
              position: "absolute",
              top: -15,
              right: -15,
              width: "60px",
              height: "60px",
              background: "rgba(100, 255, 218, 0.1)",
              borderRadius: "50%",
              border: "2px solid rgba(100, 255, 218, 0.3)",
            }}
          />
          <Box
            style={{
              position: "absolute",
              bottom: -20,
              left: -20,
              width: "80px",
              height: "80px",
              background: "rgba(100, 255, 218, 0.05)",
              borderRadius: "50%",
              border: "2px solid rgba(100, 255, 218, 0.2)",
            }}
          />

          <Flex align="center" gap="4" style={{ marginBottom: theme.spacing.semantic.component.md, zIndex: 1 }}>
            <Box
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(100, 255, 218, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "3px solid #64ffda",
                boxShadow: "0 0 20px rgba(100, 255, 218, 0.5)",
              }}
            >
              <Trophy size={40} style={{ color: "#64ffda" }} />
            </Box>
            <Box>
              <Text
                size="5"
                style={{
                  fontWeight: 800,
                  color: "#ffffff",
                  marginBottom: theme.spacing.semantic.component.xs,
                  textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                }}
              >
                Congratulations!
              </Text>
              <Text
                size="3"
                style={{
                  color: "#64ffda",
                  fontWeight: 600,
                }}
              >
                Physical AI Data Specialist
              </Text>
            </Box>
          </Flex>

          {/* Technology badges */}
          <Flex gap="3" style={{ zIndex: 1 }}>
            <Flex align="center" gap="1" style={{
              background: "rgba(100, 255, 218, 0.1)",
              padding: "6px 12px",
              borderRadius: theme.borders.radius.full,
              border: "1px solid rgba(100, 255, 218, 0.3)",
            }}>
              <Database size={14} style={{ color: "#64ffda" }} />
              <Text size="1" style={{ color: "#64ffda", fontWeight: 600 }}>
                SUI
              </Text>
            </Flex>
            <Flex align="center" gap="1" style={{
              background: "rgba(100, 255, 218, 0.1)",
              padding: "6px 12px",
              borderRadius: theme.borders.radius.full,
              border: "1px solid rgba(100, 255, 218, 0.3)",
            }}>
              <Globe size={14} style={{ color: "#64ffda" }} />
              <Text size="1" style={{ color: "#64ffda", fontWeight: 600 }}>
                WALRUS
              </Text>
            </Flex>
            <Flex align="center" gap="1" style={{
              background: "rgba(100, 255, 218, 0.1)",
              padding: "6px 12px",
              borderRadius: theme.borders.radius.full,
              border: "1px solid rgba(100, 255, 218, 0.3)",
            }}>
              <Shield size={14} style={{ color: "#64ffda" }} />
              <Text size="1" style={{ color: "#64ffda", fontWeight: 600 }}>
                WEB3
              </Text>
            </Flex>
          </Flex>
        </Flex>

        {/* Certificate Content */}
        <Box style={{ textAlign: "center", marginBottom: theme.spacing.semantic.layout.lg }}>
          <Text
            size="4"
            style={{
              fontWeight: 800,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.semantic.component.sm,
              background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, #64ffda)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            OpenGraph Certificate of Achievement
          </Text>
          
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              lineHeight: 1.7,
              marginBottom: theme.spacing.semantic.component.lg,
              maxWidth: "500px",
              margin: "0 auto",
            }}
          >
            This certificate validates the successful completion of the OpenGraph Physical AI Data Annotation Program, 
            demonstrating expertise in preparing high-quality training datasets for real-world AI systems powered by 
            decentralized blockchain infrastructure.
          </Text>

          {/* Achievements */}
          <Box
            style={{
              background: `linear-gradient(135deg, ${theme.colors.background.secondary}, rgba(100, 255, 218, 0.05))`,
              borderRadius: theme.borders.radius.lg,
              padding: theme.spacing.semantic.component.lg,
              marginBottom: theme.spacing.semantic.component.lg,
              border: `1px solid rgba(100, 255, 218, 0.2)`,
            }}
          >
            <Flex align="center" justify="center" gap="2" style={{ marginBottom: theme.spacing.semantic.component.md }}>
              <Lightning size={18} style={{ color: "#64ffda" }} />
              <Text
                size="2"
                style={{
                  fontWeight: 700,
                  color: theme.colors.text.primary,
                }}
              >
                Completed Specializations
              </Text>
            </Flex>
            
            <Flex direction="column" gap="3">
              {userProgress.missions.map(mission => (
                <Flex key={mission.id} align="center" gap="3" justify="center">
                  <CheckCircle size={18} style={{ color: theme.colors.status.success }} />
                  <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 600 }}>
                    {mission.title}
                  </Text>
                  <Badge style={{
                    background: `${theme.colors.status.success}15`,
                    color: theme.colors.status.success,
                    padding: "2px 8px",
                    borderRadius: theme.borders.radius.full,
                    fontSize: "11px",
                    fontWeight: 600,
                  }}>
                    {mission.completedCount}/{mission.requiredCount}
                  </Badge>
                </Flex>
              ))}
            </Flex>
          </Box>

          {/* Certificate Details */}
          <Flex justify="center" gap="6" style={{ marginBottom: theme.spacing.semantic.component.lg }}>
            <Box style={{ textAlign: "center" }}>
              <Text size="1" style={{ color: theme.colors.text.tertiary, fontWeight: 600 }}>
                ISSUED DATE
              </Text>
              <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 700 }}>
                {userProgress.certificate.issuedAt.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </Box>
            <Box style={{ textAlign: "center" }}>
              <Text size="1" style={{ color: theme.colors.text.tertiary, fontWeight: 600 }}>
                CERTIFICATE ID
              </Text>
              <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 700, fontFamily: "monospace" }}>
                {userProgress.certificate.id}
              </Text>
            </Box>
          </Flex>
        </Box>

        {/* Action Buttons */}
        <Flex gap="3" justify="center" style={{ marginBottom: theme.spacing.semantic.component.lg }}>
          <Button
            onClick={downloadCertificate}
            disabled={isDownloading}
            style={{
              background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, #64ffda)`,
              color: "#0f0f23",
              border: "none",
              borderRadius: theme.borders.radius.md,
              padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
              fontWeight: 700,
              fontSize: "14px",
              cursor: isDownloading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              opacity: isDownloading ? 0.7 : 1,
              boxShadow: "0 4px 12px rgba(100, 255, 218, 0.3)",
            }}
          >
            <Download size={16} />
            {isDownloading ? "Generating..." : "Download Certificate"}
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
              boxShadow: "0 4px 12px rgba(29, 161, 242, 0.3)",
            }}
          >
            <TwitterLogo size={16} />
            Share Achievement
          </Button>
        </Flex>

        {/* Close Button */}
        <Flex justify="center">
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

      <style>
        {`
          @keyframes sparkle {
            0%, 100% {
              opacity: 0;
              transform: scale(0);
            }
            50% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </Box>
  );
}; 