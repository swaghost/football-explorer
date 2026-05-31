import { IColorizationStrategy } from './colorization-strategy.interface';

/**
 * Represents the current user-selected colorization configuration
 * Combines a strategy with user-selected options and overrides
 * Stored in NGXS ColorizerState
 */
export interface IColorizer {
  // Active Strategy
  strategy: IColorizationStrategy;

  // Color Target (which elements to colorize)
  colorTarget: 'nodes' | 'text' | 'both';

  // Brightness Controls
  colorBrightness: number; // 0-100, brightness for base color
  colorGradientBrightnessEnd: number; // 0-100, brightness at end of gradient (if gradient mode)

  // User-Selected Options (can override strategy if not locked by strategy)
  userColorUniformity?: 'Solid' | 'Gradient'; // User choice (ignored if strategy specifies)
  userColorGradientDirectionality?: 'sunset' | 'sunrise'; // User choice (ignored if strategy specifies)
  userNodeOpacity: number; // Node opacity (0-1), required, default 1 (ignored if strategy specifies)
  userTreeTextFont: string; // Tree text font, required (ignored if strategy specifies)

  // Color Overrides (optional, can override strategy)
  userLinkContrast?: 'high' | 'low' | 'very-low' | 'absent';
  userLinkColor?: string; // Hex or rgb format
  userBackground?: string;
  userNodeFillColor?: string; // Node fill color override
  userNodeStrokeColor?: string; // Node stroke color override
  userTextFillColor?: string; // Text fill color override
  userTextStrokeColor?: string; // Text stroke color override

  // Resolved Configuration (computed at runtime based on strategy + user overrides)
  resolvedColorUniformity: 'Solid' | 'Gradient';
  resolvedColorGradientDirectionality?: 'sunset' | 'sunrise'; // Only if resolvedColorUniformity is Gradient
  resolvedNodeOpacity: number; // Final node opacity (0-1)
  resolvedTreeTextFont: string; // Final tree text font
  resolvedLinkContrast: 'high' | 'low' | 'very-low' | 'absent';
  resolvedLinkColor: string; // Final hex or rgb
  resolvedBackground: string;
  resolvedNodeFillColor: string; // Final node fill color
  resolvedNodeStrokeColor: string; // Final node stroke color
  resolvedTextFillColor: string; // Final text fill color
  resolvedTextStrokeColor: string; // Final text stroke color
}
