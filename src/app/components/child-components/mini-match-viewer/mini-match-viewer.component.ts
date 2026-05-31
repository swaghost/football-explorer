import {
  Component,
  Input,
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
import { MockPositionsService } from '../../../services/mock-positions.service';
import {
  IMiniMatchPlayer,
  IMiniMatchKeyframe,
  IMiniMatchAnimationSequence,
} from '../../../interfaces/mini-match';
import { MiniMatchState } from '../../../state/mini-match.state';

@Component({
  selector: 'app-mini-match-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mini-match-viewer.component.html',
  styleUrls: ['./mini-match-viewer.component.scss'],
})
export class MiniMatchViewerComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() isDarkMode: boolean = false;
  @Input() sequence: IMiniMatchAnimationSequence | null = null;

  @ViewChild('svgContainer', { static: false })
  svgContainer!: ElementRef<SVGSVGElement>;

  // Field dimensions (in SVG units) - vertical orientation to match field grid SVGs
  fieldWidth = 660;
  fieldHeight = 1000;
  fieldPadding = 0;

  // Players
  players: IMiniMatchPlayer[] = [];

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
  timeline: gsap.core.Timeline | null = null;
  savedSequences: IMiniMatchAnimationSequence[] = [];

  // Playback options
  repeatMode = false; // Default: repeat is OFF

  // UI State
  showGrid = true;
  gridSize = 50;
  selectedFieldGrid = 'field.standard.svg';

  // Team colors
  homeTeamColor = '#4A90E2'; // Default blue
  awayTeamColor = '#E74C3C'; // Default red

  // Make Math available to template
  Math = Math;

  // Default player numbers (read-only)
  allPlayerNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  selectedHomePlayerNumbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  selectedAwayPlayerNumbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  playerPositions: Map<number, string> = new Map();

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
    // Load saved sequences from state
    this.savedSequences = this.store.selectSnapshot(
      MiniMatchState.getSavedSequences
    );

    // If sequence is passed in via @Input, use it
    if (this.sequence) {
      this.currentSequence = JSON.parse(JSON.stringify(this.sequence));
      if (this.currentSequence.fieldGrid) {
        this.selectedFieldGrid = this.currentSequence.fieldGrid;
      }
      if (this.currentSequence.homeTeamColor) {
        this.homeTeamColor = this.currentSequence.homeTeamColor;
      }
      if (this.currentSequence.awayTeamColor) {
        this.awayTeamColor = this.currentSequence.awayTeamColor;
      }
    }

    this.initializePlayers();
  }

  ngAfterViewInit(): void {
    // Viewer doesn't need draggable initialization
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

  // Animation Playback (READ-ONLY)
  play(): void {
    if (this.currentSequence.keyframes.length < 2) {
      alert('You need at least 2 keyframes to play an animation');
      return;
    }

    this.isPlaying = true;

    this.timeline = gsap.timeline({
      onComplete: () => {
        if (this.repeatMode) {
          // Restart the animation
          this.stop();
          this.play();
        } else {
          this.isPlaying = false;
        }
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
    }
  }

  stop(): void {
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
    this.isPlaying = false;
    this.currentTime = 0;

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

  // Sequence Loading (READ-ONLY)
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

  // Utility Methods
  getPositionAbbrev(playerNumber: number): string {
    return this.playerPositions.get(playerNumber) || '?';
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
}
