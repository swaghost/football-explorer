import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

// Tour context type
export type TourContext = 'builder' | 'runner';

// Interfaces
export interface IAttemptedLesson {
  lessonId: string;
  completedNodes: string[]; // List of completed node IDs
  lessonNodeIndex: number; // Current node index in the lesson nodes list (starts at 0)
  context: TourContext; // Track which toolbar this lesson belongs to
}

// State Model
export interface TourStateModel {
  attemptedLessons: IAttemptedLesson[];
  currentLessonId: string | null;
  currentBuilderLessonId: string | null; // Separate tracking for builder
  currentRunnerLessonId: string | null; // Separate tracking for runner
}

// Actions
export class StartLesson {
  static readonly type = '[Tour] Start Lesson';
  constructor(
    public lessonId: string,
    public context: TourContext = 'runner'
  ) {}
}

export class AddAttemptedLesson {
  static readonly type = '[Tour] Add Attempted Lesson';
  constructor(
    public lessonId: string,
    public context: TourContext = 'runner'
  ) {}
}

export class UpdateLessonNodeIndex {
  static readonly type = '[Tour] Update Lesson Node Index';
  constructor(public lessonId: string, public nodeIndex: number) {}
}

export class AddCompletedNode {
  static readonly type = '[Tour] Add Completed Node';
  constructor(public lessonId: string, public nodeId: string) {}
}

export class RemoveCompletedNode {
  static readonly type = '[Tour] Remove Completed Node';
  constructor(public lessonId: string, public nodeId: string) {}
}

export class ClearAttemptedLesson {
  static readonly type = '[Tour] Clear Attempted Lesson';
  constructor(public lessonId: string) {}
}

export class MarkNodeCompleted {
  static readonly type = '[Tour] Mark Node Completed';
  constructor(public lessonId: string, public nodeId: string) {}
}

export class CompleteLesson {
  static readonly type = '[Tour] Complete Lesson';
  constructor(public lessonId: string) {}
}

export class QuitLesson {
  static readonly type = '[Tour] Quit Lesson';
  constructor(public lessonId: string, public saveProgress: boolean) {}
}

export class ResetTourState {
  static readonly type = '[Tour] Reset Tour State';
}

// State
@State<TourStateModel>({
  name: 'tour',
  defaults: {
    attemptedLessons: [],
    currentLessonId: null,
    currentBuilderLessonId: null,
    currentRunnerLessonId: null,
  },
})
@Injectable()
export class TourState {
  @Selector()
  static getCurrentLessonId(state: TourStateModel): string | null {
    return state.currentLessonId;
  }

  @Selector()
  static getCurrentBuilderLessonId(state: TourStateModel): string | null {
    return state.currentBuilderLessonId;
  }

  @Selector()
  static getCurrentRunnerLessonId(state: TourStateModel): string | null {
    return state.currentRunnerLessonId;
  }

  @Selector()
  static getCurrentLesson(state: TourStateModel): IAttemptedLesson | null {
    if (!state.currentLessonId) return null;
    return (
      state.attemptedLessons.find(
        (lesson) => lesson.lessonId === state.currentLessonId
      ) || null
    );
  }

  @Selector()
  static getCurrentBuilderLesson(
    state: TourStateModel
  ): IAttemptedLesson | null {
    if (!state.currentBuilderLessonId) return null;
    return (
      state.attemptedLessons.find(
        (lesson) =>
          lesson.lessonId === state.currentBuilderLessonId &&
          lesson.context === 'builder'
      ) || null
    );
  }

  @Selector()
  static getCurrentRunnerLesson(
    state: TourStateModel
  ): IAttemptedLesson | null {
    if (!state.currentRunnerLessonId) return null;
    return (
      state.attemptedLessons.find(
        (lesson) =>
          lesson.lessonId === state.currentRunnerLessonId &&
          lesson.context === 'runner'
      ) || null
    );
  }

  @Selector()
  static getAttemptedLessons(state: TourStateModel): IAttemptedLesson[] {
    return state.attemptedLessons;
  }

  @Selector()
  static getAttemptedLesson(state: TourStateModel) {
    return (lessonId: string): IAttemptedLesson | undefined => {
      return state.attemptedLessons.find(
        (lesson) => lesson.lessonId === lessonId
      );
    };
  }

  @Selector()
  static getLessonNodeIndex(state: TourStateModel) {
    return (lessonId: string): number => {
      const lesson = state.attemptedLessons.find(
        (lesson) => lesson.lessonId === lessonId
      );
      return lesson ? lesson.lessonNodeIndex : 0;
    };
  }

  @Selector()
  static getCompletedNodes(state: TourStateModel) {
    return (lessonId: string): string[] => {
      const lesson = state.attemptedLessons.find(
        (lesson) => lesson.lessonId === lessonId
      );
      return lesson ? lesson.completedNodes : [];
    };
  }

  @Selector()
  static isNodeCompleted(state: TourStateModel) {
    return (lessonId: string, nodeId: string): boolean => {
      const lesson = state.attemptedLessons.find(
        (lesson) => lesson.lessonId === lessonId
      );
      return lesson ? lesson.completedNodes.includes(nodeId) : false;
    };
  }

  @Action(AddAttemptedLesson)
  addAttemptedLesson(
    ctx: StateContext<TourStateModel>,
    action: AddAttemptedLesson
  ) {
    const state = ctx.getState();

    // Check if lesson already exists
    const existingLesson = state.attemptedLessons.find(
      (lesson) => lesson.lessonId === action.lessonId
    );
    if (existingLesson) {
      // If it exists, reset it to initial state
      const updatedLessons = state.attemptedLessons.map((lesson) =>
        lesson.lessonId === action.lessonId
          ? { ...lesson, completedNodes: [], lessonNodeIndex: 0 }
          : lesson
      );
      ctx.patchState({
        attemptedLessons: updatedLessons,
      });
    } else {
      // Add new attempted lesson with initial state
      const newLesson: IAttemptedLesson = {
        lessonId: action.lessonId,
        completedNodes: [],
        lessonNodeIndex: 0,
        context: action.context,
      };
      ctx.patchState({
        attemptedLessons: [...state.attemptedLessons, newLesson],
      });
    }
  }

  @Action(UpdateLessonNodeIndex)
  updateLessonNodeIndex(
    ctx: StateContext<TourStateModel>,
    action: UpdateLessonNodeIndex
  ) {
    const state = ctx.getState();
    const updatedLessons = state.attemptedLessons.map((lesson) =>
      lesson.lessonId === action.lessonId
        ? { ...lesson, lessonNodeIndex: action.nodeIndex }
        : lesson
    );
    ctx.patchState({
      attemptedLessons: updatedLessons,
    });
  }

  @Action(AddCompletedNode)
  addCompletedNode(
    ctx: StateContext<TourStateModel>,
    action: AddCompletedNode
  ) {
    const state = ctx.getState();
    const updatedLessons = state.attemptedLessons.map((lesson) => {
      if (lesson.lessonId === action.lessonId) {
        // Only add if not already completed
        const completedNodes = lesson.completedNodes.includes(action.nodeId)
          ? lesson.completedNodes
          : [...lesson.completedNodes, action.nodeId];
        return { ...lesson, completedNodes };
      }
      return lesson;
    });
    ctx.patchState({
      attemptedLessons: updatedLessons,
    });
  }

  @Action(RemoveCompletedNode)
  removeCompletedNode(
    ctx: StateContext<TourStateModel>,
    action: RemoveCompletedNode
  ) {
    const state = ctx.getState();
    const updatedLessons = state.attemptedLessons.map((lesson) => {
      if (lesson.lessonId === action.lessonId) {
        const completedNodes = lesson.completedNodes.filter(
          (nodeId) => nodeId !== action.nodeId
        );
        return { ...lesson, completedNodes };
      }
      return lesson;
    });
    ctx.patchState({
      attemptedLessons: updatedLessons,
    });
  }

  @Action(ClearAttemptedLesson)
  clearAttemptedLesson(
    ctx: StateContext<TourStateModel>,
    action: ClearAttemptedLesson
  ) {
    const state = ctx.getState();
    const attemptedLessons = state.attemptedLessons.filter(
      (lesson) => lesson.lessonId !== action.lessonId
    );
    ctx.patchState({
      attemptedLessons,
    });
  }

  @Action(StartLesson)
  startLesson(ctx: StateContext<TourStateModel>, action: StartLesson) {
    const state = ctx.getState();

    // Check if lesson already exists with same context
    const existingLessonIndex = state.attemptedLessons.findIndex(
      (lesson) =>
        lesson.lessonId === action.lessonId && lesson.context === action.context
    );

    const newLesson: IAttemptedLesson = {
      lessonId: action.lessonId,
      completedNodes: [],
      lessonNodeIndex: 0,
      context: action.context,
    };

    if (existingLessonIndex >= 0) {
      // Reset existing lesson
      const updatedLessons = [...state.attemptedLessons];
      updatedLessons[existingLessonIndex] = newLesson;

      // Update appropriate current lesson ID based on context
      const stateUpdate: Partial<TourStateModel> = {
        attemptedLessons: updatedLessons,
        currentLessonId: action.lessonId,
      };

      if (action.context === 'builder') {
        stateUpdate.currentBuilderLessonId = action.lessonId;
      } else {
        stateUpdate.currentRunnerLessonId = action.lessonId;
      }

      ctx.patchState(stateUpdate);
    } else {
      // Add new lesson
      const stateUpdate: Partial<TourStateModel> = {
        attemptedLessons: [...state.attemptedLessons, newLesson],
        currentLessonId: action.lessonId,
      };

      if (action.context === 'builder') {
        stateUpdate.currentBuilderLessonId = action.lessonId;
      } else {
        stateUpdate.currentRunnerLessonId = action.lessonId;
      }

      ctx.patchState(stateUpdate);
    }
  }

  @Action(MarkNodeCompleted)
  markNodeCompleted(
    ctx: StateContext<TourStateModel>,
    action: MarkNodeCompleted
  ) {
    const state = ctx.getState();
    const lessonIndex = state.attemptedLessons.findIndex(
      (lesson) => lesson.lessonId === action.lessonId
    );

    if (lessonIndex >= 0) {
      const lesson = state.attemptedLessons[lessonIndex];
      // Only add if not already completed
      if (!lesson.completedNodes.includes(action.nodeId)) {
        const updatedLessons = [...state.attemptedLessons];
        updatedLessons[lessonIndex] = {
          ...lesson,
          completedNodes: [...lesson.completedNodes, action.nodeId],
        };
        ctx.patchState({
          attemptedLessons: updatedLessons,
        });
      }
    }
  }

  @Action(CompleteLesson)
  completeLesson(ctx: StateContext<TourStateModel>, action: CompleteLesson) {
    ctx.patchState({
      currentLessonId: null,
    });
  }

  @Action(QuitLesson)
  quitLesson(ctx: StateContext<TourStateModel>, action: QuitLesson) {
    const state = ctx.getState();

    if (!action.saveProgress) {
      // Remove the lesson if not saving progress
      const updatedLessons = state.attemptedLessons.filter(
        (lesson) => lesson.lessonId !== action.lessonId
      );
      ctx.patchState({
        attemptedLessons: updatedLessons,
        currentLessonId: null,
      });
    } else {
      // Just clear current lesson, keeping the progress
      ctx.patchState({
        currentLessonId: null,
      });
    }
  }

  @Action(ResetTourState)
  resetTourState(ctx: StateContext<TourStateModel>) {
    ctx.patchState({
      attemptedLessons: [],
      currentLessonId: null,
    });
  }
}
