import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import {
  AutoFadeOptionsDialogComponent,
  AutoFadeOptions,
} from '../../dialogs/auto-fade-options-dialog/auto-fade-options-dialog.component';
import { BaseToolbarComponent } from '../../shared/base-toolbar/base-toolbar.component';
import { SketchState } from '../../../state/sketch.state';
import * as SketchActions from '../../../state/sketch.actions';

@Component({
  selector: 'app-toolbar-view-effects',
  standalone: true,
  imports: [CommonModule, FormsModule, AutoFadeOptionsDialogComponent],
  templateUrl: './toolbar-view-effects.component.html',
  styleUrls: [
    '../../../styles/_shared-toolbar-styles.scss',
    './toolbar-view-effects.component.scss',
  ],
})
export class ToolbarViewEffectsComponent
  extends BaseToolbarComponent
  implements OnInit
{
  // Required base component properties
  readonly toolbarId = 'view-effects-toolbar';
  readonly toolbarTitle = 'View / Effects';
  readonly toolbarIcon = '⚙️';

  // Component-specific inputs (base inputs inherited: visible, isDarkMode, position, locked, expanded)
  @Input() nodeCount = 100;
  @Input() snapToolbarsOnResize = true;
  @Input() treeVisible = true;
  @Input() logoFadeVisible = true;
  @Input() blackBackgroundVisible = false;
  @Input() autoFadeActive = false;
  @Input() autoFadeOutActive = false;
  @Input() autoFadeDiagramActive = false;
  @Input() autoFadeOptionsActive = false;
  @Input() scrollToNodeEnabled = false;
  @Input() quickNavFollowEnabled = false;
  @Input() nodeListFollowEnabled = false;
  @Input() lessonContentQualitySurveyEnabled = false;
  @Input() exploratoryContentQualitySurveyEnabled = false;
  @Input() explorerAutoShowEnabled = false;

  // Help overlay state
  showHelpOverlay = false;
  // Dialog state
  public showAutoFadeOptionsDialog = false;
  public autoFadeOptions: AutoFadeOptions = {
    showLogo: true,
    logoZoomEffect: true,
    backgroundColor: '#000000',
    foregroundColor: '#ffffff',
    displayStageSeconds: 4,
    waitDelaySeconds: 2,
    textMessage: '',
    textZoomEffect: true,
    fontFamily: 'Arial, sans-serif',
    closeToolbarAfterStart: false,
  };

  // Component-specific outputs
  @Output() updateNodeCount = new EventEmitter<Event>();
  @Output() toggleSnapToolbarsOnResize = new EventEmitter<void>();
  @Output() toggleTreeVisibility = new EventEmitter<void>();
  @Output() toggleLogoFade = new EventEmitter<void>();
  @Output() toggleBlackBackground = new EventEmitter<void>();
  @Output() toggleAutoFade = new EventEmitter<void>();
  @Output() toggleAutoFadeOut = new EventEmitter<void>();
  @Output() toggleAutoFadeDiagram = new EventEmitter<void>();
  @Output() toggleAutoFadeOptions = new EventEmitter<void>();
  @Output() startCustomAutoFade = new EventEmitter<AutoFadeOptions>();
  @Output() regenerateNodes = new EventEmitter<void>();
  @Output() toggleScrollToNode = new EventEmitter<void>();
  @Output() quickNavFollowToggle = new EventEmitter<Event>();
  @Output() nodeListFollowToggle = new EventEmitter<Event>();
  @Output() lessonContentQualitySurveyToggle = new EventEmitter<Event>();
  @Output() exploratoryContentQualitySurveyToggle = new EventEmitter<Event>();
  @Output() explorerAutoShowToggle = new EventEmitter<Event>();

  constructor(private store: Store) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit(); // Call parent ngOnInit to load help text and toolbar state

    // Subscribe to auto-fade options from state
    this.store.select(SketchState.getAutoFadeOptions).subscribe((options) => {
      if (options) {
        this.autoFadeOptions = options;
      }
    });
  }

  onUpdateNodeCount(event: Event): void {
    this.updateNodeCount.emit(event);
  }

  onUpdateNodeCountFromInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);

    // Validate and constrain the value
    if (isNaN(value) || value < 1) {
      value = 1;
    } else if (value > 2000) {
      value = 2000;
    }

    // Update the input value if it was constrained
    input.value = value.toString();

    // Create a synthetic event to match the slider's event format
    const syntheticEvent = new Event('input', { bubbles: true });
    Object.defineProperty(syntheticEvent, 'target', {
      writable: false,
      value: { value: value.toString() },
    });

    this.updateNodeCount.emit(syntheticEvent);
  }

  onNodeCountInputBlur(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);

    // Validate and set to current value if invalid
    if (isNaN(value) || value < 1 || value > 2000) {
      input.value = this.nodeCount.toString();
    }
  }

  onToggleSnapToolbarsOnResize(): void {
    this.toggleSnapToolbarsOnResize.emit();
  }

  onToggleTreeVisibility(): void {
    this.toggleTreeVisibility.emit();
  }

  onToggleLogoFade(): void {
    this.toggleLogoFade.emit();
  }

  onToggleBlackBackground(): void {
    this.toggleBlackBackground.emit();
  }

  onToggleAutoFade(): void {
    this.toggleAutoFade.emit();
  }

  onToggleAutoFadeOut(): void {
    this.toggleAutoFadeOut.emit();
  }

  onToggleAutoFadeDiagram(): void {
    this.toggleAutoFadeDiagram.emit();
  }

  onRegenerateNodes(): void {
    this.regenerateNodes.emit();
  }

  onToggleScrollToNode(): void {
    this.toggleScrollToNode.emit();
  }

  onToggleAutoFadeOptions(): void {
    if (!this.autoFadeOptionsActive) {
      // Show dialog when turning on
      this.showAutoFadeOptionsDialog = true;
    } else {
      // Just toggle off
      this.toggleAutoFadeOptions.emit();
    }
  }

  onOpenAutoFadeOptions(): void {
    this.showAutoFadeOptionsDialog = true;
  }

  onCloseAutoFadeOptions(): void {
    this.showAutoFadeOptionsDialog = false;
    // When dialog is closed without confirming (Cancel button), turn off the toggle
    if (this.autoFadeOptionsActive) {
      this.toggleAutoFadeOptions.emit();
    }
  }

  onDialogBackdropClick(event: MouseEvent): void {
    // Close dialog when clicking backdrop
    this.onCloseAutoFadeOptions();
  }

  onStartCustomAutoFade(options?: AutoFadeOptions): void {
    // If options are passed from dialog, use them; otherwise use current autoFadeOptions
    const optionsToUse = options || this.autoFadeOptions;

    console.log('onStartCustomAutoFade called with options:', optionsToUse);

    // Update local options if new ones were passed
    if (options) {
      this.autoFadeOptions = { ...options };
    }

    // Save the options to state
    this.store.dispatch(new SketchActions.SetAutoFadeOptions(optionsToUse));
    // Emit the auto fade options to parent component
    this.startCustomAutoFade.emit({ ...optionsToUse });

    // Close dialog but don't trigger the toggle-off behavior
    this.showAutoFadeOptionsDialog = false;

    // Close toolbar if option is enabled
    if (optionsToUse.closeToolbarAfterStart) {
      this.onClose(); // Use onClose() instead of setting visible directly to emit proper events
    }
  }

  onToggleHelp(): void {
    this.showHelpOverlay = !this.showHelpOverlay;
  }

  onCloseHelp(): void {
    this.showHelpOverlay = false;
  }

  onToggleQuickNavFollow(): void {
    this.quickNavFollowToggle.emit();
  }

  onToggleNodeListFollow(): void {
    this.nodeListFollowToggle.emit();
  }

  onToggleLessonSurvey(): void {
    this.lessonContentQualitySurveyToggle.emit();
  }

  onToggleExploratorySurvey(): void {
    this.exploratoryContentQualitySurveyToggle.emit();
  }

  onToggleExplorerAutoShow(): void {
    this.explorerAutoShowToggle.emit();
  }
}
