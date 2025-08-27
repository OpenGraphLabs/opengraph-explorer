import { Box, Flex, Text, Heading, Grid } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import { Trophy, Image, CheckCircle, Clock, XCircle, TrendUp, Target, Star } from "phosphor-react";
import { useProfilePageContext } from "@/contexts/ProfilePageContextProvider";

export function ProfileActivityStats() {
  const { theme } = useTheme();
  const { userProfile } = useProfilePageContext();

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
      color: "#f59e0b",
      bgColor: "#f59e0b15",
      borderColor: "#f59e0b30",
      description: "OpenGraph rewards earned",
    },
    {
      title: "Images Submitted",
      value: totalSubmitted.toString(),
      icon: Image,
      color: theme.colors.interactive.primary,
      bgColor: `${theme.colors.interactive.primary}15`,
      borderColor: `${theme.colors.interactive.primary}30`,
      description: "Total contributions made",
    },
    {
      title: "Approved Images",
      value: totalApproved.toString(),
      icon: CheckCircle,
      color: "#10b981",
      bgColor: "#10b98115",
      borderColor: "#10b98130",
      description: "Successfully verified",
    },
    {
      title: "Approval Rate",
      value: `${approvalRate.toFixed(1)}%`,
      icon: TrendUp,
      color: approvalRate >= 80 ? "#10b981" : approvalRate >= 60 ? "#f59e0b" : "#ef4444",
      bgColor: approvalRate >= 80 ? "#10b98115" : approvalRate >= 60 ? "#f59e0b15" : "#ef444415",
      borderColor:
        approvalRate >= 80 ? "#10b98130" : approvalRate >= 60 ? "#f59e0b30" : "#ef444430",
      description: "Quality success rate",
    },
    {
      title: "Pending Review",
      value: totalPending.toString(),
      icon: Clock,
      color: theme.colors.interactive.accent,
      bgColor: `${theme.colors.interactive.accent}15`,
      borderColor: `${theme.colors.interactive.accent}30`,
      description: "Awaiting verification",
    },
    {
      title: "Rejected Images",
      value: totalRejected.toString(),
      icon: XCircle,
      color: "#ef4444",
      bgColor: "#ef444415",
      borderColor: "#ef444430",
      description: "Needs improvement",
    },
  ];

  return (
    <Box>
      {/* Main Stats Grid */}
      <Grid
        columns="3"
        gap="4"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          marginBottom: theme.spacing.semantic.layout.md,
        }}
      >
        {statCards.map(stat => {
          const IconComponent = stat.icon;
          return (
            <Card
              key={stat.title}
              style={{
                padding: theme.spacing.semantic.component.lg,
                background: stat.bgColor,
                position: "relative",
                overflow: "hidden",
                transition: "all 0.2s ease",
              }}
              className="hover:scale-[1.02] hover:shadow-lg"
            >
              {/* Background Pattern */}
              <Box
                style={{
                  position: "absolute",
                  top: "-20px",
                  right: "-20px",
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: `${stat.color}10`,
                  zIndex: 0,
                }}
              />

              <Flex direction="column" style={{ position: "relative", zIndex: 1 }}>
                <Flex align="center" justify="between" style={{ marginBottom: "12px" }}>
                  <Box
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: `linear-gradient(135deg, ${stat.color}, ${stat.color}dd)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: `0 4px 12px ${stat.color}40`,
                    }}
                  >
                    <IconComponent size={22} color="white" weight="bold" />
                  </Box>

                  {stat.title === "Approval Rate" && approvalRate >= 80 && (
                    <Star size={20} color={stat.color} weight="fill" />
                  )}
                </Flex>

                <Text
                  as="p"
                  size="1"
                  style={{
                    color: theme.colors.text.tertiary,
                    fontSize: "11px",
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
                  size="6"
                  style={{
                    fontWeight: 800,
                    color: theme.colors.text.primary,
                    marginBottom: "4px",
                    fontSize: "28px",
                  }}
                >
                  {stat.value}
                </Text>

                <Text
                  as="p"
                  size="2"
                  style={{
                    color: theme.colors.text.secondary,
                    fontWeight: 500,
                  }}
                >
                  {stat.description}
                </Text>
              </Flex>
            </Card>
          );
        })}
      </Grid>
    </Box>
  );
}
