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

  // Sample trajectory tasks - in real app, these would come from API
  const availableTasks: TrajectoryTask[] = useMemo(() => [
    {
      id: "grab-trash-from-sofa",
      description: "Grab trash which is on sofa",
      startMaskCategories: [1], // robot hand
      endMaskCategories: [3, 4], // trash categories
      difficulty: "Easy",
      reward: "5 $OPEN"
    },
    {
      id: "place-trash-in-bin",
      description: "Place the trash in the trash bin", 
      startMaskCategories: [3, 4], // trash categories
      endMaskCategories: [2], // trash bin
      difficulty: "Medium",
      reward: "8 $OPEN"
    },
    {
      id: "clean-table-surface",
      description: "Clean all items from table surface",
      startMaskCategories: [1], // robot hand
      endMaskCategories: [5, 6, 7], // various objects
      difficulty: "Hard",
      reward: "12 $OPEN"
    },
    {
      id: "organize-desk-items",
      description: "Organize scattered items on desk",
      startMaskCategories: [1], // robot hand  
      endMaskCategories: [8, 9, 10], // desk items
      difficulty: "Medium",
      reward: "10 $OPEN"
    },
    {
      id: "fetch-water-bottle",
      description: "Fetch water bottle from shelf",
      startMaskCategories: [1], // robot hand
      endMaskCategories: [11], // water bottle
      difficulty: "Easy", 
      reward: "6 $OPEN"
    }
  ], []);

  // Get active trajectory masks based on selected task
  const activeTrajectoryMasks = useMemo(() => {
    if (!selectedTask || !approvedAnnotations.length) return [];
    
    const relevantMasks: number[] = [];
    
    console.log('Computing active masks for task:', selectedTask.id, {
      startCategories: selectedTask.startMaskCategories,
      endCategories: selectedTask.endMaskCategories,
      availableAnnotations: approvedAnnotations.length
    });
    
    // Add masks that match start or end categories
    approvedAnnotations.forEach((annotation: AnnotationClientRead) => {
      if (annotation.category_id && (
        selectedTask.startMaskCategories.includes(annotation.category_id) ||
        selectedTask.endMaskCategories.includes(annotation.category_id)
      )) {
        console.log(`Adding annotation ${annotation.id} (category ${annotation.category_id}) to active masks`);
        relevantMasks.push(annotation.id);
      }
    });
    
    console.log('Active trajectory masks:', relevantMasks);
    return relevantMasks;
  }, [selectedTask, approvedAnnotations]);

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