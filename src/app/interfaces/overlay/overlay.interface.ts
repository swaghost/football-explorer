/**
 * Overlay System Models
 * Defines the structure for overlay elements, sets, and state management
 */

export type OverlayElement =
  | 'Title (dataset default)'
  | 'Title (entered)'
  | 'Keys'
  | 'Tenant Badge'
  | 'Team Badge'
  | 'Club Badge (Selected)'
  | 'Club Badge (Uploaded)'
  | 'Club Information (Selected)'
  | 'Club Information (Entered)'
  | 'Club Information (Uploaded)'
  | 'Club Stadium Information (Selected)'
  | 'Club Stadium Information (Entered)'
  | 'Club Stadium Information (Uploaded)';

export type OverlayLocation =
  | 'top left'
  | 'top center'
  | 'top right'
  | 'middle left'
  | 'dead center'
  | 'middle right'
  | 'bottom left'
  | 'bottom center'
  | 'bottom right';

export interface IOverlayItem {
  id: string;
  element: OverlayElement;
  location: OverlayLocation;
  createdAt: number;
}

export interface IOverlaySet {
  id: string;
  name: string;
  items: IOverlayItem[];
  createdAt: number;
  updatedAt: number;
}

export interface IOverlayState {
  sets: IOverlaySet[];
  selectedSetId: string | null;
}

// Constants for UI
export const OVERLAY_ELEMENTS: OverlayElement[] = [
  'Title (dataset default)',
  'Title (entered)',
  'Keys',
  'Tenant Badge',
  'Team Badge',
  'Club Badge (Selected)',
  'Club Badge (Uploaded)',
  'Club Information (Selected)',
  'Club Information (Entered)',
  'Club Information (Uploaded)',
  'Club Stadium Information (Selected)',
  'Club Stadium Information (Entered)',
  'Club Stadium Information (Uploaded)',
];

export const OVERLAY_LOCATIONS: OverlayLocation[] = [
  'top left',
  'top center',
  'top right',
  'middle left',
  'dead center',
  'middle right',
  'bottom left',
  'bottom center',
  'bottom right',
];
