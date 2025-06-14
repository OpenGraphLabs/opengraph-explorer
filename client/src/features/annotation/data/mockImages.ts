import { ImageData } from "../types/workspace";

export const mockImages: ImageData[] = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop",
    filename: "street_scene_01.jpg",
    width: 800,
    height: 600,
    completed: false,
    skipped: false,
    annotations: {
      labels: [],
      boundingBoxes: [],
      polygons: [],
    },
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop",
    filename: "city_traffic_02.jpg",
    width: 800,
    height: 600,
    completed: true,
    skipped: false,
    annotations: {
      labels: [{ id: "label1", label: "urban_scene", confidence: 0.95 }],
      boundingBoxes: [
        { id: "bbox1", x: 100, y: 150, width: 120, height: 80, label: "car", confidence: 0.92 },
        { id: "bbox2", x: 300, y: 200, width: 60, height: 180, label: "person", confidence: 0.88 },
      ],
      polygons: [],
    },
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
    filename: "modern_house_03.jpg",
    width: 800,
    height: 600,
    completed: false,
    skipped: false,
    annotations: {
      labels: [],
      boundingBoxes: [
        {
          id: "bbox3",
          x: 200,
          y: 100,
          width: 400,
          height: 300,
          label: "building",
          confidence: 0.96,
        },
      ],
      polygons: [
        {
          id: "polygon1",
          points: [
            { x: 150, y: 50 },
            { x: 250, y: 50 },
            { x: 300, y: 150 },
            { x: 200, y: 180 },
            { x: 100, y: 120 },
          ],
          label: "roof",
          confidence: 0.89,
        },
      ],
    },
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=800&h=600&fit=crop",
    filename: "animals_dogs_04.jpg",
    width: 800,
    height: 600,
    completed: false,
    skipped: true,
    annotations: {
      labels: [],
      boundingBoxes: [],
      polygons: [],
    },
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop",
    filename: "office_workspace_05.jpg",
    width: 800,
    height: 600,
    completed: false,
    skipped: false,
    annotations: {
      labels: [],
      boundingBoxes: [],
      polygons: [],
    },
  },
  {
    id: "6",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    filename: "nature_mountain_06.jpg",
    width: 800,
    height: 600,
    completed: false,
    skipped: false,
    annotations: {
      labels: [{ id: "label2", label: "landscape", confidence: 0.98 }],
      boundingBoxes: [],
      polygons: [],
    },
  },
  {
    id: "7",
    url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop",
    filename: "technology_code_07.jpg",
    width: 800,
    height: 600,
    completed: false,
    skipped: false,
    annotations: {
      labels: [],
      boundingBoxes: [],
      polygons: [],
    },
  },
  {
    id: "8",
    url: "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=800&h=600&fit=crop",
    filename: "food_breakfast_08.jpg",
    width: 800,
    height: 600,
    completed: false,
    skipped: false,
    annotations: {
      labels: [],
      boundingBoxes: [],
      polygons: [],
    },
  },
];

export const getImageById = (id: string): ImageData | undefined => {
  return mockImages.find(image => image.id === id);
};

export const getCompletedImages = (): ImageData[] => {
  return mockImages.filter(image => image.completed);
};

export const getSkippedImages = (): ImageData[] => {
  return mockImages.filter(image => image.skipped);
};

export const getPendingImages = (): ImageData[] => {
  return mockImages.filter(image => !image.completed && !image.skipped);
};

export const getImageStats = () => {
  const total = mockImages.length;
  const completed = getCompletedImages().length;
  const skipped = getSkippedImages().length;
  const pending = getPendingImages().length;

  return {
    total,
    completed,
    skipped,
    pending,
    completionRate: total > 0 ? (completed / total) * 100 : 0,
  };
};
