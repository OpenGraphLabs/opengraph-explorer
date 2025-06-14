import { ChallengePhase } from "@/features/challenge";
import { AnnotationType } from "../types/workspace";

export interface PhaseConstraints {
  allowedTools: AnnotationType[];
  message: string;
  description: string;
}

export const PHASE_CONSTRAINTS: Record<ChallengePhase, PhaseConstraints> = {
  label: {
    allowedTools: ["label"],
    message: "Label Phase: Only label annotations are allowed",
    description:
      "In the label phase, you can only add text labels to identify entities in the image. Bounding box and segmentation tools will be available in later phases.",
  },
  bbox: {
    allowedTools: ["label", "bbox"],
    message: "BBox Phase: Label and bounding box annotations are allowed",
    description:
      "In the bounding box phase, you can add labels and draw bounding boxes around entities. Segmentation tools will be available in the next phase.",
  },
  segmentation: {
    allowedTools: ["label", "bbox", "segmentation"],
    message: "Segmentation Phase: All annotation tools are available",
    description:
      "In the segmentation phase, you can use all annotation tools: labels, bounding boxes, and precise polygon segmentation.",
  },
  validation: {
    allowedTools: [],
    message: "Validation Phase: Annotation is disabled during validation",
    description:
      "The challenge is currently in the validation phase. New annotations cannot be added while validators review submissions.",
  },
  completed: {
    allowedTools: [],
    message: "Challenge Completed: Annotation is no longer available",
    description: "This challenge has been completed. No new annotations can be added.",
  },
};

export function getPhaseConstraints(phase: ChallengePhase): PhaseConstraints {
  return PHASE_CONSTRAINTS[phase];
}

export function isToolAllowed(phase: ChallengePhase, tool: AnnotationType): boolean {
  const constraints = getPhaseConstraints(phase);
  return constraints.allowedTools.includes(tool);
}

export function getDisallowedToolMessage(phase: ChallengePhase, tool: AnnotationType): string {
  const constraints = getPhaseConstraints(phase);

  if (constraints.allowedTools.includes(tool)) {
    return "";
  }

  const toolNames = {
    label: "Label annotation",
    bbox: "Bounding box annotation",
    segmentation: "Segmentation annotation",
  };

  switch (phase) {
    case "label":
      if (tool === "bbox") return "Bounding box annotation will be available in the BBox phase";
      if (tool === "segmentation")
        return "Segmentation annotation will be available in the Segmentation phase";
      break;
    case "bbox":
      if (tool === "segmentation")
        return "Segmentation annotation will be available in the Segmentation phase";
      break;
    case "validation":
      return "New annotations cannot be added during validation phase";
    case "completed":
      return "This challenge has been completed";
  }

  return `${toolNames[tool]} is not available in the ${phase} phase`;
}

export function getNextAvailablePhase(
  currentPhase: ChallengePhase,
  desiredTool: AnnotationType
): ChallengePhase | null {
  const phaseOrder: ChallengePhase[] = ["label", "bbox", "segmentation", "validation", "completed"];
  const currentIndex = phaseOrder.indexOf(currentPhase);

  for (let i = currentIndex + 1; i < phaseOrder.length; i++) {
    const phase = phaseOrder[i];
    if (isToolAllowed(phase, desiredTool)) {
      return phase;
    }
  }

  return null;
}
