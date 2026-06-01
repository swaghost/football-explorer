import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  AfterViewInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BaseTabbedToolbar } from '../../shared/base-tabbed-toolbar/base-tabbed-toolbar.component';
import { TabConfig } from '../../../interfaces/ui/tabbed-toolbar-control/tab-config';
import { HelpOverlayComponent } from '../../shared/help-overlay/help-overlay.component';
import { FontService } from '../../../services/font.service';
import { getColorizationStrategy } from '../../../config/colorization-strategies.config';
import { IColorizationStrategy } from '../../../interfaces/colorization/colorization-strategy.interface';

@Component({
  selector: 'app-toolbar-text-styling',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, HelpOverlayComponent],
  templateUrl: './toolbar-text-styling.html',
  styleUrls: [
    '../../shared/base-toolbar/base-toolbar.component.scss',
    './toolbar-text-styling.scss',
  ],
})
export class ToolbarTextStylingComponent
  extends BaseTabbedToolbar
  implements OnInit, OnChanges, AfterViewInit
{
  // Required base component properties
  readonly toolbarId = 'style-toolbar-tabs';
  readonly toolbarTitle = 'Style';
  readonly toolbarIcon = '🎨';

  // Tab templates
  @ViewChild('colorizeTab', { static: false })
  colorizeTab!: TemplateRef<any>;
  @ViewChild('generalNodeStyleTab', { static: false })
  generalNodeStyleTab!: TemplateRef<any>;
  @ViewChild('rootNodeStyleTab', { static: false })
  rootNodeStyleTab!: TemplateRef<any>;
  @ViewChild('keyOptionsTab', { static: false })
  keyOptionsTab!: TemplateRef<any>;
  @ViewChild('titleTab', { static: false })
  titleTab!: TemplateRef<any>;

  @ViewChild('opacityTab', { static: false })
  opacityTab!: TemplateRef<any>;
  @ViewChild('visualizationTab', { static: false })
  visualizationTab!: TemplateRef<any>;

  // Color Key Inputs
  @Input() override tabs: TabConfig[] = [];
  @Input() includeColorKey: boolean = false;
  @Input() keyPosition:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right' = 'bottom-left';
  @Input() keyFont: string = 'Arial';
  @Input() keyFontSize: number = 12;
  @Input() keyColorShape:
    | 'circle'
    | 'square'
    | 'rectangle'
    | 'triangle'
    | 'diamond'
    | 'pentagon'
    | 'hexagon'
    | 'octagon' = 'circle';
  @Input() keyColorUniformity: 'solid' | 'gradient' = 'solid';
  @Input() keyColorSize: number = 20;
  @Input() keyTitle: string = 'Key';
  @Input() keyTitleFont: string = 'Arial';
  @Input() keyTitleFontSize: number = 14;
  @Input() keyTitleBold: boolean = true;
  @Input() keyTitleUnderline: boolean = false;
  @Input() keyTitleItalic: boolean = false;
  @Input() keyBorder: 'none' | 'solid' | 'shadow' = 'shadow';
  @Input() keyBorderColor: string = '#333';
  @Input() keyBackgroundColor: string = 'rgba(255, 255, 255, 0.95)';
  @Input() keyTextColor: string = '#333';
  @Input() keyTitleTextColor: string = '#333';

  // Title Inputs
  @Input() enableTitle: boolean = false;
  @Input() titlePosition:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'middle-left'
    | 'center'
    | 'middle-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right' = 'top-center';
  @Input() titleLine1: string = 'Title Line 1';
  @Input() titleLine1Font: string = 'Arial';
  @Input() titleLine1Size: number = 24;
  @Input() titleLine1Color: string = '#000000';
  @Input() titleLine1Bold: boolean = false;
  @Input() titleLine1Italic: boolean = false;
  @Input() titleLine1Uppercase: boolean = false;
  @Input() titleLine1Underline: boolean = false;
  @Input() titleLine2: string = 'Title Line 2';
  @Input() titleLine2Font: string = 'Arial';
  @Input() titleLine2Size: number = 16;
  @Input() titleLine2Color: string = '#666666';
  @Input() titleLine2Bold: boolean = false;
  @Input() titleLine2Italic: boolean = false;
  @Input() titleLine2Uppercase: boolean = false;
  @Input() titleLine2Underline: boolean = false;
  @Input() titleBorderType: 'none' | 'squared' | 'rounded' | 'shadow' =
    'shadow';
  @Input() titleBorderColor: string = '#333333';
  @Input() titleBorderThickness: number = 2;
  @Input() titleBackgroundColor: string = 'rgba(255, 255, 255, 0.95)';

  @Input() treeTextFont: string = 'Arial';
  @Input() treeTextStyle: 'normal' | 'bold' | 'underline' = 'normal';
  @Input() treeTextBold: boolean = false;
  @Input() treeTextItalic: boolean = false;
  @Input() treeTextUppercase: boolean = false;
  @Input() treeTextSize: number = 14;
  @Input() overrideRootNodeStyle: boolean = false;
  @Input() rootNodeFont: string = 'Arial';
  @Input() rootNodeFillColor: string = '#000000'; // Root node fill/circle color
  @Input() rootNodeTextColor: string = '#000000'; // Root node text color
  @Input() rootNodeSize: number = 14;
  @Input() rootNodeStyle: 'normal' | 'bold' | 'italic' = 'normal';
  @Input() rootNodeBold: boolean = false;
  @Input() rootNodeItalic: boolean = false;
  @Input() rootNodeUppercase: boolean = false;
  @Input() rootNodeStrokeColor: string = '#000000'; // Root node stroke/outline color
  @Input() colorTarget: 'nodes' | 'text' | 'both' = 'both'; // Color target selection from Colorization Toolbar
  @Input() nodeFillColor: string = '#FF0000'; // Node fill color (shown when colorTarget is 'text')
  @Input() nodeStrokeColor: string = '#000000'; // Node stroke color (shown when colorTarget is 'text')
  @Input() textFillColor: string = '#000000'; // Text fill color (shown when colorTarget is 'nodes')
  @Input() textStrokeColor: string = '#FFFFFF'; // Text stroke color (shown when colorTarget is 'nodes')
  @Input() linkColorOverride: string | null = null; // Link color override
  @Input() linkThickness: number = 1; // Link thickness (stroke width in pixels)
  @Input() nodeOpacity: number = 1; // Node opacity (0-1, affects text + circle + link)
  @Input() circleOpacity: number = 1; // Circle opacity (0-1, affects only circle)
  @Input() textOpacity: number = 1; // Text opacity (0-1)
  @Input() linkOpacity: number = 1; // Link opacity (0-1)
  @Input() backgroundStyle:
    | 'aqua-circle'
    | 'follow-mode'
    | 'pure-black'
    | 'digital-blue'
    | 'digital-green'
    | 'hex-navy-orange'
    | 'hex-navy-yellow'
    | 'tenant-definition' = 'aqua-circle'; // Background style

  // Colorization Inputs
  @Input() colorizationCategory: string = 'by-phase-branch'; // Colorization category
  @Input() colorStrategy: string = 'branch'; // Color strategy
  @Input() colorUniformity: 'Solid' | 'Gradient' = 'Solid'; // Color uniformity mode
  @Input() colorGradientDirectionality: 'sunset' | 'sunrise' = 'sunset'; // Gradient direction
  @Input() colorBrightness: number = 100; // Brightness percentage (0-100) for color
  @Input() colorGradientBrightnessEnd: number = 0; // Brightness percentage at gradient end (0-100)
  @Input() selectedBranchIndex: number = 0; // Selected branch index (for branch-selection strategy)
  @Input() qualifiedColor: string = '#FF0000'; // Color for qualified nodes (branch-selection strategy)
  @Input() unqualifiedColor: string = '#CCCCCC'; // Color for unqualified nodes (branch-selection strategy)
  @Input() dataset: any; // Tree dataset for generating branches from strategy

  // Visualization Inputs
  @Input() selectedFormat = 'radial'; // radial, horizontal, vertical, hex
  @Input() selectedLayoutStyle = 'tree'; // tree (tidy), cluster
  @Input() nodeCount = 0;
  @Input() visualizationRadius = 400;
  @Input() visualizationWidth = 800;
  @Input() visualizationHeight = 600;
  @Input() visualizationRadiusMax = 1000;
  @Input() visualizationWidthMax = 2000;
  @Input() visualizationHeightMax = 2000;
  @Input() visualizationRadiusIdeal = 400;
  @Input() visualizationWidthIdeal = 800;
  @Input() visualizationHeightIdeal = 600;
  @Input() nodeSize: 'xsmall' | 'small' | 'medium' | 'large' = 'medium';
  @Input() textPosition = 'below'; // Text position
  @Input() lineType: 'line' | 'step' | 'curve' = 'curve'; // Link line type
  @Input() linkConnection: 'full' | 'short' = 'full'; // Link connection style
  @Input() redDotCenterEnabled = false; // Red dot center toggle
  @Input() redDotCenterSize = 10; // Red dot size in pixels
  @Input() blueDotScreenCenterEnabled = false; // Blue dot screen center toggle
  @Input() blueDotScreenCenterSize = 10; // Blue dot size in pixels
  @Input() showBackgroundCircle: boolean = false; // Show background circle

  // Outputs
  @Output() includeColorKeyChange = new EventEmitter<boolean>();
  @Output() keyPositionChange = new EventEmitter<string>();
  @Output() keyFontChange = new EventEmitter<string>();
  @Output() keyFontSizeChange = new EventEmitter<number>();
  @Output() keyColorShapeChange = new EventEmitter<string>();
  @Output() keyColorUniformityChange = new EventEmitter<string>();
  @Output() keyColorSizeChange = new EventEmitter<number>();
  @Output() keyTitleChange = new EventEmitter<string>();
  @Output() keyTitleFontChange = new EventEmitter<string>();
  @Output() keyTitleFontSizeChange = new EventEmitter<number>();
  @Output() keyTitleBoldChange = new EventEmitter<boolean>();
  @Output() keyTitleUnderlineChange = new EventEmitter<boolean>();
  @Output() keyTitleItalicChange = new EventEmitter<boolean>();
  @Output() keyBorderChange = new EventEmitter<string>();
  @Output() keyBorderColorChange = new EventEmitter<string>();
  @Output() keyBackgroundColorChange = new EventEmitter<string>();
  @Output() keyTextColorChange = new EventEmitter<string>();
  @Output() keyTitleTextColorChange = new EventEmitter<string>();
  @Output() enableTitleChange = new EventEmitter<boolean>();
  @Output() titlePositionChange = new EventEmitter<string>();
  @Output() titleLine1Change = new EventEmitter<string>();
  @Output() titleLine1FontChange = new EventEmitter<string>();
  @Output() titleLine1SizeChange = new EventEmitter<number>();
  @Output() titleLine1ColorChange = new EventEmitter<string>();
  @Output() titleLine1BoldChange = new EventEmitter<boolean>();
  @Output() titleLine1ItalicChange = new EventEmitter<boolean>();
  @Output() titleLine1UppercaseChange = new EventEmitter<boolean>();
  @Output() titleLine1UnderlineChange = new EventEmitter<boolean>();
  @Output() titleLine2Change = new EventEmitter<string>();
  @Output() titleLine2FontChange = new EventEmitter<string>();
  @Output() titleLine2SizeChange = new EventEmitter<number>();
  @Output() titleLine2ColorChange = new EventEmitter<string>();
  @Output() titleLine2BoldChange = new EventEmitter<boolean>();
  @Output() titleLine2ItalicChange = new EventEmitter<boolean>();
  @Output() titleLine2UppercaseChange = new EventEmitter<boolean>();
  @Output() titleLine2UnderlineChange = new EventEmitter<boolean>();
  @Output() titleBorderTypeChange = new EventEmitter<string>();
  @Output() titleBorderColorChange = new EventEmitter<string>();
  @Output() titleBorderThicknessChange = new EventEmitter<number>();
  @Output() titleBackgroundColorChange = new EventEmitter<string>();
  @Output() treeTextFontChange = new EventEmitter<string>();
  @Output() treeTextStyleChange = new EventEmitter<string>();
  @Output() treeTextSizeChange = new EventEmitter<number>();
  @Output() overrideRootNodeStyleChange = new EventEmitter<boolean>();
  @Output() rootNodeFontChange = new EventEmitter<string>();
  @Output() rootNodeSizeChange = new EventEmitter<number>();
  @Output() rootNodeStyleChange = new EventEmitter<string>();
  @Output() rootNodeStrokeColorChange = new EventEmitter<string>();
  @Output() rootNodeFillColorChange = new EventEmitter<string>();
  @Output() rootNodeTextColorChange = new EventEmitter<string>();
  @Output() nodeFillColorChange = new EventEmitter<string>();
  @Output() nodeStrokeColorChange = new EventEmitter<string>();
  @Output() textFillColorChange = new EventEmitter<string>();
  @Output() textStrokeColorChange = new EventEmitter<string>();
  @Output() linkThicknessChange = new EventEmitter<number>();
  @Output() linkColorOverrideChange = new EventEmitter<string>();
  @Output() clearLinkColorOverride = new EventEmitter<void>();
  @Output() nodeOpacityChange = new EventEmitter<number>();
  @Output() circleOpacityChange = new EventEmitter<number>();
  @Output() textOpacityChange = new EventEmitter<number>();
  @Output() linkOpacityChange = new EventEmitter<number>();
  @Output() backgroundStyleChange = new EventEmitter<string>();

  // Colorization Outputs
  @Output() colorizationCategoryChange = new EventEmitter<string>();
  @Output() colorStrategyChange = new EventEmitter<string>();
  @Output() colorTargetChange = new EventEmitter<string>();
  @Output() colorUniformityChange = new EventEmitter<string>();
  @Output() colorGradientDirectionalityChange = new EventEmitter<string>();
  @Output() colorBrightnessChange = new EventEmitter<number>();
  @Output() colorGradientBrightnessEndChange = new EventEmitter<number>();
  @Output() selectedBranchIndexChange = new EventEmitter<number>();
  @Output() qualifiedColorChange = new EventEmitter<string>();
  @Output() unqualifiedColorChange = new EventEmitter<string>();
  @Output() applyColorization = new EventEmitter<void>();

  // Visualization Outputs
  @Output() formatChange = new EventEmitter<string>();
  @Output() layoutStyleChange = new EventEmitter<string>();
  @Output() updateNodeCount = new EventEmitter<Event>();
  @Output() regenerateNodes = new EventEmitter<void>();
  @Output() radiusChange = new EventEmitter<number>();
  @Output() widthChange = new EventEmitter<number>();
  @Output() heightChange = new EventEmitter<number>();
  @Output() nodeSizeChange = new EventEmitter<string>();
  @Output() textPositionChange = new EventEmitter<string>();
  @Output() lineTypeChange = new EventEmitter<string>();
  @Output() linkConnectionChange = new EventEmitter<string>();
  @Output() redDotCenterToggle = new EventEmitter<boolean>();
  @Output() redDotCenterSizeChange = new EventEmitter<number>();
  @Output() blueDotScreenCenterToggle = new EventEmitter<boolean>();
  @Output() blueDotScreenCenterSizeChange = new EventEmitter<number>();
  @Output() showBackgroundCircleChange = new EventEmitter<boolean>();

  // Options
  keyPositionOptions = [
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-right', label: 'Bottom Right' },
  ];

  keyFontOptions: any[] = []; // Populated from FontService in constructor
  keyFontOptionsGrouped: any[] = []; // Grouped by folder

  keyColorShapeOptions = [
    { value: 'circle', label: '⭕ Circle' },
    { value: 'square', label: '▮ Square' },
    { value: 'rectangle', label: '▭ Rectangle' },
    { value: 'triangle', label: '▲ Triangle' },
    { value: 'diamond', label: '◆ Diamond' },
    { value: 'pentagon', label: '⬠ Pentagon' },
    { value: 'hexagon', label: '⬡ Hexagon' },
    { value: 'octagon', label: '⬢ Octagon' },
  ];

  keyColorUniformityOptions = [
    { value: 'solid', label: 'Solid' },
    { value: 'gradient', label: 'Gradient' },
  ];

  keyBorderOptions = [
    { value: 'none', label: 'None' },
    { value: 'solid', label: 'Solid Line' },
    { value: 'shadow', label: 'Drop Shadow' },
  ];

  titlePositionOptions = [
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-center', label: 'Top Center' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'middle-left', label: 'Middle Left' },
    { value: 'center', label: 'Dead Center' },
    { value: 'middle-right', label: 'Middle Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-center', label: 'Bottom Center' },
    { value: 'bottom-right', label: 'Bottom Right' },
  ];

  titleBorderTypeOptions = [
    { value: 'none', label: 'None' },
    { value: 'squared', label: 'Squared Rectangle' },
    { value: 'rounded', label: 'Rounded Rectangle' },
    { value: 'shadow', label: 'Drop Shadow' },
  ];

  rootNodeSizeOptions = [
    { value: 8, label: '8pt' },
    { value: 10, label: '10pt' },
    { value: 12, label: '12pt' },
    { value: 14, label: '14pt' },
    { value: 16, label: '16pt' },
    { value: 18, label: '18pt' },
    { value: 20, label: '20pt' },
    { value: 24, label: '24pt' },
    { value: 28, label: '28pt' },
    { value: 32, label: '32pt' },
  ];

  treeTextSizeOptions = [
    { value: 8, label: '8pt' },
    { value: 10, label: '10pt' },
    { value: 12, label: '12pt' },
    { value: 14, label: '14pt' },
    { value: 16, label: '16pt' },
    { value: 18, label: '18pt' },
    { value: 20, label: '20pt' },
    { value: 24, label: '24pt' },
    { value: 28, label: '28pt' },
    { value: 32, label: '32pt' },
  ];

  linkThicknessOptions = [
    { value: 0.5, label: 'Thin (0.5px)' },
    { value: 1, label: 'Normal (1px)' },
    { value: 2, label: 'Medium (2px)' },
    { value: 3, label: 'Thick (3px)' },
  ];

  nodeOpacityOptions = [
    { value: 1, label: 'Solid (100%)' },
    { value: 0.5, label: 'Transparent (50%)' },
  ];

  circleOpacityOptions = [
    { value: 1, label: 'Solid (100%)' },
    { value: 0.5, label: 'Transparent (50%)' },
  ];

  textOpacityOptions = [
    { value: 1, label: 'Solid (100%)' },
    { value: 0.5, label: 'Transparent (50%)' },
  ];

  linkOpacityOptions = [
    { value: 1, label: 'Solid (100%)' },
    { value: 0.5, label: 'Transparent (50%)' },
  ];

  backgroundStyleOptions: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }> = [
    { value: 'aqua-circle', label: 'Pure White' },
    { value: 'follow-mode', label: 'Follow Screen Mode' },
    { value: 'pure-black', label: 'Pure Black' },
    { value: 'digital-blue', label: 'Digital Blue' },
    { value: 'digital-green', label: 'Digital Green' },
    { value: 'hex-navy-orange', label: 'Hex/Navy/Orange' },
    { value: 'hex-navy-yellow', label: 'Hex/Navy/Yellow' },
    { value: 'tenant-definition', label: 'Tenant Definition', disabled: true },
  ];

  // Visualization Options
  formatOptions = [
    { value: 'radial', label: 'Radial', icon: '🌸' },
    { value: 'horizontal', label: 'Horizontal', icon: '📊' },
    { value: 'vertical', label: 'Vertical', icon: '🌲' },
    { value: 'hex', label: 'Hex Grid', icon: '⬡' },
  ];

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

  lineTypeOptions = [
    { value: 'line', label: 'Line (Straight)' },
    { value: 'step', label: 'Step Links' },
    { value: 'curve', label: 'Curve (Smooth)' },
  ];

  linkConnectionOptions = [
    { value: 'full', label: 'Full' },
    { value: 'short', label: 'Just Short' },
  ];

  // Colorization Options
  colorizationCategoryOptions = [
    { value: 'by-phase-branch', label: 'By Phase/Branch' },
  ];

  colorStrategyOptions = [
    {
      value: 'branch',
      label: '🌳 Branch - Rainbow Coloring',
    },
    {
      value: 'branch-selection',
      label: '🎯 Branch/Selection - Single Branch Focus',
    },
  ];

  colorUniformityOptions = [
    { value: 'Solid', label: 'Solid' },
    { value: 'Gradient', label: 'Gradient' },
  ];

  colorGradientDirectionalityOptions = [
    { value: 'sunset', label: 'Sunset (Light to Dark)' },
    { value: 'sunrise', label: 'Sunrise (Dark to Light)' },
  ];

  colorTargetOptions = [
    { value: 'nodes', label: 'Nodes' },
    { value: 'text', label: 'Text' },
    { value: 'both', label: 'Both' },
  ];

  // Internal state for colorization strategy
  currentStrategy: IColorizationStrategy | undefined;
  availableBranches: string[] = [];

  // Category to colorization strategy mapping
  private categoryStrategyMap: Record<string, string[]> = {
    'by-phase-branch': ['branch', 'branch-selection'],
  };

  constructor(private fontService: FontService) {
    super();
    this.visible = true;
    this.position = { x: 20, y: 60 };
    this.expanded = true;
    // Initialize font options from FontService
    this.keyFontOptions = this.fontService.getFontOptions();
    this.keyFontOptionsGrouped =
      this.fontService.getFontOptionsGroupedByFolder();
  }

  override async ngOnInit(): Promise<void> {
    super.ngOnInit();
    // Ensure custom fonts are loaded from manifest and inject @font-face rules
    await this.fontService.ensureCustomFontsLoaded();
    // Update font options after custom fonts are loaded
    this.keyFontOptions = this.fontService.getFontOptions();
    this.keyFontOptionsGrouped =
      this.fontService.getFontOptionsGroupedByFolder();
    // Load all custom fonts to inject @font-face rules
    await this.fontService.loadAllCustomFonts();
    // Initialize currentStrategy based on initial colorStrategy
    this.loadColorStrategy(this.colorStrategy);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // When colorStrategy changes, update currentStrategy and reload branches
    if (changes['colorStrategy'] && !changes['colorStrategy'].firstChange) {
      this.loadColorStrategy(this.colorStrategy);
    }
    // When dataset changes, reload branches if strategy supports it
    if (changes['dataset'] && !changes['dataset'].firstChange) {
      if (
        this.currentStrategy &&
        this.currentStrategy.getBranches &&
        this.dataset
      ) {
        this.availableBranches = this.currentStrategy.getBranches(this.dataset);
      }
    }
  }

  ngAfterViewInit(): void {
    // Initialize tabs after template refs are available
    this.tabs = [
      {
        id: 'visualization',
        label: 'Visualization',
        icon: '🌸',
        content: this.visualizationTab,
      },
      {
        id: 'colorize',
        label: 'Colorize',
        icon: '🎨',
        content: this.colorizeTab,
      },
      {
        id: 'general-node-style',
        label: 'General',
        icon: '📋',
        content: this.generalNodeStyleTab,
      },
      {
        id: 'root-node-style',
        label: 'Root',
        icon: '🌳',
        content: this.rootNodeStyleTab,
      },
      {
        id: 'key-options',
        label: 'Key',
        icon: '🔑',
        content: this.keyOptionsTab,
      },
      {
        id: 'title',
        label: 'Title',
        icon: '📝',
        content: this.titleTab,
      },
      {
        id: 'opacity',
        label: 'Opacity',
        icon: '👁️',
        content: this.opacityTab,
      },
    ];
    this.selectedTabId = 'visualization';
  }

  /**
   * Get CSS classes for the tab strip
   */
  getTabStripClasses(): Record<string, boolean> {
    return {
      'vertical-tab-strip': true,
      'dark-mode': this.isDarkMode,
      'tab-strip-left': true,
    };
  }

  // Key Options handlers
  onIncludeColorKeyChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.includeColorKey = checked;
    this.includeColorKeyChange.emit(checked);
  }

  onKeyPositionChange(position: string): void {
    this.keyPosition = position as
      | 'top-left'
      | 'top-right'
      | 'bottom-left'
      | 'bottom-right';
    this.keyPositionChange.emit(position);
  }

  onKeyFontChange(font: string): void {
    this.keyFont = font;
    this.keyFontChange.emit(font);
  }

  onKeyFontSizeChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.keyFontSize = value;
    this.keyFontSizeChange.emit(value);
  }

  onKeyColorShapeChange(shape: string): void {
    this.keyColorShape = shape as
      | 'circle'
      | 'square'
      | 'rectangle'
      | 'triangle'
      | 'diamond'
      | 'pentagon'
      | 'hexagon'
      | 'octagon';
    this.keyColorShapeChange.emit(shape);
  }

  onKeyColorUniformityChange(uniformity: string): void {
    this.keyColorUniformity = uniformity as 'solid' | 'gradient';
    this.keyColorUniformityChange.emit(uniformity);
  }

  onKeyColorSizeChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.keyColorSize = value;
    this.keyColorSizeChange.emit(value);
  }

  onKeyTitleChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.keyTitle = value;
    this.keyTitleChange.emit(value);
  }

  onKeyTitleFontChange(font: string): void {
    this.keyTitleFont = font;
    this.keyTitleFontChange.emit(font);
  }

  onKeyTitleFontSizeChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.keyTitleFontSize = value;
    this.keyTitleFontSizeChange.emit(value);
  }

  onKeyTitleBoldChange(bold: boolean): void {
    this.keyTitleBold = bold;
    this.keyTitleBoldChange.emit(bold);
  }

  onKeyTitleUnderlineChange(underline: boolean): void {
    this.keyTitleUnderline = underline;
    this.keyTitleUnderlineChange.emit(underline);
  }

  onKeyTitleItalicChange(italic: boolean): void {
    this.keyTitleItalic = italic;
    this.keyTitleItalicChange.emit(italic);
  }

  onKeyBorderChange(border: string): void {
    this.keyBorder = border as 'none' | 'solid' | 'shadow';
    this.keyBorderChange.emit(border);
  }

  onKeyBorderColorChange(color: string): void {
    this.keyBorderColor = color;
    this.keyBorderColorChange.emit(color);
  }

  onKeyBackgroundColorChange(color: string): void {
    this.keyBackgroundColor = color;
    this.keyBackgroundColorChange.emit(color);
  }

  onKeyTextColorChange(color: string): void {
    this.keyTextColor = color;
    this.keyTextColorChange.emit(color);
  }

  onKeyTitleTextColorChange(color: string): void {
    this.keyTitleTextColor = color;
    this.keyTitleTextColorChange.emit(color);
  }

  // General node style handlers
  onTreeTextFontChange(font: string): void {
    this.treeTextFont = font;
    this.treeTextFontChange.emit(font);
  }

  onTreeTextStyleChange(style: string): void {
    // Handle checkbox-based styles
    if (style === 'bold') {
      this.treeTextBold = !this.treeTextBold;
    } else if (style === 'italic') {
      this.treeTextItalic = !this.treeTextItalic;
    } else if (style === 'uppercase') {
      this.treeTextUppercase = !this.treeTextUppercase;
    } else {
      // Handle select-based style (legacy)
      this.treeTextStyle = style as 'normal' | 'bold' | 'underline';
    }
    this.treeTextStyleChange.emit(style);
  }

  onTreeTextSizeChange(size: number): void {
    this.treeTextSize = size;
    this.treeTextSizeChange.emit(size);
  }

  // Root node style handlers
  onOverrideRootNodeStyleChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.overrideRootNodeStyle = checked;
    this.overrideRootNodeStyleChange.emit(checked);
  }

  onRootNodeFontChange(font: string): void {
    this.rootNodeFont = font;
    this.rootNodeFontChange.emit(font);
  }

  onRootNodeSizeChange(size: number): void {
    this.rootNodeSize = size;
    this.rootNodeSizeChange.emit(size);
  }

  onRootNodeStyleChange(style: string): void {
    // Handle checkbox-based styles
    if (style === 'bold') {
      this.rootNodeBold = !this.rootNodeBold;
    } else if (style === 'italic') {
      this.rootNodeItalic = !this.rootNodeItalic;
    } else if (style === 'uppercase') {
      this.rootNodeUppercase = !this.rootNodeUppercase;
    } else {
      // Handle select-based style (legacy)
      this.rootNodeStyle = style as 'normal' | 'bold' | 'italic';
    }
    this.rootNodeStyleChange.emit(style);
  }

  onRootNodeStrokeColorChange(color: string): void {
    this.rootNodeStrokeColor = color;
    this.rootNodeStrokeColorChange.emit(color);
  }

  onRootNodeFillColorChange(color: string): void {
    this.rootNodeFillColor = color;
    this.rootNodeFillColorChange.emit(color);
  }

  onRootNodeTextColorChange(color: string): void {
    this.rootNodeTextColor = color;
    this.rootNodeTextColorChange.emit(color);
  }

  // Node fill color handler (shown when colorTarget is 'text')
  onNodeFillColorChange(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    this.nodeFillColor = color;
    this.nodeFillColorChange.emit(color);
  }

  // Node stroke color handler (shown when colorTarget is 'text')
  onNodeStrokeColorChange(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    this.nodeStrokeColor = color;
    this.nodeStrokeColorChange.emit(color);
  }

  // Text fill color handler (shown when colorTarget is 'nodes')
  onTextFillColorChange(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    this.textFillColor = color;
    this.textFillColorChange.emit(color);
  }

  // Text stroke color handler (shown when colorTarget is 'nodes')
  onTextStrokeColorChange(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    this.textStrokeColor = color;
    this.textStrokeColorChange.emit(color);
  }

  // Link Options handlers
  onLinkThicknessChange(thickness: number): void {
    this.linkThickness = Math.max(0.5, Math.min(5, thickness)); // Clamp to 0.5-5px
    this.linkThicknessChange.emit(this.linkThickness);
  }

  onLinkThicknessQuickSet(thickness: number): void {
    this.onLinkThicknessChange(thickness);
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

  // Opacity handlers
  onNodeOpacityChange(opacity: number): void {
    this.nodeOpacity = Math.max(0, Math.min(1, opacity)); // Clamp to 0-1
    this.nodeOpacityChange.emit(this.nodeOpacity);
  }

  onNodeOpacityQuickSet(opacity: number): void {
    this.onNodeOpacityChange(opacity);
  }

  onCircleOpacityChange(opacity: number): void {
    this.circleOpacity = Math.max(0, Math.min(1, opacity)); // Clamp to 0-1
    this.circleOpacityChange.emit(this.circleOpacity);
  }

  onCircleOpacityQuickSet(opacity: number): void {
    this.onCircleOpacityChange(opacity);
  }

  onTextOpacityChange(opacity: number): void {
    this.textOpacity = Math.max(0, Math.min(1, opacity)); // Clamp to 0-1
    this.textOpacityChange.emit(this.textOpacity);
  }

  onTextOpacityQuickSet(opacity: number): void {
    this.onTextOpacityChange(opacity);
  }

  onLinkOpacityChange(opacity: number): void {
    this.linkOpacity = Math.max(0, Math.min(1, opacity)); // Clamp to 0-1
    this.linkOpacityChange.emit(this.linkOpacity);
  }

  onLinkOpacityQuickSet(opacity: number): void {
    this.onLinkOpacityChange(opacity);
  }

  onBackgroundStyleChange(style: string): void {
    this.backgroundStyle = style as any;
    this.backgroundStyleChange.emit(style);
  }

  // ============================================================================
  // COLORIZATION HANDLERS
  // ============================================================================

  onColorizationCategoryChange(category: string): void {
    this.colorizationCategory = category;
    this.colorizationCategoryChange.emit(category);
    // Reset color strategy to first option in new category
    const strategies = this.categoryStrategyMap[category] || [];
    if (strategies.length > 0 && !strategies.includes(this.colorStrategy)) {
      this.colorStrategy = strategies[0];
      this.colorStrategyChange.emit(this.colorStrategy);
    }
  }

  onColorStrategyChange(strategy: string): void {
    this.colorStrategy = strategy;
    // Load the strategy definition and update internal state
    this.loadColorStrategy(strategy);
    this.colorStrategyChange.emit(strategy);
  }

  private loadColorStrategy(strategy: string): void {
    this.currentStrategy = getColorizationStrategy(strategy);
    // If strategy defines colorTarget, sync it and emit change
    if (this.currentStrategy?.colorTarget) {
      this.colorTarget = this.currentStrategy.colorTarget;
      this.colorTargetChange.emit(this.colorTarget);
    }
    // Load branches if the strategy supports it and dataset is available
    if (
      this.currentStrategy &&
      this.currentStrategy.getBranches &&
      this.dataset
    ) {
      this.availableBranches = this.currentStrategy.getBranches(this.dataset);
    }
  }

  onColorTargetChange(target: string): void {
    this.colorTarget = target as 'nodes' | 'text' | 'both';
    this.colorTargetChange.emit(target);
  }

  onColorUniformityChange(uniformity: string): void {
    this.colorUniformity = uniformity as 'Solid' | 'Gradient';
    this.colorUniformityChange.emit(uniformity);
  }

  onColorGradientDirectionalityChange(directionality: string): void {
    this.colorGradientDirectionality = directionality as 'sunset' | 'sunrise';
    this.colorGradientDirectionalityChange.emit(directionality);
  }

  onColorBrightnessChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.colorBrightness = Math.max(0, Math.min(100, value)); // Clamp to 0-100
    this.colorBrightnessChange.emit(this.colorBrightness);
  }

  onColorGradientBrightnessEndChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.colorGradientBrightnessEnd = Math.max(0, Math.min(100, value)); // Clamp to 0-100
    this.colorGradientBrightnessEndChange.emit(this.colorGradientBrightnessEnd);
  }

  onSelectedBranchIndexChange(branchIndex: number): void {
    this.selectedBranchIndex = branchIndex;
    this.selectedBranchIndexChange.emit(branchIndex);
  }

  onQualifiedColorChange(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    this.qualifiedColor = color;
    this.qualifiedColorChange.emit(color);
  }

  onUnqualifiedColorChange(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    this.unqualifiedColor = color;
    this.unqualifiedColorChange.emit(color);
  }

  onStrategyDefaultColorChange(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    if (this.currentStrategy) {
      this.currentStrategy.defaultColor = color;
    }
  }

  isColorTargetLocked(): boolean {
    return this.currentStrategy?.colorTarget !== undefined;
  }

  getColorTargetDisplay(): string {
    if (this.currentStrategy?.colorTarget) {
      return this.currentStrategy.colorTarget;
    }
    return '';
  }

  getColorUniformityDisplay(): string {
    if (this.currentStrategy?.colorUniformity) {
      return this.currentStrategy.colorUniformity;
    }
    return '';
  }

  getColorGradientDirectionalityDisplay(): string {
    if (this.currentStrategy?.colorGradientDirectionality) {
      return this.currentStrategy.colorGradientDirectionality;
    }
    return '';
  }

  isColorUniformityLocked(): boolean {
    return !!this.currentStrategy?.colorUniformity;
  }

  isColorGradientDirectionalityLocked(): boolean {
    return !!this.currentStrategy?.colorGradientDirectionality;
  }

  getFilteredColorStrategies() {
    const strategies =
      this.categoryStrategyMap[this.colorizationCategory] || [];
    return this.colorStrategyOptions.filter((option) =>
      strategies.includes(option.value),
    );
  }

  // Visualization Event Handlers
  onFormatChange(format: string): void {
    this.selectedFormat = format;

    // Reset layout style to default if switching away from hex
    if (format !== 'hex' && this.selectedLayoutStyle === 'hex') {
      this.selectedLayoutStyle = 'tree';
    }

    this.formatChange.emit(format);
  }

  onLayoutStyleChange(style: string): void {
    this.selectedLayoutStyle = style;
    this.layoutStyleChange.emit(style);
  }

  onUpdateNodeCount(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.nodeCount = value;
    this.updateNodeCount.emit(event);
  }

  onUpdateNodeCountFromInput(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.nodeCount = value;
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
    this.visualizationRadius = value;
    this.radiusChange.emit(value);
  }

  onWidthChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.visualizationWidth = value;
    this.widthChange.emit(value);
  }

  onHeightChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.visualizationHeight = value;
    this.heightChange.emit(value);
  }

  onNodeSizeChange(size: string): void {
    this.nodeSize = size as 'xsmall' | 'small' | 'medium' | 'large';
    this.nodeSizeChange.emit(size);
  }

  onTextPositionChange(position: string): void {
    this.textPosition = position;
    this.textPositionChange.emit(position);
  }

  onLineTypeChange(lineType: string): void {
    this.lineType = lineType as 'line' | 'step' | 'curve';
    this.lineTypeChange.emit(lineType);
  }

  onLinkConnectionChange(connection: string): void {
    this.linkConnection = connection as 'full' | 'short';
    this.linkConnectionChange.emit(connection);
  }

  onRedDotCenterToggle(event: any): void {
    this.redDotCenterEnabled = event.target.checked;
    this.redDotCenterToggle.emit(event.target.checked);
  }

  onRedDotCenterSizeChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.redDotCenterSize = value;
    this.redDotCenterSizeChange.emit(value);
  }

  onBlueDotScreenCenterToggle(event: any): void {
    this.blueDotScreenCenterEnabled = event.target.checked;
    this.blueDotScreenCenterToggle.emit(event.target.checked);
  }

  onBlueDotScreenCenterSizeChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.blueDotScreenCenterSize = value;
    this.blueDotScreenCenterSizeChange.emit(value);
  }

  onBackgroundCircleChange(event: any): void {
    this.showBackgroundCircle = event.target.checked;
    this.showBackgroundCircleChange.emit(event.target.checked);
  }

  // Title handlers
  onEnableTitleChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.enableTitle = checked;
    this.enableTitleChange.emit(checked);
  }

  onTitlePositionChange(position: string): void {
    this.titlePosition = position as any;
    this.titlePositionChange.emit(position);
  }

  onTitleLine1Change(text: string): void {
    this.titleLine1 = text;
    this.titleLine1Change.emit(text);
  }

  onTitleLine1FontChange(font: string): void {
    this.titleLine1Font = font;
    this.titleLine1FontChange.emit(font);
  }

  onTitleLine1SizeChange(size: number): void {
    this.titleLine1Size = size;
    this.titleLine1SizeChange.emit(size);
  }

  onTitleLine1ColorChange(color: string): void {
    this.titleLine1Color = color;
    this.titleLine1ColorChange.emit(color);
  }

  onTitleLine1BoldChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.titleLine1Bold = checked;
    this.titleLine1BoldChange.emit(checked);
  }

  onTitleLine1ItalicChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.titleLine1Italic = checked;
    this.titleLine1ItalicChange.emit(checked);
  }

  onTitleLine1UppercaseChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.titleLine1Uppercase = checked;
    this.titleLine1UppercaseChange.emit(checked);
  }

  onTitleLine1UnderlineChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.titleLine1Underline = checked;
    this.titleLine1UnderlineChange.emit(checked);
  }

  onTitleLine2Change(text: string): void {
    this.titleLine2 = text;
    this.titleLine2Change.emit(text);
  }

  onTitleLine2FontChange(font: string): void {
    this.titleLine2Font = font;
    this.titleLine2FontChange.emit(font);
  }

  onTitleLine2SizeChange(size: number): void {
    this.titleLine2Size = size;
    this.titleLine2SizeChange.emit(size);
  }

  onTitleLine2ColorChange(color: string): void {
    this.titleLine2Color = color;
    this.titleLine2ColorChange.emit(color);
  }

  onTitleLine2BoldChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.titleLine2Bold = checked;
    this.titleLine2BoldChange.emit(checked);
  }

  onTitleLine2ItalicChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.titleLine2Italic = checked;
    this.titleLine2ItalicChange.emit(checked);
  }

  onTitleLine2UppercaseChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.titleLine2Uppercase = checked;
    this.titleLine2UppercaseChange.emit(checked);
  }

  onTitleLine2UnderlineChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.titleLine2Underline = checked;
    this.titleLine2UnderlineChange.emit(checked);
  }

  onTitleBorderTypeChange(borderType: string): void {
    this.titleBorderType = borderType as any;
    this.titleBorderTypeChange.emit(borderType);
  }

  onTitleBorderColorChange(color: string): void {
    this.titleBorderColor = color;
    this.titleBorderColorChange.emit(color);
  }

  onTitleBorderThicknessChange(thickness: number): void {
    this.titleBorderThickness = thickness;
    this.titleBorderThicknessChange.emit(thickness);
  }

  onTitleBackgroundColorChange(color: string): void {
    this.titleBackgroundColor = color;
    this.titleBackgroundColorChange.emit(color);
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
}
