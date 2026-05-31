import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

/**
 * Font Definition Interface
 */
export interface FontDefinition {
  id: string;
  name: string;
  family: string;
  path?: string; // Path to font file for @font-face
  category: 'standard' | 'custom';
  weight?:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';
  style?: 'normal' | 'italic';
  fallback?: string; // Fallback fonts
  displayName: string; // User-friendly name
  folder?: string; // Folder/category for grouping in UI (e.g., 'Sci-Fi', 'Sporting', 'Standard')
}

/**
 * Custom Font Manifest Interface
 */
interface FontManifest {
  customFonts: Omit<FontDefinition, 'category'>[];
}

/**
 * Font Manager Service
 * Centralized management of fonts across the application
 * Covers standard system fonts and custom fonts loaded from assets/fonts/fonts.json
 */
@Injectable({
  providedIn: 'root',
})
export class FontService {
  private fonts: Map<string, FontDefinition> = new Map();
  private fontLoaded: Map<string, boolean> = new Map();
  private customFontsLoaded = false;

  constructor(private httpClient: HttpClient) {
    this.initializeFonts();
  }

  /**
   * Initialize all available fonts (standard fonts + load custom fonts from manifest)
   */
  private initializeFonts(): void {
    // Standard System Fonts
    this.registerFont({
      id: 'arial',
      name: 'Arial',
      family: 'Arial',
      category: 'standard',
      displayName: 'Arial',
      fallback: 'sans-serif',
    });

    this.registerFont({
      id: 'helvetica',
      name: 'Helvetica',
      family: 'Helvetica',
      category: 'standard',
      displayName: 'Helvetica',
      fallback: 'sans-serif',
    });

    this.registerFont({
      id: 'times-new-roman',
      name: 'Times New Roman',
      family: 'Times New Roman',
      category: 'standard',
      displayName: 'Times New Roman',
      fallback: 'serif',
    });

    this.registerFont({
      id: 'courier-new',
      name: 'Courier New',
      family: 'Courier New',
      category: 'standard',
      displayName: 'Courier New',
      fallback: 'monospace',
    });

    this.registerFont({
      id: 'georgia',
      name: 'Georgia',
      family: 'Georgia',
      category: 'standard',
      displayName: 'Georgia',
      fallback: 'serif',
    });

    this.registerFont({
      id: 'verdana',
      name: 'Verdana',
      family: 'Verdana',
      category: 'standard',
      displayName: 'Verdana',
      fallback: 'sans-serif',
    });

    this.registerFont({
      id: 'trebuchet-ms',
      name: 'Trebuchet MS',
      family: 'Trebuchet MS',
      category: 'standard',
      displayName: 'Trebuchet MS',
      fallback: 'sans-serif',
    });

    this.registerFont({
      id: 'palatino',
      name: 'Palatino Linotype',
      family: 'Palatino Linotype',
      category: 'standard',
      displayName: 'Palatino Linotype',
      fallback: 'serif',
    });

    this.registerFont({
      id: 'garamond',
      name: 'Garamond',
      family: 'Garamond',
      category: 'standard',
      displayName: 'Garamond',
      fallback: 'serif',
    });

    this.registerFont({
      id: 'comic-sans',
      name: 'Comic Sans MS',
      family: 'Comic Sans MS',
      category: 'standard',
      displayName: 'Comic Sans MS',
      fallback: 'cursive',
    });

    // Load custom fonts from manifest
    this.loadCustomFontsFromManifest();
  }

  /**
   * Load custom fonts from fonts.json manifest
   */
  private loadCustomFontsFromManifest(): void {
    if (this.customFontsLoaded) {
      return; // Already loaded
    }

    this.httpClient.get<FontManifest>('assets/fonts/fonts.json').subscribe({
      next: (manifest) => {
        manifest.customFonts.forEach((fontData) => {
          this.registerFont({
            ...fontData,
            category: 'custom',
          });
        });
        this.customFontsLoaded = true;
      },
      error: (error) => {
        console.warn('Failed to load custom fonts manifest:', error);
        this.customFontsLoaded = true; // Mark as loaded to avoid repeated attempts
      },
    });
  }

  /**
   * Ensure custom fonts are loaded (useful for synchronous code)
   */
  async ensureCustomFontsLoaded(): Promise<void> {
    if (this.customFontsLoaded) {
      return;
    }

    try {
      const manifest = await firstValueFrom(
        this.httpClient.get<FontManifest>('assets/fonts/fonts.json')
      );
      manifest.customFonts.forEach((fontData) => {
        this.registerFont({
          ...fontData,
          category: 'custom',
        });
      });
      this.customFontsLoaded = true;
    } catch (error) {
      console.warn('Failed to load custom fonts manifest:', error);
      this.customFontsLoaded = true;
    }
  }

  /**
   * Register a new font
   */
  private registerFont(font: FontDefinition): void {
    this.fonts.set(font.id, font);
  }

  /**
   * Get all available fonts
   */
  getAllFonts(): FontDefinition[] {
    return Array.from(this.fonts.values());
  }

  /**
   * Get fonts by category
   */
  getFontsByCategory(category: 'standard' | 'custom'): FontDefinition[] {
    return Array.from(this.fonts.values()).filter(
      (font) => font.category === category
    );
  }

  /**
   * Get a specific font by ID
   */
  getFont(fontId: string): FontDefinition | undefined {
    return this.fonts.get(fontId);
  }

  /**
   * Get font by name (case-insensitive)
   */
  getFontByName(fontName: string): FontDefinition | undefined {
    return Array.from(this.fonts.values()).find(
      (font) => font.name.toLowerCase() === fontName.toLowerCase()
    );
  }

  /**
   * Get font family string (with fallback)
   */
  getFontFamily(fontId: string): string {
    const font = this.getFont(fontId);
    if (!font) {
      return 'Arial, sans-serif';
    }

    const fallback = font.fallback || 'sans-serif';
    return `"${font.family}", ${fallback}`;
  }

  /**
   * Load a custom font and inject @font-face into document
   */
  loadCustomFont(fontId: string): void {
    const font = this.getFont(fontId);

    if (!font || font.category !== 'custom' || !font.path) {
      return;
    }

    if (this.fontLoaded.get(fontId)) {
      return; // Already loaded
    }

    const fontFace = this.createFontFace(font);
    const style = document.createElement('style');
    style.innerHTML = fontFace;
    style.id = `font-${fontId}`;
    document.head.appendChild(style);

    this.fontLoaded.set(fontId, true);
  }

  /**
   * Load multiple fonts
   */
  loadCustomFonts(fontIds: string[]): void {
    fontIds.forEach((fontId) => this.loadCustomFont(fontId));
  }

  /**
   * Load all custom fonts
   */
  async loadAllCustomFonts(): Promise<void> {
    // Ensure fonts are loaded from manifest first
    await this.ensureCustomFontsLoaded();

    const customFonts = this.getFontsByCategory('custom');
    customFonts.forEach((font) => this.loadCustomFont(font.id));
  }

  /**
   * Create @font-face CSS rule
   */
  private createFontFace(font: FontDefinition): string {
    if (!font.path) {
      return '';
    }

    const weight = font.weight || 'normal';
    const style = font.style || 'normal';

    return `
      @font-face {
        font-family: "${font.family}";
        src: url("${font.path}") format("truetype");
        font-weight: ${weight};
        font-style: ${style};
      }
    `;
  }

  /**
   * Check if a font is loaded
   */
  isFontLoaded(fontId: string): boolean {
    return this.fontLoaded.get(fontId) ?? false;
  }

  /**
   * Get loaded fonts (for debugging)
   */
  getLoadedFonts(): string[] {
    return Array.from(this.fontLoaded.entries())
      .filter(([, loaded]) => loaded)
      .map(([fontId]) => fontId);
  }

  /**
   * Apply font to an element
   */
  applyFontToElement(element: HTMLElement, fontId: string): boolean {
    const font = this.getFont(fontId);

    if (!font) {
      console.warn(`Font with ID "${fontId}" not found`);
      return false;
    }

    // Load custom font if needed
    if (font.category === 'custom') {
      this.loadCustomFont(fontId);
    }

    element.style.fontFamily = this.getFontFamily(fontId);

    if (font.weight && font.weight !== 'normal') {
      element.style.fontWeight = font.weight;
    }

    if (font.style && font.style !== 'normal') {
      element.style.fontStyle = font.style;
    }

    return true;
  }

  /**
   * Get font options for dropdown/select elements
   */
  getFontOptions(
    category?: 'standard' | 'custom'
  ): Array<{ value: string; label: string }> {
    let fonts: FontDefinition[];

    if (category) {
      fonts = this.getFontsByCategory(category);
    } else {
      fonts = this.getAllFonts();
    }

    return fonts
      .sort((a, b) => a.displayName.localeCompare(b.displayName))
      .map((font) => ({
        value: font.id,
        label: font.displayName,
      }));
  }

  /**
   * Get font options grouped by folder for optgroup dropdown display
   */
  getFontOptionsGroupedByFolder(
    category?: 'standard' | 'custom'
  ): Array<{
    label: string;
    options: Array<{ value: string; label: string }>;
  }> {
    let fonts: FontDefinition[];

    if (category) {
      fonts = this.getFontsByCategory(category);
    } else {
      fonts = this.getAllFonts();
    }

    // Group fonts by folder
    const groupedMap = new Map<string, FontDefinition[]>();

    fonts.forEach((font) => {
      const folder = font.folder || 'Other';
      if (!groupedMap.has(folder)) {
        groupedMap.set(folder, []);
      }
      groupedMap.get(folder)!.push(font);
    });

    // Convert to sorted array of groups
    const groups: Array<{
      label: string;
      options: Array<{ value: string; label: string }>;
    }> = [];

    // Sort folders: Standard first, then alphabetical
    const folderOrder = Array.from(groupedMap.keys()).sort((a, b) => {
      if (a === 'Standard') return -1;
      if (b === 'Standard') return 1;
      return a.localeCompare(b);
    });

    folderOrder.forEach((folder) => {
      const folderFonts = groupedMap.get(folder)!;
      groups.push({
        label: folder,
        options: folderFonts
          .sort((a, b) => a.displayName.localeCompare(b.displayName))
          .map((font) => ({
            value: font.id,
            label: font.displayName,
          })),
      });
    });

    return groups;
  }

  /**
   * Get font family string with quotes for use in CSS
   */
  getFontFamilyCSS(fontId: string): string {
    const font = this.getFont(fontId);
    if (!font) {
      return 'Arial, sans-serif';
    }
    return `"${font.family}"`;
  }

  /**
   * Set up CSS custom property for font family
   */
  setFontAsVariable(
    fontId: string,
    variableName: string = '--selected-font'
  ): void {
    const fontFamily = this.getFontFamily(fontId);
    document.documentElement.style.setProperty(variableName, fontFamily);

    // Load custom font if needed
    const font = this.getFont(fontId);
    if (font?.category === 'custom') {
      this.loadCustomFont(fontId);
    }
  }
}
