import { IContext } from './context.interface';

/**
 * Represents an assignment target for a lesson.
 * Can be assigned to a user, team, team group, or player.
 */
export interface LessonAssignment {
  LessonID: number; // ID of the lesson being assigned
  AssignedUTC: string; // UTC datetime when the lesson was assigned (ISO string)
  Status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEW_NEEDED'; // Current status of the assignment
  TargetContext: IContext; // Context under which the lesson was assigned

  AssignmentContext: IContext; // Context under which the lesson was assigned (COACH is treated as USER context)
}
