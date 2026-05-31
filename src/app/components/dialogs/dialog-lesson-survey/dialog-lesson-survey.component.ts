import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LessonSurveyResponse,
  LESSON_SURVEY_QUESTIONS,
  MORE_INFORMATION_OPTIONS,
  SurveyQuestion,
} from '../../../interfaces/lesson-survey.interfaces';

@Component({
  selector: 'app-dialog-lesson-survey',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog-lesson-survey.component.html',
  styleUrls: ['./dialog-lesson-survey.component.scss'],
})
export class DialogLessonSurveyComponent implements OnInit, OnDestroy {
  @Input() visible = false;
  @Input() isDarkMode = false;
  @Input() lessonId = '';
  @Input() lessonTitle = '';
  @Input() nodeId = '';
  @Input() nodeName = '';
  @Input() surveyType: 'lesson' | 'node' = 'lesson'; // Determine survey context

  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<LessonSurveyResponse>();
  @Output() skip = new EventEmitter<void>();

  // Survey data
  surveyResponse: Partial<LessonSurveyResponse> = {};
  questions = LESSON_SURVEY_QUESTIONS;
  moreInfoOptions = MORE_INFORMATION_OPTIONS;

  // UI state
  currentStep = 0;
  totalSteps = 6; // 5 rating questions + 1 more information step
  isSubmitting = false;
  canSkip = true;

  // Time tracking
  private startTime: Date = new Date();

  ngOnInit(): void {
    this.initializeSurvey();
  }

  ngOnDestroy(): void {
    // Any cleanup if needed
  }

  get contentTitle(): string {
    return this.surveyType === 'lesson' ? this.lessonTitle : this.nodeName;
  }

  get contentType(): string {
    return this.surveyType === 'lesson' ? 'lesson' : 'node';
  }

  private initializeSurvey(): void {
    this.startTime = new Date();
    this.currentStep = 0;
    this.surveyResponse = {
      lessonId: this.surveyType === 'lesson' ? this.lessonId : '',
      priorKnowledge: 3, // Default to middle value
      informative: 3,
      personalResult: 3,
      teamResult: 3,
      applicability: 3,
      moreInformation: 'same',
      comments: '',
      submittedAt: new Date(),
    };
  }

  get currentQuestion(): SurveyQuestion | null {
    return this.currentStep < this.questions.length
      ? this.questions[this.currentStep]
      : null;
  }

  get isLastStep(): boolean {
    return this.currentStep >= this.totalSteps - 1;
  }

  get isFirstStep(): boolean {
    return this.currentStep === 0;
  }

  get progressPercentage(): number {
    return ((this.currentStep + 1) / this.totalSteps) * 100;
  }

  nextStep(): void {
    if (this.currentStep < this.totalSteps - 1) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  updateRating(questionId: keyof LessonSurveyResponse, value: number): void {
    (this.surveyResponse as any)[questionId] = value;
  }

  updateMoreInformation(value: 'more' | 'less' | 'same'): void {
    this.surveyResponse.moreInformation = value;
  }

  updateComments(value: string): void {
    this.surveyResponse.comments = value;
  }

  isValidCurrentStep(): boolean {
    if (this.currentStep < this.questions.length) {
      const question = this.questions[this.currentStep];
      const value = (this.surveyResponse as any)[question.id];
      return question.required ? value !== undefined && value !== null : true;
    }
    return true; // More information step is always valid
  }

  onSubmit(): void {
    if (!this.isValidSurvey()) {
      return;
    }

    this.isSubmitting = true;

    // Calculate completion time
    const completionTime = Math.round(
      (new Date().getTime() - this.startTime.getTime()) / 1000
    );

    const finalResponse: LessonSurveyResponse = {
      ...this.surveyResponse,
      submittedAt: new Date(),
      completionTimeSeconds: completionTime,
    } as LessonSurveyResponse;

    setTimeout(() => {
      this.submit.emit(finalResponse);
      this.isSubmitting = false;
      this.onClose();
    }, 500); // Small delay for UX
  }

  onSkip(): void {
    this.skip.emit();
    this.onClose();
  }

  onClose(): void {
    this.visible = false;
    this.close.emit();
  }

  private isValidSurvey(): boolean {
    // Check all required fields are filled
    for (const question of this.questions) {
      if (question.required) {
        const value = (this.surveyResponse as any)[question.id];
        if (value === undefined || value === null) {
          return false;
        }
      }
    }
    return true;
  }

  // Rating visualization helpers
  getStarArray(rating: number): boolean[] {
    return Array(5)
      .fill(false)
      .map((_, index) => index < rating);
  }

  getFilledStarsArray(rating: number): number[] {
    return Array(rating)
      .fill(0)
      .map((_, index) => index);
  }

  getEmptyStarsArray(rating: number): number[] {
    return Array(5 - rating)
      .fill(0)
      .map((_, index) => index);
  }

  getSurveyResponseValue(questionId: keyof LessonSurveyResponse): any {
    return (this.surveyResponse as any)[questionId];
  }

  getRatingDescription(questionId: keyof LessonSurveyResponse): string {
    const value = (this.surveyResponse as any)[questionId];
    if (!value) return '';

    const question = this.questions.find((q) => q.id === questionId);
    const option = question?.options?.find((opt) => opt.value === value);
    return option?.description || '';
  }
}
