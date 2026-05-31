import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../../services/mock-data.service';

@Component({
  selector: 'app-shared-node-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="shared-node-display" [class.dark-mode]="isDarkMode">
      <!-- Node Header -->
      <div class="node-header" *ngIf="selectedNode || selectedNodeId">
        <h4>{{ getNodeTitle() }}</h4>
      </div>

      <!-- Waiting Mode - No node selected -->
      <div class="waiting-mode" *ngIf="!selectedNode && !selectedNodeId">
        <p class="waiting-message">{{ waitingMessage }}</p>
      </div>

      <!-- Node Content -->
      <div class="node-content" *ngIf="selectedNode">
        <div class="node-description-section">
          <p class="node-description-content">{{ getNodeDescription() }}</p>
        </div>
      </div>

      <!-- Lesson Info Screen for Lesson Runner -->
      <div class="lesson-info-screen" *ngIf="showLessonInfo && selectedLesson">
        <div class="lesson-details">
          <h3>
            {{ selectedLesson.LessonID ? selectedLesson.LessonID + ' - ' : ''
            }}{{ selectedLesson.LessonName }}
          </h3>
          <div class="lesson-description" *ngIf="selectedLesson.LessonDesc">
            <p>{{ selectedLesson.LessonDesc }}</p>
          </div>
          <div
            class="lesson-chips"
            *ngIf="
              selectedLesson.LessonChips &&
              selectedLesson.LessonChips.length > 0
            "
          >
            <strong>Falls Under:</strong>
            <div class="chips-display">
              <span
                class="chip"
                *ngFor="let chip of selectedLesson.LessonChips"
                >{{ chip }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Node Completion Status for Explorer -->
      <div
        class="completion-status"
        *ngIf="showCompletionStatus && nodeCompletion"
      >
        <div class="completion-message">
          ✅ You explored and completed this node on
          {{ nodeCompletion.completedDate | date : 'short' }}.
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./shared-node-display.component.scss'],
})
export class SharedNodeDisplayComponent implements OnInit {
  @Input() selectedNode: any = null;
  @Input() selectedNodeId: string | null = null;
  @Input() selectedLesson: any = null;
  @Input() nodeData: any = null;
  @Input() isDarkMode = false;
  @Input() showLessonInfo = false;
  @Input() showCompletionStatus = false;
  @Input() nodeCompletion: any = null;
  @Input() waitingMessage =
    'To begin training, select a node to explore, or lesson to work through';

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {}

  getNodeTitle(): string {
    if (this.selectedNode) {
      return (
        this.selectedNode.data?.name ||
        this.selectedNode.name ||
        `Node ${this.selectedNode.id}`
      );
    }
    if (this.selectedNodeId) {
      return `Node ${this.selectedNodeId}`;
    }
    return '';
  }

  getNodeDescription(): string {
    if (this.selectedNode) {
      // Use existing description if available
      const existingDescription =
        this.selectedNode.data?.description || this.selectedNode.description;
      if (existingDescription && existingDescription.trim()) {
        return existingDescription;
      }
      // Generate mock description for nodes without description
      return this.mockDataService.generateNodeDescription(
        this.selectedNode.id || 'default',
        true
      );
    }

    if (this.selectedNodeId) {
      // Generate mock description for node ID
      return this.mockDataService.generateNodeDescription(
        this.selectedNodeId,
        true
      );
    }

    return '';
  }
}
