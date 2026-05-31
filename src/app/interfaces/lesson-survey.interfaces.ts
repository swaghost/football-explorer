// Interfaces for post-lesson and exploratory node survey functionality

export interface LessonSurveyResponse {
  surveyId?: number;
  lessonId: string;
  userId?: number;
  tenantId?: number;
  teamId?: number;

  // Survey responses (1-5 scale)
  priorKnowledge: number; // How much they had on the topics before (1-5)
  informative: number; // Did this lesson provide new/updated information, or a useful maintenance refresh? (1-5)
  personalResult: number; // Did this lesson improve your personal game? (1-5)
  teamResult: number; // Did this lesson improve the team collective? (1-5)
  applicability: number; // How likely are you to use these lessons in a match situation (1-5)

  // Additional feedback
  moreInformation: 'more' | 'less' | 'same'; // More like this or less like this?
  comments?: string; // Optional text comments
  dontShowAgain?: boolean; // User preference to disable future surveys

  // Metadata
  submittedAt: Date;
  completionTimeSeconds?: number; // How long they spent on the lesson
}

export interface NodeSurveyResponse {
  surveyId?: number;
  nodeId: string;
  nodeName?: string;
  userId?: number;
  tenantId?: number;
  teamId?: number;

  // Survey responses (1-5 scale) - same questions as lesson survey
  priorKnowledge: number; // How much they had on the topics before (1-5)
  informative: number; // Did this node provide new/updated information, or a useful maintenance refresh? (1-5)
  personalResult: number; // Did this node improve your personal game? (1-5)
  teamResult: number; // Did this node improve the team collective? (1-5)
  applicability: number; // How likely are you to use this content in a match situation (1-5)

  // Additional feedback
  moreInformation: 'more' | 'less' | 'same'; // More like this or less like this?
  comments?: string; // Optional text comments
  dontShowAgain?: boolean; // User preference to disable future surveys

  // Metadata
  submittedAt: Date;
  viewTimeSeconds?: number; // How long they spent viewing the node
}

export interface SurveySettings {
  lessonContentQualitySurveyEnabled: boolean;
  exploratoryContentQualitySurveyEnabled: boolean;
  requireSurveyForCompletion: boolean;
  allowSkipSurvey: boolean;
  dontShowLessonSurveyAgain: boolean;
  dontShowExploratorySurveyAgain: boolean;
}

export interface SurveyRatingOption {
  value: number;
  label: string;
  description?: string;
}

export interface SurveyQuestion {
  id: keyof LessonSurveyResponse;
  question: string;
  description?: string;
  type: 'rating' | 'choice' | 'text';
  required: boolean;
  options?: SurveyRatingOption[];
}

// Predefined survey questions configuration
export const LESSON_SURVEY_QUESTIONS: SurveyQuestion[] = [
  {
    id: 'priorKnowledge',
    question: 'Prior Knowledge',
    description: 'How much did you know about these topics before this lesson?',
    type: 'rating',
    required: true,
    options: [
      { value: 1, label: '1', description: 'Nothing at all' },
      { value: 2, label: '2', description: 'Very little' },
      { value: 3, label: '3', description: 'Some knowledge' },
      { value: 4, label: '4', description: 'Good knowledge' },
      { value: 5, label: '5', description: 'Expert level' },
    ],
  },
  {
    id: 'informative',
    question: 'Informative',
    description:
      'Did this lesson provide new/updated information, or a useful maintenance refresh?',
    type: 'rating',
    required: true,
    options: [
      { value: 1, label: '1', description: 'No new information' },
      { value: 2, label: '2', description: 'Very little new' },
      { value: 3, label: '3', description: 'Some new information' },
      { value: 4, label: '4', description: 'Quite informative' },
      { value: 5, label: '5', description: 'Extremely informative' },
    ],
  },
  {
    id: 'personalResult',
    question: 'Personal Result',
    description: 'Did this lesson improve your personal game?',
    type: 'rating',
    required: true,
    options: [
      { value: 1, label: '1', description: 'No improvement' },
      { value: 2, label: '2', description: 'Slight improvement' },
      { value: 3, label: '3', description: 'Moderate improvement' },
      { value: 4, label: '4', description: 'Good improvement' },
      { value: 5, label: '5', description: 'Significant improvement' },
    ],
  },
  {
    id: 'teamResult',
    question: 'Team Result',
    description: 'Did this lesson improve the team collective?',
    type: 'rating',
    required: true,
    options: [
      { value: 1, label: '1', description: 'No team benefit' },
      { value: 2, label: '2', description: 'Slight team benefit' },
      { value: 3, label: '3', description: 'Moderate team benefit' },
      { value: 4, label: '4', description: 'Good team benefit' },
      { value: 5, label: '5', description: 'Significant team benefit' },
    ],
  },
  {
    id: 'applicability',
    question: 'Applicability',
    description:
      'How likely are you to use these lessons in a match situation?',
    type: 'rating',
    required: true,
    options: [
      { value: 1, label: '1', description: 'Not applicable' },
      { value: 2, label: '2', description: 'Rarely applicable' },
      { value: 3, label: '3', description: 'Sometimes applicable' },
      { value: 4, label: '4', description: 'Often applicable' },
      { value: 5, label: '5', description: 'Always applicable' },
    ],
  },
];

export const MORE_INFORMATION_OPTIONS = [
  {
    value: 'more',
    label: 'More like this',
    description: 'I would like more lessons like this one',
  },
  {
    value: 'same',
    label: 'About the same',
    description: 'The current amount is good',
  },
  {
    value: 'less',
    label: 'Less like this',
    description: 'I would prefer fewer lessons like this',
  },
];
