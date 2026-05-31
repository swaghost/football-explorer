import { Injectable } from '@angular/core';
import { ISavedColorizer } from '../interfaces/colorization/saved-colorizer.interface';
import { getColorizerExportFilename } from '../utils/colorizer-export.utils';

/**
 * Service for exporting and importing colorizers to/from JSON files
 */
@Injectable({
  providedIn: 'root',
})
export class ColorizerExportImportService {
  /**
   * Export a colorizer to JSON format
   * Returns JSON string ready for file download
   */
  exportColorizerToJson(colorizer: ISavedColorizer): string {
    return JSON.stringify(colorizer, null, 2);
  }

  /**
   * Export a colorizer and trigger browser download
   */
  exportColorizerAsFile(colorizer: ISavedColorizer): void {
    const json = this.exportColorizerToJson(colorizer);
    const filename = getColorizerExportFilename(colorizer.colorizerName);

    this.downloadJsonFile(json, filename);
  }

  /**
   * Import colorizer from JSON string
   * Validates structure before returning
   */
  importColorizerFromJson(jsonString: string): ISavedColorizer | null {
    try {
      const parsed = JSON.parse(jsonString);

      // Validate essential properties exist
      if (!this.isValidColorizerStructure(parsed)) {
        console.error('Invalid colorizer structure');
        return null;
      }

      return parsed as ISavedColorizer;
    } catch (error) {
      console.error('Failed to parse colorizer JSON:', error);
      return null;
    }
  }

  /**
   * Import colorizer from file input element
   * Handles file reading and parsing
   */
  importColorizerFromFile(file: File): Promise<ISavedColorizer | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const colorizer = this.importColorizerFromJson(content);
          resolve(colorizer);
        } catch (error) {
          console.error('Failed to read file:', error);
          resolve(null);
        }
      };

      reader.onerror = () => {
        console.error('Failed to read file');
        resolve(null);
      };

      reader.readAsText(file);
    });
  }

  /**
   * Export multiple colorizers as a zip-like JSON array
   * (requires additional zip library for true .zip support)
   */
  exportMultipleColorizers(colorizers: ISavedColorizer[]): string {
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      count: colorizers.length,
      colorizers: colorizers,
    };

    return JSON.stringify(exportData, null, 2);
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Validate colorizer structure
   */
  private isValidColorizerStructure(obj: any): boolean {
    // Required fields
    if (
      !obj.colorizerId ||
      !obj.colorizerName ||
      !obj.strategy ||
      !obj.colorTarget ||
      !obj.ownershipContext
    ) {
      return false;
    }

    // Validate strategy has required fields
    if (!obj.strategy.category || !obj.strategy.strategyName) {
      return false;
    }

    // Validate colorTarget
    if (!['nodes', 'text', 'both'].includes(obj.colorTarget)) {
      return false;
    }

    return true;
  }

  /**
   * Download JSON as file
   */
  private downloadJsonFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.click();

    // Cleanup
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }
}
