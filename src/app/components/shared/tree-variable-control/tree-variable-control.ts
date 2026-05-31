import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type ColorMode =
  | 'status'
  | 'depth'
  | 'category'
  | 'value'
  | 'custom'
  | 'branch-block'
  | 'branch-gradient'
  | 'red-block'
  | 'red-gradient'
  | 'orange-block'
  | 'orange-gradient'
  | 'yellow-block'
  | 'yellow-gradient'
  | 'green-block'
  | 'green-gradient'
  | 'blue-block'
  | 'blue-gradient'
  | 'indigo-block'
  | 'indigo-gradient'
  | 'violet-block'
  | 'violet-gradient'
  | 'grayscale-block'
  | 'grayscale-gradient';

export type LinkStyle = 'line' | 'curve' | 'diagonal' | 'orthogonal' | 'step';
export type LayoutType = 'tree' | 'cluster';

export interface TreeVariableControlConfig {
  title?: string;
  colorMode: ColorMode;
  nodeCount: number;
  maxNameLength: number;
  svgDarkMode: boolean;
  linkStyle: LinkStyle;
  colorTarget: 'nodes' | 'text';
  showLabels: boolean;
  radius: number;
  rotation: number;
  layoutType: LayoutType;
  svgWidth?: number;
  svgHeight?: number;
  svgRadius?: number;
  optimalRadius?: number;
  containerWidth?: number;
  containerHeight?: number;
}

@Component({
  selector: 'app-tree-variable-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tree-variable-control.html',
  styleUrl: './tree-variable-control.scss',
})
export class TreeVariableControl {
  // Inputs
  config = input.required<TreeVariableControlConfig>();

  // Outputs
  colorModeChange = output<ColorMode>();
  nodeCountChange = output<number>();
  maxNameLengthChange = output<number>();
  regenerate = output<void>();
  svgDarkModeToggle = output<void>();
  linkStyleChange = output<LinkStyle>();
  colorTargetChange = output<'nodes' | 'text'>();
  showLabelsChange = output<boolean>();
  radiusChange = output<number>();
  rotationChange = output<number>();
  layoutTypeChange = output<LayoutType>();

  onColorModeChange(mode: ColorMode): void {
    this.colorModeChange.emit(mode);
  }

  onNodeCountChange(count: number): void {
    this.nodeCountChange.emit(count);
  }

  onMaxNameLengthChange(length: number): void {
    this.maxNameLengthChange.emit(length);
  }

  onRegenerateTree(): void {
    this.regenerate.emit();
  }

  onToggleSvgDarkMode(): void {
    this.svgDarkModeToggle.emit();
  }

  onLinkStyleChange(style: LinkStyle): void {
    this.linkStyleChange.emit(style);
  }

  onColorTargetChange(target: 'nodes' | 'text'): void {
    this.colorTargetChange.emit(target);
  }

  onShowLabelsChange(show: boolean): void {
    this.showLabelsChange.emit(show);
  }

  onRadiusChange(radius: number): void {
    console.log(
      '[SHARED CONTROL] onRadiusChange called with:',
      radius,
      'type:',
      typeof radius
    );
    this.radiusChange.emit(radius);
  }

  onRotationChange(rotation: number): void {
    this.rotationChange.emit(rotation);
  }

  onLayoutTypeChange(type: LayoutType): void {
    this.layoutTypeChange.emit(type);
  }
}
