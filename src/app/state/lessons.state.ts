import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import {
  ILesson,
  ILessonElement,
} from '../interfaces/lesson-builder.interfaces';
import { LessonAssignment } from '../interfaces/lesson-assignment.interfaces';

// State Model
export interface LessonsStateModel {
  lessons: ILesson[];
  selectedLesson: ILesson | null;
}

// Actions
export class AddLesson {
  static readonly type = '[Lessons] Add Lesson';
  constructor(public lesson: ILesson) {}
}

export class SelectLesson {
  static readonly type = '[Lessons] Select Lesson';
  constructor(public lesson: ILesson | null) {}
}

export class UpdateLesson {
  static readonly type = '[Lessons] Update Lesson';
  constructor(public lesson: ILesson) {}
}

export class RemoveLesson {
  static readonly type = '[Lessons] Remove Lesson';
  constructor(public lessonName: string) {}
}

export class MigrateLessonsFlowID {
  static readonly type = '[Lessons] Migrate Lessons FlowID';
  constructor(public defaultFlowID: number) {}
}

export class RefreshLessonsByContext {
  static readonly type = '[Lessons] Refresh Lessons By Context';
  constructor(public tenantId: number | null, public teamId: number | null) {}
}

export class UpdateLessonAssignments {
  static readonly type = '[Lessons] Update Lesson Assignments';
  constructor(
    public lessonName: string,
    public assignments: LessonAssignment[],
    public dueDate: string | null
  ) {}
}

// State
@State<LessonsStateModel>({
  name: 'lessons',
  defaults: {
    lessons: [],
    selectedLesson: null,
  },
})
@Injectable()
export class LessonsState {
  @Selector()
  static getLessons(state: LessonsStateModel): ILesson[] {
    return state.lessons || [];
  }

  @Selector()
  static getLessonsByFlowID(state: LessonsStateModel) {
    return (flowID: number | undefined): ILesson[] => {
      // Add safety check for state.lessons
      if (!state.lessons || !Array.isArray(state.lessons)) {
        return [];
      }

      if (flowID === undefined || flowID === null) {
        // If no FlowID specified, return all lessons
        return state.lessons;
      }
      // Return lessons that belong to the specified FlowID, or lessons with no FlowID (legacy lessons)
      return state.lessons.filter(
        (lesson) =>
          lesson.FlowID === flowID ||
          lesson.FlowID === undefined ||
          lesson.FlowID === null
      );
    };
  }

  @Selector()
  static getSelectedLesson(state: LessonsStateModel): ILesson | null {
    return state.selectedLesson;
  }

  @Selector()
  static hasLessons(state: LessonsStateModel): boolean {
    return (
      state.lessons && Array.isArray(state.lessons) && state.lessons.length > 0
    );
  }

  @Selector()
  static hasLessonsForFlowID(state: LessonsStateModel) {
    return (flowID: number | undefined): boolean => {
      // Add safety check for state.lessons
      if (!state.lessons || !Array.isArray(state.lessons)) {
        return false;
      }

      if (flowID === undefined || flowID === null) {
        return state.lessons.length > 0;
      }
      return state.lessons.some(
        (lesson) =>
          lesson.FlowID === flowID ||
          lesson.FlowID === undefined ||
          lesson.FlowID === null
      );
    };
  }

  @Action(AddLesson)
  addLesson(ctx: StateContext<LessonsStateModel>, action: AddLesson) {
    const state = ctx.getState();
    const lessons = [...(state.lessons || []), action.lesson];
    ctx.patchState({
      lessons: lessons,
    });
  }

  @Action(SelectLesson)
  selectLesson(ctx: StateContext<LessonsStateModel>, action: SelectLesson) {
    ctx.patchState({
      selectedLesson: action.lesson,
    });
  }

  @Action(UpdateLesson)
  updateLesson(ctx: StateContext<LessonsStateModel>, action: UpdateLesson) {
    const state = ctx.getState();
    const lessons = (state.lessons || []).map((lesson) =>
      lesson.LessonName === action.lesson.LessonName ? action.lesson : lesson
    );
    ctx.patchState({
      lessons: lessons,
      selectedLesson:
        state.selectedLesson?.LessonName === action.lesson.LessonName
          ? action.lesson
          : state.selectedLesson,
    });
  }

  @Action(RemoveLesson)
  removeLesson(ctx: StateContext<LessonsStateModel>, action: RemoveLesson) {
    const state = ctx.getState();
    const lessons = (state.lessons || []).filter(
      (lesson) => lesson.LessonName !== action.lessonName
    );
    const selectedLesson =
      state.selectedLesson?.LessonName === action.lessonName
        ? null
        : state.selectedLesson;
    ctx.patchState({
      lessons: lessons,
      selectedLesson: selectedLesson,
    });
  }

  @Action(MigrateLessonsFlowID)
  migrateLessonsFlowID(
    ctx: StateContext<LessonsStateModel>,
    action: MigrateLessonsFlowID
  ) {
    const state = ctx.getState();
    let updatedLessons = [...(state.lessons || [])];
    let hasChanges = false;

    // Update lessons that don't have FlowID
    updatedLessons = updatedLessons.map((lesson) => {
      if (lesson.FlowID === undefined || lesson.FlowID === null) {
        hasChanges = true;
        console.log(
          `🔄 Migrating lesson "${lesson.LessonName}" to FlowID: ${action.defaultFlowID}`
        );
        return {
          ...lesson,
          FlowID: action.defaultFlowID,
        };
      }
      return lesson;
    });

    // Only update state if changes were made
    if (hasChanges) {
      console.log(
        `✅ Migrated ${
          updatedLessons.filter((l) => l.FlowID === action.defaultFlowID).length
        } lessons to FlowID: ${action.defaultFlowID}`
      );
      ctx.patchState({
        lessons: updatedLessons,
      });
    } else {
      console.log('📊 No lessons needed FlowID migration');
    }
  }

  @Action(RefreshLessonsByContext)
  refreshLessonsByContext(
    ctx: StateContext<LessonsStateModel>,
    action: RefreshLessonsByContext
  ) {
    console.log('🔄 Refreshing lessons by context:', {
      tenantId: action.tenantId,
      teamId: action.teamId,
    });

    // TODO: In a real application, this would make an API call to fetch lessons
    // based on the current context (tenant/team). For now, we'll simulate
    // context-aware filtering of existing lessons.

    const state = ctx.getState();

    // Add safety check for state.lessons
    if (!state.lessons || !Array.isArray(state.lessons)) {
      console.log('⚠️ No lessons array found in state');
      return;
    }

    // Filter lessons based on ownership context
    const filteredLessons = state.lessons.filter((lesson) => {
      if (!lesson.OwnershipContext) {
        // Legacy lessons without ownership context are considered system lessons
        return true;
      }

      switch (lesson.OwnershipContext.Context) {
        case 'USER':
          // User lessons - visible only to the owning user (would need user ID check)
          return true; // For now, show all user lessons
        case 'TENANT':
          if (lesson.OwnershipContext.ContextKey === -1) {
            return true; // System lessons (TENANT, -1) are always available
          } else {
            return lesson.OwnershipContext.ContextKey === action.tenantId; // Tenant-specific lessons
          }
        case 'TEAM':
          return lesson.OwnershipContext.ContextKey === action.teamId;
        default:
          return false;
      }
    });

    console.log(
      `📊 Context filtering result: ${filteredLessons.length}/${state.lessons.length} lessons available`
    );

    // Clear selected lesson if it's no longer available in the current context
    let newSelectedLesson = state.selectedLesson;
    if (
      state.selectedLesson &&
      !filteredLessons.find(
        (l) => l.LessonName === state.selectedLesson?.LessonName
      )
    ) {
      console.log('🔄 Clearing selected lesson due to context change');
      newSelectedLesson = null;
    }

    // Note: We don't actually filter the lessons in state since they should all be available
    // The filtering happens in the UI components based on context
    // This action is mainly for clearing the selected lesson if needed and logging
    if (newSelectedLesson !== state.selectedLesson) {
      ctx.patchState({
        selectedLesson: newSelectedLesson,
      });
    }
  }

  @Action(UpdateLessonAssignments)
  updateLessonAssignments(
    ctx: StateContext<LessonsStateModel>,
    action: UpdateLessonAssignments
  ) {
    const state = ctx.getState();
    const lessons = [...(state.lessons || [])];
    const lessonIndex = lessons.findIndex(
      (l) => l.LessonName === action.lessonName
    );

    if (lessonIndex >= 0) {
      lessons[lessonIndex] = {
        ...lessons[lessonIndex],
        Assignments: action.assignments,
        DueDate: action.dueDate,
      };
      console.log(
        `✅ Updated assignments for lesson "${action.lessonName}":`,
        action.assignments,
        'Due date:',
        action.dueDate
      );
      ctx.patchState({
        lessons: lessons,
        selectedLesson:
          state.selectedLesson?.LessonName === action.lessonName
            ? lessons[lessonIndex]
            : state.selectedLesson,
      });
    }
  }
}
