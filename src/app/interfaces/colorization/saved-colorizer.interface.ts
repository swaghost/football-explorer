import { IColorizer } from './colorizer.interface';
import { OwnershipContext } from '../ownership-context.interface';

/**
 * Represents a saved Colorizer configuration stored in the library
 * Extends IColorizer with metadata for persistence and management
 */
export interface ISavedColorizer extends IColorizer {
  // Identity & Metadata
  colorizerId: string; // Unique identifier (UUID)
  colorizerName: string; // User-friendly name (OS-compatible)
  description?: string; // Optional description

  // Ownership & Tracking
  ownershipContext: OwnershipContext; // Who owns this colorizer
  createdAt: number; // Timestamp (milliseconds)
  updatedAt: number; // Timestamp (milliseconds)
  version?: number; // Optional version tracking

  // Searchability
  tags?: string[]; // Optional tags for filtering/searching
}
