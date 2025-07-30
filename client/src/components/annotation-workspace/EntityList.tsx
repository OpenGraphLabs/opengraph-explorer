import React from "react";
import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import { Target, Trash, FloppyDisk, Check, X } from "phosphor-react";
import { useAnnotationWorkspace } from "@/contexts/page/AnnotationWorkspaceContext";
import { useAnnotations } from "@/contexts/data/AnnotationsContext";

export function EntityList() {
  const { theme } = useTheme();
  const { annotations } = useAnnotations();
  const {
    entities,
    selectedEntityId,
    isMovingToNext,
    isSaving,
    saveError,
    saveSuccess,
    handleEntitySelect,
    handleEntityDelete,
    handleSaveAnnotations,
  } = useAnnotationWorkspace();

  return (
    <Box
      style={{
        flex: 1,
        padding: theme.spacing.semantic.component.md,
        overflowY: "auto",
      }}
    >
      {entities.length === 0 ? (
        <Box
          style={{
            textAlign: "center",
            padding: theme.spacing.semantic.component.lg,
            opacity: 0.6,
          }}
        >
          <Target
            size={24}
            style={{
              color: theme.colors.text.tertiary,
              marginBottom: theme.spacing.semantic.component.sm,
            }}
          />
          <Text
            size="2"
            style={{
              color: theme.colors.text.secondary,
              lineHeight: 1.4,
            }}
          >
            {isMovingToNext ? (
              <>
                Loading next image...
                <br />
                Continue annotating to help improve the dataset!
              </>
            ) : (
              <>
                No entities created yet.
                <br />
                Select masks on the image and choose a category, or draw a bounding box to start.
              </>
            )}
          </Text>
        </Box>
      ) : (
        <Flex direction="column" gap="2">
          {entities.map((entity, index) => (
            <Box
              key={entity.id}
              onClick={() => handleEntitySelect(entity.id)}
              style={{
                background:
                  selectedEntityId === entity.id
                    ? `${theme.colors.interactive.primary}20`
                    : theme.colors.background.secondary,
                border: `2px solid ${
                  selectedEntityId === entity.id
                    ? theme.colors.interactive.primary
                    : theme.colors.border.subtle
                }`,
                borderRadius: theme.borders.radius.md,
                padding: theme.spacing.semantic.component.sm,
                cursor: "pointer",
                transition: theme.animations.transitions.all,
                position: "relative",
                transform: selectedEntityId === entity.id ? "scale(1.02)" : "scale(1)",
                boxShadow:
                  selectedEntityId === entity.id
                    ? `0 4px 12px ${theme.colors.interactive.primary}20`
                    : "none",
              }}
            >
              <Flex justify="between" align="center">
                <Box style={{ flex: 1 }}>
                  <Flex
                    align="center"
                    gap="2"
                    style={{ marginBottom: theme.spacing.semantic.component.xs }}
                  >
                    <Flex align="center" gap="1">
                      <Text
                        size="2"
                        style={{
                          fontWeight: 600,
                          color: theme.colors.text.primary,
                        }}
                      >
                        Entity #{index + 1}
                      </Text>
                      {selectedEntityId === entity.id && (
                        <Box
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: theme.colors.interactive.primary,
                            animation: "pulse 2s infinite",
                          }}
                        />
                      )}
                    </Flex>
                    {entity.category && (
                      <Box
                        style={{
                          background: theme.colors.interactive.primary,
                          color: theme.colors.text.inverse,
                          borderRadius: theme.borders.radius.sm,
                          padding: `2px 6px`,
                          fontSize: "10px",
                          fontWeight: 600,
                        }}
                      >
                        {entity.category.name}
                      </Box>
                    )}
                  </Flex>
                  <Flex align="center" justify="between">
                    <Text
                      size="1"
                      style={{
                        color: theme.colors.text.secondary,
                        fontSize: "10px",
                      }}
                    >
                      {entity.selectedMaskIds.length} masks selected
                    </Text>
                    {selectedEntityId === entity.id && (
                      <Text
                        size="1"
                        style={{
                          color: theme.colors.interactive.primary,
                          fontSize: "9px",
                          fontWeight: 500,
                          fontStyle: "italic",
                        }}
                      >
                        masks active
                      </Text>
                    )}
                  </Flex>
                </Box>

                <Button
                  onClick={e => {
                    e.stopPropagation();
                    handleEntityDelete(entity.id);
                  }}
                  style={{
                    background: "transparent",
                    color: theme.colors.status.error,
                    border: "none",
                    borderRadius: theme.borders.radius.sm,
                    padding: theme.spacing.semantic.component.xs,
                    cursor: "pointer",
                    opacity: 0.6,
                    transition: theme.animations.transitions.all,
                  }}
                >
                  <Trash size={14} />
                </Button>
              </Flex>
            </Box>
          ))}
        </Flex>
      )}

      {/* Save Button */}
      {entities.length > 0 && (
        <Box
          style={{
            paddingTop: theme.spacing.semantic.component.lg,
            borderTop: `1px solid ${theme.colors.border.subtle}20`,
            marginTop: theme.spacing.semantic.component.lg,
          }}
        >
          <Button
            onClick={handleSaveAnnotations}
            disabled={isSaving}
            style={{
              width: "100%",
              background: saveSuccess
                ? theme.colors.status.success
                : saveError
                  ? theme.colors.status.error
                  : theme.colors.interactive.primary,
              color: theme.colors.text.inverse,
              border: "none",
              borderRadius: theme.borders.radius.md,
              padding: `${theme.spacing.semantic.component.md} ${theme.spacing.semantic.component.lg}`,
              cursor: isSaving ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: theme.spacing.semantic.component.sm,
              fontSize: "14px",
              fontWeight: 600,
              transition: theme.animations.transitions.all,
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            {isSaving ? (
              <>
                <Box
                  style={{
                    width: "16px",
                    height: "16px",
                    border: `2px solid transparent`,
                    borderTopColor: theme.colors.text.inverse,
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <Check size={16} />
                Saved! Loading next image...
              </>
            ) : saveError ? (
              <>
                <X size={16} />
                Save Failed
              </>
            ) : (
              <>
                <FloppyDisk size={16} />
                Save {entities.length} Entities
              </>
            )}
          </Button>

          {saveError && (
            <Text
              size="1"
              style={{
                color: theme.colors.status.error,
                fontSize: "10px",
                textAlign: "center",
                marginTop: theme.spacing.semantic.component.xs,
                lineHeight: 1.3,
              }}
            >
              {saveError}
            </Text>
          )}

          <Text
            size="1"
            style={{
              color: theme.colors.text.tertiary,
              fontSize: "10px",
              textAlign: "center",
              marginTop: theme.spacing.semantic.component.xs,
            }}
          >
            {annotations.length} masks • {entities.length} entities
          </Text>
        </Box>
      )}
    </Box>
  );
}
