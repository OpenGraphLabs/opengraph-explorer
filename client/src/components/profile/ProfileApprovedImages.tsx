import { Box, Flex, Text, Grid } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import { Image as ImageIcon, ArrowLeft, ArrowRight } from "phosphor-react";
import { useProfilePageContext } from "@/contexts/ProfilePageContextProvider";

export function ProfileApprovedImages() {
  const { theme } = useTheme();
  const {
    userProfile,
    approvedImages,
    totalApprovedImagesPages,
    currentImagesPage,
    handleImagesPageChange,
  } = useProfilePageContext();

  return (
    <Card
      style={{
        padding: theme.spacing.semantic.component.lg,
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
      }}
    >
      <Flex direction="column" gap="4">
        <Flex align="center" justify="between">
          <Text
            size="3"
            style={{
              fontWeight: 600,
              color: theme.colors.text.primary,
            }}
          >
            Approved Images Gallery
          </Text>
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              fontWeight: 500,
            }}
          >
            {userProfile?.imagesApproved || 0} images approved
          </Text>
        </Flex>

        {approvedImages.length > 0 ? (
          <>
            <Grid
              columns="3"
              gap="3"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              }}
            >
              {approvedImages.map((image) => (
                <Card
                  key={image.id}
                  style={{
                    aspectRatio: "1",
                    overflow: "hidden",
                    position: "relative",
                    border: `1px solid ${theme.colors.border.subtle}`,
                    borderRadius: theme.borders.radius.md,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  className="hover:scale-105 hover:shadow-lg"
                >
                  <img
                    src={image.imageUrl}
                    alt={image.fileName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: theme.borders.radius.sm,
                    }}
                    loading="lazy"
                  />
                </Card>
              ))}
            </Grid>

            {/* Pagination */}
            {totalApprovedImagesPages > 1 && (
              <Flex align="center" justify="between" gap="2">
                <button
                  onClick={() => handleImagesPageChange(currentImagesPage - 1)}
                  disabled={currentImagesPage <= 1}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.semantic.component.xs,
                    padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borders.radius.sm,
                    background: theme.colors.background.card,
                    color: currentImagesPage <= 1 ? theme.colors.text.tertiary : theme.colors.text.primary,
                    cursor: currentImagesPage <= 1 ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  <ArrowLeft size={14} />
                  Previous
                </button>

                <Text
                  size="2"
                  style={{
                    color: theme.colors.text.secondary,
                    fontWeight: 500,
                  }}
                >
                  Page {currentImagesPage} of {totalApprovedImagesPages}
                </Text>

                <button
                  onClick={() => handleImagesPageChange(currentImagesPage + 1)}
                  disabled={currentImagesPage >= totalApprovedImagesPages}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing.semantic.component.xs,
                    padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borders.radius.sm,
                    background: theme.colors.background.card,
                    color: currentImagesPage >= totalApprovedImagesPages ? theme.colors.text.tertiary : theme.colors.text.primary,
                    cursor: currentImagesPage >= totalApprovedImagesPages ? "not-allowed" : "pointer",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  Next
                  <ArrowRight size={14} />
                </button>
              </Flex>
            )}
          </>
        ) : (
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: theme.spacing.semantic.component.xl,
              color: theme.colors.text.tertiary,
              textAlign: "center",
            }}
          >
            <ImageIcon
              size={48}
              style={{
                color: theme.colors.text.tertiary,
                marginBottom: theme.spacing.semantic.component.md,
              }}
            />
            <Text
              size="3"
              style={{
                color: theme.colors.text.secondary,
                fontWeight: 600,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              No approved images yet
            </Text>
            <Text
              size="2"
              style={{
                color: theme.colors.text.tertiary,
                maxWidth: "300px",
              }}
            >
              Submit images through the Earn page to start building your approved image collection.
            </Text>
          </Box>
        )}
      </Flex>
    </Card>
  );
}