/**
 * Colorization Strategies Configuration
 *
 * Central registry of all available colorization strategies.
 * Each strategy is defined in its own file with its implementation.
 */

import { IColorizationStrategy } from '../interfaces/colorization/colorization-strategy.interface';
import { BRANCH_STRATEGY } from '../strategies/branch.strategy';
import { BRANCH_SELECTION_STRATEGY } from '../strategies/branch-selection.strategy';

/**
 * Map of all available strategies
 * Key: strategy identifier used in UI
 * Value: IColorizationStrategy definition with implementation
 */
export const COLORIZATION_STRATEGIES: Record<string, IColorizationStrategy> = {
  branch: BRANCH_STRATEGY,
  'branch-selection': BRANCH_SELECTION_STRATEGY,
};

/**
 * Get a strategy by its identifier
 * @param strategyId The unique identifier for the strategy
 * @returns The IColorizationStrategy definition, or undefined if not found
 */
export function getColorizationStrategy(
  strategyId: string
): IColorizationStrategy | undefined {
  return COLORIZATION_STRATEGIES[strategyId];
}
