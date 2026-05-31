// Global context state model

import { User, ITenant, ITeam, ITeamGroup } from '../interfaces';
import { DecisionFlow } from '../interfaces/decision-flow.interfaces';
import { ILesson } from '../interfaces/lesson-builder.interfaces';

export interface GlobalContextStateModel {
  loggedInUser: User | null;
  availableTenants: ITenant[];
  selectedContextTenant: ITenant | null;
  selectedContextUser: User | null;
  selectedContextTeam: ITeam | null;
  selectedContextTeamGroup: ITeamGroup | null;
  selectedContextLessonRunnerLesson: ILesson | null; // Lesson for running/viewing
  selectedContextLessonBuilderLesson: ILesson | null; // Lesson for building/editing
  selectedContextNode: string | null; // Currently selected node ID (general)
  selectedContextLessonBuilderNode: string | null; // Currently selected lesson builder node ID
  selectedContextLessonRunnerNode: string | null; // Currently selected lesson runner node ID
  selectedContextLessonNode: string | null; // DEPRECATED: Use Builder or Runner specific instead
  selectedContextDataset: DecisionFlow | null; // Currently selected dataset (DecisionFlow)
}
