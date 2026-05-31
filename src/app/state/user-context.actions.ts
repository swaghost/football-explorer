// Global context state actions

import { User, ITenant, ITeam, ITeamGroup } from '../interfaces';
import { DecisionFlow } from '../interfaces/decision-flow.interfaces';
import { ILesson } from '../interfaces/lesson-builder.interfaces';

export class SetLoggedInUser {
  static readonly type = '[GlobalContext] Set Logged In User';
  constructor(public user: User, public availableTenants?: ITenant[]) {}
}

export class SetSelectedContextTenant {
  static readonly type = '[GlobalContext] Set Selected Context Tenant';
  constructor(public tenant: ITenant) {}
}

export class SetSelectedContextUser {
  static readonly type = '[GlobalContext] Set Selected Context User';
  constructor(public user: User) {}
}

export class SetSelectedContextTeam {
  static readonly type = '[GlobalContext] Set Selected Context Team';
  constructor(public team: ITeam | null) {}
}

export class SetSelectedContextTeamGroup {
  static readonly type = '[GlobalContext] Set Selected Context Team Group';
  constructor(public teamGroup: ITeamGroup | null) {}
}

export class SetSelectedContextLessonRunnerLesson {
  static readonly type =
    '[GlobalContext] Set Selected Context Lesson Runner Lesson';
  constructor(public lesson: ILesson | null) {}
}

export class SetSelectedContextLessonBuilderLesson {
  static readonly type =
    '[GlobalContext] Set Selected Context Lesson Builder Lesson';
  constructor(public lesson: ILesson | null) {}
}

export class SetSelectedContextNode {
  static readonly type = '[GlobalContext] Set Selected Context Node';
  constructor(public nodeId: string | null) {}
}

export class SetSelectedContextLessonBuilderNode {
  static readonly type =
    '[GlobalContext] Set Selected Context Lesson Builder Node';
  constructor(public nodeId: string | null) {}
}

export class SetSelectedContextLessonRunnerNode {
  static readonly type =
    '[GlobalContext] Set Selected Context Lesson Runner Node';
  constructor(public nodeId: string | null) {}
}

// DEPRECATED: Use SetSelectedContextLessonBuilderNode or SetSelectedContextLessonRunnerNode instead
export class SetSelectedContextLessonNode {
  static readonly type = '[GlobalContext] Set Selected Context Lesson Node';
  constructor(public nodeId: string | null) {}
}

export class SetSelectedContextDataset {
  static readonly type = '[GlobalContext] Set Selected Context Dataset';
  constructor(public dataset: DecisionFlow | null) {}
}

export class ClearGlobalContext {
  static readonly type = '[GlobalContext] Clear Global Context';
}

export class InitializeGlobalContext {
  static readonly type = '[GlobalContext] Initialize Global Context';
  constructor(
    public loggedInUser: User,
    public selectedContextTenant?: ITenant,
    public selectedContextUser?: User,
    public selectedContextTeam?: ITeam,
    public availableTenants?: ITenant[]
  ) {}
}

export class SaveLastSelectedContext {
  static readonly type = '[GlobalContext] Save Last Selected Context';
  constructor(public tenantId: number, public contextUserId: number) {}
}

// Actions for setting by ID (migrated from TeamSelectionState)
export class SetSelectedTenant {
  static readonly type = '[GlobalContext] Set Selected Tenant By ID';
  constructor(
    public tenantId: number | null,
    public clearSubSelections = true
  ) {}
}

export class SetSelectedTenantOnly {
  static readonly type = '[GlobalContext] Set Selected Tenant By ID Only';
  constructor(public tenantId: number | null) {}
}

export class SetSelectedTeam {
  static readonly type = '[GlobalContext] Set Selected Team By ID';
  constructor(public teamId: number | null) {}
}

export class SetSelectedTeamGroup {
  static readonly type = '[GlobalContext] Set Selected Team Group By ID';
  constructor(public teamGroupId: number | null) {}
}

export class ClearTeamSelections {
  static readonly type = '[GlobalContext] Clear All Team Selections';
}

export class RefreshTeamsByContext {
  static readonly type = '[GlobalContext] Refresh Teams By Context';
  constructor(public tenantId: number | null) {}
}

export class UpdateAssignedLessonStatus {
  static readonly type = '[GlobalContext] Update Assigned Lesson Status';
  constructor(
    public lessonId: number,
    public status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'REVIEW_NEEDED'
  ) {}
}
