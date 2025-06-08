import { useMemo } from 'react';
import { ChallengePhase } from '@/features/challenge';
import { AnnotationType } from '../types/workspace';
import { 
  getPhaseConstraints, 
  isToolAllowed, 
  getDisallowedToolMessage,
  getNextAvailablePhase,
  PhaseConstraints 
} from '../utils/phaseConstraints';

export interface PhaseConstraintsHookResult {
  constraints: PhaseConstraints;
  isToolAllowed: (tool: AnnotationType) => boolean;
  getDisallowedMessage: (tool: AnnotationType) => string;
  getNextAvailablePhase: (tool: AnnotationType) => ChallengePhase | null;
  canAnnotate: boolean;
  phaseMessage: string;
  allowedTools: AnnotationType[];
  disallowedTools: AnnotationType[];
}

export function usePhaseConstraints(currentPhase: ChallengePhase): PhaseConstraintsHookResult {
  const constraints = useMemo(() => getPhaseConstraints(currentPhase), [currentPhase]);

  const allTools: AnnotationType[] = ['label', 'bbox', 'segmentation'];

  const allowedTools = useMemo(() => {
    return allTools.filter(tool => isToolAllowed(currentPhase, tool));
  }, [currentPhase]);

  const disallowedTools = useMemo(() => {
    return allTools.filter(tool => !isToolAllowed(currentPhase, tool));
  }, [currentPhase]);

  const canAnnotate = useMemo(() => {
    return constraints.allowedTools.length > 0;
  }, [constraints]);

  return {
    constraints,
    isToolAllowed: (tool: AnnotationType) => isToolAllowed(currentPhase, tool),
    getDisallowedMessage: (tool: AnnotationType) => getDisallowedToolMessage(currentPhase, tool),
    getNextAvailablePhase: (tool: AnnotationType) => getNextAvailablePhase(currentPhase, tool),
    canAnnotate,
    phaseMessage: constraints.message,
    allowedTools,
    disallowedTools
  };
} 