import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';
import { IBackgroundDefinition } from '../../../interfaces/visualization.interfaces';

export interface VisualizationOption {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-toolbar-visualization-options',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar-visualization-options.component.html',
  styleUrls: [
    '../../../styles/_shared-toolbar-styles.scss',
    './toolbar-visualization-options.component.scss',
  ],
})
export class ToolbarVisualizationOptionsComponent extends BaseToolbarComponent {
  // Required base component properties
  readonly toolbarId = 'visualization-options-toolbar';
  readonly toolbarTitle = 'Visualization';
  readonly toolbarIcon = '🌸';
  // Component-specific inputs (base inputs inherited: visible, isDarkMode, position, locked, expanded)
  @Input() selectedVisualization = '';
  @Input() selectedFormat = 'radial'; // radial, horizontal, vertical
  @Input() selectedLayoutStyle = 'tree'; // tree (tidy), cluster
  @Input() visualizationOptions: VisualizationOption[] = [];
  @Input() nodeCount = 0;
  @Input() linkCount = 0;
  @Input() visualizationRadius = 400;
  @Input() visualizationWidth = 800;
  @Input() visualizationHeight = 600;
  @Input() visualizationRadiusMax = 1000;
  @Input() visualizationWidthMax = 2000;
  @Input() visualizationHeightMax = 2000;
  @Input() visualizationRadiusIdeal = 400;
  @Input() visualizationWidthIdeal = 800;
  @Input() visualizationHeightIdeal = 600;
  @Input() quickNavFollowEnabled = true; // Default to enabled
  @Input() nodeListFollowEnabled = true; // Default to enabled
  @Input() lessonContentQualitySurveyEnabled = true; // Default to enabled
  @Input() exploratoryContentQualitySurveyEnabled = true; // Default to enabled
  @Input() explorerAutoShowEnabled = true; // Default to enabled
  @Input() redDotCenterEnabled = false; // Red dot center toggle
  @Input() redDotCenterSize = 10; // Red dot size in pixels
  @Input() blueDotScreenCenterEnabled = false; // Blue dot screen center toggle
  @Input() blueDotScreenCenterSize = 10; // Blue dot size in pixels
  @Input() showBackgroundCircle: boolean = false; // Show aqua background circle
  @Input() nodeSize: 'xxs' | 'xsmall' | 'small' | 'medium' | 'large' = 'medium'; // Node size
  @Input() textPosition = 'below'; // Text position
  @Input() textFontFamily = 'Arial'; // Text font family
  @Input() lineType: 'line' | 'step' | 'curve' = 'curve'; // Link line type
  @Input() linkThickness: number = 1; // Link thickness (stroke width in pixels)
  @Input() linkColorOverride: string | null = null; // Link color override
  @Input() linkConnection: 'full' | 'short' = 'full'; // Link connection style
  @Input() backgroundStyle:
    | 'aqua-circle'
    | 'follow-mode'
    | 'pure-black'
    | 'digital-blue'
    | 'digital-green'
    | 'tenant-definition' = 'aqua-circle'; // Background style

  // Format options
  formatOptions = [
    { value: 'radial', label: 'Radial', icon: '🌸' },
    { value: 'horizontal', label: 'Horizontal', icon: '📊' },
    { value: 'vertical', label: 'Vertical', icon: '🌲' },
    { value: 'hex', label: 'Hex Grid', icon: '⬡' },
  ];

  // Layout style options
  layoutStyleOptions = [
    { value: 'tree', label: 'Tidy Tree', icon: '🌳' },
    { value: 'cluster', label: 'Cluster', icon: '🌻' },
  ];

  // Cached text position options to prevent infinite loops
  private textPositionOptionsRadial = [
    { value: 'radiating-leaf', label: 'Radiating (Leaf-only)' },
    { value: 'radiating-all', label: 'Radiating (All)' },
    { value: 'radiating-locked-root', label: 'Radiating (Locked Root)' },
  ];

  private textPositionOptionsHorizontal = [
    { value: 'below', label: 'Below' },
    { value: 'radiating-horizontal', label: 'Radiating Horizontal' },
  ];

  private textPositionOptionsVertical = [
    { value: 'horizontal-below', label: 'Horizontal and Below' },
    { value: 'radiating-vertical', label: 'Radiating Vertical' },
  ];

  private textPositionOptionsDefault = [{ value: 'below', label: 'Below' }];

  // Component-specific outputs
  @Output() visualizationChange = new EventEmitter<string>();
  @Output() formatChange = new EventEmitter<string>();
  @Output() layoutStyleChange = new EventEmitter<string>();
  @Output() updateNodeCount = new EventEmitter<Event>();
  @Output() regenerateNodes = new EventEmitter<void>();
  @Output() radiusChange = new EventEmitter<number>();
  @Output() radiusMaxChange = new EventEmitter<number>();
  @Output() useIdealRadius = new EventEmitter<void>();
  @Output() widthChange = new EventEmitter<number>();
  @Output() heightChange = new EventEmitter<number>();
  @Output() quickNavFollowToggle = new EventEmitter<boolean>();
  @Output() nodeListFollowToggle = new EventEmitter<boolean>();
  @Output() lessonContentQualitySurveyToggle = new EventEmitter<boolean>();
  @Output() exploratoryContentQualitySurveyToggle = new EventEmitter<boolean>();
  @Output() explorerAutoShowToggle = new EventEmitter<boolean>();
  @Output() redDotCenterToggle = new EventEmitter<boolean>();
  @Output() redDotCenterSizeChange = new EventEmitter<number>();
  @Output() blueDotScreenCenterToggle = new EventEmitter<boolean>();
  @Output() blueDotScreenCenterSizeChange = new EventEmitter<number>();
  @Output() showBackgroundCircleChange = new EventEmitter<boolean>();
  @Output() nodeSizeChange = new EventEmitter<string>();
  @Output() textPositionChange = new EventEmitter<string>();
  @Output() textFontFamilyChange = new EventEmitter<string>();
  @Output() lineTypeChange = new EventEmitter<string>();
  @Output() linkThicknessChange = new EventEmitter<number>();
  @Output() linkColorOverrideChange = new EventEmitter<string>();
  @Output() clearLinkColorOverride = new EventEmitter<void>();
  @Output() linkConnectionChange = new EventEmitter<string>();
  @Output() backgroundStyleChange = new EventEmitter<string>();

  // Font family options
  fontFamilyOptions = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Comic Sans MS', label: 'Comic Sans MS' },
    { value: 'Impact', label: 'Impact' },
    { value: 'Trebuchet MS', label: 'Trebuchet MS' },
    { value: 'Palatino', label: 'Palatino' },
  ];

  lineTypeOptions = [
    { value: 'line', label: 'Line (Straight)' },
    { value: 'step', label: 'Step Links' },
    { value: 'curve', label: 'Curve (Smooth)' },
  ];

  linkConnectionOptions = [
    { value: 'full', label: 'Full' },
    { value: 'short', label: 'Just Short' },
  ];

  backgroundStyleOptions: Array<{
    value: string;
    label: string;
    disabled?: boolean;
    dark: IBackgroundDefinition;
    light: IBackgroundDefinition;
  }> = [
    {
      value: 'aqua-circle',
      label: 'White / Aqua Circle Test',
      dark: {
        Name: 'Aqua Circle (Dark)',
        HighContrastLinkColor: '#ffffff',
        LowContrastLinkColor: '#555555',
        VeryLowContrastLinkColor: '#2a2a2a',
        AbsentLinkColor: 'transparent',
        AllowOverride: true,
      },
      light: {
        Name: 'Aqua Circle (Light)',
        HighContrastLinkColor: '#000000',
        LowContrastLinkColor: '#cccccc',
        VeryLowContrastLinkColor: '#e8e8e8',
        AbsentLinkColor: 'transparent',
        AllowOverride: true,
      },
    },
    {
      value: 'follow-mode',
      label: 'Follow Screen Mode',
      dark: {
        Name: 'Follow Mode (Dark)',
        HighContrastLinkColor: '#ffffff',
        LowContrastLinkColor: '#555555',
        VeryLowContrastLinkColor: '#2a2a2a',
        AbsentLinkColor: 'transparent',
        AllowOverride: true,
      },
      light: {
        Name: 'Follow Mode (Light)',
        HighContrastLinkColor: '#000000',
        LowContrastLinkColor: '#cccccc',
        VeryLowContrastLinkColor: '#e8e8e8',
        AbsentLinkColor: 'transparent',
        AllowOverride: true,
      },
    },
    {
      value: 'pure-black',
      label: 'Pure Black',
      dark: {
        Name: 'Pure Black (Dark)',
        HighContrastLinkColor: '#ffffff',
        LowContrastLinkColor: '#777777',
        VeryLowContrastLinkColor: '#2a2a2a',
        AbsentLinkColor: 'transparent',
        AllowOverride: true,
      },
      light: {
        Name: 'Pure Black (Light)',
        HighContrastLinkColor: '#ffffff',
        LowContrastLinkColor: '#777777',
        VeryLowContrastLinkColor: '#e8e8e8',
        AbsentLinkColor: 'transparent',
        AllowOverride: true,
      },
    },
    {
      value: 'digital-blue',
      label: 'Digital Blue',
      dark: {
        Name: 'Digital Blue (Dark)',
        HighContrastLinkColor: '#60a5fa',
        LowContrastLinkColor: '#3b82f6',
        VeryLowContrastLinkColor: '#1e3a8a',
        AbsentLinkColor: 'transparent',
        AllowOverride: true,
      },
      light: {
        Name: 'Digital Blue (Light)',
        HighContrastLinkColor: '#60a5fa',
        LowContrastLinkColor: '#3b82f6',
        VeryLowContrastLinkColor: '#dbeafe',
        AbsentLinkColor: 'transparent',
        AllowOverride: true,
      },
    },
    {
      value: 'digital-green',
      label: 'Digital Green',
      dark: {
        Name: 'Digital Green (Dark)',
        HighContrastLinkColor: '#00ff00',
        LowContrastLinkColor: '#00cc00',
        VeryLowContrastLinkColor: '#004400',
        AbsentLinkColor: 'transparent',
        AllowOverride: true,
      },
      light: {
        Name: 'Digital Green (Light)',
        HighContrastLinkColor: '#00ff00',
        LowContrastLinkColor: '#00cc00',
        VeryLowContrastLinkColor: '#ddffdd',
        AbsentLinkColor: 'transparent',
        AllowOverride: true,
      },
    },
    {
      value: 'tenant-definition',
      label: 'Tenant Definition',
      disabled: true,
      dark: {
        Name: 'Tenant Definition (Dark)',
        HighContrastLinkColor: '#f87171',
        LowContrastLinkColor: '#ef4444',
        VeryLowContrastLinkColor: '#7f1d1d',
        AbsentLinkColor: 'transparent',
        AllowOverride: false,
      },
      light: {
        Name: 'Tenant Definition (Light)',
        HighContrastLinkColor: '#dc2626',
        LowContrastLinkColor: '#b91c1c',
        VeryLowContrastLinkColor: '#fee2e2',
        AbsentLinkColor: 'transparent',
        AllowOverride: false,
      },
    },
  ];

  constructor() {
    super();
  }

  onVisualizationChange(value: string): void {
    this.visualizationChange.emit(value);
  }

  onFormatChange(format: string): void {
    this.selectedFormat = format;

    // Reset layout style to default if switching away from hex
    if (format !== 'hex' && this.selectedLayoutStyle === 'hex') {
      this.selectedLayoutStyle = 'tree'; // Default to tree layout when leaving hex
    }

    this.formatChange.emit(format);
    // Emit combined visualization change
    const visualizationType = this.getCombinedVisualizationType();
    this.visualizationChange.emit(visualizationType);
  }

  onLayoutStyleChange(style: string): void {
    this.selectedLayoutStyle = style;
    this.layoutStyleChange.emit(style);
    // Emit combined visualization change
    const visualizationType = this.getCombinedVisualizationType();
    this.visualizationChange.emit(visualizationType);
  }

  private getCombinedVisualizationType(): string {
    if (this.selectedFormat === 'hex') {
      return 'hexGrid';
    } else if (this.selectedFormat === 'radial') {
      return this.selectedLayoutStyle === 'tree'
        ? 'radialTree'
        : 'radialCluster';
    } else if (this.selectedFormat === 'horizontal') {
      return this.selectedLayoutStyle === 'tree'
        ? 'treeHorizontal'
        : 'clusterHorizontal';
    } else if (this.selectedFormat === 'vertical') {
      return this.selectedLayoutStyle === 'tree'
        ? 'treeVertical'
        : 'clusterVertical';
    }
    return 'radialTree';
  }

  onQuickNavFollowToggle(event: any): void {
    this.quickNavFollowToggle.emit(event.target.checked);
  }

  onNodeListFollowToggle(event: any): void {
    this.nodeListFollowToggle.emit(event.target.checked);
  }

  onLessonContentQualitySurveyToggle(event: any): void {
    this.lessonContentQualitySurveyToggle.emit(event.target.checked);
  }

  onExploratoryContentQualitySurveyToggle(event: any): void {
    this.exploratoryContentQualitySurveyToggle.emit(event.target.checked);
  }

  onExplorerAutoShowToggle(event: any): void {
    this.explorerAutoShowToggle.emit(event.target.checked);
  }

  onUpdateNodeCount(event: Event): void {
    this.updateNodeCount.emit(event);
  }

  onUpdateNodeCountFromInput(event: Event): void {
    this.updateNodeCount.emit(event);
  }

  onNodeCountInputBlur(event: Event): void {
    // No specific action needed, just ensure value is valid
  }

  onRegenerateNodes(): void {
    this.regenerateNodes.emit();
  }

  onRadiusChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.radiusChange.emit(value);
  }

  onRadiusMaxChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    if (value >= 100) {
      this.radiusMaxChange.emit(value);
    }
  }

  onUseIdealRadius(): void {
    this.useIdealRadius.emit();
  }

  onWidthChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.widthChange.emit(value);
  }

  onHeightChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.heightChange.emit(value);
  }

  onRedDotCenterToggle(event: any): void {
    this.redDotCenterToggle.emit(event.target.checked);
  }

  onRedDotCenterSizeChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.redDotCenterSizeChange.emit(value);
  }

  onBlueDotScreenCenterToggle(event: any): void {
    this.blueDotScreenCenterToggle.emit(event.target.checked);
  }

  onBlueDotScreenCenterSizeChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.blueDotScreenCenterSizeChange.emit(value);
  }

  onBackgroundCircleChange(event: any): void {
    this.showBackgroundCircleChange.emit(event.target.checked);
  }

  onNodeSizeChange(size: string): void {
    this.nodeSize = size as 'xsmall' | 'small' | 'medium' | 'large';
    this.nodeSizeChange.emit(size);
  }

  onTextPositionChange(position: string): void {
    this.textPosition = position;
    this.textPositionChange.emit(position);
  }

  onTextFontFamilyChange(fontFamily: string): void {
    this.textFontFamily = fontFamily;
    this.textFontFamilyChange.emit(fontFamily);
  }

  onLineTypeChange(lineType: string): void {
    this.lineType = lineType as 'line' | 'step' | 'curve';
    this.lineTypeChange.emit(lineType);
  }

  onLinkThicknessChange(thickness: number): void {
    this.linkThickness = Math.max(0.5, Math.min(5, thickness)); // Clamp to 0.5-5px
    this.linkThicknessChange.emit(this.linkThickness);
  }

  onLinkColorOverrideChange(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    this.linkColorOverride = color;
    this.linkColorOverrideChange.emit(color);
  }

  onClearLinkColorOverride(): void {
    this.linkColorOverride = null;
    this.clearLinkColorOverride.emit();
  }

  onLinkConnectionChange(connection: string): void {
    this.linkConnection = connection as 'full' | 'short';
    this.linkConnectionChange.emit(connection);
  }

  onBackgroundStyleChange(style: string): void {
    this.backgroundStyle = style as
      | 'aqua-circle'
      | 'follow-mode'
      | 'pure-black'
      | 'digital-blue'
      | 'digital-green'
      | 'tenant-definition';
    this.backgroundStyleChange.emit(style);
  }

  getTextPositionOptions(): { value: string; label: string }[] {
    if (this.selectedFormat === 'radial') {
      return this.textPositionOptionsRadial;
    } else if (this.selectedFormat === 'horizontal') {
      return this.textPositionOptionsHorizontal;
    } else if (this.selectedFormat === 'vertical') {
      return this.textPositionOptionsVertical;
    }
    return this.textPositionOptionsDefault;
  }

  getSelectedVisualizationOption(): VisualizationOption | undefined {
    return this.visualizationOptions.find(
      (option) => option.value === this.selectedVisualization,
    );
  }
}
