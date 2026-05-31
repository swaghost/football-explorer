// Global context state

import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector, Store } from '@ngxs/store';
import { GlobalContextStateModel } from './user-context.model';
import {
  SetLoggedInUser,
  SetSelectedContextTenant,
  SetSelectedContextUser,
  SetSelectedContextTeam,
  SetSelectedContextTeamGroup,
  SetSelectedContextLessonRunnerLesson,
  SetSelectedContextLessonBuilderLesson,
  SetSelectedContextNode,
  SetSelectedContextLessonBuilderNode,
  SetSelectedContextLessonRunnerNode,
  SetSelectedContextLessonNode,
  SetSelectedContextDataset,
  ClearGlobalContext,
  InitializeGlobalContext,
  SaveLastSelectedContext,
  SetSelectedTenant,
  SetSelectedTenantOnly,
  SetSelectedTeam,
  SetSelectedTeamGroup,
  ClearTeamSelections,
  RefreshTeamsByContext,
  UpdateAssignedLessonStatus,
} from './user-context.actions';
import { User, ITenant, ITeam, ITeamGroup } from '../interfaces';
import { DecisionFlow } from '../interfaces/decision-flow.interfaces';
import { ILesson } from '../interfaces/lesson-builder.interfaces';
import { AddLesson } from './lessons.state';
import {
  MockAssignedLessonService,
  AssignedLesson,
} from '../services/mock-assigned-lesson.service';
import { map } from 'rxjs/operators';

@State<GlobalContextStateModel>({
  name: 'globalContext',
  defaults: {
    loggedInUser: null,
    availableTenants: [],
    selectedContextTenant: null,
    selectedContextUser: null,
    selectedContextTeam: null,
    selectedContextTeamGroup: null,
    selectedContextLessonRunnerLesson: null,
    selectedContextLessonBuilderLesson: null,
    selectedContextNode: null,
    selectedContextLessonBuilderNode: null,
    selectedContextLessonRunnerNode: null,
    selectedContextLessonNode: null, // DEPRECATED: keeping for backward compatibility
    selectedContextDataset: null,
  },
})
@Injectable()
export class GlobalContextState {
  constructor(
    private store: Store,
    private mockAssignedLessonService: MockAssignedLessonService
  ) {}

  @Selector()
  static loggedInUser(state: GlobalContextStateModel): User | null {
    return state.loggedInUser;
  }

  @Selector()
  static availableTenants(state: GlobalContextStateModel): ITenant[] {
    return state.availableTenants;
  }

  @Selector()
  static selectedContextTenant(state: GlobalContextStateModel): ITenant | null {
    return state.selectedContextTenant;
  }

  @Selector()
  static selectedContextUser(state: GlobalContextStateModel): User | null {
    return state.selectedContextUser;
  }

  @Selector()
  static selectedContextTeam(state: GlobalContextStateModel): ITeam | null {
    return state.selectedContextTeam;
  }

  @Selector()
  static selectedContextTeamGroup(
    state: GlobalContextStateModel
  ): ITeamGroup | null {
    return state.selectedContextTeamGroup;
  }

  @Selector()
  static selectedContextLessonRunnerLesson(
    state: GlobalContextStateModel
  ): ILesson | null {
    return state.selectedContextLessonRunnerLesson;
  }

  @Selector()
  static selectedContextLessonBuilderLesson(
    state: GlobalContextStateModel
  ): ILesson | null {
    return state.selectedContextLessonBuilderLesson;
  }

  @Selector()
  static selectedContextNode(state: GlobalContextStateModel): string | null {
    return state.selectedContextNode;
  }

  @Selector()
  static selectedContextLessonBuilderNode(
    state: GlobalContextStateModel
  ): string | null {
    return state.selectedContextLessonBuilderNode;
  }

  @Selector()
  static selectedContextLessonRunnerNode(
    state: GlobalContextStateModel
  ): string | null {
    return state.selectedContextLessonRunnerNode;
  }

  @Selector()
  static selectedContextLessonNode(
    state: GlobalContextStateModel
  ): string | null {
    return state.selectedContextLessonNode;
  }

  @Selector()
  static selectedContextDataset(
    state: GlobalContextStateModel
  ): DecisionFlow | null {
    return state.selectedContextDataset;
  }

  @Selector()
  static loggedInUserId(state: GlobalContextStateModel): number | null {
    return state.loggedInUser?.UserId || null;
  }

  @Selector()
  static contextUserId(state: GlobalContextStateModel): number | null {
    return state.selectedContextUser?.UserId || null;
  }

  @Selector()
  static contextTenantId(state: GlobalContextStateModel): number | null {
    return state.selectedContextTenant?.TenantID || null;
  }

  @Selector()
  static contextTeamId(state: GlobalContextStateModel): number | null {
    return state.selectedContextTeam?.TeamID || null;
  }

  @Selector()
  static contextTeamGroupId(state: GlobalContextStateModel): number | null {
    return state.selectedContextTeamGroup?.TeamGroupID || null;
  }

  @Selector()
  static isContextUserSameAsLoggedIn(state: GlobalContextStateModel): boolean {
    return (
      state.loggedInUser?.UserId === state.selectedContextUser?.UserId &&
      state.loggedInUser !== null
    );
  }

  @Action(SetLoggedInUser)
  setLoggedInUser(
    ctx: StateContext<GlobalContextStateModel>,
    action: SetLoggedInUser
  ) {
    console.log('📦 GlobalContextState: SetLoggedInUser action received:', {
      user: action.user
        ? `${action.user.FirstName} ${action.user.LastName}`
        : null,
      userId: action.user?.UserId,
      availableTenants: action.availableTenants?.length || 0,
    });

    ctx.patchState({
      loggedInUser: action.user,
      availableTenants: action.availableTenants || [],
      // When setting logged in user, default context user to logged in user
      selectedContextUser: action.user,
      // Clear team selection when changing logged-in user
      selectedContextTeam: null,
    });

    console.log(
      '✅ GlobalContextState: State updated successfully (team cleared)'
    );
  }

  @Action(SetSelectedContextTenant)
  setSelectedContextTenant(
    ctx: StateContext<GlobalContextStateModel>,
    action: SetSelectedContextTenant
  ) {
    console.log(
      '📦 GlobalContextState: SetSelectedContextTenant action received:',
      {
        tenant: action.tenant ? action.tenant.TenantName : null,
        tenantId: action.tenant?.TenantID,
        lessonCount: action.tenant?.lessons?.length || 0,
      }
    );

    ctx.patchState({
      selectedContextTenant: action.tenant,
      // Clear team selection when changing tenant
      selectedContextTeam: null,
    });

    // Load tenant's lessons into LessonsState
    if (action.tenant?.lessons && action.tenant.lessons.length > 0) {
      console.log(
        `📚 Loading ${action.tenant.lessons.length} lessons from tenant into LessonsState`
      );
      console.log(
        'Lesson IDs being loaded:',
        action.tenant.lessons.map((l) => l.LessonID)
      );

      // Dispatch AddLesson for each lesson in the tenant
      action.tenant.lessons.forEach((lesson) => {
        this.store.dispatch(new AddLesson(lesson));
      });

      console.log('✅ All tenant lessons dispatched to LessonsState');
    } else {
      console.log('⚠️ No lessons found in tenant to load');
    }

    console.log(
      '✅ GlobalContextState: Tenant updated successfully (team cleared)'
    );
  }

  @Action(SetSelectedContextUser)
  setSelectedContextUser(
    ctx: StateContext<GlobalContextStateModel>,
    action: SetSelectedContextUser
  ) {
    console.log(
      '📦 GlobalContextState: SetSelectedContextUser action received:',
      {
        user: action.user
          ? `${action.user.FirstName} ${action.user.LastName}`
          : null,
        userId: action.user?.UserId,
      }
    );

    ctx.patchState({
      selectedContextUser: action.user,
    });

    // Generate assigned lessons when context user is selected
    const state = ctx.getState();
    const tenant = state.selectedContextTenant;

    if (action.user && tenant && tenant.lessons && tenant.lessons.length > 0) {
      console.log(
        `📚 Generating assigned lessons for user ${action.user.UserId} in tenant ${tenant.TenantID}`
      );

      // Collect all team groups from all teams
      const allTeamGroups =
        tenant.Teams?.flatMap((team) => team.TeamGroups || []) || [];

      // Generate assigned lessons from tenant's available lessons
      // Use pipe/take(1) to automatically complete the subscription after one emission
      return this.mockAssignedLessonService
        .generateAssignedLessons(
          action.user.UserId,
          tenant.TenantID,
          tenant.lessons,
          tenant.Teams || [],
          allTeamGroups
        )
        .pipe(
          map((assignedLessons) => {
            console.log(
              `✅ Generated ${assignedLessons.length} assigned lessons for context user`
            );

            // Update tenant with assigned lessons
            const updatedTenant: ITenant = {
              ...tenant,
              assignedLessons: assignedLessons,
            };

            // Update state with the tenant that now has assigned lessons
            ctx.patchState({
              selectedContextTenant: updatedTenant,
            });
          })
        );
    } else {
      if (!tenant) {
        console.log('⚠️ No tenant selected, cannot generate assigned lessons');
      } else if (!tenant.lessons || tenant.lessons.length === 0) {
        console.log(
          `⚠️ Tenant ${tenant.TenantID} has no lessons available for assignment`
        );
      }
    }

    console.log('✅ GlobalContextState: Context user updated successfully');
  }

  @Action(SetSelectedContextTeam)
  setSelectedContextTeam(
    ctx: StateContext<GlobalContextStateModel>,
    action: SetSelectedContextTeam
  ) {
    console.log(
      '📦 GlobalContextState: SetSelectedContextTeam action received:',
      {
        team: action.team ? action.team.TeamName : null,
        teamId: action.team?.TeamID,
      }
    );

    ctx.patchState({
      selectedContextTeam: action.team,
      // Clear team group when team changes
      selectedContextTeamGroup: null,
    });

    console.log(
      '✅ GlobalContextState: Team updated successfully (team group cleared)'
    );
  }

  @Action(SetSelectedContextTeamGroup)
  setSelectedContextTeamGroup(
    ctx: StateContext<GlobalContextStateModel>,
    action: SetSelectedContextTeamGroup
  ) {
    console.log(
      '📦 GlobalContextState: SetSelectedContextTeamGroup action received:',
      {
        teamGroup: action.teamGroup ? action.teamGroup.TeamGroupName : null,
        teamGroupId: action.teamGroup?.TeamGroupID,
      }
    );

    ctx.patchState({
      selectedContextTeamGroup: action.teamGroup,
    });

    console.log('✅ GlobalContextState: Team group updated successfully');
  }

  @Action(SetSelectedContextLessonRunnerLesson)
  setSelectedContextLessonRunnerLesson(
    ctx: StateContext<GlobalContextStateModel>,
    action: SetSelectedContextLessonRunnerLesson
  ) {
    console.log(
      '📦 GlobalContextState: SetSelectedContextLessonRunnerLesson action received:',
      {
        lesson: action.lesson?.LessonName,
        lessonId: action.lesson?.LessonID,
      }
    );

    ctx.patchState({
      selectedContextLessonRunnerLesson: action.lesson,
    });

    console.log(
      '✅ GlobalContextState: Lesson Runner lesson updated successfully'
    );
  }

  @Action(SetSelectedContextLessonBuilderLesson)
  setSelectedContextLessonBuilderLesson(
    ctx: StateContext<GlobalContextStateModel>,
    action: SetSelectedContextLessonBuilderLesson
  ) {
    console.log(
      '📦 GlobalContextState: SetSelectedContextLessonBuilderLesson action received:',
      {
        lesson: action.lesson?.LessonName,
        lessonId: action.lesson?.LessonID,
      }
    );

    ctx.patchState({
      selectedContextLessonBuilderLesson: action.lesson,
    });

    console.log(
      '✅ GlobalContextState: Lesson Builder lesson updated successfully'
    );
  }

  @Action(SetSelectedContextNode)
  setSelectedContextNode(
    ctx: StateContext<GlobalContextStateModel>,
    action: SetSelectedContextNode
  ) {
    console.log(
      '📦 GlobalContextState: SetSelectedContextNode action received:',
      {
        nodeId: action.nodeId,
      }
    );

    ctx.patchState({
      selectedContextNode: action.nodeId,
    });

    console.log('✅ GlobalContextState: Node updated successfully');
  }

  @Action(SetSelectedContextLessonBuilderNode)
  setSelectedContextLessonBuilderNode(
    ctx: StateContext<GlobalContextStateModel>,
    action: SetSelectedContextLessonBuilderNode
  ) {
    console.log(
      '📦 GlobalContextState: SetSelectedContextLessonBuilderNode action received:',
      {
        nodeId: action.nodeId,
      }
    );

    ctx.patchState({
      selectedContextLessonBuilderNode: action.nodeId,
    });

    console.log(
      '✅ GlobalContextState: Lesson Builder node updated successfully'
    );
  }

  @Action(SetSelectedContextLessonRunnerNode)
  setSelectedContextLessonRunnerNode(
    ctx: StateContext<GlobalContextStateModel>,
    action: SetSelectedContextLessonRunnerNode
  ) {
    console.log(
      '📦 GlobalContextState: SetSelectedContextLessonRunnerNode action received:',
      {
        nodeId: action.nodeId,
      }
    );

    ctx.patchState({
      selectedContextLessonRunnerNode: action.nodeId,
    });

    console.log(
      '✅ GlobalContextState: Lesson Runner node updated successfully'
    );
  }

  @Action(SetSelectedContextLessonNode)
  setSelectedContextLessonNode(
    ctx: StateContext<GlobalContextStateModel>,
    action: SetSelectedContextLessonNode
  ) {
    console.log(
      '📦 GlobalContextState: SetSelectedContextLessonNode action received (DEPRECATED):',
      {
        nodeId: action.nodeId,
      }
    );

    ctx.patchState({
      selectedContextLessonNode: action.nodeId,
    });

    console.log('✅ GlobalContextState: Lesson node updated successfully');
  }

  @Action(SetSelectedContextDataset)
  setSelectedContextDataset(
    ctx: StateContext<GlobalContextStateModel>,
    action: SetSelectedContextDataset
  ) {
    console.log(
      '📦 GlobalContextState: SetSelectedContextDataset action received:',
      {
        dataset: action.dataset ? action.dataset.FlowName : null,
        flowId: action.dataset?.FlowID,
        ownershipContext: action.dataset?.OwnershipContext,
      }
    );

    ctx.patchState({
      selectedContextDataset: action.dataset,
    });

    console.log('✅ GlobalContextState: Dataset updated successfully');
  }

  @Action(ClearGlobalContext)
  clearGlobalContext(ctx: StateContext<GlobalContextStateModel>) {
    ctx.patchState({
      loggedInUser: null,
      availableTenants: [],
      selectedContextTenant: null,
      selectedContextUser: null,
      selectedContextTeam: null,
      selectedContextTeamGroup: null,
      selectedContextLessonRunnerLesson: null,
      selectedContextLessonBuilderLesson: null,
      selectedContextNode: null,
      selectedContextLessonBuilderNode: null,
      selectedContextLessonRunnerNode: null,
      selectedContextLessonNode: null,
      selectedContextDataset: null,
    });
  }

  @Action(InitializeGlobalContext)
  initializeGlobalContext(
    ctx: StateContext<GlobalContextStateModel>,
    action: InitializeGlobalContext
  ) {
    ctx.patchState({
      loggedInUser: action.loggedInUser,
      availableTenants: action.availableTenants || [],
      selectedContextTenant: action.selectedContextTenant || null,
      selectedContextUser: action.selectedContextUser || action.loggedInUser,
      selectedContextTeam: action.selectedContextTeam || null,
    });
  }

  @Action(SaveLastSelectedContext)
  saveLastSelectedContext(
    ctx: StateContext<GlobalContextStateModel>,
    action: SaveLastSelectedContext
  ) {
    const state = ctx.getState();
    if (state.loggedInUser) {
      const updatedUser = {
        ...state.loggedInUser,
        LastSelectedContextTenant: action.tenantId,
        LastSelectedContextUser: action.contextUserId,
      };
      ctx.patchState({
        loggedInUser: updatedUser,
      });
    }
  }

  // Actions for setting by ID (migrated from TeamSelectionState)
  @Action(SetSelectedTenant)
  setSelectedTenantById(
    ctx: StateContext<GlobalContextStateModel>,
    action: SetSelectedTenant
  ) {
    console.log(
      '📦 GlobalContextState: SetSelectedTenant (by ID) action received:',
      {
        tenantId: action.tenantId,
        clearSubSelections: action.clearSubSelections,
      }
    );

    const state = ctx.getState();
    let tenant: ITenant | null = null;

    if (action.tenantId !== null) {
      // Look up the tenant from availableTenants
      tenant =
        state.availableTenants.find((t) => t.TenantID === action.tenantId) ||
        null;
      if (!tenant) {
        console.warn(
          '⚠️ Tenant not found in availableTenants:',
          action.tenantId
        );
      }
    }

    if (action.clearSubSelections) {
      ctx.patchState({
        selectedContextTenant: tenant,
        selectedContextTeam: null,
        selectedContextTeamGroup: null,
      });
      console.log('✅ Tenant updated (team and team group cleared)');
    } else {
      ctx.patchState({
        selectedContextTenant: tenant,
      });
      console.log('✅ Tenant updated (sub-selections kept)');
    }
  }

  @Action(SetSelectedTenantOnly)
  setSelectedTenantOnlyById(
    ctx: StateContext<GlobalContextStateModel>,
    action: SetSelectedTenantOnly
  ) {
    console.log(
      '📦 GlobalContextState: SetSelectedTenantOnly (by ID) action received:',
      {
        tenantId: action.tenantId,
      }
    );

    const state = ctx.getState();
    let tenant: ITenant | null = null;

    if (action.tenantId !== null) {
      tenant =
        state.availableTenants.find((t) => t.TenantID === action.tenantId) ||
        null;
      if (!tenant) {
        console.warn(
          '⚠️ Tenant not found in availableTenants:',
          action.tenantId
        );
      }
    }

    ctx.patchState({
      selectedContextTenant: tenant,
    });
    console.log('✅ Tenant updated (sub-selections preserved)');
  }

  @Action(SetSelectedTeam)
  setSelectedTeamById(
    ctx: StateContext<GlobalContextStateModel>,
    action: SetSelectedTeam
  ) {
    console.log(
      '📦 GlobalContextState: SetSelectedTeam (by ID) action received:',
      {
        teamId: action.teamId,
      }
    );

    const state = ctx.getState();
    let team: ITeam | null = null;

    if (action.teamId !== null && state.selectedContextTenant) {
      // Look up the team from the selected tenant's teams
      team =
        state.selectedContextTenant.Teams?.find(
          (t) => t.TeamID === action.teamId
        ) || null;
      if (!team) {
        console.warn('⚠️ Team not found in selected tenant:', action.teamId);
      }
    }

    ctx.patchState({
      selectedContextTeam: team,
      selectedContextTeamGroup: null, // Clear team group when team changes
    });
    console.log('✅ Team updated (team group cleared)');
  }

  @Action(SetSelectedTeamGroup)
  setSelectedTeamGroupById(
    ctx: StateContext<GlobalContextStateModel>,
    action: SetSelectedTeamGroup
  ) {
    console.log(
      '📦 GlobalContextState: SetSelectedTeamGroup (by ID) action received:',
      {
        teamGroupId: action.teamGroupId,
      }
    );

    const state = ctx.getState();
    let teamGroup: ITeamGroup | null = null;

    if (action.teamGroupId !== null && state.selectedContextTeam) {
      // Look up the team group from the selected team's team groups
      teamGroup =
        state.selectedContextTeam.TeamGroups?.find(
          (tg) => tg.TeamGroupID === action.teamGroupId
        ) || null;
      if (!teamGroup) {
        console.warn(
          '⚠️ TeamGroup not found in selected team:',
          action.teamGroupId
        );
      }
    }

    ctx.patchState({
      selectedContextTeamGroup: teamGroup,
    });
    console.log('✅ TeamGroup updated');
  }

  @Action(ClearTeamSelections)
  clearTeamSelections(ctx: StateContext<GlobalContextStateModel>) {
    console.log('📦 GlobalContextState: ClearTeamSelections action received');

    ctx.patchState({
      selectedContextTenant: null,
      selectedContextTeam: null,
      selectedContextTeamGroup: null,
    });

    console.log('✅ All team selections cleared');
  }

  @Action(UpdateAssignedLessonStatus)
  updateAssignedLessonStatus(
    ctx: StateContext<GlobalContextStateModel>,
    action: UpdateAssignedLessonStatus
  ) {
    const state = ctx.getState();
    const tenant = state.selectedContextTenant;

    console.log('[STATE] 🔄 UpdateAssignedLessonStatus action received:', {
      lessonId: action.lessonId,
      newStatus: action.status,
      hasTenant: !!tenant,
      assignedLessonsCount: tenant?.assignedLessons?.length,
    });

    if (!tenant?.assignedLessons) {
      console.warn(
        '[STATE] ⚠️ Cannot update lesson status: No assigned lessons found'
      );
      return;
    }

    const oldLesson = tenant.assignedLessons.find(
      (lesson) => lesson.lessonId === action.lessonId
    );
    console.log('[STATE] 📋 Found lesson to update:', {
      lessonId: oldLesson?.lessonId,
      lessonName: oldLesson?.lessonName,
      oldStatus: oldLesson?.status,
      newStatus: action.status,
    });

    const updatedLessons = tenant.assignedLessons.map((lesson) =>
      lesson.lessonId === action.lessonId
        ? { ...lesson, status: action.status }
        : lesson
    );

    const updatedTenant = {
      ...tenant,
      assignedLessons: updatedLessons,
    };

    ctx.patchState({
      selectedContextTenant: updatedTenant,
    });

    console.log(
      `[STATE] ✅ Updated lesson ${action.lessonId} status to ${action.status}`
    );
    console.log('[STATE] 📊 New tenant state:', {
      tenantId: updatedTenant.TenantID,
      assignedLessonsCount: updatedTenant.assignedLessons.length,
      updatedLesson: updatedLessons.find((l) => l.lessonId === action.lessonId),
    });
  }

  @Action(RefreshTeamsByContext)
  refreshTeamsByContext(
    ctx: StateContext<GlobalContextStateModel>,
    action: RefreshTeamsByContext
  ) {
    console.log(
      '🔄 GlobalContextState: RefreshTeamsByContext action received:',
      {
        tenantId: action.tenantId,
      }
    );

    const state = ctx.getState();

    // Validate that current team and team group selections are still valid
    if (state.selectedContextTeam) {
      const currentTeamId = state.selectedContextTeam.TeamID;
      const tenantTeams = state.selectedContextTenant?.Teams || [];
      const teamStillValid = tenantTeams.some(
        (t) => t.TeamID === currentTeamId
      );

      if (!teamStillValid) {
        console.log('⚠️ Current team is no longer valid, clearing selections');
        ctx.patchState({
          selectedContextTeam: null,
          selectedContextTeamGroup: null,
        });
      } else if (state.selectedContextTeamGroup) {
        const currentTeamGroupId = state.selectedContextTeamGroup.TeamGroupID;
        const teamGroups = state.selectedContextTeam.TeamGroups || [];
        const teamGroupStillValid = teamGroups.some(
          (tg) => tg.TeamGroupID === currentTeamGroupId
        );

        if (!teamGroupStillValid) {
          console.log('⚠️ Current team group is no longer valid, clearing');
          ctx.patchState({
            selectedContextTeamGroup: null,
          });
        }
      }
    }

    console.log('✅ Teams context refreshed');
  }
}
