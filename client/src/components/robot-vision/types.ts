export interface CaptureTask {
  id: string;
  title: string;
  description: string;
  targetObjects?: string[]; // Expected objects to detect
  requiredCount?: number; // Minimum number of objects needed
  icon?: string;
}

// Space-specific task collections
export const SPACE_TASKS: Record<string, CaptureTask[]> = {
  kitchen: [
    {
      id: "kitchen-counter",
      title: "Capture the kitchen counter",
      description: "Include cooking appliances and preparation areas",
      targetObjects: ["microwave", "oven", "bottle", "cup", "bowl", "knife"],
      requiredCount: 2,
      icon: "🍳",
    },
    {
      id: "kitchen-sink",
      title: "Capture the sink area",
      description: "Include faucet, dish rack, and cleaning supplies",
      targetObjects: ["sink", "bottle", "cup", "spoon"],
      requiredCount: 1,
      icon: "🚰",
    },
    {
      id: "kitchen-appliances",
      title: "Capture major appliances",
      description: "Include refrigerator, stove, or dishwasher",
      targetObjects: ["refrigerator", "oven", "microwave"],
      requiredCount: 1,
      icon: "🔌",
    },
    {
      id: "kitchen-storage",
      title: "Capture storage areas",
      description: "Include cabinets, pantry, or shelves with items",
      targetObjects: ["bottle", "bowl", "cup"],
      requiredCount: 2,
      icon: "🗄️",
    },
  ],
  "living-room": [
    {
      id: "living-seating",
      title: "Capture the seating area",
      description: "Include sofa, chairs, and coffee table",
      targetObjects: ["couch", "chair", "tv", "remote"],
      requiredCount: 2,
      icon: "🛋️",
    },
    {
      id: "living-entertainment",
      title: "Capture the entertainment center",
      description: "Include TV, speakers, and media devices",
      targetObjects: ["tv", "remote", "laptop", "keyboard"],
      requiredCount: 1,
      icon: "📺",
    },
    {
      id: "living-decor",
      title: "Capture decorative elements",
      description: "Include plants, artwork, or decorative items",
      targetObjects: ["vase", "book", "clock", "potted plant"],
      requiredCount: 1,
      icon: "🖼️",
    },
    {
      id: "living-lighting",
      title: "Capture the room from window view",
      description: "Include natural light sources and lamps",
      targetObjects: ["couch", "chair", "tv"],
      requiredCount: 1,
      icon: "💡",
    },
  ],
  closet: [
    {
      id: "closet-clothes",
      title: "Capture hanging clothes",
      description: "Include organized clothing on hangers",
      targetObjects: ["tie", "handbag", "suitcase"],
      requiredCount: 1,
      icon: "👔",
    },
    {
      id: "closet-shoes",
      title: "Capture shoe storage",
      description: "Include shoe rack or floor shoe arrangement",
      targetObjects: ["handbag", "suitcase", "backpack"],
      requiredCount: 1,
      icon: "👞",
    },
    {
      id: "closet-accessories",
      title: "Capture accessories area",
      description: "Include bags, belts, or jewelry organizers",
      targetObjects: ["handbag", "tie", "backpack"],
      requiredCount: 1,
      icon: "👜",
    },
    {
      id: "closet-folded",
      title: "Capture folded items",
      description: "Include shelves with folded clothes or storage boxes",
      targetObjects: ["suitcase", "handbag"],
      requiredCount: 1,
      icon: "📦",
    },
  ],
  "dining-room": [
    {
      id: "dining-table",
      title: "Capture the dining table",
      description: "Include table setting and chairs",
      targetObjects: ["dining table", "chair", "bowl", "cup"],
      requiredCount: 2,
      icon: "🍽️",
    },
    {
      id: "dining-place-setting",
      title: "Capture a place setting",
      description: "Include plates, utensils, and glasses",
      targetObjects: ["fork", "knife", "spoon", "bowl", "cup", "wine glass"],
      requiredCount: 2,
      icon: "🥄",
    },
    {
      id: "dining-sideboard",
      title: "Capture the sideboard or buffet",
      description: "Include serving dishes or decorative items",
      targetObjects: ["vase", "bowl", "bottle", "wine glass"],
      requiredCount: 1,
      icon: "🏺",
    },
    {
      id: "dining-overview",
      title: "Capture the full dining space",
      description: "Include overall room arrangement",
      targetObjects: ["dining table", "chair"],
      requiredCount: 1,
      icon: "🪑",
    },
  ],
};

// Default tasks (fallback)
export const CAPTURE_TASKS: CaptureTask[] = [
  {
    id: "desk",
    title: "Take a picture of your desk",
    description: "Capture your workspace including computer, keyboard, and mouse",
    targetObjects: ["laptop", "keyboard", "mouse", "tv", "monitor"],
    requiredCount: 1,
    icon: "🖥️",
  },
  ...SPACE_TASKS.kitchen,
  ...SPACE_TASKS["living-room"],
];
