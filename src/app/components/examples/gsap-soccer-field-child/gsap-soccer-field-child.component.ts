import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import {
  MiniMatchFormationsService,
  IMiniMatchBaseFormat,
} from '../../../services/mini-match-formations.service';
import { MockPositionsService } from '../../../services/mock-positions.service';
import {
  IMiniMatchPlayer,
  IMiniMatchKeyframe,
  IMiniMatchAnimationSequence,
  IMiniFormationPreset,
} from '../../../interfaces/mini-match';
import { MiniMatchState } from '../../../state/mini-match.state';
import {
  SaveCustomFormationPreset,
  UpdateCustomFormationPreset,
  DeleteCustomFormationPreset,
  ImportCustomFormationPresets,
  SaveSequence,
  DeleteSequence,
} from '../../../state/mini-match.actions';

// Register GSAP plugins
gsap.registerPlugin(Draggable);

@Component({
  selector: 'app-gsap-soccer-field-child',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gsap-soccer-field-child.component.html',
  styleUrls: ['./gsap-soccer-field-child.component.scss'],
})
export class GsapSoccerFieldChildComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('svgContainer', { static: false })
  svgContainer!: ElementRef<SVGSVGElement>;

  // Field dimensions (in SVG units) - vertical orientation to match field grid SVGs
  fieldWidth = 660;
  fieldHeight = 1000;
  fieldPadding = 0;

  // Players
  players: IMiniMatchPlayer[] = [];
  selectedPlayer: IMiniMatchPlayer | null = null;

  // Player selection state
  showPlayerSelectionDialog = false;
  allPlayerNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  selectedHomePlayerNumbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  selectedAwayPlayerNumbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  playerPositions: Map<number, string> = new Map();

  // Ball
  ball = { x: 330, y: 500 };

  // Animation
  currentSequence: IMiniMatchAnimationSequence = {
    name: 'Untitled Sequence',
    keyframes: [],
    duration: 10,
  };
  currentTime = 0;
  isPlaying = false;
  isRecording = false;
  timeline: gsap.core.Timeline | null = null;
  savedSequences: IMiniMatchAnimationSequence[] = [];

  // Draggable tracking
  draggables: any[] = [];

  // UI State
  showGrid = true;
  snapToGrid = false;
  gridSize = 50;
  selectedFieldGrid = 'field.standard.svg';

  // Team colors
  homeTeamColor = '#4A90E2'; // Default blue
  awayTeamColor = '#E74C3C'; // Default red

  // Make Math available to template
  Math = Math;

  // Base formation options from service
  baseFormations: IMiniMatchBaseFormat[] = [];
  selectedBaseFormation: IMiniMatchBaseFormat | null = null;

  // Custom formation presets
  customFormationPresets: IMiniFormationPreset[] = [];
  selectedCustomPreset: IMiniFormationPreset | null = null;

  // Combined formation preset selection
  selectedFormationPreset: {
    type: 'system' | 'custom';
    value: IMiniMatchBaseFormat | IMiniFormationPreset;
  } | null = null;

  // Save formation preset dialog
  showSaveFormationPresetDialog = false;
  formationPresetName = '';
  formationPresetDescription = '';

  // Overwrite formation preset dialog
  showOverwritePresetDialog = false;

  // Export keyframe dialog
  showExportKeyframeDialog = false;
  exportKeyframeIndex: number | null = null;
  exportKeyframeName = '';
  exportKeyframeDescription = '';

  fieldGridOptions = [
    { value: 'field.standard.svg', label: 'Standard Field' },
    { value: 'field.standard.green.svg', label: 'Standard Green' },
    { value: 'field.futsal.svg', label: 'Futsal Field' },
    {
      value: 'field.futsal.color.blue-orange.svg',
      label: 'Futsal Blue-Orange',
    },
    { value: 'field.guardiola.svg', label: 'Guardiola Field' },
    { value: 'field.guardiola.green.svg', label: 'Guardiola Green' },
    { value: 'field.nagalsmann.svg', label: 'Nagelsmann Field' },
    { value: 'field.nagalsmann.green.svg', label: 'Nagelsmann Green' },
  ];

  constructor(
    private miniMatchFormationsService: MiniMatchFormationsService,
    private mockPositionsService: MockPositionsService,
    private store: Store
  ) {
    // Initialize position map for easy lookup
    this.mockPositionsService.getPositions().forEach((pos) => {
      this.playerPositions.set(pos.number, pos.abbrev);
    });
  }

  getFieldGridPath(): string {
    return `assets/field-grids/${this.selectedFieldGrid}`;
  }

  ngOnInit(): void {
    // Load base formations from service
    this.baseFormations = this.miniMatchFormationsService.getBaseFormations();
    if (this.baseFormations.length > 0) {
      this.selectedBaseFormation = this.baseFormations[0];
    }

    // Load custom formation presets from state
    this.customFormationPresets = this.store.selectSnapshot(
      MiniMatchState.getCustomFormationPresets
    );

    // Load saved sequences from state
    this.savedSequences = this.store.selectSnapshot(
      MiniMatchState.getSavedSequences
    );

    this.initializePlayers();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeDraggable();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.timeline) {
      this.timeline.kill();
    }
  }

  initializePlayers(): void {
    // Full formations for all 11 players - vertical orientation
    const allHomePositions = [
      { x: 330, y: 100, number: 1 }, // GK
      { x: 180, y: 200, number: 2 }, // RB
      { x: 280, y: 200, number: 5 }, // CB
      { x: 380, y: 200, number: 4 }, // CB
      { x: 480, y: 200, number: 3 }, // LB
      { x: 200, y: 350, number: 6 }, // CM
      { x: 330, y: 350, number: 8 }, // CM
      { x: 460, y: 350, number: 10 }, // CM
      { x: 180, y: 500, number: 7 }, // RW
      { x: 330, y: 500, number: 9 }, // ST
      { x: 480, y: 500, number: 11 }, // LW
    ];

    // Full formations for all 11 players - vertical orientation (mirrored)
    const allAwayPositions = [
      { x: 330, y: 900, number: 1 }, // GK
      { x: 480, y: 800, number: 2 }, // LB
      { x: 380, y: 800, number: 5 }, // CB
      { x: 280, y: 800, number: 4 }, // CB
      { x: 180, y: 800, number: 3 }, // RB
      { x: 460, y: 650, number: 6 }, // CM
      { x: 330, y: 650, number: 8 }, // CM
      { x: 200, y: 650, number: 10 }, // CM
      { x: 480, y: 500, number: 7 }, // LW
      { x: 330, y: 500, number: 9 }, // ST
      { x: 180, y: 500, number: 11 }, // RW
    ];

    // Build players array based on selected player numbers
    this.players = [
      ...allHomePositions
        .filter((p) => this.selectedHomePlayerNumbers.includes(p.number))
        .map((p, i) => ({
          id: `home-${i}`,
          x: p.x,
          y: p.y,
          team: 'home' as const,
          number: p.number,
          color: this.homeTeamColor,
        })),
      ...allAwayPositions
        .filter((p) => this.selectedAwayPlayerNumbers.includes(p.number))
        .map((p, i) => ({
          id: `away-${i}`,
          x: p.x,
          y: p.y,
          team: 'away' as const,
          number: p.number,
          color: this.awayTeamColor,
        })),
    ];
    // Center ball
    this.ball = { x: 330, y: 500 };
  }

  initializeDraggable(): void {
    // Kill existing draggables to prevent memory leaks
    this.draggables.forEach((draggable) => {
      draggable.kill();
    });
    this.draggables = [];

    this.players.forEach((player) => {
      const element = document.getElementById(player.id);
      if (element) {
        const draggable = Draggable.create(element, {
          type: 'x,y',
          bounds: this.svgContainer.nativeElement,
          onDrag: () => {
            const currentDraggable = Draggable.get(element);
            if (currentDraggable) {
              player.x = currentDraggable.x;
              player.y = currentDraggable.y;
              if (this.snapToGrid) {
                player.x = Math.round(player.x / this.gridSize) * this.gridSize;
                player.y = Math.round(player.y / this.gridSize) * this.gridSize;
              }
            }
          },
          onDragEnd: () => {
            if (this.isRecording) {
              this.captureKeyframe();
            }
          },
        });
        this.draggables.push(...draggable);
      }
    });
    // Ball
    const ballEl = document.getElementById('soccer-ball');
    if (ballEl) {
      const ballDraggable = Draggable.create(ballEl, {
        type: 'x,y',
        bounds: this.svgContainer.nativeElement,
        onDrag: () => {
          const currentDraggable = Draggable.get(ballEl);
          if (currentDraggable) {
            this.ball.x = currentDraggable.x;
            this.ball.y = currentDraggable.y;
            if (this.snapToGrid) {
              this.ball.x =
                Math.round(this.ball.x / this.gridSize) * this.gridSize;
              this.ball.y =
                Math.round(this.ball.y / this.gridSize) * this.gridSize;
            }
          }
        },
        onDragEnd: () => {
          if (this.isRecording) {
            this.captureKeyframe();
          }
        },
      });
      this.draggables.push(...ballDraggable);
    }
  }

  // Keyframe Management
  captureKeyframe(): void {
    const keyframe: IMiniMatchKeyframe = {
      time: this.currentTime,
      players: this.players.map((p) => ({ id: p.id, x: p.x, y: p.y })),
      ball: { x: this.ball.x, y: this.ball.y },
    };

    // Check if keyframe at this time already exists
    const existingIndex = this.currentSequence.keyframes.findIndex(
      (kf) => Math.abs(kf.time - this.currentTime) < 0.1
    );

    if (existingIndex >= 0) {
      this.currentSequence.keyframes[existingIndex] = keyframe;
    } else {
      this.currentSequence.keyframes.push(keyframe);
      this.currentSequence.keyframes.sort((a, b) => a.time - b.time);
    }
  }

  // Base Formation Management
  applyBaseFormation(): void {
    if (!this.selectedBaseFormation) return;

    const formation = this.selectedBaseFormation;

    // Update player positions based on formation
    formation.baseFormatPositions.forEach((pos) => {
      // Find player by number from home team
      const player = this.players.find(
        (p) => p.team === 'home' && p.number === pos.playerNumber
      );

      if (player) {
        player.x = pos.playerX;
        player.y = pos.playerY;
        // Update SVG element position
        gsap.set(`#${player.id}`, { x: pos.playerX, y: pos.playerY });
      }
    });

    // If recording, capture the keyframe
    if (this.isRecording) {
      this.captureKeyframe();
    }
  }

  // Team Color Management
  updateTeamColors(): void {
    this.players.forEach((player) => {
      if (player.team === 'home') {
        player.color = this.homeTeamColor;
      } else if (player.team === 'away') {
        player.color = this.awayTeamColor;
      }
    });
  }

  deleteKeyframe(index: number): void {
    this.currentSequence.keyframes.splice(index, 1);
  }

  goToKeyframe(keyframe: IMiniMatchKeyframe): void {
    this.currentTime = keyframe.time;
    keyframe.players.forEach((kfPlayer) => {
      const player = this.players.find((p) => p.id === kfPlayer.id);
      if (player) {
        player.x = kfPlayer.x;
        player.y = kfPlayer.y;
        gsap.set(`#${player.id}`, { x: kfPlayer.x, y: kfPlayer.y });
      }
    });
    if (keyframe.ball) {
      this.ball.x = keyframe.ball.x;
      this.ball.y = keyframe.ball.y;
      gsap.set(`#soccer-ball`, { x: this.ball.x, y: this.ball.y });
    }
  }

  openExportKeyframeDialog(index: number): void {
    this.exportKeyframeIndex = index;
    this.exportKeyframeName = `Keyframe ${this.formatTime(
      this.currentSequence.keyframes[index].time
    )}`;
    this.exportKeyframeDescription = '';
    this.showExportKeyframeDialog = true;
  }

  closeExportKeyframeDialog(): void {
    this.showExportKeyframeDialog = false;
    this.exportKeyframeIndex = null;
    this.exportKeyframeName = '';
    this.exportKeyframeDescription = '';
  }

  exportKeyframe(): void {
    if (this.exportKeyframeIndex === null) return;

    const keyframe = this.currentSequence.keyframes[this.exportKeyframeIndex];
    const keyframeData = {
      name: this.exportKeyframeName,
      description: this.exportKeyframeDescription,
      time: keyframe.time,
      players: keyframe.players,
      ball: keyframe.ball,
      fieldGrid: this.selectedFieldGrid,
      homeTeamColor: this.homeTeamColor,
      awayTeamColor: this.awayTeamColor,
    };

    const json = JSON.stringify(keyframeData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.exportKeyframeName.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.closeExportKeyframeDialog();
  }

  // Animation Playback
  play(): void {
    if (this.currentSequence.keyframes.length < 2) {
      alert('You need at least 2 keyframes to play an animation');
      return;
    }

    this.isPlaying = true;

    // Disable draggables during playback
    this.draggables.forEach((draggable) => {
      draggable.disable();
    });

    this.timeline = gsap.timeline({
      onComplete: () => {
        this.isPlaying = false;
        // Re-enable draggables after playback
        this.draggables.forEach((draggable) => {
          draggable.enable();
        });
      },
      onUpdate: () => {
        if (this.timeline) {
          this.currentTime = this.timeline.time();
        }
      },
    });

    // Sort keyframes by time
    const sortedKeyframes = [...this.currentSequence.keyframes].sort(
      (a, b) => a.time - b.time
    );

    // Set initial positions at first keyframe
    const firstKf = sortedKeyframes[0];
    firstKf.players.forEach((player) => {
      gsap.set(`#${player.id}`, { x: player.x, y: player.y });
    });
    if (firstKf.ball) {
      gsap.set(`#soccer-ball`, { x: firstKf.ball.x, y: firstKf.ball.y });
    }

    // Create animations between keyframes
    for (let i = 0; i < sortedKeyframes.length - 1; i++) {
      const currentKf = sortedKeyframes[i];
      const nextKf = sortedKeyframes[i + 1];
      const duration = nextKf.time - currentKf.time;

      currentKf.players.forEach((kfPlayer) => {
        const nextKfPlayer = nextKf.players.find((p) => p.id === kfPlayer.id);
        if (nextKfPlayer) {
          this.timeline!.to(
            `#${kfPlayer.id}`,
            {
              x: nextKfPlayer.x,
              y: nextKfPlayer.y,
              duration: duration,
              ease: 'power1.inOut',
            },
            currentKf.time
          );
        }
      });
      // Animate ball
      if (currentKf.ball && nextKf.ball) {
        this.timeline!.to(
          `#soccer-ball`,
          {
            x: nextKf.ball.x,
            y: nextKf.ball.y,
            duration: duration,
            ease: 'power1.inOut',
          },
          currentKf.time
        );
      }
    }
  }

  pause(): void {
    if (this.timeline) {
      this.timeline.pause();
      this.isPlaying = false;
      // Re-enable draggables when paused
      this.draggables.forEach((draggable) => {
        draggable.enable();
      });
    }
  }

  stop(): void {
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
    this.isPlaying = false;
    this.currentTime = 0;

    // Re-enable draggables when stopped
    this.draggables.forEach((draggable) => {
      draggable.enable();
    });

    // Reset to first keyframe or initial positions
    if (this.currentSequence.keyframes.length > 0) {
      this.goToKeyframe(this.currentSequence.keyframes[0]);
    }
  }

  rewind(): void {
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
    this.isPlaying = false;
    this.currentTime = 0;

    // Reset to first keyframe or initial positions
    if (this.currentSequence.keyframes.length > 0) {
      this.goToKeyframe(this.currentSequence.keyframes[0]);
    } else {
      // Reset all players and ball to origin
      this.players.forEach((player) => {
        player.x = 0;
        player.y = 0;
        gsap.set(`#${player.id}`, { x: 0, y: 0 });
      });
      this.ball.x = 0;
      this.ball.y = 0;
      gsap.set(`#soccer-ball`, { x: 0, y: 0 });
    }
  }

  previousKeyframe(): void {
    if (this.currentSequence.keyframes.length === 0) return;

    const sortedKeyframes = [...this.currentSequence.keyframes].sort(
      (a, b) => a.time - b.time
    );

    // Find the keyframe just before current time
    let prevKeyframe = sortedKeyframes[0];
    for (const kf of sortedKeyframes) {
      if (kf.time < this.currentTime - 0.01) {
        prevKeyframe = kf;
      } else {
        break;
      }
    }

    this.goToKeyframe(prevKeyframe);
  }

  nextKeyframe(): void {
    if (this.currentSequence.keyframes.length === 0) return;

    const sortedKeyframes = [...this.currentSequence.keyframes].sort(
      (a, b) => a.time - b.time
    );

    // Find the keyframe just after current time
    for (const kf of sortedKeyframes) {
      if (kf.time > this.currentTime + 0.01) {
        this.goToKeyframe(kf);
        return;
      }
    }

    // If no next keyframe, stay at the last one
    this.goToKeyframe(sortedKeyframes[sortedKeyframes.length - 1]);
  }

  end(): void {
    if (this.currentSequence.keyframes.length === 0) return;

    const sortedKeyframes = [...this.currentSequence.keyframes].sort(
      (a, b) => a.time - b.time
    );

    this.goToKeyframe(sortedKeyframes[sortedKeyframes.length - 1]);
  }

  toggleRecording(): void {
    this.isRecording = !this.isRecording;
    if (this.isRecording) {
      this.captureKeyframe();
    }
  }

  // Sequence Management
  saveSequence(): void {
    const name = prompt(
      'Enter a name for this sequence:',
      this.currentSequence.name
    );
    if (name) {
      const sequence: IMiniMatchAnimationSequence = {
        name,
        keyframes: JSON.parse(JSON.stringify(this.currentSequence.keyframes)),
        duration: this.currentSequence.duration,
        fieldGrid: this.selectedFieldGrid,
        homeTeamColor: this.homeTeamColor,
        awayTeamColor: this.awayTeamColor,
      };
      // Dispatch action to save sequence to state
      this.store.dispatch(new SaveSequence(sequence));
      this.savedSequences.push(sequence);
      alert('Sequence saved!');
    }
  }

  loadSequence(sequence: IMiniMatchAnimationSequence): void {
    this.currentSequence = JSON.parse(JSON.stringify(sequence));

    // Restore field grid
    if (sequence.fieldGrid) {
      this.selectedFieldGrid = sequence.fieldGrid;
    }

    // Restore team colors
    if (sequence.homeTeamColor) {
      this.homeTeamColor = sequence.homeTeamColor;
    }
    if (sequence.awayTeamColor) {
      this.awayTeamColor = sequence.awayTeamColor;
    }

    // Update player colors with restored colors
    this.updateTeamColors();

    if (this.currentSequence.keyframes.length > 0) {
      this.goToKeyframe(this.currentSequence.keyframes[0]);
    }
  }

  deleteSequence(index: number): void {
    if (confirm('Are you sure you want to delete this sequence?')) {
      // Dispatch action to delete sequence from state
      this.store.dispatch(new DeleteSequence({ index }));
      this.savedSequences.splice(index, 1);
    }
  }

  newSequence(): void {
    if (
      this.currentSequence.keyframes.length > 0 &&
      !confirm('Start a new sequence? Unsaved changes will be lost.')
    ) {
      return;
    }

    this.currentSequence = {
      name: 'Untitled Sequence',
      keyframes: [],
      duration: 10,
      fieldGrid: this.selectedFieldGrid,
      homeTeamColor: this.homeTeamColor,
      awayTeamColor: this.awayTeamColor,
    };
    this.currentTime = 0;
  }

  exportSequence(): void {
    const sequence = {
      ...this.currentSequence,
      fieldGrid: this.selectedFieldGrid,
      homeTeamColor: this.homeTeamColor,
      awayTeamColor: this.awayTeamColor,
    };
    const json = JSON.stringify(sequence, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.currentSequence.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importSequence(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const sequence = JSON.parse(e.target?.result as string);
          this.currentSequence = sequence;

          // Restore field grid
          if (sequence.fieldGrid) {
            this.selectedFieldGrid = sequence.fieldGrid;
          }

          // Restore team colors
          if (sequence.homeTeamColor) {
            this.homeTeamColor = sequence.homeTeamColor;
          }
          if (sequence.awayTeamColor) {
            this.awayTeamColor = sequence.awayTeamColor;
          }

          // Update player colors with restored colors
          this.updateTeamColors();

          if (this.currentSequence.keyframes.length > 0) {
            this.goToKeyframe(this.currentSequence.keyframes[0]);
          }
        } catch (error) {
          alert('Error importing sequence: Invalid JSON file');
        }
      };
      reader.readAsText(file);
    }
  }

  // Utility
  resetPositions(): void {
    if (confirm('Reset all players and the ball to their initial positions?')) {
      this.initializePlayers();
      this.players.forEach((player) => {
        gsap.set(`#${player.id}`, { x: player.x, y: player.y });
      });
      gsap.set(`#soccer-ball`, { x: this.ball.x, y: this.ball.y });
    }
  }

  // Player Selection Dialog Methods
  openPlayerSelectionDialog(): void {
    this.showPlayerSelectionDialog = true;
  }

  closePlayerSelectionDialog(): void {
    this.showPlayerSelectionDialog = false;
  }

  applyPlayerSelection(): void {
    this.initializePlayers();
    this.initializeDraggable();
    this.showPlayerSelectionDialog = false;
  }

  toggleHomePlayer(playerNumber: number): void {
    const index = this.selectedHomePlayerNumbers.indexOf(playerNumber);
    if (index > -1) {
      this.selectedHomePlayerNumbers.splice(index, 1);
    } else {
      this.selectedHomePlayerNumbers.push(playerNumber);
      this.selectedHomePlayerNumbers.sort((a, b) => a - b);
    }
  }

  toggleAwayPlayer(playerNumber: number): void {
    const index = this.selectedAwayPlayerNumbers.indexOf(playerNumber);
    if (index > -1) {
      this.selectedAwayPlayerNumbers.splice(index, 1);
    } else {
      this.selectedAwayPlayerNumbers.push(playerNumber);
      this.selectedAwayPlayerNumbers.sort((a, b) => a - b);
    }
  }

  selectAllHomePlayers(): void {
    this.selectedHomePlayerNumbers = [...this.allPlayerNumbers];
  }

  deselectAllHomePlayers(): void {
    this.selectedHomePlayerNumbers = [];
  }

  selectAllAwayPlayers(): void {
    this.selectedAwayPlayerNumbers = [...this.allPlayerNumbers];
  }

  deselectAllAwayPlayers(): void {
    this.selectedAwayPlayerNumbers = [];
  }

  getPositionAbbrev(playerNumber: number): string {
    return this.playerPositions.get(playerNumber) || '?';
  }

  compareFormations(
    f1: IMiniMatchBaseFormat,
    f2: IMiniMatchBaseFormat
  ): boolean {
    return f1 && f2 ? f1.baseFormatName === f2.baseFormatName : f1 === f2;
  }

  getPlayerTransform(player: IMiniMatchPlayer): string {
    return `translate(${player.x}, ${player.y})`;
  }

  getBallTransform(): string {
    return `translate(${this.ball.x}, ${this.ball.y})`;
  }

  formatTime(seconds: number): string {
    if (seconds == null || isNaN(seconds)) {
      return '0.00s';
    }
    return seconds.toFixed(2) + 's';
  }

  // Formation Preset Dialog Methods
  openSaveFormationPresetDialog(): void {
    this.showSaveFormationPresetDialog = true;
    this.formationPresetName = '';
    this.formationPresetDescription = '';
  }

  closeSaveFormationPresetDialog(): void {
    this.showSaveFormationPresetDialog = false;
  }

  saveCurrentAsFormationPreset(): void {
    if (!this.formationPresetName.trim()) {
      alert('Please enter a preset name');
      return;
    }

    const preset: IMiniFormationPreset = {
      name: this.formationPresetName.trim(),
      description: this.formationPresetDescription.trim(),
      playerPositions: this.players.map((p) => ({
        id: p.id,
        number: p.number,
        team: p.team,
        x: p.x,
        y: p.y,
      })),
      ballPosition: { x: this.ball.x, y: this.ball.y },
      homeTeamColor: this.homeTeamColor,
      awayTeamColor: this.awayTeamColor,
      selectedHomePlayerNumbers: [...this.selectedHomePlayerNumbers],
      selectedAwayPlayerNumbers: [...this.selectedAwayPlayerNumbers],
    };

    // Dispatch action to save preset to state
    this.store.dispatch(new SaveCustomFormationPreset(preset));
    this.customFormationPresets.push(preset);
    this.closeSaveFormationPresetDialog();
    alert(`Formation preset "${preset.name}" saved successfully!`);
  }

  applyCustomFormationPreset(): void {
    if (!this.selectedCustomPreset) return;

    const preset = this.selectedCustomPreset;

    // Restore player numbers
    this.selectedHomePlayerNumbers = [...preset.selectedHomePlayerNumbers];
    this.selectedAwayPlayerNumbers = [...preset.selectedAwayPlayerNumbers];

    // Restore colors
    this.homeTeamColor = preset.homeTeamColor;
    this.awayTeamColor = preset.awayTeamColor;

    // Reinitialize players with restored selections
    this.initializePlayers();

    // Apply saved positions
    preset.playerPositions.forEach((savedPos) => {
      const player = this.players.find((p) => p.id === savedPos.id);
      if (player) {
        player.x = savedPos.x;
        player.y = savedPos.y;
        gsap.set(`#${player.id}`, { x: savedPos.x, y: savedPos.y });
      }
    });

    // Restore ball position
    this.ball.x = preset.ballPosition.x;
    this.ball.y = preset.ballPosition.y;
    gsap.set(`#soccer-ball`, {
      x: preset.ballPosition.x,
      y: preset.ballPosition.y,
    });

    // Reinitialize draggables after applying preset
    setTimeout(() => {
      this.initializeDraggable();
    }, 100);
  }

  deleteCustomFormationPreset(): void {
    if (!this.selectedCustomPreset) return;

    const index = this.customFormationPresets.indexOf(
      this.selectedCustomPreset
    );
    if (index > -1) {
      const name = this.selectedCustomPreset.name;
      // Dispatch action to delete preset from state
      this.store.dispatch(new DeleteCustomFormationPreset({ index }));
      this.customFormationPresets.splice(index, 1);
      this.selectedCustomPreset = null;
      alert(`Formation preset "${name}" deleted.`);
    }
  }

  // Combined formation preset methods
  applySelectedFormationPreset(): void {
    if (!this.selectedFormationPreset) return;

    if (this.selectedFormationPreset.type === 'system') {
      this.selectedBaseFormation = this.selectedFormationPreset
        .value as IMiniMatchBaseFormat;
      this.applyBaseFormation();
    } else {
      this.selectedCustomPreset = this.selectedFormationPreset
        .value as IMiniFormationPreset;
      this.applyCustomFormationPreset();
    }
  }

  deleteSelectedFormationPreset(): void {
    if (
      !this.selectedFormationPreset ||
      this.selectedFormationPreset.type === 'system'
    )
      return;

    this.selectedCustomPreset = this.selectedFormationPreset
      .value as IMiniFormationPreset;
    this.deleteCustomFormationPreset();
    this.selectedFormationPreset = null;
  }

  openOverwritePresetDialog(): void {
    this.showOverwritePresetDialog = true;
  }

  closeOverwritePresetDialog(): void {
    this.showOverwritePresetDialog = false;
  }

  overwriteCustomFormationPreset(): void {
    if (!this.selectedCustomPreset) return;

    // Find the index of the selected preset
    const index = this.customFormationPresets.indexOf(
      this.selectedCustomPreset
    );

    if (index === -1) return;

    // Update the preset with current state
    const updatedPreset: IMiniFormationPreset = {
      name: this.selectedCustomPreset.name,
      description: this.selectedCustomPreset.description,
      playerPositions: this.players.map((p) => ({
        id: p.id,
        number: p.number,
        team: p.team,
        x: p.x,
        y: p.y,
      })),
      ballPosition: { x: this.ball.x, y: this.ball.y },
      homeTeamColor: this.homeTeamColor,
      awayTeamColor: this.awayTeamColor,
      selectedHomePlayerNumbers: [...this.selectedHomePlayerNumbers],
      selectedAwayPlayerNumbers: [...this.selectedAwayPlayerNumbers],
    };

    // Dispatch action to update preset in state
    this.store.dispatch(
      new UpdateCustomFormationPreset({
        index,
        preset: updatedPreset,
      })
    );
    // Replace the preset at the same index
    this.customFormationPresets[index] = updatedPreset;
    this.selectedCustomPreset = updatedPreset;
    this.closeOverwritePresetDialog();
    alert(
      `Formation preset "${updatedPreset.name}" has been updated successfully!`
    );
  }

  exportFormationPresets(): void {
    if (this.customFormationPresets.length === 0) {
      alert('No custom presets to export.');
      return;
    }

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      presets: this.customFormationPresets,
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formation-presets-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importFormationPresets(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);

          // Validate the imported data structure
          if (!Array.isArray(importedData.presets)) {
            throw new Error('Invalid presets format');
          }

          // Check for duplicates and add with warnings
          let duplicateCount = 0;
          importedData.presets.forEach((preset: IMiniFormationPreset) => {
            const isDuplicate = this.customFormationPresets.some(
              (p) => p.name === preset.name
            );
            if (isDuplicate) {
              duplicateCount++;
              // Add with timestamp to avoid overwriting
              preset.name = `${
                preset.name
              } (Imported ${new Date().toLocaleTimeString()})`;
            }
            this.customFormationPresets.push(preset);
          });

          // Dispatch action to import presets to state
          this.store.dispatch(
            new ImportCustomFormationPresets(importedData.presets)
          );

          const importedCount = importedData.presets.length;
          let message = `Successfully imported ${importedCount} preset(s)`;
          if (duplicateCount > 0) {
            message += `. Note: ${duplicateCount} duplicate name(s) were renamed to avoid conflicts.`;
          }
          alert(message);
        } catch (error) {
          alert('Error importing presets: Invalid JSON file or corrupted data');
        }
      };
      reader.readAsText(file);
      // Reset the input so the same file can be imported again
      input.value = '';
    }
  }
}
