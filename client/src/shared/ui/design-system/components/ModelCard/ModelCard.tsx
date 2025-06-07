import { Link } from 'react-router-dom';
import { 
  Card, 
  Flex, 
  Avatar, 
  Text, 
  Heading, 
  Badge,
} from '@/shared/ui/design-system/components';
import { useTheme } from '@/shared/ui/design-system';
import { StarFilledIcon, DownloadIcon, CodeIcon } from '@radix-ui/react-icons';

export interface ModelData {
  id: string;
  name: string;
  creator: string;
  description: string;
  downloads: number;
  likes: number;
  task?: string;
  frameworks?: string[];
}

export interface ModelCardProps {
  model: ModelData;
  className?: string;
}

export function ModelCard({ model, className }: ModelCardProps) {
  const { theme } = useTheme();

  return (
    <Link 
      to={`/models/${model.id}`} 
      style={{ textDecoration: 'none' }}
    >
      <Card
        elevation="low"
        interactive
        className={className}
        style={{
          borderRadius: theme.borders.radius.lg,
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: theme.spacing.semantic.component.lg,
          transition: theme.animations.transitions.hover,
        }}
      >
        <Flex direction="column" gap="3" style={{ height: '100%' }}>
          {/* Creator Info */}
          <Flex align="center" gap="2" mb="1">
            <Avatar
              size="2"
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${model.creator}`}
              fallback={model.creator.charAt(0)}
              style={{
                background: theme.colors.interactive.primary,
              }}
            />
            <Text 
              size="2" 
              style={{ 
                fontWeight: theme.typography.label.fontWeight,
                color: theme.colors.text.secondary,
              }}
            >
              {model.creator}
            </Text>
          </Flex>

          {/* Model Name */}
          <Heading 
            size="4" 
            style={{ 
              fontWeight: theme.typography.h4.fontWeight,
              lineHeight: theme.typography.h4.lineHeight,
              color: theme.colors.text.primary,
            }}
          >
            {model.name}
          </Heading>

          {/* Description */}
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              flex: 1,
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: theme.typography.bodySmall.lineHeight,
            }}
          >
            {model.description}
          </Text>

          {/* Tags */}
          <Flex gap="2" mt="2" wrap="wrap">
            {model.task && (
              <Badge
                size="1"
                variant="soft"
                style={{
                  backgroundColor: theme.colors.background.accent,
                  color: theme.colors.text.brand,
                  borderRadius: theme.borders.radius.sm,
                }}
              >
                {model.task}
              </Badge>
            )}
            {model.frameworks?.map(framework => (
              <Badge 
                key={framework} 
                size="1" 
                variant="soft"
                style={{
                  backgroundColor: theme.colors.interactive.secondary,
                  color: theme.colors.text.secondary,
                  borderRadius: theme.borders.radius.sm,
                }}
              >
                {framework}
              </Badge>
            ))}
          </Flex>

          {/* Stats */}
          <Flex justify="between" align="center" mt="2">
            <Flex gap="3" align="center">
              <Flex gap="1" align="center">
                <StarFilledIcon 
                  width="14" 
                  height="14" 
                  style={{ color: theme.colors.status.warning }} 
                />
                <Text 
                  size="1" 
                  style={{ 
                    fontWeight: theme.typography.label.fontWeight,
                    color: theme.colors.text.secondary,
                  }}
                >
                  {model.likes}
                </Text>
              </Flex>
              <Flex gap="1" align="center">
                <DownloadIcon 
                  width="14" 
                  height="14" 
                  style={{ color: theme.colors.text.tertiary }} 
                />
                <Text 
                  size="1" 
                  style={{ 
                    fontWeight: theme.typography.label.fontWeight,
                    color: theme.colors.text.secondary,
                  }}
                >
                  {model.downloads}
                </Text>
              </Flex>
            </Flex>
            <Flex align="center" gap="1">
              <CodeIcon 
                width="14" 
                height="14" 
                style={{ color: theme.colors.text.tertiary }} 
              />
              <Text 
                size="1" 
                style={{ 
                  fontWeight: theme.typography.label.fontWeight,
                  color: theme.colors.text.secondary,
                }}
              >
                SUI
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </Link>
  );
} 