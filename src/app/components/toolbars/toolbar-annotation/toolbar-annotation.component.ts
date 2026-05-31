import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';
import { SketchState } from '../../../state/sketch.state';
import * as SketchActions from '../../../state/sketch.actions';

@Component({
  selector: 'app-toolbar-annotation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar-annotation.component.html',
  styleUrls: [
    '../../../styles/_shared-toolbar-styles.scss',
    './toolbar-annotation.component.scss',
  ],
})
export class ToolbarAnnotationComponent
  extends BaseToolbarComponent
  implements OnChanges
{
  // Required base component properties
  readonly toolbarId = 'annotation-toolbar';
  readonly toolbarTitle = 'Annotation';
  readonly toolbarIcon = '✏️';
  readonly toolbarHelp =
    'Drawing and annotation tools. Use Pencil to draw freehand strokes, Eraser (magic or normal mode) to remove drawings, Rectangle and Circle to draw shapes with customizable stroke/fill, Arrow to add directional indicators, and Text to add labels with font options. Screenshot feature captures and downloads the canvas as PNG or JPG. Each tool has modifiers for colors, sizes, and styles.';

  // Component-specific inputs (base inputs inherited: visible, isDarkMode, position, locked, expanded)
  @Input() drawingMode = 'pan';
  @Input() selectedColor = '#000000';
  @Input() brushSize = 2;
  @Input() eraserMode = 'magic';
  @Input() eraserSize = 10;

  // Shape drawing inputs
  @Input() shapeStrokeWidth = 2;
  @Input() shapeStrokeColor = '#000000';
  @Input() shapeFillColor = '#ffff00';
  @Input() shapeFillMode: 'outline' | 'filled' | 'filled-outline' =
    'filled-outline';
  @Input() rectangleConstrained = false;
  @Input() circleConstrained = false;

  // Arrow inputs
  @Input() arrowSize = 40;
  @Input() arrowStrokeColor = '#000000';
  @Input() arrowFillColor = '#000000';

  // Text inputs
  @Input() textFontSize = 16;
  @Input() textColor = '#000000';
  @Input() textBold = false;
  @Input() textItalic = false;
  @Input() textStrikethrough = false;
  @Input() textFontFamily = 'Arial';

  // Available font families
  availableFonts = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Courier New',
    'Verdana',
    'Comic Sans MS',
    'Impact',
    'Trebuchet MS',
    'Eurostile',
    'Eurostile Demi',
    'Eurostile Oblique',
  ];

  // Component-specific outputs
  @Output() setDrawingMode = new EventEmitter<any>();
  @Output() selectColor = new EventEmitter<string>();
  @Output() updateBrushSize = new EventEmitter<Event>();
  @Output() setEraserMode = new EventEmitter<any>();
  @Output() updateEraserSize = new EventEmitter<Event>();

  // Shape drawing outputs
  @Output() updateShapeStrokeWidth = new EventEmitter<Event>();
  @Output() updateShapeStrokeColor = new EventEmitter<string>();
  @Output() updateShapeFillColor = new EventEmitter<string>();
  @Output() updateShapeFillMode = new EventEmitter<
    'outline' | 'filled' | 'filled-outline'
  >();
  @Output() toggleRectangleConstrained = new EventEmitter<void>();
  @Output() toggleCircleConstrained = new EventEmitter<void>();

  // Arrow outputs
  @Output() updateArrowSize = new EventEmitter<Event>();
  @Output() updateArrowStrokeColor = new EventEmitter<string>();
  @Output() updateArrowFillColor = new EventEmitter<string>();

  // Text outputs
  @Output() updateTextFontSize = new EventEmitter<Event>();
  @Output() updateTextColor = new EventEmitter<string>();
  @Output() toggleTextBold = new EventEmitter<void>();
  @Output() toggleTextItalic = new EventEmitter<void>();
  @Output() toggleTextStrikethrough = new EventEmitter<void>();
  @Output() updateTextFontFamily = new EventEmitter<string>();

  snagitMode: boolean = false;

  // Capture message state
  captureMessage: string = '';
  showCaptureMessage: boolean = false;
  private captureMessageTimeout: any = null;

  // Undo/Redo state
  public canUndo$: Observable<boolean>;
  public canRedo$: Observable<boolean>;

  constructor(private store: Store) {
    super();
    this.canUndo$ = this.store.select(SketchState.canUndo);
    this.canRedo$ = this.store.select(SketchState.canRedo);
  }

  // Internal RGB caches for numeric inputs
  selectedRgb = { r: 0, g: 0, b: 0 };
  shapeStrokeRgb = { r: 0, g: 0, b: 0 };
  shapeFillRgb = { r: 255, g: 255, b: 0 };
  arrowStrokeRgb = { r: 0, g: 0, b: 0 };
  arrowFillRgb = { r: 0, g: 0, b: 0 };
  textRgb = { r: 0, g: 0, b: 0 };

  ngOnChanges(changes: SimpleChanges): void {
    // Keep internal RGB caches in sync when Inputs change externally
    if (changes['selectedColor'] && this.selectedColor) {
      const rgb = this.hexToRgb(this.selectedColor);
      if (rgb) this.selectedRgb = rgb;
    }
    if (changes['shapeStrokeColor'] && this.shapeStrokeColor) {
      const rgb = this.hexToRgb(this.shapeStrokeColor);
      if (rgb) this.shapeStrokeRgb = rgb;
    }
    if (changes['shapeFillColor'] && this.shapeFillColor) {
      const rgb = this.hexToRgb(this.shapeFillColor);
      if (rgb) this.shapeFillRgb = rgb;
    }
    if (changes['arrowStrokeColor'] && this.arrowStrokeColor) {
      const rgb = this.hexToRgb(this.arrowStrokeColor);
      if (rgb) this.arrowStrokeRgb = rgb;
    }
    if (changes['arrowFillColor'] && this.arrowFillColor) {
      const rgb = this.hexToRgb(this.arrowFillColor);
      if (rgb) this.arrowFillRgb = rgb;
    }
    if (changes['textColor'] && this.textColor) {
      const rgb = this.hexToRgb(this.textColor);
      if (rgb) this.textRgb = rgb;
    }
  }

  // Helpers to convert between hex and rgb
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    if (!hex) return null;
    const h = hex.replace('#', '').trim();
    if (h.length === 3) {
      const r = parseInt(h[0] + h[0], 16);
      const g = parseInt(h[1] + h[1], 16);
      const b = parseInt(h[2] + h[2], 16);
      return { r, g, b };
    }
    if (h.length === 6) {
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);
      return { r, g, b };
    }
    return null;
  }

  private rgbToHex(r: number, g: number, b: number): string {
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // Handlers for numeric RGB inputs - they synthesize a hex and emit the existing events
  onSelectedRgbChange(channel: 'r' | 'g' | 'b', value: number): void {
    this.selectedRgb[channel] = Math.max(
      0,
      Math.min(255, Math.round(Number(value) || 0))
    );
    const hex = this.rgbToHex(
      this.selectedRgb.r,
      this.selectedRgb.g,
      this.selectedRgb.b
    );
    this.selectedColor = hex;
    this.onSelectColor(hex);
  }

  onShapeStrokeRgbChange(channel: 'r' | 'g' | 'b', value: number): void {
    this.shapeStrokeRgb[channel] = Math.max(
      0,
      Math.min(255, Math.round(Number(value) || 0))
    );
    const hex = this.rgbToHex(
      this.shapeStrokeRgb.r,
      this.shapeStrokeRgb.g,
      this.shapeStrokeRgb.b
    );
    this.shapeStrokeColor = hex;
    this.onUpdateShapeStrokeColor(hex);
  }

  onShapeFillRgbChange(channel: 'r' | 'g' | 'b', value: number): void {
    this.shapeFillRgb[channel] = Math.max(
      0,
      Math.min(255, Math.round(Number(value) || 0))
    );
    const hex = this.rgbToHex(
      this.shapeFillRgb.r,
      this.shapeFillRgb.g,
      this.shapeFillRgb.b
    );
    this.shapeFillColor = hex;
    this.onUpdateShapeFillColor(hex);
  }

  onArrowStrokeRgbChange(channel: 'r' | 'g' | 'b', value: number): void {
    this.arrowStrokeRgb[channel] = Math.max(
      0,
      Math.min(255, Math.round(Number(value) || 0))
    );
    const hex = this.rgbToHex(
      this.arrowStrokeRgb.r,
      this.arrowStrokeRgb.g,
      this.arrowStrokeRgb.b
    );
    this.arrowStrokeColor = hex;
    this.onUpdateArrowStrokeColor(hex);
  }

  onArrowFillRgbChange(channel: 'r' | 'g' | 'b', value: number): void {
    this.arrowFillRgb[channel] = Math.max(
      0,
      Math.min(255, Math.round(Number(value) || 0))
    );
    const hex = this.rgbToHex(
      this.arrowFillRgb.r,
      this.arrowFillRgb.g,
      this.arrowFillRgb.b
    );
    this.arrowFillColor = hex;
    this.onUpdateArrowFillColor(hex);
  }

  onTextRgbChange(channel: 'r' | 'g' | 'b', value: number): void {
    this.textRgb[channel] = Math.max(
      0,
      Math.min(255, Math.round(Number(value) || 0))
    );
    const hex = this.rgbToHex(this.textRgb.r, this.textRgb.g, this.textRgb.b);
    this.textColor = hex;
    this.onUpdateTextColor(hex);
  }

  onSetDrawingMode(mode: string): void {
    // Toggle: if clicking the currently active mode, switch to pan
    if (this.drawingMode === mode) {
      this.setDrawingMode.emit('pan');
    } else {
      this.setDrawingMode.emit(mode);
    }
  }

  onSelectColor(color: string): void {
    this.selectColor.emit(color);
  }

  onUpdateBrushSize(event: Event): void {
    this.updateBrushSize.emit(event);
  }

  onSetEraserMode(mode: string): void {
    this.setEraserMode.emit(mode);
  }

  onUpdateEraserSize(event: Event): void {
    this.updateEraserSize.emit(event);
  }

  // Shape drawing handlers
  onUpdateShapeStrokeWidth(event: Event): void {
    this.updateShapeStrokeWidth.emit(event);
  }

  onUpdateShapeStrokeColor(color: string): void {
    this.updateShapeStrokeColor.emit(color);
  }

  onUpdateShapeFillColor(color: string): void {
    this.updateShapeFillColor.emit(color);
  }

  onUpdateShapeFillMode(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.updateShapeFillMode.emit(
      target.value as 'outline' | 'filled' | 'filled-outline'
    );
  }

  onToggleRectangleConstrained(): void {
    this.toggleRectangleConstrained.emit();
  }

  onToggleCircleConstrained(): void {
    this.toggleCircleConstrained.emit();
  }

  // Arrow handlers
  onUpdateArrowSize(event: Event): void {
    this.updateArrowSize.emit(event);
  }

  onUpdateArrowStrokeColor(color: string): void {
    this.updateArrowStrokeColor.emit(color);
  }

  onUpdateArrowFillColor(color: string): void {
    this.updateArrowFillColor.emit(color);
  }

  // Text handlers
  onUpdateTextFontSize(event: Event): void {
    this.updateTextFontSize.emit(event);
  }

  onUpdateTextColor(color: string): void {
    this.updateTextColor.emit(color);
  }

  onToggleTextBold(): void {
    this.toggleTextBold.emit();
  }

  onToggleTextItalic(): void {
    this.toggleTextItalic.emit();
  }

  onToggleTextStrikethrough(): void {
    this.toggleTextStrikethrough.emit();
  }

  onUpdateTextFontFamily(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.updateTextFontFamily.emit(target.value);
  }

  // Undo/Redo methods
  onUndo(): void {
    this.store.dispatch(new SketchActions.Undo());
  }

  onRedo(): void {
    this.store.dispatch(new SketchActions.Redo());
  }

  // Method to show capture notification message
  public showCaptureNotification(type: 'Screenshot' | 'Snag-it'): void {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    this.captureMessage = `${type} captured at ${timeString}`;
    this.showCaptureMessage = true;

    // Clear any existing timeout
    if (this.captureMessageTimeout) {
      clearTimeout(this.captureMessageTimeout);
    }

    // Set timeout to fade out after 10 seconds
    this.captureMessageTimeout = setTimeout(() => {
      this.showCaptureMessage = false;
    }, 10000);
  }
}
