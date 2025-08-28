import { Box, Flex, Text, Heading } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import { Trophy, Image, CheckCircle, Clock, XCircle, TrendUp, Target, Star } from "phosphor-react";
import { useProfilePageContext } from "@/contexts/ProfilePageContextProvider";
import { useMobile } from "@/shared/hooks";

export function ProfileActivityStats() {
  const { theme } = useTheme();
  const { userProfile } = useProfilePageContext();
  const { isMobile, isTablet } = useMobile();

  const approvalRate = userProfile?.approvalRate || 0;
  const totalSubmitted = userProfile?.imagesSubmitted || 0;
  const totalApproved = userProfile?.imagesApproved || 0;
  const totalPending = userProfile?.imagesPending || 0;
  const totalRejected = userProfile?.imagesRejected || 0;
  const totalPoints = userProfile?.totalPoints || 0;

  const statCards = [
    {
      title: "Total Points",
      value: totalPoints.toLocaleString(),
      icon: Trophy,
      description: "Rewards earned",
      color: "#4f46e5",
      bgColor: "#4f46e506",
    },
    {
      title: "Approval Rate",
      value: `${approvalRate.toFixed(1)}%`,
      icon: TrendUp,
      description: "Success rate",
      color: approvalRate >= 80 ? "#059669" : approvalRate >= 60 ? "#d97706" : "#dc2626",
      bgColor: approvalRate >= 80 ? "#05966906" : approvalRate >= 60 ? "#d9770606" : "#dc262606",
    },
    {
      title: "Submitted",
      value: totalSubmitted.toString(),
      icon: Image,
      description: "Contributions",
      color: "#6366f1",
      bgColor: "#6366f106",
    },
    {
      title: "Approved",
      value: totalApproved.toString(),
      icon: CheckCircle,
      description: "Verified",
      color: "#059669",
      bgColor: "#05966906",
    },
    {
      title: "Pending",
      value: totalPending.toString(),
      icon: Clock,
      description: "In review",
      color: "#d97706",
      bgColor: "#d9770606",
    },
    {
      title: "Rejected",
      value: totalRejected.toString(),
      icon: XCircle,
      description: "To improve",
      color: "#dc2626",
      bgColor: "#dc262606",
    },
  ];

  return (
    <Box>
      {/* Main Stats Grid - Responsive */}
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "repeat(2, 1fr)"
            : isTablet
              ? "repeat(2, 1fr)"
              : "repeat(3, 1fr)",
          gap: isMobile ? theme.spacing.semantic.component.xs : theme.spacing.semantic.component.sm,
          marginBottom: theme.spacing.semantic.layout.md,
          width: "100%",
        }}
      >
        {statCards.map(stat => {
          const IconComponent = stat.icon;

          return (
            <Card
              key={stat.title}
              style={{
                padding: isMobile
                  ? theme.spacing.semantic.component.sm
                  : theme.spacing.semantic.component.md,
                background: stat.bgColor,
                border: `1px solid ${stat.color}15`,
                position: "relative",
                overflow: "hidden",
                transition: "all 0.2s ease",
              }}
              className="hover:shadow-sm"
            >
              <Flex align="start" justify="between" gap={isMobile ? "2" : "3"}>
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    as="p"
                    size="1"
                    style={{
                      color: theme.colors.text.tertiary,
                      fontSize: isMobile ? "9px" : "10px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "4px",
                    }}
                  >
                    {stat.title}
                  </Text>

                  <Text
                    as="p"
                    size={isMobile ? "4" : "5"}
                    style={{
                      fontWeight: 700,
                      color: stat.color,
                      marginBottom: "2px",
                      fontSize: isMobile ? "18px" : "22px",
                      lineHeight: "1.2",
                    }}
                  >
                    {stat.value}
                  </Text>

                  <Text
                    as="p"
                    size="1"
                    style={{
                      color: theme.colors.text.secondary,
                      fontWeight: 400,
                      fontSize: isMobile ? "10px" : "11px",
                    }}
                  >
                    {stat.description}
                  </Text>
                </Box>

                <Box
                  style={{
                    width: isMobile ? "28px" : "32px",
                    height: isMobile ? "28px" : "32px",
                    borderRadius: theme.borders.radius.sm,
                    background: `${stat.color}12`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <IconComponent size={isMobile ? 14 : 16} color={stat.color} weight="bold" />
                </Box>
              </Flex>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
