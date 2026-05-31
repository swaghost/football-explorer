import { Injectable } from '@angular/core';
import {
  ILesson,
  ILessonElement,
} from '../interfaces/lesson-builder.interfaces';
import {
  User,
  ITenant,
  ITeam,
  ITeamGroup,
  OwnershipContext,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class MockLessonService {
  private lessonIdCounter = 1;

  /**
   * Build a mock lesson with random nodes
   * @param lessonName Name of the lesson
   * @param ownershipContext Ownership context for the lesson
   * @param flowId Optional dataset/flow ID
   * @param flowName Optional dataset/flow name
   * @returns A mock lesson with 1-25 random nodes
   */
  buildMockLesson(
    lessonName: string,
    ownershipContext: OwnershipContext,
    flowId?: number,
    flowName?: string,
    createdByUserId?: number
  ): ILesson {
    // Random number of nodes between 1 and 25
    const nodeCount = Math.floor(Math.random() * 25) + 1;

    // Generate random node IDs from 1-25, shuffled
    const allNodeIds = Array.from({ length: 25 }, (_, i) => i + 1);
    const shuffledNodeIds = this.shuffleArray([...allNodeIds]);
    const selectedNodeIds = shuffledNodeIds.slice(0, nodeCount);

    // Build lesson elements
    const lessonNodes: ILessonElement[] = selectedNodeIds.map((nodeId) => ({
      NodeName: `Node ${nodeId}`,
      NodeID: nodeId.toString(),
      NodeCurrentValue: Math.floor(Math.random() * 3) + 1, // 1-3
      NodeDesiredValue: Math.floor(Math.random() * 2) + 3, // 3-4
      NodeProValue: Math.floor(Math.random() * 2) + 4, // 4-5
    }));

    return {
      LessonID: this.lessonIdCounter++,
      LessonName: lessonName,
      LessonDesc: `Mock lesson: ${lessonName}`,
      LessonChips: this.getRandomChips(),
      LessonNodes: lessonNodes,
      FlowID: flowId,
      FlowName: flowName,
      OwnershipContext: ownershipContext,
      CreatedByUserID: createdByUserId,
      CreatedUTC: new Date().toISOString(),
      Assignments: [],
      DueDate: null,
    };
  }

  /**
   * Build a comprehensive set of mock tenant lessons covering all ownership contexts
   * @param tenant The tenant
   * @param loggedInUser The logged-in user
   * @param teams Optional list of teams
   * @param teamGroups Optional list of team groups
   * @param flowId Optional dataset/flow ID
   * @param flowName Optional dataset/flow name
   * @returns Array of mock lessons for all contexts
   */
  buildMockTenantLessons(
    tenant: ITenant,
    loggedInUser: User,
    teams?: ITeam[],
    teamGroups?: ITeamGroup[],
    flowId?: number,
    flowName?: string
  ): ILesson[] {
    const lessons: ILesson[] = [];

    // 1. System Lesson (TENANT, -1)
    const systemLesson = this.buildMockLesson(
      this.generateLessonName(1),
      {
        Context: 'TENANT',
        ContextKey: -1,
      },
      flowId,
      flowName,
      -1 // System user
    );
    lessons.push(systemLesson);

    // 2. Personal Lesson (USER, logged in user ID)
    const personalLesson = this.buildMockLesson(
      this.generateLessonName(1),
      {
        Context: 'USER',
        ContextKey: loggedInUser.UserId,
      },
      flowId,
      flowName,
      loggedInUser.UserId
    );
    lessons.push(personalLesson);

    // 3. Tenant Lesson (TENANT, tenant ID)
    const tenantLesson = this.buildMockLesson(
      this.generateLessonName(1),
      {
        Context: 'TENANT',
        ContextKey: tenant.TenantID,
      },
      flowId,
      flowName,
      loggedInUser.UserId
    );
    lessons.push(tenantLesson);

    // 4. Team Lessons (TEAM, team ID) - at least one if teams exist
    if (teams && teams.length > 0) {
      // Create a lesson for the first team
      const firstTeam = teams[0];
      if (firstTeam.TeamID) {
        const teamLesson = this.buildMockLesson(
          this.generateLessonName(1),
          {
            Context: 'TEAM',
            ContextKey: firstTeam.TeamID,
          },
          flowId,
          flowName,
          loggedInUser.UserId
        );
        lessons.push(teamLesson);

        // Optionally add more team lessons (50% chance for each additional team)
        let teamLessonCounter = 2;
        for (let i = 1; i < teams.length; i++) {
          if (Math.random() > 0.5 && teams[i].TeamID) {
            const additionalTeamLesson = this.buildMockLesson(
              this.generateLessonName(teamLessonCounter++),
              {
                Context: 'TEAM',
                ContextKey: teams[i].TeamID!,
              },
              flowId,
              flowName,
              loggedInUser.UserId
            );
            lessons.push(additionalTeamLesson);
          }
        }
      }
    }

    // 5. Team Group Lessons (TEAMGROUP, team group ID) - at least one if team groups exist
    if (teamGroups && teamGroups.length > 0) {
      // Create a lesson for the first team group
      const firstTeamGroup = teamGroups[0];
      if (firstTeamGroup.TeamGroupID) {
        const teamGroupLesson = this.buildMockLesson(
          this.generateLessonName(1),
          {
            Context: 'TEAMGROUP',
            ContextKey: firstTeamGroup.TeamGroupID,
          },
          flowId,
          flowName,
          loggedInUser.UserId
        );
        lessons.push(teamGroupLesson);

        // Optionally add more team group lessons (50% chance for each additional group)
        let groupLessonCounter = 2;
        for (let i = 1; i < teamGroups.length; i++) {
          if (Math.random() > 0.5 && teamGroups[i].TeamGroupID) {
            const additionalGroupLesson = this.buildMockLesson(
              this.generateLessonName(groupLessonCounter++),
              {
                Context: 'TEAMGROUP',
                ContextKey: teamGroups[i].TeamGroupID!,
              },
              flowId,
              flowName,
              loggedInUser.UserId
            );
            lessons.push(additionalGroupLesson);
          }
        }
      }
    }

    return lessons;
  }

  /**
   * Build mock tenant lessons ensuring EVERY team gets a lesson
   * @param tenant The tenant
   * @param loggedInUser The logged-in user
   * @param teams List of teams
   * @param teamGroups List of team groups
   * @param flowId Optional dataset/flow ID
   * @param flowName Optional dataset/flow name
   * @returns Array of mock lessons for all contexts with one lesson per team guaranteed
   */
  buildMockTenantLessonsForAllTeams(
    tenant: ITenant,
    loggedInUser: User,
    teams?: ITeam[],
    teamGroups?: ITeamGroup[],
    flowId?: number,
    flowName?: string
  ): ILesson[] {
    const lessons: ILesson[] = [];

    // 1. System Lesson (TENANT, -1)
    const systemLesson = this.buildMockLesson(
      this.generateLessonName(1),
      {
        Context: 'TENANT',
        ContextKey: -1,
      },
      flowId,
      flowName,
      -1 // System user
    );
    lessons.push(systemLesson);

    // 2. Personal Lesson (USER, logged in user ID)
    const personalLesson = this.buildMockLesson(
      this.generateLessonName(1),
      {
        Context: 'USER',
        ContextKey: loggedInUser.UserId,
      },
      flowId,
      flowName,
      loggedInUser.UserId
    );
    lessons.push(personalLesson);

    // 3. Tenant Lesson (TENANT, tenant ID)
    const tenantLesson = this.buildMockLesson(
      this.generateLessonName(1),
      {
        Context: 'TENANT',
        ContextKey: tenant.TenantID,
      },
      flowId,
      flowName,
      loggedInUser.UserId
    );
    lessons.push(tenantLesson);

    // 4. Team Lessons (TEAM, team ID) - GUARANTEED one lesson for EVERY team
    if (teams && teams.length > 0) {
      let teamLessonCounter = 1;
      teams.forEach((team) => {
        if (team.TeamID) {
          const teamLesson = this.buildMockLesson(
            this.generateLessonName(teamLessonCounter++),
            {
              Context: 'TEAM',
              ContextKey: team.TeamID,
            },
            flowId,
            flowName,
            loggedInUser.UserId
          );
          lessons.push(teamLesson);
        }
      });
    }

    // 5. Team Group Lessons (TEAMGROUP, team group ID) - at least one if team groups exist
    if (teamGroups && teamGroups.length > 0) {
      // Create a lesson for the first team group
      const firstTeamGroup = teamGroups[0];
      if (firstTeamGroup.TeamGroupID) {
        const teamGroupLesson = this.buildMockLesson(
          this.generateLessonName(1),
          {
            Context: 'TEAMGROUP',
            ContextKey: firstTeamGroup.TeamGroupID,
          },
          flowId,
          flowName,
          loggedInUser.UserId
        );
        lessons.push(teamGroupLesson);

        // Optionally add more team group lessons (50% chance for each additional group)
        let groupLessonCounter = 2;
        for (let i = 1; i < teamGroups.length; i++) {
          if (Math.random() > 0.5 && teamGroups[i].TeamGroupID) {
            const additionalGroupLesson = this.buildMockLesson(
              this.generateLessonName(groupLessonCounter++),
              {
                Context: 'TEAMGROUP',
                ContextKey: teamGroups[i].TeamGroupID!,
              },
              flowId,
              flowName,
              loggedInUser.UserId
            );
            lessons.push(additionalGroupLesson);
          }
        }
      }
    }

    return lessons;
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get random lesson category chips
   */
  private getRandomChips(): string[] {
    const allChips = [
      'Press Resistance',
      'Defense',
      'Attacking',
      'Passing',
      'Dribbling',
      'Shooting',
      'Tactics',
      'Fitness',
      'Positioning',
      'Ball Control',
      'Set Pieces',
      'Counter Attack',
    ];

    // Select 1-4 random chips
    const chipCount = Math.floor(Math.random() * 4) + 1;
    const shuffled = this.shuffleArray(allChips);
    return shuffled.slice(0, chipCount);
  }

  /**
   * Get a random lesson name suffix
   */
  private getRandomLessonSuffix(): string {
    const suffixes = [
      'Offensive Tactics',
      'Offensive Tactics (Building Out from the Back)',
      'Movement Patterns (Operating in Crowds)',
      'Movement Patterns (Understanding the Drift)',
      'Movement Patterns (Dismarking)',
      'Scanning (Types)',
      'Scanning (Goals)',
      'Scanning (Critical Scanning)',
      'Press Resistance',
      'Attacking Match Skills',
      'Ball Skills',
      'Third-Man Movements',
      'Attacking the Press with Indirect Play',
      'Breaking Lines',
      'Pressing Structure',
      'Pressing Cues',
      'Defensive Tactics',
      'Defensive Strategy & Structure (Block Defense)',
      'Defensive Strategy & Structure (Block Types)',
      'Defensive Strategy & Structure (Cues)',
      'Defensive Technique (Tackling)',
      'Defensive Technique (Slide-Tackling Variants)',
      'Finishing (Learning the Field)',
      'Finishing (Shot Selection)',
      'Finishing (Finishing Technique)',
      'Finishing (Under Pressure)',
      'Attacking Free Kicks (Learning the Field)',
      'Attacking Free Kicks (Attack Profiles)',
      'Attacking Free Kicks (Kick Captains)',
      'Attacking Free Kicks (Quick-Play)',
      'Attacking Free Kicks (Bending the Ball)',
      'Attacking Free Kicks (Visual Dismarking)',
      'Attacking Free Kicks (Blocking)',
      'Attacking Corner Kicks (Attack Profiles)',
      'Attacking Corner Kicks (Kick Captains)',
      'Attacking Corner Kicks (Route-Running)',
      'Attacking Corner Kicks (Spacing)',
      'Attacking Corner Kicks (Creating Separation)',
      'Attacking Corner Kicks (Hand Signals)',
      'Attacking Corner Kicks (Distribution)',
      'Attacking Corner Kicks (Blocking)',
      'High IQ Patterns (Thinking Outside the Box)',
    ];

    const randomIndex = Math.floor(Math.random() * suffixes.length);
    return suffixes[randomIndex];
  }

  /**
   * Generate a unique lesson name using suffix and counter
   */
  private generateLessonName(lessonNumber: number): string {
    const suffix = this.getRandomLessonSuffix();
    return `${suffix} #${lessonNumber}`;
  }

  /**
   * Reset the lesson ID counter (useful for testing)
   */
  resetLessonIdCounter(): void {
    this.lessonIdCounter = 1;
  }
}
