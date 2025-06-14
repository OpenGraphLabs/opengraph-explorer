import { Challenge, Participation, AnnotationSubmission } from "../types/challenge";

// Mock Challenge Data with real SUI-compatible dataset IDs
export const mockChallenges: Challenge[] = [
  {
    id: "challenge-1",
    title: "Sea Animal Classification",
    description:
      "Classify various sea animals in underwater images to support marine research and conservation efforts.",
    datasetId: "0xaf6a667fc2617d97a6b6e3387809db6173dc37dbe678024c80f7284864873f1b",
    datasetName: "Sea Animal Dataset",
    ownerId: "owner-1",
    ownerAddress: "0x1234...abcd",

    status: "active",
    currentPhase: "bbox",

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

    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-20"),
  },

  // {
  //   id: 'challenge-2',
  //   title: 'Medical Image Segmentation',
  //   description: 'Precise segmentation of anatomical structures in MRI scans for medical AI development.',
  //   datasetId: '0xeaa7f5b2cebde5e6a6742589d5232d7adb3d394bb29b0c3deb021aaa2ec4aa25',
  //   datasetName: 'Brain MRI Scan Collection',
  //   ownerId: 'owner-2',
  //   ownerAddress: '0x5678...efgh',
  //
  //   status: 'validating',
  //   currentPhase: 'validation',
  //
  //   bounty: {
  //     totalAmount: 8000,
  //     currency: 'USDC',
  //     distribution: {
  //       label: 20,
  //       bbox: 30,
  //       segmentation: 50
  //     },
  //     qualityBonus: 20
  //   },
  //
  //   timeline: {
  //     startDate: new Date('2024-01-01'),
  //     endDate: new Date('2024-01-31'),
  //     phases: {
  //       label: {
  //         start: new Date('2024-01-01'),
  //         end: new Date('2024-01-10')
  //       },
  //       bbox: {
  //         start: new Date('2024-01-05'),
  //         end: new Date('2024-01-20')
  //       },
  //       segmentation: {
  //         start: new Date('2024-01-15'),
  //         end: new Date('2024-01-28')
  //       },
  //       validation: {
  //         start: new Date('2024-01-28'),
  //         end: new Date('2024-01-31')
  //       }
  //     }
  //   },
  //
  //   requirements: {
  //     minQualityScore: 0.9,
  //     maxParticipants: 15,
  //     requiredAnnotationsPerImage: 2,
  //     validationThreshold: 3
  //   },
  //
  //   stats: {
  //     totalParticipants: 12,
  //     activeParticipants: 5,
  //     completedAnnotations: 456,
  //     pendingValidations: 89,
  //     averageQualityScore: 0.92
  //   },
  //
  //   validators: {
  //     allowedValidators: ['user-1', 'user-4'], // user-1 is validator for challenge-2
  //     requireValidatorApproval: true,
  //     validationRewards: 15
  //   },
  //
  //   tags: ['medical', 'segmentation', 'mri', 'anatomy'],
  //   difficulty: 'advanced',
  //
  //   createdAt: new Date('2023-12-20'),
  //   updatedAt: new Date('2024-01-28')
  // },

  {
    id: "challenge-3",
    title: "Wildlife Species Classification",
    description:
      "Identify and classify different wildlife species in camera trap images for conservation research.",
    datasetId: "0x857a14ce08cc70ab60246af66b643fe1386ab3258339d7dc28fb54661e5c76f9",
    datasetName: "Camera Trap Wildlife Dataset",
    ownerId: "owner-3",
    ownerAddress: "0x9abc...ijkl",

    status: "active",
    currentPhase: "label",

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

  // {
  //   id: 'challenge-4',
  //   title: 'Industrial Defect Detection',
  //   description: 'Detect and classify manufacturing defects in industrial parts for quality control automation.',
  //   datasetId: '0x857a14ce08cc70ab60246af66b643fe1386ab3258339d7dc28fb54661e5c76f9',
  //   datasetName: 'Manufacturing Quality Control Images',
  //   ownerId: 'owner-1',
  //   ownerAddress: '0x1234...abcd',
  //
  //   status: 'completed',
  //   currentPhase: 'completed',
  //
  //   bounty: {
  //     totalAmount: 3500,
  //     currency: 'SUI',
  //     distribution: {
  //       label: 25,
  //       bbox: 45,
  //       segmentation: 30
  //     },
  //     qualityBonus: 12
  //   },
  //
  //   timeline: {
  //     startDate: new Date('2023-12-01'),
  //     endDate: new Date('2023-12-31'),
  //     phases: {
  //       label: {
  //         start: new Date('2023-12-01'),
  //         end: new Date('2023-12-10')
  //       },
  //       bbox: {
  //         start: new Date('2023-12-05'),
  //         end: new Date('2023-12-20')
  //       },
  //       segmentation: {
  //         start: new Date('2023-12-15'),
  //         end: new Date('2023-12-28')
  //       },
  //       validation: {
  //         start: new Date('2023-12-28'),
  //         end: new Date('2023-12-31')
  //       }
  //     }
  //   },
  //
  //   requirements: {
  //     minQualityScore: 0.85,
  //     maxParticipants: 25,
  //     requiredAnnotationsPerImage: 3,
  //     validationThreshold: 2
  //   },
  //
  //   stats: {
  //     totalParticipants: 19,
  //     activeParticipants: 0,
  //     completedAnnotations: 892,
  //     pendingValidations: 0,
  //     averageQualityScore: 0.89
  //   },
  //
  //   validators: {
  //     allowedValidators: ['user-2', 'user-6'],
  //     requireValidatorApproval: true,
  //     validationRewards: 12
  //   },
  //
  //   tags: ['industrial', 'defect-detection', 'quality-control', 'manufacturing'],
  //   difficulty: 'intermediate',
  //
  //   createdAt: new Date('2023-11-25'),
  //   updatedAt: new Date('2023-12-31')
  // },
  //
  // {
  //   id: 'challenge-5',
  //   title: 'Satellite Image Land Cover Classification',
  //   description: 'Classify different land cover types in satellite imagery for environmental monitoring.',
  //   datasetId: '0xeaa7f5b2cebde5e6a6742589d5232d7adb3d394bb29b0c3deb021aaa2ec4aa25',
  //   datasetName: 'Satellite Land Cover Dataset',
  //   ownerId: 'owner-4',
  //   ownerAddress: '0xdef0...mnop',
  //
  //   status: 'draft',
  //   currentPhase: 'label',
  //
  //   bounty: {
  //     totalAmount: 6000,
  //     currency: 'USDC',
  //     distribution: {
  //       label: 40,
  //       bbox: 35,
  //       segmentation: 25
  //     },
  //     qualityBonus: 18
  //   },
  //
  //   timeline: {
  //     startDate: new Date('2024-02-01'),
  //     endDate: new Date('2024-03-15'),
  //     phases: {
  //       label: {
  //         start: new Date('2024-02-01'),
  //         end: new Date('2024-02-15')
  //       },
  //       bbox: {
  //         start: new Date('2024-02-10'),
  //         end: new Date('2024-02-28')
  //       },
  //       segmentation: {
  //         start: new Date('2024-02-20'),
  //         end: new Date('2024-03-10')
  //       },
  //       validation: {
  //         start: new Date('2024-03-10'),
  //         end: new Date('2024-03-15')
  //       }
  //     }
  //   },
  //
  //   requirements: {
  //     minQualityScore: 0.82,
  //     maxParticipants: 40,
  //     requiredAnnotationsPerImage: 2,
  //     validationThreshold: 3
  //   },
  //
  //   stats: {
  //     totalParticipants: 0,
  //     activeParticipants: 0,
  //     completedAnnotations: 0,
  //     pendingValidations: 0,
  //     averageQualityScore: 0
  //   },
  //
  //   validators: {
  //     allowedValidators: ['user-1', 'user-7'],
  //     requireValidatorApproval: true,
  //     validationRewards: 18
  //   },
  //
  //   tags: ['satellite', 'land-cover', 'environmental', 'remote-sensing'],
  //   difficulty: 'intermediate',
  //
  //   createdAt: new Date('2024-01-28'),
  //   updatedAt: new Date('2024-01-28')
  // }
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
