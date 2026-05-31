// Interfaces for tracking node completion and review status

export interface NodeCompletion {
  nodeId: string;
  nodeName?: string;
  userId?: number;
  tenantId?: number;
  teamId?: number;
  completedAt: Date;
  completionType: 'exploratory' | 'lesson';
  needsReview: boolean;
  reviewRequestedAt?: Date;
  surveyResponse?: any; // Will be NodeSurveyResponse or LessonSurveyResponse
}

export interface NodeCompletionState {
  completedNodes: Record<string, NodeCompletion>;
  reviewNodes: Record<string, NodeCompletion>;
}

export type NodeStatus = 'not-started' | 'completed' | 'needs-review';
