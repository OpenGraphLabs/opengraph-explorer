import { useEffect, useRef, useState, useCallback } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

export interface Detection {
  class: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

interface UseObjectDetectionOptions {
  enabled?: boolean;
  scoreThreshold?: number;
  maxDetections?: number;
}

export function useObjectDetection(options: UseObjectDetectionOptions = {}) {
  const {
    enabled = true,
    scoreThreshold = 0.5,
    maxDetections = 10
  } = options;

  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [fps, setFps] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const animationFrameRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsUpdateIntervalRef = useRef<number>();

  // Load the COCO-SSD model
  useEffect(() => {
    if (!enabled) return;

    const loadModel = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Loading COCO-SSD model...');
        
        const loadedModel = await cocoSsd.load({
          base: 'lite_mobilenet_v2' // Use lighter model for better performance
        });
        
        setModel(loadedModel);
        console.log('COCO-SSD model loaded successfully');
      } catch (err) {
        console.error('Failed to load model:', err);
        setError('Failed to load object detection model');
      } finally {
        setIsLoading(false);
      }
    };

    loadModel();
  }, [enabled]);

  // FPS calculation
  useEffect(() => {
    if (!enabled) return;

    fpsUpdateIntervalRef.current = window.setInterval(() => {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastFrameTimeRef.current;
      
      if (deltaTime > 0) {
        const currentFps = Math.round((frameCountRef.current * 1000) / deltaTime);
        setFps(currentFps);
      }
      
      frameCountRef.current = 0;
      lastFrameTimeRef.current = currentTime;
    }, 1000);

    return () => {
      if (fpsUpdateIntervalRef.current) {
        clearInterval(fpsUpdateIntervalRef.current);
      }
    };
  }, [enabled]);

  // Detect objects in video frame
  const detectObjects = useCallback(async (video: HTMLVideoElement) => {
    if (!model || !video || video.readyState !== 4) return;

    try {
      const predictions = await model.detect(video, maxDetections, scoreThreshold);
      
      const formattedDetections: Detection[] = predictions.map(pred => ({
        class: pred.class,
        score: pred.score,
        bbox: pred.bbox as [number, number, number, number]
      }));

      setDetections(formattedDetections);
      frameCountRef.current++;
    } catch (err) {
      console.error('Detection error:', err);
    }
  }, [model, maxDetections, scoreThreshold]);

  // Start continuous detection
  const startDetection = useCallback((video: HTMLVideoElement) => {
    if (!model || !video) return;

    const detect = async () => {
      await detectObjects(video);
      animationFrameRef.current = requestAnimationFrame(detect);
    };

    detect();
  }, [model, detectObjects]);

  // Stop detection
  const stopDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
    setDetections([]);
    setFps(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
      if (fpsUpdateIntervalRef.current) {
        clearInterval(fpsUpdateIntervalRef.current);
      }
    };
  }, [stopDetection]);

  return {
    detections,
    isLoading,
    error,
    fps,
    startDetection,
    stopDetection,
    isModelReady: !!model && !isLoading
  };
}