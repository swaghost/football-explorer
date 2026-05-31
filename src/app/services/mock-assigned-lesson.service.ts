import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ILesson } from '../interfaces/lesson-builder.interfaces';
import { ITeam, ITeamGroup } from '../interfaces';

export interface AssignedLesson {
  lessonId: number;
  lessonName: string;
  nodeIds: string[]; // NodeIDs are strings
  dueDate: Date;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEW_NEEDED'; // Status of the assignment
  assignedTo: {
    type: 'team' | 'teamGroup' | 'user';
    id: number;
    name: string;
    teamId?: number; // For teamGroups, this stores the parent team ID
    teamName?: string; // For teamGroups, this stores the parent team name
  };
  tenantId: number;
  contextUserId: number;
}

export interface AssignedLessonTreeNode {
  id: string;
  name: string;
  type: 'tenant' | 'team' | 'teamGroup' | 'lesson';
  children?: AssignedLessonTreeNode[];
  data?: AssignedLesson;
}

@Injectable({
  providedIn: 'root',
})
export class MockAssignedLessonService {
  private assignedLessonsMap = new Map<string, AssignedLesson[]>();
  private lessonIdCounter = 1000;

  constructor() {}

  /**
   * Generate random assigned lessons for a user based on available lessons from the tenant
   */
  generateAssignedLessons(
    contextUserId: number,
    tenantId: number,
    availableLessons: ILesson[],
    teams: ITeam[],
    teamGroups: ITeamGroup[]
  ): Observable<AssignedLesson[]> {
    const key = `${contextUserId}-${tenantId}`;

    // ALWAYS regenerate lessons on every call (no caching)
    console.log(
      `📚 Regenerating assigned lessons from ${availableLessons.length} available tenant lessons`
    );
    console.log(
      'Available lesson IDs:',
      availableLessons.map((l) => l.LessonID)
    );

    // Generate new lessons
    const lessons: AssignedLesson[] = [];

    if (availableLessons.length === 0) {
      console.warn('⚠️ No lessons available to assign');
      this.assignedLessonsMap.set(key, lessons);
      return of(lessons);
    }

    // Generate between 2 and 5 assigned lessons
    // First filter to only lessons with valid IDs and nodes
    const validLessons = availableLessons.filter(
      (lesson) =>
        lesson &&
        lesson.LessonID !== undefined &&
        lesson.LessonID !== null &&
        lesson.LessonNodes &&
        lesson.LessonNodes.length > 0
    );

    if (validLessons.length === 0) {
      console.warn('⚠️ No valid lessons available for assignment');
      this.assignedLessonsMap.set(key, lessons);
      return of(lessons);
    }

    console.log(
      `✅ Found ${validLessons.length} valid lessons with IDs:`,
      validLessons.map((l) => l.LessonID)
    );

    const assignmentCount = Math.min(
      Math.floor(Math.random() * 4) + 2,
      validLessons.length
    );

    // Shuffle and pick random lessons from valid lessons
    const shuffledLessons = [...validLessons].sort(() => Math.random() - 0.5);

    for (let i = 0; i < assignmentCount; i++) {
      const selectedLesson = shuffledLessons[i];

      if (!selectedLesson) {
        continue; // Skip if undefined
      }

      // Use the actual lesson's node IDs
      const selectedNodeIds = selectedLesson.LessonNodes.map(
        (node) => node.NodeID
      );

      // Randomly assign to team or team group
      const assignToTeam = Math.random() > 0.5;
      let assignedTo: AssignedLesson['assignedTo'];

      if (assignToTeam && teams.length > 0) {
        const randomTeam = teams[Math.floor(Math.random() * teams.length)];
        assignedTo = {
          type: 'team',
          id: randomTeam.TeamID,
          name: randomTeam.TeamName,
          teamId: randomTeam.TeamID,
          teamName: randomTeam.TeamName,
        };
      } else if (teamGroups.length > 0) {
        const randomTeamGroup =
          teamGroups[Math.floor(Math.random() * teamGroups.length)];
        // Find the parent team for this team group
        const parentTeamId = randomTeamGroup.OwnershipContext
          .ContextKey as number;
        const parentTeam = teams.find((t) => t.TeamID === parentTeamId);

        assignedTo = {
          type: 'teamGroup',
          id: randomTeamGroup.TeamGroupID,
          name: randomTeamGroup.TeamGroupName,
          teamId: parentTeamId,
          teamName: parentTeam?.TeamName || 'Unknown Team',
        };
      } else if (teams.length > 0) {
        // Fallback to team if no team groups
        const randomTeam = teams[Math.floor(Math.random() * teams.length)];
        assignedTo = {
          type: 'team',
          id: randomTeam.TeamID,
          name: randomTeam.TeamName,
          teamId: randomTeam.TeamID,
          teamName: randomTeam.TeamName,
        };
      } else {
        // Skip this lesson if no teams or team groups available
        continue;
      }

      const lesson: AssignedLesson = {
        lessonId: selectedLesson.LessonID, // Use actual lesson ID
        lessonName: selectedLesson.LessonName, // Use actual lesson name
        nodeIds: selectedNodeIds,
        dueDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Due within 7 days
        status: this.getRandomStatus(i), // Varied statuses for testing
        assignedTo,
        tenantId,
        contextUserId,
      };

      lessons.push(lesson);
    }

    // CRITICAL VALIDATION: Verify all assigned lessons exist in tenant's lesson list
    const tenantLessonIds = new Set(availableLessons.map((l) => l.LessonID));
    const invalidAssignments = lessons.filter(
      (lesson) => !tenantLessonIds.has(lesson.lessonId)
    );

    if (invalidAssignments.length > 0) {
      console.error(
        '❌ CRITICAL ERROR: Found assigned lessons NOT in tenant lesson list:',
        invalidAssignments.map((l) => `${l.lessonId} (${l.lessonName})`)
      );
      console.error('Valid tenant lesson IDs:', Array.from(tenantLessonIds));
      // Remove invalid assignments
      const validAssignments = lessons.filter((lesson) =>
        tenantLessonIds.has(lesson.lessonId)
      );
      this.assignedLessonsMap.set(key, validAssignments);
      console.log(
        `✅ Generated ${validAssignments.length} VALID assigned lessons (removed ${invalidAssignments.length} invalid) for user ${contextUserId} in tenant ${tenantId}`
      );
      console.log(
        'Assigned lesson IDs:',
        validAssignments.map((l) => `${l.lessonId} (${l.lessonName})`)
      );
      return of(validAssignments);
    }

    this.assignedLessonsMap.set(key, lessons);
    console.log(
      `✅ Generated ${lessons.length} assigned lessons for user ${contextUserId} in tenant ${tenantId}`
    );
    console.log(
      'Assigned lesson IDs:',
      lessons.map((l) => `${l.lessonId} (${l.lessonName})`)
    );
    console.log(
      '✅ VERIFIED: All assigned lessons exist in tenant lesson list'
    );

    return of(lessons);
  }

  /**
   * Get a random status for testing purposes
   * First lesson is always NOT_STARTED, others vary
   */
  private getRandomStatus(
    index: number
  ): 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEW_NEEDED' {
    if (index === 0) return 'NOT_STARTED';

    const rand = Math.random();
    if (rand < 0.4) return 'NOT_STARTED';
    if (rand < 0.6) return 'IN_PROGRESS';
    if (rand < 0.85) return 'COMPLETED';
    return 'REVIEW_NEEDED';
  }

  /**
   * Get assigned lessons for a specific user and tenant
   */
  getAssignedLessons(
    contextUserId: number,
    tenantId: number
  ): Observable<AssignedLesson[]> {
    const key = `${contextUserId}-${tenantId}`;
    return of(this.assignedLessonsMap.get(key) || []);
  }

  /**
   * Build a tree structure for displaying assigned lessons
   */
  buildAssignedLessonTree(
    lessons: AssignedLesson[],
    teams: ITeam[],
    teamGroups: ITeamGroup[],
    tenantName: string
  ): AssignedLessonTreeNode {
    const root: AssignedLessonTreeNode = {
      id: 'root',
      name: tenantName,
      type: 'tenant',
      children: [],
    };

    // Group lessons by team
    const lessonsByTeam = new Map<number, AssignedLesson[]>();
    const lessonsByTeamGroup = new Map<number, AssignedLesson[]>();

    lessons.forEach((lesson) => {
      if (lesson.assignedTo.type === 'team') {
        const existing = lessonsByTeam.get(lesson.assignedTo.id) || [];
        existing.push(lesson);
        lessonsByTeam.set(lesson.assignedTo.id, existing);
      } else {
        const existing = lessonsByTeamGroup.get(lesson.assignedTo.id) || [];
        existing.push(lesson);
        lessonsByTeamGroup.set(lesson.assignedTo.id, existing);
      }
    });

    // Add teams to tree
    teams.forEach((team) => {
      const teamLessons = lessonsByTeam.get(team.TeamID) || [];
      const teamNode: AssignedLessonTreeNode = {
        id: `team-${team.TeamID}`,
        name: team.TeamName,
        type: 'team',
        children: [],
      };

      // Add team-level lessons
      teamLessons.forEach((lesson) => {
        teamNode.children!.push({
          id: `lesson-${lesson.lessonId}`,
          name: `${lesson.lessonName} (${lesson.nodeIds.length} nodes)`,
          type: 'lesson',
          data: lesson,
        });
      });

      // Add team groups under this team
      const teamTeamGroups = team.TeamGroups || [];
      teamTeamGroups.forEach((teamGroup) => {
        const groupLessons =
          lessonsByTeamGroup.get(teamGroup.TeamGroupID) || [];

        if (groupLessons.length > 0) {
          const groupNode: AssignedLessonTreeNode = {
            id: `teamGroup-${teamGroup.TeamGroupID}`,
            name: teamGroup.TeamGroupName,
            type: 'teamGroup',
            children: groupLessons.map((lesson) => ({
              id: `lesson-${lesson.lessonId}`,
              name: `${lesson.lessonName} (${lesson.nodeIds.length} nodes)`,
              type: 'lesson',
              data: lesson,
            })),
          };

          teamNode.children!.push(groupNode);
        }
      });

      // Only add team to root if it has lessons or team groups with lessons
      if (teamNode.children!.length > 0) {
        root.children!.push(teamNode);
      }
    });

    return root;
  }

  /**
   * Clear assigned lessons for a user/tenant
   */
  clearAssignedLessons(contextUserId: number, tenantId: number): void {
    const key = `${contextUserId}-${tenantId}`;
    this.assignedLessonsMap.delete(key);
    console.log(
      `🗑️ Cleared assigned lessons for user ${contextUserId} in tenant ${tenantId}`
    );
  }

  /**
   * Clear all assigned lessons
   */
  clearAllAssignedLessons(): void {
    this.assignedLessonsMap.clear();
    console.log('🗑️ Cleared all assigned lessons');
  }

  /**
   * Select random nodes from available nodes
   */
  private selectRandomNodes(nodes: ILesson[], count: number): string[] {
    const selectedIds: string[] = [];

    // Get all node IDs from all lessons
    const allNodeIds: string[] = [];
    nodes.forEach((lesson) => {
      lesson.LessonNodes.forEach((node) => {
        if (!allNodeIds.includes(node.NodeID)) {
          allNodeIds.push(node.NodeID);
        }
      });
    });

    if (allNodeIds.length === 0) {
      return selectedIds;
    }

    const actualCount = Math.min(count, allNodeIds.length);
    const availableIndices = allNodeIds.map((_, i) => i);

    for (let i = 0; i < actualCount; i++) {
      const randomIndex = Math.floor(Math.random() * availableIndices.length);
      const nodeIndex = availableIndices[randomIndex];
      selectedIds.push(allNodeIds[nodeIndex]);
      availableIndices.splice(randomIndex, 1);
    }

    return selectedIds;
  }

  /**
   * Generate a lesson name
   */
  private generateLessonName(index: number): string {
    const prefixes = [
      'Practice',
      'Training',
      'Drill',
      'Exercise',
      'Workout',
      'Session',
      'Review',
    ];
    const topics = [
      'Fundamentals',
      'Skills',
      'Techniques',
      'Concepts',
      'Strategy',
      'Tactics',
      'Development',
    ];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];

    return `${prefix} ${topic} #${index}`;
  }
}
