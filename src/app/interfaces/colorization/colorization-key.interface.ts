/**
 * Represents a single key/value in the colorization result
 * Used to display the legend/key of what each color represents
 */
export interface IColorizationKey {
  value: string; // Unique identifier for this key (e.g., 'completed', 'in-progress')
  name: string; // Display name for this key (e.g., 'Completed Tasks')
  color?: string; // Assigned color (hex format #RRGGBB or rgb string)
}
