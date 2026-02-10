
export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  category: 'logic' | 'math' | 'verbal' | 'spatial';
  explanation: string;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  iqEstimate: number;
  analysis: string;
  categoryScores: Record<string, number>;
}

export enum AppState {
  START = 'START',
  LOADING_QUESTIONS = 'LOADING_QUESTIONS',
  QUIZ = 'QUIZ',
  CALCULATING = 'CALCULATING',
  RESULT = 'RESULT'
}
