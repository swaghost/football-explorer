export type ToDoStatus =
  | 'Open'
  | 'Ready'
  | 'On Hold'
  | 'On Hold - Needs Refinement'
  | 'On Hold - Needs Elaboration'
  | 'On Hold - Evaluation/Qualification'
  | 'Active / In-Process'
  | 'In Q/A'
  | 'Closed - Complete'
  | 'Closed - Incomplete'
  | 'Closed - Deleted'
  | 'Suspended'
  | 'Pinned';
export type ToDoPriority = 'critical path' | 'high' | 'medium' | 'low';

export type DevelopmentTargetType =
  | 'Feature Request'
  | 'Bug Fix'
  | 'Improvement'
  | 'Next Iteration'
  | 'Concept Exploration';

export type ArchitectingTargetType =
  | 'Diagram'
  | 'Node Entry'
  | 'Technique Card Note';

export type TeachingTargetType =
  | 'Player Note'
  | 'Team Note'
  | 'Team Group Note'
  | 'Session Note'
  | 'Training Note';

export type ExplorationTargetType =
  | 'Demystify/Research'
  | 'Learn'
  | 'Conduct Impact Assessment'
  | 'Plan';

export type TargetType =
  | 'Development'
  | 'Architecting'
  | 'Teaching'
  | 'Exploration';

export type SpecificTargetType =
  | DevelopmentTargetType
  | ArchitectingTargetType
  | TeachingTargetType
  | ExplorationTargetType;

export interface IToDoComment {
  commentID: string; // Unique identifier for the comment
  text: string;
  createdUTC: string; // ISO 8601 UTC timestamp
  userId: string; // User ID who added the comment
}

export interface IToDoEntry {
  toDoID: string;
  userId: string; // User ID who created the entry
  title: string;
  description: string;
  status: ToDoStatus;
  priority: ToDoPriority;
  targetType: TargetType;
  specificTargetType: SpecificTargetType;
  target: string; // Player name, team name, team group name, date, or string
  createdAt: number; // Timestamp (deprecated - use createdUTC)
  updatedAt: number; // Timestamp (deprecated - use lastUpdatedUTC)
  createdUTC: string; // ISO 8601 UTC timestamp
  lastUpdatedUTC: string; // ISO 8601 UTC timestamp
  pinned?: boolean;
  parentToDoID?: string | null; // Optional parent to-do ID for hierarchical structure
  comments?: IToDoComment[]; // List of comments with unique IDs
  deletedAt?: string | null; // ISO 8601 UTC timestamp for soft delete (null = not deleted)
  sortOrder?: number; // Order within a column for drag-and-drop sorting
  ownershipContext: {
    contextType: 'USER';
    contextId: number;
  };
}

// Target type options organized by category
export const TARGET_TYPES_BY_CATEGORY = {
  Development: [
    'Feature Request',
    'Bug Fix',
    'Improvement',
    'Next Iteration',
    'Concept Exploration',
  ] as DevelopmentTargetType[],
  Architecting: [
    'Diagram',
    'Node Entry',
    'Technique Card Note',
  ] as ArchitectingTargetType[],
  Teaching: [
    'Player Note',
    'Team Note',
    'Team Group Note',
    'Session Note',
    'Training Note',
  ] as TeachingTargetType[],
  Exploration: [
    'Demystify/Research',
    'Learn',
    'Conduct Impact Assessment',
    'Plan',
  ] as ExplorationTargetType[],
};

export const ALL_STATUSES: ToDoStatus[] = [
  'Open',
  'Ready',
  'On Hold',
  'On Hold - Needs Refinement',
  'On Hold - Needs Elaboration',
  'On Hold - Evaluation/Qualification',
  'Active / In-Process',
  'In Q/A',
  'Closed - Complete',
  'Closed - Incomplete',
  'Closed - Deleted',
  'Suspended',
  'Pinned',
];

export const ALL_PRIORITIES: ToDoPriority[] = [
  'critical path',
  'high',
  'medium',
  'low',
];
