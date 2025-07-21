import React, { useState } from "react";
import { Box, Flex, Heading, Text, Grid, Button, ImageCard } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { 
  MagnifyingGlassIcon, 
  GridIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
  Crosshair1Icon
} from "@radix-ui/react-icons";
import { useImages } from "@/shared/hooks/useApiQuery";

interface ImageItem {
  id: number;
  file_name: string;
  image_url: string;
  width: number;
  height: number;
  dataset_id: number;
  created_at: string;
}

interface ImageListResponse {
  items: ImageItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function Home() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(24);

  const { 
    data: imagesResponse, 
    isLoading, 
    error 
  } = useImages(
    { page: currentPage, limit },
    { 
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    }
  );

  const images = imagesResponse?.items || [];
  const totalPages = imagesResponse?.pages || 0;
  const totalImages = imagesResponse?.total || 0;

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // TODO: Implement search functionality
      console.log('Search for:', searchQuery);
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageClick = (image: ImageItem) => {
    // TODO: Open image detail modal or navigate to detail page
    console.log('Clicked image:', image);
  };

  if (error) {
    return (
      <Box
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Flex direction="column" align="center" gap="4">
          <Crosshair1Icon 
            width="48" 
            height="48" 
            style={{ color: theme.colors.status.error }}
          />
          <Heading size="4" style={{ color: theme.colors.text.primary }}>
            Unable to Load Images
          </Heading>
          <Text style={{ color: theme.colors.text.secondary, textAlign: 'center' }}>
            There was an error loading the image gallery. Please try refreshing the page.
          </Text>
          <Button
            variant="primary"
            size="md"
            onClick={() => window.location.reload()}
            style={{
              marginTop: theme.spacing.semantic.component.md,
            }}
          >
            Refresh Page
          </Button>
        </Flex>
      </Box>
    );
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: theme.colors.background.primary,
      }}
    >
      {/* Simple Header - Google Style */}
      <Box
        style={{
          background: theme.colors.background.primary,
          borderBottom: `1px solid ${theme.colors.border.subtle}`,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(8px)',
        }}
      >
        <Box
          style={{
            maxWidth: '1600px',
            margin: '0 auto',
            padding: `${theme.spacing.semantic.layout.sm} ${theme.spacing.semantic.container.sm}`,
          }}
        >
          <Flex direction="column" align="center" gap="4">
            {/* OpenGraph Title */}
            <Heading
              style={{
                fontSize: theme.typography.h2.fontSize,
                fontWeight: theme.typography.h2.fontWeight,
                color: theme.colors.text.primary,
                letterSpacing: theme.typography.h2.letterSpacing,
                marginBottom: theme.spacing.semantic.component.sm,
              }}
            >
              OpenGraph
            </Heading>

            {/* Simple Search Bar */}
            <Box style={{ width: '100%', maxWidth: '580px' }}>
              <Box
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  background: theme.colors.background.card,
                  border: `1px solid ${theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.full,
                  transition: theme.animations.transitions.all,
                  boxShadow: theme.shadows.base.sm,
                  padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
                }}
                onFocusCapture={(e) => {
                  e.currentTarget.style.boxShadow = theme.shadows.semantic.interactive.focus;
                }}
                onBlurCapture={(e) => {
                  e.currentTarget.style.boxShadow = theme.shadows.base.sm;
                }}
              >
                <MagnifyingGlassIcon 
                  width="20" 
                  height="20" 
                  style={{ 
                    color: theme.colors.text.tertiary,
                    marginRight: theme.spacing.semantic.component.md,
                  }} 
                />
                
                <input
                  type="text"
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: theme.typography.body.fontSize,
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI Variable, Segoe UI, system-ui, Roboto, Helvetica Neue, Arial, sans-serif',
                    color: theme.colors.text.primary,
                  }}
                />

                {searchQuery && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    style={{
                      padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                      fontSize: theme.typography.caption.fontSize,
                      borderRadius: theme.borders.radius.sm,
                      marginLeft: theme.spacing.semantic.component.sm,
                    }}
                  >
                    Clear
                  </Button>
                )}
              </Box>
            </Box>

            {/* Simple Stats */}
            {!isLoading && (
              <Text
                style={{
                  fontSize: theme.typography.bodySmall.fontSize,
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                }}
              >
                {totalImages.toLocaleString()} images available
              </Text>
            )}
          </Flex>
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: `${theme.spacing.semantic.layout.md} ${theme.spacing.semantic.container.sm}`,
        }}
      >
        {/* Loading State */}
        {isLoading && (
          <Flex
            direction="column"
            align="center"
            justify="center"
            gap="4"
            style={{
              minHeight: '300px',
              padding: theme.spacing.semantic.layout.lg,
            }}
          >
            <Box
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: `3px solid ${theme.colors.border.primary}`,
                borderTopColor: theme.colors.interactive.primary,
                animation: 'spin 1s linear infinite',
              }}
            />
            <Text
              style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.text.secondary,
              }}
            >
              Loading images...
            </Text>
          </Flex>
        )}

        {/* Images Grid */}
        {!isLoading && images.length > 0 && (
          <>
            <Grid 
              columns={{ 
                initial: "2", 
                sm: "3", 
                md: "4", 
                lg: "5", 
                xl: "6"
              }} 
              gap="3"
              style={{
                marginBottom: theme.spacing.semantic.layout.lg,
              }}
            >
              {images.map((image) => (
                <ImageCard
                  key={image.id}
                  id={image.id}
                  fileName={image.file_name}
                  imageUrl={image.image_url}
                  width={image.width}
                  height={image.height}
                  datasetId={image.dataset_id}
                  createdAt={image.created_at}
                  onClick={() => handleImageClick(image)}
                />
              ))}
            </Grid>

            {/* Simple Pagination */}
            {totalPages > 1 && (
              <Flex justify="center" align="center" gap="2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.semantic.component.sm,
                  }}
                >
                  <ChevronLeftIcon width="16" height="16" />
                  Previous
                </Button>
                
                <Text
                  style={{
                    margin: `0 ${theme.spacing.semantic.component.lg}`,
                    fontSize: theme.typography.bodySmall.fontSize,
                    color: theme.colors.text.secondary,
                    fontFamily: 'JetBrains Mono, SF Mono, Monaco, Inconsolata, Roboto Mono, Fira Code, Consolas, Liberation Mono, Menlo, Courier, monospace',
                  }}
                >
                  Page {currentPage} of {totalPages}
                </Text>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing.semantic.component.sm,
                  }}
                >
                  Next
                  <ChevronRightIcon width="16" height="16" />
                </Button>
              </Flex>
            )}
          </>
        )}

        {/* Simple Empty State */}
        {!isLoading && images.length === 0 && (
          <Flex
            direction="column"
            align="center"
            justify="center"
            gap="4"
            style={{
              minHeight: '300px',
              padding: theme.spacing.semantic.layout.lg,
            }}
          >
            <GridIcon 
              width="64" 
              height="64" 
              style={{ 
                color: theme.colors.text.tertiary,
              }} 
            />
            
            <Flex direction="column" align="center" gap="2">
              <Heading 
                size="4" 
                style={{ 
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.h4.fontSize,
                  fontWeight: theme.typography.h4.fontWeight,
                }}
              >
                {searchQuery ? 'No results found' : 'No images available'}
              </Heading>
              
              <Text 
                style={{ 
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                  fontSize: theme.typography.body.fontSize,
                }}
              >
                {searchQuery 
                  ? `Try searching for something else`
                  : 'Images will appear here when available'
                }
              </Text>
            </Flex>
          </Flex>
        )}
      </Box>

      {/* Global Styles */}
      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
          
          input::placeholder {
            color: ${theme.colors.text.tertiary};
            opacity: 1;
          }
        `}
      </style>
    </Box>
  );
}
