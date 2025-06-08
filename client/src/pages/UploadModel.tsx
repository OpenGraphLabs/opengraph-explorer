import { Box, Flex, Text, Button, Grid } from "@/shared/ui/design-system/components";
import { Card } from "@/shared/ui/design-system/components/Card";
import { PageHeader } from "@/shared/ui/design-system/components/PageHeader";
import { useTheme } from "@/shared/ui/design-system";
import { ModelUploader } from "@/features/model/components/upload-steps/ModelUploader.tsx";
import { DatasetSelection } from "@/features/model/components/upload-steps/DatasetSelection";
import {
  DatasetCard,
  ModelInfoForm,
  StepHeader,
  UploadButton,
} from "@/features/model/components";
import { useDatasetSelection, useModelUploadFlow } from "@/features/model/hooks";
import { 
  ReloadIcon, 
  CheckCircledIcon, 
  ExclamationTriangleIcon,
  ChevronRightIcon,
  CheckIcon,
  CircleIcon,
  ClockIcon
} from "@radix-ui/react-icons";
import { 
  Brain, 
  Upload,
  Database,
  TestTube,
  Info,
  Rocket,
  CheckCircle,
  Clock,
  Warning,
  Sparkle
} from "phosphor-react";

export function UploadModel() {
  const { theme } = useTheme();

  // Dataset selection logic
  const {
    datasetInfo,
    filters,
    getAllUniqueTags,
    getFilteredDatasets,
    toggleTag,
    clearTags,
    setSearchQuery,
    selectTrainingDataset,
    removeTrainingDataset,
    addTestDataset,
    removeTestDataset,
    clearTestDatasets,
  } = useDatasetSelection();

  // Model upload flow logic
  const {
    modelInfo,
    updateModelInfo,
    selectedFile,
    isConverting,
    conversionStatus,
    conversionProgress,
    convertedModel,
    conversionError,
    handleFileSelect,
    resetUploadState,
    uploadState,
    clearUploadError,
    handleUpload,
    isReadyForUpload,
  } = useModelUploadFlow();

  const filteredDatasets = getFilteredDatasets();

  const onUpload = () => {
    handleUpload(datasetInfo.selectedTrainingDataset, datasetInfo.selectedTestDatasets);
  };

  // Helper function to check if model conversion is complete
  const isModelConversionComplete = () => {
    return selectedFile && !isConverting && !conversionError && convertedModel && 
           (conversionStatus.includes('completed') || conversionStatus.includes('conversion completed'));
  };

  // Step completion logic
  const steps = [
    {
      key: 'upload',
      title: 'Model Upload',
      description: 'Upload your .h5 model file',
      icon: Upload,
      completed: isModelConversionComplete(),
      active: !selectedFile || isConverting || conversionError,
      hasError: !!conversionError
    },
    {
      key: 'training',
      title: 'Training Dataset',
      description: 'Select training data',
      icon: Database,
      completed: !!datasetInfo.selectedTrainingDataset,
      active: isModelConversionComplete() && !datasetInfo.selectedTrainingDataset,
      hasError: false
    },
    {
      key: 'testing',
      title: 'Test Datasets',
      description: 'Optional test data',
      icon: TestTube,
      completed: datasetInfo.selectedTestDatasets.length > 0,
      active: isModelConversionComplete() && datasetInfo.selectedTrainingDataset && datasetInfo.selectedTestDatasets.length === 0,
      hasError: false,
      optional: true
    },
    {
      key: 'info',
      title: 'Model Details',
      description: 'Metadata & configuration',
      icon: Info,
      completed: modelInfo.name && modelInfo.description && modelInfo.modelType,
      active: !!datasetInfo.selectedTrainingDataset && (!modelInfo.name || !modelInfo.description || !modelInfo.modelType),
      hasError: false
    },
    {
      key: 'deploy',
      title: 'Deploy',
      description: 'Deploy to Sui blockchain',
      icon: Rocket,
      completed: uploadState.uploadSuccess,
      active: isReadyForUpload() && !uploadState.transactionInProgress,
      hasError: !!uploadState.uploadError
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
          <Brain size={18} style={{ color: theme.colors.interactive.primary }} />
          <Text size="3" style={{ fontWeight: 600, color: theme.colors.text.primary }}>
            Model Deployment Pipeline
          </Text>
        </Flex>
        <Flex align="center" gap="2">
          <Text size="1" style={{ color: theme.colors.text.tertiary }}>
            {steps.filter(s => s.completed).length}/{steps.filter(s => !s.optional).length + (datasetInfo.selectedTestDatasets.length > 0 ? 1 : 0)} Complete
          </Text>
          {datasetInfo.selectedTestDatasets.length === 0 && (
            <Text size="1" style={{ color: theme.colors.text.tertiary, fontStyle: "italic" }}>
              (1 optional skipped)
            </Text>
          )}
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
                      : step.optional
                        ? `${theme.colors.text.tertiary}20`
                        : theme.colors.background.secondary,
                color: step.completed || step.hasError || step.active 
                  ? theme.colors.text.inverse 
                  : step.optional 
                    ? theme.colors.text.tertiary
                    : theme.colors.text.inverse,
                border: step.active && !step.completed 
                  ? `2px solid ${theme.colors.interactive.primary}` 
                  : step.optional && !step.completed && !step.active
                    ? `1px dashed ${theme.colors.text.tertiary}40`
                    : "none",
              }}
            >
              {step.completed ? (
                <CheckIcon style={{ width: 14, height: 14 }} />
              ) : step.hasError ? (
                <ExclamationTriangleIcon style={{ width: 14, height: 14 }} />
              ) : step.active ? (
                <CircleIcon style={{ width: 8, height: 8 }} />
              ) : step.optional ? (
                <Text size="1" style={{ fontWeight: 600, fontSize: "10px" }}>?</Text>
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
                  height: step.optional && !step.completed && !step.active ? "0px" : "1px",
                  background: step.completed 
                    ? theme.colors.status.success 
                    : step.optional && !step.active
                      ? `${theme.colors.text.tertiary}30`
                      : theme.colors.border.primary,
                  marginLeft: theme.spacing.semantic.component.xs,
                  borderTop: step.optional && !step.completed && !step.active
                    ? `1px dashed ${theme.colors.text.tertiary}40`
                    : "none",
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
              Deploy AI Model
            </Text>
            <br />
            <Text
              size="3"
              style={{
                color: theme.colors.text.secondary,
                lineHeight: 1.5,
              }}
            >
              Transform your machine learning model into a fully onchain, verifiable AI agent on Sui blockchain
            </Text>
          </Box>
        </Flex>
      </Box>

      {/* Progress Indicator */}
      <ProgressIndicator />

      <Flex direction="column" gap={theme.spacing.semantic.section.sm}>
        {/* Step 1: Model Upload */}
        <Card
          elevation="low"
          style={{
            padding: theme.spacing.semantic.component.lg,
            borderRadius: theme.borders.radius.lg,
                          border: `1px solid ${
                conversionError 
                  ? theme.colors.status.error + "40"
                  : isModelConversionComplete()
                    ? theme.colors.status.success + "40"
                    : theme.colors.border.primary
              }`,
            background: theme.colors.background.card,
            transition: "all 0.2s ease",
          }}
        >
          <SectionHeader
            icon={<Upload size={18} style={{ 
              color: conversionError 
                ? theme.colors.status.error 
                : isModelConversionComplete() 
                  ? theme.colors.status.success 
                  : theme.colors.interactive.primary
            }} />}
            title="Upload & Convert Model"
            description="Upload your .h5 model file for automatic conversion to onchain format"
                          status={conversionError ? 'error' : isModelConversionComplete() ? 'completed' : 'active'}
            isActive={!selectedFile || isConverting}
          />

          <ModelUploader
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            isConverting={isConverting}
            conversionStatus={conversionStatus}
            conversionProgress={conversionProgress}
            error={conversionError}
            resetUploadState={resetUploadState}
          />
        </Card>

        {/* Steps 2 & 3: Dataset Selection */}
        <Card
          elevation="low"
          style={{
            padding: theme.spacing.semantic.component.md,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${theme.colors.border.primary}`,
            background: isModelConversionComplete()
              ? theme.colors.background.card
              : `${theme.colors.background.card}80`,
            overflow: "hidden",
          }}
        >

        <SectionHeader
          icon={<Database size={18} style={{ 
            color: datasetInfo.selectedTrainingDataset
              ? datasetInfo.selectedTestDatasets.length > 0
                ? theme.colors.status.success
                : theme.colors.interactive.primary  
              : theme.colors.text.tertiary
          }} />}
          title="Dataset Selection"
          description="Choose training data and optional test datasets for your model deployment"
          status={
            datasetInfo.selectedTrainingDataset
              ? datasetInfo.selectedTestDatasets.length > 0
                ? "completed"
                : "active"  
              : "pending"
          }
          isActive={!!isModelConversionComplete()}
        />

          <DatasetSelection
            filters={filters}
            filteredDatasets={filteredDatasets}
            searchQuery={""} // Note: searchQuery is handled internally by filters
            allTags={getAllUniqueTags()}
            selectedTrainingDataset={datasetInfo.selectedTrainingDataset}
            selectedTestDatasets={datasetInfo.selectedTestDatasets}
            onSearchChange={setSearchQuery}
            onTagToggle={toggleTag}
            onClearTags={clearTags}
            onSelectTrainingDataset={selectTrainingDataset}
            onRemoveTrainingDataset={removeTrainingDataset}
            onAddTestDataset={addTestDataset}
            onRemoveTestDataset={removeTestDataset}
            onClearTestDatasets={clearTestDatasets}
            availableDatasetCount={datasetInfo.availableDatasets.length}
          />
        </Card>

        {/* Step 4: Model Information */}
        <Card
          elevation="low"
          style={{
            padding: theme.spacing.semantic.component.lg,
            borderRadius: theme.borders.radius.lg,
            border: `1px solid ${
              modelInfo.name && modelInfo.description && modelInfo.modelType
                ? theme.colors.status.success + "40"
                : theme.colors.border.primary
            }`,
            background: datasetInfo.selectedTrainingDataset 
              ? theme.colors.background.card
              : `${theme.colors.background.card}80`,
            transition: "all 0.2s ease",
          }}
        >
          <SectionHeader
            icon={<Info size={18} style={{ 
              color: modelInfo.name && modelInfo.description && modelInfo.modelType 
                ? theme.colors.status.success 
                : theme.colors.text.tertiary
            }} />}
            title="Model Metadata"
            description="Provide model details for onchain registry and discoverability"
            status={modelInfo.name && modelInfo.description && modelInfo.modelType ? 'completed' : 'pending'}
            isActive={!!datasetInfo.selectedTrainingDataset && (!modelInfo.name || !modelInfo.description || !modelInfo.modelType)}
          />

          <ModelInfoForm modelInfo={modelInfo} onUpdate={updateModelInfo} />
        </Card>

        {/* Step 5: Final Deployment */}
        <Card
          elevation="medium"
          style={{
            padding: theme.spacing.semantic.component.lg,
            borderRadius: theme.borders.radius.lg,
            border: `2px solid ${
              uploadState.uploadSuccess 
                ? theme.colors.status.success
                : uploadState.uploadError
                  ? theme.colors.status.error
                  : theme.colors.interactive.primary
            }`,
            background: uploadState.uploadSuccess 
              ? `${theme.colors.status.success}05`
              : uploadState.uploadError
                ? `${theme.colors.status.error}05`
                : theme.colors.background.card,
            marginBottom: theme.spacing.semantic.section.sm,
            transition: "all 0.3s ease",
          }}
        >
          <SectionHeader
            icon={<Rocket size={18} style={{ 
              color: uploadState.uploadSuccess 
                ? theme.colors.status.success 
                : uploadState.uploadError 
                  ? theme.colors.status.error 
                  : theme.colors.interactive.primary
            }} />}
            title="Deploy to Blockchain"
            description="Finalize deployment to Sui blockchain with full onchain inference capabilities"
            status={uploadState.uploadSuccess ? 'completed' : uploadState.uploadError ? 'error' : 'active'}
          />

          <UploadButton
            uploadState={uploadState}
            isReadyForUpload={isReadyForUpload()}
            onUpload={onUpload}
            onRetry={onUpload}
            onClearError={clearUploadError}
          />
        </Card>
      </Flex>

      {/* Enhanced floating notifications */}
      {uploadState.uploadError && (
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
                 Deployment Failed
               </Text>
             </Flex>
            <Text
              size="2"
              style={{
                color: theme.colors.text.inverse,
                lineHeight: 1.4,
              }}
            >
              {uploadState.uploadError}
            </Text>
            <Flex gap="2" mt="2">
              <Button
                onClick={clearUploadError}
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
                onClick={onUpload}
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
                Retry Deployment
              </Button>
            </Flex>
          </Flex>
        </Card>
      )}

      {uploadState.uploadSuccess && (
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
                Deployment Successful!
              </Text>
            </Flex>
            <Text
              size="2"
              style={{
                color: theme.colors.text.inverse,
                lineHeight: 1.4,
              }}
            >
              Your AI model is now live on Sui blockchain with full onchain inference capabilities.
            </Text>
            {uploadState.transactionHash && (
              <Box
                style={{
                  background: `${theme.colors.text.inverse}20`,
                  padding: theme.spacing.semantic.component.sm,
                  borderRadius: theme.borders.radius.sm,
                  border: `1px solid ${theme.colors.text.inverse}30`,
                }}
              >
                <Text
                  size="1"
                  style={{
                    fontFamily: "monospace",
                    color: theme.colors.text.inverse,
                    fontWeight: 500,
                  }}
                >
                                              TX: {uploadState.transactionHash?.substring(0, 16)}...
                </Text>
              </Box>
            )}
          </Flex>
        </Card>
      )}

      {uploadState.transactionInProgress && (
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
                Deploying to Blockchain
              </Text>
            </Flex>
            <Text
              size="2"
              style={{
                color: theme.colors.text.inverse,
                lineHeight: 1.4,
              }}
            >
              Processing your transaction on Sui network. This may take a few moments...
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
