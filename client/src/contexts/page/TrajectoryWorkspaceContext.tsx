import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { useImagesContext } from "@/contexts/data/ImagesContext";
import { useApprovedAnnotationsByImage } from "@/shared/hooks/useApiQuery";
import type { AnnotationClientRead } from "@/shared/api/generated/models";

interface Point {
  x: number;
  y: number;
}

interface TrajectoryPoint extends Point {
  id: string;
  type: 'start' | 'end' | 'waypoint';
  maskId?: number;
}

interface TrajectoryTask {
  id: string;
  description: string;
  startMaskCategories: number[];
  endMaskCategories: number[];
  difficulty: "Easy" | "Medium" | "Hard";
  reward: string;
}

interface TrajectoryWorkspaceContextType {
  // Task management
  selectedTask: TrajectoryTask | null;
  availableTasks: TrajectoryTask[];
  handleTaskSelect: (task: TrajectoryTask) => void;

  // Drawing state
  isDrawingMode: boolean;
  handleStartDrawing: () => void;
  handleStopDrawing: () => void;
  handleEndDrawing: (path: Point[]) => void;

  // Robot and trajectory state
  robotHandPosition: Point | null;
  startPoint: TrajectoryPoint | null;
  endPoint: TrajectoryPoint | null;
  trajectoryPath: Point[];
  activeTrajectoryMasks: number[];

  // Interaction handlers
  handleTrajectoryPointAdd: (point: TrajectoryPoint) => void;
  handleRobotHandMove: (position: Point) => void;
  handleResetTrajectory: () => void;
  handleSubmitTrajectory: () => void;

  // Data
  approvedAnnotations: AnnotationClientRead[];
  annotationsLoading: boolean;

  // Status
  canStartDrawing: boolean;
  isTrajectoryComplete: boolean;
}

const TrajectoryWorkspaceContext = createContext<TrajectoryWorkspaceContextType | null>(null);

export function useTrajectoryWorkspace() {
  const context = useContext(TrajectoryWorkspaceContext);
  if (!context) {
    throw new Error('useTrajectoryWorkspace must be used within TrajectoryWorkspaceProvider');
  }
  return context;
}

export function TrajectoryWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { selectedImage } = useImagesContext();
  
  // Load approved annotations for the selected image
  const { data: approvedAnnotationsData, isLoading: annotationsLoading } = useApprovedAnnotationsByImage(
    selectedImage?.id || 0,
    {
      enabled: !!selectedImage?.id,
      refetchOnWindowFocus: false,
    } as any
  );
  
  const approvedAnnotations = useMemo(() => {
    return approvedAnnotationsData || [];
  }, [approvedAnnotationsData]);

  // Task state
  const [selectedTask, setSelectedTask] = useState<TrajectoryTask | null>(null);

  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  // Robot and trajectory state
  const [robotHandPosition, setRobotHandPosition] = useState<Point | null>(null);
  const [startPoint, setStartPoint] = useState<TrajectoryPoint | null>(null);
  const [endPoint, setEndPoint] = useState<TrajectoryPoint | null>(null);
  const [trajectoryPath, setTrajectoryPath] = useState<Point[]>([]);

  // Hardcoded tasks and mask mappings per image - in real app, these would come from API
  const hardcodedImageTasks = useMemo(() => {
    if (!selectedImage) return { tasks: [], maskMappings: {} };
    
    const imageId = selectedImage.id;
    
    // Create tasks specific to this image based on available annotations
    const imageTasks: TrajectoryTask[] = [
      {
        id: `image-${imageId}-task-1`,
        description: `Draw trajectory from first object to second object (Image ${imageId})`,
        startMaskCategories: [], // Will be filled dynamically
        endMaskCategories: [], // Will be filled dynamically
        difficulty: "Easy",
        reward: "5 $OPEN"
      },
      {
        id: `image-${imageId}-task-2`, 
        description: `Plan robot path for object manipulation task (Image ${imageId})`,
        startMaskCategories: [], // Will be filled dynamically
        endMaskCategories: [], // Will be filled dynamically
        difficulty: "Medium",
        reward: "8 $OPEN"
      }
    ];

    // Create mask mappings for each task
    const maskMappings: { [taskId: string]: { startMask: number; endMask: number } } = {};
    
    if (approvedAnnotations.length >= 2) {
      // Assign first two annotations to first task
      maskMappings[imageTasks[0].id] = {
        startMask: approvedAnnotations[0].id,
        endMask: approvedAnnotations[1].id
      };
      
      // Assign second and third annotations to second task (with fallback)
      const secondTaskStart = approvedAnnotations.length > 2 ? approvedAnnotations[1].id : approvedAnnotations[0].id;
      const secondTaskEnd = approvedAnnotations.length > 2 ? approvedAnnotations[2].id : approvedAnnotations[1].id;
      
      maskMappings[imageTasks[1].id] = {
        startMask: secondTaskStart,
        endMask: secondTaskEnd
      };
    }
    
    return { tasks: imageTasks, maskMappings };
  }, [selectedImage, approvedAnnotations]);

  const availableTasks = approvedAnnotations.length >= 2 ? hardcodedImageTasks.tasks : [];

  // Get active trajectory masks based on selected task (hardcoded mapping)
  const activeTrajectoryMasks = useMemo(() => {
    if (!selectedTask || !approvedAnnotations.length) return [];
    
    const taskMapping = hardcodedImageTasks.maskMappings[selectedTask.id];
    if (!taskMapping) return [];
    
    const selectedMasks = [taskMapping.startMask, taskMapping.endMask];
    
    console.log(`Task ${selectedTask.id} - Selected masks:`, {
      startMask: taskMapping.startMask,
      endMask: taskMapping.endMask,
      selectedMasks
    });
    
    return selectedMasks;
  }, [selectedTask, approvedAnnotations, hardcodedImageTasks.maskMappings]);

  // Initialize robot hand position when image or task changes
  useEffect(() => {
    if (selectedImage && selectedTask) {
      // Default robot hand position at bottom center of image
      setRobotHandPosition({
        x: selectedImage.width / 2,
        y: selectedImage.height * 0.8
      });
    }
  }, [selectedImage, selectedTask]);

  // Reset state when task changes
  useEffect(() => {
    setStartPoint(null);
    setEndPoint(null);
    setTrajectoryPath([]);
    setIsDrawingMode(false);
  }, [selectedTask]);

  // Task management
  const handleTaskSelect = useCallback((task: TrajectoryTask) => {
    setSelectedTask(task);
  }, []);

  // Drawing management
  const handleStartDrawing = useCallback(() => {
    if (!startPoint || !endPoint) return;
    setIsDrawingMode(true);
  }, [startPoint, endPoint]);

  const handleStopDrawing = useCallback(() => {
    setIsDrawingMode(false);
  }, []);

  const handleEndDrawing = useCallback((path: Point[]) => {
    setTrajectoryPath(path);
    setIsDrawingMode(false);
  }, []);

  // Trajectory point management
  const handleTrajectoryPointAdd = useCallback((point: TrajectoryPoint) => {
    if (point.type === 'start') {
      setStartPoint(point);
      // If this is a new start point and we already had an end point, clear the trajectory
      if (endPoint) {
        setTrajectoryPath([]);
      }
    } else if (point.type === 'end') {
      setEndPoint(point);
      // If we already had a trajectory, clear it since we have a new end point
      if (trajectoryPath.length > 0) {
        setTrajectoryPath([]);
      }
    }
  }, [endPoint, trajectoryPath.length]);

  const handleRobotHandMove = useCallback((position: Point) => {
    setRobotHandPosition(position);
  }, []);

  const handleResetTrajectory = useCallback(() => {
    setStartPoint(null);
    setEndPoint(null);
    setTrajectoryPath([]);
    setIsDrawingMode(false);
  }, []);

  const handleSubmitTrajectory = useCallback(async () => {
    if (!selectedTask || !startPoint || !endPoint || trajectoryPath.length === 0) {
      console.warn('Cannot submit incomplete trajectory');
      return;
    }

    try {
      // In a real app, this would submit to the API
      const trajectoryData = {
        taskId: selectedTask.id,
        imageId: selectedImage?.id,
        startPoint,
        endPoint,
        trajectoryPath,
        timestamp: new Date().toISOString()
      };

      console.log('Submitting trajectory:', trajectoryData);
      
      // Show success feedback and reset
      alert(`Trajectory submitted successfully! You earned ${selectedTask.reward}`);
      handleResetTrajectory();
      setSelectedTask(null);

    } catch (error) {
      console.error('Failed to submit trajectory:', error);
      alert('Failed to submit trajectory. Please try again.');
    }
  }, [selectedTask, startPoint, endPoint, trajectoryPath, selectedImage, handleResetTrajectory]);

  // Computed properties
  const canStartDrawing = useMemo(() => {
    return !!(selectedTask && startPoint && endPoint && !isDrawingMode && trajectoryPath.length === 0);
  }, [selectedTask, startPoint, endPoint, isDrawingMode, trajectoryPath.length]);

  const isTrajectoryComplete = useMemo(() => {
    return !!(selectedTask && startPoint && endPoint && trajectoryPath.length > 1);
  }, [selectedTask, startPoint, endPoint, trajectoryPath.length]);

  const contextValue: TrajectoryWorkspaceContextType = {
    // Task management
    selectedTask,
    availableTasks,
    handleTaskSelect,

    // Drawing state
    isDrawingMode,
    handleStartDrawing,
    handleStopDrawing,
    handleEndDrawing,

    // Robot and trajectory state
    robotHandPosition,
    startPoint,
    endPoint,
    trajectoryPath,
    activeTrajectoryMasks,

    // Interaction handlers
    handleTrajectoryPointAdd,
    handleRobotHandMove,
    handleResetTrajectory,
    handleSubmitTrajectory,

    // Data
    approvedAnnotations,
    annotationsLoading,

    // Status
    canStartDrawing,
    isTrajectoryComplete,
  };

  return (
    <TrajectoryWorkspaceContext.Provider value={contextValue}>
      {children}
    </TrajectoryWorkspaceContext.Provider>
  );
}