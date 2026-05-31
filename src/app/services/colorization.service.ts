import { Injectable } from '@angular/core';
import { IColorizationResult } from '../interfaces/colorization/colorization-result.interface';
import { IColorizationStrategy } from '../interfaces/colorization/colorization-strategy.interface';

/**
 * Colorization Service
 * Applies colorization strategies to datasets by delegating to strategy implementations
 */
@Injectable({
  providedIn: 'root',
})
export class ColorizationService {
  constructor() {}

  /**
   * Applies a colorization strategy to a dataset
   * Routes to appropriate strategy implementation method based on nodeSelectionFilter
   *
   * @param strategy The colorization strategy to apply (includes its implementation methods)
   * @param flowId The flow/dataset ID being colorized
   * @param dataset The tree dataset to colorize
   * @param nodeSelectionArguments Optional arguments for Classified/Qualified filtering
   * @returns IColorizationResult with key and colored node data
   */
  applyColorization(
    strategy: IColorizationStrategy,
    flowId: string,
    dataset: any,
    nodeSelectionArguments?: string
  ): IColorizationResult {
    switch (strategy.nodeSelectionFilter) {
      case 'All':
        // Delegate to strategy's colorizeAll method if provided
        if (strategy.colorizeAll) {
          return strategy.colorizeAll(dataset);
        }
        return { key: [], nodeData: [] };

      case 'Classified':
        // Delegate to strategy's classify method if provided
        if (strategy.classify) {
          return strategy.classify(dataset, nodeSelectionArguments);
        }
        return { key: [], nodeData: [] };

      case 'Qualified':
        // Delegate to strategy's qualify method if provided
        if (strategy.qualify) {
          return strategy.qualify(dataset, nodeSelectionArguments);
        }
        return { key: [], nodeData: [] };

      default:
        return { key: [], nodeData: [] };
    }
  }
}
