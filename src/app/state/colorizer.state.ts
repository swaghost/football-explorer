import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { IColorizer } from '../interfaces/colorization/colorizer.interface';
import { IColorizationStrategy } from '../interfaces/colorization/colorization-strategy.interface';

// ============================================================================
// ACTIONS
// ============================================================================

export class UpdateColorizer {
  static readonly type = '[Colorizer] Update Colorizer';
  constructor(public payload: Partial<IColorizer>) {}
}

export class UpdateColorUniformity {
  static readonly type = '[Colorizer] Update Color Uniformity';
  constructor(public payload: 'Solid' | 'Gradient') {}
}

export class UpdateColorGradientDirectionality {
  static readonly type = '[Colorizer] Update Color Gradient Directionality';
  constructor(public payload: 'sunset' | 'sunrise') {}
}

export class UpdateNodeOpacity {
  static readonly type = '[Colorizer] Update Node Opacity';
  constructor(public payload: number) {} // 0-1
}

export class UpdateLinkContrast {
  static readonly type = '[Colorizer] Update Link Contrast';
  constructor(public payload: 'high' | 'low' | 'very-low' | 'absent') {}
}

export class UpdateLinkColor {
  static readonly type = '[Colorizer] Update Link Color';
  constructor(public payload: string) {} // Hex or rgb format
}

export class UpdateBackground {
  static readonly type = '[Colorizer] Update Background';
  constructor(public payload: string) {}
}

export class UpdateColorTarget {
  static readonly type = '[Colorizer] Update Color Target';
  constructor(public payload: 'nodes' | 'text' | 'both') {}
}

export class UpdateColorBrightness {
  static readonly type = '[Colorizer] Update Color Brightness';
  constructor(public payload: number) {} // 0-100
}

export class UpdateColorGradientBrightnessEnd {
  static readonly type = '[Colorizer] Update Color Gradient Brightness End';
  constructor(public payload: number) {} // 0-100
}

export class UpdateNodeFillColor {
  static readonly type = '[Colorizer] Update Node Fill Color';
  constructor(public payload: string) {}
}

export class UpdateNodeStrokeColor {
  static readonly type = '[Colorizer] Update Node Stroke Color';
  constructor(public payload: string) {}
}

export class UpdateTextFillColor {
  static readonly type = '[Colorizer] Update Text Fill Color';
  constructor(public payload: string) {}
}

export class UpdateTextStrokeColor {
  static readonly type = '[Colorizer] Update Text Stroke Color';
  constructor(public payload: string) {}
}

export class ResetColorizer {
  static readonly type = '[Colorizer] Reset Colorizer';
}

// ============================================================================
// STATE
// ============================================================================

export interface ColorizerStateModel {
  colorizer: IColorizer | null;
}

@Injectable()
@State<ColorizerStateModel>({
  name: 'colorizer',
  defaults: {
    colorizer: null,
  },
})
export class ColorizerState {
  // ============================================================================
  // SELECTORS
  // ============================================================================

  @Selector()
  static getColorizer(state: ColorizerStateModel): IColorizer | null {
    return state.colorizer;
  }

  @Selector()
  static getColorizationStrategy(
    state: ColorizerStateModel
  ): IColorizationStrategy | null {
    return state.colorizer?.strategy ?? null;
  }

  @Selector()
  static getResolvedColorUniformity(
    state: ColorizerStateModel
  ): 'Solid' | 'Gradient' | null {
    return state.colorizer?.resolvedColorUniformity ?? null;
  }

  @Selector()
  static getResolvedColorGradientDirectionality(
    state: ColorizerStateModel
  ): 'sunset' | 'sunrise' | null {
    return state.colorizer?.resolvedColorGradientDirectionality ?? null;
  }

  @Selector()
  static getResolvedNodeOpacity(state: ColorizerStateModel): number | null {
    return state.colorizer?.resolvedNodeOpacity ?? null;
  }

  @Selector()
  static getResolvedLinkContrast(
    state: ColorizerStateModel
  ): 'high' | 'low' | 'very-low' | 'absent' | null {
    return state.colorizer?.resolvedLinkContrast ?? null;
  }

  @Selector()
  static getResolvedLinkColor(state: ColorizerStateModel): string | null {
    return state.colorizer?.resolvedLinkColor ?? null;
  }

  @Selector()
  static getResolvedBackground(state: ColorizerStateModel): string | null {
    return state.colorizer?.resolvedBackground ?? null;
  }

  @Selector()
  static getColorTarget(
    state: ColorizerStateModel
  ): 'nodes' | 'text' | 'both' | null {
    return state.colorizer?.colorTarget ?? null;
  }

  @Selector()
  static getColorBrightness(state: ColorizerStateModel): number | null {
    return state.colorizer?.colorBrightness ?? null;
  }

  @Selector()
  static getColorGradientBrightnessEnd(
    state: ColorizerStateModel
  ): number | null {
    return state.colorizer?.colorGradientBrightnessEnd ?? null;
  }

  @Selector()
  static getResolvedNodeFillColor(state: ColorizerStateModel): string | null {
    return state.colorizer?.resolvedNodeFillColor ?? null;
  }

  @Selector()
  static getResolvedNodeStrokeColor(state: ColorizerStateModel): string | null {
    return state.colorizer?.resolvedNodeStrokeColor ?? null;
  }

  @Selector()
  static getResolvedTextFillColor(state: ColorizerStateModel): string | null {
    return state.colorizer?.resolvedTextFillColor ?? null;
  }

  @Selector()
  static getResolvedTextStrokeColor(state: ColorizerStateModel): string | null {
    return state.colorizer?.resolvedTextStrokeColor ?? null;
  }

  // ============================================================================
  // ACTIONS
  // ============================================================================

  @Action(UpdateColorizer)
  updateColorizer(
    ctx: StateContext<ColorizerStateModel>,
    action: UpdateColorizer
  ): void {
    const state = ctx.getState();
    const colorizer = state.colorizer;

    if (!colorizer) {
      return; // No active colorizer to update
    }

    // Merge updates
    const updated: IColorizer = {
      ...colorizer,
      ...action.payload,
    };

    // Recompute resolved values
    this.resolveColorizerValues(updated);

    ctx.setState({
      colorizer: updated,
    });
  }

  @Action(UpdateColorUniformity)
  updateColorUniformity(
    ctx: StateContext<ColorizerStateModel>,
    action: UpdateColorUniformity
  ): void {
    const state = ctx.getState();
    const colorizer = state.colorizer;

    if (!colorizer || colorizer.strategy.colorUniformity) {
      return; // No active colorizer or strategy locks the value
    }

    const updated: IColorizer = {
      ...colorizer,
      userColorUniformity: action.payload,
    };

    this.resolveColorizerValues(updated);

    ctx.setState({
      colorizer: updated,
    });
  }

  @Action(UpdateColorGradientDirectionality)
  updateColorGradientDirectionality(
    ctx: StateContext<ColorizerStateModel>,
    action: UpdateColorGradientDirectionality
  ): void {
    const state = ctx.getState();
    const colorizer = state.colorizer;

    if (!colorizer || colorizer.strategy.colorGradientDirectionality) {
      return; // No active colorizer or strategy locks the value
    }

    const updated: IColorizer = {
      ...colorizer,
      userColorGradientDirectionality: action.payload,
    };

    this.resolveColorizerValues(updated);

    ctx.setState({
      colorizer: updated,
    });
  }

  @Action(UpdateNodeOpacity)
  updateNodeOpacity(
    ctx: StateContext<ColorizerStateModel>,
    action: UpdateNodeOpacity
  ): void {
    const state = ctx.getState();
    const colorizer = state.colorizer;

    if (!colorizer || colorizer.strategy.nodeOpacity !== undefined) {
      return; // No active colorizer or strategy locks the value
    }

    const updated: IColorizer = {
      ...colorizer,
      userNodeOpacity: Math.max(0, Math.min(1, action.payload)), // Clamp to 0-1
    };

    this.resolveColorizerValues(updated);

    ctx.setState({
      colorizer: updated,
    });
  }

  @Action(UpdateLinkContrast)
  updateLinkContrast(
    ctx: StateContext<ColorizerStateModel>,
    action: UpdateLinkContrast
  ): void {
    const state = ctx.getState();
    const colorizer = state.colorizer;

    if (!colorizer || colorizer.strategy.linkContrast) {
      return; // No active colorizer or strategy locks the value
    }

    const updated: IColorizer = {
      ...colorizer,
      userLinkContrast: action.payload,
    };

    this.resolveColorizerValues(updated);

    ctx.setState({
      colorizer: updated,
    });
  }

  @Action(UpdateLinkColor)
  updateLinkColor(
    ctx: StateContext<ColorizerStateModel>,
    action: UpdateLinkColor
  ): void {
    const state = ctx.getState();
    const colorizer = state.colorizer;

    if (!colorizer || colorizer.strategy.linkColor) {
      return; // No active colorizer or strategy locks the value
    }

    const updated: IColorizer = {
      ...colorizer,
      userLinkColor: action.payload,
    };

    this.resolveColorizerValues(updated);

    ctx.setState({
      colorizer: updated,
    });
  }

  @Action(UpdateBackground)
  updateBackground(
    ctx: StateContext<ColorizerStateModel>,
    action: UpdateBackground
  ): void {
    const state = ctx.getState();
    const colorizer = state.colorizer;

    if (!colorizer || colorizer.strategy.background) {
      return; // No active colorizer or strategy locks the value
    }

    const updated: IColorizer = {
      ...colorizer,
      userBackground: action.payload,
    };

    this.resolveColorizerValues(updated);

    ctx.setState({
      colorizer: updated,
    });
  }

  @Action(UpdateColorTarget)
  updateColorTarget(
    ctx: StateContext<ColorizerStateModel>,
    action: UpdateColorTarget
  ): void {
    const state = ctx.getState();
    const colorizer = state.colorizer;

    if (!colorizer) {
      return; // No active colorizer to update
    }

    const updated: IColorizer = {
      ...colorizer,
      colorTarget: action.payload,
    };

    ctx.setState({
      colorizer: updated,
    });
  }

  @Action(UpdateColorBrightness)
  updateColorBrightness(
    ctx: StateContext<ColorizerStateModel>,
    action: UpdateColorBrightness
  ): void {
    const state = ctx.getState();
    const colorizer = state.colorizer;

    if (!colorizer) {
      return; // No active colorizer to update
    }

    const updated: IColorizer = {
      ...colorizer,
      colorBrightness: Math.max(0, Math.min(100, action.payload)), // Clamp to 0-100
    };

    ctx.setState({
      colorizer: updated,
    });
  }

  @Action(UpdateColorGradientBrightnessEnd)
  updateColorGradientBrightnessEnd(
    ctx: StateContext<ColorizerStateModel>,
    action: UpdateColorGradientBrightnessEnd
  ): void {
    const state = ctx.getState();
    const colorizer = state.colorizer;

    if (!colorizer) {
      return; // No active colorizer to update
    }

    const updated: IColorizer = {
      ...colorizer,
      colorGradientBrightnessEnd: Math.max(0, Math.min(100, action.payload)), // Clamp to 0-100
    };

    ctx.setState({
      colorizer: updated,
    });
  }

  @Action(UpdateNodeFillColor)
  updateNodeFillColor(
    ctx: StateContext<ColorizerStateModel>,
    action: UpdateNodeFillColor
  ): void {
    const state = ctx.getState();
    const colorizer = state.colorizer;

    if (!colorizer) {
      return; // No active colorizer to update
    }

    const updated: IColorizer = {
      ...colorizer,
      userNodeFillColor: action.payload,
    };

    this.resolveColorizerValues(updated);

    ctx.setState({
      colorizer: updated,
    });
  }

  @Action(UpdateNodeStrokeColor)
  updateNodeStrokeColor(
    ctx: StateContext<ColorizerStateModel>,
    action: UpdateNodeStrokeColor
  ): void {
    const state = ctx.getState();
    const colorizer = state.colorizer;

    if (!colorizer) {
      return; // No active colorizer to update
    }

    const updated: IColorizer = {
      ...colorizer,
      userNodeStrokeColor: action.payload,
    };

    this.resolveColorizerValues(updated);

    ctx.setState({
      colorizer: updated,
    });
  }

  @Action(UpdateTextFillColor)
  updateTextFillColor(
    ctx: StateContext<ColorizerStateModel>,
    action: UpdateTextFillColor
  ): void {
    const state = ctx.getState();
    const colorizer = state.colorizer;

    if (!colorizer) {
      return; // No active colorizer to update
    }

    const updated: IColorizer = {
      ...colorizer,
      userTextFillColor: action.payload,
    };

    this.resolveColorizerValues(updated);

    ctx.setState({
      colorizer: updated,
    });
  }

  @Action(UpdateTextStrokeColor)
  updateTextStrokeColor(
    ctx: StateContext<ColorizerStateModel>,
    action: UpdateTextStrokeColor
  ): void {
    const state = ctx.getState();
    const colorizer = state.colorizer;

    if (!colorizer) {
      return; // No active colorizer to update
    }

    const updated: IColorizer = {
      ...colorizer,
      userTextStrokeColor: action.payload,
    };

    this.resolveColorizerValues(updated);

    ctx.setState({
      colorizer: updated,
    });
  }

  @Action(ResetColorizer)
  resetColorizer(ctx: StateContext<ColorizerStateModel>): void {
    ctx.setState({
      colorizer: null,
    });
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Recomputes resolved values based on strategy constraints and user overrides
   */
  private resolveColorizerValues(colorizer: IColorizer): void {
    const strategy = colorizer.strategy;

    // Color Uniformity: Use strategy if locked, otherwise use user choice or default to Solid
    colorizer.resolvedColorUniformity =
      strategy.colorUniformity ?? colorizer.userColorUniformity ?? 'Solid';

    // Color Gradient Directionality: Only applies if Gradient, use strategy if locked
    if (colorizer.resolvedColorUniformity === 'Gradient') {
      colorizer.resolvedColorGradientDirectionality =
        strategy.colorGradientDirectionality ??
        colorizer.userColorGradientDirectionality ??
        'sunset';
    } else {
      colorizer.resolvedColorGradientDirectionality = undefined;
    }

    // Node Opacity: Use strategy if locked, otherwise use user choice or default to 1
    colorizer.resolvedNodeOpacity =
      strategy.nodeOpacity ?? colorizer.userNodeOpacity ?? 1;

    // Link Contrast: Use strategy if set, otherwise user choice or default to 'high'
    colorizer.resolvedLinkContrast =
      strategy.linkContrast ?? colorizer.userLinkContrast ?? 'high';

    // Link Color: Use strategy if set, otherwise user choice or default to black
    colorizer.resolvedLinkColor =
      strategy.linkColor ?? colorizer.userLinkColor ?? '#000000';

    // Background: Use strategy if set, otherwise user choice or default to white
    colorizer.resolvedBackground =
      strategy.background ?? colorizer.userBackground ?? '#ffffff';

    // Node Fill Color: Use strategy if set, otherwise user choice or default to system color
    colorizer.resolvedNodeFillColor = colorizer.userNodeFillColor ?? '#4a90e2';

    // Node Stroke Color: Use strategy if set, otherwise user choice or default to black
    colorizer.resolvedNodeStrokeColor =
      colorizer.userNodeStrokeColor ?? '#000000';

    // Text Fill Color: Use strategy if set, otherwise user choice or default to black
    colorizer.resolvedTextFillColor = colorizer.userTextFillColor ?? '#000000';

    // Text Stroke Color: Use strategy if set, otherwise user choice or default to white
    colorizer.resolvedTextStrokeColor =
      colorizer.userTextStrokeColor ?? '#ffffff';
  }
}
