import React, { useRef, useState } from "react";
import { Box, Flex, Text, Button, Badge } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useAuth } from "@/shared/hooks/useAuth";
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
  Confetti,
  Copy,
  ClipboardText
} from "phosphor-react";

interface CertificateModalProps {
  userProgress: UserMissionProgress;
  isOpen: boolean;
  onClose: () => void;
}

// Certificate ID 생성 함수
const generateCertificateId = async (walletAddress: string): Promise<string> => {
  const prefix = "OG"; // OpenGraph prefix
  const input = `opengraph-${walletAddress}-certificate`;
  
  // Web Crypto API를 사용하여 해시 생성
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // 12자리로 제한하여 적절한 길이로 만들기
  return `${prefix}${hashHex.slice(0, 10).toUpperCase()}`;
};

export const CertificateModal: React.FC<CertificateModalProps> = ({
  userProgress,
  isOpen,
  onClose
}) => {
  const { theme } = useTheme();
  const { walletAddress } = useAuth();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [certificateId, setCertificateId] = useState<string>("");

  // Certificate ID 생성
  React.useEffect(() => {
    if (walletAddress) {
      generateCertificateId(walletAddress).then(setCertificateId);
    }
  }, [walletAddress]);

  // 현재 날짜 사용
  const currentDate = new Date();
  const issuedDate = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (!isOpen || !userProgress.certificate) return null;

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);

    try {
      // Create high-quality certificate image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set high-resolution canvas - 좌우 공백 줄이고 컴팩트한 크기
      const scale = 2;
      canvas.width = 650 * scale;
      canvas.height = 500 * scale;
      ctx.scale(scale, scale);

      // Background - match modal design
      const bgGradient = ctx.createLinearGradient(0, 0, 650, 500);
      bgGradient.addColorStop(0, '#0f0f23');
      bgGradient.addColorStop(0.3, '#1a1a2e');
      bgGradient.addColorStop(0.7, '#16213e');
      bgGradient.addColorStop(1, '#0f3460');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 650, 500);

      // Grid pattern overlay (더 섬세하게)
      ctx.strokeStyle = 'rgba(100, 255, 218, 0.06)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 650; i += 25) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 500);
        ctx.stroke();
      }
      for (let i = 0; i < 500; i += 25) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(650, i);
        ctx.stroke();
      }

      // 장식 요소들 (더 작고 효율적으로)
      ctx.fillStyle = 'rgba(100, 255, 218, 0.08)';
      ctx.beginPath();
      ctx.arc(550, 60, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(100, 255, 218, 0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = 'rgba(100, 255, 218, 0.04)';
      ctx.beginPath();
      ctx.arc(100, 420, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(100, 255, 218, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Trophy icon area (더 위쪽으로)
      ctx.fillStyle = 'rgba(100, 255, 218, 0.15)';
      ctx.beginPath();
      ctx.arc(325, 75, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#64ffda';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Trophy symbol
      ctx.fillStyle = '#64ffda';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🏆', 325, 83);

      // Main title (트로피와 간격 늘리기)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CERTIFICATE', 325, 140);

      // Subtitle
      ctx.font = '16px "Inter", sans-serif';
      ctx.fillStyle = '#64ffda';
      ctx.fillText('Data Annotation Specialist', 325, 165);

      // Achievement text (더 컴팩트하게)
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px "Inter", sans-serif';
      ctx.fillText('Successfully completed', 325, 200);
      ctx.font = 'bold 14px "Inter", sans-serif';
      ctx.fillText('OpenGraph Physical AI Training', 325, 220);

      // Completion stats
      ctx.fillStyle = '#64ffda';
      ctx.font = '13px "Inter", sans-serif';
      const completedMissions = userProgress.missions.filter(m => m.status === "completed").length;
      const totalMissions = userProgress.missions.length;
      ctx.fillText(`✓ ${completedMissions}/${totalMissions} Missions Completed`, 325, 250);

      // Tech badges section (더 작게)
      ctx.fillStyle = 'rgba(100, 255, 218, 0.08)';
      ctx.fillRect(150, 270, 350, 45);
      ctx.strokeStyle = '#64ffda';
      ctx.lineWidth = 1;
      ctx.strokeRect(150, 270, 350, 45);

      ctx.fillStyle = '#64ffda';
      ctx.font = 'bold 11px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('POWERED BY SUI & WALRUS', 325, 290);
      ctx.font = '10px "Inter", sans-serif';
      ctx.fillText('Decentralized AI Infrastructure', 325, 305);

      // Certificate ID and date (더 아래쪽으로)
      ctx.fillStyle = '#888888';
      ctx.font = '11px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Certificate ID: ${certificateId}`, 325, 350);
      ctx.fillText(`Issued: ${issuedDate}`, 325, 368);

      // OpenGraph signature (더 아래쪽으로)
      ctx.strokeStyle = '#64ffda';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(225, 400);
      ctx.lineTo(425, 400);
      ctx.stroke();
      
      ctx.fillStyle = '#64ffda';
      ctx.font = 'bold 10px "Inter", sans-serif';
      ctx.fillText('OPENGRAPH', 325, 415);

      // Download the certificate
      const link = document.createElement('a');
      link.download = `opengraph-certificate-${certificateId}.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('Failed to generate certificate:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const copyCertificate = async () => {
    if (!certificateRef.current) return;
    setIsCopying(true);

    try {
      // Create certificate image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set high-resolution canvas - 좌우 공백 줄이고 컴팩트한 크기
      const scale = 2;
      canvas.width = 650 * scale;
      canvas.height = 500 * scale;
      ctx.scale(scale, scale);

      // Background - match modal design
      const bgGradient = ctx.createLinearGradient(0, 0, 650, 500);
      bgGradient.addColorStop(0, '#0f0f23');
      bgGradient.addColorStop(0.3, '#1a1a2e');
      bgGradient.addColorStop(0.7, '#16213e');
      bgGradient.addColorStop(1, '#0f3460');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 650, 500);

      // Grid pattern overlay (더 섬세하게)
      ctx.strokeStyle = 'rgba(100, 255, 218, 0.06)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 650; i += 25) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 500);
        ctx.stroke();
      }
      for (let i = 0; i < 500; i += 25) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(650, i);
        ctx.stroke();
      }

      // 장식 요소들 (더 작고 효율적으로)
      ctx.fillStyle = 'rgba(100, 255, 218, 0.08)';
      ctx.beginPath();
      ctx.arc(550, 60, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(100, 255, 218, 0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = 'rgba(100, 255, 218, 0.04)';
      ctx.beginPath();
      ctx.arc(100, 420, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(100, 255, 218, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Trophy icon area (더 위쪽으로)
      ctx.fillStyle = 'rgba(100, 255, 218, 0.15)';
      ctx.beginPath();
      ctx.arc(325, 75, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#64ffda';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Trophy symbol
      ctx.fillStyle = '#64ffda';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🏆', 325, 83);

      // Main title (트로피와 간격 늘리기)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CERTIFICATE', 325, 140);

      // Subtitle
      ctx.font = '16px "Inter", sans-serif';
      ctx.fillStyle = '#64ffda';
      ctx.fillText('Data Annotation Specialist', 325, 165);

      // Achievement text (더 컴팩트하게)
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px "Inter", sans-serif';
      ctx.fillText('Successfully completed', 325, 200);
      ctx.font = 'bold 14px "Inter", sans-serif';
      ctx.fillText('OpenGraph Physical AI Training', 325, 220);

      // Completion stats
      ctx.fillStyle = '#64ffda';
      ctx.font = '13px "Inter", sans-serif';
      const completedMissions = userProgress.missions.filter(m => m.status === "completed").length;
      const totalMissions = userProgress.missions.length;
      ctx.fillText(`✓ ${completedMissions}/${totalMissions} Missions Completed`, 325, 250);

      // Tech badges section (더 작게)
      ctx.fillStyle = 'rgba(100, 255, 218, 0.08)';
      ctx.fillRect(150, 270, 350, 45);
      ctx.strokeStyle = '#64ffda';
      ctx.lineWidth = 1;
      ctx.strokeRect(150, 270, 350, 45);

      ctx.fillStyle = '#64ffda';
      ctx.font = 'bold 11px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('POWERED BY SUI & WALRUS', 325, 290);
      ctx.font = '10px "Inter", sans-serif';
      ctx.fillText('Decentralized AI Infrastructure', 325, 305);

      // Certificate ID and date (더 아래쪽으로)
      ctx.fillStyle = '#888888';
      ctx.font = '11px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`Certificate ID: ${certificateId}`, 325, 350);
      ctx.fillText(`Issued: ${issuedDate}`, 325, 368);

      // OpenGraph signature (더 아래쪽으로)
      ctx.strokeStyle = '#64ffda';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(225, 400);
      ctx.lineTo(425, 400);
      ctx.stroke();
      
      ctx.fillStyle = '#64ffda';
      ctx.font = 'bold 10px "Inter", sans-serif';
      ctx.fillText('OPENGRAPH', 325, 415);

      // Copy to clipboard
      canvas.toBlob(async (blob) => {
        if (blob && navigator.clipboard) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                'image/png': blob
              })
            ]);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
          } catch (error) {
            console.error('Failed to copy certificate:', error);
          }
        }
      }, 'image/png', 1.0);

    } catch (error) {
      console.error('Failed to generate certificate for copying:', error);
    } finally {
      setIsCopying(false);
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(
      `🏆 Earned OpenGraph AI Data Certification!\n\n` +
      `Completed Physical AI training on @SuiNetwork & @WalrusProtocol 🤖\n\n` +
      `@OpenGraph_Labs #PhysicalAI #Web3AI`
    );
    const url = encodeURIComponent('https://explorer.opengraphlabs.xyz/challenges');
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
            marginBottom: theme.spacing.semantic.layout.sm,
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
                as="p"
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
                as="p"
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
            as="p"
            size="4"
            style={{
              fontWeight: 800,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.semantic.component.md,
              background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, #64ffda)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            OpenGraph Certificate of Achievement
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
                as="p"
                size="2"
                style={{
                  fontWeight: 700,
                  color: theme.colors.text.primary,
                }}
              >
                Achievements
              </Text>
            </Flex>
            
            <Flex direction="column" gap="3">
              {userProgress.missions.map(mission => (
                <Flex key={mission.id} align="center" gap="3" justify="center">
                  <CheckCircle size={18} style={{ color: theme.colors.status.success }} />
                  <Text as="p" size="2" style={{ color: theme.colors.text.primary, fontWeight: 600 }}>
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
              <Text as="p" size="1" style={{ color: theme.colors.text.tertiary, fontWeight: 600 }}>
                ISSUED DATE
              </Text>
              <Text as="p" size="2" style={{ color: theme.colors.text.primary, fontWeight: 700 }}>
                {issuedDate}
              </Text>
            </Box>
            <Box style={{ textAlign: "center" }}>
              <Text as="p" size="1" style={{ color: theme.colors.text.tertiary, fontWeight: 600 }}>
                CERTIFICATE ID
              </Text>
              <Text as="p" size="2" style={{ color: theme.colors.text.primary, fontWeight: 700, fontFamily: "monospace" }}>
                {certificateId}
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
            {isDownloading ? "Generating..." : "Download"}
          </Button>

          <Button
            onClick={copyCertificate}
            disabled={isCopying}
            style={{
              background: copySuccess ? "#22c55e" : `linear-gradient(135deg, ${theme.colors.interactive.primary}, #64ffda)`,
              color: "#0f0f23",
              border: "none",
              borderRadius: theme.borders.radius.md,
              padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
              fontWeight: 700,
              fontSize: "14px",
              cursor: isCopying ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              opacity: isCopying ? 0.7 : 1,
              boxShadow: copySuccess ? "0 4px 12px rgba(34, 197, 94, 0.3)" : "0 4px 12px rgba(100, 255, 218, 0.3)",
              transition: "all 0.3s ease",
            }}
          >
            {copySuccess ? <CheckCircle size={16} /> : <Copy size={16} />}
            {isCopying ? "Copying..." : copySuccess ? "Copied!" : "Copy Image"}
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
            Share on Twitter
          </Button>
        </Flex>

        {/* User Nudge for Twitter */}
        {copySuccess && (
          <Box
            style={{
              background: `linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(100, 255, 218, 0.1))`,
              borderRadius: theme.borders.radius.md,
              padding: theme.spacing.semantic.component.md,
              marginBottom: theme.spacing.semantic.component.lg,
              border: "1px solid rgba(34, 197, 94, 0.3)",
              textAlign: "center",
              animation: "fadeIn 0.5s ease-in",
            }}
          >
            <Flex align="center" justify="center" gap="2" style={{ marginBottom: theme.spacing.semantic.component.xs }}>
              <ClipboardText size={18} style={{ color: "#22c55e" }} />
              <Text as="p" size="2" style={{ color: theme.colors.text.primary, fontWeight: 600 }}>
                Certificate copied to clipboard!
              </Text>
            </Flex>
            <Text as="p" size="1" style={{ color: theme.colors.text.secondary, lineHeight: 1.4 }}>
              Now you can paste it directly into your Twitter post to show off your achievement! 🎉
            </Text>
          </Box>
        )}

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
          @keyframes fadeIn {
            0% {
              opacity: 0;
              transform: translateY(10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Box>
  );
}; 