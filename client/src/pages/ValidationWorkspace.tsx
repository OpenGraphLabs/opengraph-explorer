import { useState, useCallback, useEffect, Suspense } from 'react';
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
  const [currentAnnotationIndex, setCurrentAnnotationIndex] = useState(0);
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
  
  // Current annotation and image
  const currentAnnotation = currentPhaseAnnotations[currentAnnotationIndex];
  const currentImage = currentAnnotation ? 
    effectiveImages.find(img => img.id === currentAnnotation.dataId) : 
    effectiveImages[0];
  
  // Navigation handlers
  const handleNextAnnotation = useCallback(() => {
    if (currentAnnotationIndex < currentPhaseAnnotations.length - 1) {
      setCurrentAnnotationIndex(prev => prev + 1);
    }
  }, [currentAnnotationIndex, currentPhaseAnnotations.length]);
  
  const handlePreviousAnnotation = useCallback(() => {
    if (currentAnnotationIndex > 0) {
      setCurrentAnnotationIndex(prev => prev - 1);
    }
  }, [currentAnnotationIndex]);
  
  // Quick validation handler
  const handleQuickValidation = useCallback(async (action: 'approve' | 'reject' | 'flag', reason?: string) => {
    if (!currentAnnotation || isValidating) return;
    
    setIsValidating(true);
    try {
      await actions.validateAnnotation(currentAnnotation.id, action, reason);
      
      // Auto advance if enabled and not the last annotation
      if (autoAdvance && currentAnnotationIndex < currentPhaseAnnotations.length - 1) {
        setTimeout(() => {
          handleNextAnnotation();
          setIsValidating(false);
        }, 500);
      } else {
        setIsValidating(false);
      }
    } catch (error) {
      console.error('Validation failed:', error);
      setIsValidating(false);
    }
  }, [currentAnnotation, isValidating, actions, autoAdvance, currentAnnotationIndex, currentPhaseAnnotations.length, handleNextAnnotation]);

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
      currentAnnotationIndex,
      currentAnnotation,
      currentImage,
      effectiveImages: effectiveImages.length,
      validationSession: state.validationSession,
    });
  }, [challengeId, state.currentPhase, currentPhaseAnnotations.length, currentAnnotationIndex, currentAnnotation, currentImage, effectiveImages.length, state.validationSession]);

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
          handleQuickValidation('approve');
          break;
        case 'r':
          event.preventDefault();
          handleQuickValidation('reject');
          break;
        case 'f':
          event.preventDefault();
          handleQuickValidation('flag');
          break;
        case 'arrowright':
          event.preventDefault();
          handleNextAnnotation();
          break;
        case 'arrowleft':
          event.preventDefault();
          handlePreviousAnnotation();
          break;
        case ' ':
          event.preventDefault();
          setAutoAdvance(!autoAdvance);
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
  }, [isValidating, handleQuickValidation, handleNextAnnotation, handlePreviousAnnotation, autoAdvance, showKeyboardShortcuts, showAnnotationDetails]);

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
            {/* Annotation Progress */}
            <Text
              size="1"
              style={{
                color: theme.colors.text.secondary,
                fontFeatureSettings: '"tnum"',
              }}
            >
              {currentAnnotationIndex + 1} / {currentPhaseAnnotations.length}
            </Text>
            
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
        {/* Left Side - Annotation Details (Optional) */}
        {showAnnotationDetails && currentAnnotation && (
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
                  Current Annotation
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
                    {currentAnnotation.type}
                  </Badge>
                </Flex>
                
                <Flex align="center" gap="2">
                  <Text size="1" style={{ color: theme.colors.text.tertiary }}>Quality:</Text>
                  <Text
                    size="1"
                    style={{
                      color: currentAnnotation.qualityScore > 0.8 
                        ? theme.colors.status.success 
                        : currentAnnotation.qualityScore > 0.6 
                          ? theme.colors.status.warning 
                          : theme.colors.status.error,
                      fontWeight: 600,
                      fontFeatureSettings: '"tnum"',
                    }}
                  >
                    {(currentAnnotation.qualityScore * 100).toFixed(0)}%
                  </Text>
                </Flex>
                
                <Flex align="center" gap="2">
                  <Text size="1" style={{ color: theme.colors.text.tertiary }}>Participant:</Text>
                  <Text
                    size="1"
                    style={{
                      color: theme.colors.text.secondary,
                      fontFamily: 'monospace',
                      fontSize: "10px",
                    }}
                  >
                    {currentAnnotation.participantAddress.slice(0, 8)}...
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
             <div>Annotation Type: {currentAnnotation?.type || 'none'}</div>
             <div>BBoxes: {currentAnnotation?.type === 'bbox' ? currentAnnotation.data.boundingBoxes?.length || 0 : 0}</div>
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
                boundingBoxes={currentAnnotation?.type === 'bbox' ? (currentAnnotation.data.boundingBoxes || []) : []}
                polygons={currentAnnotation?.type === 'segmentation' ? (currentAnnotation.data.polygons || []) : []}
                currentTool={currentAnnotation?.type || "label"}
                selectedLabel=""
                isDrawing={false}
                onZoomChange={actions.setZoom}
                onPanChange={actions.setPanOffset}
                onAddBoundingBox={() => {}}
                onAddPolygon={() => {}}
                setDrawing={() => {}}
                onPreviousImage={handlePreviousAnnotation}
                onNextImage={handleNextAnnotation}
                canGoPrevious={currentAnnotationIndex > 0}
                canGoNext={currentAnnotationIndex < currentPhaseAnnotations.length - 1}
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
                {currentPhaseAnnotations.length === 0 
                  ? 'No annotations pending validation in this phase'
                  : 'Current annotation has no associated image data'
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
                Debug: Current annotation index {currentAnnotationIndex}, Total annotations {currentPhaseAnnotations.length}
              </Text>
            </Flex>
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
                onClick={() => handleQuickValidation('approve')}
                disabled={!currentAnnotation || isValidating}
                style={{
                  background: theme.colors.status.success,
                  color: theme.colors.text.inverse,
                  border: "none",
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: currentAnnotation && !isValidating ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.semantic.component.sm,
                  minWidth: "100px",
                  justifyContent: "center",
                  opacity: isValidating ? 0.6 : 1,
                }}
              >
                <CheckCircle size={16} weight="fill" />
                Approve (A)
              </Button>
              
              <Button
                onClick={() => handleQuickValidation('reject')}
                disabled={!currentAnnotation || isValidating}
                style={{
                  background: theme.colors.status.error,
                  color: theme.colors.text.inverse,
                  border: "none",
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: currentAnnotation && !isValidating ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.semantic.component.sm,
                  minWidth: "100px",
                  justifyContent: "center",
                  opacity: isValidating ? 0.6 : 1,
                }}
              >
                <XCircle size={16} weight="fill" />
                Reject (R)
              </Button>
              
              <Button
                onClick={() => handleQuickValidation('flag')}
                disabled={!currentAnnotation || isValidating}
                style={{
                  background: theme.colors.status.warning,
                  color: theme.colors.text.inverse,
                  border: "none",
                  borderRadius: theme.borders.radius.md,
                  padding: `${theme.spacing.semantic.component.sm} ${theme.spacing.semantic.component.md}`,
                  fontWeight: 600,
                  fontSize: "14px",
                  cursor: currentAnnotation && !isValidating ? "pointer" : "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: theme.spacing.semantic.component.sm,
                  minWidth: "100px",
                  justifyContent: "center",
                  opacity: isValidating ? 0.6 : 1,
                }}
              >
                <Flag size={16} weight="fill" />
                Flag (F)
              </Button>
            </Flex>
            
            {/* Navigation Controls */}
            <Flex justify="center" align="center" gap="2" style={{ marginTop: theme.spacing.semantic.component.sm }}>
              <Button
                onClick={handlePreviousAnnotation}
                disabled={currentAnnotationIndex === 0}
                style={{
                  background: "transparent",
                  color: currentAnnotationIndex === 0 ? theme.colors.text.tertiary : theme.colors.text.primary,
                  border: `1px solid ${currentAnnotationIndex === 0 ? theme.colors.border.secondary : theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  padding: theme.spacing.semantic.component.xs,
                  cursor: currentAnnotationIndex === 0 ? "not-allowed" : "pointer",
                }}
              >
                <ArrowLeft size={14} />
              </Button>
              
              <Text
                size="1"
                style={{
                  color: theme.colors.text.secondary,
                  fontFeatureSettings: '"tnum"',
                  minWidth: "60px",
                  textAlign: "center",
                }}
              >
                {currentAnnotationIndex + 1} / {currentPhaseAnnotations.length}
              </Text>
              
              <Button
                onClick={handleNextAnnotation}
                disabled={currentAnnotationIndex === currentPhaseAnnotations.length - 1}
                style={{
                  background: "transparent",
                  color: currentAnnotationIndex === currentPhaseAnnotations.length - 1 ? theme.colors.text.tertiary : theme.colors.text.primary,
                  border: `1px solid ${currentAnnotationIndex === currentPhaseAnnotations.length - 1 ? theme.colors.border.secondary : theme.colors.border.primary}`,
                  borderRadius: theme.borders.radius.sm,
                  padding: theme.spacing.semantic.component.xs,
                  cursor: currentAnnotationIndex === currentPhaseAnnotations.length - 1 ? "not-allowed" : "pointer",
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
              <Text size="2" style={{ color: theme.colors.text.primary }}>Approve Annotation</Text>
              <Badge style={{ background: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: "11px", padding: "4px 8px" }}>A</Badge>
            </Flex>
            <Flex justify="between" align="center">
              <Text size="2" style={{ color: theme.colors.text.primary }}>Reject Annotation</Text>
              <Badge style={{ background: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: "11px", padding: "4px 8px" }}>R</Badge>
            </Flex>
            <Flex justify="between" align="center">
              <Text size="2" style={{ color: theme.colors.text.primary }}>Flag for Review</Text>
              <Badge style={{ background: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: "11px", padding: "4px 8px" }}>F</Badge>
            </Flex>
            <Flex justify="between" align="center">
              <Text size="2" style={{ color: theme.colors.text.primary }}>Next Annotation</Text>
              <Badge style={{ background: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: "11px", padding: "4px 8px" }}>→</Badge>
            </Flex>
            <Flex justify="between" align="center">
              <Text size="2" style={{ color: theme.colors.text.primary }}>Previous Annotation</Text>
              <Badge style={{ background: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: "11px", padding: "4px 8px" }}>←</Badge>
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