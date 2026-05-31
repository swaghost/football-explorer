import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { ISavedColorizer } from '../interfaces/colorization/saved-colorizer.interface';
import { IColorizer } from '../interfaces/colorization/colorizer.interface';
import { OwnershipContext } from '../interfaces/ownership-context.interface';
import { sanitizeColorizerName } from '../utils/colorizer-export.utils';

// ============================================================================
// ACTIONS
// ============================================================================

export class AddColorizerToLibrary {
  static readonly type = '[ColorizerLibrary] Add Colorizer';
  constructor(
    public payload: {
      colorizer: IColorizer;
      colorizerName: string;
      description?: string;
      ownershipContext: OwnershipContext;
      tags?: string[];
    }
  ) {}
}

export class UpdateColorizerInLibrary {
  static readonly type = '[ColorizerLibrary] Update Colorizer';
  constructor(
    public payload: {
      colorizerId: string;
      colorizer: IColorizer;
      description?: string;
      tags?: string[];
    }
  ) {}
}

export class DeleteColorizerFromLibrary {
  static readonly type = '[ColorizerLibrary] Delete Colorizer';
  constructor(public payload: string) {} // colorizerId
}

export class LoadColorizerFromLibrary {
  static readonly type = '[ColorizerLibrary] Load Colorizer';
  constructor(public payload: string) {} // colorizerId
}

export class ClearColorizerLibrary {
  static readonly type = '[ColorizerLibrary] Clear Library';
}

// ============================================================================
// STATE
// ============================================================================

export interface ColorizerLibraryStateModel {
  colorizers: ISavedColorizer[];
  currentColorizerId: string | null; // Currently loaded colorizer
}

@Injectable()
@State<ColorizerLibraryStateModel>({
  name: 'colorizerLibrary',
  defaults: {
    colorizers: [],
    currentColorizerId: null,
  },
})
export class ColorizerLibraryState {
  // ============================================================================
  // SELECTORS
  // ============================================================================

  @Selector()
  static getColorizerLibrary(
    state: ColorizerLibraryStateModel
  ): ISavedColorizer[] {
    return state.colorizers;
  }

  @Selector()
  static getColorizerById(state: ColorizerLibraryStateModel) {
    return (colorizerId: string): ISavedColorizer | undefined => {
      return state.colorizers.find((c) => c.colorizerId === colorizerId);
    };
  }

  @Selector()
  static getColorizersByOwnership(state: ColorizerLibraryStateModel) {
    return (ownershipContext: OwnershipContext): ISavedColorizer[] => {
      return state.colorizers.filter(
        (c) =>
          c.ownershipContext.Context === ownershipContext.Context &&
          c.ownershipContext.ContextKey === ownershipContext.ContextKey
      );
    };
  }

  @Selector()
  static getCurrentColorizer(
    state: ColorizerLibraryStateModel
  ): ISavedColorizer | undefined {
    if (!state.currentColorizerId) return undefined;
    return state.colorizers.find(
      (c) => c.colorizerId === state.currentColorizerId
    );
  }

  @Selector()
  static getCurrentColorizerId(
    state: ColorizerLibraryStateModel
  ): string | null {
    return state.currentColorizerId;
  }

  @Selector()
  static getColorizerCount(state: ColorizerLibraryStateModel): number {
    return state.colorizers.length;
  }

  // ============================================================================
  // ACTIONS
  // ============================================================================

  @Action(AddColorizerToLibrary)
  addColorizerToLibrary(
    ctx: StateContext<ColorizerLibraryStateModel>,
    action: AddColorizerToLibrary
  ): void {
    const state = ctx.getState();

    // Sanitize colorizer name to ensure OS compatibility for export
    const sanitizedName = sanitizeColorizerName(action.payload.colorizerName);

    const savedColorizer: ISavedColorizer = {
      ...action.payload.colorizer,
      colorizerId: this.generateId(),
      colorizerName: sanitizedName, // Use sanitized name
      description: action.payload.description,
      ownershipContext: action.payload.ownershipContext,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
      tags: action.payload.tags || [],
    };

    ctx.setState({
      ...state,
      colorizers: [...state.colorizers, savedColorizer],
      currentColorizerId: savedColorizer.colorizerId,
    });
  }

  @Action(UpdateColorizerInLibrary)
  updateColorizerInLibrary(
    ctx: StateContext<ColorizerLibraryStateModel>,
    action: UpdateColorizerInLibrary
  ): void {
    const state = ctx.getState();

    const updated = state.colorizers.map((c) => {
      if (c.colorizerId === action.payload.colorizerId) {
        return {
          ...c,
          ...action.payload.colorizer,
          description: action.payload.description ?? c.description,
          tags: action.payload.tags ?? c.tags,
          updatedAt: Date.now(),
          version: (c.version ?? 1) + 1,
        };
      }
      return c;
    });

    ctx.setState({
      ...state,
      colorizers: updated,
    });
  }

  @Action(DeleteColorizerFromLibrary)
  deleteColorizerFromLibrary(
    ctx: StateContext<ColorizerLibraryStateModel>,
    action: DeleteColorizerFromLibrary
  ): void {
    const state = ctx.getState();

    const filtered = state.colorizers.filter(
      (c) => c.colorizerId !== action.payload
    );
    const newCurrentId =
      state.currentColorizerId === action.payload
        ? null
        : state.currentColorizerId;

    ctx.setState({
      ...state,
      colorizers: filtered,
      currentColorizerId: newCurrentId,
    });
  }

  @Action(LoadColorizerFromLibrary)
  loadColorizerFromLibrary(
    ctx: StateContext<ColorizerLibraryStateModel>,
    action: LoadColorizerFromLibrary
  ): void {
    const state = ctx.getState();
    const exists = state.colorizers.some(
      (c) => c.colorizerId === action.payload
    );

    if (exists) {
      ctx.setState({
        ...state,
        currentColorizerId: action.payload,
      });
    }
  }

  @Action(ClearColorizerLibrary)
  clearColorizerLibrary(ctx: StateContext<ColorizerLibraryStateModel>): void {
    ctx.setState({
      colorizers: [],
      currentColorizerId: null,
    });
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Generate a unique ID for a colorizer
   * Simple UUID v4-like generation
   */
  private generateId(): string {
    return (
      'colorizer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    );
  }
}
