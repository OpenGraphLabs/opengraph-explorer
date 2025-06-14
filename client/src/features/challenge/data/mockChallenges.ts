import { Challenge, Participation, AnnotationSubmission } from "../types/challenge";

// Mock Challenge Data with real SUI-compatible dataset IDs
export const mockChallenges: Challenge[] = [
  {
    id: "challenge-1",
    title: "Sea Animal Classification",
    description:
      "Guess the sea animal in the image! seaotter, sealion, seal, dugong, walrus",
    datasetId: "0x9c934c125d6f2174dba54d04231a4f4049b350aabbb657a36a278b826c20f0a9",
    datasetName: "Sea Animal Dataset",
    ownerId: "owner-1",
    ownerAddress: "0x1234...abcd",

    status: "active",
    currentPhase: "label",

    bounty: {
      totalAmount: 5000,
      currency: "SUI",
      distribution: {
        label: 30,
        bbox: 50,
        segmentation: 20,
      },
      qualityBonus: 15,
    },

    timeline: {
      startDate: new Date("2024-01-15"),
      endDate: new Date("2024-02-15"),
      phases: {
        label: {
          start: new Date("2024-01-15"),
          end: new Date("2024-01-25"),
        },
        bbox: {
          start: new Date("2024-01-20"),
          end: new Date("2024-02-05"),
        },
        segmentation: {
          start: new Date("2024-01-30"),
          end: new Date("2024-02-10"),
        },
        validation: {
          start: new Date("2024-02-10"),
          end: new Date("2024-02-15"),
        },
      },
    },

    requirements: {
      minQualityScore: 0.8,
      maxParticipants: 50,
      requiredAnnotationsPerImage: 3,
      validationThreshold: 2,
    },

    stats: {
      totalParticipants: 23,
      activeParticipants: 18,
      completedAnnotations: 847,
      pendingValidations: 124,
      averageQualityScore: 0.87,
    },

    validators: {
      allowedValidators: ["user-2", "user-3"], // Different validators for challenge-1
      requireValidatorApproval: true,
      validationRewards: 10,
    },

    tags: ["computer-vision", "autonomous-driving", "object-detection", "urban"],
    difficulty: "intermediate",

    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-20"),
  },
  {
    id: "challenge-2",
    title: "Urban Traffic Image Annotation",
    description:
      "Annotate urban traffic images to improve autonomous driving systems and enhance road safety.",
    datasetId: "0x8974c0fbb3b2c91baa9bc9bd47791542ebe5706d5005e4f99939d127545b8e80",
    datasetName: "Urban Traffic Dataset",
    ownerId: "owner-3",
    ownerAddress: "0x9abc...ijkl",

    status: "active",
    currentPhase: "bbox",

    // 이미지별 미리 정의된 label 목록
    predefinedLabels: {
      0: ["traffic light", "car", "people"], // 첫 번째 이미지: 3개 label
      1: ["people", "car"], // 두 번째 이미지: 2개 label
      2: ["people", "car", "bicycle"], // 세 번째 이미지: 3개 label
    },

    bounty: {
      totalAmount: 2500,
      currency: "SUI",
      distribution: {
        label: 60,
        bbox: 30,
        segmentation: 10,
      },
      qualityBonus: 10,
    },

    timeline: {
      startDate: new Date("2024-01-25"),
      endDate: new Date("2024-03-01"),
      phases: {
        label: {
          start: new Date("2024-01-25"),
          end: new Date("2024-02-10"),
        },
        bbox: {
          start: new Date("2024-02-05"),
          end: new Date("2024-02-20"),
        },
        segmentation: {
          start: new Date("2024-02-15"),
          end: new Date("2024-02-25"),
        },
        validation: {
          start: new Date("2024-02-25"),
          end: new Date("2024-03-01"),
        },
      },
    },

    requirements: {
      minQualityScore: 0.75,
      requiredAnnotationsPerImage: 2,
      validationThreshold: 2,
    },

    stats: {
      totalParticipants: 34,
      activeParticipants: 28,
      completedAnnotations: 1203,
      pendingValidations: 0,
      averageQualityScore: 0.81,
    },

    validators: {
      allowedValidators: ["user-3", "user-5"],
      requireValidatorApproval: false,
      validationRewards: 8,
    },

    tags: ["wildlife", "classification", "conservation", "camera-trap"],
    difficulty: "beginner",

    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-25"),
  },
];

// Mock Participation Data
export const mockParticipations: Participation[] = [
  {
    id: "participation-1",
    challengeId: "challenge-1",
    participantId: "user-1",
    participantAddress: "0xabc123...def",

    joinedAt: new Date("2024-01-16"),
    status: "active",

    progress: {
      label: { completed: 45, total: 50 },
      bbox: { completed: 23, total: 50 },
      segmentation: { completed: 0, total: 50 },
    },

    earnings: {
      pending: 145.5,
      confirmed: 89.2,
      paid: 0,
    },

    qualityScore: 0.91,
    ranking: 3,
  },

  {
    id: "participation-2",
    challengeId: "challenge-2",
    participantId: "user-1",
    participantAddress: "0xabc123...def",

    joinedAt: new Date("2024-01-03"),
    status: "completed",

    progress: {
      label: { completed: 25, total: 25 },
      bbox: { completed: 25, total: 25 },
      segmentation: { completed: 25, total: 25 },
    },

    earnings: {
      pending: 0,
      confirmed: 267.8,
      paid: 267.8,
    },

    qualityScore: 0.94,
    ranking: 1,
  },

  {
    id: "participation-3",
    challengeId: "challenge-3",
    participantId: "user-1",
    participantAddress: "0xabc123...def",

    joinedAt: new Date("2024-01-26"),
    status: "active",

    progress: {
      label: { completed: 67, total: 80 },
      bbox: { completed: 0, total: 80 },
      segmentation: { completed: 0, total: 80 },
    },

    earnings: {
      pending: 89.4,
      confirmed: 0,
      paid: 0,
    },

    qualityScore: 0.83,
    ranking: 7,
  },
];

// Mock Annotation Submissions
export const mockAnnotationSubmissions: AnnotationSubmission[] = [
  {
    id: "annotation-1",
    challengeId: "challenge-1",
    participantId: "user-1",
    dataId: "data-blob-1",

    type: "label",
    data: {
      labels: ["car", "pedestrian", "traffic_light", "stop_sign"],
    },

    status: "validated",
    validationScore: 0.92,
    validatedBy: "validator-1",
    validatedAt: new Date("2024-01-18"),

    submittedAt: new Date("2024-01-17"),
  },

  {
    id: "annotation-2",
    challengeId: "challenge-1",
    participantId: "user-1",
    dataId: "data-blob-1",

    type: "bbox",
    data: {
      boundingBoxes: [
        {
          label: "car",
          x: 150,
          y: 200,
          width: 180,
          height: 120,
          confidence: 0.95,
        },
        {
          label: "pedestrian",
          x: 350,
          y: 180,
          width: 60,
          height: 150,
          confidence: 0.88,
        },
      ],
    },

    status: "pending",

    submittedAt: new Date("2024-01-22"),
  },
];

// Helper functions for mock data
export const getChallengeById = (id: string): Challenge | undefined => {
  return mockChallenges.find(challenge => challenge.id === id);
};

export const getParticipationsByUserId = (userId: string): Participation[] => {
  return mockParticipations.filter(p => p.participantId === userId);
};

export const getParticipationByChallengeAndUser = (
  challengeId: string,
  userId: string
): Participation | undefined => {
  return mockParticipations.find(p => p.challengeId === challengeId && p.participantId === userId);
};

export const getActiveChallenges = (): Challenge[] => {
  return mockChallenges.filter(c => c.status === "active");
};

export const getCompletedChallenges = (): Challenge[] => {
  return mockChallenges.filter(c => c.status === "completed");
};
