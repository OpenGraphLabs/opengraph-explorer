import { useState, useCallback, useEffect, Suspense, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Button,
  Badge,
} from "@/shared/ui/design-system/components";
import { useTheme } from "@/shared/ui/design-system";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Flag,
  Eye,
  EyeSlash,
  Keyboard,
  FloppyDisk,
  Shield,
  Play,
  Pause,
} from "phosphor-react";
import { useValidationWorkspace } from '@/features/validation/hooks/useValidationWorkspace';
import { ImageViewer } from '@/features/annotation/components/ImageViewer';
import { useChallenge } from '@/features/challenge';
import { useChallengeDataset } from '@/features/challenge/hooks/useChallengeDataset';

export function ValidationWorkspace() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // UI State
  const [currentLabelGroupIndex, setCurrentLabelGroupIndex] = useState(0);
  const [selectedAnnotationIds, setSelectedAnnotationIds] = useState<Set<string>>(new Set());
  const [isValidating, setIsValidating] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [showAnnotationDetails, setShowAnnotationDetails] = useState(true);
  
  // Challenge data
  const { challenge, loading: challengeLoading, error: challengeError } = useChallenge(challengeId || '');
  
  // Dataset integration
  const { 
    images: datasetImages, 
    loading: datasetLoading, 
  } = useChallengeDataset(challenge);

  // Fallback to mock images
  const effectiveImages = datasetImages.length > 0 ? datasetImages : [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop',
      filename: 'street_scene_01.jpg',
      width: 800,
      height: 600,
      completed: false,
      skipped: false,
      annotations: { labels: [], boundingBoxes: [], polygons: [] }
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
      filename: 'city_traffic_02.jpg',
      width: 800,
      height: 600,
      completed: false,
      skipped: false,
      annotations: { labels: [], boundingBoxes: [], polygons: [] }
    }
  ];
  
  // Validation workspace state
  const { state, actions } = useValidationWorkspace(challengeId || '', effectiveImages);
  
  // Get current phase annotations for validation
  const currentPhaseAnnotations = state.validationSession?.pendingAnnotations.filter(
    annotation => {
      switch (state.currentPhase) {
        case 'label':
          return annotation.type === 'label';
        case 'bbox':
          return annotation.type === 'bbox';
        case 'segmentation':
          return annotation.type === 'segmentation';
        default:
          return true;
      }
    }
  ) || [];

  // Group individual bbox/label/polygon items by their label
  const annotationGroups = useMemo(() => {
    const groups: Record<string, {
      label: string;
      items: Array<{
        annotationId: string;
        annotation: typeof currentPhaseAnnotations[0];
        itemId: string;
        itemData: any;
      }>;
      imageId: string;
    }> = {};
    
    currentPhaseAnnotations.forEach(annotation => {
      if (annotation.type === 'label') {
        // For label annotations, create group for each individual label
        annotation.data.labels?.forEach((labelItem) => {
          const groupKey = labelItem.label || 'unlabeled';
          
          if (!groups[groupKey]) {
            groups[groupKey] = {
              label: groupKey,
              items: [],
              imageId: annotation.dataId
            };
          }
          
          groups[groupKey].items.push({
            annotationId: annotation.id,
            annotation,
            itemId: labelItem.id,
            itemData: labelItem
          });
        });
      } else if (annotation.type === 'bbox') {
        // For bbox annotations, create group for each individual bbox
        annotation.data.boundingBoxes?.forEach((bboxItem) => {
          const groupKey = bboxItem.label || 'unlabeled';
          
          if (!groups[groupKey]) {
            groups[groupKey] = {
              label: groupKey,
              items: [],
              imageId: annotation.dataId
            };
          }
          
          groups[groupKey].items.push({
            annotationId: annotation.id,
            annotation,
            itemId: bboxItem.id,
            itemData: bboxItem
          });
        });
      } else if (annotation.type === 'segmentation') {
        // For segmentation annotations, create group for each individual polygon
        annotation.data.polygons?.forEach((polygonItem) => {
          const groupKey = polygonItem.label || 'unlabeled';
          
          if (!groups[groupKey]) {
            groups[groupKey] = {
              label: groupKey,
              items: [],
              imageId: annotation.dataId
            };
          }
          
          groups[groupKey].items.push({
            annotationId: annotation.id,
            annotation,
            itemId: polygonItem.id,
            itemData: polygonItem
          });
        });
      }
    });
    
    return Object.values(groups);
  }, [currentPhaseAnnotations]);

  // Current label group and items
  const currentLabelGroup = annotationGroups[currentLabelGroupIndex];
  const currentGroupItems = currentLabelGroup?.items || [];
  const currentImage = currentLabelGroup ? 
    effectiveImages.find(img => img.id === currentLabelGroup.imageId) : 
    effectiveImages[0];
  
  // Navigation handlers
  const handleNextLabelGroup = useCallback(() => {
    if (currentLabelGroupIndex < annotationGroups.length - 1) {
      setCurrentLabelGroupIndex(prev => prev + 1);
      setSelectedAnnotationIds(new Set()); // Clear selections when moving to next group
    }
  }, [currentLabelGroupIndex, annotationGroups.length]);
  
  const handlePreviousLabelGroup = useCallback(() => {
    if (currentLabelGroupIndex > 0) {
      setCurrentLabelGroupIndex(prev => prev - 1);
      setSelectedAnnotationIds(new Set()); // Clear selections when moving to previous group
    }
  }, [currentLabelGroupIndex]);

  // Selection handlers
  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedAnnotationIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const selectAllItems = useCallback(() => {
    setSelectedAnnotationIds(new Set(currentGroupItems.map(item => item.itemId)));
  }, [currentGroupItems]);

  const clearAllSelections = useCallback(() => {
    setSelectedAnnotationIds(new Set());
  }, []);
  
  // Bulk validation handler
  const handleBulkValidation = useCallback(async (action: 'approve' | 'reject' | 'flag', reason?: string) => {
    if (selectedAnnotationIds.size === 0 || isValidating) return;
    
    setIsValidating(true);
    try {
      const promises = Array.from(selectedAnnotationIds).map(id =>
        actions.validateAnnotation(id, action, reason)
      );
      await Promise.all(promises);
      
      // Clear selections after validation
      setSelectedAnnotationIds(new Set());
      
      // Auto advance if enabled and not the last group
      if (autoAdvance && currentLabelGroupIndex < annotationGroups.length - 1) {
        setTimeout(() => {
          handleNextLabelGroup();
          setIsValidating(false);
        }, 500);
      } else {
        setIsValidating(false);
      }
    } catch (error) {
      console.error('Bulk validation failed:', error);
      setIsValidating(false);
    }
  }, [selectedAnnotationIds, isValidating, actions, autoAdvance, currentLabelGroupIndex, annotationGroups.length, handleNextLabelGroup]);

  // Initialize validation session
  useEffect(() => {
    if (challenge && effectiveImages.length > 0 && !state.validationSession) {
      console.log('Initializing validation session with phase:', challenge.currentPhase || 'bbox');
      actions.initializeSession(challenge.currentPhase || 'bbox');
    }
  }, [challenge, effectiveImages.length, state.validationSession, actions]);

  // Set current image when annotation changes
  useEffect(() => {
    if (currentImage && currentImage !== state.currentImage) {
      actions.setCurrentImage(currentImage);
    }
  }, [currentImage, state.currentImage, actions]);

  // Debug logging
  useEffect(() => {
    console.log('ValidationWorkspace Debug:', {
      challengeId,
      currentPhase: state.currentPhase,
      totalPhaseAnnotations: currentPhaseAnnotations.length,
      currentLabelGroupIndex,
      currentLabelGroup,
      selectedAnnotationIds: Array.from(selectedAnnotationIds),
      currentImage,
      effectiveImages: effectiveImages.length,
      validationSession: state.validationSession,
    });
  }, [challengeId, state.currentPhase, currentPhaseAnnotations.length, currentLabelGroupIndex, currentLabelGroup, selectedAnnotationIds, currentImage, effectiveImages.length, state.validationSession]);

  // Keyboard shortcuts for validation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isValidating) return;
      
      // Ignore if typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch (event.key.toLowerCase()) {
        case 'a':
          event.preventDefault();
          handleBulkValidation('approve');
          break;
        case 'r':
          event.preventDefault();
          handleBulkValidation('reject');
          break;
        case 'f':
          event.preventDefault();
          handleBulkValidation('flag');
          break;
        case 'arrowright':
          event.preventDefault();
          handleNextLabelGroup();
          break;
        case 'arrowleft':
          event.preventDefault();
          handlePreviousLabelGroup();
          break;
        case ' ':
          event.preventDefault();
          setAutoAdvance(!autoAdvance);
          break;
        case 's':
          event.preventDefault();
          selectAllItems();
          break;
        case 'c':
          event.preventDefault();
          clearAllSelections();
          break;
        case 'h':
          event.preventDefault();
          setShowKeyboardShortcuts(!showKeyboardShortcuts);
          break;
        case 'd':
          event.preventDefault();
          setShowAnnotationDetails(!showAnnotationDetails);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isValidating, handleBulkValidation, handleNextLabelGroup, handlePreviousLabelGroup, autoAdvance, showKeyboardShortcuts, showAnnotationDetails, selectAllItems, clearAllSelections]);

  // Loading state
  if (challengeLoading || datasetLoading) {
    return (
      <Box
        style={{
          background: theme.colors.background.primary,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Flex
          direction="column"
          align="center"
          gap="4"
          style={{
            background: theme.colors.background.card,
            padding: theme.spacing.semantic.layout.lg,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${theme.colors.border.primary}`,
            boxShadow: theme.shadows.semantic.card.low,
            maxWidth: "400px",
          }}
        >
          <Shield size={48} style={{ color: theme.colors.interactive.primary }} />
          <Box style={{ textAlign: "center" }}>
            <Text
              size="4"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              Loading Validation Environment
            </Text>
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: 1.5,
              }}
            >
              {challengeLoading ? 'Loading challenge data...' : 'Loading dataset images...'}
            </Text>
          </Box>
        </Flex>
      </Box>
    );
  }

  // Error state
  if (challengeError) {
    return (
      <Box
        style={{
          background: theme.colors.background.primary,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.semantic.layout.lg,
        }}
      >
        <Flex
          direction="column"
          align="center"
          gap="4"
          style={{
            background: theme.colors.background.card,
            padding: theme.spacing.semantic.layout.lg,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${theme.colors.status.error}40`,
            boxShadow: theme.shadows.semantic.card.medium,
            maxWidth: "400px",
          }}
        >
          <Shield size={48} style={{ color: theme.colors.status.error }} />
          <Box style={{ textAlign: "center" }}>
            <Text
              size="4"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing.semantic.component.xs,
              }}
            >
              Validation Environment Error
            </Text>
            <Text
              size="2"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: 1.5,
                marginBottom: theme.spacing.semantic.component.md,
              }}
            >
              {challengeError || 'Failed to load challenge data'}
            </Text>
            <Button
              onClick={() => navigate('/challenges')}
              style={{
                background: theme.colors.interactive.primary,
                color: theme.colors.text.inverse,
                border: "none",
                borderRadius: theme.borders.radius.sm,
                padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
              }}
            >
              Back to Challenges
            </Button>
          </Box>
        </Flex>
      </Box>
    );
  }

  const validationProgress = state.validationSession ? 
    (state.validationSession.progress.validated / state.validationSession.progress.total) * 100 : 0;

  return (
    <Box
      style={{
        background: theme.colors.background.primary,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Top Header - Compact */}
      <Box
        style={{
          background: theme.colors.background.card,
          border: `1px solid ${theme.colors.border.primary}`,
          borderBottom: `1px solid ${theme.colors.border.secondary}`,
          padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.lg}`,
          zIndex: 10,
        }}
      >
        <Flex justify="between" align="center">
          <Flex align="center" gap="3">
            <Button
              onClick={() => navigate(`/challenges/${challengeId}`)}
              style={{
                background: "transparent",
                color: theme.colors.text.secondary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.md,
                padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.semantic.component.xs,
                fontSize: "13px",
              }}
            >
              <ArrowLeft size={14} />
              Back
            </Button>
            
            <Text
              size="3"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
              }}
            >
              Validation: {challenge?.title || 'Loading...'}
            </Text>
            
            <Badge
              style={{
                background: `${theme.colors.status.warning}15`,
                color: theme.colors.status.warning,
                border: `1px solid ${theme.colors.status.warning}30`,
                borderRadius: theme.borders.radius.full,
                padding: "4px 8px",
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              {state.currentPhase} Phase
            </Badge>
          </Flex>

          <Flex align="center" gap="2">
            {/* Label Group Progress */}
            <Text
              size="1"
              style={{
                color: theme.colors.text.secondary,
                fontFeatureSettings: '"tnum"',
              }}
            >
              Group {currentLabelGroupIndex + 1} / {annotationGroups.length}
            </Text>
            
            {/* Selected Count */}
            {selectedAnnotationIds.size > 0 && (
              <Text
                size="1"
                style={{
                  color: theme.colors.status.success,
                  fontFeatureSettings: '"tnum"',
                  fontWeight: 600,
                }}
              >
                {selectedAnnotationIds.size} selected
              </Text>
            )}
            
            {/* Auto Advance Toggle */}
            <Button
              onClick={() => setAutoAdvance(!autoAdvance)}
              style={{
                background: autoAdvance ? theme.colors.status.success : "transparent",
                color: autoAdvance ? theme.colors.text.inverse : theme.colors.text.secondary,
                border: `1px solid ${autoAdvance ? theme.colors.status.success : theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.sm,
                padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.semantic.component.xs,
                fontSize: "11px",
                fontWeight: 500,
              }}
            >
              {autoAdvance ? <Play size={12} weight="fill" /> : <Pause size={12} />}
              Auto
            </Button>
            
            {/* Keyboard Shortcuts Toggle */}
            <Button
              onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
              style={{
                background: showKeyboardShortcuts ? theme.colors.interactive.primary : "transparent",
                color: showKeyboardShortcuts ? theme.colors.text.inverse : theme.colors.text.secondary,
                border: `1px solid ${showKeyboardShortcuts ? theme.colors.interactive.primary : theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.sm,
                padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.semantic.component.xs,
                fontSize: "11px",
                fontWeight: 500,
              }}
            >
              <Keyboard size={12} />
              Help
            </Button>
            
            {/* Save Button */}
            <Button
              onClick={actions.saveValidations}
              disabled={!state.unsavedChanges}
              style={{
                background: state.unsavedChanges 
                  ? theme.colors.status.success 
                  : theme.colors.interactive.disabled,
                color: theme.colors.text.inverse,
                border: "none",
                borderRadius: theme.borders.radius.md,
                padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                fontWeight: 600,
                fontSize: "12px",
                cursor: state.unsavedChanges ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.semantic.component.xs,
              }}
            >
              <FloppyDisk size={14} />
              Save
            </Button>
          </Flex>
        </Flex>
        
        {/* Progress Bar */}
        <Box
          style={{
            height: "4px",
            background: theme.colors.background.secondary,
            borderRadius: "2px",
            overflow: "hidden",
            marginTop: theme.spacing.semantic.component.sm,
          }}
        >
          <Box
            style={{
              height: "100%",
              width: `${validationProgress}%`,
              background: `linear-gradient(90deg, ${theme.colors.status.warning}, ${theme.colors.status.success})`,
              transition: "width 0.3s ease",
            }}
          />
        </Box>
      </Box>

      {/* Main Content Area */}
      <Flex style={{ flex: 1, overflow: "hidden" }}>
        {/* Left Side - Label Group Details (Optional) */}
        {showAnnotationDetails && currentLabelGroup && (
          <Box
            style={{
              width: "300px",
              background: theme.colors.background.card,
              border: `1px solid ${theme.colors.border.primary}`,
              borderTop: "none",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Annotation Header */}
            <Box
              style={{
                padding: theme.spacing.semantic.component.md,
                borderBottom: `1px solid ${theme.colors.border.primary}`,
              }}
            >
              <Flex justify="between" align="center" style={{ marginBottom: theme.spacing.semantic.component.sm }}>
                <Text
                  size="2"
                  style={{
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                  }}
                >
                  Label Group: {currentLabelGroup.label}
                </Text>
                <Button
                  onClick={() => setShowAnnotationDetails(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: theme.colors.text.secondary,
                  }}
                >
                  <EyeSlash size={14} />
                </Button>
              </Flex>
              
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <Text size="1" style={{ color: theme.colors.text.tertiary }}>Type:</Text>
                  <Badge
                    style={{
                      background: `${theme.colors.interactive.primary}15`,
                      color: theme.colors.interactive.primary,
                      fontSize: "10px",
                      padding: "2px 6px",
                      borderRadius: theme.borders.radius.xs,
                      textTransform: "capitalize",
                    }}
                  >
                    {state.currentPhase}
                  </Badge>
                </Flex>
                
                <Flex align="center" gap="2">
                  <Text size="1" style={{ color: theme.colors.text.tertiary }}>Total:</Text>
                  <Text
                    size="1"
                    style={{
                      color: theme.colors.text.primary,
                      fontWeight: 600,
                      fontFeatureSettings: '"tnum"',
                    }}
                  >
                    {currentGroupItems.length} items
                  </Text>
                </Flex>
                
                <Flex align="center" gap="2">
                  <Text size="1" style={{ color: theme.colors.text.tertiary }}>Selected:</Text>
                  <Text
                    size="1"
                    style={{
                      color: selectedAnnotationIds.size > 0 
                        ? theme.colors.status.success 
                        : theme.colors.text.secondary,
                      fontWeight: 600,
                      fontFeatureSettings: '"tnum"',
                    }}
                  >
                    {selectedAnnotationIds.size}
                  </Text>
                </Flex>
              </Flex>
            </Box>
          </Box>
        )}

        {/* Center - Image Viewer (Full Screen Focus) */}
        <Box
          style={{
            flex: 1,
            background: theme.colors.background.secondary,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Debug overlay */}
          <Box
            style={{
              position: "absolute",
              top: theme.spacing.semantic.component.sm,
              right: theme.spacing.semantic.component.sm,
              background: `${theme.colors.background.card}F0`,
              color: theme.colors.text.primary,
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.md,
              padding: theme.spacing.semantic.component.xs,
              fontSize: "10px",
              fontFamily: "monospace",
              zIndex: 5,
              backdropFilter: "blur(4px)",
            }}
          >
                         <div>Image URL: {currentImage?.url ? '✓' : '✗'}</div>
             <div>URL: {currentImage?.url?.substring(0, 40)}...</div>
             <div>Dimensions: {currentImage?.width}x{currentImage?.height}</div>
             <div>Label Group: {currentLabelGroup?.label || 'none'}</div>
             <div>Items: {currentGroupItems.length}</div>
             <div>Selected: {selectedAnnotationIds.size}</div>
             <div>Zoom: {state.zoom.toFixed(2)}</div>
             <div>Pan: ({state.panOffset.x.toFixed(0)}, {state.panOffset.y.toFixed(0)})</div>
          </Box>
          
          {currentImage ? (
            <Suspense fallback={
              <Flex
                align="center"
                justify="center"
                style={{
                  height: "100%",
                  color: theme.colors.text.secondary,
                }}
              >
                <Box
                  style={{
                    width: "24px",
                    height: "24px",
                    border: `3px solid ${theme.colors.interactive.primary}40`,
                    borderTop: `3px solid ${theme.colors.interactive.primary}`,
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginRight: theme.spacing.semantic.component.sm,
                  }}
                />
                <Text size="2" style={{ color: theme.colors.text.secondary }}>
                  Loading Image Viewer...
                </Text>
              </Flex>
            }>
              <ImageViewer
                imageUrl={currentImage.url}
                imageWidth={currentImage.width}
                imageHeight={currentImage.height}
                zoom={state.zoom}
                panOffset={state.panOffset}
                boundingBoxes={currentGroupItems
                  .filter(item => item.annotation.type === 'bbox')
                  .map(item => item.itemData)
                }
                polygons={currentGroupItems
                  .filter(item => item.annotation.type === 'segmentation')
                  .map(item => item.itemData)
                }
                currentTool={state.currentPhase === 'bbox' ? 'bbox' : state.currentPhase === 'segmentation' ? 'segmentation' : 'label'}
                selectedLabel={currentLabelGroup?.label || ""}
                isDrawing={false}
                onZoomChange={actions.setZoom}
                onPanChange={actions.setPanOffset}
                onAddBoundingBox={() => {}}
                onAddPolygon={() => {}}
                setDrawing={() => {}}
                onPreviousImage={handlePreviousLabelGroup}
                onNextImage={handleNextLabelGroup}
                canGoPrevious={currentLabelGroupIndex > 0}
                canGoNext={currentLabelGroupIndex < annotationGroups.length - 1}
              />
            </Suspense>
          ) : (
            /* No Image Fallback */
            <Flex
              direction="column"
              align="center"
              justify="center"
              style={{
                height: "100%",
                color: theme.colors.text.secondary,
                textAlign: "center",
              }}
            >
              <Shield size={48} style={{ color: theme.colors.text.tertiary, marginBottom: theme.spacing.semantic.component.md }} />
              <Text
                size="3"
                style={{
                  fontWeight: 600,
                  color: theme.colors.text.primary,
                  marginBottom: theme.spacing.semantic.component.xs,
                }}
              >
                No Image Available
              </Text>
              <Text
                size="2"
                style={{
                  color: theme.colors.text.secondary,
                  lineHeight: 1.5,
                }}
              >
                {annotationGroups.length === 0 
                  ? 'No label groups pending validation in this phase'
                  : 'Current label group has no associated image data'
                }
              </Text>
              <Text
                size="1"
                style={{
                  color: theme.colors.text.tertiary,
                  marginTop: theme.spacing.semantic.component.sm,
                  fontFamily: 'monospace',
                }}
              >
                Debug: Current group index {currentLabelGroupIndex}, Total groups {annotationGroups.length}
              </Text>
            </Flex>
          )}
          
          {/* Annotation Selection Controls */}
          {currentGroupItems.length > 0 && (
            <Box
              style={{
                position: "absolute",
                top: theme.spacing.semantic.component.lg,
                left: "50%",
                transform: "translateX(-50%)",
                background: `${theme.colors.background.card}F0`,
                backdropFilter: "blur(8px)",
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.lg,
                padding: theme.spacing.semantic.component.sm,
                boxShadow: theme.shadows.semantic.card.medium,
                zIndex: 10,
                maxWidth: "90%",
                overflow: "auto",
              }}
            >
              <Flex align="center" gap="2" wrap="wrap">
                <Text size="1" style={{ color: theme.colors.text.secondary, fontWeight: 600 }}>
                  {currentLabelGroup.label} annotations:
                </Text>
                
                <Button
                  onClick={selectAllItems}
                  style={{
                    background: "transparent",
                    color: theme.colors.interactive.primary,
                    border: `1px solid ${theme.colors.interactive.primary}`,
                    borderRadius: theme.borders.radius.xs,
                    padding: "2px 6px",
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                >
                  Select All
                </Button>
                
                <Button
                  onClick={clearAllSelections}
                  style={{
                    background: "transparent",
                    color: theme.colors.text.secondary,
                    border: `1px solid ${theme.colors.border.primary}`,
                    borderRadius: theme.borders.radius.xs,
                    padding: "2px 6px",
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                >
                  Clear
                </Button>
                
                {currentGroupItems.map((item, index) => (
                  <Button
                    key={item.itemId}
                    onClick={() => toggleItemSelection(item.itemId)}
                    style={{
                      background: selectedAnnotationIds.has(item.itemId)
                        ? theme.colors.status.success
                        : theme.colors.background.secondary,
                      color: selectedAnnotationIds.has(item.itemId)
                        ? theme.colors.text.inverse
                        : theme.colors.text.primary,
                      border: `1px solid ${selectedAnnotationIds.has(item.itemId)
                        ? theme.colors.status.success
                        : theme.colors.border.primary}`,
                      borderRadius: theme.borders.radius.xs,
                      padding: "4px 8px",
                      fontSize: "11px",
                      cursor: "pointer",
                      fontWeight: selectedAnnotationIds.has(item.itemId) ? 600 : 400,
                    }}
                  >
                    #{index + 1}
                  </Button>
                ))}
              </Flex>
            </Box>
          )}

          {/* Validation Action Overlay */}
          <Box
            style={{
              position: "absolute",
              bottom: theme.spacing.semantic.component.lg,
              left: "50%",
              transform: "translateX(-50%)",
              background: `${theme.colors.background.card}F0`,
              backdropFilter: "blur(8px)",
              border: `1px solid ${theme.colors.border.primary}`,
              borderRadius: theme.borders.radius.lg,
              padding: theme.spacing.semantic.component.md,
              boxShadow: theme.shadows.semantic.card.high,
              zIndex: 10,
            }}
          >
            <Flex align="center" gap="3">
              <Button
                onClick={() => handleBulkValidation('approve')}
                disabled={selectedAnnotationIds.size === 0 || isValidating}
                style={{
                  background: selectedAnnotationIds.size > 0 ? theme.colors.status.success : theme.colors.interactive.disabled,
                  color: theme.colors.text.inverse,
                  border: "none",
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: selectedAnnotationIds.size > 0 && !isValidating ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.semantic.component.sm,
                  minWidth: "120px",
                  justifyContent: "center",
                  opacity: isValidating ? 0.6 : 1,
                }}
              >
                <CheckCircle size={16} weight="fill" />
                Approve ({selectedAnnotationIds.size})
              </Button>
              
              <Button
                onClick={() => handleBulkValidation('reject')}
                disabled={selectedAnnotationIds.size === 0 || isValidating}
                style={{
                  background: selectedAnnotationIds.size > 0 ? theme.colors.status.error : theme.colors.interactive.disabled,
                  color: theme.colors.text.inverse,
                  border: "none",
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: selectedAnnotationIds.size > 0 && !isValidating ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.semantic.component.sm,
                  minWidth: "120px",
                  justifyContent: "center",
                  opacity: isValidating ? 0.6 : 1,
                }}
              >
                <XCircle size={16} weight="fill" />
                Reject ({selectedAnnotationIds.size})
              </Button>
              
              <Button
                onClick={() => handleBulkValidation('flag')}
                disabled={selectedAnnotationIds.size === 0 || isValidating}
                style={{
                  background: selectedAnnotationIds.size > 0 ? theme.colors.status.warning : theme.colors.interactive.disabled,
                  color: theme.colors.text.inverse,
                  border: "none",
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: selectedAnnotationIds.size > 0 && !isValidating ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.semantic.component.sm,
                  minWidth: "120px",
                  justifyContent: "center",
                  opacity: isValidating ? 0.6 : 1,
                }}
              >
                <Flag size={16} weight="fill" />
                Flag ({selectedAnnotationIds.size})
              </Button>
            </Flex>
            
                        {/* Navigation Controls */}
            <Flex justify="center" align="center" gap="2" style={{ marginTop: theme.spacing.semantic.component.sm }}>
              <Button
                onClick={handlePreviousLabelGroup}
                disabled={currentLabelGroupIndex === 0}
                style={{
                  background: "transparent",
                  color: currentLabelGroupIndex === 0 ? theme.colors.text.tertiary : theme.colors.text.primary,
                  border: `1px solid ${currentLabelGroupIndex === 0 ? theme.colors.border.secondary : theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  padding: theme.spacing.semantic.component.xs,
                  cursor: currentLabelGroupIndex === 0 ? "not-allowed" : "pointer",
                }}
              >
                <ArrowLeft size={14} />
              </Button>
              
              <Text
                size="1"
                style={{
                  color: theme.colors.text.secondary,
                  fontFeatureSettings: '"tnum"',
                  minWidth: "80px",
                  textAlign: "center",
                }}
              >
                Group {currentLabelGroupIndex + 1} / {annotationGroups.length}
              </Text>
              
              <Button
                onClick={handleNextLabelGroup}
                disabled={currentLabelGroupIndex === annotationGroups.length - 1}
                style={{
                  background: "transparent",
                  color: currentLabelGroupIndex === annotationGroups.length - 1 ? theme.colors.text.tertiary : theme.colors.text.primary,
                  border: `1px solid ${currentLabelGroupIndex === annotationGroups.length - 1 ? theme.colors.border.secondary : theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  padding: theme.spacing.semantic.component.xs,
                  cursor: currentLabelGroupIndex === annotationGroups.length - 1 ? "not-allowed" : "pointer",
                }}
              >
                <ArrowRight size={14} />
              </Button>
          </Flex>
          </Box>
          
          {/* Show/Hide Details Button */}
          {!showAnnotationDetails && (
            <Button
              onClick={() => setShowAnnotationDetails(true)}
              style={{
                position: "absolute",
                top: theme.spacing.semantic.component.lg,
                left: theme.spacing.semantic.component.lg,
                background: `${theme.colors.background.card}F0`,
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.md,
                padding: theme.spacing.semantic.component.sm,
                cursor: "pointer",
                backdropFilter: "blur(8px)",
                boxShadow: theme.shadows.semantic.card.medium,
              }}
            >
              <Eye size={14} />
            </Button>
          )}
          
          {/* Validation Status Indicator */}
          {isValidating && (
            <Box
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: `${theme.colors.background.card}F0`,
                color: theme.colors.text.primary,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: theme.borders.radius.lg,
                padding: theme.spacing.semantic.component.lg,
                backdropFilter: "blur(8px)",
                boxShadow: theme.shadows.semantic.card.high,
                zIndex: 20,
              }}
            >
              <Flex direction="column" align="center" gap="2">
                <Box
                  style={{
                    width: "24px",
                    height: "24px",
                    border: `3px solid ${theme.colors.interactive.primary}40`,
                    borderTop: `3px solid ${theme.colors.interactive.primary}`,
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 500 }}>
                  Processing Validation...
                </Text>
              </Flex>
            </Box>
          )}
        </Box>
      </Flex>

      {/* Keyboard Shortcuts Panel */}
      {showKeyboardShortcuts && (
        <Box
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: theme.colors.background.card,
            border: `1px solid ${theme.colors.border.primary}`,
            borderRadius: theme.borders.radius.lg,
            padding: theme.spacing.semantic.component.lg,
            boxShadow: theme.shadows.semantic.card.high,
            zIndex: 100,
            minWidth: "400px",
          }}
        >
          <Flex justify="between" align="center" style={{ marginBottom: theme.spacing.semantic.component.md }}>
            <Text
              size="3"
              style={{
                fontWeight: 600,
                color: theme.colors.text.primary,
              }}
            >
              Keyboard Shortcuts
            </Text>
            <Button
              onClick={() => setShowKeyboardShortcuts(false)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: theme.colors.text.secondary,
              }}
            >
              <XCircle size={16} />
            </Button>
          </Flex>
          
                    <Flex direction="column" gap="3">
            <Flex justify="between" align="center">
              <Text size="2" style={{ color: theme.colors.text.primary }}>Approve Selected</Text>
              <Badge style={{ background: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: "11px", padding: "4px 8px" }}>A</Badge>
            </Flex>
            <Flex justify="between" align="center">
              <Text size="2" style={{ color: theme.colors.text.primary }}>Reject Selected</Text>
              <Badge style={{ background: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: "11px", padding: "4px 8px" }}>R</Badge>
            </Flex>
            <Flex justify="between" align="center">
              <Text size="2" style={{ color: theme.colors.text.primary }}>Flag Selected</Text>
              <Badge style={{ background: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: "11px", padding: "4px 8px" }}>F</Badge>
            </Flex>
            <Flex justify="between" align="center">
              <Text size="2" style={{ color: theme.colors.text.primary }}>Next Label Group</Text>
              <Badge style={{ background: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: "11px", padding: "4px 8px" }}>→</Badge>
            </Flex>
            <Flex justify="between" align="center">
              <Text size="2" style={{ color: theme.colors.text.primary }}>Previous Label Group</Text>
              <Badge style={{ background: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: "11px", padding: "4px 8px" }}>←</Badge>
            </Flex>
            <Flex justify="between" align="center">
              <Text size="2" style={{ color: theme.colors.text.primary }}>Select All Annotations</Text>
              <Badge style={{ background: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: "11px", padding: "4px 8px" }}>S</Badge>
            </Flex>
            <Flex justify="between" align="center">
              <Text size="2" style={{ color: theme.colors.text.primary }}>Clear All Selections</Text>
              <Badge style={{ background: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: "11px", padding: "4px 8px" }}>C</Badge>
            </Flex>
            <Flex justify="between" align="center">
              <Text size="2" style={{ color: theme.colors.text.primary }}>Toggle Auto Advance</Text>
              <Badge style={{ background: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: "11px", padding: "4px 8px" }}>Space</Badge>
            </Flex>
            <Flex justify="between" align="center">
              <Text size="2" style={{ color: theme.colors.text.primary }}>Toggle Details Panel</Text>
              <Badge style={{ background: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: "11px", padding: "4px 8px" }}>D</Badge>
            </Flex>
            <Flex justify="between" align="center">
              <Text size="2" style={{ color: theme.colors.text.primary }}>Show/Hide This Help</Text>
              <Badge style={{ background: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: "11px", padding: "4px 8px" }}>H</Badge>
            </Flex>
        </Flex>
        </Box>
      )}

      <style>
        {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        `}
      </style>
    </Box>
  );
} 