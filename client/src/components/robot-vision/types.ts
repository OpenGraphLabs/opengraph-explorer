export interface CaptureTask {
  id: string;
  title: string;
  description: string;
  targetObjects?: string[]; // Expected objects to detect
  requiredCount?: number; // Minimum number of objects needed
  icon?: string;
}

export const CAPTURE_TASKS: CaptureTask[] = [
  {
    id: "desk",
    title: "Take a picture of your desk",
    description: "Capture your workspace including computer, keyboard, and mouse",
    targetObjects: ["laptop", "keyboard", "mouse", "tv", "monitor"],
    requiredCount: 1,
    icon: "🖥️",
  },
  {
    id: "kitchen",
    title: "Take a picture of your kitchen",
    description: "Capture kitchen appliances and utensils",
    targetObjects: ["refrigerator", "oven", "microwave", "sink", "bottle", "cup", "bowl"],
    requiredCount: 2,
    icon: "🍳",
  },
  {
    id: "livingroom",
    title: "Take a picture of your living room",
    description: "Capture furniture and entertainment devices",
    targetObjects: ["couch", "chair", "tv", "remote", "book"],
    requiredCount: 2,
    icon: "🛋️",
  },
  {
    id: "bookshelf",
    title: "Take a picture of your bookshelf",
    description: "Capture books and decorative items",
    targetObjects: ["book", "vase", "clock"],
    requiredCount: 3,
    icon: "📚",
  },
  {
    id: "pet",
    title: "Take a picture of your pet",
    description: "Capture your furry friend",
    targetObjects: ["cat", "dog", "bird"],
    requiredCount: 1,
    icon: "🐾",
  },
];
