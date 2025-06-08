import { Box, Flex, Text, Button } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { useTheme } from "@/shared/ui/design-system";
import {
  useDatasetUpload,
  DatasetMetadataForm,
  FileUploadSection,
} from "@/features/dataset";
import { 
  ReloadIcon, 
  ExclamationTriangleIcon,
  ChevronRightIcon,
  CheckIcon,
  CircleIcon
} from "@radix-ui/react-icons";
import { 
  Database, 
  Upload,
  FileText,
  Info,
  CloudArrowUp,
  CheckCircle,
  Clock,
  Warning,
  Sparkle,
  ChartLineUp
} from "phosphor-react";

export function UploadDataset() {
  const { theme } = useTheme();
  const {
    // State
    metadata,
    selectedFiles,
    previewStep,
    uploadProgress,
    isLoading,
    error,
    uploadSuccess,
    totalFileSize,
    fileCount,

    // Metadata management
    updateMetadata,
    addTag,
    removeTag,

    // File management
    handleFileSelect,
    handleFileRemove,
    clearAllFiles,

    // Upload process
    handleUpload,
    isUploadDisabled,
    setError,
  } = useDatasetUpload();

  // Helper function to check if metadata is complete
  const isMetadataComplete = () => {
    return metadata.name.trim() && metadata.description.trim() && metadata.dataType;
  };

  // Helper function to check if files are ready
  const isFilesReady = () => {
    return selectedFiles.length > 0;
  };

  // Step completion logic
  const steps = [
    {
      key: 'metadata',
      title: 'Dataset Metadata',
      description: 'Define dataset properties',
      icon: Info,
      completed: isMetadataComplete(),
      active: !isMetadataComplete(),
      hasError: false
    },
    {
      key: 'upload',
      title: 'Data Files',
      description: 'Upload training data',
      icon: Upload,
      completed: isFilesReady() && uploadProgress.status === 'success',
      active: isMetadataComplete() && !isFilesReady(),
      hasError: !!error && !uploadSuccess
    },
    {
      key: 'deploy',
      title: 'Blockchain Storage',
      description: 'Deploy to Sui & Walrus',
      icon: CloudArrowUp,
      completed: uploadSuccess,
      active: isFilesReady() && !uploadSuccess && !error,
      hasError: !!error && isFilesReady()
    }
  ];

  // Progress indicator component
  const ProgressIndicator = () => (
    <Box
      style={{
        background: theme.colors.background.card,
        border: `1px solid ${theme.colors.border.primary}`,
        borderRadius: theme.borders.radius.lg,
        padding: theme.spacing.semantic.component.lg,
        marginBottom: theme.spacing.semantic.section.sm,
        position: "sticky",
        top: theme.spacing.semantic.layout.lg,
        zIndex: 10,
        backdropFilter: "blur(12px)",
        backgroundColor: `${theme.colors.background.card}F0`,
        boxShadow: `0 4px 12px ${theme.colors.background.overlay}20`,
      }}
    >
      <Flex justify="between" align="center" style={{ marginBottom: theme.spacing.semantic.component.md }}>
        <Flex align="center" gap="2">
          <Database size={18} style={{ color: theme.colors.interactive.primary }} />
          <Text size="3" style={{ fontWeight: 600, color: theme.colors.text.primary }}>
            Dataset Creation Pipeline
          </Text>
        </Flex>
        <Flex align="center" gap="2">
          <Text size="1" style={{ color: theme.colors.text.tertiary }}>
            {steps.filter(s => s.completed).length}/{steps.length} Complete
          </Text>
        </Flex>
      </Flex>
      
      <Flex align="center" gap="2">
        {steps.map((step: any, index) => (
          <Flex key={step.key} align="center" style={{ flex: 1 }}>
            <Flex 
              align="center" 
              justify="center"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: step.completed 
                  ? theme.colors.status.success 
                  : step.hasError 
                    ? theme.colors.status.error
                    : step.active 
                      ? theme.colors.interactive.primary 
                      : theme.colors.background.secondary,
                color: step.completed || step.hasError || step.active 
                  ? theme.colors.text.inverse 
                  : theme.colors.text.inverse,
                border: step.active && !step.completed 
                  ? `2px solid ${theme.colors.interactive.primary}` 
                  : "none",
              }}
            >
              {step.completed ? (
                <CheckIcon style={{ width: 14, height: 14 }} />
              ) : step.hasError ? (
                <ExclamationTriangleIcon style={{ width: 14, height: 14 }} />
              ) : step.active ? (
                <CircleIcon style={{ width: 8, height: 8 }} />
              ) : (
                <step.icon size={14} />
              )}
            </Flex>
            
            <Box style={{ marginLeft: theme.spacing.semantic.component.xs, flex: 1 }}>
              <Text 
                size="1" 
                style={{ 
                  fontWeight: 600, 
                  color: step.completed || step.active ? theme.colors.text.primary : theme.colors.text.tertiary,
                  display: "block"
                }}
              >
                {step.title}
              </Text>
              <Text 
                size="1" 
                style={{ 
                  color: theme.colors.text.tertiary,
                  fontSize: "10px"
                }}
              >
                {step.description}
              </Text>
            </Box>
            
            {index < steps.length - 1 && (
              <Box
                style={{
                  width: "24px",
                  height: "1px",
                  background: step.completed 
                    ? theme.colors.status.success 
                    : theme.colors.border.primary,
                  marginLeft: theme.spacing.semantic.component.xs,
                }}
              />
            )}
          </Flex>
        ))}
      </Flex>
    </Box>
  );

  // Enhanced section header component
  const SectionHeader = ({ 
    icon, 
    title, 
    description, 
    status,
    isActive,
    onExpand 
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    status?: 'completed' | 'error' | 'active' | 'pending';
    isActive?: boolean;
    onExpand?: () => void;
  }) => (
    <Flex 
      justify="between" 
      align="center" 
      style={{ 
        marginBottom: theme.spacing.semantic.component.md,
        padding: `${theme.spacing.semantic.component.sm} 0`,
        borderBottom: `1px solid ${theme.colors.border.primary}20`,
        cursor: onExpand ? "pointer" : "default"
      }}
      onClick={onExpand}
    >
      <Flex align="center" gap="3">
        <Box
          style={{
            width: "40px",
            height: "40px",
            borderRadius: theme.borders.radius.md,
            background: status === 'completed' 
              ? `${theme.colors.status.success}15`
              : status === 'error'
                ? `${theme.colors.status.error}15`
                : isActive 
                  ? `${theme.colors.interactive.primary}15`
                  : `${theme.colors.text.tertiary}10`,
            border: `1px solid ${
              status === 'completed' 
                ? `${theme.colors.status.success}30`
                : status === 'error'
                  ? `${theme.colors.status.error}30`
                  : isActive 
                    ? `${theme.colors.interactive.primary}30`
                    : `${theme.colors.text.tertiary}20`
            }`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Text 
            size="4" 
            style={{ 
              fontWeight: 600, 
              color: theme.colors.text.primary,
              marginBottom: "2px"
            }}
          >
            {title}
          </Text>
          <br />
          <Text 
            size="2" 
            style={{ 
              color: theme.colors.text.secondary,
              lineHeight: 1.4
            }}
          >
            {description}
          </Text>
        </Box>
      </Flex>
      
      {status && (
        <Flex align="center" gap="2">
          {status === 'completed' && (
            <Flex align="center" gap="1" style={{
              background: `${theme.colors.status.success}15`,
              padding: "4px 8px",
              borderRadius: theme.borders.radius.full,
              border: `1px solid ${theme.colors.status.success}30`
            }}>
              <CheckCircle size={12} style={{ color: theme.colors.status.success }} />
              <Text size="1" style={{ color: theme.colors.status.success, fontWeight: 500 }}>
                Complete
              </Text>
            </Flex>
          )}
          {status === 'error' && (
            <Flex align="center" gap="1" style={{
              background: `${theme.colors.status.error}15`,
              padding: "4px 8px",
              borderRadius: theme.borders.radius.full,
              border: `1px solid ${theme.colors.status.error}30`
            }}>
              <Warning size={12} style={{ color: theme.colors.status.error }} />
              <Text size="1" style={{ color: theme.colors.status.error, fontWeight: 500 }}>
                Error
              </Text>
            </Flex>
          )}
          {status === 'active' && (
            <Flex align="center" gap="1" style={{
              background: `${theme.colors.interactive.primary}15`,
              padding: "4px 8px", 
              borderRadius: theme.borders.radius.full,
              border: `1px solid ${theme.colors.interactive.primary}30`
            }}>
              <Clock size={12} style={{ color: theme.colors.interactive.primary }} />
              <Text size="1" style={{ color: theme.colors.interactive.primary, fontWeight: 500 }}>
                In Progress
              </Text>
            </Flex>
          )}
          {onExpand && (
            <ChevronRightIcon 
              style={{ 
                color: theme.colors.text.tertiary,
                transform: isActive ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease"
              }} 
            />
          )}
        </Flex>
      )}
    </Flex>
  );

  return (
    <Box
      style={{
        maxWidth: "1200px",
        margin: "0 auto", 
        padding: `0 ${theme.spacing.semantic.layout.md}`,
        background: theme.colors.background.primary,
        minHeight: "100vh",
      }}
    >
      {/* Enhanced Header */}
      <Box style={{ marginTop: theme.spacing.semantic.section.xxs }}>
        <Flex align="center" gap="3" style={{ marginBottom: theme.spacing.semantic.component.lg }}>
          <Box
            style={{
              width: "48px",
              height: "48px",
              borderRadius: theme.borders.radius.lg,
              background: `linear-gradient(135deg, ${theme.colors.interactive.primary}, ${theme.colors.interactive.primary}CC)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkle size={24} style={{ color: theme.colors.text.inverse }} />
          </Box>
          <Box>
            <Text
              size="6"
              style={{
                fontWeight: 700,
                color: theme.colors.text.primary,
                letterSpacing: "-0.02em",
                marginBottom: "4px"
              }}
            >
              Create Training Dataset
            </Text>
            <br />
            <Text
              size="3"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: 1.5,
              }}
            >
              Build verifiable training datasets for onchain machine learning with decentralized storage
            </Text>
          </Box>
        </Flex>

        {/* Dataset Stats */}
        {(isMetadataComplete() || fileCount > 0) && (
          <Flex 
            gap="4" 
            style={{ 
              marginBottom: theme.spacing.semantic.section.sm,
              padding: theme.spacing.semantic.component.md,
              background: `${theme.colors.interactive.primary}08`,
              borderRadius: theme.borders.radius.md,
              border: `1px solid ${theme.colors.interactive.primary}20`
            }}
          >
            {isMetadataComplete() && (
              <Flex align="center" gap="2">
                <ChartLineUp size={14} style={{ color: theme.colors.interactive.primary }} />
                <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 500 }}>
                  {metadata.dataType}
                </Text>
              </Flex>
            )}
            {fileCount > 0 && (
              <Flex align="center" gap="2">
                <FileText size={14} style={{ color: theme.colors.interactive.primary }} />
                <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 500 }}>
                  {fileCount} {fileCount === 1 ? 'file' : 'files'}
                </Text>
              </Flex>
            )}
            {totalFileSize > 0 && (
              <Flex align="center" gap="2">
                <Database size={14} style={{ color: theme.colors.interactive.primary }} />
                <Text size="2" style={{ color: theme.colors.text.primary, fontWeight: 500 }}>
                  {(totalFileSize / (1024 * 1024)).toFixed(2)} MB
                </Text>
              </Flex>
            )}
          </Flex>
        )}
      </Box>

      {/* Progress Indicator */}
      <ProgressIndicator />

      <Flex direction="column" gap={theme.spacing.semantic.section.sm}>
        {/* Step 1: Dataset Metadata */}
        <Card
          elevation="low"
          style={{
            padding: theme.spacing.semantic.component.lg,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${
              isMetadataComplete()
                ? theme.colors.status.success + "40"
                : theme.colors.border.primary
            }`,
            background: theme.colors.background.card,
            transition: "all 0.2s ease",
          }}
        >
          <SectionHeader
            icon={<Info size={18} style={{ 
              color: isMetadataComplete() 
                ? theme.colors.status.success 
                : theme.colors.interactive.primary
            }} />}
            title="Dataset Information"
            description="Define dataset properties, labels, and metadata for training verification"
            status={isMetadataComplete() ? 'completed' : 'active'}
            isActive={Boolean(!isMetadataComplete())}
          />

          <DatasetMetadataForm
            metadata={metadata}
            onUpdate={updateMetadata}
            onAddTag={addTag}
            onRemoveTag={removeTag}
          />
        </Card>

        {/* Step 2: File Upload */}
        <Card
          elevation="low"
          style={{
            padding: theme.spacing.semantic.component.lg,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${
              error && isFilesReady()
                ? theme.colors.status.error + "40"
                : uploadSuccess 
                  ? theme.colors.status.success + "40"
                  : theme.colors.border.primary
            }`,
            background: isMetadataComplete()
              ? theme.colors.background.card
              : `${theme.colors.background.card}80`,
            transition: "all 0.2s ease",
          }}
        >
          <SectionHeader
            icon={<Upload size={18} style={{ 
              color: error && isFilesReady()
                ? theme.colors.status.error
                : uploadSuccess 
                  ? theme.colors.status.success 
                  : isMetadataComplete()
                    ? theme.colors.interactive.primary
                    : theme.colors.text.tertiary
            }} />}
            title="Upload Data Files"
            description="Upload training data files for decentralized storage on Walrus network"
            status={
              error && isFilesReady() ? 'error' :
              uploadSuccess ? 'completed' :
              isMetadataComplete() ? 'active' : 'pending'
            }
            isActive={Boolean(isMetadataComplete() && !uploadSuccess)}
          />

          <FileUploadSection
            selectedFiles={selectedFiles}
            previewStep={previewStep}
            uploadProgress={uploadProgress}
            isLoading={isLoading}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            onClearAll={clearAllFiles}
            onUpload={handleUpload}
            isUploadDisabled={isUploadDisabled()}
          />
        </Card>
      </Flex>

      {/* Enhanced floating notifications */}
      {error && !uploadSuccess && (
        <Card
          style={{
            position: "fixed",
            bottom: theme.spacing.semantic.layout.md,
            right: theme.spacing.semantic.layout.md,
            padding: theme.spacing.semantic.component.md,
            backgroundColor: theme.colors.status.error,
            borderRadius: theme.borders.radius.lg,
            border: "none",
            boxShadow: theme.shadows.semantic.overlay.modal,
            zIndex: 1000,
            animation: "slideInFromRight 0.3s ease-out",
            maxWidth: "400px",
          }}
        >
          <Flex direction="column" gap="3">
            <Flex align="center" gap="3">
              <Warning size={20} style={{ color: theme.colors.text.inverse }} />
              <Text style={{ color: theme.colors.text.inverse, fontWeight: 600 }}>
                Upload Failed
              </Text>
            </Flex>
            <Text
              size="2"
              style={{
                color: theme.colors.text.inverse,
                lineHeight: 1.4,
              }}
            >
              {error}
            </Text>
                         <Flex gap="2" style={{ marginTop: theme.spacing.semantic.component.xs }}>
              <Button
                onClick={() => setError(null)}
                style={{
                  background: `${theme.colors.text.inverse}20`,
                  color: theme.colors.text.inverse,
                  cursor: "pointer",
                  borderRadius: theme.borders.radius.sm,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  fontSize: "12px",
                  border: `1px solid ${theme.colors.text.inverse}30`,
                  fontWeight: 500,
                }}
              >
                Dismiss
              </Button>
              <Button
                onClick={handleUpload}
                style={{
                  background: theme.colors.text.inverse,
                  color: theme.colors.status.error,
                  cursor: "pointer",
                  borderRadius: theme.borders.radius.sm,
                  padding: `${theme.spacing.semantic.component.xs} ${theme.spacing.semantic.component.sm}`,
                  fontSize: "12px",
                  border: "none",
                  fontWeight: 600,
                }}
              >
                Retry Upload
              </Button>
            </Flex>
          </Flex>
        </Card>
      )}

      {uploadSuccess && (
        <Card
          style={{
            position: "fixed",
            bottom: theme.spacing.semantic.layout.md,
            right: theme.spacing.semantic.layout.md,
            padding: theme.spacing.semantic.component.lg,
            backgroundColor: theme.colors.status.success,
            borderRadius: theme.borders.radius.lg,
            border: "none",
            boxShadow: theme.shadows.semantic.overlay.modal,
            zIndex: 1000,
            animation: "slideInFromRight 0.3s ease-out",
            maxWidth: "400px",
          }}
        >
          <Flex direction="column" gap="3">
            <Flex align="center" gap="3">
              <CheckCircle size={20} style={{ color: theme.colors.text.inverse }} />
              <Text style={{ color: theme.colors.text.inverse, fontWeight: 600 }}>
                Dataset Created Successfully!
              </Text>
            </Flex>
            <Text
              size="2"
              style={{
                color: theme.colors.text.inverse,
                lineHeight: 1.4,
              }}
            >
              Your dataset is now available on Sui blockchain with decentralized storage on Walrus.
            </Text>
          </Flex>
        </Card>
      )}

      {isLoading && uploadProgress.status !== 'idle' && (
        <Card
          style={{
            position: "fixed",
            bottom: theme.spacing.semantic.layout.md,
            right: theme.spacing.semantic.layout.md,
            padding: theme.spacing.semantic.component.lg,
            backgroundColor: theme.colors.interactive.primary,
            borderRadius: theme.borders.radius.lg,
            border: "none",
            boxShadow: theme.shadows.semantic.overlay.modal,
            zIndex: 1000,
            animation: "slideInFromRight 0.3s ease-out",
            maxWidth: "400px",
          }}
        >
          <Flex direction="column" gap="3">
            <Flex align="center" gap="3">
              <ReloadIcon
                style={{
                  color: theme.colors.text.inverse,
                  animation: "spin 1s linear infinite",
                  width: 20,
                  height: 20,
                }}
              />
              <Text style={{ color: theme.colors.text.inverse, fontWeight: 600 }}>
                {uploadProgress.status === 'uploading' ? 'Uploading to Walrus' : 
                 uploadProgress.status === 'creating' ? 'Creating on Sui' : 'Processing Dataset'}
              </Text>
            </Flex>
            <Text
              size="2"
              style={{
                color: theme.colors.text.inverse,
                lineHeight: 1.4,
              }}
            >
              {uploadProgress.message || 'Processing your dataset for blockchain storage...'}
            </Text>
          </Flex>
        </Card>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes slideInFromRight {
            from { 
              transform: translateX(100%); 
              opacity: 0; 
            }
            to { 
              transform: translateX(0); 
              opacity: 1; 
            }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}
      </style>
    </Box>
  );
}
