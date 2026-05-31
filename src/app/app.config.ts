import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngxs/store';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';

import { routes } from './app.routes';
import { LessonsState } from './state/lessons.state';
import { SketchState } from './state/sketch.state';
import { QuickNavState } from './state/quick-nav.state';
import { GlobalContextState } from './state/user-context.state';
import { TourState } from './state/tour.state';
import { MiniMatchState } from './state/mini-match.state';
import { ToDoState } from './state/to-do/to-do.state';
import { OverlayState } from './state/overlay/overlay.state';
import { ColorizerState } from './state/colorizer.state';
import { ColorizerLibraryState } from './state/colorizer-library.state';
import { apiSoccerConfigFactory } from './functions/apiSoccerConfigFactory.function';
import {
  provideApi,
  SoccrApiModule,
  Configuration,
  ConfigurationParameters,
  AppRoutingService,
} from '@soccr.io/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(SoccrApiModule.forRoot(() => apiSoccerConfigFactory())),
    provideStore(
      [
        LessonsState,
        SketchState,
        QuickNavState,
        GlobalContextState,
        TourState,
        MiniMatchState,
        ToDoState,
        OverlayState,
        ColorizerState,
        ColorizerLibraryState,
      ],
      {
        developmentMode: true,
      },
    ),
    withNgxsStoragePlugin({
      keys: [
        'lessons',
        'sketch',
        'quickNav',
        'globalContext',
        'tour',
        'miniMatch',
        'toDo',
        'overlay',
        'colorizer',
        'colorizerLibrary',
      ], // This will persist all states including the colorizer library to localStorage
      serialize: JSON.stringify,
      deserialize: (value: string) => {
        const parsed = JSON.parse(value);

        // The deserializer is called per state key, so 'parsed' is the state object itself,
        // not a wrapper. No need to check for parsed.sketch - it's the sketch state directly.
        if (parsed) {
          // Ensure shapes is always an array
          parsed.shapes = Array.isArray(parsed.shapes) ? parsed.shapes : [];
          parsed.strokes = Array.isArray(parsed.strokes) ? parsed.strokes : [];
          parsed.history = Array.isArray(parsed.history) ? parsed.history : [];

          // Ensure nodeVisitHistory is preserved with proper structure
          if (
            !parsed.nodeVisitHistory ||
            typeof parsed.nodeVisitHistory.visits !== 'object'
          ) {
            parsed.nodeVisitHistory = { visits: {} };
          }

          // Ensure personalCollections is preserved
          if (!parsed.personalCollections) {
            parsed.personalCollections = {
              favoriteNodes: [],
              bookmarkedNodes: [],
            };
          }

          // Ensure toolbarVisibility is properly merged with defaults
          const defaultVisiblity = {
            selectionTools: true,
            annotation: true,
            drawingModifiers: true,
            lessons: true,
            explorer: false,
            selectedNodes: true,
            lessonViewer: false,
            lessonBuilderV2: false,
            lessonRunnerV2: false,
            techniqueExplorer: false,
            skillsRadar: false,
            quickNav: false,
            search: true,
            teams: true,
            teamRoster: true,
            teamGroupMembers: true,
            defaultTeamGroups: false,
            datasets: true,
            zoomControls: true,
            rotationControl: true,
            statusPanel: true,
            viewportInfo: true,
            visualizationOptions: true,
            colorizationOptions: false,
          };

          console.log(
            '[Deserialize] Default toolbar visibility:',
            defaultVisiblity,
          );
          console.log(
            '[Deserialize] NGXS saved toolbar visibility:',
            parsed.toolbarVisibility || 'MISSING',
          );

          const savedVisibility = parsed.toolbarVisibility || {};
          parsed.toolbarVisibility = {
            ...defaultVisiblity,
            ...savedVisibility,
          };
          console.log(
            '✅ [Deserialize] Final merged toolbar visibility:',
            parsed.toolbarVisibility,
          );

          // Ensure toolbarExpandStates has proper structure
          if (
            !parsed.toolbarExpandStates ||
            typeof parsed.toolbarExpandStates !== 'object'
          ) {
            console.warn(
              '⚠️  [Deserialize] toolbarExpandStates missing or invalid, using defaults',
            );
            parsed.toolbarExpandStates = {
              selectionTools: false,
              annotation: false,
              drawingModifiers: false,
              lessons: false,
              explorer: false,
              selectedNodes: false,
              lessonViewer: false,
              lessonBuilderV2: false,
              lessonRunnerV2: false,
              techniqueExplorer: false,
              skillsRadar: false,
              quickNav: false,
              search: false,
              teams: false,
              teamRoster: false,
              teamGroupMembers: false,
              defaultTeamGroups: false,
              datasets: false,
              zoomControls: false,
              rotationControl: false,
              statusPanel: false,
              viewportInfo: false,
              visualizationOptions: false,
              colorizationOptions: false,
            };
          }

          // Ensure nodeCompletionHistory is preserved with proper structure
          if (
            !parsed.nodeCompletionHistory ||
            typeof parsed.nodeCompletionHistory.completions !== 'object'
          ) {
            parsed.nodeCompletionHistory = { completions: {} };
          }
        }
        return parsed;
      },
    }),
  ],
};
