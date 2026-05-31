import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';
import { IBackgroundDefinition } from '../../../interfaces/visualization.interfaces';
import { getColorizationStrategy } from '../../../config/colorization-strategies.config';
import { IColorizationStrategy } from '../../../interfaces/colorization/colorization-strategy.interface';

@Component({
  selector: 'app-toolbar-colorization-options',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './toolbar-colorization-options.component.html',
  styleUrls: [
    '../../../styles/_shared-toolbar-styles.scss',
    './toolbar-colorization-options.component.scss',
  ],
})
export class ToolbarColorizationOptionsComponent
  extends BaseToolbarComponent
  implements OnInit, OnChanges
{
  // Required base component properties
  readonly toolbarId = 'colorization-options-toolbar';
  readonly toolbarTitle = 'Colorization';
  readonly toolbarIcon = '🎨';

  // Component-specific inputs (base inputs inherited: visible, isDarkMode, position, locked, expanded)
  @Input() colorTarget: 'nodes' | 'text' | 'both' = 'text'; // Color target
  @Input() colorizationCategory: string = 'by-phase-branch'; // Colorization category
  @Input() colorStrategy: string = 'branch'; // Color strategy
  @Input() colorUniformity: 'Solid' | 'Gradient' = 'Solid'; // Color uniformity mode
  @Input() colorGradientDirectionality: 'sunset' | 'sunrise' = 'sunset'; // Gradient direction
  @Input() backgroundStyle:
    | 'aqua-circle'
    | 'follow-mode'
    | 'pure-black'
    | 'digital-blue'
    | 'digital-green'
    | 'hex-navy-orange'
    | 'hex-navy-yellow'
    | 'tenant-definition' = 'aqua-circle'; // Background style
  @Input() dataset: any = null; // Current dataset (for strategy-specific options)
  @Input() selectedBranchIndex: number = 0; // Selected branch index (for branch-selection strategy)
  @Input() qualifiedColor: string = '#FF0000'; // Color for qualified nodes (branch-selection strategy)
  @Input() unqualifiedColor: string = '#CCCCCC'; // Color for unqualified nodes (branch-selection strategy)
  @Input() overrideRootNodeStyle: boolean = false; // Enable root node overrides
  @Input() rootNodeFont: string = 'Arial'; // Root node font override
  @Input() rootNodeSize: 'xsmall' | 'small' | 'medium' | 'large' = 'medium'; // Root node size override
  @Input() rootNodeStyle: 'normal' | 'bold' | 'italic' = 'normal'; // Root node style override
  @Input() rootNodeStrokeColor: string = '#000000'; // Root node stroke color override

  // Component-specific outputs
  @Output() colorTargetChange = new EventEmitter<string>();
  @Output() colorizationCategoryChange = new EventEmitter<string>();
  @Output() colorStrategyChange = new EventEmitter<string>();
  @Output() colorUniformityChange = new EventEmitter<string>();
  @Output() colorGradientDirectionalityChange = new EventEmitter<string>();
  @Output() backgroundStyleChange = new EventEmitter<string>();
  @Output() selectedBranchIndexChange = new EventEmitter<number>(); // Branch selection changed
  @Output() qualifiedColorChange = new EventEmitter<string>(); // Qualified color changed
  @Output() unqualifiedColorChange = new EventEmitter<string>(); // Unqualified color changed
  @Output() overrideRootNodeToggle = new EventEmitter<boolean>(); // Root node override toggled
  @Output() rootNodeFontChange = new EventEmitter<string>(); // Root node font changed
  @Output() rootNodeSizeChange = new EventEmitter<
    'xsmall' | 'small' | 'medium' | 'large'
  >(); // Root node size changed
  @Output() rootNodeStyleChange = new EventEmitter<
    'normal' | 'bold' | 'italic'
  >(); // Root node style changed
  @Output() rootNodeStrokeColorChange = new EventEmitter<string>(); // Root node stroke color changed
  @Output() applyColorization = new EventEmitter<void>(); // Apply colorization button clicked

  // Internal state for strategy details
  currentStrategy: IColorizationStrategy | undefined;
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

  colorizationCategoryOptions = [
    { value: 'by-phase-branch', label: 'By Phase/Branch' },
  ];

  // Category to colorization strategy mapping
  private categoryStrategyMap: Record<string, string[]> = {
    'by-phase-branch': ['branch', 'branch-selection'],
  };

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

  // Available branches for branch-selection strategy
  availableBranches: string[] = [];

  backgroundStyleOptions: Array<{
    value: string;
    label: string;
    disabled?: boolean;
    dark: IBackgroundDefinition;
    light: IBackgroundDefinition;
  }> = [
    {
      value: 'aqua-circle',
      label: 'Pure White',
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
      value: 'hex-navy-orange',
      label: 'Hex/Navy/Orange',
      dark: {
        Name: 'Hex/Navy/Orange (Dark)',
        HighContrastLinkColor: '#ffcc00',
        LowContrastLinkColor: '#ff9900',
        VeryLowContrastLinkColor: '#663300',
        AbsentLinkColor: 'transparent',
        AllowOverride: true,
      },
      light: {
        Name: 'Hex/Navy/Orange (Light)',
        HighContrastLinkColor: '#ffcc00',
        LowContrastLinkColor: '#ff9900',
        VeryLowContrastLinkColor: '#ffddaa',
        AbsentLinkColor: 'transparent',
        AllowOverride: true,
      },
    },
    {
      value: 'hex-navy-yellow',
      label: 'Hex/Navy/Yellow',
      dark: {
        Name: 'Hex/Navy/Yellow (Dark)',
        HighContrastLinkColor: '#ffff00',
        LowContrastLinkColor: '#ffdd00',
        VeryLowContrastLinkColor: '#666600',
        AbsentLinkColor: 'transparent',
        AllowOverride: true,
      },
      light: {
        Name: 'Hex/Navy/Yellow (Light)',
        HighContrastLinkColor: '#ffff00',
        LowContrastLinkColor: '#ffdd00',
        VeryLowContrastLinkColor: '#ffffaa',
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

  onColorTargetChange(target: string): void {
    this.colorTarget = target as 'nodes' | 'text' | 'both';
    this.colorTargetChange.emit(target);
  }

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
    this.currentStrategy = getColorizationStrategy(strategy);

    // If strategy defines colorTarget, sync it and emit change
    if (this.currentStrategy?.colorTarget) {
      this.colorTarget = this.currentStrategy.colorTarget;
      this.colorTargetChange.emit(this.colorTarget);
    }

    // Load branches if the strategy supports it
    if (
      this.currentStrategy &&
      this.currentStrategy.getBranches &&
      this.dataset
    ) {
      this.availableBranches = this.currentStrategy.getBranches(this.dataset);
    }

    this.colorStrategyChange.emit(strategy);
  }

  onColorUniformityChange(uniformity: string): void {
    this.colorUniformity = uniformity as 'Solid' | 'Gradient';
    this.colorUniformityChange.emit(uniformity);
  }

  onColorGradientDirectionalityChange(directionality: string): void {
    this.colorGradientDirectionality = directionality as 'sunset' | 'sunrise';
    this.colorGradientDirectionalityChange.emit(directionality);
  }

  onSelectedBranchIndexChange(branchIndex: number): void {
    this.selectedBranchIndex = branchIndex;
    this.selectedBranchIndexChange.emit(branchIndex);
  }

  onStrategyDefaultColorChange(event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    if (this.currentStrategy) {
      this.currentStrategy.defaultColor = color;
    }
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

  onOverrideRootNodeToggle(enabled: boolean): void {
    this.overrideRootNodeStyle = enabled;
    this.overrideRootNodeToggle.emit(this.overrideRootNodeStyle);
  }

  onRootNodeFontChange(font: string): void {
    this.rootNodeFont = font;
    this.rootNodeFontChange.emit(this.rootNodeFont);
  }

  onRootNodeSizeChange(size: 'xsmall' | 'small' | 'medium' | 'large'): void {
    this.rootNodeSize = size;
    this.rootNodeSizeChange.emit(this.rootNodeSize);
  }

  onRootNodeStyleChange(style: 'normal' | 'bold' | 'italic'): void {
    this.rootNodeStyle = style;
    this.rootNodeStyleChange.emit(this.rootNodeStyle);
  }

  onRootNodeStrokeColorChange(color: string): void {
    this.rootNodeStrokeColor = color;
    this.rootNodeStrokeColorChange.emit(this.rootNodeStrokeColor);
  }

  onApplyColorization(): void {
    this.applyColorization.emit();
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

  ngOnInit(): void {
    // Load the initial strategy on component initialization
    this.currentStrategy = getColorizationStrategy(this.colorStrategy);

    // Load branches if the strategy supports it
    if (
      this.currentStrategy &&
      this.currentStrategy.getBranches &&
      this.dataset
    ) {
      this.availableBranches = this.currentStrategy.getBranches(this.dataset);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If dataset changes, reload the branches
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

  getFilteredColorStrategies() {
    const strategies =
      this.categoryStrategyMap[this.colorizationCategory] || [];
    return this.colorStrategyOptions.filter((option) =>
      strategies.includes(option.value)
    );
  }
}
