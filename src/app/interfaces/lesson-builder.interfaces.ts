import { OwnershipContext } from './ownership-context.interface';
import { LessonAssignment } from './lesson-assignment.interfaces';

/**
 * Represents a single node element within a lesson.
 * Contains node identification and optional radar chart skill values.
 */
export interface ILessonElement {
  NodeName: string;
  NodeID: string;
  // Radar chart values (optional for backward compatibility)
  NodeCurrentValue?: number; // Perceived skill level (red) - defaults to 1
  NodeDesiredValue?: number; // Desired skill level (blue) - defaults to 3
  NodeProValue?: number; // Elite skill level (green) - defaults to 4
}

/**
 * Represents a complete lesson with metadata, nodes, and assignments.
 */
export interface ILesson {
  LessonID?: number; // Unique lesson identifier
  LessonName: string;
  LessonDesc?: string; // Lesson description
  LessonChips?: string[]; // Category tags like 'Press Resistance', 'Defense', etc.
  LessonNodes: ILessonElement[];
  FlowID?: number; // Link to Decision Flow - lessons belong to specific datasets
  OwnershipContext?: OwnershipContext; // Ownership context (System/Tenant/Team) - optional for backward compatibility
  FlowName?: string; // Name of the dataset this lesson belongs to
  Assignments?: LessonAssignment[]; // Lesson assignment targets
  DueDate?: string | null; // Due date for assigned lessons (ISO date string)
  CreatedByUserID?: number; // User ID of the person who created the lesson
  CreatedUTC?: string; // UTC datetime when the lesson was created (ISO string)
}
