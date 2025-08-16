import React from "react";
import { Box, Text, Heading, Flex } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { useNavigate, useParams } from "react-router-dom";
import {
  Knife,
  Television,
  TShirt,
  ForkKnife,
  ArrowRight,
  House,
  Robot,
  Sparkle,
} from "phosphor-react";

interface SpaceType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactElement;
  gradient: string;
  tasks: string[];
  difficulty: "Beginner" | "Intermediate";
}

const SPACE_TYPES: SpaceType[] = [
  {
    id: "kitchen",
    name: "Kitchen",
    description: "Capture cooking areas, appliances, and food preparation spaces",
    icon: <Knife size={32} weight="duotone" />,
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    tasks: ["Countertop organization", "Appliance placement", "Cabinet contents"],
    difficulty: "Beginner",
  },
  {
    id: "living-room",
    name: "Living Room",
    description: "Document furniture arrangements, entertainment systems, and common areas",
    icon: <Television size={32} weight="duotone" />,
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    tasks: ["Furniture layout", "Entertainment setup", "Decorative elements"],
    difficulty: "Beginner",
  },
  {
    id: "closet",
    name: "Closet",
    description: "Record clothing organization, storage solutions, and wardrobe items",
    icon: <TShirt size={32} weight="duotone" />,
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    tasks: ["Clothing arrangement", "Storage systems", "Accessory organization"],
    difficulty: "Intermediate",
  },
  {
    id: "dining-room",
    name: "Dining Room",
    description: "Capture dining setups, table arrangements, and eating areas",
    icon: <ForkKnife size={32} weight="duotone" />,
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    tasks: ["Table settings", "Chair arrangements", "Storage furniture"],
    difficulty: "Beginner",
  },
];

function SpaceCard({ space, index }: { space: SpaceType; index: number }) {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { id: datasetId } = useParams();
  const [isHovered, setIsHovered] = React.useState(false);

  const handleSelectSpace = () => {
    navigate(`/datasets/${datasetId}/first-person-capture?space=${space.id}`);
  };

  return (
    <Box
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSelectSpace}
      style={{
        position: "relative",
        padding: theme.spacing.semantic.component.lg,
        borderRadius: theme.borders.radius.lg,
        backgroundColor: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: isHovered
          ? `0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px ${theme.colors.interactive.primary}30`
          : theme.shadows.semantic.card.medium,
        overflow: "hidden",
        animation: `fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s both`,
      }}
    >
      {/* Gradient Background Overlay */}
      <Box
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "120px",
          background: space.gradient,
          opacity: 0.1,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Icon Container */}
      <Flex
        align="center"
        justify="center"
        style={{
          width: "64px",
          height: "64px",
          borderRadius: theme.borders.radius.lg,
          background: space.gradient,
          marginBottom: theme.spacing.semantic.component.md,
          position: "relative",
          boxShadow: `0 8px 16px rgba(0, 0, 0, 0.1)`,
          transform: isHovered ? "scale(1.05)" : "scale(1)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Box style={{ color: "white" }}>{space.icon}</Box>
      </Flex>

      {/* Content */}
      <Flex direction="column" gap="3">
        <Box>
          <Flex align="center" justify="between" style={{ marginBottom: "8px" }}>
            <Heading
              size="4"
              style={{
                color: theme.colors.text.primary,
                fontWeight: 700,
              }}
            >
              {space.name}
            </Heading>
            <Box
              style={{
                padding: "4px 8px",
                borderRadius: theme.borders.radius.sm,
                backgroundColor:
                  space.difficulty === "Beginner"
                    ? `${theme.colors.status.success}15`
                    : `${theme.colors.status.warning}15`,
                color:
                  space.difficulty === "Beginner"
                    ? theme.colors.status.success
                    : theme.colors.status.warning,
                border: `1px solid ${
                  space.difficulty === "Beginner"
                    ? theme.colors.status.success + "30"
                    : theme.colors.status.warning + "30"
                }`,
                fontSize: "11px",
                fontWeight: 600,
              }}
            >
              {space.difficulty}
            </Box>
          </Flex>
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              lineHeight: 1.5,
            }}
          >
            {space.description}
          </Text>
        </Box>

        {/* Task Examples */}
        <Box>
          <Text
            size="1"
            style={{
              color: theme.colors.text.tertiary,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "8px",
              fontSize: "11px",
            }}
          >
            Example Tasks
          </Text>
          <Flex direction="column" gap="2">
            {space.tasks.map((task, idx) => (
              <Flex key={idx} align="center" gap="2">
                <Box
                  style={{
                    width: "4px",
                    height: "4px",
                    borderRadius: "50%",
                    backgroundColor: theme.colors.interactive.primary,
                    opacity: 0.6,
                  }}
                />
                <Text
                  size="1"
                  style={{
                    color: theme.colors.text.tertiary,
                    fontSize: "12px",
                  }}
                >
                  {task}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Box>

        {/* Hover Action */}
        <Flex
          align="center"
          gap="2"
          style={{
            marginTop: theme.spacing.semantic.component.sm,
            color: theme.colors.interactive.primary,
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? "translateX(0)" : "translateX(-4px)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <Text
            size="2"
            style={{
              fontWeight: 600,
              fontSize: "13px",
            }}
          >
            Start Capture
          </Text>
          <ArrowRight size={16} weight="bold" />
        </Flex>
      </Flex>
    </Box>
  );
}

export function SpaceSelection() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      style={{
        minHeight: "100vh",
        background: `linear-gradient(to bottom, ${theme.colors.background.secondary}40, ${theme.colors.background.primary})`,
      }}
    >
      <Box
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: `${theme.spacing.semantic.layout.lg} ${theme.spacing.semantic.container.md}`,
        }}
      >
        {/* Header */}
        <Box
          style={{
            textAlign: "center",
            marginBottom: theme.spacing.semantic.layout.xl,
            animation: "fadeIn 0.6s ease",
          }}
        >
          {/* Icon Badge */}
          <Flex
            align="center"
            justify="center"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: theme.borders.radius.full,
              background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.accent})`,
              margin: "0 auto",
              marginBottom: theme.spacing.semantic.component.lg,
              boxShadow: `0 12px 24px ${theme.colors.interactive.primary}30`,
            }}
          >
            <House size={40} color="white" weight="duotone" />
          </Flex>

          <Heading
            size="6"
            style={{
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.semantic.component.sm,
              fontWeight: 700,
            }}
          >
            Select Capture Space
          </Heading>
          <Text
            as="p"
            size="3"
            style={{
              color: theme.colors.text.secondary,
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            Choose the room or area where you'll capture first-person view images. <br />
            This helps train robots to understand different home environments.
          </Text>

          {/* Info Badge */}
          <Flex
            align="center"
            justify="center"
            gap="2"
            style={{
              marginTop: theme.spacing.semantic.component.md,
              padding: "8px 16px",
              borderRadius: theme.borders.radius.full,
              backgroundColor: `${theme.colors.interactive.primary}10`,
              border: `1px solid ${theme.colors.interactive.primary}20`,
              display: "inline-flex",
            }}
          >
            <Robot size={16} color={theme.colors.interactive.primary} weight="duotone" />
            <Text
              size="2"
              style={{
                color: theme.colors.interactive.primary,
                fontWeight: 600,
                fontSize: "12px",
              }}
            >
              Training Data for Home Robotics AI
            </Text>
          </Flex>
        </Box>

        {/* Space Grid */}
        <Box
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: theme.spacing.semantic.layout.md,
            marginBottom: theme.spacing.semantic.layout.lg,
          }}
        >
          {SPACE_TYPES.map((space, index) => (
            <SpaceCard key={space.id} space={space} index={index} />
          ))}
        </Box>

        {/* Footer Tip */}
        <Box
          style={{
            textAlign: "center",
            padding: theme.spacing.semantic.component.lg,
            borderRadius: theme.borders.radius.lg,
            backgroundColor: `${theme.colors.background.secondary}50`,
            border: `1px solid ${theme.colors.border.secondary}`,
            animation: "fadeIn 0.8s ease 0.4s both",
          }}
        >
          <Flex align="center" justify="center" gap="2" style={{ marginBottom: "8px" }}>
            <Sparkle size={16} color={theme.colors.text.tertiary} weight="fill" />
            <Text
              size="2"
              style={{
                color: theme.colors.text.tertiary,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontSize: "11px",
              }}
            >
              Pro Tip
            </Text>
          </Flex>
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              maxWidth: "500px",
              margin: "0 auto",
              lineHeight: 1.5,
            }}
          >
            Start with familiar spaces where you spend the most time. Clear, well-lit images from
            various angles provide the best training data.
          </Text>
        </Box>
      </Box>

      {/* Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Box>
  );
}
